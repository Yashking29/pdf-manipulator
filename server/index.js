'use strict'

const express = require('express')
const multer = require('multer')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const Anthropic = require('@anthropic-ai/sdk')
const { GoogleGenerativeAI } = require('@google/generative-ai')
const dotenv = require('dotenv')
const { v4: uuidv4 } = require('uuid')
const path = require('path')
const fs = require('fs')

// Load .env from parent directory
dotenv.config({ path: path.join('.env') })

const app = express()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
})

// ── AI provider setup ─────────────────────────────────────────────────────────
// AI_PROVIDER: 'anthropic' | 'gemini' | 'both'
// 'both' uses Anthropic as primary and falls back to Gemini on failure
const AI_PROVIDER = (process.env.AI_PROVIDER || 'anthropic').toLowerCase()

let anthropicClient = null
if (AI_PROVIDER === 'anthropic' || AI_PROVIDER === 'both') {
  if (process.env.ANTHROPIC_API_KEY) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
}

let geminiFlash = null
if (AI_PROVIDER === 'gemini' || AI_PROVIDER === 'both') {
  if (process.env.GEMINI_API_KEY) {
    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    geminiFlash = genai.getGenerativeModel({ model: 'gemini-2.0-flash' })
  }
}

// ── Free-tier usage tracking ──────────────────────────────────────────────────
// IP → { count, resetAt }  (resets every 30 days)
const usageStore = new Map()
const FREE_LIMIT = 3

// ── Pro-tier usage tracking ───────────────────────────────────────────────────
// licenseKey → { count, resetAt }  (resets every 30 days)
const proUsageStore = new Map()
const PRO_LIMIT = 100

// Cache of validated license keys (survives until server restart)
const validLicenses = new Set()

function requireAccess(req, res, next) {
  const licenseKey = (req.headers['x-license-key'] || '').trim()
  const now = Date.now()

  if (licenseKey && validLicenses.has(licenseKey)) {
    // Pro user — enforce monthly cap
    let proUsage = proUsageStore.get(licenseKey)
    if (!proUsage || now > proUsage.resetAt) {
      proUsage = { count: 0, resetAt: now + 30 * 24 * 60 * 60 * 1000 }
    }
    if (proUsage.count >= PRO_LIMIT) {
      const daysLeft = Math.ceil((proUsage.resetAt - now) / (24 * 60 * 60 * 1000))
      return res.status(429).json({
        error: `You've reached the ${PRO_LIMIT} analyses/month Pro limit. Resets in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`,
        proLimitReached: true,
      })
    }
    proUsage.count++
    proUsageStore.set(licenseKey, proUsage)
    res.setHeader('X-Uses-Remaining', String(PRO_LIMIT - proUsage.count))
    return next()
  }

  // Free user — enforce free cap by IP
  const ip = req.ip || req.socket?.remoteAddress || 'unknown'
  let usage = usageStore.get(ip)

  if (!usage || now > usage.resetAt) {
    usage = { count: 0, resetAt: now + 30 * 24 * 60 * 60 * 1000 }
  }

  if (usage.count >= FREE_LIMIT) {
    return res.status(402).json({
      error: `You've used all ${FREE_LIMIT} free analyses this month. Upgrade to Pro for unlimited access.`,
      limitReached: true,
    })
  }

  usage.count++
  usageStore.set(ip, usage)
  res.setHeader('X-Uses-Remaining', String(FREE_LIMIT - usage.count))
  next()
}

// ── In-memory doc store ───────────────────────────────────────────────────────
// downloadId → { buffer, filename, text, type, analysis, expires }
// Capped at 50 entries — evicts oldest on overflow
const docStore = new Map()
const DOC_STORE_MAX = 50

function docStoreSet(id, value) {
  if (docStore.size >= DOC_STORE_MAX) {
    const oldest = docStore.keys().next().value
    docStore.delete(oldest)
  }
  docStore.set(id, value)
}

// ── Share store (persisted to disk) ──────────────────────────────────────────
// shareId → { analysis, type, title, createdAt, expires }
const SHARES_FILE = path.join(__dirname, 'shares.json')
const SHARE_TTL = 30 * 24 * 60 * 60 * 1000 // 30 days

function loadShareStore() {
  try {
    const raw = fs.readFileSync(SHARES_FILE, 'utf8')
    const obj = JSON.parse(raw)
    const map = new Map()
    const now = Date.now()
    for (const [k, v] of Object.entries(obj)) {
      if (v.expires > now) map.set(k, v)
    }
    return map
  } catch {
    return new Map()
  }
}

function persistShareStore() {
  try {
    fs.writeFileSync(SHARES_FILE, JSON.stringify(Object.fromEntries(shareStore), null, 2))
  } catch (e) {
    console.error('[shares] persist failed:', e.message)
  }
}

const shareStore = loadShareStore()

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174']

app.use(cors({ origin: allowedOrigins, exposedHeaders: ['X-Uses-Remaining'] }))
app.use(express.json({ limit: '10mb' }))

