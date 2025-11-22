/**
 * SEO Internationalization Utilities
 * Load and format SEO metadata by locale
 */

import { type Locale, defaultLocale } from './config'
import type { Metadata } from 'next'

// Import all message files
import en from '@/messages/en.json'
import fr from '@/messages/fr.json'
import de from '@/messages/de.json'
import es from '@/messages/es.json'
import sk from '@/messages/sk.json'

// Type definitions for SEO translations
type SeoMessages = typeof en.seo

const messages: Record<Locale, SeoMessages> = {
  en: en.seo,
  fr: fr.seo,
  de: de.seo,
  es: es.seo,
  sk: sk.seo,
}

/**
 * Get SEO translations for a specific locale
 */
export function getSeoTranslations(locale: Locale = defaultLocale): SeoMessages {
  return messages[locale] || messages[defaultLocale]
}

/**
 * Replace placeholders in a translation string with values
 */
export function formatSeoString(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = values[key]
    return value !== undefined ? String(value) : match
  })
}

/**
 * Get locale-specific alternate links for SEO
 */
export function getAlternateLinks(
  path: string,
  baseUrl: string
): Record<string, string> {
  const locales: Locale[] = ['en', 'fr', 'de', 'es', 'sk']
  const alternates: Record<string, string> = {}

  for (const locale of locales) {
    alternates[locale] = `${baseUrl}/${locale}${path}`
  }

  return alternates
}

/**
 * Generate home page metadata for a specific locale
 */
export function getHomeMetadata(
  locale: Locale,
  platformName: string,
  platformUrl: string
): Metadata {
  const seo = getSeoTranslations(locale)

  return {
    title: {
      default: `${platformName} - ${seo.home.title}`,
      template: `%s | ${platformName}`,
    },
    description: seo.home.description,
    keywords: seo.keywords.default.split(', '),
    openGraph: {
      type: 'website',
      siteName: platformName,
      title: `${platformName} - ${seo.home.ogTitle}`,
      description: seo.home.ogDescription,
      locale: getOpenGraphLocale(locale),
      alternateLocale: getAlternateOpenGraphLocales(locale),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${platformName} - ${seo.home.ogTitle}`,
      description: seo.home.ogDescription,
    },
    alternates: {
      canonical: `${platformUrl}/${locale}`,
      languages: getAlternateLinks('', platformUrl),
    },
  }
}

/**
 * Generate product page metadata for a specific locale
 */
export function getProductMetadata(
  locale: Locale,
  platformName: string,
  platformUrl: string,
  product: {
    name: string
    description?: string
    image?: string
    price?: number
    currency?: string
  }
): Metadata {
  const seo = getSeoTranslations(locale)

  return {
    title: product.name,
    description: product.description || seo.products.description,
    openGraph: {
      type: 'website',
      siteName: platformName,
      title: product.name,
      description: product.description || seo.products.description,
      locale: getOpenGraphLocale(locale),
      images: product.image
        ? [{ url: product.image, alt: product.name }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description || seo.products.description,
      images: product.image ? [product.image] : undefined,
    },
  }
}

/**
 * Generate store page metadata for a specific locale
 */
export function getStoreMetadata(
  locale: Locale,
  platformName: string,
  platformUrl: string,
  store: {
    name: string
    description?: string
    logo?: string
    slug: string
  }
): Metadata {
  const seo = getSeoTranslations(locale)

  return {
    title: formatSeoString(seo.store.title, { storeName: store.name }),
    description:
      store.description ||
      formatSeoString(seo.store.description, { storeName: store.name }),
    openGraph: {
      type: 'website',
      siteName: platformName,
      title: store.name,
      description:
        store.description ||
        formatSeoString(seo.store.description, { storeName: store.name }),
      locale: getOpenGraphLocale(locale),
      images: store.logo ? [{ url: store.logo, alt: store.name }] : undefined,
    },
    alternates: {
      canonical: `${platformUrl}/${locale}/stores/${store.slug}`,
      languages: getAlternateLinks(`/stores/${store.slug}`, platformUrl),
    },
  }
}

/**
 * Generate category page metadata for a specific locale
 */
export function getCategoryMetadata(
  locale: Locale,
  platformName: string,
  category: {
    name: string
    description?: string
  }
): Metadata {
  const seo = getSeoTranslations(locale)

  return {
    title: category.name,
    description: category.description || seo.categories.description,
    keywords: seo.keywords.categories.split(', '),
    openGraph: {
      type: 'website',
      siteName: platformName,
      title: category.name,
      description: category.description || seo.categories.description,
      locale: getOpenGraphLocale(locale),
    },
  }
}

/**
 * Get OpenGraph locale format
 */
function getOpenGraphLocale(locale: Locale): string {
  const ogLocaleMap: Record<Locale, string> = {
    en: 'en_US',
    fr: 'fr_FR',
    de: 'de_DE',
    es: 'es_ES',
    sk: 'sk_SK',
  }
  return ogLocaleMap[locale]
}

/**
 * Get alternate OpenGraph locales (all except current)
 */
function getAlternateOpenGraphLocales(currentLocale: Locale): string[] {
  const allLocales: Locale[] = ['en', 'fr', 'de', 'es', 'sk']
  return allLocales
    .filter((locale) => locale !== currentLocale)
    .map((locale) => getOpenGraphLocale(locale))
}

/**
 * Generate JSON-LD structured data for a product
 */
export function getProductJsonLd(product: {
  name: string
  description?: string
  image?: string
  price?: number
  currency?: string
  sku?: string
  inStock?: boolean
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'EUR',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: product.url,
    },
  }
}

/**
 * Generate JSON-LD structured data for an organization
 */
export function getOrganizationJsonLd(organization: {
  name: string
  url: string
  logo?: string
  description?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: organization.name,
    url: organization.url,
    logo: organization.logo,
    description: organization.description,
  }
}

/**
 * Generate JSON-LD structured data for a store/local business
 */
export function getStoreJsonLd(store: {
  name: string
  url: string
  logo?: string
  description?: string
  address?: {
    street?: string
    city?: string
    postalCode?: string
    country?: string
  }
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: store.name,
    url: store.url,
    logo: store.logo,
    description: store.description,
    address: store.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: store.address.street,
          addressLocality: store.address.city,
          postalCode: store.address.postalCode,
          addressCountry: store.address.country,
        }
      : undefined,
  }
}

export type { Locale }
