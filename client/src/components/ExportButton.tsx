import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Image, FileText, ChevronDown, Loader2, Check } from 'lucide-react'
import type { AnalysisResult } from '../lib/types'

interface ExportButtonProps {
  analysis: AnalysisResult
  dashboardRef: React.RefObject<HTMLDivElement | null>
  darkMode: boolean
}

type Status = 'idle' | 'loading' | 'done'

export function ExportButton({ analysis, dashboardRef, darkMode }: ExportButtonProps) {
  const [open, setOpen] = useState(false)
  const [pngStatus, setPngStatus] = useState<Status>('idle')
  const [csvStatus, setCsvStatus] = useState<Status>('idle')
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const exportPng = async () => {
    if (!dashboardRef.current) return
    setPngStatus('loading')
    setOpen(false)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: darkMode ? '#020617' : '#f8fafc', // slate-950 / slate-50
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `${analysis.title.replace(/\s+/g, '_')}_dashboard.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      setPngStatus('done')
      setTimeout(() => setPngStatus('idle'), 2500)
    } catch {
      setPngStatus('idle')
    }
  }

  const exportCsv = () => {
    setCsvStatus('loading')
    setOpen(false)

    const rows: string[][] = [
      ['DocInsight Export', analysis.title],
      ['Generated', new Date().toLocaleString()],
      [],
      ['=== KEY METRICS ==='],
      ['Label', 'Value'],
      ...analysis.metrics.map(m => [m.label, m.value]),
      [],
      ['=== BAR CHART DATA ==='],
      ['Name', 'Value'],
      ...(analysis.chartData?.bar ?? []).map(d => [d.name, String(d.value)]),
      [],
      ['=== PIE CHART DATA ==='],
      ['Name', 'Value'],
      ...(analysis.chartData?.pie ?? []).map(d => [d.name, String(d.value)]),
      [],
      ['=== LINE CHART DATA ==='],
      ['Name', 'Value'],
      ...(analysis.chartData?.line ?? []).map(d => [d.name, String(d.value)]),
      [],
      ['=== HIGHLIGHTS ==='],
      ...(analysis.highlights ?? []).map(h => [h]),
      [],
      ['=== ANOMALIES ==='],
      ...(analysis.anomalies ?? []).map(a => [a]),
    ]

    const csv = rows
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${analysis.title.replace(/\s+/g, '_')}_data.csv`
    link.click()
    URL.revokeObjectURL(url)

    setCsvStatus('done')
    setTimeout(() => setCsvStatus('idle'), 2500)
  }

  const busy = pngStatus === 'loading' || csvStatus === 'loading'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={busy}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
        ) : (
          <Download className="w-4 h-4 text-slate-500" />
        )}
        Export
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
          >
            <button
              onClick={exportPng}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {pngStatus === 'done' ? (
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              ) : (
                <Image className="w-4 h-4 text-slate-400 flex-shrink-0" />
              )}
              <div className="text-left">
                <p className="font-medium">{pngStatus === 'done' ? 'Saved!' : 'Export as PNG'}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Dashboard screenshot</p>
              </div>
            </button>
            <div className="border-t border-slate-100 dark:border-slate-700" />
            <button
              onClick={exportCsv}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {csvStatus === 'done' ? (
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              ) : (
                <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
              )}
              <div className="text-left">
                <p className="font-medium">{csvStatus === 'done' ? 'Saved!' : 'Export as CSV'}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Metrics & chart data</p>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
