'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { getCountries, getCountryFlag } from '@/lib/countries'
import { X, ChevronDown, Search } from 'lucide-react'
import { useLocale } from 'next-intl'

interface CountryMultiSelectProps {
  value: string[]
  onChange: (countries: string[]) => void
  placeholder?: string
  className?: string
}

export function CountryMultiSelect({ value, onChange, placeholder = 'Sélectionner des pays...', className = '' }: CountryMultiSelectProps) {
  const locale = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const countries = useMemo(() => getCountries(locale), [locale])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = countries.filter(
    (c) =>
      c.label.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  )

  const toggleCountry = (code: string) => {
    if (value.includes(code)) {
      onChange(value.filter((c) => c !== code))
    } else {
      onChange([...value, code])
    }
  }

  const removeCountry = (code: string) => {
    onChange(value.filter((c) => c !== code))
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[42px] px-3 py-2 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white cursor-pointer flex items-center gap-2 flex-wrap focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all"
      >
        {value.length === 0 ? (
          <span className="text-slate-400">{placeholder}</span>
        ) : (
          value.map((code) => {
            const country = countries.find((c) => c.code === code)
            return (
              <span
                key={code}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-medium"
              >
                {getCountryFlag(code)} {country?.label || code}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeCountry(code)
                  }}
                  className="hover:text-primary-900 dark:hover:text-primary-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )
          })
        )}
        <ChevronDown className="w-4 h-4 text-slate-400 ml-auto flex-shrink-0" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-64 overflow-hidden">
          <div className="p-2 border-b border-slate-200 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un pays..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-700/50 border-none rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-48">
            {filtered.map((country) => {
              const isSelected = value.includes(country.code)
              return (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => toggleCountry(country.code)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                    isSelected
                      ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <span className="text-base">{getCountryFlag(country.code)}</span>
                  <span className="flex-1">{country.label}</span>
                  <span className="text-xs text-slate-400">{country.code}</span>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-slate-400">Aucun pays trouvé</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
