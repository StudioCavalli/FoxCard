'use client'

import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/Button'
import { trpc } from '@/lib/trpc/client'

export default function HomePage() {
  // For demo, we'll use a default store ID
  const DEMO_STORE_ID = '000000000000000000000001' // Will be replaced with actual store

  const { data, isLoading, fetchNextPage, hasNextPage } = trpc.product.getAll.useInfiniteQuery(
    {
      storeId: DEMO_STORE_ID,
      status: 'ACTIVE',
      limit: 12,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  )

  const products = data?.pages.flatMap((page) => page.products) ?? []

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          Bienvenue sur{' '}
          <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            FoxCard
          </span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Découvrez notre sélection de produits exceptionnels
        </p>
      </section>

      {/* Featured Categories */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Catégories populaires</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Électronique', 'Mode', 'Maison', 'Beauté'].map((category, index) => (
            <div
              key={category}
              className={`p-6 rounded-2xl text-center cursor-pointer transition-all hover:scale-105 hover:shadow-card-hover ${
                index === 0
                  ? 'bg-primary-100'
                  : index === 1
                  ? 'bg-secondary-100'
                  : index === 2
                  ? 'bg-yellow-50'
                  : 'bg-blue-50'
              }`}
            >
              <div className="text-4xl mb-2">
                {index === 0 ? '🎧' : index === 1 ? '👗' : index === 2 ? '🏠' : '💄'}
              </div>
              <h3 className="font-semibold text-gray-900">{category}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Produits en vedette</h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-96 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Aucun produit disponible pour le moment</p>
            <p className="text-gray-500 mt-2">Revenez bientôt pour découvrir nos nouveautés!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  storeSlug="demo"
                />
              ))}
            </div>

            {/* Load More */}
            {hasNextPage && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => fetchNextPage()}
                >
                  Voir plus de produits
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Features Section */}
      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚚</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Livraison rapide</h3>
          <p className="text-gray-600">Recevez vos commandes en 24-48h</p>
        </div>
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Paiement sécurisé</h3>
          <p className="text-gray-600">Vos données sont protégées</p>
        </div>
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">↩️</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Retours gratuits</h3>
          <p className="text-gray-600">30 jours pour changer d'avis</p>
        </div>
      </section>
    </div>
  )
}
