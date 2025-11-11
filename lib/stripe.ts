import Stripe from 'stripe'

// Stripe is optional - only required if you want to use payment features
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

if (!STRIPE_SECRET_KEY) {
  console.warn('⚠️  STRIPE_SECRET_KEY is not defined - payment features will be disabled')
}

export const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
      typescript: true,
    })
  : null

export const CURRENCY = 'eur'
export const MIN_AMOUNT = 0.5
export const MAX_AMOUNT = 999999

export function formatAmountForStripe(amount: number, currency: string = CURRENCY): number {
  // Stripe expects amounts in cents (smallest currency unit)
  return Math.round(amount * 100)
}

export function formatAmountFromStripe(amount: number, currency: string = CURRENCY): number {
  // Convert from cents to euros
  return amount / 100
}
