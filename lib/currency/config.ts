export const currencies = ['EUR', 'USD', 'GBP'] as const
export type Currency = (typeof currencies)[number]

export const defaultCurrency: Currency = 'EUR'

export const currencySymbols: Record<Currency, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
}

export const currencyNames: Record<Currency, string> = {
  EUR: 'Euro',
  USD: 'US Dollar',
  GBP: 'British Pound',
}

export const currencyFlags: Record<Currency, string> = {
  EUR: '🇪🇺',
  USD: '🇺🇸',
  GBP: '🇬🇧',
}

// Format currency value
export function formatCurrency(value: number, currency: Currency): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(value)
}

// Format currency value with custom locale
export function formatCurrencyWithLocale(
  value: number,
  currency: Currency,
  locale: string
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value)
}
