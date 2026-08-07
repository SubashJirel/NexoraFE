import { createContext, useContext } from 'react'

export const LocalizationContext = createContext(null)

export function useLocalization() {
  const value = useContext(LocalizationContext)
  if (!value) throw new Error('useLocalization must be used inside LocalizationProvider')
  return value
}
