/**
 * i18n Formatting Utilities
 * Date, time, number, and currency formatting by locale
 */

import { Locale, localeDateFormats, localeNumberFormats, localeCurrency } from './config'

// Date Formatting
export function formatDate(date: Date | string, locale: Locale, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }

  return new Intl.DateTimeFormat(getIntlLocale(locale), options || defaultOptions).format(d)
}

export function formatTime(date: Date | string, locale: Locale, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date

  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  }

  return new Intl.DateTimeFormat(getIntlLocale(locale), options || defaultOptions).format(d)
}

export function formatDateTime(date: Date | string, locale: Locale, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }

  return new Intl.DateTimeFormat(getIntlLocale(locale), options || defaultOptions).format(d)
}

export function formatRelativeTime(date: Date | string, locale: Locale): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  const rtf = new Intl.RelativeTimeFormat(getIntlLocale(locale), { numeric: 'auto' })

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second')
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute')
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour')
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day')
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month')
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year')
  }
}

// Number Formatting
export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(getIntlLocale(locale), options).format(value)
}

export function formatCurrency(
  value: number,
  locale: Locale,
  currency?: string
): string {
  const curr = currency || localeCurrency[locale]

  return new Intl.NumberFormat(getIntlLocale(locale), {
    style: 'currency',
    currency: curr,
  }).format(value)
}

export function formatPercent(value: number, locale: Locale, decimals: number = 0): string {
  return new Intl.NumberFormat(getIntlLocale(locale), {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatCompact(value: number, locale: Locale): string {
  return new Intl.NumberFormat(getIntlLocale(locale), {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value)
}

// Pluralization helpers
export function pluralize(
  count: number,
  singular: string,
  plural: string,
  locale: Locale
): string {
  const pr = new Intl.PluralRules(getIntlLocale(locale))
  const rule = pr.select(count)

  // For most European languages, 'one' = singular, everything else = plural
  return rule === 'one' ? singular : plural
}

// List formatting
export function formatList(items: string[], locale: Locale, type: 'conjunction' | 'disjunction' = 'conjunction'): string {
  return new Intl.ListFormat(getIntlLocale(locale), {
    style: 'long',
    type,
  }).format(items)
}

// Unit formatting
export function formatUnit(
  value: number,
  unit: Intl.NumberFormatOptions['unit'],
  locale: Locale
): string {
  return new Intl.NumberFormat(getIntlLocale(locale), {
    style: 'unit',
    unit,
    unitDisplay: 'short',
  }).format(value)
}

// Helper to get Intl-compatible locale string
function getIntlLocale(locale: Locale): string {
  const localeMap: Record<Locale, string> = {
    fr: 'fr-FR',
    en: 'en-US',
    de: 'de-DE',
    es: 'es-ES',
    sk: 'sk-SK',
  }
  return localeMap[locale]
}

// Export locale info
export { localeDateFormats, localeNumberFormats, localeCurrency }
