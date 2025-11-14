'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { ProductCard } from '@/components/products/ProductCard'
import { trpc } from '@/lib/trpc/client'
import { Filter, X, Search, ArrowLeft, Sparkles } from 'lucide-react'

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const DEMO_STORE_ID = '000000000000000000000001'

  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [minPrice, setMinPrice] = useState<number | undefined>()
  const [maxPrice, setMaxPrice] = useState<number | undefined>()
  const [sortBy, setSortBy] = useState<'createdAt' | 'price' | 'name' | 'featured'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const { data: category, isLoading: categoryLoading } = trpc.category.getBySlug.useQuery({
    storeId: DEMO_STORE_ID,
    slug,
  })

  const { data, isLoading, fetchNextPage, hasNextPage } = trpc.product.getAll.useInfiniteQuery(
    {
      storeId: DEMO_STORE_ID,
      status: 'ACTIVE',
      categoryId: category?.id,
      search: searchQuery || undefined,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      limit: 12,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!category,
    }
  )

  const products = data?.pages.flatMap((page) => page.products) ?? []

  if (categoryLoading) {
    return (
      <div style={{ fontFamily: 'var(--theme-font-body)' }}>
        <div className="mx-auto px-6 lg:px-8 py-16" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
          <div className="animate-pulse space-y-8">
            <div className="h-12 w-64 bg-theme-surface border border-theme-border rounded-xl"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-theme-surface border border-theme-border rounded-2xl h-96" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div style={{ fontFamily: 'var(--theme-font-body)' }}>
        <div className="mx-auto px-6 lg:px-8 py-16" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
          <div className="p-12 bg-theme-surface border border-theme-border rounded-2xl text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-theme-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-12 h-12 text-theme-primary" />
            </div>
            <h1
              className="text-3xl font-bold text-theme-text mb-4"
              style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
            >
              Catégorie introuvable
            </h1>
            <p className="text-theme-text-secondary mb-8 text-lg">
              Cette catégorie n'existe pas ou a été supprimée.
            </p>
            <Link href="/products">
              <button className="px-8 py-3.5 bg-theme-primary hover:bg-theme-primary/90 text-theme-background rounded-xl font-semibold shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200">
                Voir tous les produits
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'var(--theme-font-body)' }}>
      <div className="mx-auto px-6 lg:px-8 py-8" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
        <Link
          href="/products"
          className="group inline-flex items-center text-theme-text-secondary hover:text-theme-primary mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
          Retour aux produits
        </Link>

        <div className="mb-10">
          <h1
            className="text-4xl md:text-5xl font-bold text-theme-text mb-3"
            style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
          >
            {category.name}
          </h1>
          {category.description && (
            <p className="text-xl text-theme-text-secondary mb-2">{category.description}</p>
          )}
          <p className="text-sm text-theme-text-muted">{products.length} produit(s)</p>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-theme-text-muted" />
            </div>
            <input
              type="text"
              placeholder="Rechercher dans cette catégorie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-theme-surface border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-theme-text-muted hover:text-theme-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder]
              setSortBy(newSortBy)
              setSortOrder(newSortOrder)
            }}
            className="px-4 py-3.5 rounded-xl bg-theme-surface border border-theme-border text-theme-text focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
          >
            <option value="createdAt-desc">Plus récents</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="name-asc">Nom A-Z</option>
            <option value="name-desc">Nom Z-A</option>
            <option value="featured-desc">Populaires</option>
          </select>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="p-6 bg-theme-surface border border-theme-border rounded-2xl sticky top-24 space-y-6">
              <h2
                className="text-xl font-bold text-theme-text"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                Filtres
              </h2>

              <div>
                <h3
                  className="font-semibold text-theme-text mb-3"
                  style={{ fontFamily: 'var(--theme-font-heading)' }}
                >
                  Prix
                </h3>
                <div className="space-y-3">
                  <input
                    type="number"
                    placeholder="Prix min"
                    value={minPrice?.toString() || ''}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                    min="0"
                    className="w-full px-4 py-3 rounded-xl bg-theme-background border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
                  />
                  <input
                    type="number"
                    placeholder="Prix max"
                    value={maxPrice?.toString() || ''}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                    min="0"
                    className="w-full px-4 py-3 rounded-xl bg-theme-background border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
                  />
                  {(minPrice !== undefined || maxPrice !== undefined) && (
                    <button
                      onClick={() => {
                        setMinPrice(undefined)
                        setMaxPrice(undefined)
                      }}
                      className="w-full px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold text-sm transform hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                      Réinitialiser le prix
                    </button>
                  )}
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:hidden fixed bottom-6 right-6 z-40">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3.5 bg-theme-primary hover:bg-theme-primary/90 text-theme-background rounded-full font-semibold shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filtres
            </button>
          </div>

          {showFilters && (
            <>
              <div
                className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={() => setShowFilters(false)}
              />
              <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-theme-surface border-t border-theme-border rounded-t-2xl p-6 z-50 max-h-[80vh] overflow-y-auto space-y-6">
                <div className="flex items-center justify-between">
                  <h2
                    className="text-2xl font-bold text-theme-text"
                    style={{ fontFamily: 'var(--theme-font-heading)' }}
                  >
                    Filtres
                  </h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-theme-background rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-theme-text" />
                  </button>
                </div>

                <div>
                  <h3
                    className="font-semibold text-theme-text mb-3"
                    style={{ fontFamily: 'var(--theme-font-heading)' }}
                  >
                    Prix
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="number"
                      placeholder="Prix min"
                      value={minPrice?.toString() || ''}
                      onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                      min="0"
                      className="w-full px-4 py-3 rounded-xl bg-theme-background border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
                    />
                    <input
                      type="number"
                      placeholder="Prix max"
                      value={maxPrice?.toString() || ''}
                      onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                      min="0"
                      className="w-full px-4 py-3 rounded-xl bg-theme-background border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
                    />
                    {(minPrice !== undefined || maxPrice !== undefined) && (
                      <button
                        onClick={() => {
                          setMinPrice(undefined)
                          setMaxPrice(undefined)
                        }}
                        className="w-full px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold text-sm transform hover:scale-105 active:scale-95 transition-all duration-200"
                      >
                        Réinitialiser le prix
                      </button>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full px-8 py-4 bg-theme-primary hover:bg-theme-primary/90 text-theme-background rounded-xl font-semibold text-lg shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200"
                  style={{ fontFamily: 'var(--theme-font-heading)' }}
                >
                  Appliquer les filtres
                </button>
              </div>
            </>
          )}

          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-theme-surface border border-theme-border rounded-2xl h-96 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-theme-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-12 h-12 text-theme-primary" />
                </div>
                <p className="text-theme-text text-lg font-medium mb-2">
                  Aucun produit trouvé dans cette catégorie
                </p>
                {(searchQuery || minPrice !== undefined || maxPrice !== undefined) && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setMinPrice(undefined)
                      setMaxPrice(undefined)
                    }}
                    className="mt-6 px-8 py-3.5 bg-theme-surface hover:bg-theme-background border border-theme-border hover:border-theme-border-light text-theme-text rounded-xl font-semibold transform hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} storeSlug="demo" />
                  ))}
                </div>

                {hasNextPage && (
                  <div className="text-center mt-10">
                    <button
                      onClick={() => fetchNextPage()}
                      className="px-8 py-3.5 bg-theme-surface hover:bg-theme-background border border-theme-border hover:border-theme-border-light text-theme-text rounded-xl font-semibold transform hover:scale-105 active:scale-95 transition-all duration-200"
                      style={{ fontFamily: 'var(--theme-font-heading)' }}
                    >
                      Voir plus de produits
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
