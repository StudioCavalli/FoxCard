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

interface CurrencySelectorProps {
  position?: 'bottom' | 'top' // bottom = dropdown goes down, top = dropdown goes up
  variant?: 'default' | 'compact' // compact for footer
}

export function CurrencySelector({ position = 'bottom', variant = 'default' }: CurrencySelectorProps) {
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

  const buttonClasses = variant === 'compact'
    ? 'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-theme-text-muted hover:text-theme-primary transition-colors rounded-md hover:bg-theme-surface/50 border border-theme-border'
    : 'flex items-center gap-2 px-3 py-2 text-sm font-medium text-theme-text hover:text-theme-primary transition-colors rounded-md hover:bg-theme-card'

  const dropdownClasses = position === 'top'
    ? 'absolute right-0 bottom-full mb-2 w-48 bg-theme-surface border border-theme-border rounded-lg shadow-xl overflow-hidden z-50'
    : 'absolute right-0 mt-2 w-56 bg-theme-surface border border-theme-border rounded-lg shadow-xl overflow-hidden z-50'

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClasses}
        aria-label="Select currency"
      >
        <DollarSign className={variant === 'compact' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        <span>{currency}</span>
      </button>

      {isOpen && (
        <div className={dropdownClasses}>
          {supportedCurrencies.map((curr) => (
            <button
              key={curr}
              onClick={() => {
                setCurrency(curr)
                setIsOpen(false)
              }}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors text-sm ${
                curr === currency
                  ? 'bg-theme-primary/10 text-theme-primary font-medium'
                  : 'text-theme-text hover:bg-theme-card'
              }`}
            >
              <span className="text-base">{currencyFlags[curr]}</span>
              <span className="font-medium">{curr}</span>
              <span className="text-xs text-theme-text-muted">({currencySymbols[curr]})</span>
              {curr === currency && (
                <span className="ml-auto text-theme-primary text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
