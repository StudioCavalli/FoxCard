/**
 * Email Internationalization Utilities
 * Load and format email translations by locale
 */

import { type Locale, defaultLocale } from '@/lib/i18n/config'
import { formatCurrency, formatDate } from '@/lib/i18n/formatting'

// Import all message files
import en from '@/messages/en.json'
import fr from '@/messages/fr.json'
import de from '@/messages/de.json'
import es from '@/messages/es.json'
import sk from '@/messages/sk.json'

// Type definitions for email translations
type EmailMessages = typeof en.email

const messages: Record<Locale, EmailMessages> = {
  en: en.email,
  fr: fr.email,
  de: de.email,
  es: es.email,
  sk: sk.email,
}

/**
 * Get email translations for a specific locale
 */
export function getEmailTranslations(locale: Locale = defaultLocale): EmailMessages {
  return messages[locale] || messages[defaultLocale]
}

/**
 * Replace placeholders in a translation string with values
 * Supports {placeholder} syntax
 */
export function formatMessage(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = values[key]
    return value !== undefined ? String(value) : match
  })
}

/**
 * Email translation helper class
 * Provides easy access to email translations with formatting
 */
export class EmailTranslator {
  private translations: EmailMessages
  private locale: Locale

  constructor(locale: Locale = defaultLocale) {
    this.locale = locale
    this.translations = getEmailTranslations(locale)
  }

  /**
   * Get a translation by path (e.g., 'orderConfirmation.title')
   */
  get(path: string, values?: Record<string, string | number>): string {
    const keys = path.split('.')
    let result: unknown = this.translations

    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = (result as Record<string, unknown>)[key]
      } else {
        return path // Return path if translation not found
      }
    }

    if (typeof result !== 'string') {
      return path
    }

    return values ? formatMessage(result, values) : result
  }

  /**
   * Get common translations
   */
  common(key: keyof EmailMessages['common'], values?: Record<string, string | number>): string {
    const template = this.translations.common[key]
    return values ? formatMessage(template, values) : template
  }

  /**
   * Format a currency value for the email
   */
  formatCurrency(value: number, currency?: string): string {
    return formatCurrency(value, this.locale, currency)
  }

  /**
   * Format a date for the email
   */
  formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    return formatDate(date, this.locale, options)
  }

  /**
   * Get the current locale
   */
  getLocale(): Locale {
    return this.locale
  }
}

/**
 * Create an email translator instance
 */
export function createEmailTranslator(locale: Locale = defaultLocale): EmailTranslator {
  return new EmailTranslator(locale)
}

/**
 * Helper to get order-related translations
 */
export function getOrderEmailTranslations(locale: Locale = defaultLocale) {
  const t = new EmailTranslator(locale)

  return {
    confirmation: {
      subject: (orderNumber: string) => t.get('orderConfirmation.subject', { orderNumber }),
      title: t.get('orderConfirmation.title'),
      intro: (orderNumber: string, orderDate: string) =>
        t.get('orderConfirmation.intro', { orderNumber, orderDate }),
      orderSummary: t.get('orderConfirmation.orderSummary'),
      quantity: (quantity: number) => t.get('orderConfirmation.quantity', { quantity }),
      subtotal: t.get('orderConfirmation.subtotal'),
      shipping: t.get('orderConfirmation.shipping'),
      tax: t.get('orderConfirmation.tax'),
      discount: t.get('orderConfirmation.discount'),
      total: t.get('orderConfirmation.total'),
      shippingAddress: t.get('orderConfirmation.shippingAddress'),
      trackOrder: t.get('orderConfirmation.trackOrder'),
    },
    shipped: {
      subject: (orderNumber: string) => t.get('orderShipped.subject', { orderNumber }),
      title: t.get('orderShipped.title'),
      intro: (orderNumber: string) => t.get('orderShipped.intro', { orderNumber }),
      trackingNumber: (trackingNumber: string) =>
        t.get('orderShipped.trackingNumber', { trackingNumber }),
      carrier: (carrier: string) => t.get('orderShipped.carrier', { carrier }),
      estimatedDelivery: (date: string) => t.get('orderShipped.estimatedDelivery', { date }),
      trackShipment: t.get('orderShipped.trackShipment'),
    },
    delivered: {
      subject: (orderNumber: string) => t.get('orderDelivered.subject', { orderNumber }),
      title: t.get('orderDelivered.title'),
      intro: (orderNumber: string) => t.get('orderDelivered.intro', { orderNumber }),
      feedback: t.get('orderDelivered.feedback'),
      leaveReview: t.get('orderDelivered.leaveReview'),
    },
    statusUpdate: {
      subject: (orderNumber: string) => t.get('orderStatusUpdate.subject', { orderNumber }),
      title: t.get('orderStatusUpdate.title'),
      intro: (orderNumber: string) => t.get('orderStatusUpdate.intro', { orderNumber }),
      newStatus: (status: string) => t.get('orderStatusUpdate.newStatus', { status }),
      viewOrder: t.get('orderStatusUpdate.viewOrder'),
    },
    invoice: {
      subject: (orderNumber: string) => t.get('orderInvoice.subject', { orderNumber }),
      title: t.get('orderInvoice.title'),
      invoiceNumber: (invoiceNumber: string) =>
        t.get('orderInvoice.invoiceNumber', { invoiceNumber }),
      invoiceDate: (date: string) => t.get('orderInvoice.invoiceDate', { date }),
      billingAddress: t.get('orderInvoice.billingAddress'),
      paymentMethod: t.get('orderInvoice.paymentMethod'),
      downloadPdf: t.get('orderInvoice.downloadPdf'),
    },
    common: {
      hello: (name: string) => t.common('hello', { name }),
      thanks: t.common('thanks'),
      team: (storeName: string) => t.common('team', { storeName }),
      questions: t.common('questions'),
    },
    formatCurrency: (value: number, currency?: string) => t.formatCurrency(value, currency),
    formatDate: (date: Date | string) => t.formatDate(date),
  }
}

