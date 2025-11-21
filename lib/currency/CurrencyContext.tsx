'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Currency, currencySymbols, currencyNames, currencyFlags } from './config'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  supportedCurrencies: Currency[]
  defaultCurrency: Currency
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

const CURRENCY_STORAGE_KEY = 'foxcard_currency'

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('EUR')
  const [supportedCurrencies, setSupportedCurrencies] = useState<Currency[]>(['EUR', 'USD', 'GBP'])
  const [defaultCurrency, setDefaultCurrency] = useState<Currency>('EUR')
  const [isInitialized, setIsInitialized] = useState(false)

  // Load platform settings and stored currency on mount
  useEffect(() => {
    async function initCurrency() {
      try {
        // Fetch platform settings
        const response = await fetch('/api/platform/settings')
        if (response.ok) {
          const settings = await response.json()

          // Set supported currencies from settings
          if (settings.supportedCurrencies && settings.supportedCurrencies.length > 0) {
            setSupportedCurrencies(settings.supportedCurrencies as Currency[])
          }

          // Set default currency from settings
          const platformDefault = (settings.defaultCurrency || 'EUR') as Currency
          setDefaultCurrency(platformDefault)

          // Check localStorage for user preference
          const stored = localStorage.getItem(CURRENCY_STORAGE_KEY)
          if (stored && settings.supportedCurrencies?.includes(stored)) {
            setCurrencyState(stored as Currency)
          } else {
            // Use platform default
            setCurrencyState(platformDefault)
          }
        } else {
          // Fallback to localStorage or default
          const stored = localStorage.getItem(CURRENCY_STORAGE_KEY)
          if (stored && ['EUR', 'USD', 'GBP', 'CHF'].includes(stored)) {
            setCurrencyState(stored as Currency)
          }
        }
      } catch (error) {
        console.error('Failed to fetch currency settings:', error)
        // Fallback to localStorage or default
        const stored = localStorage.getItem(CURRENCY_STORAGE_KEY)
        if (stored && ['EUR', 'USD', 'GBP', 'CHF'].includes(stored)) {
          setCurrencyState(stored as Currency)
        }
      } finally {
        setIsInitialized(true)
      }
    }

    initCurrency()
  }, [])

  // Save currency to localStorage when it changes
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency)
  }

  // Don't render children until initialized to avoid hydration mismatch
  if (!isInitialized) {
    return null
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, supportedCurrencies, defaultCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
