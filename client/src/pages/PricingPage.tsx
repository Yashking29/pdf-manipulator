import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, X } from 'lucide-react'
import { MarketingNav } from '../components/MarketingNav'
import { MarketingFooter } from '../components/MarketingFooter'

const CHECKOUT_URL = import.meta.env.VITE_LS_CHECKOUT_URL as string | undefined

const FREE_FEATURES = [
  '3 PDF analyses per month',
  'AI chat assistant',
  'Interactive charts (bar, pie, line)',
  'PNG & CSV export',
  'Shareable dashboard links',
  'Dark mode',
]

const FREE_MISSING = [
  'Unlimited analyses',
  'Priority AI processing',
]

const PRO_FEATURES = [
  '100 PDF analyses per month',
  'AI chat assistant',
  'Interactive charts (bar, pie, line)',
  'PNG & CSV export',
  'Shareable dashboard links',
  'Dark mode',
  'Priority AI processing',
  'All future features included',
]

const FAQS = [
  {
    q: 'How does the license key work?',
    a: 'When you subscribe to Pro, Lemon Squeezy sends you a license key by email. Enter it in the Briefwise "I have a key" tab. It\'s stored in your browser — enter it once per device, works indefinitely.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel through the Lemon Squeezy customer portal at any time. You keep Pro access until the end of your billing period. No lock-in.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'Yes — full refund within 7 days of your first payment, no questions asked. Email yashhissaria99@gmail.com.',
  },
  {
    q: 'What counts as one analysis?',
    a: 'Uploading and analyzing one PDF = one analysis. Chatting with the document, exporting, or sharing are all free and don\'t count against your limit.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'Visa, Mastercard, Amex, PayPal, and regional methods — all processed securely by Lemon Squeezy.',
  },
  {
    q: 'Is there a team or enterprise plan?',
    a: 'Not yet. If you need volume pricing or a custom plan, email yashhissaria99@gmail.com and we\'ll work something out.',
  },
]

export function PricingPage() {
  useEffect(() => {
    document.title = 'Pricing — Briefwise'
    return () => { document.title = 'Briefwise — Turn any PDF into a Smart Dashboard' }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <MarketingNav />

      <div className="max-w-5xl mx-auto px-4 py-16">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Start free. Upgrade when you need more. No hidden fees, no surprises.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 max-w-3xl mx-auto">

          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 flex flex-col"
          >
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Free</p>
              <div className="flex items-end gap-1.5 mb-1">
                <span className="text-5xl font-black text-slate-900 dark:text-white">$0</span>
                <span className="text-slate-400 mb-2">/month</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">3 analyses per month, forever free.</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
              {FREE_MISSING.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-400 dark:text-slate-600">
                  <X className="w-4 h-4 text-slate-300 dark:text-slate-700 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            <a
              href="/"
              className="block text-center py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:border-indigo-400 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Get started free
            </a>
          </motion.div>

          {/* Pro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-8 shadow-2xl shadow-indigo-500/30 flex flex-col"
          >
            {/* Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full shadow">
                MOST POPULAR
              </span>
            </div>

            <div className="mb-6">
              <p className="text-xs font-semibold text-indigo-200 uppercase tracking-widest mb-2">Pro</p>
              <div className="flex items-end gap-1.5 mb-1">
                <span className="text-5xl font-black text-white">$9</span>
                <span className="text-indigo-200 mb-2">/month</span>
              </div>
              <p className="text-sm text-indigo-100">100 analyses/month. Cancel anytime.</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white">
                  <Check className="w-4 h-4 text-indigo-200 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            {CHECKOUT_URL ? (
              <a
                href={CHECKOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-indigo-600 font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.99] transition-transform"
              >
                <Zap className="w-4 h-4" />
                Upgrade to Pro
              </a>
            ) : (
              <div className="py-3 rounded-xl bg-white/20 text-white/60 text-center text-sm font-semibold">
                Coming soon
              </div>
            )}

            <p className="text-center text-indigo-200 text-xs mt-3">
              7-day money-back guarantee
            </p>
          </motion.div>
        </div>

        {/* Feature comparison table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-20"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
            Full comparison
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Feature</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-center">Free</th>
                  <th className="px-6 py-4 font-semibold text-indigo-600 dark:text-indigo-400 text-center">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                {[
                  ['Monthly analyses', '3', '100'],
                  ['Document types', 'Invoice & Report', 'Invoice & Report'],
                  ['OCR (scanned PDFs)', '✓', '✓'],
                  ['AI chat assistant', '✓', '✓'],
                  ['Interactive charts', '✓', '✓'],
                  ['Executive summary', '✓', '✓'],
                  ['Anomaly detection', '✓', '✓'],
                  ['Shareable links (30 days)', '✓', '✓'],
                  ['PNG & CSV export', '✓', '✓'],
                  ['QR code download', '✓', '✓'],
                  ['Analysis history', '✓', '✓'],
                  ['Dark mode', '✓', '✓'],
                  ['Priority AI processing', '—', '✓'],
                  ['All future features', '—', '✓'],
                  ['Support', 'Community', 'Email priority'],
                ].map(([feature, free, pro]) => (
                  <tr key={feature} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-3.5 text-slate-600 dark:text-slate-400">{feature}</td>
                    <td className="px-6 py-3.5 text-center text-slate-500 dark:text-slate-500">{free}</td>
                    <td className="px-6 py-3.5 text-center font-medium text-indigo-600 dark:text-indigo-400">{pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
            Billing FAQ
          </h2>
          <div className="space-y-4">
            {FAQS.map(({ q, a }) => (
              <div
                key={q}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm"
              >
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2 text-sm">{q}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800/50 p-10"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Start free today
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            3 analyses free every month. No credit card, no account needed.
            Upgrade to Pro when you're ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:scale-[1.02] transition-transform"
            >
              <Zap className="w-4 h-4" />
              Try free — no signup
            </a>
            {CHECKOUT_URL && (
              <a
                href={CHECKOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              >
                Upgrade to Pro — $9/mo
              </a>
            )}
          </div>
        </motion.div>

      </div>

      <MarketingFooter />
    </div>
  )
}
