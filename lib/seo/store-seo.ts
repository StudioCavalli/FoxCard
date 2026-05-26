import { Metadata } from 'next'
import { locales } from '@/lib/i18n/config'

interface StoreSeoData {
  name: string
  description?: string | null
  tagline?: string | null
  logo?: string | null
  bannerImage?: string | null
  slug: string
  publicEmail?: string | null
  publicPhone?: string | null
  publicAddress?: Record<string, string> | null
  socialLinks?: Record<string, string> | null
}

interface ProductSeoData {
  name: string
  description?: string | null
  slug: string
  images: { url: string }[]
  price: number
  compareAtPrice?: number | null
  currency: string
  storeSlug: string
  storeName: string
  category?: string | null
  inStock: boolean
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export function generateStoreMetadata(store: StoreSeoData, locale: string = 'fr'): Metadata {
  const title = store.tagline
    ? `${store.name} - ${store.tagline}`
    : `${store.name} - Boutique en ligne`

  const description = store.description
    || `Découvrez les produits de ${store.name}. Livraison rapide et paiement sécurisé.`

  const ogImage = store.bannerImage || store.logo || '/og-image.png'
  const url = `${BASE_URL}/${locale}/stores/${store.slug}`

  return {
    title,
    description,
    keywords: [store.name, 'boutique', 'e-commerce', 'achat en ligne'],
    authors: [{ name: store.name }],
    openGraph: {
      type: 'website',
      siteName: store.name,
      title,
      description,
      url,
      images: [
        {
          url: ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`,
          width: 1200,
          height: 630,
          alt: store.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`],
    },
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${BASE_URL}/${l}/stores/${store.slug}`])
      ),
    },
  }
}

export function generateProductMetadata(product: ProductSeoData, locale: string = 'fr'): Metadata {
  const title = `${product.name} | ${product.storeName}`
  const description = product.description
    || `Achetez ${product.name} chez ${product.storeName}. Livraison rapide et paiement sécurisé.`

  const ogImage = product.images[0]?.url || '/og-image.png'
  const url = `${BASE_URL}/${locale}/stores/${product.storeSlug}/products/${product.slug}`

  return {
    title,
    description,
    keywords: [product.name, product.storeName, product.category || 'produit', 'achat'],
    openGraph: {
      type: 'website',
      siteName: product.storeName,
      title,
      description,
      url,
      images: [
        {
          url: ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`],
    },
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${BASE_URL}/${l}/stores/${product.storeSlug}/products/${product.slug}`])
      ),
    },
  }
}

export function generateStoreJsonLd(store: StoreSeoData, locale: string = 'fr') {
  const address = store.publicAddress

  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: store.name,
    description: store.description || undefined,
    url: `${BASE_URL}/${locale}/stores/${store.slug}`,
    logo: store.logo ? (store.logo.startsWith('http') ? store.logo : `${BASE_URL}${store.logo}`) : undefined,
    image: store.bannerImage ? (store.bannerImage.startsWith('http') ? store.bannerImage : `${BASE_URL}${store.bannerImage}`) : undefined,
    email: store.publicEmail || undefined,
    telephone: store.publicPhone || undefined,
    address: address ? {
      '@type': 'PostalAddress',
      streetAddress: address.street || undefined,
      addressLocality: address.city || undefined,
      postalCode: address.postalCode || undefined,
      addressCountry: address.country || undefined,
    } : undefined,
    sameAs: store.socialLinks ? Object.values(store.socialLinks).filter(Boolean) : undefined,
  }
}

export function generateProductJsonLd(product: ProductSeoData, locale: string = 'fr') {
  const price = product.price / 100 // Convert from cents

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || undefined,
    image: product.images.map(img => img.url.startsWith('http') ? img.url : `${BASE_URL}${img.url}`),
    url: `${BASE_URL}/${locale}/stores/${product.storeSlug}/products/${product.slug}`,
    brand: {
      '@type': 'Brand',
      name: product.storeName,
    },
    offers: {
      '@type': 'Offer',
      url: `${BASE_URL}/${locale}/stores/${product.storeSlug}/products/${product.slug}`,
      priceCurrency: product.currency,
      price: price.toFixed(2),
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      ...(product.compareAtPrice && product.compareAtPrice > product.price ? {
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      } : {}),
    },
    category: product.category || undefined,
  }
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
