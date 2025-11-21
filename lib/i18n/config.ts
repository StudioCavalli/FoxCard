import { getRequestConfig } from 'next-intl/server'

// Supported locales
export const locales = ['fr', 'en'] as const
export type Locale = (typeof locales)[number]

// Default locale
export const defaultLocale: Locale = 'fr'

// Locale labels for UI
export const localeLabels: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
}

// Locale flags
export const localeFlags: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
}

export default getRequestConfig(async ({ requestLocale }) => {
  // Get locale from request (Next.js 16+ pattern)
  let locale = await requestLocale

  // Fallback to default if not provided
  if (!locale) {
    locale = defaultLocale
  }

  // Validate and fallback
  if (!locales.includes(locale as Locale)) {
    locale = defaultLocale
  }

  const messages = (await import(`../../messages/${locale}.json`)).default

  return {
    locale,
    messages,
  }
})
