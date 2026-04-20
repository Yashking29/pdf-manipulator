import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, ChevronDown, ChevronUp, Loader2, Bot, User } from 'lucide-react'
import { sendChat } from '../lib/api'
import type { ChatMessage, PdfType } from '../lib/types'

interface ChatPanelProps {
  downloadId: string
  pdfType: PdfType
}

const SUGGESTED: Record<PdfType, string[]> = {
  invoice: [
    'What is the total amount due?',
    'List all line items and their costs',
    'Who is the vendor and what is the invoice number?',
    'Are there any taxes or fees included?',
  ],
  report: [
    'What are the main findings?',
    'Summarize the key metrics',
    'What are the recommendations?',
    'Are there any risks highlighted?',
  ],
}

const SESSION_KEY = (id: string) => `briefwise-chat-${id}`

export function ChatPanel({ downloadId, pdfType }: ChatPanelProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY(downloadId))
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Persist messages for the lifetime of the browser tab
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY(downloadId), JSON.stringify(messages))
    } catch {
      // sessionStorage full — ignore
    }
  }, [messages, downloadId])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: ChatMessage = { role: 'user', content: trimmed, timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const reply = await sendChat(trimmed, downloadId)
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: reply || 'No response received.',
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.', timestamp: Date.now() },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Chat with Document</span>
          {messages.length > 0 && (
            <span className="text-xs bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-medium px-2 py-0.5 rounded-full">
              {messages.length}
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-slate-100 dark:border-slate-800">
              {/* Messages */}
              <div className="h-72 overflow-y-auto px-5 py-4 space-y-3 scrollbar-thin">
                {messages.length === 0 && !loading && (
                  <div className="h-full flex flex-col items-center justify-center gap-4">
                    <Bot className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm text-slate-400 dark:text-slate-500 text-center">
                      Ask anything about your {pdfType}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {SUGGESTED[pdfType].map(q => (
                        <button
                          key={q}
                          onClick={() => send(q)}
                          className="text-xs px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors border border-violet-200 dark:border-violet-800"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      msg.role === 'user'
                        ? 'bg-indigo-500'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}>
                      {msg.role === 'user'
                        ? <User className="w-3.5 h-3.5 text-white" />
                        : <Bot className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      }
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-500 text-white rounded-tr-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2.5"
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3">
                      <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                    </div>
                  </motion.div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
                  placeholder="Ask a question about this document…"
                  className="flex-1 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 dark:focus:border-violet-500 transition-all"
                />
                <button
                  onClick={() => send(input)}
                  disabled={!input.trim() || loading}
                  className="p-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
