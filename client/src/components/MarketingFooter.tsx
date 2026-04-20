import { FileText } from 'lucide-react'

const COLS = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Try Free', href: '/' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
]

export function MarketingFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">Briefwise</span>
            </a>
            <p className="text-sm leading-relaxed">
              Turn any PDF into a smart dashboard. AI-powered analysis for invoices and reports.
            </p>
            <p className="text-xs mt-4 text-slate-500">Powered by Claude AI (Anthropic)</p>
          </div>

          {/* Link columns */}
          {COLS.map(col => (
            <div key={col.heading}>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
                {col.heading}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Briefwise · <a href="https://briefwise.online" className="hover:text-slate-300 transition-colors">briefwise.online</a></p>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-slate-300 transition-colors">Terms</a>
            <a href="/contact" className="hover:text-slate-300 transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
