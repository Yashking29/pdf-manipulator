import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, AlignLeft } from 'lucide-react'

interface SummaryPanelProps {
  summary: string
  highlights: string[]
  anomalies: string[]
}

export function SummaryPanel({ summary, highlights, anomalies }: SummaryPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
            <AlignLeft className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Summary</h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {summary || 'No summary available.'}
        </p>
      </motion.div>

      {/* Highlights + Anomalies */}
      <div className="space-y-4">
        {/* Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Key Highlights</h3>
          </div>
          {highlights && highlights.length > 0 ? (
            <ul className="space-y-2">
              {highlights.slice(0, 4).map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {h}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500 italic">No highlights identified</p>
          )}
        </motion.div>

        {/* Anomalies */}
        {anomalies && anomalies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-900/40 p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Anomalies / Flags</h3>
            </div>
            <ul className="space-y-2">
              {anomalies.slice(0, 3).map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  {a}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  )
}