// Rate limit: max 10 analysis requests per IP per hour
const analyzeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. You can analyze up to 10 documents per hour.' }
})

// Clean up expired docs every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [id, doc] of docStore.entries()) {
    if (now > doc.expires) docStore.delete(id)
  }
}, 600_000)

function extractJson(text) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON object found in AI response')
  }
  return JSON.parse(text.slice(start, end + 1))
}

// ── OCR ───────────────────────────────────────────────────────────────────────

async function ocrWithAnthropic(pdfBuffer) {
  if (pdfBuffer.length > 5 * 1024 * 1024) {
    throw new Error('Scanned PDF is too large for OCR. Please compress it under 5 MB and try again.')
  }
  const msg = await anthropicClient.messages.create(
    {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8192,
      messages: [{
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBuffer.toString('base64') } },
          { type: 'text', text: 'Extract all text from this document exactly as it appears. Preserve numbers, dates, amounts, names, and table structure. Output only the raw extracted text with no commentary.' },
        ],
      }],
    },
    { headers: { 'anthropic-beta': 'pdfs-2024-09-25' } }
  )
  const block = msg.content.find(b => b.type === 'text')
  return block ? block.text : ''
}

async function ocrWithGemini(pdfBuffer) {
  if (pdfBuffer.length > 5 * 1024 * 1024) {
    throw new Error('Scanned PDF is too large for OCR. Please compress it under 5 MB and try again.')
  }
  const result = await geminiFlash.generateContent([
    { inlineData: { mimeType: 'application/pdf', data: pdfBuffer.toString('base64') } },
    { text: 'Extract all text from this document exactly as it appears. Preserve numbers, dates, amounts, names, and table structure. Output only the raw extracted text with no commentary.' },
  ])
  return result.response.text()
}

async function runOcr(pdfBuffer) {
  if (AI_PROVIDER === 'gemini') return ocrWithGemini(pdfBuffer)
  try {
    return await ocrWithAnthropic(pdfBuffer)
  } catch (e) {
    if (AI_PROVIDER !== 'both') throw e
    console.error('[OCR] Anthropic failed, trying Gemini:', e.message)
    return ocrWithGemini(pdfBuffer)
  }
}

// ── Analysis ──────────────────────────────────────────────────────────────────

const ANALYSIS_SYSTEM = 'You are an expert financial and business document analyst. Extract structured data from the document. Respond with ONLY valid raw JSON matching the provided schema. No markdown fences, no explanation, just the JSON object.'

function buildAnalysisPrompt(type, schema) {
  return `Analyze the document and return a JSON object matching this schema:\n${schema}\n\nRules:\n- Extract 4-6 key metrics with emojis (💰 for money, 📅 for dates, 🔢 for counts, 📊 for rates)\n- Bar chart: ${type === 'invoice' ? 'top line items by amount (max 6 items)' : 'top KPIs or categories (max 6)'}\n- Pie chart: ${type === 'invoice' ? 'cost breakdown (subtotal, tax, fees, discounts)' : 'distribution or segment breakdown'}\n- Line chart: ${type === 'invoice' ? 'billing trend or payment schedule (use months or quarters)' : 'time-series trend (months, quarters, or milestones)'} — provide at least 5 data points\n- All chart values must be raw numbers (not strings with $ or %)\n- Respond with raw JSON ONLY`
}

async function analyzeWithAnthropic(truncatedText, type, schema) {
  const streamRequest = anthropicClient.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 64000,
    thinking: { type: 'adaptive' },
    system: `${ANALYSIS_SYSTEM} Document type: ${type}.`,
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: `Document content:\n\n${truncatedText}`, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: buildAnalysisPrompt(type, schema) },
      ]
    }]
  })
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Analysis timed out after 110 seconds. Please try again.')), 110_000)
  )
  const message = await Promise.race([streamRequest.finalMessage(), timeout])
  const textBlock = message.content.find(b => b.type === 'text')
  if (!textBlock) throw new Error('No text response from AI')
  return extractJson(textBlock.text)
}

async function analyzeWithGemini(truncatedText, type, schema) {
  const result = await geminiFlash.generateContent(
    `${ANALYSIS_SYSTEM} Document type: ${type}.\n\nDocument content:\n\n${truncatedText}\n\n${buildAnalysisPrompt(type, schema)}`
  )
  return extractJson(result.response.text())
}

async function runAnalysis(truncatedText, type, schema) {
  if (AI_PROVIDER === 'gemini') return analyzeWithGemini(truncatedText, type, schema)
  try {
    return await analyzeWithAnthropic(truncatedText, type, schema)
  } catch (e) {
    if (AI_PROVIDER !== 'both') throw e
    console.error('[Analysis] Anthropic failed, trying Gemini:', e.message)
    return analyzeWithGemini(truncatedText, type, schema)
  }
}

// ── Chat ──────────────────────────────────────────────────────────────────────

