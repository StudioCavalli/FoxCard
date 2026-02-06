'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Store, MapPin, Mail, Phone, Facebook, Instagram, Twitter, Linkedin, Youtube, Star, Package, ShoppingBag, Globe } from 'lucide-react'
import { getCountryFlag, getCountryLabel } from '@/lib/countries'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/products/ProductCard'
import { useLocale } from 'next-intl'

interface StoreHomepageClientProps {
  slug: string
}

export function StoreHomepageClient({ slug }: StoreHomepageClientProps) {
  const locale = useLocale()
  const { data: store, isLoading: storeLoading } = trpc.store.getBySlug.useQuery({ slug })
  const { data: featuredProducts, isLoading: productsLoading } = trpc.store.getFeaturedProducts.useQuery(
    { storeId: store?.id || '' },
    { enabled: !!store?.id }
  )
  const { data: stats } = trpc.store.getStats.useQuery(
    { storeId: store?.id || '' },
    { enabled: !!store?.id }
  )

  if (storeLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="h-32 bg-gray-200 rounded-lg mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Boutique introuvable</h1>
          <p className="text-gray-600 mb-6">La boutique que vous recherchez n'existe pas</p>
          <Link href="/stores">
            <Button>Retour aux boutiques</Button>
          </Link>
        </div>
      </div>
    )
  }

  const socialLinks = store.socialLinks as Record<string, string> | null
  const publicAddress = store.publicAddress as Record<string, string> | null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative h-64 bg-gradient-to-r from-primary-600 to-purple-600"
        style={
          store.bannerImage
            ? {
                backgroundImage: `url(${store.bannerImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-4xl font-bold mb-2">{store.name}</h1>
            {store.tagline && <p className="text-xl text-gray-100">{store.tagline}</p>}
          </div>
        </div>
      </div>

      {/* Store Info Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Logo and Name */}
            <div className="flex items-center gap-4">
              {store.logo ? (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden shadow-lg">
                  <Image src={store.logo} alt={store.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold text-white">
                    {store.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{store.name}</h2>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    <span>{stats?.productsCount || 0} produits</span>
                  </div>
                  {stats && stats.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{stats.rating.toFixed(1)} ({stats.reviewsCount})</span>
                    </div>
                  )}
                  {store.countries && store.countries.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      <span className="flex items-center gap-0.5">
                        {store.countries.slice(0, 4).map((c: string) => (
                          <span key={c} title={getCountryLabel(c, locale)}>{getCountryFlag(c)}</span>
                        ))}
                        {store.countries.length > 4 && (
                          <span className="text-xs text-gray-400 ml-0.5">+{store.countries.length - 4}</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Link href={`/stores/${slug}/products`}>
                <Button>
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Voir tous les produits
                </Button>
              </Link>
              <Link href={`/stores/${slug}/contact`}>
                <Button variant="outline">Contacter</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            {store.description && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">À propos de la boutique</h3>
                <p className="text-gray-700 whitespace-pre-line">{store.description}</p>
                {store.story && (
                  <Link href={`/stores/${slug}/about`}>
                    <Button variant="outline" className="mt-4">
                      En savoir plus
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {/* Featured Products */}
            {featuredProducts && featuredProducts.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Produits en vedette</h3>
                  <Link href={`/stores/${slug}/products`}>
                    <Button variant="ghost" size="sm">
                      Voir tout →
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {featuredProducts.slice(0, 4).map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {store.categories && store.categories.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Catégories</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {store.categories.map((category: any) => (
                    <Link
                      key={category.id}
                      href={`/stores/${slug}/products?category=${category.slug}`}
                      className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
                    >
                      {category.image && (
                        <div className="relative w-16 h-16 mb-2 rounded-lg overflow-hidden">
                          <Image src={category.image} alt={category.name} fill className="object-cover" />
                        </div>
                      )}
                      <span className="font-medium text-gray-900 text-center">{category.name}</span>
                      <span className="text-sm text-gray-500">{category._count.products} produits</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Informations de contact</h3>
              <div className="space-y-3">
                {store.publicEmail && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <a href={`mailto:${store.publicEmail}`} className="text-primary-600 hover:underline">
                      {store.publicEmail}
                    </a>
                  </div>
                )}
                {store.publicPhone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <a href={`tel:${store.publicPhone}`} className="text-primary-600 hover:underline">
                      {store.publicPhone}
                    </a>
                  </div>
                )}
                {publicAddress && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="text-gray-700">
                      {publicAddress.street && <div>{publicAddress.street}</div>}
                      {(publicAddress.city || publicAddress.postalCode) && (
                        <div>
                          {publicAddress.postalCode} {publicAddress.city}
                        </div>
                      )}
                      {publicAddress.country && <div>{publicAddress.country}</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            {socialLinks && Object.values(socialLinks).some(Boolean) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Suivez-nous</h3>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-pink-50 text-primary-500 hover:bg-primary-100 transition-colors"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.twitter && (
                    <a
                      href={socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.linkedin && (
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.youtube && (
                    <a
                      href={socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Youtube className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
