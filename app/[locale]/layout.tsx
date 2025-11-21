import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/lib/i18n/config'
import { TRPCProvider } from '@/lib/trpc/Provider'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { CartDrawerWrapper } from '@/components/cart/CartDrawerWrapper'
import { CurrencyProvider } from '@/lib/currency/CurrencyContext'
import { PublicStoreProvider } from '@/lib/context/public-store-context'
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

export const metadata: Metadata = {
  title: 'FoxCard - E-commerce Open Source',
  description: 'La plateforme e-commerce 100% gratuite et open source. Alternative à Shopify construite avec Next.js, React et TypeScript.',
  applicationName: 'FoxCard',
  keywords: ['e-commerce', 'open source', 'shopify alternative', 'boutique en ligne', 'vente en ligne', 'plateforme e-commerce'],
  authors: [{ name: 'Studio Cavalli' }],
  creator: 'Studio Cavalli',
  publisher: 'Studio Cavalli',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FoxCard',
  },
  openGraph: {
    type: 'website',
    siteName: 'FoxCard',
    title: 'FoxCard - E-commerce Open Source',
    description: 'La plateforme e-commerce 100% gratuite et open source',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FoxCard - E-commerce Open Source',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FoxCard - E-commerce Open Source',
    description: 'La plateforme e-commerce 100% gratuite et open source',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icon-152x152.png', sizes: '152x152', type: 'image/png' }],
  },
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
          </TRPCProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