async function chatWithAnthropic(message, docText, docType) {
  const chatStream = anthropicClient.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    system: `You are a helpful assistant analyzing a ${docType} document. Answer questions concisely and accurately based only on the document content. Be direct and professional.`,
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: `Document content:\n\n${docText}`, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: message },
      ]
    }]
  })
  const chatTimeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Chat request timed out. Please try again.')), 55_000)
  )
  const chatMessage = await Promise.race([chatStream.finalMessage(), chatTimeout])
  const textBlock = chatMessage.content.find(b => b.type === 'text')
  return textBlock ? textBlock.text : 'No response generated.'
}

async function chatWithGemini(message, docText, docType) {
  const result = await geminiFlash.generateContent(
    `You are a helpful assistant analyzing a ${docType} document. Answer questions concisely and accurately based only on the document content. Be direct and professional.\n\nDocument content:\n\n${docText}\n\nQuestion: ${message}`
  )
  return result.response.text()
}

async function runChat(message, docText, docType) {
  if (AI_PROVIDER === 'gemini') return chatWithGemini(message, docText, docType)
  try {
    return await chatWithAnthropic(message, docText, docType)
  } catch (e) {
    if (AI_PROVIDER !== 'both') throw e
    console.error('[Chat] Anthropic failed, trying Gemini:', e.message)
    return chatWithGemini(message, docText, docType)
  }
}

const INVOICE_SCHEMA = `{
  "title": "string - vendor or company name",
  "subtitle": "string - invoice number and date",
  "metrics": [
    { "label": "string", "value": "string", "icon": "single emoji", "trend": "up|down|neutral", "color": "green|red|blue|yellow|purple" }
  ],
  "chartData": {
    "bar": [{ "name": "string (max 12 chars)", "value": number }],
    "pie": [{ "name": "string", "value": number }],
    "line": [{ "name": "string", "value": number }]
  },
  "summary": "string - 2-3 sentence professional summary",
  "highlights": ["string - notable positive item"],
  "anomalies": ["string - concern or unusual item"],
  "tags": ["string - category tag"]
}`

const REPORT_SCHEMA = `{
  "title": "string - report title",
  "subtitle": "string - date range or author",
  "metrics": [
    { "label": "string", "value": "string", "icon": "single emoji", "trend": "up|down|neutral", "color": "green|red|blue|yellow|purple" }
  ],
  "chartData": {
    "bar": [{ "name": "string (max 12 chars)", "value": number }],
    "pie": [{ "name": "string", "value": number }],
    "line": [{ "name": "string", "value": number }]
  },
  "summary": "string - 3-4 sentence executive summary",
  "highlights": ["string - key finding or insight"],
  "anomalies": ["string - concern or risk"],
  "tags": ["string - topic tag"]
}`

// POST /api/validate-license
app.post('/api/validate-license', async (req, res) => {
  const { licenseKey } = req.body
  if (!licenseKey?.trim()) return res.status(400).json({ valid: false, error: 'License key required' })

  const key = licenseKey.trim()
  if (validLicenses.has(key)) return res.json({ valid: true })

  try {
    const lsRes = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ license_key: key, instance_name: 'docinsight-web' }).toString(),
    })
    const data = await lsRes.json()
    if (data.valid) {
      validLicenses.add(key)
      return res.json({ valid: true })
    }
    res.status(400).json({ valid: false, error: data.error || 'Invalid or expired license key.' })
  } catch (err) {
    console.error('[validate-license]', err)
    res.status(500).json({ valid: false, error: 'Could not verify license. Please try again.' })
  }
})

