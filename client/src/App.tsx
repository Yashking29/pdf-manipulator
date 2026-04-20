import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Navbar } from './components/Navbar'
import { UploadPage } from './components/UploadPage'
import { Dashboard } from './components/Dashboard'
import { PaywallModal } from './components/PaywallModal'
import { SharePage } from './components/SharePage'
import { ErrorBoundary } from './components/ErrorBoundary'
import { FaqPage } from './pages/FaqPage'
import { ContactPage } from './pages/ContactPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { TermsPage } from './pages/TermsPage'
import { PricingPage } from './pages/PricingPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { useDarkMode } from './hooks/useDarkMode'
import { useHistory } from './hooks/useHistory'
import { useLicense } from './hooks/useLicense'
import { analyzePdf } from './lib/api'
import type { AnalysisResult, HistoryEntry, PdfType } from './lib/types'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } }
}

const pathname = window.location.pathname

// Marketing pages — rendered with dark mode wrapper, no app chrome
function MarketingWrapper({ children }: { children: React.ReactNode }) {
  const { darkMode } = useDarkMode()
  return <div className={darkMode ? 'dark' : ''}>{children}</div>
}

// Handle /share/:id route without React Router
const shareMatch = pathname.match(/^\/share\/([^/]+)$/)

function ShareWrapper({ shareId }: { shareId: string }) {
  const { darkMode } = useDarkMode()
  return (
    <div className={darkMode ? 'dark' : ''}>
      <SharePage shareId={shareId} />
    </div>
  )
}

export default function App() {
  if (shareMatch) return <ErrorBoundary><ShareWrapper shareId={shareMatch[1]} /></ErrorBoundary>
  if (pathname === '/faq')     return <ErrorBoundary><MarketingWrapper><FaqPage /></MarketingWrapper></ErrorBoundary>
  if (pathname === '/contact') return <ErrorBoundary><MarketingWrapper><ContactPage /></MarketingWrapper></ErrorBoundary>
  if (pathname === '/pricing') return <ErrorBoundary><MarketingWrapper><PricingPage /></MarketingWrapper></ErrorBoundary>
  if (pathname === '/privacy') return <ErrorBoundary><MarketingWrapper><PrivacyPage /></MarketingWrapper></ErrorBoundary>
  if (pathname === '/terms')   return <ErrorBoundary><MarketingWrapper><TermsPage /></MarketingWrapper></ErrorBoundary>
  if (pathname !== '/')        return <ErrorBoundary><MarketingWrapper><NotFoundPage /></MarketingWrapper></ErrorBoundary>
  const [page, setPage] = useState<'upload' | 'dashboard'>('upload')
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [pdfType, setPdfType] = useState<PdfType>('invoice')
  const [pdfFilename, setPdfFilename] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { darkMode, toggleDarkMode } = useDarkMode()
  const { history, addToHistory } = useHistory()
  const {
    licenseKey, isPro, usesRemaining, updateUsesRemaining,
    activateLicense, deactivateLicense, activating, activateError,
  } = useLicense()
  const [showPaywall, setShowPaywall] = useState(false)
  const [progressMsg, setProgressMsg] = useState('')
  const [progressPct, setProgressPct] = useState(0)

  const handleAnalyze = async (file: File, type: PdfType) => {
    setLoading(true)
    setError(null)
    setProgressMsg('')
    setProgressPct(0)
    try {
      const { result, usesRemaining: remaining } = await analyzePdf(
        file, type, licenseKey,
        (msg, pct) => { setProgressMsg(msg); setProgressPct(pct) }
      )
      if (remaining !== null) updateUsesRemaining(remaining)
      setAnalysis(result)
      setPdfType(type)
      setPdfFilename(file.name)
      setPage('dashboard')
      addToHistory({
        id: result.downloadId,
        filename: file.name,
        type,
        title: result.title,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        analysis: result
      })
    } catch (err) {
      if (err instanceof Error && (err as Error & { limitReached?: boolean }).limitReached) {
        setShowPaywall(true)
      } else if (err instanceof Error && (err as Error & { proLimitReached?: boolean }).proLimitReached) {
        setError(err.message) // inline error — they're already Pro, no paywall needed
      } else {
        setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLoadHistory = (entry: HistoryEntry) => {
    setAnalysis(entry.analysis)
    setPdfType(entry.type)
    setPdfFilename(entry.filename)
    setPage('dashboard')
  }

  return (
    <ErrorBoundary>
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
        <Navbar
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          history={history}
          onLoadHistory={handleLoadHistory}
          onNewUpload={() => { setPage('upload'); setError(null) }}
          isPro={isPro}
          usesRemaining={usesRemaining}
          onUpgradeClick={() => setShowPaywall(true)}
          onDeactivateLicense={deactivateLicense}
        />

        <AnimatePresence mode="wait">
          {page === 'upload' ? (
            <motion.div key="upload" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <UploadPage onAnalyze={handleAnalyze} loading={loading} error={error} progressMsg={progressMsg} progressPct={progressPct} />
            </motion.div>
          ) : analysis ? (
            <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <Dashboard
                analysis={analysis}
                pdfType={pdfType}
                filename={pdfFilename}
                darkMode={darkMode}
                onBack={() => setPage('upload')}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        onActivated={() => { setShowPaywall(false) }}
        activateLicense={activateLicense}
        activating={activating}
        activateError={activateError}
      />
    </div>
    </ErrorBoundary>
  )
}
