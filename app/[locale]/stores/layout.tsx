import type { Metadata } from 'next'
import { type Locale } from '@/lib/i18n/config'
import { getSeoTranslations, getAlternateLinks } from '@/lib/i18n/seo'
import { getPlatformSettings } from '@/lib/platform/settings'

const storesDirectoryTitles: Record<string, { title: string; description: string }> = {
  fr: {
    title: 'Boutiques',
    description: 'Explorez toutes les boutiques de notre marketplace',
  },
  en: {
    title: 'Stores',
    description: 'Explore all stores on our marketplace',
  },
  de: {
    title: 'Shops',
    description: 'Entdecken Sie alle Shops auf unserem Marktplatz',
  },
  es: {
    title: 'Tiendas',
    description: 'Explora todas las tiendas de nuestro marketplace',
  },
  sk: {
    title: 'Obchody',
    description: 'Preskumajte vsetky obchody na nasom trhovisku',
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const settings = await getPlatformSettings()
  const platformName = settings.platformName || 'GoldenEra Marketplace'
  const platformUrl = settings.platformUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const t = storesDirectoryTitles[locale] || storesDirectoryTitles.en

  return {
    title: t.title,
    description: t.description,
    openGraph: {
      type: 'website',
      siteName: platformName,
      title: `${t.title} | ${platformName}`,
      description: t.description,
      url: `${platformUrl}/${locale}/stores`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${t.title} | ${platformName}`,
      description: t.description,
    },
    alternates: {
      canonical: `${platformUrl}/${locale}/stores`,
      languages: getAlternateLinks('/stores', platformUrl),
    },
  }
}

export default function StoresLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
