import { useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, Receipt, Tag, AlertTriangle } from 'lucide-react'
import { StatsCard } from './StatsCard'
import { ChartSection } from './ChartSection'
import { SummaryPanel } from './SummaryPanel'
import { ChatPanel } from './ChatPanel'
import { ExportButton } from './ExportButton'
import { ShareButton } from './ShareButton'
import { QRCodeWidget } from './QRCodeWidget'
import { getDownloadUrl } from '../lib/api'
import type { AnalysisResult, PdfType } from '../lib/types'

interface DashboardProps {
  analysis: AnalysisResult
  pdfType: PdfType
  filename: string
  darkMode: boolean
  onBack: () => void
}

export function Dashboard({ analysis, pdfType, filename, darkMode, onBack }: DashboardProps) {
  const dashboardRef = useRef<HTMLDivElement>(null)
  const downloadUrl = getDownloadUrl(analysis.downloadId)
  const TypeIcon = pdfType === 'invoice' ? Receipt : FileText

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 max-w-7xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
            aria-label="Back to upload"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                pdfType === 'invoice'
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
              }`}>
                <TypeIcon className="w-3 h-3" />
                {pdfType === 'invoice' ? 'Invoice' : 'Report'}
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                {analysis.title}
              </h2>
            </div>
            {analysis.subtitle && (
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {analysis.subtitle}
              </p>
            )}
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
              {filename}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ShareButton downloadId={analysis.downloadId} />
          <ExportButton analysis={analysis} dashboardRef={dashboardRef} darkMode={darkMode} />
        </div>
      </div>

      {/* Dashboard content — captured by html2canvas */}
      <div ref={dashboardRef} className="space-y-6">
        {/* Truncation notice */}
        {analysis.truncated && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-sm text-amber-800 dark:text-amber-300"
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              This document was large — only the first ~15,000 characters were analyzed. Results may be partial.
            </span>
          </motion.div>
        )}

        {/* Stats grid */}
        {analysis.metrics && analysis.metrics.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {analysis.metrics.map((metric, i) => (
              <StatsCard key={i} metric={metric} index={i} />
            ))}
          </div>
        )}

        {/* Charts */}
        {analysis.chartData && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <ChartSection chartData={analysis.chartData} type={pdfType} />
          </motion.div>
        )}

        {/* Summary + Highlights + Anomalies */}
        <SummaryPanel
          summary={analysis.summary}
          highlights={analysis.highlights ?? []}
          anomalies={analysis.anomalies ?? []}
        />

        {/* Tags */}
        {analysis.tags && analysis.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 flex-wrap"
          >
            <Tag className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            {analysis.tags.map((tag: string) => (
              <span
                key={tag}
                className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        )}
      </div>

      {/* Chat panel (outside captured area) */}
      <div className="mt-6">
        <ChatPanel downloadId={analysis.downloadId} pdfType={pdfType} />
      </div>

      {/* Hidden QR code widget */}
      <QRCodeWidget downloadUrl={downloadUrl} />
    </div>
  )
}
