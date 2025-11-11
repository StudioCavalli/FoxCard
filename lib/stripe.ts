import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

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
