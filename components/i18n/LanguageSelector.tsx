'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useRef, useState, useEffect } from 'react'
import { locales, localeLabels, localeFlags, type Locale } from '@/lib/i18n/config'
import { usePlatformSettings } from '@/lib/platform/PlatformSettingsProvider'
import { Globe } from 'lucide-react'

interface LanguageSelectorProps {
  position?: 'bottom' | 'top' // bottom = dropdown goes down, top = dropdown goes up
  variant?: 'default' | 'compact' // compact for footer
}

export function LanguageSelector({ position = 'bottom', variant = 'default' }: LanguageSelectorProps) {
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

  const buttonClasses = variant === 'compact'
    ? 'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-theme-text-muted hover:text-theme-primary transition-colors rounded-md hover:bg-theme-surface/50 border border-theme-border'
    : 'flex items-center gap-2 px-3 py-2 text-sm font-medium text-theme-text hover:text-theme-primary transition-colors rounded-md hover:bg-theme-card'

  const dropdownClasses = position === 'top'
    ? 'absolute right-0 bottom-full mb-2 w-48 bg-theme-surface border border-theme-border rounded-lg shadow-xl overflow-hidden z-50'
    : 'absolute right-0 mt-2 w-48 bg-theme-surface border border-theme-border rounded-lg shadow-xl overflow-hidden z-50'

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClasses}
        aria-label="Select language"
      >
        <Globe className={variant === 'compact' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        <span>{localeLabels[locale]}</span>
      </button>

      {isOpen && (
        <div className={dropdownClasses}>
          {supportedLocales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors text-sm ${
                loc === locale
                  ? 'bg-theme-primary/10 text-theme-primary font-medium'
                  : 'text-theme-text hover:bg-theme-card'
              }`}
            >
              <span className="text-lg">{localeFlags[loc]}</span>
              <span>{localeLabels[loc]}</span>
              {loc === locale && (
                <span className="ml-auto text-theme-primary text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
