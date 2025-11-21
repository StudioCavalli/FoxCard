'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { usePublicStore } from '@/lib/context/public-store-context'
import { Filter, X, Search, ExternalLink, Store } from 'lucide-react'

function ProductsContent() {
  const { selectedStore, setSelectedStore, stores } = usePublicStore()
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [minPrice, setMinPrice] = useState<number | undefined>()
  const [maxPrice, setMaxPrice] = useState<number | undefined>()
  const [sortBy, setSortBy] = useState<'createdAt' | 'price' | 'name' | 'featured'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Initialize search query from URL
  useEffect(() => {
    const urlSearch = searchParams.get('search')
    if (urlSearch) {
      setSearchQuery(urlSearch)
    }
  }, [searchParams])

  const { data: categories } = trpc.category.getAll.useQuery({
    storeId: selectedStore === 'all' ? undefined : selectedStore,
  })

  const { data, isLoading, fetchNextPage, hasNextPage } = trpc.product.getAll.useInfiniteQuery(
    {
      storeId: selectedStore === 'all' ? undefined : selectedStore,
      status: 'ACTIVE',
      categoryId: selectedCategory,
      search: searchQuery || undefined,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      limit: 12,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  )

  const products = data?.pages.flatMap((page) => page.products) ?? []

  return (
    <div style={{ fontFamily: 'var(--theme-font-body)' }}>
      <div className="mx-auto px-6 lg:px-8 py-12" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
        {/* Header */}
        <div className="mb-10">
          <h1
            className="text-4xl md:text-5xl font-bold text-theme-text mb-3"
            style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
          >
            Tous les produits
          </h1>
          <p className="text-xl text-theme-text-secondary">Découvrez notre collection complète</p>
        </div>

        {/* Store Selector */}
        {stores.length > 0 && (
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-theme-surface border border-theme-border rounded-xl">
              <Store className="w-4 h-4 text-theme-text-muted" />
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value as string | 'all')}
                className="bg-transparent text-theme-text text-sm font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">Toutes les boutiques</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Search Bar & Sort */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-theme-text-muted" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un produit par nom, description ou SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-theme-surface border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
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

          {/* Sort Dropdown */}
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
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="p-6 bg-theme-surface border border-theme-border rounded-2xl sticky top-24 space-y-6">
              <h2
                className="text-xl font-bold text-theme-text"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                Filtres
              </h2>

              {/* Categories */}
              <div>
                <h3
                  className="font-semibold text-theme-text mb-3 text-sm uppercase tracking-wider"
                  style={{ fontFamily: 'var(--theme-font-heading)' }}
                >
                  Catégories
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory(undefined)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      !selectedCategory
                        ? 'bg-theme-primary/10 text-theme-primary font-medium'
                        : 'text-theme-text-secondary hover:bg-theme-primary/5 hover:text-theme-text'
                    }`}
                  >
                    Toutes
                  </button>
                  {categories?.map((category) => (
                    <div key={category.id} className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex-1 text-left px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          selectedCategory === category.id
                            ? 'bg-theme-primary/10 text-theme-primary font-medium'
                            : 'text-theme-text-secondary hover:bg-theme-primary/5 hover:text-theme-text'
                        }`}
                      >
                        {category.name}
                      </button>
                      <Link href={`/categories/${category.slug}`}>
                        <button
                          className="p-2 text-theme-text-muted hover:text-theme-primary hover:bg-theme-primary/5 rounded-lg transition-all duration-200"
                          title={`Voir la page ${category.name}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="pt-6 border-t border-theme-border">
                <h3
                  className="font-semibold text-theme-text mb-3 text-sm uppercase tracking-wider"
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
                    className="w-full px-3 py-2.5 rounded-lg bg-theme-background border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
                  />
                  <input
                    type="number"
                    placeholder="Prix max"
                    value={maxPrice?.toString() || ''}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                    min="0"
                    className="w-full px-3 py-2.5 rounded-lg bg-theme-background border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
                  />
                  {(minPrice !== undefined || maxPrice !== undefined) && (
                    <button
                      onClick={() => {
                        setMinPrice(undefined)
                        setMaxPrice(undefined)
                      }}
                      className="w-full px-3 py-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      Réinitialiser le prix
                    </button>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden fixed bottom-6 right-6 z-40">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3.5 bg-theme-primary hover:bg-theme-primary/90 text-theme-background rounded-full font-semibold shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
              style={{ fontFamily: 'var(--theme-font-heading)' }}
            >
              <Filter className="w-5 h-5" strokeWidth={2.5} />
              Filtres
            </button>
          </div>

          {/* Mobile Filters Drawer */}
          {showFilters && (
            <>
              <div
                className="lg:hidden fixed inset-0 bg-theme-primary/20 backdrop-blur-sm z-50"
                onClick={() => setShowFilters(false)}
              />
              <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-theme-surface rounded-t-2xl p-6 z-50 max-h-[80vh] overflow-y-auto space-y-6 border-t border-theme-border">
                <div className="flex items-center justify-between">
                  <h2
                    className="text-2xl font-bold text-theme-text"
                    style={{ fontFamily: 'var(--theme-font-heading)' }}
                  >
                    Filtres
                  </h2>
                  <button onClick={() => setShowFilters(false)} className="text-theme-text-secondary hover:text-theme-text">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Categories */}
                <div>
                  <h3
                    className="font-semibold text-theme-text mb-3 text-sm uppercase tracking-wider"
                    style={{ fontFamily: 'var(--theme-font-heading)' }}
                  >
                    Catégories
                  </h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setSelectedCategory(undefined)
                        setShowFilters(false)
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        !selectedCategory
                          ? 'bg-theme-primary/10 text-theme-primary font-medium'
                          : 'text-theme-text-secondary hover:bg-theme-primary/5 hover:text-theme-text'
                      }`}
                    >
                      Toutes
                    </button>
                    {categories?.map((category) => (
                      <div key={category.id} className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedCategory(category.id)
                            setShowFilters(false)
                          }}
                          className={`flex-1 text-left px-3 py-2.5 rounded-lg transition-all duration-200 ${
                            selectedCategory === category.id
                              ? 'bg-theme-primary/10 text-theme-primary font-medium'
                              : 'text-theme-text-secondary hover:bg-theme-primary/5 hover:text-theme-text'
                          }`}
                        >
                          {category.name}
                        </button>
                        <Link href={`/categories/${category.slug}`}>
                          <button
                            className="p-2 text-theme-text-muted hover:text-theme-primary hover:bg-theme-primary/5 rounded-lg transition-all duration-200"
                            title={`Voir la page ${category.name}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="pt-6 border-t border-theme-border">
                  <h3
                    className="font-semibold text-theme-text mb-3 text-sm uppercase tracking-wider"
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
                      className="w-full px-3 py-2.5 rounded-lg bg-theme-background border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
                    />
                    <input
                      type="number"
                      placeholder="Prix max"
                      value={maxPrice?.toString() || ''}
                      onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                      min="0"
                      className="w-full px-3 py-2.5 rounded-lg bg-theme-background border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
                    />
                    {(minPrice !== undefined || maxPrice !== undefined) && (
                      <button
                        onClick={() => {
                          setMinPrice(undefined)
                          setMaxPrice(undefined)
                        }}
                        className="w-full px-3 py-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        Réinitialiser le prix
                      </button>
                    )}
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full px-6 py-3.5 bg-theme-primary hover:bg-theme-primary/90 text-theme-background rounded-xl font-semibold shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200"
                  style={{ fontFamily: 'var(--theme-font-heading)' }}
                >
                  Appliquer les filtres
                </button>
              </div>
            </>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-theme-surface border border-theme-border rounded-2xl h-96 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-theme-surface border border-theme-border rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-theme-text-muted" />
                </div>
                <p className="text-theme-text text-lg font-medium mb-2">Aucun produit trouvé</p>
                <p className="text-theme-text-secondary">Essayez de modifier vos filtres ou votre recherche</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      storeSlug={product.store?.slug || 'demo'}
                      showStoreName={selectedStore === 'all'}
                    />
                  ))}
                </div>

                {hasNextPage && (
                  <div className="text-center mt-10">
                    <button
                      onClick={() => fetchNextPage()}
                      className="px-8 py-3 bg-theme-surface hover:bg-theme-surface/80 border border-theme-border hover:border-theme-border-light text-theme-text rounded-xl font-semibold transform hover:scale-105 active:scale-95 transition-all duration-200"
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

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ fontFamily: 'var(--theme-font-body)' }}>
          <div className="text-center">
            <div className="w-16 h-16 bg-theme-surface border border-theme-border rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Search className="w-8 h-8 text-theme-text-muted" />
            </div>
            <p className="text-theme-text-secondary">Chargement...</p>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  )
}
