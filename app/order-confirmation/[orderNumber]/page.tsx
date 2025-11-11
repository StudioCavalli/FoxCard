'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { trpc } from '@/lib/trpc/client'
import { formatPrice } from '@/lib/utils'
import { Check } from 'lucide-react'

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}) {
  const { orderNumber } = use(params)
  const router = useRouter()

  const { data: order, isLoading } = trpc.order.getByOrderNumber.useQuery({
    orderNumber,
  })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Commande introuvable</h1>
        <p className="text-gray-600 mb-6">
          Nous n'avons pas trouvé cette commande dans notre système
        </p>
        <Button onClick={() => router.push('/')}>Retour à l'accueil</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Commande confirmée !</h1>
          <p className="text-gray-600">
            Merci pour votre commande. Nous vous enverrons un email de confirmation.
          </p>
        </div>

        {/* Order Details */}
        <Card className="p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Commande #{order.orderNumber}</h2>
              <p className="text-gray-600">
                {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                {order.status === 'PENDING' && 'En attente'}
                {order.status === 'PROCESSING' && 'En cours'}
                {order.status === 'COMPLETED' && 'Complétée'}
                {order.status === 'CANCELLED' && 'Annulée'}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="border-t border-b py-4 mb-6 space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  {item.variantName && (
                    <p className="text-sm text-gray-600">{item.variantName}</p>
                  )}
                  <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                </div>
                <p className="font-medium text-gray-900">{formatPrice(item.total)}</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Livraison</span>
              <span>{formatPrice(order.shipping)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Réduction</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </Card>

        {/* Shipping Address */}
        <Card className="p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-3">Adresse de livraison</h3>
          {order.shippingAddress && typeof order.shippingAddress === 'object' && (
            <div className="text-gray-600">
              <p>
                {(order.shippingAddress as any).firstName}{' '}
                {(order.shippingAddress as any).lastName}
              </p>
              <p>{(order.shippingAddress as any).address}</p>
              <p>
                {(order.shippingAddress as any).postalCode}{' '}
                {(order.shippingAddress as any).city}
              </p>
              <p>{(order.shippingAddress as any).country}</p>
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button variant="primary" size="lg" className="flex-1" onClick={() => router.push('/')}>
            Retour à l'accueil
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => router.push('/products')}
          >
            Continuer mes achats
          </Button>
        </div>
      </div>
    </div>
  )
}
