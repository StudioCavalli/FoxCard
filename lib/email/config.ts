import nodemailer from 'nodemailer'

/**
 * Email Provider Types
 * Supports SMTP, SendGrid, and Resend
 */
export type EmailProvider = 'smtp' | 'sendgrid' | 'resend'

// Provider Configuration from environment variables
const EMAIL_PROVIDER = (process.env.EMAIL_PROVIDER || 'smtp') as EmailProvider

// SMTP Configuration
const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASSWORD = process.env.SMTP_PASSWORD

// SendGrid Configuration
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY

// Resend Configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY

// Common Configuration
const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || 'noreply@foxcard.com'
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || 'FoxCard'

// Validate configuration based on provider
function validateConfig(): boolean {
  switch (EMAIL_PROVIDER) {
    case 'sendgrid':
      if (!SENDGRID_API_KEY) {
        console.warn('⚠️  SENDGRID_API_KEY not defined - email features will be disabled')
        return false
      }
      return true

    case 'resend':
      if (!RESEND_API_KEY) {
        console.warn('⚠️  RESEND_API_KEY not defined - email features will be disabled')
        return false
      }
      return true

    case 'smtp':
    default:
      if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
        console.warn('⚠️  SMTP credentials not defined - email features will be disabled')
        return false
      }
      return true
  }
}

// Check configuration on startup
const isConfigured = validateConfig()

/**
 * Create nodemailer transporter based on configured provider
 */
export const createTransporter = () => {
  if (!isConfigured) {
    return null
  }

  switch (EMAIL_PROVIDER) {
    case 'sendgrid':
      // SendGrid SMTP
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: SENDGRID_API_KEY!,
        },
      })

    case 'resend':
      // Resend SMTP
      return nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: {
          user: 'resend',
          pass: RESEND_API_KEY!,
        },
      })

    case 'smtp':
    default:
      // Custom SMTP
      return nodemailer.createTransport({
        host: SMTP_HOST!,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
          user: SMTP_USER!,
          pass: SMTP_PASSWORD!,
        },
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production',
        },
      })
  }
}

/**
 * Get the transporter instance (singleton)
 */
let transporter: ReturnType<typeof createTransporter> | null = null
export const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter()
  }
  return transporter
}

/**
 * Default "from" address
 */
export const getFromAddress = () => {
  return {
    name: SMTP_FROM_NAME,
    address: SMTP_FROM_EMAIL,
  }
}

/**
 * Get current email provider
 */
export function getEmailProvider(): EmailProvider {
  return EMAIL_PROVIDER
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return isConfigured && getTransporter() !== null
}

/**
 * Get provider-specific configuration info
 */
export function getProviderInfo() {
  return {
    provider: EMAIL_PROVIDER,
    configured: isConfigured,
    fromEmail: SMTP_FROM_EMAIL,
    fromName: SMTP_FROM_NAME,
    // Don't expose sensitive keys
    config: EMAIL_PROVIDER === 'smtp' ? {
      host: SMTP_HOST,
      port: SMTP_PORT,
      user: SMTP_USER,
    } : {
      provider: EMAIL_PROVIDER,
    }
  }
}

/**
 * Verify email connection
 */
export async function verifyEmailConnection(): Promise<boolean> {
  const transporter = getTransporter()

  if (!transporter) {
    return false
  }

  try {
    await transporter.verify()
    console.log(`✅ Email connection verified successfully (Provider: ${EMAIL_PROVIDER})`)
    return true
  } catch (error) {
    console.error(`❌ Email connection failed (Provider: ${EMAIL_PROVIDER}):`, error)
    return false
  }
}
