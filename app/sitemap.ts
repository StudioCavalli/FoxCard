import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  let products: Array<{ slug: string; updatedAt: Date }> = []
  let categories: Array<{ slug: string; updatedAt: Date }> = []

  try {
    // Get all active products
    products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        storeId: '000000000000000000000001', // TODO: Make this dynamic per store
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    // Get all categories
    categories = await prisma.category.findMany({
      where: {
        storeId: '000000000000000000000001', // TODO: Make this dynamic per store
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })
  } catch (error) {
    // Fallback: if DB is not accessible during build (e.g., on Vercel),
    // return minimal sitemap. The sitemap will be complete at runtime.
    console.warn('Failed to fetch data for sitemap:', error)
  }

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  const categoryUrls = categories.map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...productUrls,
    ...categoryUrls,
  ]
}
