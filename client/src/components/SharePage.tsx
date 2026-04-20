import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Receipt, Tag, Loader2, AlertCircle, ExternalLink } from 'lucide-react'
import { StatsCard } from './StatsCard'
import { ChartSection } from './ChartSection'
import { SummaryPanel } from './SummaryPanel'
import { getShare } from '../lib/api'
import type { AnalysisResult, PdfType } from '../lib/types'

interface SharePageProps {
  shareId: string
}

export function SharePage({ shareId }: SharePageProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [pdfType, setPdfType] = useState<PdfType>('invoice')
  const [filename, setFilename] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getShare(shareId)
      .then(data => {
        setAnalysis(data.analysis)
        setPdfType(data.type)
        setFilename(data.filename)
        // Update browser tab title (also picked up by Googlebot which executes JS)
        document.title = `${data.analysis.title} — Briefwise`
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))

    return () => { document.title = 'Briefwise — Turn any PDF into a Smart Dashboard' }
  }, [shareId])

  const TypeIcon = pdfType === 'invoice' ? Receipt : FileText

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm">Loading shared dashboard…</p>
        </div>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Link Expired</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {error || 'This share link has expired or does not exist.'}
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:scale-[1.02] transition-transform"
          >
            Try Briefwise free
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Minimal share navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-base bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Briefwise
            </span>
          </a>
          <a
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-semibold shadow-sm hover:shadow-indigo-500/40 transition-shadow"
          >
            Try it free
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3"
        >
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                pdfType === 'invoice'
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
              }`}>
                <TypeIcon className="w-3 h-3" />
                {pdfType === 'invoice' ? 'Invoice' : 'Report'}
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{analysis.title}</h1>
            </div>
            {analysis.subtitle && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{analysis.subtitle}</p>
            )}
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{filename}</p>
          </div>
        </motion.div>

        {/* Stats */}
        {analysis.metrics?.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {analysis.metrics.map((metric, i) => (
              <StatsCard key={i} metric={metric} index={i} />
            ))}
          </div>
        )}

        {/* Charts */}
        {analysis.chartData && (
          <ChartSection chartData={analysis.chartData} type={pdfType} />
        )}

        {/* Summary */}
        <SummaryPanel
          summary={analysis.summary}
          highlights={analysis.highlights ?? []}
          anomalies={analysis.anomalies ?? []}
        />

        {/* Tags */}
        {analysis.tags?.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            {analysis.tags.map((tag: string) => (
              <span
                key={tag}
                className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 justify-between"
        >
          <div>
            <p className="font-semibold text-slate-900 dark:text-white text-sm">Turn your PDFs into dashboards like this</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Upload any invoice or report — AI extracts insights in seconds. Free to try.</p>
          </div>
          <a
            href="/"
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:scale-[1.02] transition-transform whitespace-nowrap"
          >
            Try Briefwise free
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </motion.div>
      </div>
    </div>
  )
}
