'use client'

import { use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Store, ArrowLeft, Calendar, MapPin, Mail, Phone } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/Button'

interface PageProps {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export default function StoreAboutPage({ params }: PageProps) {
  const { slug } = use(params)

  const { data: store, isLoading } = trpc.store.getBySlug.useQuery({ slug })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="h-8 bg-gray-200 rounded mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
              </div>
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

  const publicAddress = store.publicAddress as Record<string, string> | null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/stores" className="hover:text-indigo-600">
              Boutiques
            </Link>
            <span>/</span>
            <Link href={`/stores/${slug}`} className="hover:text-indigo-600">
              {store.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">À propos</span>
          </nav>

          {/* Store Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {store.logo ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <Image src={store.logo} alt={store.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Store className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
                <p className="text-gray-600">À propos de notre boutique</p>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Main Story */}
        {store.story || store.description ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Notre histoire</h2>
            <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-line">
              {store.story || store.description}
            </div>
          </div>
        ) : null}

        {/* Store Information */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Founded Date */}
            {store.foundedAt && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Fondée en</p>
                  <p className="text-gray-600">
                    {new Date(store.foundedAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Owner */}
            {store.owner && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Store className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Propriétaire</p>
                  <p className="text-gray-600">{store.owner.name || store.owner.email}</p>
                </div>
              </div>
            )}

            {/* Location */}
            {publicAddress && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Localisation</p>
                  <div className="text-gray-600">
                    {publicAddress.street && <div>{publicAddress.street}</div>}
                    {(publicAddress.city || publicAddress.postalCode) && (
                      <div>
                        {publicAddress.postalCode} {publicAddress.city}
                      </div>
                    )}
                    {publicAddress.country && <div>{publicAddress.country}</div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Nous contacter</h2>
          <div className="space-y-4">
            {store.publicEmail && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <a
                    href={`mailto:${store.publicEmail}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {store.publicEmail}
                  </a>
                </div>
              </div>
            )}

            {store.publicPhone && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 rounded-lg">
                  <Phone className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Téléphone</p>
                  <a
                    href={`tel:${store.publicPhone}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {store.publicPhone}
                  </a>
                </div>
              </div>
            )}

            <div className="pt-4">
              <Link href={`/stores/${slug}/contact`}>
                <Button className="w-full md:w-auto">Envoyer un message</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Banner Image */}
        {store.bannerImage && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative w-full h-64">
              <Image
                src={store.bannerImage}
                alt={`Bannière ${store.name}`}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
