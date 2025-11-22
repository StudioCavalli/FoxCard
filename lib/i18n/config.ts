import { getRequestConfig } from 'next-intl/server'

// Supported locales - 5 languages
export const locales = ['fr', 'en', 'de', 'es', 'sk'] as const
export type Locale = (typeof locales)[number]

// Default locale - Slovak as primary market
export const defaultLocale: Locale = 'sk'

// Locale labels for UI
export const localeLabels: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  sk: 'Slovenčina',
}

// Locale flags
export const localeFlags: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  de: '🇩🇪',
  es: '🇪🇸',
  sk: '🇸🇰',
}

// Locale metadata for SEO
export const localeMetadata: Record<Locale, { name: string; region: string; direction: 'ltr' | 'rtl' }> = {
  fr: { name: 'French', region: 'FR', direction: 'ltr' },
  en: { name: 'English', region: 'US', direction: 'ltr' },
  de: { name: 'German', region: 'DE', direction: 'ltr' },
  es: { name: 'Spanish', region: 'ES', direction: 'ltr' },
  sk: { name: 'Slovak', region: 'SK', direction: 'ltr' },
}

// Currency by locale (default suggestion)
export const localeCurrency: Record<Locale, string> = {
  fr: 'EUR',
  en: 'USD',
  de: 'EUR',
  es: 'EUR',
  sk: 'EUR',
}

// Date/Time formats by locale
export const localeDateFormats: Record<Locale, { date: string; time: string; datetime: string }> = {
  fr: { date: 'dd/MM/yyyy', time: 'HH:mm', datetime: 'dd/MM/yyyy HH:mm' },
  en: { date: 'MM/dd/yyyy', time: 'h:mm a', datetime: 'MM/dd/yyyy h:mm a' },
  de: { date: 'dd.MM.yyyy', time: 'HH:mm', datetime: 'dd.MM.yyyy HH:mm' },
  es: { date: 'dd/MM/yyyy', time: 'HH:mm', datetime: 'dd/MM/yyyy HH:mm' },
  sk: { date: 'd.M.yyyy', time: 'H:mm', datetime: 'd.M.yyyy H:mm' },
}

// Number formats by locale
export const localeNumberFormats: Record<Locale, { decimal: string; thousand: string }> = {
  fr: { decimal: ',', thousand: ' ' },
  en: { decimal: '.', thousand: ',' },
  de: { decimal: ',', thousand: '.' },
  es: { decimal: ',', thousand: '.' },
  sk: { decimal: ',', thousand: ' ' },
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
