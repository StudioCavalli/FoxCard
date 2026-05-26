import type { Metadata } from 'next'
import { type Locale } from '@/lib/i18n/config'
import { getSeoTranslations } from '@/lib/i18n/seo'
import { getPlatformSettings } from '@/lib/platform/settings'

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
    title: seo.cart.title,
    description: seo.cart.description,
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default function CartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
