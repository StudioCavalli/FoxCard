import { PayPalHttpClient, core } from '@paypal/paypal-server-sdk'

// PayPal is optional - only required if you want to use PayPal payment features
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox' // 'sandbox' or 'live'

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  console.warn('⚠️  PayPal credentials not defined - PayPal payment features will be disabled')
}

// Initialize PayPal client
export const paypalClient = PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET
  ? new PayPalHttpClient({
      clientCredentialsAuthCredentials: {
        oAuthClientId: PAYPAL_CLIENT_ID,
        oAuthClientSecret: PAYPAL_CLIENT_SECRET,
      },
      environment: PAYPAL_MODE === 'live' ? core.Environment.Production : core.Environment.Sandbox,
      logging: {
        logLevel: core.LogLevel.Info,
        logRequest: {
          logBody: true,
        },
        logResponse: {
          logHeaders: true,
        },
      },
    })
  : null

export const PAYPAL_CURRENCY = 'EUR'

/**
 * Format amount for PayPal (string with 2 decimal places)
 */
export function formatAmountForPayPal(amount: number): string {
  return amount.toFixed(2)
}

/**
 * Check if PayPal is configured
 */
export function isPayPalConfigured(): boolean {
  return paypalClient !== null
}
