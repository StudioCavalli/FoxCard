'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/lib/store/cart'
import { ShoppingCart, Plus, Tag } from 'lucide-react'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    compareAtPrice?: number | null
    images: string[]
    thumbnail?: string | null
    quantity: number
    tags?: string[]
  }
  storeSlug: string
  colorVariant?: 'teal' | 'pink' | 'yellow' | 'blue' | 'green' | 'purple' | 'orange'
}

export function ProductCard({ product, storeSlug }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)

  const imageUrl = product.thumbnail || product.images[0] || '/placeholder-product.png'

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: imageUrl,
      maxQuantity: product.quantity,
    })
  }

  const isOutOfStock = product.quantity <= 0
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const discountPercent = hasDiscount && product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
      style={{ fontFamily: 'var(--theme-font-body)' }}
    >
      <article className="relative h-full bg-theme-surface border border-theme-border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-theme-primary/10 hover:-translate-y-1 hover:border-theme-border-light">

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-theme-primary/5 to-theme-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Image Container */}
        <div className="relative aspect-square bg-theme-background/50 overflow-hidden">
          <div className="relative w-full h-full p-8">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 z-10">
            {/* Out of Stock Badge */}
            {isOutOfStock && (
              <div className="px-3 py-1.5 bg-theme-surface/95 backdrop-blur-md border border-theme-border rounded-full text-xs font-semibold text-theme-text-muted shadow-lg">
                Rupture de stock
              </div>
            )}

            {/* Discount Badge */}
            {hasDiscount && (
              <div className="ml-auto px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full text-xs font-bold shadow-lg shadow-red-500/50 transform group-hover:scale-110 transition-transform duration-200">
                -{discountPercent}%
              </div>
            )}
          </div>

          {/* Quick Add Button - Appears on Hover */}
          <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full px-4 py-3 bg-theme-primary hover:bg-theme-primary/90 disabled:bg-theme-surface/50 disabled:cursor-not-allowed text-theme-background disabled:text-theme-text-muted rounded-xl font-semibold text-sm shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-sm"
              style={{ fontFamily: 'var(--theme-font-heading)' }}
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              {isOutOfStock ? 'Indisponible' : 'Ajouter'}
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="relative p-5">
          {/* Product Name */}
          <h3
            className="font-semibold text-theme-text text-base mb-2 line-clamp-2 group-hover:text-theme-primary transition-colors duration-200"
            style={{ fontFamily: 'var(--theme-font-heading)', lineHeight: '1.4' }}
          >
            {product.name}
          </h3>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {product.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-theme-primary/10 text-theme-primary font-medium rounded text-xs"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
              {product.tags.length > 2 && (
                <span className="inline-flex items-center px-2 py-0.5 bg-theme-surface border border-theme-border text-theme-text-muted font-medium rounded text-xs">
                  +{product.tags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Price Section */}
          <div className="flex items-baseline gap-2.5">
            <span
              className="text-2xl font-bold text-theme-text"
              style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
            >
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-theme-text-muted line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>

          {/* Stock Indicator */}
          {!isOutOfStock && product.quantity < 10 && (
            <p className="mt-2 text-xs text-theme-text-muted">
              Plus que {product.quantity} en stock
            </p>
          )}
        </div>
      </article>
    </Link>
  )
}
