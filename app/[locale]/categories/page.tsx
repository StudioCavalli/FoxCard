'use client'

import { trpc } from '@/lib/trpc/client'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Folder, ArrowRight } from 'lucide-react'
import { usePublicStore } from '@/lib/context/public-store-context'
import { useTranslations } from 'next-intl'

export default function CategoriesPage() {
  const { selectedStore, stores } = usePublicStore()
  const t = useTranslations('categoriesPage')

  // Use selected store or first available store
  const currentStoreId = selectedStore !== 'all' ? selectedStore : stores[0]?.id

  const { data: categories, isLoading } = trpc.category.getAll.useQuery({
    storeId: currentStoreId,
  }, {
    enabled: !!currentStoreId,
  })

  return (
    <div style={{ fontFamily: 'var(--theme-font-body)' }}>
      <div className="mx-auto px-6 lg:px-8 py-12" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
        {/* Header */}
        <div className="mb-10">
          <h1
            className="text-4xl md:text-5xl font-bold text-theme-text mb-3"
            style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
          >
            {t('title')}
          </h1>
          <p className="text-xl text-theme-text-secondary">
            {t('subtitle')}
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-theme-surface border border-theme-border rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Categories Grid */}
        {!isLoading && categories && categories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category: any) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group block"
              >
                <Card className="p-6 h-full hover:shadow-2xl hover:shadow-theme-primary/10 hover:-translate-y-1 hover:border-theme-border-light transition-all duration-300">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-theme-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-theme-primary/20 group-hover:scale-110 transition-all duration-300">
                    <Folder className="w-8 h-8 text-theme-primary" strokeWidth={2} />
                  </div>

                  {/* Name */}
                  <h2
                    className="text-xl font-bold text-theme-text mb-2 group-hover:text-theme-primary transition-colors"
                    style={{ fontFamily: 'var(--theme-font-heading)' }}
                  >
                    {category.name}
                  </h2>

                  {/* Description */}
                  {category.description && (
                    <p className="text-theme-text-secondary text-sm line-clamp-2 mb-4">
                      {category.description}
                    </p>
                  )}

                  {/* Product Count */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-theme-border">
                    <span className="text-sm text-theme-text-muted">
                      {t('productCount', { count: category._count?.products || 0 })}
                    </span>
                    <ArrowRight className="w-5 h-5 text-theme-primary opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!categories || categories.length === 0) && (
          <Card className="p-12 text-center">
            <div className="w-20 h-20 bg-theme-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Folder className="w-10 h-10 text-theme-primary" />
            </div>
            <h2
              className="text-2xl font-bold text-theme-text mb-3"
              style={{ fontFamily: 'var(--theme-font-heading)' }}
            >
              {t('noCategory')}
            </h2>
            <p className="text-theme-text-secondary mb-6">
              {t('noCategorySoon')}
            </p>
            <Link href="/products">
              <button className="px-6 py-3 bg-theme-primary hover:bg-theme-primary/90 text-theme-background rounded-xl font-semibold shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200">
                {t('viewAllProducts')}
              </button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  )
}