// POST /api/analyze  — streams progress via SSE, sends final result as a 'result' event
app.post('/api/analyze', analyzeLimiter, requireAccess, upload.single('pdf'), async (req, res) => {
  // ── SSE setup ────────────────────────────────────────────────────────────────
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const send = (obj) => {
    if (!res.writableEnded) res.write(`data: ${JSON.stringify(obj)}\n\n`)
  }

  let ticker = null
  req.on('close', () => { if (ticker) clearInterval(ticker) })

  try {
    send({ type: 'progress', msg: 'Validating PDF…', pct: 5 })

    if (!req.file) {
      send({ type: 'error', msg: 'No PDF file provided' }); return res.end()
    }
    if (!req.file.mimetype.includes('pdf')) {
      send({ type: 'error', msg: 'Only PDF files are accepted.' }); return res.end()
    }
    if (req.file.buffer.length < 4 || req.file.buffer.slice(0, 4).toString('ascii') !== '%PDF') {
      send({ type: 'error', msg: 'Invalid file: does not appear to be a valid PDF.' }); return res.end()
    }

    const type = req.body.type || 'invoice'

    // ── Text extraction ───────────────────────────────────────────────────────
    send({ type: 'progress', msg: 'Extracting text…', pct: 15 })

    let pdfText = ''
    let usedOcr = false

    try {
      const pdfParse = require('pdf-parse')
      const pdfData = await pdfParse(req.file.buffer)
      pdfText = pdfData.text || ''
    } catch (e) {
      console.error('[pdf-parse]', e.message)
    }

    // ── OCR fallback for scanned PDFs ─────────────────────────────────────────
    if (!pdfText || pdfText.trim().length < 30) {
      send({ type: 'progress', msg: 'Scanned PDF detected — running OCR…', pct: 22 })
      try {
        pdfText = await runOcr(req.file.buffer)
        usedOcr = true
        if (!pdfText || pdfText.trim().length < 30) {
          send({ type: 'error', msg: 'Could not extract readable text even after OCR. Please ensure the document is not corrupted and try again.' })
          return res.end()
        }
        send({ type: 'progress', msg: 'OCR complete — preparing analysis…', pct: 32 })
      } catch (ocrErr) {
        send({ type: 'error', msg: ocrErr.message || 'OCR failed. Please try a text-based PDF.' })
        return res.end()
      }
    }

    const wasLarge = pdfText.length > 15000
    const truncatedText = pdfText.slice(0, 15000)
    const schema = type === 'invoice' ? INVOICE_SCHEMA : REPORT_SCHEMA

    send({ type: 'progress', msg: 'Sending to AI…', pct: 38 })

    // ── Ticker during Claude analysis ─────────────────────────────────────────
    const THINK_MSGS = [
      'Reading your document…',
      'Extracting key metrics…',
      'Building chart data…',
      'Generating summary…',
      'Reviewing for anomalies…',
      'Almost there…',
    ]
    let pct = 45
    let thinkStep = 0
    ticker = setInterval(() => {
      send({ type: 'progress', msg: THINK_MSGS[thinkStep], pct })
      pct = Math.min(pct + 8, 88)
      thinkStep = Math.min(thinkStep + 1, THINK_MSGS.length - 1)
    }, 5000)

    // ── AI analysis (routed by AI_PROVIDER) ──────────────────────────────────
    const analysis = await runAnalysis(truncatedText, type, schema)
    clearInterval(ticker); ticker = null

    send({ type: 'progress', msg: 'Building your dashboard…', pct: 95 })

    const downloadId = uuidv4()
    docStoreSet(downloadId, {
      buffer: req.file.buffer,
      filename: req.file.originalname || `${type}.pdf`,
      text: truncatedText,
      type,
      analysis,
      expires: Date.now() + 7_200_000
    })

    send({ type: 'result', data: { ...analysis, downloadId, truncated: wasLarge, usedOcr } })
    res.end()

  } catch (err) {
    if (ticker) { clearInterval(ticker); ticker = null }
    console.error('[analyze]', err)
    const msg = err instanceof SyntaxError
      ? 'AI returned malformed data. Please try again.'
      : (err.message || 'Analysis failed')
    send({ type: 'error', msg })
    res.end()
  }
})

// POST /api/chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message, downloadId } = req.body
    if (!message) return res.status(400).json({ error: 'Message is required' })

    const doc = docStore.get(downloadId)
    if (!doc) return res.status(404).json({ error: 'Document session expired. Please re-upload the PDF.' })

    const reply = await runChat(message, doc.text, doc.type)
    res.json({ reply })

  } catch (err) {
    console.error('[chat]', err)
    res.status(500).json({ error: err.message || 'Chat failed' })
  }
})

// GET /api/download/:id  (used by QR code)
app.get('/api/download/:id', (req, res) => {
  const doc = docStore.get(req.params.id)
  if (!doc || Date.now() > doc.expires) {
    return res.status(404).json({ error: 'File not found or session expired' })
  }
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${doc.filename}"`)
  res.send(doc.buffer)
})

// POST /api/share  — create a shareable link from an active downloadId
app.post('/api/share', (req, res) => {
  const { downloadId } = req.body
  if (!downloadId) return res.status(400).json({ error: 'downloadId required' })

  const doc = docStore.get(downloadId)
  if (!doc || !doc.analysis) {
    return res.status(404).json({ error: 'Document session expired. Re-upload the PDF to share it.' })
  }

  // Re-use existing share if already created for this downloadId
  for (const [shareId, share] of shareStore.entries()) {
    if (share.downloadId === downloadId) return res.json({ shareId })
  }

  const shareId = uuidv4()
  shareStore.set(shareId, {
    downloadId,
    analysis: doc.analysis,
    type: doc.type,
    filename: doc.filename,
    createdAt: Date.now(),
    expires: Date.now() + SHARE_TTL,
  })
  persistShareStore()
  res.json({ shareId })
})

// GET /api/share/:shareId  — fetch a shared dashboard
app.get('/api/share/:shareId', (req, res) => {
  const share = shareStore.get(req.params.shareId)
  if (!share || Date.now() > share.expires) {
    return res.status(404).json({ error: 'This share link has expired or does not exist.' })
  }
  res.json({
    analysis: share.analysis,
    type: share.type,
    filename: share.filename,
  })
})

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

