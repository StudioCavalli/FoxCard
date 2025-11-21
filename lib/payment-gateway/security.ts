// PCI DSS Compliance and Security Module for Payment Gateway
import crypto from 'crypto'

// ========================================
// ENCRYPTION & TOKENIZATION
// ========================================

// AES-256-GCM encryption for sensitive data
export function encryptSensitiveData(data: string, key: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv)

  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag().toString('hex')

  // Return IV + AuthTag + EncryptedData
  return `${iv.toString('hex')}:${authTag}:${encrypted}`
}

export function decryptSensitiveData(encryptedData: string, key: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':')

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(key, 'hex'),
    Buffer.from(ivHex, 'hex')
  )

  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

// Generate secure token for card data
export function generateSecureToken(): string {
  return `tok_${crypto.randomBytes(24).toString('base64url')}`
}

// Hash card number for fingerprinting (cannot be reversed)
export function hashCardNumber(cardNumber: string): string {
  return crypto
    .createHash('sha256')
    .update(cardNumber + process.env.CARD_HASH_SALT)
    .digest('hex')
}

// ========================================
// INPUT VALIDATION & SANITIZATION
// ========================================

// Validate card number format
export function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\D/g, '')

  // Check length (13-19 digits)
  if (cleaned.length < 13 || cleaned.length > 19) return false

  // Luhn algorithm
  let sum = 0
  let isEven = false

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i])

    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

// Validate CVV
export function validateCVV(cvv: string, cardBrand: string): boolean {
  const cleaned = cvv.replace(/\D/g, '')

  // AMEX has 4 digits, others have 3
  if (cardBrand === 'AMEX') {
    return cleaned.length === 4
  }

  return cleaned.length === 3
}

// Validate expiry date
export function validateExpiry(month: number, year: number): boolean {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  if (month < 1 || month > 12) return false
  if (year < currentYear) return false
  if (year === currentYear && month < currentMonth) return false

  return true
}

// Sanitize input to prevent injection
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/['";]/g, '') // Remove quotes that could be SQL injection
    .trim()
}

// ========================================
// FRAUD DETECTION
// ========================================

export interface FraudCheckParams {
  amount: number
  currency: string
  ipAddress?: string
  cardCountry?: string
  billingCountry?: string
  email?: string
  deviceFingerprint?: string
  isNewCard: boolean
  transactionCount24h: number
  transactionAmountTotal24h: number
  failedAttempts24h: number
}

export interface FraudCheckResult {
  score: number
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  flags: string[]
  requiresReview: boolean
  blocked: boolean
}

export function performFraudCheck(params: FraudCheckParams): FraudCheckResult {
  let score = 0
  const flags: string[] = []

  // Amount checks
  if (params.amount > 100000) { // >1000€
    score += 25
    flags.push('HIGH_AMOUNT')
  } else if (params.amount > 50000) { // >500€
    score += 15
    flags.push('ELEVATED_AMOUNT')
  }

  // Velocity checks
  if (params.transactionCount24h > 10) {
    score += 30
    flags.push('EXTREME_VELOCITY')
  } else if (params.transactionCount24h > 5) {
    score += 20
    flags.push('HIGH_VELOCITY')
  } else if (params.transactionCount24h > 3) {
    score += 10
    flags.push('ELEVATED_VELOCITY')
  }

  // Failed attempts
  if (params.failedAttempts24h > 5) {
    score += 25
    flags.push('MULTIPLE_FAILURES')
  } else if (params.failedAttempts24h > 2) {
    score += 10
    flags.push('RECENT_FAILURES')
  }

  // Country mismatch
  if (params.cardCountry && params.billingCountry &&
      params.cardCountry !== params.billingCountry) {
    score += 20
    flags.push('COUNTRY_MISMATCH')
  }

  // New card risk
  if (params.isNewCard) {
    score += 10
    flags.push('NEW_CARD')
  }

  // Missing device fingerprint
  if (!params.deviceFingerprint) {
    score += 5
    flags.push('NO_DEVICE_FINGERPRINT')
  }

  // Determine level
  let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  if (score >= 70) level = 'CRITICAL'
  else if (score >= 50) level = 'HIGH'
  else if (score >= 30) level = 'MEDIUM'
  else level = 'LOW'

  return {
    score: Math.min(score, 100),
    level,
    flags,
    requiresReview: level === 'HIGH',
    blocked: level === 'CRITICAL'
  }
}

// ========================================
// RATE LIMITING
// ========================================

interface RateLimitConfig {
  windowMs: number      // Time window in milliseconds
  maxRequests: number   // Max requests per window
}

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(key: string, config: RateLimitConfig): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetAt < now) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs
    })
    return true
  }

  if (entry.count >= config.maxRequests) {
    return false
  }

  entry.count++
  return true
}

// Default rate limit configs
export const RATE_LIMITS = {
  // 5 payment attempts per minute per IP
  paymentAttempt: {
    windowMs: 60000,
    maxRequests: 5
  },
  // 3 card tokenization per hour per customer
  cardTokenization: {
    windowMs: 3600000,
    maxRequests: 3
  },
  // 10 API calls per second
  apiCall: {
    windowMs: 1000,
    maxRequests: 10
  }
}

// ========================================
// AUDIT LOGGING
// ========================================

