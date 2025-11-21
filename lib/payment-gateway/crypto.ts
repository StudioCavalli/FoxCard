// Bitcoin and Cryptocurrency Payment Support
import crypto from 'crypto'

// Supported cryptocurrencies
export type CryptoCurrency = 'BTC' | 'ETH' | 'USDT' | 'USDC' | 'LTC'

export interface CryptoPaymentConfig {
  enabled: boolean
  supportedCurrencies: CryptoCurrency[]
  confirmationsRequired: Record<CryptoCurrency, number>
  expiryMinutes: number // Payment window expiry
  exchangeRateMargin: number // % added to exchange rate
}

export const DEFAULT_CRYPTO_CONFIG: CryptoPaymentConfig = {
  enabled: false,
  supportedCurrencies: ['BTC', 'ETH', 'USDT'],
  confirmationsRequired: {
    BTC: 3,
    ETH: 12,
    USDT: 12,
    USDC: 12,
    LTC: 6
  },
  expiryMinutes: 30,
  exchangeRateMargin: 1 // 1%
}

// Crypto payment status
export type CryptoPaymentStatus =
  | 'PENDING'
  | 'AWAITING_CONFIRMATION'
  | 'CONFIRMED'
  | 'EXPIRED'
  | 'UNDERPAID'
  | 'OVERPAID'
  | 'FAILED'

export interface CryptoPayment {
  id: string
  storeId: string
  orderId?: string
  currency: CryptoCurrency
  amountFiat: number
  fiatCurrency: string
  amountCrypto: number
  exchangeRate: number
  address: string
  status: CryptoPaymentStatus
  confirmations: number
  requiredConfirmations: number
  txHash?: string
  receivedAmount?: number
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

// Generate a unique payment address (simplified)
// In production, use HD wallet derivation
export function generatePaymentAddress(currency: CryptoCurrency): string {
  const prefix = {
    BTC: '1',
    ETH: '0x',
    USDT: '0x',
    USDC: '0x',
    LTC: 'L'
  }

  const random = crypto.randomBytes(20).toString('hex')
  return `${prefix[currency]}${random.substring(0, currency === 'BTC' ? 33 : 40)}`
}

// Generate payment ID
export function generateCryptoPaymentId(): string {
  return `CRYPTO-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`.toUpperCase()
}

// Exchange rate cache
interface CachedRate {
  rate: number
  timestamp: number
}

const exchangeRateCache = new Map<string, CachedRate>()
const CACHE_TTL_MS = 60000 // 1 minute cache

// CoinGecko API ID mapping
const COINGECKO_IDS: Record<CryptoCurrency, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
  USDC: 'usd-coin',
  LTC: 'litecoin'
}

// Fallback rates (updated periodically)
const FALLBACK_RATES: Record<CryptoCurrency, number> = {
  BTC: 45000,
  ETH: 2500,
  USDT: 0.92,
  USDC: 0.92,
  LTC: 70
}

// Get exchange rate with real API support
export async function getExchangeRate(
  cryptoCurrency: CryptoCurrency,
  fiat: string = 'EUR'
): Promise<number> {
  const cacheKey = `${cryptoCurrency}-${fiat}`
  const cached = exchangeRateCache.get(cacheKey)

  // Return cached rate if still valid
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.rate
  }

  // Try to fetch from CoinGecko API
  try {
    const coinId = COINGECKO_IDS[cryptoCurrency]
    const fiatLower = fiat.toLowerCase()

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${fiatLower}`,
      {
        headers: {
          'Accept': 'application/json',
          // Add API key if available
          ...(process.env.COINGECKO_API_KEY && {
            'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
          })
        },
        // Timeout after 5 seconds
        signal: AbortSignal.timeout(5000)
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    const rate = data[coinId]?.[fiatLower]

    if (rate && typeof rate === 'number') {
      // Cache the rate
      exchangeRateCache.set(cacheKey, {
        rate,
        timestamp: Date.now()
      })

      return rate
    }

    throw new Error('Invalid response from CoinGecko')
  } catch (error) {
    console.warn(`Failed to fetch exchange rate for ${cryptoCurrency}/${fiat}:`, error)

    // Return cached rate even if expired, or fallback
    if (cached) {
      return cached.rate
    }

    // Use fallback rates
    return FALLBACK_RATES[cryptoCurrency] || 1
  }
}

// Get multiple exchange rates at once (more efficient)
export async function getExchangeRates(
  currencies: CryptoCurrency[],
  fiat: string = 'EUR'
): Promise<Record<CryptoCurrency, number>> {
  const results: Record<string, number> = {}
  const fiatLower = fiat.toLowerCase()

  // Get coins that need fetching
  const coinsToFetch = currencies.filter(curr => {
    const cacheKey = `${curr}-${fiat}`
    const cached = exchangeRateCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      results[curr] = cached.rate
      return false
    }
    return true
  })

  if (coinsToFetch.length === 0) {
    return results as Record<CryptoCurrency, number>
  }

  try {
    const ids = coinsToFetch.map(c => COINGECKO_IDS[c]).join(',')

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${fiatLower}`,
      {
        headers: {
          'Accept': 'application/json',
          ...(process.env.COINGECKO_API_KEY && {
            'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
          })
        },
        signal: AbortSignal.timeout(5000)
      }
    )

    if (response.ok) {
      const data = await response.json()

      for (const curr of coinsToFetch) {
        const coinId = COINGECKO_IDS[curr]
        const rate = data[coinId]?.[fiatLower]

        if (rate && typeof rate === 'number') {
          results[curr] = rate
          exchangeRateCache.set(`${curr}-${fiat}`, {
            rate,
            timestamp: Date.now()
          })
        } else {
          results[curr] = FALLBACK_RATES[curr] || 1
        }
      }
    } else {
      throw new Error(`API error: ${response.status}`)
    }
  } catch (error) {
    console.warn('Failed to fetch exchange rates:', error)

    // Use fallbacks for failed fetches
    for (const curr of coinsToFetch) {
      const cacheKey = `${curr}-${fiat}`
      const cached = exchangeRateCache.get(cacheKey)
      results[curr] = cached?.rate || FALLBACK_RATES[curr] || 1
    }
  }

  return results as Record<CryptoCurrency, number>
}

