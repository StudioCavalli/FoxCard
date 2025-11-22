import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, type Locale } from '@/lib/i18n/config'
import { getSeoTranslations, getAlternateLinks } from '@/lib/i18n/seo'
import { TRPCProvider } from '@/lib/trpc/Provider'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { CartDrawerWrapper } from '@/components/cart/CartDrawerWrapper'
import { CurrencyProvider } from '@/lib/currency/CurrencyContext'
import { PublicStoreProvider } from '@/lib/context/public-store-context'
import { PlatformSettingsProvider } from '@/lib/platform/PlatformSettingsProvider'
import { getPlatformSettings } from '@/lib/platform/settings'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#14b8a6' },
    { media: '(prefers-color-scheme: dark)', color: '#14b8a6' },
  ],
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const settings = await getPlatformSettings()
  const platformName = settings.platformName || 'GoldenEra'
  const platformUrl = settings.platformUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Get locale-specific SEO translations
  const seo = getSeoTranslations(locale as Locale)

  return {
    title: {
      default: `${platformName} - ${seo.home.title}`,
      template: `%s | ${platformName}`,
    },
    description: seo.home.description,
    applicationName: platformName,
    keywords: seo.keywords.default.split(', '),
    authors: [{ name: 'Foxcase' }],
    creator: 'Foxcase',
    publisher: 'Foxcase',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(platformUrl),
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: platformName,
    },
    openGraph: {
      type: 'website',
      siteName: platformName,
      title: `${platformName} - ${seo.home.ogTitle}`,
      description: seo.home.ogDescription,
      locale: locale,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${platformName} - ${seo.home.ogTitle}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${platformName} - ${seo.home.ogTitle}`,
      description: seo.home.ogDescription,
      images: ['/og-image.png'],
    },
    icons: {
      icon: [
        { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: '/icon-152x152.png', sizes: '152x152', type: 'image/png' }],
    },
    alternates: {
      canonical: `${platformUrl}/${locale}`,
      languages: getAlternateLinks('', platformUrl),
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  // Await params (Next.js 16 requirement)
  const { locale } = await params

  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound()
  }

  // Get messages for the locale
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <TRPCProvider>
            <PlatformSettingsProvider>
              <PublicStoreProvider>
                <CurrencyProvider>
                  <ThemeProvider>
                    <Header />
                    <main className="min-h-screen bg-theme-background">{children}</main>
                    <Footer />
                    <CartDrawerWrapper />
                  </ThemeProvider>
                </CurrencyProvider>
              </PublicStoreProvider>
            </PlatformSettingsProvider>
          </TRPCProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
