import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { getPlatformSettings } from '@/lib/platform/settings'
import { getSeoTranslations } from '@/lib/i18n/seo'
import { type Locale } from '@/lib/i18n/config'
import { formatPrice } from '@/lib/utils'
import HomeClient from './HomeClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const settings = await getPlatformSettings()
  const platformName = settings.platformName || 'GoldenEra Marketplace'
  const seo = getSeoTranslations(locale as Locale)

  return {
    title: `${platformName} - ${seo.home.title}`,
    description: seo.home.description,
    openGraph: {
      title: `${platformName} - ${seo.home.ogTitle}`,
      description: seo.home.ogDescription,
    },
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale })
  const settings = await getPlatformSettings()
  const platformName = settings.platformName || 'GoldenEra Marketplace'

  // Fetch public active stores server-side
  const stores = await prisma.store.findMany({
    where: {
      status: 'ACTIVE',
      showOnDirectory: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      description: true,
    },
    orderBy: { name: 'asc' },
  })

  const firstStore = stores[0] ?? null

  // Fetch categories server-side (for the first/default store, or all stores)
  const categories = await prisma.category.findMany({
    where: firstStore ? { storeId: firstStore.id } : {},
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  // Fetch active products server-side (first page)
  const products = await prisma.product.findMany({
    take: 12,
    where: {
      ...(firstStore && { storeId: firstStore.id }),
      status: 'ACTIVE',
      store: {
        status: 'ACTIVE',
      },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      variants: true,
      store: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
        },
      },
    },
  })

  // Serialize data for the client component (strip Prisma-specific types, convert Dates etc.)
  const serializedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    images: p.images,
    thumbnail: p.thumbnail,
    quantity: p.quantity,
    tags: p.tags,
    store: p.store
      ? {
          id: p.store.id,
          name: p.store.name,
          slug: p.store.slug,
          logo: p.store.logo,
        }
      : null,
  }))

  const serializedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    _count: c._count,
  }))

  return (
    <>
      {/* SSR-rendered content for crawlers -- visible even without JavaScript */}
      <div className="sr-only" aria-hidden="false">
        <h1>{t('home.welcome')} {platformName}</h1>
        <p>{t('home.subtitle')}</p>

        {serializedCategories.length > 0 && (
          <section>
            <h2>{t('home.popularCategories')}</h2>
            <ul>
              {serializedCategories.slice(0, 8).map((cat) => (
                <li key={cat.id}>
                  <a href={`/${locale}/categories/${cat.slug}`}>{cat.name}</a>
                  {cat._count?.products !== undefined && (
                    <span> ({cat._count.products} products)</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {serializedProducts.length > 0 && (
          <section>
            <h2>{t('home.featuredProducts')}</h2>
            <ul>
              {serializedProducts.map((product) => (
                <li key={product.id}>
                  <a href={`/${locale}/products/${product.slug}`}>
                    {product.name} - {formatPrice(product.price)}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Interactive client component receives server-fetched data */}
      <HomeClient
        initialProducts={serializedProducts}
        initialCategories={serializedCategories}
        initialStoreSlug={firstStore?.slug ?? null}
      />
    </>
  )
}
