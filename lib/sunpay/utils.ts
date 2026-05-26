/**
 * SunPay Utilities
 * Helper functions for the GoldenEra Blockchain payment system
 */

import { TOKEN_DECIMALS, GEB_ADDRESS_REGEX } from './config'

/**
 * Format an SCGE amount with the full 8 decimal places
 * @param amount - Amount in SCGE
 * @returns Formatted string with 8 decimal places
 */
export function formatSCGE(amount: number): string {
  return amount.toFixed(TOKEN_DECIMALS)
}

/**
 * Convert a fiat amount to SCGE using the given exchange rate
 * @param fiatAmount - Amount in fiat currency
 * @param exchangeRate - How many fiat units per 1 SCGE
 * @returns Amount in SCGE
 */
export function fiatToSCGE(fiatAmount: number, exchangeRate: number): number {
  if (exchangeRate <= 0) {
    throw new Error('Exchange rate must be positive')
  }
  return fiatAmount / exchangeRate
}

/**
 * Convert an SCGE amount to fiat using the given exchange rate
 * @param scgeAmount - Amount in SCGE
 * @param exchangeRate - How many fiat units per 1 SCGE
 * @returns Amount in fiat
 */
export function scgeToFiat(scgeAmount: number, exchangeRate: number): number {
  if (exchangeRate <= 0) {
    throw new Error('Exchange rate must be positive')
  }
  return scgeAmount * exchangeRate
}

/**
 * Validate a GoldenEra Blockchain address
 * GEB uses Ethereum-style 20-byte addresses (0x + 40 hex chars)
 * @param address - Address to validate
 * @returns true if the address is valid
 */
export function isValidGEBAddress(address: string): boolean {
  return GEB_ADDRESS_REGEX.test(address)
}

/**
 * Generate a unique payment reference for tracking
 * Format: SPAY-{timestamp}-{random}
 * @returns Unique payment reference string
 */
export function generatePaymentReference(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `SPAY-${timestamp}-${random}`.toUpperCase()
}
