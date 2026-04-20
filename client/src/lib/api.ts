import type { AnalysisResult, PdfType } from './types'

const API_BASE = '/api'

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  timeoutMs: number,
  retries = 1
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(timer)

    // Retry once on server errors (5xx)
    if (res.status >= 500 && retries > 0) {
      await new Promise(r => setTimeout(r, 1000))
      return fetchWithRetry(url, options, timeoutMs, retries - 1)
    }
    return res
  } catch (err) {
    clearTimeout(timer)
    if ((err as Error).name === 'AbortError') {
      throw new Error('Request timed out. Please try again.')
    }
    // Retry once on network errors
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 1000))
      return fetchWithRetry(url, options, timeoutMs, retries - 1)
    }
    throw err
  }
}

export async function analyzePdf(
  file: File,
  type: string,
  licenseKey?: string | null,
  onProgress?: (msg: string, pct: number) => void
): Promise<{ result: AnalysisResult; usesRemaining: number | null }> {
  const formData = new FormData()
  formData.append('pdf', file)
  formData.append('type', type)

  const headers: Record<string, string> = {}
  if (licenseKey) headers['X-License-Key'] = licenseKey

  // Use a plain fetch — SSE streaming is incompatible with the retry wrapper
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 120_000)

  let res: Response
  try {
    res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      body: formData,
      headers,
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timer)
    if ((err as Error).name === 'AbortError') throw new Error('Request timed out. Please try again.')
    throw err
  }
  clearTimeout(timer)

  // Pre-SSE error responses come from middleware (402 free limit, 429 pro/rate limit)
  if (res.status === 402) {
    const err = await res.json().catch(() => ({ error: 'Free limit reached' }))
    const e = new Error(err.error || 'Free limit reached')
    ;(e as Error & { limitReached: boolean }).limitReached = true
    throw e
  }

  if (res.status === 429) {
    const err = await res.json().catch(() => ({ error: 'Too many requests' }))
    if (err.proLimitReached) {
      const e = new Error(err.error || 'Monthly limit reached')
      ;(e as Error & { proLimitReached: boolean }).proLimitReached = true
      throw e
    }
    throw new Error(err.error || 'Too many requests. Please wait before trying again.')
  }

  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => ({ error: `Request failed (${res.status})` }))
    throw new Error(err.error || 'Analysis failed')
  }

  // X-Uses-Remaining is set by requireAccess middleware and flushed with SSE headers
  const remaining = res.headers.get('X-Uses-Remaining')
  const usesRemaining = remaining !== null ? parseInt(remaining, 10) : null

  // Read SSE stream line by line
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      let event: Record<string, unknown>
      try {
        event = JSON.parse(line.slice(6))
      } catch {
        continue // skip malformed lines
      }

      if (event.type === 'progress' && onProgress) {
        onProgress(event.msg as string, event.pct as number)
      } else if (event.type === 'result') {
        return { result: event.data as AnalysisResult, usesRemaining }
      } else if (event.type === 'error') {
        throw new Error((event.msg as string) || 'Analysis failed')
      }
    }
  }

  throw new Error('Analysis stream ended unexpectedly. Please try again.')
}

export async function sendChat(message: string, downloadId: string): Promise<string> {
  const res = await fetchWithRetry(
    `${API_BASE}/chat`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, downloadId }),
    },
    60_000 // 1 min for chat responses
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Chat request failed' }))
    throw new Error(err.error || 'Chat failed')
  }
  const data = await res.json()
  return data.reply
}

export function getDownloadUrl(downloadId: string): string {
  return `${window.location.origin}/api/download/${downloadId}`
}

export async function createShare(downloadId: string): Promise<{ shareId: string }> {
  const res = await fetch('/api/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ downloadId }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to create share link' }))
    throw new Error(err.error || 'Failed to create share link')
  }
  return res.json()
}

export async function getShare(shareId: string): Promise<{ analysis: AnalysisResult; type: PdfType; filename: string }> {
  const res = await fetch(`/api/share/${shareId}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Share link not found' }))
    throw new Error(err.error || 'Share link not found or expired')
  }
  return res.json()
}

/** Clean chart data: ensure numeric values and non-empty names */
export function cleanChartData(data: unknown[]): Array<{ name: string; value: number }> {
  if (!Array.isArray(data)) return []
  return data
    .map((item: unknown) => {
      const d = item as Record<string, unknown>
      const raw = d.value
      const num =
        typeof raw === 'number'
          ? raw
          : parseFloat(String(raw).replace(/[^0-9.-]/g, '')) || 0
      return { name: String(d.name || '').slice(0, 20), value: Math.abs(num) }
    })
    .filter(d => d.name && d.value > 0)
}
