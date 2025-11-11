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

export default function CartPage() {
  const router = useRouter()
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice, getTotalItems } = useCartStore()

  const subtotal = getTotalPrice()
  const shipping = subtotal > 50 ? 0 : 5.99
  const total = subtotal + shipping

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Card variant="default" className="p-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Votre panier est vide</h1>
            <p className="text-gray-600 mb-8">
              Découvrez nos produits et ajoutez-les à votre panier pour continuer vos achats.
            </p>
            <Link href="/products">
              <Button variant="primary" size="lg">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Découvrir nos produits
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Panier</h1>
        <p className="text-gray-600">{getTotalItems()} article{getTotalItems() > 1 ? 's' : ''} dans votre panier</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.productId} variant="default" className="p-6">
              <div className="flex gap-6">
                {/* Product Image */}
                <Link href={`/products/${item.slug}`} className="flex-shrink-0">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 hover:border-primary-500 transition-colors">
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
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Retirer du panier"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 font-semibold min-w-[60px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.maxQuantity ? Math.min(item.maxQuantity, item.quantity + 1) : item.quantity + 1)}
                        className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        disabled={item.maxQuantity !== undefined && item.quantity >= item.maxQuantity}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      {item.maxQuantity !== undefined && item.maxQuantity < 10 && (
                        <p className="text-xs text-yellow-600 mt-1">
                          Plus que {item.maxQuantity} en stock
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Clear Cart Button */}
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
                  clearCart()
                }
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-2" />
              Vider le panier
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card variant="teal" className="p-6 sticky top-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Résumé</h2>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-gray-600">
                <span>Sous-total</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Livraison</span>
                <span className="font-semibold">
                  {shipping === 0 ? (
                    <span className="text-green-600">Gratuite</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>
              {subtotal > 0 && subtotal < 50 && (
                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  Plus que {formatPrice(50 - subtotal)} pour la livraison gratuite !
                </div>
              )}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full mb-4"
              onClick={() => router.push('/checkout')}
            >
              Passer la commande
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <Link href="/products">
              <Button variant="outline" size="lg" className="w-full">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Continuer mes achats
              </Button>
            </Link>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Paiement 100% sécurisé</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Retours sous 30 jours</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Livraison rapide</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
