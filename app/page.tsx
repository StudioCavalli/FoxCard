'use client'

import Link from 'next/link'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { trpc } from '@/lib/trpc/client'

export default function HomePage() {
  // For demo, we'll use a default store ID
  const DEMO_STORE_ID = '000000000000000000000001' // Will be replaced with actual store

  const { data: categories } = trpc.category.getAll.useQuery({
    storeId: DEMO_STORE_ID,
  })

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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Catégories populaires</h2>
          <Link href="/products">
            <Button variant="ghost" size="sm">
              Voir tout
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories?.slice(0, 8).map((category, index) => {
            const bgColors = [
              'bg-primary-100 hover:bg-primary-200',
              'bg-secondary-100 hover:bg-secondary-200',
              'bg-yellow-50 hover:bg-yellow-100',
              'bg-blue-50 hover:bg-blue-100',
              'bg-green-50 hover:bg-green-100',
              'bg-purple-50 hover:bg-purple-100',
              'bg-pink-50 hover:bg-pink-100',
              'bg-orange-50 hover:bg-orange-100',
            ]
            const emoji = categoryEmojis[category.slug.toLowerCase()] || '📦'

            return (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <Card
                  variant="default"
                  className={`p-6 text-center cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${
                    bgColors[index % bgColors.length]
                  }`}
                >
                  <div className="text-4xl mb-2">{emoji}</div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  {category._count?.products !== undefined && (
                    <p className="text-xs text-gray-600 mt-1">
                      {category._count.products} produit{category._count.products > 1 ? 's' : ''}
                    </p>
                  )}
                </Card>
              </Link>
            )
          })}
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
