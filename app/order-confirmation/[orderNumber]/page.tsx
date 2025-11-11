'use client'

import { use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { trpc } from '@/lib/trpc/client'
import { formatPrice } from '@/lib/utils'
import { CheckCircle, Package, Mail, MapPin, Home } from 'lucide-react'

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}) {
  const { orderNumber } = use(params)

  const { data: order, isLoading } = trpc.order.getByOrderNumber.useQuery({
    orderNumber,
  })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
            <div className="h-48 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Card variant="default" className="p-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Commande introuvable</h1>
            <p className="text-gray-600 mb-8">
              Cette commande n'existe pas ou le numéro de commande est incorrect.
            </p>
            <Link href="/products">
              <Button variant="primary" size="lg">
                Retour aux produits
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  const shippingAddress = order.shippingAddress as {
    firstName?: string
    lastName?: string
    address?: string
    city?: string
    postalCode?: string
    country?: string
    phone?: string
  } | null

  // Calculate shipping (same logic as cart/checkout)
  const shipping = order.subtotal > 50 ? 0 : 5.99
  const total = order.subtotal + shipping

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <Card variant="default" className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Commande confirmée !</h1>
          <p className="text-lg text-gray-600 mb-6">
            Merci pour votre commande. Un email de confirmation a été envoyé à{' '}
            <span className="font-semibold text-gray-900">{order.customerEmail}</span>
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-xl">
            <span className="text-sm text-gray-600">Numéro de commande:</span>
            <span className="text-lg font-bold text-gray-900">{order.orderNumber}</span>
          </div>
        </Card>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Order Items */}
        <Card variant="default" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Articles commandés</h2>
          </div>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                {/* Product Image */}
                <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  {item.product?.thumbnail && (
                    <Image
                      src={item.product.thumbnail}
                      alt={item.name}
                      fill
                      className="object-contain p-2"
                    />
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                  {item.variantName && (
                    <p className="text-sm text-gray-600 mb-1">{item.variantName}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    Quantité: {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>

                {/* Item Total */}
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{formatPrice(item.total)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span className="font-semibold">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Livraison</span>
              <span className="font-semibold">
                {shipping === 0 ? (
                  <span className="text-green-600">Gratuite</span>
                ) : (
                  formatPrice(shipping)
                )}
              </span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </Card>

        {/* Shipping Address */}
        {shippingAddress && (
          <Card variant="default" className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Adresse de livraison</h2>
            </div>
            <div className="text-gray-700 space-y-1">
              {shippingAddress.firstName && shippingAddress.lastName && (
                <p className="font-semibold">
                  {shippingAddress.firstName} {shippingAddress.lastName}
                </p>
              )}
              {shippingAddress.address && <p>{shippingAddress.address}</p>}
              {shippingAddress.city && shippingAddress.postalCode && (
                <p>
                  {shippingAddress.postalCode} {shippingAddress.city}
                </p>
              )}
              {shippingAddress.country && <p>{shippingAddress.country}</p>}
              {shippingAddress.phone && (
                <p className="text-gray-600 mt-2">Tél: {shippingAddress.phone}</p>
              )}
            </div>
          </Card>
        )}

        {/* Order Status */}
        <Card variant="teal" className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Prochaines étapes</h3>
              <div className="space-y-2 text-gray-700">
                <p>
                  ✓ Vous recevrez un email de confirmation à{' '}
                  <span className="font-semibold">{order.customerEmail}</span>
                </p>
                <p>✓ Votre commande sera traitée sous 24-48 heures</p>
                <p>✓ Vous recevrez un email avec le numéro de suivi dès l'expédition</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/products" className="flex-1">
            <Button variant="primary" size="lg" className="w-full">
              <Home className="w-5 h-5 mr-2" />
              Continuer mes achats
            </Button>
          </Link>
          <Link href="/account" className="flex-1">
            <Button variant="outline" size="lg" className="w-full">
              Voir mes commandes
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
