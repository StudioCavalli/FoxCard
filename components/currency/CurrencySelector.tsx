'use client'

import { useRef, useState, useEffect } from 'react'
import { useCurrency } from '@/lib/currency/CurrencyContext'
import {
  currencies,
  currencySymbols,
  currencyNames,
  currencyFlags,
  type Currency,
} from '@/lib/currency/config'
import { DollarSign } from 'lucide-react'

export function CurrencySelector() {
  const { currency, setCurrency, supportedCurrencies } = useCurrency()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-theme-text hover:text-theme-primary transition-colors rounded-md hover:bg-theme-card"
        aria-label="Select currency"
      >
        <DollarSign className="w-4 h-4" />
        <span className="hidden sm:inline">{currency}</span>
        <span className="sm:hidden">{currencySymbols[currency]}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-theme-surface border border-theme-border rounded-lg shadow-xl overflow-hidden z-50">
          {supportedCurrencies.map((curr) => (
            <button
              key={curr}
              onClick={() => {
                setCurrency(curr)
                setIsOpen(false)
              }}
              className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors ${
                curr === currency
                  ? 'bg-theme-primary/10 text-theme-primary font-medium'
                  : 'text-theme-text hover:bg-theme-card'
              }`}
            >
              <span className="text-xl">{currencyFlags[curr]}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{curr}</span>
                  <span className="text-xs text-theme-text-secondary">({currencySymbols[curr]})</span>
                </div>
                <span className="text-xs text-theme-text-muted">{currencyNames[curr]}</span>
              </div>
              {curr === currency && (
                <span className="text-theme-primary">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
