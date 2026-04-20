import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileSearch, Home, ArrowLeft } from 'lucide-react'
import { MarketingNav } from '../components/MarketingNav'
import { MarketingFooter } from '../components/MarketingFooter'

export function NotFoundPage() {
  useEffect(() => {
    document.title = '404 — Page Not Found | Briefwise'
    return () => { document.title = 'Briefwise — Turn any PDF into a Smart Dashboard' }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <MarketingNav />

      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full text-center"
        >
          {/* Icon */}
          <div className="w-20 h-20 rounded-3xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-6">
            <FileSearch className="w-10 h-10 text-indigo-500" />
          </div>

          {/* 404 number */}
          <p className="text-8xl font-black text-slate-100 dark:text-slate-800 select-none mb-2 leading-none">
            404
          </p>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Page not found
          </h1>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
            The page you're looking for doesn't exist or has been moved.
            Head back home to analyze your PDFs.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:scale-[1.02] transition-transform"
            >
              <Home className="w-4 h-4" />
              Go to Briefwise
            </a>
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go back
            </button>
          </div>
        </motion.div>
      </div>

      <MarketingFooter />
    </div>
  )
}