/**
 * Helper to get account-related email translations
 */
export function getAccountEmailTranslations(locale: Locale = defaultLocale) {
  const t = new EmailTranslator(locale)

  return {
    welcome: {
      subject: (storeName: string) => t.get('welcome.subject', { storeName }),
      title: (storeName: string) => t.get('welcome.title', { storeName }),
      intro: t.get('welcome.intro'),
      benefits: t.get('welcome.benefits'),
      benefit1: t.get('welcome.benefit1'),
      benefit2: t.get('welcome.benefit2'),
      benefit3: t.get('welcome.benefit3'),
      benefit4: t.get('welcome.benefit4'),
      startShopping: t.get('welcome.startShopping'),
    },
    resetPassword: {
      subject: t.get('resetPassword.subject'),
      title: t.get('resetPassword.title'),
      intro: t.get('resetPassword.intro'),
      resetButton: t.get('resetPassword.resetButton'),
      expiry: (hours: number) => t.get('resetPassword.expiry', { hours }),
      ignore: t.get('resetPassword.ignore'),
    },
    invitation: {
      subject: (storeName: string) => t.get('userInvitation.subject', { storeName }),
      title: t.get('userInvitation.title'),
      intro: (inviterName: string, storeName: string, role: string) =>
        t.get('userInvitation.intro', { inviterName, storeName, role }),
      acceptButton: t.get('userInvitation.acceptButton'),
      expiry: (days: number) => t.get('userInvitation.expiry', { days }),
    },
    common: {
      hello: (name: string) => t.common('hello', { name }),
      thanks: t.common('thanks'),
      team: (storeName: string) => t.common('team', { storeName }),
      questions: t.common('questions'),
    },
  }
}

/**
 * Helper to get newsletter email translations
 */
export function getNewsletterEmailTranslations(locale: Locale = defaultLocale) {
  const t = new EmailTranslator(locale)

  return {
    confirmation: {
      subject: t.get('newsletterConfirmation.subject'),
      title: t.get('newsletterConfirmation.title'),
      intro: t.get('newsletterConfirmation.intro'),
      confirmButton: t.get('newsletterConfirmation.confirmButton'),
      expiry: t.get('newsletterConfirmation.expiry'),
    },
    welcome: {
      subject: t.get('newsletterWelcome.subject'),
      title: t.get('newsletterWelcome.title'),
      intro: t.get('newsletterWelcome.intro'),
      managePreferences: t.get('newsletterWelcome.managePreferences'),
    },
    campaign: {
      readMore: t.get('newsletterCampaign.readMore'),
      shopNow: t.get('newsletterCampaign.shopNow'),
      viewCollection: t.get('newsletterCampaign.viewCollection'),
    },
    common: {
      hello: (name: string) => t.common('hello', { name }),
      thanks: t.common('thanks'),
      team: (storeName: string) => t.common('team', { storeName }),
      questions: t.common('questions'),
      unsubscribe: t.common('unsubscribe'),
    },
  }
}

export type { Locale }
