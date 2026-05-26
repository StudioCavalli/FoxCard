/**
 * SunPay Types
 * Type definitions for the GoldenEra Blockchain (GEB) payment system
 */

// GEB address: Ethereum-style 20-byte address (0x + 40 hex chars)
export type GEBAddress = string

// Transaction hash on the GoldenEra Blockchain
export type TxHash = string

// SunPay transaction status (mirrors Prisma enum)
export type SunPayTransactionStatus =
  | 'PENDING'
  | 'CONFIRMING'
  | 'CONFIRMED'
  | 'FAILED'
  | 'EXPIRED'
  | 'REFUNDED'

// Exchange rate information
export interface ExchangeRate {
  rate: number       // How many fiat units per 1 SCGE
  currency: string   // Fiat currency code (EUR, USD, etc.)
  isMock: boolean    // Whether this is mock data
}

// Payment request parameters
export interface CreatePaymentParams {
  amountFiat: number
  fiatCurrency: string
  merchantWallet: GEBAddress
}

// Payment request result
export interface PaymentRequest {
  paymentAddress: GEBAddress
  amountSCGE: number
  exchangeRate: number
  expiresAt: Date
  isMock: boolean
}

// Transaction verification result
export interface TransactionVerification {
  status: SunPayTransactionStatus
  confirmations: number
  blockHeight: number | null
  isMock: boolean
}

// Network status
export interface NetworkStatus {
  blockHeight: number
  blockTime: number     // Average block time in ms
  networkHash: string   // Network hash rate description
  isMock: boolean
}

// GEB transaction fee breakdown
export interface TransactionFee {
  baseFee: number     // Base fee in SCGE
  byteFee: number     // Fee per byte in SCGE
  totalFee: number    // Total fee in SCGE
}

// SunPay config as stored in database
export interface SunPayConfigData {
  id: string
  storeId: string
  isEnabled: boolean
  walletAddress: string | null
  autoConvert: boolean
  minAmount: number | null
  displayName: string
  createdAt: Date
  updatedAt: Date
}

// SunPay transaction as stored in database
export interface SunPayTransactionData {
  id: string
  storeId: string
  orderId: string | null
  txHash: string | null
  status: SunPayTransactionStatus
  amountSCGE: number
  amountFiat: number
  fiatCurrency: string
  exchangeRate: number
  senderAddress: string | null
  receiverAddress: string
  blockHeight: number | null
  confirmations: number
  expiresAt: Date | null
  confirmedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// Aggregate stats for store dashboard
export interface SunPayStats {
  totalTransactions: number
  confirmedTransactions: number
  totalVolumeSCGE: number
  totalVolumeFiat: number
  averageAmountFiat: number
}
