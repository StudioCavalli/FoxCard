'use client'

import { X, Minus, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useUIStore } from '@/lib/store/ui'
import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { useEffect } from 'react'

export function CartDrawer() {
  const { isCartOpen, closeCart } = useUIStore()
  const { items, updateQuantity, removeItem, getTotalPrice, getItemsByStore, getStoreSubtotal, getUniqueStoresCount } = useCartStore()

  // Close cart on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    if (isCartOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isCartOpen, closeCart])

  if (!isCartOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Panier</h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <X className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Votre panier est vide</h3>
              <p className="text-gray-600 mb-6">Ajoutez des produits pour commencer</p>
              <Button onClick={closeCart}>Continuer mes achats</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(getItemsByStore()).map(([storeId, storeItems]) => (
                <div key={storeId} className="space-y-3">
                  {/* Store Header (only show if multiple stores) */}
                  {getUniqueStoresCount() > 1 && (
                    <div className="flex items-center justify-between px-2 pb-2 border-b border-gray-200">
                      <h3 className="font-semibold text-sm text-gray-700">
                        {storeItems[0]?.storeName || 'Boutique'}
                      </h3>
                      <span className="text-sm font-medium text-gray-600">
                        Sous-total: {formatPrice(getStoreSubtotal(storeId))}
                      </span>
                    </div>
                  )}

                  {/* Store Items */}
                  {storeItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                      {/* Image */}
                      <div className="relative w-20 h-20 flex-shrink-0 bg-white rounded-lg overflow-hidden">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-contain"
                            sizes="80px"
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                        {item.variantName && (
                          <p className="text-sm text-gray-600">{item.variantName}</p>
                        )}
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          {formatPrice(item.price)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            disabled={item.maxQuantity ? item.quantity >= item.maxQuantity : false}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors h-fit"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-6 space-y-4">
            {/* Total */}
            <div className="flex items-center justify-between text-xl font-bold">
              <span>Total</span>
              <span>{formatPrice(getTotalPrice())}</span>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Link href="/checkout" onClick={closeCart} className="block">
                <Button variant="primary" size="lg" className="w-full">
                  Passer commande
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full" onClick={closeCart}>
                Continuer mes achats
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
