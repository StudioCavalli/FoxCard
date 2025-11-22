'use client'

import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { ShoppingCart } from 'lucide-react'
import { usePublicStore } from '@/lib/context/public-store-context'
import { useTranslations } from 'next-intl'
import { ProductPageRouter } from '@/components/products/layouts'

interface ProductDetailClientProps {
  slug: string
  initialStoreId?: string
}

export function ProductDetailClient({ slug, initialStoreId }: ProductDetailClientProps) {
  const t = useTranslations()
  const { selectedStore } = usePublicStore()

  // Find product by slug across all stores or specific store
  const { data: product, isLoading } = trpc.product.getBySlug.useQuery({
    storeId: initialStoreId || (selectedStore === 'all' ? undefined : selectedStore),
    slug,
  })

  if (isLoading) {
    return (
      <div style={{ fontFamily: 'var(--theme-font-body)' }}>
        <div className="mx-auto px-6 lg:px-8 py-16" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-32 bg-theme-surface border border-theme-border rounded-xl" />
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="bg-theme-surface border border-theme-border aspect-square rounded-2xl" />
              <div className="space-y-4">
                <div className="h-8 bg-theme-surface border border-theme-border rounded-xl" />
                <div className="h-6 w-1/2 bg-theme-surface border border-theme-border rounded-xl" />
                <div className="h-24 bg-theme-surface border border-theme-border rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div style={{ fontFamily: 'var(--theme-font-body)' }}>
        <div className="mx-auto px-6 lg:px-8 py-16 text-center" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
          <div className="w-16 h-16 bg-theme-surface border border-theme-border rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-theme-text-muted" />
          </div>
          <h1
            className="text-3xl font-bold text-theme-text mb-4"
            style={{ fontFamily: 'var(--theme-font-heading)' }}
          >
            {t('product.notFound')}
          </h1>
          <p className="text-theme-text-secondary mb-6">{t('product.notFoundDescription')}</p>
          <Link href="/products">
            <button className="px-8 py-3.5 bg-theme-primary hover:bg-theme-primary/90 text-theme-background rounded-xl font-semibold shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200">
              {t('product.backToProducts')}
            </button>
          </Link>
        </div>
      </div>
    )
  }

  // Use ProductPageRouter to show the appropriate layout based on commerce type
  return <ProductPageRouter product={product} storeId={product.storeId} />
}
