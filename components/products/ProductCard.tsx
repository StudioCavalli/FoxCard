'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/lib/store/cart'
import { ShoppingCart } from 'lucide-react'

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
  }
  storeSlug: string
  colorVariant?: 'teal' | 'pink' | 'yellow' | 'blue' | 'green' | 'purple' | 'orange'
}

const colorVariants = ['teal', 'pink', 'yellow', 'blue', 'green', 'purple', 'orange'] as const

export function ProductCard({ product, storeSlug, colorVariant }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)

  // Auto-select color variant based on product id if not provided
  const variant = colorVariant || colorVariants[parseInt(product.id.slice(-1), 16) % colorVariants.length]

  const imageUrl = product.thumbnail || product.images[0] || '/placeholder-product.png'

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: imageUrl,
      maxQuantity: product.quantity,
    })
  }

  const isOutOfStock = product.quantity <= 0

  return (
    <Link href={`/products/${product.slug}`}>
      <Card variant={variant} hover className="group overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-square p-6">
          <div className="relative w-full h-full">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-contain transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          {/* Discount Badge */}
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
              -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
            </div>
          )}

          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-lg">
              Rupture de stock
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-6 pt-0">
          <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {isOutOfStock ? 'Indisponible' : 'Ajouter au panier'}
          </Button>
        </div>
      </Card>
    </Link>
  )
}