// Clear exchange rate cache (useful for testing)
export function clearExchangeRateCache(): void {
  exchangeRateCache.clear()
}

// Calculate crypto amount from fiat
export async function calculateCryptoAmount(
  fiatAmount: number,
  fiatCurrency: string,
  cryptoCurrency: CryptoCurrency,
  marginPercent: number = 1
): Promise<{ amountCrypto: number; exchangeRate: number }> {
  const rate = await getExchangeRate(cryptoCurrency, fiatCurrency)

  // Add margin to protect against volatility
  const rateWithMargin = rate * (1 - marginPercent / 100)

  const amountCrypto = fiatAmount / rateWithMargin

  return {
    amountCrypto: parseFloat(amountCrypto.toFixed(8)),
    exchangeRate: rateWithMargin
  }
}

// Create a crypto payment request
export async function createCryptoPayment(params: {
  storeId: string
  orderId?: string
  amountFiat: number
  fiatCurrency: string
  cryptoCurrency: CryptoCurrency
  config: CryptoPaymentConfig
}): Promise<CryptoPayment> {
  const { amountCrypto, exchangeRate } = await calculateCryptoAmount(
    params.amountFiat,
    params.fiatCurrency,
    params.cryptoCurrency,
    params.config.exchangeRateMargin
  )

  const payment: CryptoPayment = {
    id: generateCryptoPaymentId(),
    storeId: params.storeId,
    orderId: params.orderId,
    currency: params.cryptoCurrency,
    amountFiat: params.amountFiat,
    fiatCurrency: params.fiatCurrency,
    amountCrypto,
    exchangeRate,
    address: generatePaymentAddress(params.cryptoCurrency),
    status: 'PENDING',
    confirmations: 0,
    requiredConfirmations: params.config.confirmationsRequired[params.cryptoCurrency],
    expiresAt: new Date(Date.now() + params.config.expiryMinutes * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  }

  return payment
}

// Check payment status (mock - use blockchain API in production)
export async function checkCryptoPaymentStatus(
  payment: CryptoPayment
): Promise<{
  status: CryptoPaymentStatus
  confirmations: number
  receivedAmount?: number
  txHash?: string
}> {
  // Mock implementation
  // In production, query blockchain or use service like BlockCypher

  // Check expiry
  if (new Date() > payment.expiresAt && payment.status === 'PENDING') {
    return { status: 'EXPIRED', confirmations: 0 }
  }

  // Return current status (mock)
  return {
    status: payment.status,
    confirmations: payment.confirmations,
    receivedAmount: payment.receivedAmount,
    txHash: payment.txHash
  }
}

// Format crypto amount for display
export function formatCryptoAmount(
  amount: number,
  currency: CryptoCurrency
): string {
  const decimals: Record<CryptoCurrency, number> = {
    BTC: 8,
    ETH: 6,
    USDT: 2,
    USDC: 2,
    LTC: 8
  }

  return `${amount.toFixed(decimals[currency])} ${currency}`
}

// Generate QR code data for payment
export function generatePaymentQRData(
  address: string,
  amount: number,
  currency: CryptoCurrency
): string {
  switch (currency) {
    case 'BTC':
      return `bitcoin:${address}?amount=${amount}`
    case 'ETH':
    case 'USDT':
    case 'USDC':
      return `ethereum:${address}?value=${amount}`
    case 'LTC':
      return `litecoin:${address}?amount=${amount}`
    default:
      return address
  }
}

// Get currency display info
export function getCurrencyInfo(currency: CryptoCurrency): {
  name: string
  symbol: string
  icon: string
  color: string
} {
  const info: Record<CryptoCurrency, { name: string; symbol: string; icon: string; color: string }> = {
    BTC: {
      name: 'Bitcoin',
      symbol: '₿',
      icon: '🟠',
      color: '#F7931A'
    },
    ETH: {
      name: 'Ethereum',
      symbol: 'Ξ',
      icon: '🔷',
      color: '#627EEA'
    },
    USDT: {
      name: 'Tether',
      symbol: '₮',
      icon: '🟢',
      color: '#26A17B'
    },
    USDC: {
      name: 'USD Coin',
      symbol: '$',
      icon: '🔵',
      color: '#2775CA'
    },
    LTC: {
      name: 'Litecoin',
      symbol: 'Ł',
      icon: '⚪',
      color: '#BFBBBB'
    }
  }

  return info[currency]
}

// Validate crypto address format (simplified)
export function validateCryptoAddress(
  address: string,
  currency: CryptoCurrency
): boolean {
  switch (currency) {
    case 'BTC':
      // Bitcoin addresses start with 1, 3, or bc1
      return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/.test(address)
    case 'ETH':
    case 'USDT':
    case 'USDC':
      // Ethereum addresses
      return /^0x[a-fA-F0-9]{40}$/.test(address)
    case 'LTC':
      // Litecoin addresses
      return /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/.test(address)
    default:
      return false
  }
}
