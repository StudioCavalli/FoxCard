/**
 * SunPay Configuration
 * Constants derived from the GoldenEra Blockchain whitepaper
 */

// Token information
export const TOKEN_NAME = 'SunCoin'
export const TOKEN_TICKER = 'SCGE'
export const TOKEN_DECIMALS = 8

// Economics
export const INITIAL_PRICE_USD = 20.00
export const GOLD_BACKING_GRAMS = 0.25 // 1 SCGE backed by 0.25 gram gold

// Network parameters
export const BLOCK_TIME_MS = 30_000 // 30 seconds per block

// Fee structure: TotalFee = BaseFee + (ByteSize * ByteFee)
export const MIN_TX_BASE_FEE = 0.000002 // Minimum base fee in SCGE

// Address validation: Ethereum-style 20-byte addresses (0x + 40 hex chars)
export const GEB_ADDRESS_REGEX = /^0x[0-9a-fA-F]{40}$/

// Signature algorithm: ECDSA secp256k1
export const SIGNATURE_ALGORITHM = 'secp256k1'

// Payment expiration (30 minutes by default)
export const PAYMENT_EXPIRATION_MS = 30 * 60 * 1000

// Minimum confirmations before considering a payment confirmed
export const MIN_CONFIRMATIONS = 6

// Default mock exchange rates (used when SUNPAY_API_URL is not set)
export const MOCK_EXCHANGE_RATES: Record<string, number> = {
  EUR: 20.00,
  USD: 22.00,
  GBP: 17.50,
  CHF: 19.50,
}
