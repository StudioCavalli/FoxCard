'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/lib/store/cart'
import { CommerceType } from '@/lib/commerce-types'
import {
  ShoppingCart,
  Plus,
  Heart,
  Star,
  Leaf,
  Wheat,
  Scale,
  Wine,
  Clock,
  Calendar,
  Users,
  Wifi,
  Car,
  Waves,
  MapPin,
  Plane,
  ChevronLeft,
  ChevronRight,
  Ruler,
  Palette,
  Award,
  Cpu,
  HardDrive,
  Monitor,
} from 'lucide-react'

interface ProductData {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  images: string[]
  thumbnail?: string | null
  quantity: number
  tags?: string[]
  commerceType?: CommerceType
  attributes?: Record<string, unknown>
  variants?: Array<{
    id: string
    name: string
    options: Record<string, string>
    price?: number
    quantity: number
  }>
  store?: {
    id: string
    name: string
    slug: string
    logo: string | null
  }
}

interface ProductCardVariantProps {
  product: ProductData
  storeSlug?: string
  showStoreName?: boolean
}

// Fashion Card - Size selector, color swatches, wishlist
export function FashionProductCard({ product, showStoreName }: ProductCardVariantProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [hoveredImageIdx, setHoveredImageIdx] = useState(0)
  const addItem = useCartStore((state) => state.addItem)

  const imageUrl = product.images[hoveredImageIdx] || product.thumbnail || '/placeholder-product.png'
  const isOutOfStock = product.quantity <= 0
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const discountPercent = hasDiscount && product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  const sizes = (product.attributes?.sizes as string[]) || ['XS', 'S', 'M', 'L', 'XL']
  const colors = (product.attributes?.colors as string[]) || []

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <article className="relative h-full bg-white dark:bg-slate-800 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
        {/* Image Container */}
        <div
          className="relative aspect-[3/4] bg-gray-50 dark:bg-slate-700 overflow-hidden"
          onMouseEnter={() => product.images.length > 1 && setHoveredImageIdx(1)}
          onMouseLeave={() => setHoveredImageIdx(0)}
        >
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsWishlisted(!isWishlisted)
            }}
            className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-slate-800/90 rounded-full shadow-md hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            />
          </button>

          {/* Badges */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
              -{discountPercent}%
            </div>
          )}

          {/* Quick Size Selector */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
            <div className="flex items-center justify-center gap-1.5">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={(e) => {
                    e.preventDefault()
                    setSelectedSize(size)
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                    selectedSize === size
                      ? 'bg-white text-black'
                      : 'bg-white/20 text-white hover:bg-white/40'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          {/* Color Swatches */}
          {colors.length > 0 && (
            <div className="flex gap-1.5 mb-2">
              {colors.slice(0, 5).map((color, idx) => (
                <div
                  key={idx}
                  className="w-4 h-4 rounded-full border border-gray-200"
                  style={{ backgroundColor: color }}
                />
              ))}
              {colors.length > 5 && (
                <span className="text-xs text-gray-500">+{colors.length - 5}</span>
              )}
            </div>
          )}

          <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1 mb-1">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}

// Electronics Card - Specs, rating, compare
export function ElectronicsProductCard({ product, showStoreName }: ProductCardVariantProps) {
  const imageUrl = product.thumbnail || product.images[0] || '/placeholder-product.png'
  const isOutOfStock = product.quantity <= 0
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price

  const specs = {
    ram: product.attributes?.ram as string,
    storage: product.attributes?.storage as string,
    brand: product.attributes?.brand as string,
  }
  const rating = 4.5 // Mock rating

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <article className="relative h-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-blue-500/50">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 dark:bg-slate-700 p-6">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
          {isOutOfStock && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-gray-900/80 text-white text-xs rounded">
              Rupture
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-700">
          {/* Brand */}
          {specs.brand && (
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide">
              {specs.brand}
            </span>
          )}

          <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 mt-1 mb-2">
            {product.name}
          </h3>

          {/* Specs */}
          <div className="flex flex-wrap gap-2 mb-3">
            {specs.ram && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                <Cpu className="w-3 h-3" />
                {specs.ram}
              </span>
            )}
            {specs.storage && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                <HardDrive className="w-3 h-3" />
                {specs.storage}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.floor(rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-sm text-gray-500 ml-1">({rating})</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}

// Food Card - Badges, price/kg, allergens
export function FoodProductCard({ product, showStoreName }: ProductCardVariantProps) {
  const imageUrl = product.thumbnail || product.images[0] || '/placeholder-product.png'
  const isOutOfStock = product.quantity <= 0

  const isBio = product.tags?.includes('bio')
  const isVegan = product.tags?.includes('vegan')
  const isGlutenFree = product.tags?.includes('sans-gluten')
  const weight = product.attributes?.weight as string
  const pricePerKg = weight ? (product.price / parseFloat(weight.replace(/[^\d.]/g, '')) * 1000).toFixed(2) : null

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <article className="relative h-full bg-white dark:bg-slate-800 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg">
        {/* Image */}
        <div className="relative aspect-square bg-orange-50 dark:bg-slate-700">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
            {isBio && (
              <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                <Leaf className="w-3 h-3" />
                Bio
              </span>
            )}
            {isVegan && (
              <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full">
                Vegan
              </span>
            )}
            {isGlutenFree && (
              <span className="px-2 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                <Wheat className="w-3 h-3" />
                Sans gluten
              </span>
            )}
          </div>

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="px-4 py-2 bg-white text-gray-900 font-semibold rounded-lg">
                Indisponible
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-2">
            {product.name}
          </h3>

          {/* Weight & Price/kg */}
          {weight && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {weight}
              {pricePerKg && (
                <span className="ml-2 text-xs">({pricePerKg}€/kg)</span>
              )}
            </p>
          )}

          <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
            {formatPrice(product.price)}
          </span>
        </div>
      </article>
    </Link>
  )
}

// Hotel Card - Gallery, stars, amenities
export function HotelProductCard({ product, showStoreName }: ProductCardVariantProps) {
  const [currentImage, setCurrentImage] = useState(0)

  const images = product.images.length > 0 ? product.images : [product.thumbnail || '/placeholder-product.png']
  const stars = (product.attributes?.stars as number) || 4
  const amenities = (product.attributes?.amenities as string[]) || []

  const amenityIcons: Record<string, typeof Wifi> = {
    wifi: Wifi,
    parking: Car,
    piscine: Waves,
    pool: Waves,
  }

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <article className="relative h-full bg-white dark:bg-slate-800 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
        {/* Image Carousel */}
        <div className="relative aspect-[4/3] bg-gray-100 dark:bg-slate-700">
          <Image
            src={images[currentImage]}
            alt={product.name}
            fill
            className="object-cover"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full ${
                      idx === currentImage ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          {/* Stars */}
          <div className="flex items-center gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>

          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 mb-2">
            {product.name}
          </h3>

          {/* Amenities */}
          {amenities.length > 0 && (
            <div className="flex gap-2 mb-3">
              {amenities.slice(0, 4).map((amenity, idx) => {
                const Icon = amenityIcons[amenity.toLowerCase()] || Wifi
                return (
                  <div
                    key={idx}
                    className="p-1.5 bg-gray-100 dark:bg-slate-700 rounded"
                    title={amenity}
                  >
                    <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                )
              })}
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(product.price)}
            </span>
            <span className="text-sm text-gray-500">/nuit</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

// Travel Card - Dates, duration, from price
export function TravelProductCard({ product, showStoreName }: ProductCardVariantProps) {
  const imageUrl = product.thumbnail || product.images[0] || '/placeholder-product.png'

  const destination = product.attributes?.destination as string
  const duration = product.attributes?.tripDuration as string
  const departureDate = product.attributes?.departureDate as string

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <article className="relative h-full bg-white dark:bg-slate-800 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
        {/* Image */}
        <div className="relative aspect-[16/10] bg-gray-100 dark:bg-slate-700">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Location */}
          {destination && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">{destination}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-3">
            {product.name}
          </h3>

          {/* Details */}
          <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-600 dark:text-gray-400">
            {duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {duration}
              </span>
            )}
            {departureDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(departureDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className="text-sm text-gray-500">à partir de</span>
            <span className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

// Recreation Card - Duration, difficulty, age
export function RecreationProductCard({ product, showStoreName }: ProductCardVariantProps) {
  const imageUrl = product.thumbnail || product.images[0] || '/placeholder-product.png'

  const duration = product.attributes?.activityDuration as string
  const difficulty = product.attributes?.difficulty as string
  const minAge = product.attributes?.minAge as number

  const difficultyColors: Record<string, string> = {
    easy: 'bg-green-100 text-green-700',
    moderate: 'bg-yellow-100 text-yellow-700',
    difficult: 'bg-red-100 text-red-700',
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <article className="relative h-full bg-white dark:bg-slate-800 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-purple-50 dark:bg-slate-700">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Difficulty Badge */}
          {difficulty && (
            <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded ${difficultyColors[difficulty] || 'bg-gray-100 text-gray-700'}`}>
              {difficulty === 'easy' ? 'Facile' : difficulty === 'moderate' ? 'Modéré' : 'Difficile'}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-3">
            {product.name}
          </h3>

          {/* Details */}
          <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-600 dark:text-gray-400">
            {duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {duration}
              </span>
            )}
            {minAge && (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {minAge}+ ans
              </span>
            )}
          </div>

          <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
            {formatPrice(product.price)}
          </span>
        </div>
      </article>
    </Link>
  )
}

/**
 * Get the appropriate product card component based on commerce type
 */
export function getProductCardForCommerceType(commerceType?: CommerceType) {
  switch (commerceType) {
    case 'FASHION':
      return FashionProductCard
    case 'ELECTRONICS':
      return ElectronicsProductCard
    case 'FOOD':
    case 'ALCOHOL':
      return FoodProductCard
    case 'HOTEL':
      return HotelProductCard
    case 'TRAVEL':
      return TravelProductCard
    case 'RECREATION':
      return RecreationProductCard
    default:
      return null // Use default ProductCard
  }
}
