/**
 * SunPay Provider
 * Main payment provider for the GoldenEra Blockchain (GEB)
 *
 * When SUNPAY_API_URL is not set, all functions return mock data
 * suitable for development and testing.
 */

import {
  MOCK_EXCHANGE_RATES,
  PAYMENT_EXPIRATION_MS,
  BLOCK_TIME_MS,
  MIN_CONFIRMATIONS,
} from './config'
import { fiatToSCGE } from './utils'
import type {
  PaymentRequest,
  TransactionVerification,
  ExchangeRate,
  NetworkStatus,
} from './types'

const IS_MOCK = !process.env.SUNPAY_API_URL

/**
 * Create a new payment request on the GoldenEra Blockchain
 *
 * In mock mode: returns a fake address, mock rate, and 30-minute expiry.
 * In live mode: calls the SunPay API to generate a real payment address.
 */
export async function createPaymentRequest(params: {
  amountFiat: number
  fiatCurrency: string
  merchantWallet: string
}): Promise<PaymentRequest> {
  if (IS_MOCK) {
    // Block mock mode in production — real API credentials must be configured
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SunPay API not configured')
    }

    const rate = MOCK_EXCHANGE_RATES[params.fiatCurrency] ?? MOCK_EXCHANGE_RATES.EUR
    const amountSCGE = fiatToSCGE(params.amountFiat, rate)

    // Generate a deterministic-looking mock address
    const mockHex = Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')

    return {
      paymentAddress: `0x${mockHex}`,
      amountSCGE,
      exchangeRate: rate,
      expiresAt: new Date(Date.now() + PAYMENT_EXPIRATION_MS),
      isMock: true,
    }
  }

  // Live mode: call the SunPay API
  const response = await fetch(`${process.env.SUNPAY_API_URL}/payments/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount_fiat: params.amountFiat,
      fiat_currency: params.fiatCurrency,
      merchant_wallet: params.merchantWallet,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SunPay API error: ${error}`)
  }

  const data = await response.json()

  return {
    paymentAddress: data.payment_address,
    amountSCGE: data.amount_scge,
    exchangeRate: data.exchange_rate,
    expiresAt: new Date(data.expires_at),
    isMock: false,
  }
}

/**
 * Verify a transaction on the GoldenEra Blockchain
 *
 * In mock mode: always returns CONFIRMED with 6 confirmations.
 * In live mode: queries the blockchain for transaction status.
 */
export async function verifyTransaction(txHash: string): Promise<TransactionVerification> {
  if (IS_MOCK) {
    // In production, mock verification must never return CONFIRMED
    if (process.env.NODE_ENV === 'production') {
      return {
        status: 'PENDING',
        confirmations: 0,
        blockHeight: null,
        isMock: true,
      }
    }

    return {
      status: 'CONFIRMED',
      confirmations: MIN_CONFIRMATIONS,
      blockHeight: 1_000_000 + Math.floor(Math.random() * 10_000),
      isMock: true,
    }
  }

  const response = await fetch(
    `${process.env.SUNPAY_API_URL}/transactions/${txHash}`
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SunPay API error: ${error}`)
  }

  const data = await response.json()

  return {
    status: data.status,
    confirmations: data.confirmations,
    blockHeight: data.block_height ?? null,
    isMock: false,
  }
}

/**
 * Get the current exchange rate for SCGE against a fiat currency
 *
 * In mock mode: returns 20.00 for EUR, 22.00 for USD.
 * In live mode: fetches the real-time rate from the SunPay API.
 */
export async function getExchangeRate(currency: string): Promise<ExchangeRate> {
  if (IS_MOCK) {
    const rate = MOCK_EXCHANGE_RATES[currency] ?? MOCK_EXCHANGE_RATES.EUR
    return {
      rate,
      currency,
      isMock: true,
    }
  }

  const response = await fetch(
    `${process.env.SUNPAY_API_URL}/exchange-rate?currency=${currency}`
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SunPay API error: ${error}`)
  }

  const data = await response.json()

  return {
    rate: data.rate,
    currency: data.currency,
    isMock: false,
  }
}

/**
 * Get the current GoldenEra Blockchain network status
 *
 * In mock mode: returns plausible mock data.
 * In live mode: queries the SunPay API for real network metrics.
 */
export async function getNetworkStatus(): Promise<NetworkStatus> {
  if (IS_MOCK) {
    return {
      blockHeight: 1_000_000 + Math.floor(Math.random() * 10_000),
      blockTime: BLOCK_TIME_MS,
      networkHash: '125.4 TH/s',
      isMock: true,
    }
  }

  const response = await fetch(`${process.env.SUNPAY_API_URL}/network/status`)

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SunPay API error: ${error}`)
  }

  const data = await response.json()

  return {
    blockHeight: data.block_height,
    blockTime: data.block_time,
    networkHash: data.network_hash,
    isMock: false,
  }
}
