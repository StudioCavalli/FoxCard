'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Globe } from 'lucide-react'
import { locales, type Locale } from '@/i18n'

const languageNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
}

const languageFlags: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  es: '🇪🇸',
  de: '🇩🇪',
}

interface LanguageSwitcherProps {
  currentLocale: Locale
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const switchLanguage = (locale: Locale) => {
    // Remove current locale from path and add new one
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '')
    const newPath = `/${locale}${pathWithoutLocale}`

    // Store in localStorage for persistence
    localStorage.setItem('preferredLocale', locale)

    router.push(newPath)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Globe className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {languageFlags[currentLocale]} {languageNames[currentLocale]}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => switchLanguage(locale)}
                className={`
                  w-full px-4 py-2 text-left flex items-center gap-3
                  hover:bg-gray-50 transition-colors
                  ${locale === currentLocale ? 'bg-primary-50 text-primary-700' : 'text-gray-700'}
                `}
              >
                <span className="text-xl">{languageFlags[locale]}</span>
                <span className="text-sm font-medium">{languageNames[locale]}</span>
                {locale === currentLocale && (
                  <span className="ml-auto text-primary-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
