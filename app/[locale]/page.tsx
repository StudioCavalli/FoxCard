'use client'

import Link from 'next/link'
import { ProductCard } from '@/components/products/ProductCard'
import { trpc } from '@/lib/trpc/client'
import { ArrowRight, Truck, Shield, RefreshCw, Sparkles, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePlatformSettings } from '@/lib/platform/PlatformSettingsProvider'
import { usePublicStore } from '@/lib/context/public-store-context'

export default function HomePage() {
  const t = useTranslations()
  const { settings } = usePlatformSettings()
  const { selectedStore, stores } = usePublicStore()

  // Use selected store or first available store
  const currentStoreId = selectedStore !== 'all' ? selectedStore : stores[0]?.id

  const { data: categories } = trpc.category.getAll.useQuery({
    storeId: currentStoreId,
  }, {
    enabled: !!currentStoreId,
  })

  const { data, isLoading, fetchNextPage, hasNextPage } = trpc.product.getAll.useInfiniteQuery(
    {
      storeId: currentStoreId,
      status: 'ACTIVE',
      limit: 12,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!currentStoreId,
    }
  )

  const products = data?.pages.flatMap((page) => page.products) ?? []

  // Category emoji mapping
  const categoryEmojis: Record<string, string> = {
    'electronique': '🎧',
    'mode': '👗',
    'maison': '🏠',
    'beaute': '💄',
    'sports': '⚽',
    'livres': '📚',
    'jouets': '🧸',
    'jardin': '🌱',
  }

  return (
    <div style={{ fontFamily: 'var(--theme-font-body)' }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-theme-background via-theme-surface/30 to-theme-background">
        {/* Background Glow Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-theme-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-theme-accent/10 rounded-full blur-3xl" />

        <div className="relative mx-auto px-6 lg:px-8 py-24 md:py-32 lg:py-40" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-theme-surface/80 backdrop-blur-sm border border-theme-border rounded-full text-sm text-theme-text-secondary mb-8 shadow-lg shadow-theme-primary/5 hover:shadow-theme-primary/10 transition-shadow duration-300">
              <Sparkles className="w-4 h-4 text-theme-primary" />
              <span>{t('home.badge')}</span>
            </div>

            {/* Main Heading */}
            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-theme-text mb-6 leading-tight"
              style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.03em' }}
            >
              {t('home.welcome')}{' '}
              <span className="relative inline-block">
                <span className="absolute inset-0 bg-gradient-to-r from-theme-primary to-theme-accent blur-xl opacity-30" />
                <span className="relative bg-gradient-to-r from-theme-primary to-theme-accent bg-clip-text text-transparent">
                  {settings.platformName}
                </span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-theme-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
              {t('home.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/products">
                <button className="group relative px-8 py-4 bg-theme-primary hover:bg-theme-primary/90 text-theme-background rounded-xl font-semibold text-base shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
                  style={{ fontFamily: 'var(--theme-font-heading)' }}
                >
                  {t('home.discoverProducts')}
                  <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" strokeWidth={2.5} />
                </button>
              </Link>
              <Link href="/categories">
                <button className="group px-8 py-4 bg-theme-surface/80 hover:bg-theme-surface border border-theme-border hover:border-theme-border-light text-theme-text rounded-xl font-semibold text-base transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
                  style={{ fontFamily: 'var(--theme-font-heading)' }}
                >
                  {t('home.viewCategories')}
                  <TrendingUp className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" strokeWidth={2.5} />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Gradient Border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-theme-border to-transparent" />
      </section>

      {/* Featured Categories */}
      <section className="py-16">
        <div className="mx-auto px-6 lg:px-8" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
          <div className="flex items-center justify-between mb-10">
            <h2
              className="text-3xl md:text-4xl font-bold text-theme-text"
              style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
            >
              {t('home.popularCategories')}
            </h2>
            <Link href="/products">
              <button className="group text-theme-text-secondary hover:text-theme-primary text-sm font-medium flex items-center gap-1 transition-colors duration-200">
                {t('common.viewAll')}
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories?.slice(0, 8).map((category, index) => {
              const emoji = categoryEmojis[category.slug.toLowerCase()] || '📦'

              return (
                <Link key={category.id} href={`/categories/${category.slug}`} className="group">
                  <div className="relative p-6 bg-theme-surface border border-theme-border rounded-2xl text-center cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-theme-primary/10 hover:-translate-y-1 hover:border-theme-border-light overflow-hidden">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-theme-primary/5 to-theme-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Content */}
                    <div className="relative">
                      <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                        {emoji}
                      </div>
                      <h3
                        className="font-semibold text-theme-text mb-1"
                        style={{ fontFamily: 'var(--theme-font-heading)' }}
                      >
                        {category.name}
                      </h3>
                      {category._count?.products !== undefined && (
                        <p className="text-xs text-theme-text-muted">
                          {category._count.products} produit{category._count.products > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 bg-theme-background">
        <div className="mx-auto px-6 lg:px-8" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
          <div className="mb-10">
            <h2
              className="text-3xl md:text-4xl font-bold text-theme-text"
              style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
            >
              {t('home.featuredProducts')}
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-theme-surface border border-theme-border rounded-2xl h-96 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-theme-surface border border-theme-border rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-theme-text-muted" />
              </div>
              <p className="text-theme-text text-lg font-medium mb-2">{t('home.noProducts')}</p>
              <p className="text-theme-text-secondary">{t('home.comeBackSoon')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    storeSlug={stores.find(s => s.id === currentStoreId)?.slug || 'store'}
                  />
                ))}
              </div>

              {/* Load More */}
              {hasNextPage && (
                <div className="text-center mt-10">
                  <button
                    onClick={() => fetchNextPage()}
                    className="px-8 py-3 bg-theme-surface hover:bg-theme-surface/80 border border-theme-border hover:border-theme-border-light text-theme-text rounded-xl font-semibold transform hover:scale-105 active:scale-95 transition-all duration-200"
                    style={{ fontFamily: 'var(--theme-font-heading)' }}
                  >
                    {t('home.loadMore')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-theme-surface/50">
        <div className="mx-auto px-6 lg:px-8" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group text-center p-8 bg-theme-surface border border-theme-border rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-theme-primary/10 hover:-translate-y-1">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-theme-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-theme-primary/10 to-theme-primary/5 rounded-2xl flex items-center justify-center">
                  <Truck className="w-8 h-8 text-theme-primary" strokeWidth={2} />
                </div>
              </div>
              <h3
                className="font-semibold text-theme-text text-lg mb-2"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                {t('home.fastDelivery')}
              </h3>
              <p className="text-theme-text-secondary">
                {t('home.fastDeliveryDesc')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group text-center p-8 bg-theme-surface border border-theme-border rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-theme-primary/10 hover:-translate-y-1">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-theme-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-theme-primary/10 to-theme-primary/5 rounded-2xl flex items-center justify-center">
                  <Shield className="w-8 h-8 text-theme-primary" strokeWidth={2} />
                </div>
              </div>
              <h3
                className="font-semibold text-theme-text text-lg mb-2"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                {t('home.securePayment')}
              </h3>
              <p className="text-theme-text-secondary">
                {t('home.securePaymentDesc')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group text-center p-8 bg-theme-surface border border-theme-border rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-theme-primary/10 hover:-translate-y-1">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-theme-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-theme-primary/10 to-theme-primary/5 rounded-2xl flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-theme-primary" strokeWidth={2} />
                </div>
              </div>
              <h3
                className="font-semibold text-theme-text text-lg mb-2"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                {t('home.freeReturns')}
              </h3>
              <p className="text-theme-text-secondary">
                {t('home.freeReturnsDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
