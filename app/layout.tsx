import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TRPCProvider } from '@/lib/trpc/Provider'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { CartDrawerWrapper } from '@/components/cart/CartDrawerWrapper'

const inter = Inter({ subsets: ['latin'] })

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
    apple: [
      { url: '/icon-152x152.png', sizes: '152x152', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <TRPCProvider>
          <ThemeProvider>
            <Header />
            <main className="min-h-screen bg-theme-background">
              {children}
            </main>
            <Footer />
            <CartDrawerWrapper />
          </ThemeProvider>
        </TRPCProvider>
      </body>
    </html>
  )
}
