import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, Check, Key, Loader2, ExternalLink, Shield } from 'lucide-react'
import { FREE_LIMIT } from '../hooks/useLicense'

interface PaywallModalProps {
  open: boolean
  onClose: () => void
  onActivated: () => void
  activateLicense: (key: string) => Promise<boolean>
  activating: boolean
  activateError: string | null
}

const PRO_FEATURES = [
  'Unlimited PDF analyses',
  'AI chat with every document',
  'PNG & CSV export',
  'Full chart extraction',
  'Priority processing',
  'All future features',
]

const FREE_FEATURES = [
  `${FREE_LIMIT} analyses per month`,
  'AI chat included',
  'PNG & CSV export',
  'Full chart extraction',
]

const CHECKOUT_URL = import.meta.env.VITE_LS_CHECKOUT_URL as string | undefined

export function PaywallModal({
  open,
  onClose,
  onActivated,
  activateLicense,
  activating,
  activateError,
}: PaywallModalProps) {
  const [tab, setTab] = useState<'upgrade' | 'activate'>('upgrade')
  const [keyInput, setKeyInput] = useState('')

  const handleActivate = async () => {
    if (!keyInput.trim()) return
    const ok = await activateLicense(keyInput)
    if (ok) onActivated()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg pointer-events-auto overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-indigo-500 to-violet-600 px-6 pt-8 pb-10 text-white">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold mb-1">Upgrade to Pro</h2>
                <p className="text-indigo-100 text-sm">
                  You've used all {FREE_LIMIT} free analyses this month.
                </p>
              </div>

              {/* Tab switcher */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 -mt-px">
                <button
                  onClick={() => setTab('upgrade')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    tab === 'upgrade'
                      ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  Pricing
                </button>
                <button
                  onClick={() => setTab('activate')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    tab === 'activate'
                      ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  I have a key
                </button>
              </div>

              {tab === 'upgrade' ? (
                <div className="p-6">
                  {/* Plan comparison */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {/* Free */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Free</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white mb-3">$0</p>
                      <ul className="space-y-1.5">
                        {FREE_FEATURES.map(f => (
                          <li key={f} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                            <Check className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pro */}
                    <div className="rounded-2xl border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 p-4 relative">
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Popular
                      </span>
                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-1">Pro</p>
                      <div className="flex items-baseline gap-1 mb-3">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">$9</p>
                        <p className="text-xs text-slate-500">/month</p>
                      </div>
                      <ul className="space-y-1.5">
                        {PRO_FEATURES.map(f => (
                          <li key={f} className="flex items-start gap-1.5 text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                            <Check className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* CTA */}
                  {CHECKOUT_URL ? (
                    <a
                      href={CHECKOUT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all"
                    >
                      <Zap className="w-4 h-4" />
                      Get Pro — $9/month
                      <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                    </a>
                  ) : (
                    <div className="text-center py-3 text-sm text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                      Checkout URL not configured — set <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">VITE_LS_CHECKOUT_URL</code>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-slate-400 dark:text-slate-500">
                    <Shield className="w-3.5 h-3.5" />
                    Secure checkout via Lemon Squeezy · Cancel anytime
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                    Already purchased? Enter your license key from the email you received after checkout.
                  </p>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                    License Key
                  </label>
                  <input
                    value={keyInput}
                    onChange={e => setKeyInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleActivate()}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-mono placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all mb-3"
                  />

                  {activateError && (
                    <p className="text-xs text-red-500 dark:text-red-400 mb-3">{activateError}</p>
                  )}

                  <button
                    onClick={handleActivate}
                    disabled={!keyInput.trim() || activating}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {activating ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
                    ) : (
                      <><Key className="w-4 h-4" /> Activate License</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
