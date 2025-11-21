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

// Get exchange rate (mock - use real API in production)
export async function getExchangeRate(
  crypto: CryptoCurrency,
  fiat: string = 'EUR'
): Promise<number> {
  // Mock rates - in production use CoinGecko, CoinMarketCap, etc.
  const mockRates: Record<CryptoCurrency, number> = {
    BTC: 45000,
    ETH: 2500,
    USDT: 0.92,
    USDC: 0.92,
    LTC: 70
  }

  return mockRates[crypto] || 1
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