// ── Crawlable landing page content ───────────────────────────────────────────
// Injected into #root at / so search engines index real content.
// React mounts and replaces this on load — users never see it flash.
const LANDING_HTML = `
<main style="font-family:Inter,system-ui,sans-serif;color:#1e293b;max-width:1100px;margin:0 auto;padding:24px 16px">

  <header style="text-align:center;padding:64px 0 48px">
    <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:24px">
      <div style="width:36px;height:36px;background:linear-gradient(135deg,#6366f1,#7c3aed);border-radius:10px"></div>
      <span style="font-size:22px;font-weight:800;background:linear-gradient(to right,#6366f1,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Briefwise</span>
    </div>
    <h1 style="font-size:clamp(2rem,5vw,3.5rem);font-weight:900;line-height:1.15;margin:0 0 20px">Turn any PDF into a<br><span style="background:linear-gradient(to right,#6366f1,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Smart Dashboard</span></h1>
    <p style="font-size:1.2rem;color:#64748b;max-width:560px;margin:0 auto 32px">Upload an invoice or report — AI extracts metrics, builds charts, and generates summaries in seconds. No spreadsheets. No manual work.</p>
    <a href="/" style="display:inline-block;padding:14px 32px;background:linear-gradient(to right,#6366f1,#7c3aed);color:#fff;border-radius:14px;font-weight:700;font-size:1rem;text-decoration:none">Try Briefwise Free</a>
    <p style="font-size:0.85rem;color:#94a3b8;margin-top:12px">3 free analyses per month. No credit card required.</p>
  </header>

  <section aria-labelledby="features-heading" style="padding:48px 0">
    <h2 id="features-heading" style="font-size:2rem;font-weight:800;text-align:center;margin-bottom:40px">Everything you need to understand your documents</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px">
      <article style="border:1px solid #e2e8f0;border-radius:16px;padding:24px">
        <h3 style="font-size:1.1rem;font-weight:700;margin:0 0 10px">📊 Auto-Extracted Metrics</h3>
        <p style="color:#475569;margin:0;line-height:1.6">Briefwise reads your PDF and automatically pulls out the most important numbers — totals, dates, rates, and KPIs — displayed as clean stat cards.</p>
      </article>
      <article style="border:1px solid #e2e8f0;border-radius:16px;padding:24px">
        <h3 style="font-size:1.1rem;font-weight:700;margin:0 0 10px">📈 Interactive Charts</h3>
        <p style="color:#475569;margin:0;line-height:1.6">Bar charts, pie charts, and line charts are generated automatically from your document data. No manual data entry or spreadsheets needed.</p>
      </article>
      <article style="border:1px solid #e2e8f0;border-radius:16px;padding:24px">
        <h3 style="font-size:1.1rem;font-weight:700;margin:0 0 10px">🤖 AI Summary &amp; Highlights</h3>
        <p style="color:#475569;margin:0;line-height:1.6">Get a concise executive summary with key highlights and anomaly flags written in plain English — no more reading 20-page reports to find the important parts.</p>
      </article>
      <article style="border:1px solid #e2e8f0;border-radius:16px;padding:24px">
        <h3 style="font-size:1.1rem;font-weight:700;margin:0 0 10px">💬 Chat with your Document</h3>
        <p style="color:#475569;margin:0;line-height:1.6">Ask questions in plain English. "What is the total amount due?" or "What are the main risks highlighted?" — get instant, accurate answers powered by Claude AI.</p>
      </article>
      <article style="border:1px solid #e2e8f0;border-radius:16px;padding:24px">
        <h3 style="font-size:1.1rem;font-weight:700;margin:0 0 10px">🔗 Shareable Dashboards</h3>
        <p style="color:#475569;margin:0;line-height:1.6">Generate a read-only link to your dashboard and share it with clients or colleagues. No login required to view — just click and see.</p>
      </article>
      <article style="border:1px solid #e2e8f0;border-radius:16px;padding:24px">
        <h3 style="font-size:1.1rem;font-weight:700;margin:0 0 10px">📥 Export PNG &amp; CSV</h3>
        <p style="color:#475569;margin:0;line-height:1.6">Download your dashboard as a high-resolution PNG image or export all metrics and chart data as a CSV file for use in Excel or Google Sheets.</p>
      </article>
    </div>
  </section>

  <section aria-labelledby="how-heading" style="padding:48px 0;background:#f8fafc;border-radius:24px;margin:24px 0;padding:48px 32px">
    <h2 id="how-heading" style="font-size:2rem;font-weight:800;text-align:center;margin-bottom:40px">How it works</h2>
    <ol style="list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px;counter-reset:steps">
      <li style="text-align:center">
        <div style="width:48px;height:48px;background:#6366f1;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:900;margin:0 auto 12px">1</div>
        <h3 style="font-size:1rem;font-weight:700;margin:0 0 6px">Upload your PDF</h3>
        <p style="color:#64748b;margin:0;font-size:0.9rem">Drag and drop any invoice or business report. Up to 50 MB supported.</p>
      </li>
      <li style="text-align:center">
        <div style="width:48px;height:48px;background:#6366f1;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:900;margin:0 auto 12px">2</div>
        <h3 style="font-size:1rem;font-weight:700;margin:0 0 6px">AI analyzes in seconds</h3>
        <p style="color:#64748b;margin:0;font-size:0.9rem">Claude AI extracts all key data, identifies metrics, and generates summaries automatically.</p>
      </li>
      <li style="text-align:center">
        <div style="width:48px;height:48px;background:#6366f1;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:900;margin:0 auto 12px">3</div>
        <h3 style="font-size:1rem;font-weight:700;margin:0 0 6px">Explore your dashboard</h3>
        <p style="color:#64748b;margin:0;font-size:0.9rem">Interact with charts, ask questions, export data, or share with one click.</p>
      </li>
    </ol>
  </section>

  <section aria-labelledby="usecases-heading" style="padding:48px 0">
    <h2 id="usecases-heading" style="font-size:2rem;font-weight:800;text-align:center;margin-bottom:16px">Who uses Briefwise?</h2>
    <p style="text-align:center;color:#64748b;margin:0 0 40px">Built for professionals who work with PDFs every day</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px">
      <div style="border-left:4px solid #6366f1;padding-left:16px">
        <h3 style="font-size:1rem;font-weight:700;margin:0 0 6px">Freelancers &amp; Consultants</h3>
        <p style="color:#64748b;margin:0;font-size:0.9rem">Quickly review client invoices and generate summaries for records or disputes.</p>
      </div>
      <div style="border-left:4px solid #7c3aed;padding-left:16px">
        <h3 style="font-size:1rem;font-weight:700;margin:0 0 6px">Business Analysts</h3>
        <p style="color:#64748b;margin:0;font-size:0.9rem">Turn 50-page quarterly reports into executive dashboards in under a minute.</p>
      </div>
      <div style="border-left:4px solid #06b6d4;padding-left:16px">
        <h3 style="font-size:1rem;font-weight:700;margin:0 0 6px">Finance Teams</h3>
        <p style="color:#64748b;margin:0;font-size:0.9rem">Process vendor invoices, spot anomalies, and export data to accounting tools.</p>
      </div>
      <div style="border-left:4px solid #10b981;padding-left:16px">
        <h3 style="font-size:1rem;font-weight:700;margin:0 0 6px">Small Business Owners</h3>
        <p style="color:#64748b;margin:0;font-size:0.9rem">Understand your financial documents without hiring an analyst or learning Excel.</p>
      </div>
    </div>
  </section>

  <section aria-labelledby="pricing-heading" style="padding:48px 0;text-align:center">
    <h2 id="pricing-heading" style="font-size:2rem;font-weight:800;margin-bottom:12px">Simple, transparent pricing</h2>
    <p style="color:#64748b;margin:0 0 40px">Start free. Upgrade when you need more.</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;max-width:600px;margin:0 auto">
      <div style="border:1px solid #e2e8f0;border-radius:20px;padding:32px 24px">
        <h3 style="font-size:1rem;font-weight:600;color:#64748b;margin:0 0 8px;text-transform:uppercase;letter-spacing:.05em">Free</h3>
        <p style="font-size:2.5rem;font-weight:900;margin:0 0 20px">$0<span style="font-size:1rem;font-weight:400;color:#94a3b8">/mo</span></p>
        <ul style="list-style:none;padding:0;margin:0 0 24px;text-align:left">
          <li style="padding:6px 0;color:#475569;font-size:0.9rem">✓ 3 PDF analyses per month</li>
          <li style="padding:6px 0;color:#475569;font-size:0.9rem">✓ AI chat included</li>
          <li style="padding:6px 0;color:#475569;font-size:0.9rem">✓ Export PNG &amp; CSV</li>
          <li style="padding:6px 0;color:#475569;font-size:0.9rem">✓ Shareable links</li>
        </ul>
        <a href="/" style="display:block;padding:12px;border:2px solid #6366f1;color:#6366f1;border-radius:12px;font-weight:600;text-decoration:none">Get started</a>
      </div>
      <div style="border:2px solid #6366f1;border-radius:20px;padding:32px 24px;background:linear-gradient(135deg,#eef2ff,#f5f3ff)">
        <h3 style="font-size:1rem;font-weight:600;color:#6366f1;margin:0 0 8px;text-transform:uppercase;letter-spacing:.05em">Pro</h3>
        <p style="font-size:2.5rem;font-weight:900;margin:0 0 20px">$9<span style="font-size:1rem;font-weight:400;color:#94a3b8">/mo</span></p>
        <ul style="list-style:none;padding:0;margin:0 0 24px;text-align:left">
          <li style="padding:6px 0;color:#3730a3;font-size:0.9rem;font-weight:500">✓ Unlimited PDF analyses</li>
          <li style="padding:6px 0;color:#3730a3;font-size:0.9rem;font-weight:500">✓ Priority AI processing</li>
          <li style="padding:6px 0;color:#3730a3;font-size:0.9rem;font-weight:500">✓ All current features</li>
          <li style="padding:6px 0;color:#3730a3;font-size:0.9rem;font-weight:500">✓ All future features</li>
        </ul>
        <a href="/" style="display:block;padding:12px;background:linear-gradient(to right,#6366f1,#7c3aed);color:#fff;border-radius:12px;font-weight:700;text-decoration:none">Upgrade to Pro</a>
      </div>
    </div>
  </section>

  <section aria-labelledby="faq-heading" style="padding:48px 0;max-width:720px;margin:0 auto">
    <h2 id="faq-heading" style="font-size:2rem;font-weight:800;text-align:center;margin-bottom:40px">Frequently Asked Questions</h2>
    <div style="space-y:0">
      <details style="border-bottom:1px solid #e2e8f0;padding:20px 0" open>
        <summary style="font-weight:600;font-size:1rem;cursor:pointer;list-style:none">What types of PDFs does Briefwise support?</summary>
        <p style="color:#64748b;margin:12px 0 0;line-height:1.7">Briefwise works best with text-based PDFs — invoices, financial reports, business reports, contracts, and research papers. Scanned image-based PDFs (where text is embedded in an image) are not currently supported as they require OCR processing.</p>
      </details>
      <details style="border-bottom:1px solid #e2e8f0;padding:20px 0">
        <summary style="font-weight:600;font-size:1rem;cursor:pointer;list-style:none">How long does analysis take?</summary>
        <p style="color:#64748b;margin:12px 0 0;line-height:1.7">Most PDFs are analyzed in 15–30 seconds. Larger or more complex documents may take up to 60 seconds. The AI uses Claude, one of the most capable language models available, to ensure accurate and detailed extraction.</p>
      </details>
      <details style="border-bottom:1px solid #e2e8f0;padding:20px 0">
        <summary style="font-weight:600;font-size:1rem;cursor:pointer;list-style:none">Is my data secure? Who can see my documents?</summary>
        <p style="color:#64748b;margin:12px 0 0;line-height:1.7">Your PDF is processed in memory and never permanently stored on our servers. Document sessions expire automatically after 2 hours. Shared dashboard links only expose the analysis results — never the original PDF file. We do not sell or share your data.</p>
      </details>
      <details style="border-bottom:1px solid #e2e8f0;padding:20px 0">
        <summary style="font-weight:600;font-size:1rem;cursor:pointer;list-style:none">What happens after I use my 3 free analyses?</summary>
        <p style="color:#64748b;margin:12px 0 0;line-height:1.7">You'll be prompted to upgrade to Pro ($9/month) for unlimited analyses. Your free count resets every 30 days. If you upgrade, you receive a license key by email that gives you unlimited access on any device.</p>
      </details>
      <details style="border-bottom:1px solid #e2e8f0;padding:20px 0">
        <summary style="font-weight:600;font-size:1rem;cursor:pointer;list-style:none">Can I share my dashboard with someone who doesn't have an account?</summary>
        <p style="color:#64748b;margin:12px 0 0;line-height:1.7">Yes. Click the Share button on any dashboard to generate a read-only link. Anyone with the link can view the charts, metrics, and summary without logging in or creating an account. Share links are valid for 30 days.</p>
      </details>
      <details style="border-bottom:1px solid #e2e8f0;padding:20px 0">
        <summary style="font-weight:600;font-size:1rem;cursor:pointer;list-style:none">Does Briefwise work on mobile?</summary>
        <p style="color:#64748b;margin:12px 0 0;line-height:1.7">Yes. Briefwise is fully responsive and works on any modern mobile browser. You can also use the QR code feature on any dashboard to instantly download the original PDF to your phone.</p>
      </details>
      <details style="padding:20px 0">
        <summary style="font-weight:600;font-size:1rem;cursor:pointer;list-style:none">What AI model powers Briefwise?</summary>
        <p style="color:#64748b;margin:12px 0 0;line-height:1.7">Briefwise is powered by Claude (by Anthropic), one of the most accurate and capable AI models for document understanding. This ensures high-quality metric extraction, summaries, and chat responses even for complex financial documents.</p>
      </details>
    </div>
  </section>

  <footer style="text-align:center;padding:40px 0;border-top:1px solid #e2e8f0;margin-top:24px">
    <p style="color:#94a3b8;font-size:0.875rem">© 2025 Briefwise · <a href="https://briefwise.online" style="color:#6366f1;text-decoration:none">briefwise.online</a></p>
  </footer>
</main>
`

