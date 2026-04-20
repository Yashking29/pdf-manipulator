import { useState, useEffect } from 'react'

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('briefwise-dark')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('briefwise-dark', String(darkMode))
  }, [darkMode])

  const toggleDarkMode = () => setDarkMode(prev => !prev)

  return { darkMode, toggleDarkMode }
}
