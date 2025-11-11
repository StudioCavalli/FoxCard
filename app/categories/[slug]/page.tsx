'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { Filter, X, Search, ArrowLeft } from 'lucide-react'

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
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-12 w-64 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-96" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card variant="default" className="p-12 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Categorie introuvable</h1>
          <p className="text-gray-600 mb-8">Cette categorie n existe pas ou a ete supprimee.</p>
          <Link href="/products">
            <Button variant="primary" size="lg">
              Voir tous les produits
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/products"
        className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Retour aux produits
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{category.name}</h1>
        {category.description && <p className="text-gray-600">{category.description}</p>}
        <p className="text-sm text-gray-500 mt-2">{products.length} produit(s)</p>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher dans cette categorie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
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
          className="px-4 py-3 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 outline-none transition-all bg-white"
        >
          <option value="createdAt-desc">Plus recents</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix decroissant</option>
          <option value="name-asc">Nom A-Z</option>
          <option value="name-desc">Nom Z-A</option>
          <option value="featured-desc">Populaires</option>
        </select>
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <Card className="p-6 sticky top-24 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Filtres</h2>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Prix</h3>
              <div className="space-y-3">
                <Input
                  type="number"
                  placeholder="Prix min"
                  value={minPrice?.toString() || ''}
                  onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                  min="0"
                />
                <Input
                  type="number"
                  placeholder="Prix max"
                  value={maxPrice?.toString() || ''}
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                  min="0"
                />
                {(minPrice !== undefined || maxPrice !== undefined) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMinPrice(undefined)
                      setMaxPrice(undefined)
                    }}
                    className="w-full text-red-600 hover:bg-red-50"
                  >
                    Reinitialiser le prix
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </aside>

        <div className="lg:hidden fixed bottom-6 right-6 z-40">
          <Button
            variant="primary"
            size="lg"
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-full shadow-lg"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filtres
          </Button>
        </div>

        {showFilters && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setShowFilters(false)}
            />
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 z-50 max-h-[80vh] overflow-y-auto space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Filtres</h2>
                <button onClick={() => setShowFilters(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Prix</h3>
                <div className="space-y-3">
                  <Input
                    type="number"
                    placeholder="Prix min"
                    value={minPrice?.toString() || ''}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                    min="0"
                  />
                  <Input
                    type="number"
                    placeholder="Prix max"
                    value={maxPrice?.toString() || ''}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                    min="0"
                  />
                  {(minPrice !== undefined || maxPrice !== undefined) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMinPrice(undefined)
                        setMaxPrice(undefined)
                      }}
                      className="w-full text-red-600 hover:bg-red-50"
                    >
                      Reinitialiser le prix
                    </Button>
                  )}
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => setShowFilters(false)}
              >
                Appliquer les filtres
              </Button>
            </div>
          </>
        )}

        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-96 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Aucun produit trouve dans cette categorie</p>
              {(searchQuery || minPrice !== undefined || maxPrice !== undefined) && (
                <Button
                  variant="outline"
                  size="lg"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('')
                    setMinPrice(undefined)
                    setMaxPrice(undefined)
                  }}
                >
                  Reinitialiser les filtres
                </Button>
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
                <div className="text-center mt-8">
                  <Button variant="outline" size="lg" onClick={() => fetchNextPage()}>
                    Voir plus de produits
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
