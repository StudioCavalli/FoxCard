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
    title: seo.categories.title,
    description: seo.categories.description,
    keywords: seo.keywords.categories.split(', '),
    openGraph: {
      type: 'website',
      siteName: platformName,
      title: `${seo.categories.title} | ${platformName}`,
      description: seo.categories.description,
      url: `${platformUrl}/${locale}/categories`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${seo.categories.title} | ${platformName}`,
      description: seo.categories.description,
    },
    alternates: {
      canonical: `${platformUrl}/${locale}/categories`,
      languages: getAlternateLinks('/categories', platformUrl),
    },
  }
}

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
