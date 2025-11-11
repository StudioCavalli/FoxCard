'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { trpc } from '@/lib/trpc/client'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, ArrowLeft, Check, Minus, Plus, Star } from 'lucide-react'

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const router = useRouter()
  const DEMO_STORE_ID = '000000000000000000000001'

  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  const addItem = useCartStore((state) => state.addItem)

  const { data: product, isLoading } = trpc.product.getBySlug.useQuery({
    storeId: DEMO_STORE_ID,
    slug,
  })

  // Get related products from same category
  const { data: relatedProducts } = trpc.product.getAll.useQuery(
    {
      storeId: DEMO_STORE_ID,
      categoryId: product?.categoryId,
      status: 'ACTIVE',
      limit: 4,
    },
    {
      enabled: !!product?.categoryId,
    }
  )

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gray-200 aspect-square rounded-2xl"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Produit introuvable</h1>
        <p className="text-gray-600 mb-6">Ce produit n'existe pas ou a été supprimé</p>
        <Link href="/products">
          <Button variant="primary">Retour aux produits</Button>
        </Link>
      </div>
    )
  }

  const images = product.images.length > 0 ? product.images : [product.thumbnail].filter(Boolean)
  const currentImage = images[selectedImage] || '/placeholder-product.png'
  const isOutOfStock = product.quantity <= 0

  // Filter related products to exclude current product
  const filteredRelatedProducts = relatedProducts?.products.filter(p => p.id !== product.id).slice(0, 4) || []

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: currentImage,
      quantity,
      maxQuantity: product.quantity,
    })
    router.push('/cart')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/products" className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Retour aux produits
      </Link>

      {/* Product Detail */}
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <Card variant="default" className="p-8 aspect-square relative overflow-hidden">
            <Image
              src={currentImage}
              alt={product.name}
              fill
              className="object-contain"
              priority
            />
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-lg shadow-lg">
                -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
              </div>
            )}
            {product.featured && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-bold px-3 py-1 rounded-lg shadow-lg flex items-center gap-1">
                <Star className="w-4 h-4 fill-current" />
                Populaire
              </div>
            )}
          </Card>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? 'border-primary-500 shadow-md scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:scale-105'
                  }`}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title & Category */}
          <div>
            {product.category && (
              <Link
                href={`/products?category=${product.category.id}`}
                className="text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors inline-block mb-2"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
            {product.sku && (
              <p className="text-sm text-gray-600">SKU: {product.sku}</p>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xl text-gray-500 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <span className="text-red-600 font-medium flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Rupture de stock
              </span>
            ) : product.quantity < 10 ? (
              <span className="text-yellow-600 font-medium">
                Plus que {product.quantity} en stock
              </span>
            ) : (
              <>
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-green-600 font-medium">En stock</span>
              </>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          {/* Quantity Selector & Add to Cart */}
          {!isOutOfStock && (
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-gray-100 transition-colors disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="px-6 font-semibold text-lg min-w-[60px] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                      className="p-3 hover:bg-gray-100 transition-colors disabled:opacity-50"
                      disabled={quantity >= product.quantity}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <span className="text-gray-600">
                    {formatPrice(product.price * quantity)} total
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Ajouter au panier
              </Button>
            </div>
          )}

          {/* Product Features */}
          <div className="border-t border-gray-200 pt-6 space-y-3">
            <div className="flex items-center gap-3 text-gray-600">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Livraison gratuite</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Paiement sécurisé</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Retours sous 30 jours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {filteredRelatedProducts.length > 0 && (
        <div className="mt-16 border-t border-gray-200 pt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Produits similaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredRelatedProducts.map((relatedProduct) => (
              <Link key={relatedProduct.id} href={`/products/${relatedProduct.slug}`}>
                <Card variant="default" className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="relative aspect-square overflow-hidden rounded-t-2xl">
                    <Image
                      src={relatedProduct.images[0] || relatedProduct.thumbnail || '/placeholder-product.png'}
                      alt={relatedProduct.name}
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-xl font-bold text-gray-900">
                      {formatPrice(relatedProduct.price)}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
