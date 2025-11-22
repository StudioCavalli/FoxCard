'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, Minus, Plus, X, ArrowLeft, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function CartPage() {
  const t = useTranslations()
  const router = useRouter()
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice, getTotalItems, getItemsByStore, getStoreSubtotal, getUniqueStoresCount } = useCartStore()

  const subtotal = getTotalPrice()
  const shipping = subtotal > 50 ? 0 : 5.99
  const total = subtotal + shipping

  if (items.length === 0) {
    return (
      <div style={{ fontFamily: 'var(--theme-font-body)' }}>
        <div className="mx-auto px-6 lg:px-8 py-16" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
          <div className="max-w-2xl mx-auto text-center">
            <div className="p-12 bg-theme-surface border border-theme-border rounded-2xl">
              <div className="w-24 h-24 bg-theme-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-theme-primary" />
              </div>
              <h1
                className="text-3xl md:text-4xl font-bold text-theme-text mb-4"
                style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
              >
                {t('cart.empty')}
              </h1>
              <p className="text-theme-text-secondary mb-8 text-lg">
                {t('cart.emptyDescription')}
              </p>
              <Link href="/products">
                <button className="px-8 py-3.5 bg-theme-primary hover:bg-theme-primary/90 text-theme-background rounded-xl font-semibold shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200 inline-flex items-center gap-2">
                  <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
                  {t('home.discoverProducts')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'var(--theme-font-body)' }}>
      <div className="mx-auto px-6 lg:px-8 py-12" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
        {/* Header */}
        <div className="mb-10">
          <h1
            className="text-4xl md:text-5xl font-bold text-theme-text mb-3"
            style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
          >
            {t('cart.title')}
          </h1>
          <p className="text-xl text-theme-text-secondary">
            {t('cart.itemsCount', { count: getTotalItems() })}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(getItemsByStore()).map(([storeId, storeItems]) => (
              <div key={storeId} className="space-y-4">
                {/* Store Header (only show if multiple stores) */}
                {getUniqueStoresCount() > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 bg-theme-primary/5 border border-theme-primary/20 rounded-xl">
                    <h3 className="font-bold text-theme-text" style={{ fontFamily: 'var(--theme-font-heading)' }}>
                      {storeItems[0]?.storeName || t('store.title')}
                    </h3>
                    <span className="text-sm font-medium text-theme-text-secondary">
                      {t('cart.subtotal')}: {formatPrice(getStoreSubtotal(storeId))}
                    </span>
                  </div>
                )}

                {/* Store Items */}
                {storeItems.map((item) => (
                  <div key={item.productId} className="group p-6 bg-theme-surface border border-theme-border rounded-2xl hover:shadow-xl hover:shadow-theme-primary/10 transition-all duration-300">
                <div className="flex gap-6">
                  {/* Product Image */}
                  <Link href={`/products/${item.slug}`} className="flex-shrink-0">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-theme-background border border-theme-border hover:border-theme-primary transition-all duration-200">
                      <Image
                        src={item.image || '/placeholder-product.png'}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                        sizes="96px"
                      />
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.slug}`}
                          className="font-semibold text-theme-text hover:text-theme-primary transition-colors line-clamp-2 text-lg"
                          style={{ fontFamily: 'var(--theme-font-heading)' }}
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-theme-text-secondary mt-1.5">
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-2 text-theme-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        aria-label={t('cart.removeItem')}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center bg-theme-background border border-theme-border rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                          className="p-2.5 text-theme-text hover:bg-theme-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 font-semibold min-w-[60px] text-center text-theme-text" style={{ fontFamily: 'var(--theme-font-heading)' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.maxQuantity ? Math.min(item.maxQuantity, item.quantity + 1) : item.quantity + 1)}
                          className="p-2.5 text-theme-text hover:bg-theme-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={item.maxQuantity !== undefined && item.quantity >= item.maxQuantity}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p
                          className="text-xl font-bold text-theme-text"
                          style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
                        >
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        {item.maxQuantity !== undefined && item.maxQuantity < 10 && (
                          <p className="text-xs text-yellow-600 mt-1 font-medium">
                            {t('product.onlyLeft', { count: item.maxQuantity })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
              </div>
            ))}

            {/* Clear Cart Button */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (confirm(t('cart.clearCartConfirm'))) {
                    clearCart()
                  }
                }}
                className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-medium transition-all duration-200 inline-flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                {t('cart.clearCart')}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="p-6 bg-theme-surface border border-theme-border rounded-2xl sticky top-24">
              <h2
                className="text-2xl font-bold text-theme-text mb-6"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                {t('cart.summary')}
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-theme-text-secondary">
                  <span>{t('cart.subtotal')}</span>
                  <span className="font-semibold text-theme-text">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-theme-text-secondary">
                  <span>{t('cart.shipping')}</span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-green-600">{t('cart.free')}</span>
                    ) : (
                      <span className="text-theme-text">{formatPrice(shipping)}</span>
                    )}
                  </span>
                </div>
                {subtotal > 0 && subtotal < 50 && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm text-blue-600 font-medium">
                    {t('cart.almostFreeShipping', { amount: formatPrice(50 - subtotal) })}
                  </div>
                )}
                <div className="border-t border-theme-border pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-theme-text" style={{ fontFamily: 'var(--theme-font-heading)' }}>
                      {t('cart.total')}
                    </span>
                    <span
                      className="text-3xl font-bold text-theme-text"
                      style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
                    >
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="w-full px-6 py-4 bg-theme-primary hover:bg-theme-primary/90 text-theme-background rounded-xl font-semibold text-lg shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 mb-3"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                {t('cart.proceedToCheckout')}
                <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
              </button>

              <Link href="/products">
                <button className="w-full px-6 py-3 bg-theme-background hover:bg-theme-surface border border-theme-border hover:border-theme-border-light text-theme-text rounded-xl font-semibold transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2">
                  <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
                  {t('cart.continueShopping')}
                </button>
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-theme-border space-y-3">
                <div className="flex items-center gap-3 text-theme-text-secondary">
                  <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">{t('cart.securePayment')}</span>
                </div>
                <div className="flex items-center gap-3 text-theme-text-secondary">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">{t('product.returns30days')}</span>
                </div>
                <div className="flex items-center gap-3 text-theme-text-secondary">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">{t('cart.fastDelivery')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
