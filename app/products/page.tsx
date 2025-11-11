'use client'

import { useState } from 'react'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { trpc } from '@/lib/trpc/client'
import { Filter, X } from 'lucide-react'

export default function ProductsPage() {
  const DEMO_STORE_ID = '000000000000000000000001'
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [showFilters, setShowFilters] = useState(false)

  const { data: categories } = trpc.category.getAll.useQuery({
    storeId: DEMO_STORE_ID,
  })

  const { data, isLoading, fetchNextPage, hasNextPage } = trpc.product.getAll.useInfiniteQuery(
    {
      storeId: DEMO_STORE_ID,
      status: 'ACTIVE',
      categoryId: selectedCategory,
      limit: 12,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  )

  const products = data?.pages.flatMap((page) => page.products) ?? []

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Tous les produits</h1>
        <p className="text-gray-600">Découvrez notre collection complète</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <Card className="p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Filtres</h2>

            {/* Categories */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Catégories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(undefined)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    !selectedCategory
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  Toutes
                </button>
                {categories?.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </aside>

        {/* Mobile Filter Toggle */}
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

        {/* Mobile Filters Drawer */}
        {showFilters && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setShowFilters(false)}
            />
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 z-50 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Filtres</h2>
                <button onClick={() => setShowFilters(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Catégories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedCategory(undefined)
                      setShowFilters(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      !selectedCategory
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Toutes
                  </button>
                  {categories?.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id)
                        setShowFilters(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Products Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-96 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Aucun produit trouvé</p>
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
