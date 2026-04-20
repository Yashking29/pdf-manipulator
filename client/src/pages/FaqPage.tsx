import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search } from 'lucide-react'
import { MarketingNav } from '../components/MarketingNav'
import { MarketingFooter } from '../components/MarketingFooter'

interface FaqItem {
  q: string
  a: string
}

interface FaqCategory {
  label: string
  emoji: string
  items: FaqItem[]
}

const FAQ_DATA: FaqCategory[] = [
  {
    label: 'Getting Started',
    emoji: '🚀',
    items: [
      {
        q: 'What is Briefwise?',
        a: 'Briefwise is an AI-powered PDF analysis tool that turns your invoices and business reports into interactive dashboards. Upload a PDF and within seconds you get charts, KPI cards, an executive summary, anomaly flags, and an AI chat assistant — all without any manual data entry.',
      },
      {
        q: 'Who is Briefwise for?',
        a: 'Briefwise is built for freelancers reviewing client invoices, business analysts summarizing reports, finance teams processing vendor documents, and small business owners who want to understand their financials without hiring a data analyst.',
      },
      {
        q: 'Do I need to create an account?',
        a: 'No account is required. Just upload your PDF and get your dashboard instantly. Your free usage (3 analyses/month) is tracked by your browser. Pro users enter a license key — no password or account needed.',
      },
      {
        q: 'How do I get started?',
        a: 'Go to briefwise.online, select your document type (Invoice or Report), drag and drop your PDF, and click Analyze. That\'s it — your dashboard is ready in 15–30 seconds.',
      },
    ],
  },
  {
    label: 'Features',
    emoji: '✨',
    items: [
      {
        q: 'What types of PDFs does Briefwise support?',
        a: 'Briefwise works best with text-based PDFs — invoices, financial reports, business reports, contracts, and research papers. Scanned PDFs (where text is a photo/image inside the PDF) are not currently supported as they require OCR. If your PDF was exported from software like QuickBooks, Google Docs, or Word, it will work perfectly.',
      },
      {
        q: 'What charts does Briefwise generate?',
        a: 'Briefwise automatically generates three chart types: a bar chart (line items or key metric comparisons), a pie/donut chart (cost or segment distribution), and a line chart (billing trends or performance over time). All are interactive with hover tooltips.',
      },
      {
        q: 'Can I chat with my document?',
        a: 'Yes. After analysis, a collapsible chat panel lets you ask any question about your document in plain English — "What is the total amount due?", "List all line items", "What are the main risks highlighted?" — and get accurate answers powered by Claude AI.',
      },
      {
        q: 'Can I share my dashboard with someone else?',
        a: 'Yes. Click the Share button on any dashboard to generate a read-only link. Anyone with the link can view the full dashboard — charts, metrics, summary, and tags — without needing a Briefwise account. Share links stay active for 30 days.',
      },
      {
        q: 'What export options are available?',
        a: 'You can export your dashboard as a PNG image (high-resolution, 2x scale, supports dark mode) or as a CSV file containing all extracted metrics and chart data. The CSV opens directly in Excel or Google Sheets.',
      },
      {
        q: 'What is the QR code feature?',
        a: 'A small pulsing dot in the bottom-right of your dashboard reveals a QR code on hover. Scan it with your phone to instantly download the original PDF to your mobile device — no email or file transfer needed.',
      },
      {
        q: 'Does Briefwise detect anomalies?',
        a: 'Yes. The AI flags unusual items, potential errors, or areas of concern in your document — duplicate line items, unusual charges, missing information, or values that seem out of range. These appear in an "Anomalies / Flags" section on the dashboard.',
      },
    ],
  },
  {
    label: 'Pricing & Billing',
    emoji: '💳',
    items: [
      {
        q: 'How much does Briefwise cost?',
        a: 'Briefwise has two plans: Free ($0/month, 3 analyses per month) and Pro ($9/month, unlimited analyses). There are no hidden fees, no per-analysis charges on Pro, and no credit card required for the free plan.',
      },
      {
        q: 'What happens when I reach the 3 free analyses limit?',
        a: 'You\'ll see a paywall prompt inviting you to upgrade to Pro. Your free count resets every 30 days from your first use, so you get 3 new analyses each month at no cost.',
      },
      {
        q: 'How does the Pro license key work?',
        a: 'When you subscribe to Pro through Lemon Squeezy, you receive a license key by email. Enter this key in the Briefwise "I have a key" tab. The key is validated and stored in your browser — enter it once and it works on that device indefinitely, or enter it again on any other device.',
      },
      {
        q: 'Can I cancel Pro at any time?',
        a: 'Yes. You can cancel your Pro subscription at any time through the Lemon Squeezy customer portal. You\'ll retain Pro access until the end of your current billing period.',
      },
      {
        q: 'Do you offer refunds?',
        a: 'Yes. If you\'re not satisfied, contact us within 7 days of your first payment for a full refund — no questions asked.',
      },
      {
        q: 'What payment methods are accepted?',
        a: 'Payments are processed securely by Lemon Squeezy, which accepts all major credit cards (Visa, Mastercard, Amex), PayPal, and other regional payment methods.',
      },
    ],
  },
  {
    label: 'Security & Privacy',
    emoji: '🔒',
    items: [
      {
        q: 'Is my PDF data stored permanently?',
        a: 'No. Your PDF is uploaded to memory, analyzed, and the buffer expires after 2 hours. We do not store your documents on disk or in a database. After the session expires, the file is gone from our servers permanently.',
      },
      {
        q: 'Who can see my documents?',
        a: 'Only you. Documents are processed privately and never shared with other users. If you generate a share link, only the analysis results (charts, metrics, summary) are accessible — the original PDF is never exposed through share links.',
      },
      {
        q: 'Does Briefwise use my data to train AI models?',
        a: 'No. Your document content is sent to Anthropic\'s Claude API for analysis but is not used to train AI models. Anthropic\'s API usage policy prohibits using API data for model training.',
      },
      {
        q: 'Is my connection to Briefwise secure?',
        a: 'Yes. All connections to briefwise.online use HTTPS/TLS encryption. Your PDF data is transmitted securely and never sent over unencrypted connections.',
      },
    ],
  },
  {
    label: 'Technical',
    emoji: '⚙️',
    items: [
      {
        q: 'How long does analysis take?',
        a: 'Most PDFs are analyzed in 15–30 seconds. Large or complex documents (50+ pages) may take up to 60 seconds. The AI uses adaptive thinking to allocate more processing time to complex documents automatically.',
      },
      {
        q: 'What is the maximum file size?',
        a: 'The maximum supported file size is 50 MB. Most PDFs are well under this limit. If your PDF is larger, try compressing it first using a tool like Smallpdf or ilovepdf.',
      },
      {
        q: 'Why does it say "No readable text found"?',
        a: 'This means your PDF is image-based (scanned). The text is embedded as an image rather than actual characters, so it cannot be extracted without OCR. Try using a PDF with selectable text — if you can click and highlight text in your PDF viewer, Briefwise can read it.',
      },
      {
        q: 'Does Briefwise work on mobile?',
        a: 'Yes. Briefwise is fully responsive and works on any modern mobile browser (Safari, Chrome, Firefox). For best results on mobile, use a recent version of your browser.',
      },
      {
        q: 'Which AI model powers Briefwise?',
        a: 'Briefwise uses Claude by Anthropic — specifically claude-opus-4-6 with adaptive thinking enabled. This is one of the most accurate models available for document understanding, financial data extraction, and natural language Q&A.',
      },
    ],
  },
]

