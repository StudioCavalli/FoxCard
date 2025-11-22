'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, ArrowLeft, Check, Minus, Plus, Star, Tag, ZoomIn } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface StandardProductPageProps {
  product: any
}

export function StandardProductPage({ product }: StandardProductPageProps) {
  const router = useRouter()
  const t = useTranslations()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [isZoomed, setIsZoomed] = useState(false)

  const addItem = useCartStore((state) => state.addItem)

  const images = product.images?.length > 0
    ? product.images
    : product.thumbnail
    ? [product.thumbnail]
    : ['/placeholder-product.png']
  const currentImage = images[selectedImage] || '/placeholder-product.png'
  const isOutOfStock = product.quantity <= 0

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      productId: product.id,
      storeId: product.storeId,
      storeName: product.store?.name,
      name: product.name,
      slug: product.slug,
      price: selectedVariant
        ? product.variants?.find((v: any) => v.id === selectedVariant)?.price || product.price
        : product.price,
      image: currentImage,
      quantity,
      maxQuantity: product.quantity,
      variantId: selectedVariant || undefined,
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
          {t('product.backToProducts')}
        </Link>

        {/* Product Detail */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images with Zoom */}
          <div className="space-y-4">
            <div
              className="relative p-8 aspect-square bg-theme-surface border border-theme-border rounded-2xl overflow-hidden cursor-zoom-in group"
              onClick={() => setIsZoomed(true)}
            >
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="absolute bottom-4 right-4 bg-theme-background/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-5 h-5 text-theme-text" />
              </div>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                  -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                </div>
              )}
              {product.featured && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-theme-primary to-theme-accent text-theme-background text-sm font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" />
                  {t('product.popular')}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((image: string, index: number) => (
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
                {formatPrice(
                  selectedVariant
                    ? product.variants?.find((v: any) => v.id === selectedVariant)?.price || product.price
                    : product.price
                )}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xl text-theme-text-muted line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-theme-surface border border-theme-border">
              {isOutOfStock ? (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-theme-text font-medium">{t('product.outOfStock')}</span>
                </>
              ) : product.quantity < 10 ? (
                <>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  <span className="text-theme-text font-medium">{t('product.onlyLeft', { count: product.quantity })}</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-theme-text font-medium">{t('product.inStock')}</span>
                </>
              )}
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-theme-surface border border-theme-border text-theme-text-secondary font-medium rounded-full text-sm"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="border-t border-theme-border pt-6">
                <h3 className="font-semibold text-theme-text mb-3 text-lg" style={{ fontFamily: 'var(--theme-font-heading)' }}>
                  {t('product.description')}
                </h3>
                <p className="text-theme-text-secondary leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            {/* Variants Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="border-t border-theme-border pt-6">
                <label className="block text-sm font-semibold text-theme-text mb-3" style={{ fontFamily: 'var(--theme-font-heading)' }}>
                  {t('product.availableOptions')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map((variant: any) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      disabled={variant.quantity <= 0}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        selectedVariant === variant.id
                          ? 'border-theme-primary bg-theme-primary/5 shadow-lg shadow-theme-primary/10'
                          : variant.quantity <= 0
                          ? 'border-theme-border bg-theme-surface/50 opacity-50 cursor-not-allowed'
                          : 'border-theme-border hover:border-theme-border-light hover:bg-theme-surface'
                      }`}
                    >
                      <div className="font-semibold text-theme-text mb-1">{variant.name}</div>
                      <div className="text-sm text-theme-text-secondary">
                        {formatPrice(variant.price || product.price)}
                      </div>
                      {variant.quantity <= 0 && (
                        <div className="text-xs text-red-600 mt-1">{t('product.outOfStock')}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            {!isOutOfStock && (
              <div className="border-t border-theme-border pt-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-theme-text mb-3" style={{ fontFamily: 'var(--theme-font-heading)' }}>
                    {t('product.quantity')}
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
                      {formatPrice(
                        (selectedVariant
                          ? product.variants?.find((v: any) => v.id === selectedVariant)?.price || product.price
                          : product.price) * quantity
                      )} {t('product.total')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full px-8 py-4 bg-theme-primary hover:bg-theme-primary/90 text-theme-background rounded-xl font-semibold text-lg shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                  style={{ fontFamily: 'var(--theme-font-heading)' }}
                >
                  <ShoppingCart className="w-5 h-5" strokeWidth={2.5} />
                  {t('product.addToCart')}
                </button>
              </div>
            )}

            {/* Trust Badges */}
            <div className="border-t border-theme-border pt-6 space-y-3">
              <div className="flex items-center gap-3 text-theme-text-secondary">
                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-medium">{t('product.freeDelivery')}</span>
              </div>
              <div className="flex items-center gap-3 text-theme-text-secondary">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="font-medium">{t('product.securePayment')}</span>
              </div>
              <div className="flex items-center gap-3 text-theme-text-secondary">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <span className="font-medium">{t('product.returns30days')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative w-full h-full max-w-4xl max-h-[90vh] m-8">
            <Image
              src={currentImage}
              alt={product.name}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}
    </div>
  )
}
