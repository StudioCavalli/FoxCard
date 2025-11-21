import { prisma } from '@/lib/prisma'

// Default platform settings
const defaultSettings = {
  id: 'default',
  platformName: 'FoxCard',
  platformUrl: 'https://foxcard.io',
  supportEmail: 'support@foxcard.io',
  maxStoresPerUser: 5,
  maintenanceMode: false,
  maintenanceMessage: null as string | null,
  defaultCurrency: 'EUR',
  defaultLanguage: 'fr',
  supportedCurrencies: ['EUR', 'USD', 'GBP', 'CHF'],
  supportedLanguages: ['fr', 'en', 'de'],
  allowRegistration: true,
  requireEmailVerification: true,
  sessionTimeout: 30,
  stripeEnabled: false,
  paypalEnabled: false,
  bankTransferEnabled: true,
  smtpHost: null as string | null,
  smtpPort: 587,
  smtpUser: null as string | null,
  smtpPassword: null as string | null,
  smtpFromEmail: null as string | null,
  smtpFromName: null as string | null,
  updatedBy: null as string | null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export type PlatformSettings = typeof defaultSettings

// Cache for settings (5 minutes TTL)
let cachedSettings: PlatformSettings | null = null
let cacheTimestamp: number = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Get platform settings with caching
 * This is used across the application to apply platform-wide settings
 */
export async function getPlatformSettings(): Promise<PlatformSettings> {
  const now = Date.now()

  // Return cached settings if still valid
  if (cachedSettings && now - cacheTimestamp < CACHE_TTL) {
    return cachedSettings
  }

  try {
    // Try to fetch from database
    const settings = await prisma.platformSettings.findFirst()

    if (settings) {
      cachedSettings = settings as PlatformSettings
      cacheTimestamp = now
      return cachedSettings
    }

    // No settings in DB, create default settings
    const newSettings = await prisma.platformSettings.create({
      data: {
        platformName: defaultSettings.platformName,
        platformUrl: defaultSettings.platformUrl,
        supportEmail: defaultSettings.supportEmail,
        maxStoresPerUser: defaultSettings.maxStoresPerUser,
        maintenanceMode: defaultSettings.maintenanceMode,
        defaultCurrency: defaultSettings.defaultCurrency,
        defaultLanguage: defaultSettings.defaultLanguage,
        supportedCurrencies: defaultSettings.supportedCurrencies,
        supportedLanguages: defaultSettings.supportedLanguages,
        allowRegistration: defaultSettings.allowRegistration,
        requireEmailVerification: defaultSettings.requireEmailVerification,
        sessionTimeout: defaultSettings.sessionTimeout,
        stripeEnabled: defaultSettings.stripeEnabled,
        paypalEnabled: defaultSettings.paypalEnabled,
        bankTransferEnabled: defaultSettings.bankTransferEnabled,
      },
    })

    cachedSettings = newSettings as PlatformSettings
    cacheTimestamp = now
    return cachedSettings
  } catch (error) {
    console.error('Error fetching platform settings:', error)
    // Return defaults if DB is unavailable
    return defaultSettings
  }
}

/**
 * Invalidate the settings cache
 * Call this after updating settings
 */
export function invalidateSettingsCache(): void {
  cachedSettings = null
  cacheTimestamp = 0
}

/**
 * Check if maintenance mode is active
 */
export async function isMaintenanceMode(): Promise<{
  active: boolean
  message: string | null
}> {
  const settings = await getPlatformSettings()
  return {
    active: settings.maintenanceMode,
    message: settings.maintenanceMessage,
  }
}

/**
 * Check if registration is allowed
 */
export async function isRegistrationAllowed(): Promise<boolean> {
  const settings = await getPlatformSettings()
  return settings.allowRegistration
}

/**
 * Get supported currencies
 */
export async function getSupportedCurrencies(): Promise<string[]> {
  const settings = await getPlatformSettings()
  return settings.supportedCurrencies
}

/**
 * Get supported languages
 */
export async function getSupportedLanguages(): Promise<string[]> {
  const settings = await getPlatformSettings()
  return settings.supportedLanguages
}

/**
 * Get default currency
 */
export async function getDefaultCurrency(): Promise<string> {
  const settings = await getPlatformSettings()
  return settings.defaultCurrency
}

/**
 * Get default language
 */
export async function getDefaultLanguage(): Promise<string> {
  const settings = await getPlatformSettings()
  return settings.defaultLanguage
}

/**
 * Check if a payment method is enabled
 */
export async function isPaymentMethodEnabled(
  method: 'stripe' | 'paypal' | 'bankTransfer'
): Promise<boolean> {
  const settings = await getPlatformSettings()
  switch (method) {
    case 'stripe':
      return settings.stripeEnabled
    case 'paypal':
      return settings.paypalEnabled
    case 'bankTransfer':
      return settings.bankTransferEnabled
    default:
      return false
  }
}

/**
 * Get max stores per user
 */
export async function getMaxStoresPerUser(): Promise<number> {
  const settings = await getPlatformSettings()
  return settings.maxStoresPerUser
}
