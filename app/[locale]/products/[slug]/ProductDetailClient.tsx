'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { trpc } from '@/lib/trpc/client'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, ArrowLeft, Check, Minus, Plus, Star, Tag } from 'lucide-react'
import { usePublicStore } from '@/lib/context/public-store-context'

interface ProductDetailClientProps {
  slug: string
  initialStoreId?: string
}

export function ProductDetailClient({ slug, initialStoreId }: ProductDetailClientProps) {
  const router = useRouter()
  const { selectedStore } = usePublicStore()

  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)

  const addItem = useCartStore((state) => state.addItem)

  // Find product by slug across all stores or specific store
  const { data: product, isLoading } = trpc.product.getBySlug.useQuery({
    storeId: initialStoreId || (selectedStore === 'all' ? undefined : selectedStore),
    slug,
  })

  // Get related products from same category and store
  const { data: relatedProducts } = trpc.product.getAll.useQuery(
    {
      storeId: product?.storeId,
      categoryId: product?.categoryId ?? undefined,
      status: 'ACTIVE',
      limit: 4,
    },
    {
      enabled: !!product?.categoryId && !!product?.storeId,
    }
  )

  if (isLoading) {
    return (
      <div style={{ fontFamily: 'var(--theme-font-body)' }}>
        <div className="mx-auto px-6 lg:px-8 py-16" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-32 bg-theme-surface border border-theme-border rounded-xl"></div>
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="bg-theme-surface border border-theme-border aspect-square rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-theme-surface border border-theme-border rounded-xl"></div>
                <div className="h-6 w-1/2 bg-theme-surface border border-theme-border rounded-xl"></div>
                <div className="h-24 bg-theme-surface border border-theme-border rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div style={{ fontFamily: 'var(--theme-font-body)' }}>
        <div className="mx-auto px-6 lg:px-8 py-16 text-center" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
          <div className="w-16 h-16 bg-theme-surface border border-theme-border rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-theme-text-muted" />
          </div>
          <h1
            className="text-3xl font-bold text-theme-text mb-4"
            style={{ fontFamily: 'var(--theme-font-heading)' }}
          >
            Produit introuvable
          </h1>
          <p className="text-theme-text-secondary mb-6">Ce produit n'existe pas ou a été supprimé</p>
          <Link href="/products">
            <button className="px-8 py-3.5 bg-theme-primary hover:bg-theme-primary/90 text-theme-background rounded-xl font-semibold shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200">
              Retour aux produits
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const images = product.images.length > 0
    ? product.images
    : product.thumbnail
    ? [product.thumbnail]
    : ['/placeholder-product.png']
  const currentImage = images[selectedImage] || '/placeholder-product.png'
  const isOutOfStock = product.quantity <= 0

  // Filter related products to exclude current product
  const filteredRelatedProducts = relatedProducts?.products.filter(p => p.id !== product.id).slice(0, 4) || []

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      productId: product.id,
      storeId: product.storeId,
      storeName: product.store?.name,
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
    <div style={{ fontFamily: 'var(--theme-font-body)' }}>
      <div className="mx-auto px-6 lg:px-8 py-12" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
        {/* Back Button */}
        <Link
          href="/products"
          className="group inline-flex items-center text-theme-text-secondary hover:text-theme-primary mb-8 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
          Retour aux produits
        </Link>

        {/* Product Detail */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative p-8 aspect-square bg-theme-surface border border-theme-border rounded-2xl overflow-hidden">
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg shadow-red-500/50">
                  -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                </div>
              )}
              {product.featured && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-theme-primary to-theme-accent text-theme-background text-sm font-bold px-3 py-1.5 rounded-full shadow-lg shadow-theme-primary/50 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" />
                  Populaire
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === index
                        ? 'border-theme-primary shadow-lg shadow-theme-primary/20 scale-105'
                        : 'border-theme-border hover:border-theme-border-light hover:scale-105'
                    }`}
                  >
                    <div className="relative w-full h-full bg-theme-surface">
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 25vw, 100px"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {product.category && (
                <Link
                  href={`/products?category=${product.category.id}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-theme-primary/10 text-theme-primary font-medium rounded-full text-sm hover:bg-theme-primary/20 transition-colors duration-200 mb-4"
                >
                  {product.category.name}
                </Link>
              )}
              <h1
                className="text-4xl md:text-5xl font-bold text-theme-text mb-3"
                style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
              >
                {product.name}
              </h1>
              {product.sku && (
                <p className="text-sm text-theme-text-muted">SKU: {product.sku}</p>
              )}
            </div>

            <div className="flex items-baseline gap-4">
              <span
                className="text-4xl md:text-5xl font-bold text-theme-text"
                style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
              >
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xl text-theme-text-muted line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-theme-surface border border-theme-border">
              {isOutOfStock ? (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-theme-text font-medium">Rupture de stock</span>
                </>
              ) : product.quantity < 10 ? (
                <>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  <span className="text-theme-text font-medium">Plus que {product.quantity} en stock</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-theme-text font-medium">En stock</span>
                </>
              )}
            </div>

            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-theme-surface border border-theme-border text-theme-text-secondary font-medium rounded-full text-sm hover:bg-theme-primary/5 hover:border-theme-primary/30 transition-all duration-200"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {product.description && (
              <div className="border-t border-theme-border pt-6">
                <h3
                  className="font-semibold text-theme-text mb-3 text-lg"
                  style={{ fontFamily: 'var(--theme-font-heading)' }}
                >
                  Description
                </h3>
                <p className="text-theme-text-secondary leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            {product.variants && product.variants.length > 0 && (
              <div className="border-t border-theme-border pt-6">
                <label
                  className="block text-sm font-semibold text-theme-text mb-3"
                  style={{ fontFamily: 'var(--theme-font-heading)' }}
                >
                  Options disponibles
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        selectedVariant === variant.id
                          ? 'border-theme-primary bg-theme-primary/5 shadow-lg shadow-theme-primary/10'
                          : 'border-theme-border hover:border-theme-border-light hover:bg-theme-surface'
                      }`}
                    >
                      <div className="font-semibold text-theme-text mb-1">{variant.name}</div>
                      <div className="text-sm text-theme-text-secondary">
                        {formatPrice(variant.price || product.price)}
                      </div>
                      {variant.quantity <= 0 && (
                        <div className="text-xs text-red-600 mt-1">Rupture de stock</div>
                      )}
                      {variant.quantity > 0 && variant.quantity < 5 && (
                        <div className="text-xs text-yellow-600 mt-1">Plus que {variant.quantity}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isOutOfStock && (
              <div className="border-t border-theme-border pt-6 space-y-5">
                <div>
                  <label
                    className="block text-sm font-semibold text-theme-text mb-3"
                    style={{ fontFamily: 'var(--theme-font-heading)' }}
                  >
                    Quantité
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-theme-surface border border-theme-border rounded-xl overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3 text-theme-text hover:bg-theme-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="px-6 font-semibold text-lg min-w-[60px] text-center text-theme-text" style={{ fontFamily: 'var(--theme-font-heading)' }}>
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                        className="p-3 text-theme-text hover:bg-theme-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={quantity >= product.quantity}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <span className="text-theme-text-secondary font-medium">
                      {formatPrice(product.price * quantity)} total
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full px-8 py-4 bg-theme-primary hover:bg-theme-primary/90 text-theme-background rounded-xl font-semibold text-lg shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                  style={{ fontFamily: 'var(--theme-font-heading)' }}
                >
                  <ShoppingCart className="w-5 h-5" strokeWidth={2.5} />
                  Ajouter au panier
                </button>
              </div>
            )}

            <div className="border-t border-theme-border pt-6 space-y-3">
              <div className="flex items-center gap-3 text-theme-text-secondary">
                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-medium">Livraison gratuite</span>
              </div>
              <div className="flex items-center gap-3 text-theme-text-secondary">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="font-medium">Paiement sécurisé</span>
              </div>
              <div className="flex items-center gap-3 text-theme-text-secondary">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <span className="font-medium">Retours sous 30 jours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {filteredRelatedProducts.length > 0 && (
          <div className="mt-20 pt-16 border-t border-theme-border">
            <h2
              className="text-3xl md:text-4xl font-bold text-theme-text mb-10"
              style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
            >
              Produits similaires
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredRelatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id}>
                  <Link href={`/products/${relatedProduct.slug}`} className="group block">
                    <div className="relative h-full bg-theme-surface border border-theme-border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-theme-primary/10 hover:-translate-y-1 hover:border-theme-border-light">
                      <div className="absolute inset-0 bg-gradient-to-br from-theme-primary/5 to-theme-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      <div className="relative aspect-square bg-theme-background/50 overflow-hidden">
                        <div className="relative w-full h-full p-6">
                          <Image
                            src={relatedProduct.images[0] || relatedProduct.thumbnail || '/placeholder-product.png'}
                            alt={relatedProduct.name}
                            fill
                            className="object-contain transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                        </div>
                      </div>
                      <div className="relative p-5">
                        <h3
                          className="font-semibold text-theme-text text-base mb-2 line-clamp-2 group-hover:text-theme-primary transition-colors duration-200"
                          style={{ fontFamily: 'var(--theme-font-heading)', lineHeight: '1.4' }}
                        >
                          {relatedProduct.name}
                        </h3>
                        <p
                          className="text-xl font-bold text-theme-text"
                          style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
                        >
                          {formatPrice(relatedProduct.price)}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
