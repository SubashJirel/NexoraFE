import { useEffect, useMemo, useRef, useState } from 'react'
import { TRANSLATIONS, formatCurrency, formatDate, formatNumber, formatPhone } from '@/lib/localization'
import { LocalizationContext } from './useLocalization'

const STORAGE_KEY = 'nexora-localization'
function initialPreferences() {
  try {
    return { language: 'en', dateSystem: 'ad', nepaliDigits: false, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  } catch {
    return { language: 'en', dateSystem: 'ad', nepaliDigits: false }
  }
}

export function LocalizationProvider({ children }) {
  const [preferences, setPreferences] = useState(initialPreferences)
  const preferenceSource = useRef(localStorage.getItem(STORAGE_KEY) ? 'stored' : null)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
    document.documentElement.lang = preferences.language
  }, [preferences])

  const value = useMemo(() => {
    const update = (values, source = 'user') => {
      preferenceSource.current = source
      setPreferences((current) => ({ ...current, ...values }))
    }
    const t = (key, fallback = key) => preferences.language === 'ne' ? (TRANSLATIONS.ne[key] || fallback) : fallback
    const options = preferences
    return {
      ...preferences, t, update,
      setLanguage: (language) => update({ language }),
      setDateSystem: (dateSystem) => update({ dateSystem }),
      setNepaliDigits: (nepaliDigits) => update({ nepaliDigits }),
      applyAgencyDefaults: (agency) => {
        if (!preferenceSource.current && agency) update({
          language: agency.default_language || 'en',
          dateSystem: agency.default_date_system || 'ad',
          nepaliDigits: Boolean(agency.use_nepali_digits),
        }, 'agency')
      },
      date: (input, includeTime = false) => formatDate(input, { ...options, includeTime }),
      number: (input, config = {}) => formatNumber(input, { nepaliDigits: options.nepaliDigits, ...config }),
      currency: (input) => formatCurrency(input, options),
      phone: (input) => formatPhone(input, options),
    }
  }, [preferences])

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>
}
