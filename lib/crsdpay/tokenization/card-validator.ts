/**
 * Card Validator - Validation des données de carte
 * PCI DSS Compliant - Ne stocke jamais les données de carte
 */

import { CardBrand, RawCardData } from '../types'

/**
 * Algorithme de Luhn pour valider un numéro de carte
 */
export function validateLuhn(cardNumber: string): boolean {
  const sanitized = cardNumber.replace(/\s/g, '')

  if (!/^\d+$/.test(sanitized)) {
    return false
  }

  let sum = 0
  let isEven = false

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized[i], 10)

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

/**
 * Détecte la marque de la carte à partir du numéro
 */
export function detectCardBrand(cardNumber: string): CardBrand {
  const sanitized = cardNumber.replace(/\s/g, '')

  // Visa: commence par 4
  if (/^4/.test(sanitized)) {
    return 'visa'
  }

  // Mastercard: 51-55 ou 2221-2720
  if (/^5[1-5]/.test(sanitized) || /^2(22[1-9]|2[3-9][0-9]|[3-6][0-9]{2}|7[0-1][0-9]|720)/.test(sanitized)) {
    return 'mastercard'
  }

  // American Express: commence par 34 ou 37
  if (/^3[47]/.test(sanitized)) {
    return 'amex'
  }

  // Discover: 6011, 622126-622925, 644-649, 65
  if (/^(6011|65|64[4-9]|622)/.test(sanitized)) {
    return 'discover'
  }

  // Diners Club: 36, 38, 300-305
  if (/^(36|38|30[0-5])/.test(sanitized)) {
    return 'diners'
  }

  // JCB: 3528-3589
  if (/^35(2[89]|[3-8][0-9])/.test(sanitized)) {
    return 'jcb'
  }

  // UnionPay: 62
  if (/^62/.test(sanitized)) {
    return 'unionpay'
  }

  return 'visa' // Default fallback
}

/**
 * Valide le format du numéro de carte
 */
export function validateCardNumber(cardNumber: string): boolean {
  const sanitized = cardNumber.replace(/\s/g, '')

  // Doit être entre 12 et 19 chiffres
  if (sanitized.length < 12 || sanitized.length > 19) {
    return false
  }

  return validateLuhn(sanitized)
}

/**
 * Valide la date d'expiration
 */
export function validateExpiry(month: number, year: number): boolean {
  if (month < 1 || month > 12) {
    return false
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  // Si l'année est au format YY, convertir en YYYY
  let fullYear = year
  if (year < 100) {
    fullYear = 2000 + year
  }

  // Vérifier que la carte n'est pas expirée
  if (fullYear < currentYear) {
    return false
  }

  if (fullYear === currentYear && month < currentMonth) {
    return false
  }

  // Vérifier que l'expiration n'est pas trop loin dans le futur (20 ans max)
  if (fullYear > currentYear + 20) {
    return false
  }

  return true
}

/**
 * Valide le CVC
 */
export function validateCVC(cvc: string, brand?: CardBrand): boolean {
  const sanitized = cvc.replace(/\s/g, '')

  // Doit être numérique
  if (!/^\d+$/.test(sanitized)) {
    return false
  }

  // American Express utilise 4 chiffres, les autres 3
  if (brand === 'amex') {
    return sanitized.length === 4
  }

  return sanitized.length === 3
}

/**
 * Valide toutes les données de carte
 */
export function validateCard(cardData: RawCardData): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Valider le numéro de carte
  if (!validateCardNumber(cardData.number)) {
    errors.push('invalid_card_number')
  }

  // Valider l'expiration
  if (!validateExpiry(cardData.expMonth, cardData.expYear)) {
    errors.push('invalid_expiry')
  }

  // Détecter la marque pour valider le CVC
  const brand = detectCardBrand(cardData.number)
  if (!validateCVC(cardData.cvc, brand)) {
    errors.push('invalid_cvc')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Génère une empreinte unique pour une carte (pour détecter les doublons)
 */
export function generateCardFingerprint(cardNumber: string, expMonth: number, expYear: number): string {
  const sanitized = cardNumber.replace(/\s/g, '')
  const crypto = require('crypto')

  const data = `${sanitized}-${expMonth}-${expYear}`
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex')
}

/**
 * Extrait les 4 derniers chiffres de la carte
 */
export function getLast4(cardNumber: string): string {
  const sanitized = cardNumber.replace(/\s/g, '')
  return sanitized.slice(-4)
}

/**
 * Masque le numéro de carte pour l'affichage
 */
export function maskCardNumber(cardNumber: string): string {
  const sanitized = cardNumber.replace(/\s/g, '')
  const last4 = getLast4(sanitized)
  const brand = detectCardBrand(sanitized)

  return `•••• •••• •••• ${last4}`
}