export interface AuditLogEntry {
  timestamp: Date
  action: string
  actorType: 'customer' | 'admin' | 'system'
  actorId?: string
  resourceType: string
  resourceId?: string
  details: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  success: boolean
  errorMessage?: string
}

export function createAuditLogEntry(entry: Omit<AuditLogEntry, 'timestamp'>): AuditLogEntry {
  return {
    ...entry,
    timestamp: new Date()
  }
}

// Mask sensitive data for logging
export function maskSensitiveData(data: Record<string, unknown>): Record<string, unknown> {
  const masked = { ...data }

  const sensitiveKeys = ['cardNumber', 'cvv', 'password', 'secret', 'token', 'key']

  for (const key of Object.keys(masked)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      const value = masked[key]
      if (typeof value === 'string') {
        if (key.toLowerCase().includes('cardnumber')) {
          // Show last 4 digits
          masked[key] = '****' + value.slice(-4)
        } else {
          // Full mask
          masked[key] = '********'
        }
      }
    }
  }

  return masked
}

// ========================================
// PCI DSS COMPLIANCE HELPERS
// ========================================

// Check if environment is PCI compliant
export function checkPCICompliance(): {
  compliant: boolean
  issues: string[]
} {
  const issues: string[] = []

  // Check for HTTPS
  if (process.env.NODE_ENV === 'production' &&
      !process.env.FORCE_HTTPS) {
    issues.push('HTTPS must be enforced in production')
  }

  // Check encryption key
  if (!process.env.ENCRYPTION_KEY ||
      process.env.ENCRYPTION_KEY.length < 64) {
    issues.push('Encryption key must be at least 256 bits')
  }

  // Check card hash salt
  if (!process.env.CARD_HASH_SALT ||
      process.env.CARD_HASH_SALT.length < 32) {
    issues.push('Card hash salt must be at least 128 bits')
  }

  // Check database encryption
  if (process.env.NODE_ENV === 'production' &&
      !process.env.DATABASE_ENCRYPTED) {
    issues.push('Database should use encryption at rest')
  }

  return {
    compliant: issues.length === 0,
    issues
  }
}

// Generate security report
export function generateSecurityReport(): Record<string, unknown> {
  const pciCheck = checkPCICompliance()

  return {
    timestamp: new Date().toISOString(),
    pciCompliance: {
      status: pciCheck.compliant ? 'PASS' : 'FAIL',
      issues: pciCheck.issues
    },
    encryption: {
      algorithm: 'AES-256-GCM',
      keyRotation: 'Manual (recommended: 90 days)'
    },
    tokenization: {
      enabled: true,
      neverStoresPAN: true
    },
    networkSecurity: {
      tlsVersion: 'TLS 1.2+',
      httpsEnforced: !!process.env.FORCE_HTTPS
    },
    accessControl: {
      rateLimitingEnabled: true,
      auditLogging: true
    },
    dataRetention: {
      transactionLogs: '7 years',
      cardTokens: 'Until deleted by customer'
    }
  }
}

// ========================================
// 3D SECURE HELPERS
// ========================================

export interface ThreeDSConfig {
  enabled: boolean
  version: '1.0' | '2.0'
  threshold?: number // Amount threshold for 3DS
}

export function shouldRequire3DS(
  amount: number,
  config: ThreeDSConfig,
  riskLevel: string
): boolean {
  if (!config.enabled) return false

  // Always require for high risk
  if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') return true

  // Check threshold
  if (config.threshold && amount >= config.threshold) return true

  // Default: require for amounts > 30€
  return amount > 3000
}

// ========================================
// IP & GEOLOCATION
// ========================================

// List of high-risk countries (example)
export const HIGH_RISK_COUNTRIES: string[] = [
  // Add countries based on fraud patterns
]

export function isHighRiskCountry(countryCode: string): boolean {
  return HIGH_RISK_COUNTRIES.includes(countryCode.toUpperCase())
}

// Check if IP is from TOR or VPN (simplified)
export function isSuspiciousIP(ipAddress: string): boolean {
  // In production, use a service like MaxMind or IPQualityScore
  // This is a simplified check

  // Check for localhost/private IPs
  if (ipAddress.startsWith('127.') ||
      ipAddress.startsWith('10.') ||
      ipAddress.startsWith('192.168.') ||
      ipAddress.startsWith('172.')) {
    return true
  }

  return false
}

// ========================================
// BIN (Bank Identification Number) CHECKS
// ========================================

export function extractBIN(cardNumber: string): string {
  return cardNumber.replace(/\D/g, '').substring(0, 6)
}

export function getCardBrandFromBIN(bin: string): string {
  // Visa
  if (/^4/.test(bin)) return 'VISA'

  // Mastercard
  if (/^5[1-5]/.test(bin) || /^2[2-7]/.test(bin)) return 'MASTERCARD'

  // AMEX
  if (/^3[47]/.test(bin)) return 'AMEX'

  // Discover
  if (/^6(?:011|5)/.test(bin)) return 'DISCOVER'

  // Diners Club
  if (/^3(?:0[0-5]|[68])/.test(bin)) return 'DINERS'

  // JCB
  if (/^35/.test(bin)) return 'JCB'

  // UnionPay
  if (/^62/.test(bin)) return 'UNIONPAY'

  return 'UNKNOWN'
}

// Check if BIN is in blocklist
export function isBINBlocked(bin: string, blockedBins: string[]): boolean {
  return blockedBins.some(blocked => bin.startsWith(blocked))
}
