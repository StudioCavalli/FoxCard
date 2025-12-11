'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Store, ArrowLeft } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/products/ProductCard'

interface PageProps {
  params: Promise<{
    locale: string
    slug: string
  }>
  searchParams: Promise<{
    category?: string
  }>
}

export default function StoreProductsPage({ params, searchParams }: PageProps) {
  const { slug } = use(params)
  const { category: categorySlug } = use(searchParams)
  const [search, setSearch] = useState('')

  const { data: store } = trpc.store.getBySlug.useQuery({ slug })

  // Find category by slug to get categoryId
  const selectedCategory = store?.categories?.find((c: any) => c.slug === categorySlug)

  const { data: productsData, isLoading } = trpc.product.getAll.useQuery(
    {
      storeId: store?.id || '',
      categoryId: selectedCategory?.id,
      limit: 50,
      search: search || undefined,
      status: 'ACTIVE',
    },
    { enabled: !!store?.id }
  )

  const products = productsData?.products || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/stores" className="hover:text-primary-600">
              Boutiques
            </Link>
            <span>/</span>
            <Link href={`/stores/${slug}`} className="hover:text-primary-600">
              {store?.name || 'Chargement...'}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Produits</span>
          </nav>

          {/* Store Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {store?.logo ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <Image src={store.logo} alt={store.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                  <Store className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{store?.name}</h1>
                <p className="text-gray-600">Tous les produits</p>
              </div>
            </div>

            <Link href={`/stores/${slug}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la boutique
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Catégories</h2>
              <div className="space-y-2">
                <Link
                  href={`/stores/${slug}/products`}
                  className={`block px-4 py-2 rounded-lg transition-colors ${
                    !categorySlug
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Tous les produits
                </Link>
                {store?.categories?.map((category: any) => (
                  <Link
                    key={category.id}
                    href={`/stores/${slug}/products?category=${category.slug}`}
                    className={`block px-4 py-2 rounded-lg transition-colors ${
                      categorySlug === category.slug
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                      <span className="text-sm text-gray-500">{category._count.products}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {selectedCategory && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedCategory.name}</h2>
                {selectedCategory.description && (
                  <p className="text-gray-600">{selectedCategory.description}</p>
                )}
              </div>
            )}

            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Rechercher des produits..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Products */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4" />
                    <div className="h-6 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded mb-4" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : !products || products.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-600 mb-6">
                  Aucun produit ne correspond à votre recherche
                </p>
                {(search || categorySlug) && (
                  <Button onClick={() => { setSearch(''); window.location.href = `/stores/${slug}/products` }}>
                    Réinitialiser les filtres
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  {products.length} produit{products.length > 1 ? 's' : ''}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
