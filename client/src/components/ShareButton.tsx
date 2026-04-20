import { useState } from 'react'
import { Share2, Check, Loader2, Copy } from 'lucide-react'
import { createShare } from '../lib/api'

interface ShareButtonProps {
  downloadId: string
}

export function ShareButton({ downloadId }: ShareButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'copied'>('idle')

  const handleShare = async () => {
    if (status !== 'idle') return
    setStatus('loading')
    try {
      const { shareId } = await createShare(downloadId)
      const url = `${window.location.origin}/share/${shareId}`
      await navigator.clipboard.writeText(url)
      setStatus('copied')
      setTimeout(() => setStatus('idle'), 2500)
    } catch {
      setStatus('idle')
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={status === 'loading'}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-60"
    >
      {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
      {status === 'copied' && <Check className="w-4 h-4 text-emerald-500" />}
      {status === 'idle' && <Share2 className="w-4 h-4 text-slate-500" />}
      {status === 'copied' ? 'Link copied!' : status === 'loading' ? 'Creating…' : 'Share'}
    </button>
  )
}
