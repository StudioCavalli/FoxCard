'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useRef, useState, useEffect } from 'react'
import { locales, localeLabels, localeFlags, type Locale } from '@/lib/i18n/config'
import { usePlatformSettings } from '@/lib/platform/PlatformSettingsProvider'
import { Globe } from 'lucide-react'

export function LanguageSelector() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { settings } = usePlatformSettings()

  // Filter locales based on platform settings
  const supportedLocales = locales.filter((loc) =>
    settings.supportedLanguages.includes(loc)
  )

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

  const switchLocale = (newLocale: Locale) => {
    // Get the current path without the locale prefix
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '')
    // Navigate to the new locale path
    router.push(`/${newLocale}${pathWithoutLocale}`)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-theme-text hover:text-theme-primary transition-colors rounded-md hover:bg-theme-card"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{localeLabels[locale]}</span>
        <span className="sm:hidden">{localeFlags[locale]}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-theme-surface border border-theme-border rounded-lg shadow-xl overflow-hidden z-50">
          {supportedLocales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors ${
                loc === locale
                  ? 'bg-theme-primary/10 text-theme-primary font-medium'
                  : 'text-theme-text hover:bg-theme-card'
              }`}
            >
              <span className="text-xl">{localeFlags[loc]}</span>
              <span>{localeLabels[loc]}</span>
              {loc === locale && (
                <span className="ml-auto text-theme-primary">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
