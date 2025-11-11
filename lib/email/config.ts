import nodemailer from 'nodemailer'

// SMTP Configuration from environment variables
const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASSWORD = process.env.SMTP_PASSWORD
const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || 'noreply@foxcard.com'
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || 'FoxCard'

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
  console.warn('⚠️  SMTP credentials not defined - email features will be disabled')
}

/**
 * Create nodemailer transporter
 */
export const createTransporter = () => {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    return null
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
    tls: {
      // Do not fail on invalid certs (useful for development)
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  })
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
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return getTransporter() !== null
}

/**
 * Verify SMTP connection
 */
export async function verifyEmailConnection(): Promise<boolean> {
  const transporter = getTransporter()

  if (!transporter) {
    return false
  }

  try {
    await transporter.verify()
    console.log('✅ SMTP connection verified successfully')
    return true
  } catch (error) {
    console.error('❌ SMTP connection failed:', error)
    return false
  }
}
