/**
 * Age Verification System for Alcohol Products
 * Manages age verification state and restricted countries
 */

// Countries where alcohol sales are prohibited
export const ALCOHOL_RESTRICTED_COUNTRIES = [
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'IR', name: 'Iran' },
  { code: 'AF', name: 'Afghanistan' },
  { code: 'LY', name: 'Libya' },
  { code: 'SD', name: 'Sudan' },
  { code: 'YE', name: 'Yemen' },
  { code: 'BN', name: 'Brunei' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'MV', name: 'Maldives' },
  { code: 'SO', name: 'Somalia' },
]

export const ALCOHOL_RESTRICTED_COUNTRY_CODES = ALCOHOL_RESTRICTED_COUNTRIES.map(c => c.code)

// Legal mentions (French)
export const ALCOHOL_LEGAL_MENTIONS = {
  abuse_warning: "L'abus d'alcool est dangereux pour la santé",
  moderation: "À consommer avec modération",
  minors_sale: "La vente d'alcool est interdite aux mineurs",
  minors_age: "Interdit aux moins de 18 ans",
}

// Minimum age for alcohol purchase
export const ALCOHOL_MINIMUM_AGE = 18

// Cookie/session key for age verification
export const AGE_VERIFICATION_KEY = 'foxcard_age_verified'
export const AGE_VERIFICATION_DURATION = 24 * 60 * 60 * 1000 // 24 hours in ms

/**
 * Check if a country allows alcohol sales
 */
export function isCountryAlcoholRestricted(countryCode: string): boolean {
  return ALCOHOL_RESTRICTED_COUNTRY_CODES.includes(countryCode.toUpperCase())
}

/**
 * Get age verification status from localStorage
 */
export function getAgeVerificationStatus(): {
  verified: boolean
  timestamp: number | null
} {
  if (typeof window === 'undefined') {
    return { verified: false, timestamp: null }
  }

  const stored = localStorage.getItem(AGE_VERIFICATION_KEY)
  if (!stored) {
    return { verified: false, timestamp: null }
  }

  try {
    const data = JSON.parse(stored)
    const timestamp = data.timestamp
    const now = Date.now()

    // Check if verification has expired
    if (now - timestamp > AGE_VERIFICATION_DURATION) {
      localStorage.removeItem(AGE_VERIFICATION_KEY)
      return { verified: false, timestamp: null }
    }

    return { verified: true, timestamp }
  } catch {
    return { verified: false, timestamp: null }
  }
}

/**
 * Set age verification status
 */
export function setAgeVerificationStatus(verified: boolean): void {
  if (typeof window === 'undefined') return

  if (verified) {
    localStorage.setItem(
      AGE_VERIFICATION_KEY,
      JSON.stringify({
        verified: true,
        timestamp: Date.now(),
      })
    )
  } else {
    localStorage.removeItem(AGE_VERIFICATION_KEY)
  }
}

/**
 * Clear age verification status
 */
export function clearAgeVerificationStatus(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(AGE_VERIFICATION_KEY)
}