// ── Production static serving + SEO ──────────────────────────────────────────
const CLIENT_DIST = path.join(__dirname, '../client/dist')
const SITE_URL = process.env.SITE_URL || 'https://briefwise.online'

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST))

  // Share pages: inject dynamic meta tags so social previews show document details
  // (WhatsApp, Twitter, LinkedIn don't run JavaScript — they need SSR meta tags)
  app.get('/share/:shareId', (req, res) => {
    const share = shareStore.get(req.params.shareId)
    const indexPath = path.join(CLIENT_DIST, 'index.html')

    if (!share || Date.now() > share.expires) {
      return res.sendFile(indexPath) // React will show the expired state
    }

    const { analysis, type } = share
    const canonicalUrl = `${SITE_URL}/share/${req.params.shareId}`
    const pageTitle = `${escapeHtml(analysis.title)} — Briefwise`
    const desc = escapeHtml((analysis.summary || `AI-powered ${type} analysis`).slice(0, 160))
    const typeLabel = type === 'invoice' ? 'Invoice' : 'Report'

    const injected = `
    <title>${pageTitle}</title>
    <meta name="description" content="${desc}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta name="robots" content="index, follow" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Briefwise" />
    <meta property="og:title" content="${pageTitle}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${SITE_URL}/og-image.png" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${pageTitle}" />
    <meta name="twitter:description" content="${desc}" />
    <script type="application/ld+json">
    {"@context":"https://schema.org","@type":"Article","headline":"${escapeHtml(analysis.title)}","description":"${desc}","publisher":{"@type":"Organization","name":"Briefwise","url":"${SITE_URL}"},"mainEntityOfPage":"${canonicalUrl}","keywords":"${escapeHtml(typeLabel)}, PDF analysis, dashboard"}
    </script>`

    let html = fs.readFileSync(indexPath, 'utf8')
    html = html.replace(
      '<title>Briefwise — Turn any PDF into a Smart Dashboard</title>',
      injected
    )
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(html)
  })

  // Homepage: inject full crawlable landing content into #root
  // Crawlers read this. React mounts and replaces it instantly (<100ms).
  app.get('/', (req, res) => {
    const indexPath = path.join(CLIENT_DIST, 'index.html')
    let html = fs.readFileSync(indexPath, 'utf8')
    html = html.replace(
      '<div id="root"></div>',
      `<div id="root">${LANDING_HTML}</div>`
    )
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(html)
  })

  // Marketing pages: inject page-specific meta tags for SEO
  const MARKETING_PAGES = {
    '/faq': {
      title: 'FAQ — Briefwise',
      description: 'Answers to the most common questions about Briefwise — features, pricing, privacy, and how AI-powered PDF analysis works.',
      canonical: `${SITE_URL}/faq`,
    },
    '/contact': {
      title: 'Contact — Briefwise',
      description: 'Get in touch with the Briefwise team for billing questions, bug reports, feature requests, or general inquiries.',
      canonical: `${SITE_URL}/contact`,
    },
    '/pricing': {
      title: 'Pricing — Briefwise',
      description: 'Briefwise is free for 3 analyses/month. Upgrade to Pro for $9/month and get 100 analyses, priority AI, and all future features.',
      canonical: `${SITE_URL}/pricing`,
    },
    '/privacy': {
      title: 'Privacy Policy — Briefwise',
      description: 'Learn how Briefwise handles your data, document privacy, third-party services, and your rights.',
      canonical: `${SITE_URL}/privacy`,
    },
    '/terms': {
      title: 'Terms of Service — Briefwise',
      description: 'The terms governing your use of Briefwise — acceptable use, subscriptions, refunds, liability, and more.',
      canonical: `${SITE_URL}/terms`,
    },
  }

  for (const [route, meta] of Object.entries(MARKETING_PAGES)) {
    app.get(route, (req, res) => {
      const indexPath = path.join(CLIENT_DIST, 'index.html')
      const injected = `
    <title>${meta.title}</title>
    <meta name="description" content="${meta.description}" />
    <link rel="canonical" href="${meta.canonical}" />
    <meta property="og:title" content="${meta.title}" />
    <meta property="og:description" content="${meta.description}" />
    <meta property="og:url" content="${meta.canonical}" />
    <meta property="og:image" content="${SITE_URL}/og-image.png" />`
      let html = fs.readFileSync(indexPath, 'utf8')
      html = html.replace(
        '<title>Briefwise — Turn any PDF into a Smart Dashboard</title>',
        injected
      )
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.send(html)
    })
  }

  // SPA fallback for all other routes
  app.get('*', (req, res) => res.sendFile(path.join(CLIENT_DIST, 'index.html')))
}

