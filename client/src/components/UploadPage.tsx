import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, AlertCircle, Loader2, FileCheck, X, Zap, BarChart3, MessageSquare, QrCode } from 'lucide-react'
import type { PdfType } from '../lib/types'

interface UploadPageProps {
  onAnalyze: (file: File, type: PdfType) => void
  loading: boolean
  error: string | null
  progressMsg?: string
  progressPct?: number
}

const FEATURES = [
  { icon: BarChart3, label: 'Charts & Metrics', desc: 'Auto-extracted KPIs and visualizations' },
  { icon: MessageSquare, label: 'AI Chat', desc: 'Ask questions about your document' },
  { icon: Zap, label: 'Instant Summary', desc: 'Executive summary and key highlights' },
  { icon: QrCode, label: 'Quick Download', desc: 'Scan QR to download anytime' }
]

export function UploadPage({ onAnalyze, loading, error, progressMsg = '', progressPct = 0 }: UploadPageProps) {
  const [type, setType] = useState<PdfType>('invoice')
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && dropped.type === 'application/pdf') {
      setFile(dropped)
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  const handleSubmit = () => {
    if (file && !loading) onAnalyze(file, type)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12">
      {/* Background gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-400/20 dark:bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-3">
            Turn any PDF into a{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              smart dashboard
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Upload an invoice or report — AI extracts insights in seconds.
          </p>
        </motion.div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200/60 dark:shadow-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 sm:p-8"
        >
          {/* Type selector */}
          <div className="flex gap-2 mb-6">
            {(['invoice', 'report'] as PdfType[]).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  type === t
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {t === 'invoice' ? '🧾 Invoice' : '📊 Report'}
              </button>
            ))}
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !file && inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
              file
                ? 'border-emerald-400 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 cursor-default'
                : dragging
                ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10 scale-[1.01] cursor-copy'
                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer hover:bg-indigo-50/30'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileInput}
              className="hidden"
            />

            <AnimatePresence mode="wait">
              {file ? (
                <motion.div
                  key="file"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <FileCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{formatSize(file.size)} · PDF</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setFile(null) }}
                    className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex-shrink-0 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className={`w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center transition-colors ${
                    dragging ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-slate-100 dark:bg-slate-800'
                  }`}>
                    <Upload className={`w-7 h-7 ${dragging ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                  </div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {dragging ? 'Drop it here!' : 'Drop your PDF here'}
                  </p>
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    or{' '}
                    <span className="text-indigo-500 hover:text-indigo-600 font-medium">browse files</span>
                    {' '}· up to 50 MB
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analyze button */}
          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className={`mt-5 w-full py-3.5 rounded-xl font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2.5 ${
              file && !loading
                ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99]'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={progressMsg}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    {progressMsg || 'Uploading…'}
                  </motion.span>
                </AnimatePresence>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Analyze {type === 'invoice' ? 'Invoice' : 'Report'}
              </>
            )}
          </button>
          {/* Progress bar — visible only during analysis */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate pr-2">
                    {progressMsg || 'Uploading…'}
                  </span>
                  <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                    {progressPct}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full"
                    initial={{ width: '2%' }}
                    animate={{ width: `${Math.max(progressPct, 2)}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
                {progressMsg.toLowerCase().includes('ocr') && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1.5">
                    <span>⚡</span>
                    Scanned PDF detected — OCR may take 10–20 seconds extra.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Features row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6"
        >
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="text-center p-3">
              <Icon className="w-5 h-5 text-indigo-500 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
