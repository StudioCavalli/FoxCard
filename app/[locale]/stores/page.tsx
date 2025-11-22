'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Star, Package } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useTranslations } from 'next-intl'

export default function StoresDirectoryPage() {
  const t = useTranslations()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'newest' | 'rating' | 'products'>('name')

  const { data, isLoading, error } = trpc.store.getDirectory.useQuery({
    search,
    sortBy,
    limit: 24,
    offset: 0,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">{t('store.discoverStores')}</h1>
          <p className="text-xl text-indigo-100 mb-8">
            {t('store.subtitle')}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder={t('store.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-4 py-3 w-full bg-white text-gray-900 rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">
              {t('store.storesFound', { count: data?.total || 0 })}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">{t('store.sort')}:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="name">{t('store.sortOptions.alphabetical')}</option>
              <option value="newest">{t('store.sortOptions.newest')}</option>
              <option value="rating">{t('store.sortOptions.rating')}</option>
              <option value="products">{t('store.sortOptions.mostProducts')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="w-24 h-24 bg-gray-200 rounded-lg mx-auto mb-4" />
                <div className="h-6 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded mb-4" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{t('store.loadError')}</p>
          </div>
        ) : !data?.stores || data.stores.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('store.noResults')}
            </h3>
            <p className="text-gray-600">
              {t('store.tryAgain')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.stores.map((store) => (
              <Link
                key={store.id}
                href={`/stores/${store.slug}`}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 p-6 flex flex-col"
              >
                {/* Store Logo */}
                <div className="flex justify-center mb-4">
                  {store.logo ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={store.logo}
                        alt={store.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {store.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Store Name */}
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  {store.name}
                </h3>

                {/* Tagline or Description */}
                <p className="text-sm text-gray-600 text-center mb-4 flex-grow line-clamp-2">
                  {store.tagline || store.description || t('store.discoverProducts')}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    <span>{store.productsCount}</span>
                  </div>
                  {store.rating && store.rating > 0 ? (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{store.rating.toFixed(1)}</span>
                      <span className="text-gray-400">({store.reviewsCount})</span>
                    </div>
                  ) : null}
                </div>

                {/* Visit Button */}
                <Button variant="outline" className="w-full">
                  {t('store.viewStore')}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
