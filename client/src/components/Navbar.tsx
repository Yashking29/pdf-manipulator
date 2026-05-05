import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Moon, Sun, Clock, X, Zap, Crown, Menu } from 'lucide-react'
import type { HistoryEntry } from '../lib/types'
import { FREE_LIMIT } from '../hooks/useLicense'

const NAV_LINKS = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
]

interface NavbarProps {
  darkMode: boolean
  toggleDarkMode: () => void
  history: HistoryEntry[]
  onLoadHistory: (entry: HistoryEntry) => void
  onNewUpload: () => void
  isPro: boolean
  usesRemaining: number | null
  onUpgradeClick: () => void
  onDeactivateLicense: () => void
}

export function Navbar({
  darkMode, toggleDarkMode, history, onLoadHistory, onNewUpload,
  isPro, usesRemaining, onUpgradeClick, onDeactivateLicense,
}: NavbarProps) {
  const [showHistory, setShowHistory] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowHistory(false)
      }
    }
    if (showHistory) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showHistory])

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={onNewUpload}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm group-hover:shadow-indigo-500/40 transition-shadow">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Briefwise
          </span>
        </button>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5">
          {/* History button */}
          <div className="relative" ref={panelRef}>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Recent documents"
            >
              <Clock className="w-5 h-5" />
              {history.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold bg-indigo-500 text-white rounded-full flex items-center justify-center">
                  {Math.min(history.length, 9)}
                </span>
              )}
            </button>

            {/* History panel */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-slate-900/40 border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Recent Documents</h3>
                    <button onClick={() => setShowHistory(false)} className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {history.length === 0 ? (
                    <div className="py-8 text-center">
                      <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-400 dark:text-slate-500">No documents yet</p>
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto">
                      {history.map(entry => (
                        <button
                          key={entry.id}
                          onClick={() => { onLoadHistory(entry); setShowHistory(false) }}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-start gap-3 transition-colors group"
                        >
                          <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                            entry.type === 'invoice' ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}>
                            {entry.type === 'invoice' ? '₹' : '📊'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {entry.title}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                              {entry.filename} · {entry.date}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Usage / Pro badge */}
          {isPro ? (
            <button
              onClick={onDeactivateLicense}
              title="Pro active — click to deactivate"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-semibold shadow-sm hover:shadow-indigo-500/40 transition-shadow"
            >
              <Crown className="w-3.5 h-3.5" />
              Pro
            </button>
          ) : (
            <button
              onClick={onUpgradeClick}
              title={usesRemaining !== null ? `${usesRemaining} of ${FREE_LIMIT} analyses remaining` : 'Upgrade to Pro'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                usesRemaining === 0
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              {usesRemaining !== null ? `${usesRemaining}/${FREE_LIMIT} left` : 'Upgrade'}
            </button>
          )}

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(o => !o)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pb-4">
          {NAV_LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="block py-3 text-sm font-medium text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 last:border-0"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
