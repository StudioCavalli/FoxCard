import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { locales } from '@/lib/i18n/config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  let stores: Array<{ id: string; slug: string; updatedAt: Date }> = []
  let products: Array<{ slug: string; updatedAt: Date }> = []
  let categories: Array<{ slug: string; updatedAt: Date }> = []

  try {
    // Fetch all active stores
    stores = await prisma.store.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        slug: true,
        updatedAt: true,
      },
    })

    // Fetch all active products across all active stores
    const storeIds = stores.map((s) => s.id)

    if (storeIds.length > 0) {
      products = await prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          storeId: { in: storeIds },
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      })

      categories = await prisma.category.findMany({
        where: {
          storeId: { in: storeIds },
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      })
    }
  } catch (error) {
    // Fallback: if DB is not accessible during build (e.g., on Vercel),
    // return minimal sitemap. The sitemap will be complete at runtime.
    console.warn('Failed to fetch data for sitemap:', error)
  }

  function buildAlternateLanguages(path: string): Record<string, string> {
    const languages: Record<string, string> = {}
    for (const locale of locales) {
      languages[locale] = `${baseUrl}/${locale}${path}`
    }
    return languages
  }

  // Static pages with locale prefixes
  const staticPages = ['', '/stores', '/explore', '/about', '/categories']
  const staticUrls = staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: page === '' ? 1 : 0.9,
      alternates: {
        languages: buildAlternateLanguages(page),
      },
    }))
  )

  // Product URLs with locale prefixes
  const productUrls = products.flatMap((product) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.8,
      alternates: {
        languages: buildAlternateLanguages(`/products/${product.slug}`),
      },
    }))
  )

  // Category URLs with locale prefixes
  const categoryUrls = categories.flatMap((category) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/categories/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: {
        languages: buildAlternateLanguages(`/categories/${category.slug}`),
      },
    }))
  )

  // Products listing page with locale prefixes
  const productsListingUrls = locales.map((locale) => ({
    url: `${baseUrl}/${locale}/products`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
    alternates: {
      languages: buildAlternateLanguages('/products'),
    },
  }))

  return [
    ...staticUrls,
    ...productsListingUrls,
    ...productUrls,
    ...categoryUrls,
  ]
}
