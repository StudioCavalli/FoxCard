import type { Metadata } from 'next'
import { type Locale } from '@/lib/i18n/config'
import { getSeoTranslations, getAlternateLinks } from '@/lib/i18n/seo'
import { getPlatformSettings } from '@/lib/platform/settings'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const settings = await getPlatformSettings()
  const platformName = settings.platformName || 'GoldenEra Marketplace'
  const platformUrl = settings.platformUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const seo = getSeoTranslations(locale as Locale)

  return {
    title: seo.products.title,
    description: seo.products.description,
    keywords: seo.keywords.products.split(', '),
    openGraph: {
      type: 'website',
      siteName: platformName,
      title: `${seo.products.title} | ${platformName}`,
      description: seo.products.description,
      url: `${platformUrl}/${locale}/products`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${seo.products.title} | ${platformName}`,
      description: seo.products.description,
    },
    alternates: {
      canonical: `${platformUrl}/${locale}/products`,
      languages: getAlternateLinks('/products', platformUrl),
    },
  }
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
