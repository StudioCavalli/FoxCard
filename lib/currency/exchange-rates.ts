import { Currency, defaultCurrency } from './config'

// Exchange rates cache (base: EUR)
let exchangeRatesCache: Record<Currency, number> | null = null
let lastFetchTime: number = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

// Default fallback rates (EUR as base)
const DEFAULT_RATES: Record<Currency, number> = {
  EUR: 1,
  USD: 1.09, // Approximate rate
  GBP: 0.86, // Approximate rate
}

/**
 * Fetch latest exchange rates from API
 */
async function fetchExchangeRates(): Promise<Record<Currency, number>> {
  try {
    // Try to fetch from a free API
    // Note: This is a basic implementation. For production, consider using:
    // - exchangerate-api.com
    // - fixer.io
    // - currencyapi.com
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${defaultCurrency}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates')
    }

    const data = await response.json()

    return {
      EUR: data.rates.EUR || DEFAULT_RATES.EUR,
      USD: data.rates.USD || DEFAULT_RATES.USD,
      GBP: data.rates.GBP || DEFAULT_RATES.GBP,
    }
  } catch (error) {
    console.error('Error fetching exchange rates:', error)
    return DEFAULT_RATES
  }
}

/**
 * Get current exchange rates (with caching)
 */
export async function getExchangeRates(): Promise<Record<Currency, number>> {
  const now = Date.now()

  // Return cached rates if still valid
  if (exchangeRatesCache && now - lastFetchTime < CACHE_DURATION) {
    return exchangeRatesCache
  }

  // Fetch new rates
  const rates = await fetchExchangeRates()
  exchangeRatesCache = rates
  lastFetchTime = now

  return rates
}

/**
 * Convert amount from one currency to another
 */
export async function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency
): Promise<number> {
  if (from === to) {
    return amount
  }

  const rates = await getExchangeRates()

  // Convert to base currency (EUR) first, then to target currency
  const amountInBase = amount / rates[from]
  const convertedAmount = amountInBase * rates[to]

  return Number(convertedAmount.toFixed(2))
}

/**
 * Get exchange rate between two currencies
 */
export async function getExchangeRate(from: Currency, to: Currency): Promise<number> {
  if (from === to) {
    return 1
  }

  const rates = await getExchangeRates()
  const rate = rates[to] / rates[from]

  return Number(rate.toFixed(4))
}

/**
 * Clear exchange rates cache (useful for testing or manual refresh)
 */
export function clearExchangeRatesCache() {
  exchangeRatesCache = null
  lastFetchTime = 0
}
