import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { generateProductMetadata, generateProductJsonLd, generateBreadcrumbJsonLd } from '@/lib/seo/store-seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { ProductDetailClient } from './ProductDetailClient'

interface PageProps {
  params: Promise<{
    locale: string
    slug: string
  }>
}

async function getProduct(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, status: 'ACTIVE' },
    include: {
      store: true,
      category: true,
    },
  })
  return product
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    return {
      title: 'Produit introuvable',
      description: 'Le produit que vous recherchez n\'existe pas.',
    }
  }

  return generateProductMetadata(
    {
      name: product.name,
      description: product.description,
      slug: product.slug,
      images: product.images.map((url) => ({ url })),
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      currency: 'EUR',
      storeSlug: product.store.slug,
      storeName: product.store.name,
      category: product.category?.name,
      inStock: product.quantity > 0,
    },
    locale
  )
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { locale, slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    return <ProductDetailClient slug={slug} />
  }

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Generate structured data
  const productJsonLd = generateProductJsonLd(
    {
      name: product.name,
      description: product.description,
      slug: product.slug,
      images: product.images.map((url) => ({ url })),
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      currency: 'EUR',
      storeSlug: product.store.slug,
      storeName: product.store.name,
      category: product.category?.name,
      inStock: product.quantity > 0,
    },
    locale
  )

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Accueil', url: `${BASE_URL}/${locale}` },
    { name: 'Produits', url: `${BASE_URL}/${locale}/products` },
    ...(product.category
      ? [{ name: product.category.name, url: `${BASE_URL}/${locale}/products?category=${product.category.id}` }]
      : []),
    { name: product.name, url: `${BASE_URL}/${locale}/products/${slug}` },
  ])

  return (
    <>
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <ProductDetailClient slug={slug} initialStoreId={product.storeId} />
    </>
  )
}
