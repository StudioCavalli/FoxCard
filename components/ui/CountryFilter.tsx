'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { getCountries, getCountryFlag, getCountryLabel } from '@/lib/countries'
import { ChevronDown, X } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

interface CountryFilterProps {
  value: string[]
  onChange: (countries: string[]) => void
  availableCountries?: string[]
  className?: string
}

export function CountryFilter({ value, onChange, availableCountries, className = '' }: CountryFilterProps) {
  const t = useTranslations('store')
  const locale = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const countries = useMemo(() => {
    const allCountries = getCountries(locale)
    return availableCountries
      ? allCountries.filter((c) => availableCountries.includes(c.code))
      : allCountries
  }, [locale, availableCountries])

  const toggleCountry = (code: string) => {
    if (value.includes(code)) {
      onChange(value.filter((c) => c !== code))
    } else {
      onChange([...value, code])
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-theme-surface border border-theme-border text-theme-text focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all text-sm"
      >
        {value.length === 0 ? (
          <span className="text-theme-text-muted">{t('allCountries')}</span>
        ) : (
          <span className="flex items-center gap-1">
            {value.slice(0, 2).map((c) => (
              <span key={c}>{getCountryFlag(c)}</span>
            ))}
            {value.length > 2 && <span className="text-theme-text-muted">+{value.length - 2}</span>}
          </span>
        )}
        <ChevronDown className="w-4 h-4 text-theme-text-muted" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 right-0 min-w-[220px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-64 overflow-hidden">
          {value.length > 0 && (
            <div className="p-2 border-b border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => onChange([])}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <X className="w-3 h-3" />
                {t('clearSelection')}
              </button>
            </div>
          )}
          <div className="overflow-y-auto max-h-52">
            {countries.map((country) => {
              const isSelected = value.includes(country.code)
              return (
                <button
                  type="button"
                  key={country.code}
                  onClick={() => toggleCountry(country.code)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                    isSelected
                      ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span>{getCountryFlag(country.code)}</span>
                  <span className="flex-1">{country.label}</span>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