const PORT = process.env.PORT || 3001
const server = app.listen(PORT, () => {
  const providerStatus = {
    anthropic: process.env.ANTHROPIC_API_KEY ? '✓' : '✗ missing ANTHROPIC_API_KEY',
    gemini:    process.env.GEMINI_API_KEY    ? '✓' : '✗ missing GEMINI_API_KEY',
  }
  console.log(`\n🚀  Briefwise server → http://localhost:${PORT}`)
  console.log(`    AI_PROVIDER : ${AI_PROVIDER}`)
  if (AI_PROVIDER === 'anthropic' || AI_PROVIDER === 'both') console.log(`    Anthropic   : ${providerStatus.anthropic}`)
  if (AI_PROVIDER === 'gemini'    || AI_PROVIDER === 'both') console.log(`    Gemini      : ${providerStatus.gemini}`)
  console.log()
})

function shutdown(signal) {
  console.log(`\n[${signal}] Shutting down — draining in-flight requests…`)
  server.close(() => {
    console.log('All connections closed. Bye.')
    process.exit(0)
  })
  // Force-exit after 15 s if something hangs (e.g. a streaming Claude request)
  setTimeout(() => {
    console.error('[shutdown] Timeout reached, forcing exit.')
    process.exit(1)
  }, 15_000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))
