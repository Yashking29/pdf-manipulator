import { useState } from 'react'

const LICENSE_KEY_STORAGE = 'briefwise-license'
const USES_REMAINING_STORAGE = 'briefwise-uses-remaining'
export const FREE_LIMIT = 3

export function useLicense() {
  const [licenseKey, setLicenseKey] = useState<string | null>(() =>
    localStorage.getItem(LICENSE_KEY_STORAGE)
  )
  const [usesRemaining, setUsesRemaining] = useState<number | null>(() => {
    const v = localStorage.getItem(USES_REMAINING_STORAGE)
    return v !== null ? Number(v) : null
  })
  const [activating, setActivating] = useState(false)
  const [activateError, setActivateError] = useState<string | null>(null)

  const isPro = !!licenseKey

  const updateUsesRemaining = (n: number | null) => {
    setUsesRemaining(n)
    if (n !== null) localStorage.setItem(USES_REMAINING_STORAGE, String(n))
  }

  const activateLicense = async (key: string): Promise<boolean> => {
    setActivating(true)
    setActivateError(null)
    try {
      const res = await fetch('/api/validate-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: key.trim() }),
      })
      const data = await res.json()
      if (data.valid) {
        localStorage.setItem(LICENSE_KEY_STORAGE, key.trim())
        setLicenseKey(key.trim())
        return true
      }
      setActivateError(data.error || 'Invalid license key.')
      return false
    } catch {
      setActivateError('Network error. Please try again.')
      return false
    } finally {
      setActivating(false)
    }
  }

  const deactivateLicense = () => {
    localStorage.removeItem(LICENSE_KEY_STORAGE)
    setLicenseKey(null)
  }

  return {
    licenseKey,
    isPro,
    usesRemaining,
    updateUsesRemaining,
    activateLicense,
    deactivateLicense,
    activating,
    activateError,
  }
}
