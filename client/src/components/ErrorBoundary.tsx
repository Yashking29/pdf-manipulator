import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Something went wrong
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
            An unexpected error occurred. Your data is safe — this is a display error only.
          </p>

          {this.state.error?.message && (
            <p className="text-xs font-mono text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-900 rounded-lg px-3 py-2 mb-6 text-left break-all">
              {this.state.error.message}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh page
            </button>
            <a
              href="/"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Home className="w-4 h-4" />
              Go home
            </a>
          </div>
        </div>
      </div>
    )
  }
}