function AccordionItem({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-slate-200 dark:border-slate-800 last:border-0">
      <button
        onClick={onToggle}
        className="w-full text-left py-5 flex items-start justify-between gap-4 group"
      >
        <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {item.q}
        </span>
        <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FaqPage() {
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    document.title = 'FAQ — Briefwise'
    return () => { document.title = 'Briefwise — Turn any PDF into a Smart Dashboard' }
  }, [])

  const query = search.toLowerCase()
  const categories = ['All', ...FAQ_DATA.map(c => c.label)]

  const filtered = FAQ_DATA
    .filter(cat => activeCategory === 'All' || cat.label === activeCategory)
    .map(cat => ({
      ...cat,
      items: cat.items.filter(
        item =>
          !query ||
          item.q.toLowerCase().includes(query) ||
          item.a.toLowerCase().includes(query)
      ),
    }))
    .filter(cat => cat.items.length > 0)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <MarketingNav />

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400">
            Everything you need to know about Briefwise.
          </p>
        </motion.div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search questions…"
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all shadow-sm"
          />
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/30'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ accordion */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 dark:text-slate-500">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No results for "{search}"</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map(cat => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm px-6"
              >
                <div className="flex items-center gap-2.5 py-5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xl">{cat.emoji}</span>
                  <h2 className="font-bold text-slate-800 dark:text-slate-200">{cat.label}</h2>
                </div>
                {cat.items.map(item => {
                  const key = `${cat.label}::${item.q}`
                  return (
                    <AccordionItem
                      key={key}
                      item={item}
                      isOpen={openKey === key}
                      onToggle={() => setOpenKey(openKey === key ? null : key)}
                    />
                  )
                })}
              </motion.div>
            ))}
          </div>
        )}

        {/* Still have questions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800/50 p-8"
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Still have questions?</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-5">
            Can't find what you're looking for? We reply within 24 hours.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:scale-[1.02] transition-transform"
          >
            Contact us
          </a>
        </motion.div>
      </div>

      <MarketingFooter />
    </div>
  )
}
