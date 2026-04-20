import { useState, useEffect } from 'react'
import type { HistoryEntry } from '../lib/types'

const STORAGE_KEY = 'briefwise-history'
const MAX_ENTRIES = 10

/** Strip large chart arrays to reduce localStorage footprint (~80% smaller per entry) */
function slimEntry(entry: HistoryEntry): HistoryEntry {
  return {
    ...entry,
    analysis: {
      ...entry.analysis,
      chartData: { bar: [], pie: [], line: [] },
    },
  }
}

function saveToStorage(entries: HistoryEntry[]) {
  const slim = entries.map(slimEntry)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slim))
  } catch {
    // Quota exceeded — drop the oldest entry and retry once
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slim.slice(0, MAX_ENTRIES - 1)))
    } catch {
      // Give up — history just won't persist this session
    }
  }
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    saveToStorage(history)
  }, [history])

  const addToHistory = (entry: HistoryEntry) => {
    setHistory(prev => {
      const filtered = prev.filter(e => e.id !== entry.id)
      return [entry, ...filtered].slice(0, MAX_ENTRIES)
    })
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return { history, addToHistory, clearHistory }
}
