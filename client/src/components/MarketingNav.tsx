import { useState } from 'react'
import { FileText, Menu, X, Zap } from 'lucide-react'

const LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
]

export function MarketingNav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Briefwise
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {LINKS.map(l => (
            <a
              key={l.label}
              href={l.href}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 hover:scale-[1.02] transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            Try Free
          </a>
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setOpen(o => !o)}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pb-4">
          {LINKS.map(l => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-sm font-medium text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 last:border-0"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/"
            className="mt-3 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold"
          >
            <Zap className="w-4 h-4" />
            Try Free
          </a>
        </div>
      )}
    </nav>
  )
}
