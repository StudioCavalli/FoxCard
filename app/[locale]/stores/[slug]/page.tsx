import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { generateStoreMetadata, generateStoreJsonLd, generateBreadcrumbJsonLd } from '@/lib/seo/store-seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { StoreHomepageClient } from './StoreHomepageClient'

interface PageProps {
  params: Promise<{
    locale: string
    slug: string
  }>
}

async function getStore(slug: string) {
  const store = await prisma.store.findUnique({
    where: { slug },
    include: {
      categories: {
        where: { parentId: null },
        include: {
          _count: {
            select: { products: true }
          }
        }
      }
    }
  })
  return store
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const store = await getStore(slug)

  if (!store) {
    return {
      title: 'Boutique introuvable',
      description: 'La boutique que vous recherchez n\'existe pas.'
    }
  }

  return generateStoreMetadata({
    name: store.name,
    description: store.description,
    tagline: store.tagline,
    logo: store.logo,
    bannerImage: store.bannerImage,
    slug: store.slug,
    publicEmail: store.publicEmail,
    publicPhone: store.publicPhone,
    publicAddress: store.publicAddress as Record<string, string> | null,
    socialLinks: store.socialLinks as Record<string, string> | null,
  }, locale)
}

export default async function StoreHomepage({ params }: PageProps) {
  const { locale, slug } = await params
  const store = await getStore(slug)

  if (!store) {
    notFound()
  }

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Generate structured data
  const storeJsonLd = generateStoreJsonLd({
    name: store.name,
    description: store.description,
    tagline: store.tagline,
    logo: store.logo,
    bannerImage: store.bannerImage,
    slug: store.slug,
    publicEmail: store.publicEmail,
    publicPhone: store.publicPhone,
    publicAddress: store.publicAddress as Record<string, string> | null,
    socialLinks: store.socialLinks as Record<string, string> | null,
  }, locale)

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Accueil', url: `${BASE_URL}/${locale}` },
    { name: 'Boutiques', url: `${BASE_URL}/${locale}/stores` },
    { name: store.name, url: `${BASE_URL}/${locale}/stores/${slug}` },
  ])

  return (
    <>
      <JsonLd data={storeJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <StoreHomepageClient slug={slug} />
    </>
  )
}
