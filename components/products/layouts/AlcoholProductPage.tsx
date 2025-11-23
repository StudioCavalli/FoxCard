'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import {
  ArrowLeft, Wine, Star, MapPin, Calendar, Thermometer,
  Grape, Award, ShieldCheck, AlertTriangle, Check, Minus, Plus
} from 'lucide-react'
import { useTranslations } from 'next-intl'

interface AlcoholProductPageProps {
  product: any
}

export function AlcoholProductPage({ product }: AlcoholProductPageProps) {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'fr'
  const t = useTranslations()
  const addItem = useCartStore((state) => state.addItem)

  const [quantity, setQuantity] = useState(1)
  const [showAgeVerification, setShowAgeVerification] = useState(false)
  const [ageVerified, setAgeVerified] = useState(false)

  const images = product.images?.length > 0
    ? product.images
    : product.thumbnail
    ? [product.thumbnail]
    : ['/placeholder-wine.png']
  const mainImage = images[0] || '/placeholder-wine.png'

  // Wine attributes
  const attributes = product.attributes || {}
  const vintage = attributes.vintage || new Date().getFullYear()
  const region = attributes.region || 'France'
  const appellation = attributes.appellation || ''
  const grapeVariety = attributes.grapeVariety || ''
  const alcoholPercentage = attributes.alcoholPercentage || 13
  const volume = attributes.volume || '750ml'
  const servingTemp = attributes.servingTemp || '16-18°C'
  const rating = attributes.rating || 0
  const tastingNotes = attributes.tastingNotes || {
    nose: '',
    palate: '',
    finish: '',
  }
  const pairings = attributes.pairings || []
  const awards = attributes.awards || []

  const handleAddToCart = () => {
    if (!ageVerified) {
      setShowAgeVerification(true)
      return
    }

    addItem({
      id: product.id,
      productId: product.id,
      storeId: product.storeId,
      storeName: product.store?.name,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: mainImage,
      quantity,
      maxQuantity: product.quantity || 99,
      commerceType: 'ALCOHOL',
      attributes: {
        vintage,
        region,
        volume,
      },
    })
  }

  const handleAgeConfirm = () => {
    setAgeVerified(true)
    setShowAgeVerification(false)
    // Add to cart after verification
    addItem({
      id: product.id,
      productId: product.id,
      storeId: product.storeId,
      storeName: product.store?.name,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: mainImage,
      quantity,
      maxQuantity: product.quantity || 99,
      commerceType: 'ALCOHOL',
      attributes: {
        vintage,
        region,
        volume,
      },
    })
  }

  return (
    <div style={{ fontFamily: 'var(--theme-font-body)' }}>
      <div className="mx-auto px-6 lg:px-8 py-8" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
        {/* Back button */}
        <Link
          href={`/${locale}/stores/${product.store?.slug || ''}/products`}
          className="inline-flex items-center gap-2 mb-8 hover:opacity-70 transition-opacity"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux vins</span>
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="space-y-4">
            <div
              className="relative aspect-[3/4] rounded-2xl overflow-hidden"
              style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}
            >
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-contain p-8"
                priority
              />
              {rating > 0 && (
                <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-800">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold">{rating}/100</span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Title & Price */}
            <div>
              <div className="flex items-center gap-2 text-sm mb-2" style={{ color: 'var(--theme-text-secondary)' }}>
                <MapPin className="w-4 h-4" />
                <span>{region}</span>
                {appellation && (
                  <>
                    <span>•</span>
                    <span>{appellation}</span>
                  </>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--theme-text)', fontFamily: 'var(--theme-font-heading)' }}>
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold" style={{ color: 'var(--theme-accent)' }}>
                  {formatPrice(product.price)}
                </span>
                <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                  / {volume}
                </span>
              </div>
            </div>

            {/* Wine Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
                <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--theme-text-secondary)' }}>
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Millésime</span>
                </div>
                <p className="font-bold text-lg" style={{ color: 'var(--theme-text)' }}>{vintage}</p>
              </div>
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
                <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--theme-text-secondary)' }}>
                  <Wine className="w-4 h-4" />
                  <span className="text-sm">Alcool</span>
                </div>
                <p className="font-bold text-lg" style={{ color: 'var(--theme-text)' }}>{alcoholPercentage}%</p>
              </div>
              {grapeVariety && (
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
                  <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--theme-text-secondary)' }}>
                    <Grape className="w-4 h-4" />
                    <span className="text-sm">Cépage</span>
                  </div>
                  <p className="font-bold" style={{ color: 'var(--theme-text)' }}>{grapeVariety}</p>
                </div>
              )}
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
                <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--theme-text-secondary)' }}>
                  <Thermometer className="w-4 h-4" />
                  <span className="text-sm">Service</span>
                </div>
                <p className="font-bold" style={{ color: 'var(--theme-text)' }}>{servingTemp}</p>
              </div>
            </div>

            {/* Tasting Notes */}
            {(tastingNotes.nose || tastingNotes.palate || tastingNotes.finish) && (
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
                <h3 className="font-semibold mb-3" style={{ color: 'var(--theme-text)' }}>Notes de dégustation</h3>
                <div className="space-y-2 text-sm">
                  {tastingNotes.nose && (
                    <div>
                      <span className="font-medium" style={{ color: 'var(--theme-text)' }}>Nez: </span>
                      <span style={{ color: 'var(--theme-text-secondary)' }}>{tastingNotes.nose}</span>
                    </div>
                  )}
                  {tastingNotes.palate && (
                    <div>
                      <span className="font-medium" style={{ color: 'var(--theme-text)' }}>Bouche: </span>
                      <span style={{ color: 'var(--theme-text-secondary)' }}>{tastingNotes.palate}</span>
                    </div>
                  )}
                  {tastingNotes.finish && (
                    <div>
                      <span className="font-medium" style={{ color: 'var(--theme-text)' }}>Finale: </span>
                      <span style={{ color: 'var(--theme-text-secondary)' }}>{tastingNotes.finish}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pairings */}
            {pairings.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--theme-text)' }}>Accords mets & vins</h3>
                <div className="flex flex-wrap gap-2">
                  {pairings.map((pairing: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-sm rounded-full"
                      style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)', color: 'var(--theme-text-secondary)' }}
                    >
                      {pairing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Awards */}
            {awards.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--theme-text)' }}>Récompenses</h3>
                <div className="space-y-2">
                  {awards.map((award: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span style={{ color: 'var(--theme-text-secondary)' }}>{award}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'var(--theme-border)' }}>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium" style={{ color: 'var(--theme-text)' }}>Quantité</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded-lg hover:opacity-70"
                    style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.quantity || 99, quantity + 1))}
                    className="p-2 rounded-lg hover:opacity-70"
                    style={{ backgroundColor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full py-4 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--theme-accent)' }}
              >
                Ajouter au panier - {formatPrice(product.price * quantity)}
              </button>

              {/* Legal Warning */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 text-orange-800 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>L'abus d'alcool est dangereux pour la santé. À consommer avec modération.</p>
              </div>
            </div>

            {/* Stock */}
            {product.quantity !== undefined && product.quantity <= 10 && (
              <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                {product.quantity === 0 ? (
                  <span className="text-red-600">Rupture de stock</span>
                ) : (
                  <span>Plus que {product.quantity} bouteilles en stock</span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-12 max-w-3xl">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--theme-text)', fontFamily: 'var(--theme-font-heading)' }}>
              Description
            </h2>
            <div className="prose" style={{ color: 'var(--theme-text-secondary)' }}>
              <p>{product.description}</p>
            </div>
          </div>
        )}
      </div>

      {/* Age Verification Modal */}
      {showAgeVerification && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Vérification de l'âge</h3>
            <p className="text-gray-600 mb-6">
              Vous devez avoir l'âge légal pour acheter de l'alcool dans votre pays de résidence.
            </p>
            <p className="font-semibold mb-6">Avez-vous 18 ans ou plus ?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAgeVerification(false)}
                className="flex-1 py-3 rounded-xl border border-gray-300 font-medium hover:bg-gray-50"
              >
                Non
              </button>
              <button
                onClick={handleAgeConfirm}
                className="flex-1 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700"
              >
                Oui, j'ai 18 ans ou plus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
