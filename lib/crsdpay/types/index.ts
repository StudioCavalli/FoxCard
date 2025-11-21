/**
 * crsdpay - Custom Payment Gateway Types
 * Types de base pour le système de paiement crsdpay
 */

// Payment Methods
export type PaymentMethod = 'card' | 'crypto' | 'bank_transfer'
export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'jcb' | 'unionpay'
export type CardFunding = 'credit' | 'debit' | 'prepaid' | 'unknown'

// Transaction Status
export type TransactionStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled'
export type CaptureMethod = 'automatic' | 'manual'
export type ThreeDSStatus = 'authenticated' | 'failed' | 'not_applicable' | 'required'

// Crypto
export type Cryptocurrency = 'BTC' | 'ETH' | 'USDT' | 'USDC' | 'LTC' | 'BCH'
export type CryptoNetwork = 'bitcoin' | 'ethereum' | 'lightning' | 'polygon' | 'bsc' | 'tron'
export type CryptoPaymentStatus = 'pending' | 'confirming' | 'confirmed' | 'failed' | 'expired'

// Refund
export type RefundStatus = 'pending' | 'succeeded' | 'failed' | 'canceled'
export type RefundReason = 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'other'

// Fraud Detection
export type FraudDecision = 'approve' | 'review' | 'decline'
export type FraudStatus = 'safe' | 'review' | 'block'

// Webhook
export type WebhookStatus = 'pending' | 'delivered' | 'failed'
export type WebhookEventType =
  | 'payment.created'
  | 'payment.processing'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'payment.canceled'
  | 'payment.captured'
  | 'refund.created'
  | 'refund.succeeded'
  | 'refund.failed'
  | 'crypto.payment_received'
  | 'crypto.confirmed'
  | 'crypto.expired'
  | 'fraud.detected'

// API Keys
export type ApiKeyType = 'live' | 'test'
export type ApiKeyPermission =
  | 'all'
  | 'payments:read'
  | 'payments:write'
  | 'refunds:create'
  | 'customers:read'
  | 'customers:write'
  | 'webhooks:read'

// Configuration
export type GatewayMode = 'test' | 'live'

// Card Tokenization
export interface TokenizedCard {
  token: string
  brand: CardBrand
  last4: string
  expMonth: number
  expYear: number
  holderName?: string
  fingerprint?: string
  country?: string
  funding?: CardFunding
}

// Raw card data (NEVER stored, only used during tokenization)
export interface RawCardData {
  number: string
  expMonth: number
  expYear: number
  cvc: string
  holderName?: string
}

// Payment Intent
export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  paymentMethod: PaymentMethod
  status: TransactionStatus
  captureMethod: CaptureMethod
  clientSecret: string
  metadata?: Record<string, any>
}

// Crypto Payment Request
export interface CryptoPaymentRequest {
  cryptocurrency: Cryptocurrency
  network: CryptoNetwork
  amountFiat: number
  currency: string
  orderId?: string
  metadata?: Record<string, any>
}

// Crypto Payment Response
export interface CryptoPaymentResponse {
  id: string
  paymentId: string
  cryptocurrency: Cryptocurrency
  network: CryptoNetwork
  address: string
  amount: number
  amountFiat: number
  currency: string
  exchangeRate: number
  qrCodeUrl?: string
  expiresAt: Date
  status: CryptoPaymentStatus
}

// Refund Request
export interface RefundRequest {
  transactionId: string
  amount?: number // Si non spécifié, remboursement total
  reason?: RefundReason
  description?: string
  metadata?: Record<string, any>
}

// Webhook Event Payload
export interface WebhookEventPayload {
  id: string
  eventType: WebhookEventType
  data: any
  createdAt: Date
}

// Fraud Check Result
export interface FraudCheckResult {
  riskScore: number
  decision: FraudDecision
  riskFactors: string[]
  metadata?: Record<string, any>
}

// API Response Types
export interface CrsdpayApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

// Error Codes
export enum CrsdpayErrorCode {
  // Authentication
  INVALID_API_KEY = 'invalid_api_key',
  API_KEY_EXPIRED = 'api_key_expired',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',

  // Payment
  PAYMENT_NOT_FOUND = 'payment_not_found',
  PAYMENT_ALREADY_CAPTURED = 'payment_already_captured',
  PAYMENT_ALREADY_REFUNDED = 'payment_already_refunded',
  INSUFFICIENT_FUNDS = 'insufficient_funds',
  CARD_DECLINED = 'card_declined',
  CARD_EXPIRED = 'card_expired',
  INVALID_CARD_NUMBER = 'invalid_card_number',
  INVALID_CVC = 'invalid_cvc',

  // 3D Secure
  AUTHENTICATION_REQUIRED = '3ds_authentication_required',
  AUTHENTICATION_FAILED = '3ds_authentication_failed',

  // Crypto
  CRYPTO_ADDRESS_GENERATION_FAILED = 'crypto_address_generation_failed',
  CRYPTO_PAYMENT_EXPIRED = 'crypto_payment_expired',
  CRYPTO_INSUFFICIENT_CONFIRMATIONS = 'crypto_insufficient_confirmations',

  // Fraud
  FRAUD_DETECTED = 'fraud_detected',
  TRANSACTION_BLOCKED = 'transaction_blocked',

  // General
  INVALID_REQUEST = 'invalid_request',
  INTERNAL_ERROR = 'internal_error',
  RESOURCE_NOT_FOUND = 'resource_not_found',
}
