'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { trpc } from '@/lib/trpc/client'
import { formatPrice } from '@/lib/utils'
import {
  ArrowLeft,
  Package,
  User,
  Mail,
  MapPin,
  CreditCard,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  FileText,
  Printer
} from 'lucide-react'
import { OrderStatus, PaymentStatus, FulfillmentStatus } from '@prisma/client'

const statusLabels: Record<string, string> = {
  PENDING: 'En attente',
  PROCESSING: 'En cours',
  COMPLETED: 'Complétée',
  CANCELLED: 'Annulée',
  REFUNDED: 'Remboursée',
}

const paymentStatusLabels: Record<string, string> = {
  PENDING: 'En attente',
  PAID: 'Payé',
  FAILED: 'Échoué',
  REFUNDED: 'Remboursé',
  PARTIALLY_REFUNDED: 'Partiellement remboursé',
}

const fulfillmentStatusLabels: Record<string, string> = {
  UNFULFILLED: 'Non expédié',
  PARTIALLY_FULFILLED: 'Partiellement expédié',
  FULFILLED: 'Expédié',
  RETURNED: 'Retourné',
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params?.id as string
  const locale = params?.locale || 'fr'
  const basePath = `/${locale}/merchant`

  const [isUpdating, setIsUpdating] = useState(false)

  const { data: order, isLoading, refetch } = trpc.order.getById.useQuery(
    { id: orderId },
    { enabled: !!orderId }
  )

  const updateStatus = trpc.order.updateStatus.useMutation({
    onSuccess: () => {
      refetch()
      setIsUpdating(false)
    },
    onError: (err) => {
      alert(`Erreur: ${err.message}`)
      setIsUpdating(false)
    },
  })

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (confirm(`Changer le statut en "${statusLabels[newStatus]}" ?`)) {
      setIsUpdating(true)
      updateStatus.mutate({ id: orderId, status: newStatus })
    }
  }

  const handleFulfillmentChange = (newStatus: FulfillmentStatus) => {
    if (confirm(`Changer le statut d'expédition en "${fulfillmentStatusLabels[newStatus]}" ?`)) {
      setIsUpdating(true)
      updateStatus.mutate({ id: orderId, fulfillmentStatus: newStatus })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Commande introuvable</h2>
        <p className="text-gray-500 mt-2">Cette commande n'existe pas ou a été supprimée.</p>
        <Link href={`${basePath}/orders`}>
          <Button variant="primary" className="mt-4">
            Retour aux commandes
          </Button>
        </Link>
      </div>
    )
  }

  const shippingAddress = order.shippingAddress as any
  const billingAddress = order.billingAddress as any

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`${basePath}/orders`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                Commande #{order.orderNumber}
              </h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
                order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {statusLabels[order.status]}
              </span>
            </div>
            <p className="text-gray-500 mt-1">
              {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Imprimer
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Facture
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Articles ({order.items.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product?.thumbnail || item.product?.images?.[0] ? (
                      <Image
                        src={item.product.thumbnail || item.product.images[0]}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    {item.variantName && (
                      <p className="text-sm text-gray-500">{item.variantName}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(item.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="bg-gray-50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sous-total</span>
                <span className="text-gray-900">{formatPrice((order as any).subtotal || order.total)}</span>
              </div>
              {(order as any).shippingAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Livraison</span>
                  <span className="text-gray-900">{formatPrice((order as any).shippingAmount)}</span>
                </div>
              )}
              {(order as any).taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Taxes</span>
                  <span className="text-gray-900">{formatPrice((order as any).taxAmount)}</span>
                </div>
              )}
              {(order as any).discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Réduction</span>
                  <span className="text-green-600">-{formatPrice((order as any).discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <User className="w-5 h-5" />
              Client
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{order.customerName || 'Client'}</p>
                  <p className="text-sm text-gray-500">{order.customerEmail}</p>
                </div>
              </div>
              {(order as any).customerPhone && (
                <p className="text-sm text-gray-600">Tél: {(order as any).customerPhone}</p>
              )}
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5" />
                Adresse de livraison
              </h2>
              {shippingAddress ? (
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">
                    {shippingAddress.firstName} {shippingAddress.lastName}
                  </p>
                  <p>{shippingAddress.address}</p>
                  {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
                  <p>
                    {shippingAddress.postalCode} {shippingAddress.city}
                  </p>
                  <p>{shippingAddress.country}</p>
                  {shippingAddress.phone && <p>Tél: {shippingAddress.phone}</p>}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Non renseignée</p>
              )}
            </div>

            {/* Billing Address */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5" />
                Adresse de facturation
              </h2>
              {billingAddress ? (
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">
                    {billingAddress.firstName} {billingAddress.lastName}
                  </p>
                  <p>{billingAddress.address}</p>
                  {billingAddress.address2 && <p>{billingAddress.address2}</p>}
                  <p>
                    {billingAddress.postalCode} {billingAddress.city}
                  </p>
                  <p>{billingAddress.country}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Identique à l'adresse de livraison</p>
              )}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Notes du client</h2>
              <p className="text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Gestion du statut</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut de la commande
                </label>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                  disabled={isUpdating}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="PENDING">En attente</option>
                  <option value="PROCESSING">En cours</option>
                  <option value="COMPLETED">Complétée</option>
                  <option value="CANCELLED">Annulée</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut d'expédition
                </label>
                <select
                  value={(order as any).fulfillmentStatus || 'UNFULFILLED'}
                  onChange={(e) => handleFulfillmentChange(e.target.value as FulfillmentStatus)}
                  disabled={isUpdating}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="UNFULFILLED">Non expédié</option>
                  <option value="PARTIALLY_FULFILLED">Partiellement expédié</option>
                  <option value="FULFILLED">Expédié</option>
                  <option value="RETURNED">Retourné</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5" />
              Paiement
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Méthode</span>
                <span className="font-medium text-gray-900 capitalize">
                  {(order as any).paymentMethod === 'card' ? 'Carte bancaire' :
                   (order as any).paymentMethod === 'paypal' ? 'PayPal' :
                   (order as any).paymentMethod === 'bank_transfer' ? 'Virement' :
                   (order as any).paymentMethod || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Statut</span>
                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                  (order as any).paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                  (order as any).paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  (order as any).paymentStatus === 'REFUNDED' ? 'bg-purple-100 text-purple-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {paymentStatusLabels[(order as any).paymentStatus] || 'Inconnu'}
                </span>
              </div>
              {(order as any).paymentIntentId && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">ID Transaction</p>
                  <p className="text-sm font-mono text-gray-700 truncate">
                    {(order as any).paymentIntentId}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Fulfillment Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5" />
              Expédition
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Statut</span>
                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                  (order as any).fulfillmentStatus === 'FULFILLED' ? 'bg-green-100 text-green-700' :
                  (order as any).fulfillmentStatus === 'PARTIALLY_FULFILLED' ? 'bg-blue-100 text-blue-700' :
                  (order as any).fulfillmentStatus === 'RETURNED' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {fulfillmentStatusLabels[(order as any).fulfillmentStatus] || 'Non expédié'}
                </span>
              </div>
              {(order as any).trackingNumber && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">N° de suivi</p>
                  <p className="text-sm font-mono text-gray-700">
                    {(order as any).trackingNumber}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5" />
              Historique
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Commande créée</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              {(order as any).paymentStatus === 'PAID' && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Paiement reçu</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.updatedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )}
              {(order as any).fulfillmentStatus === 'FULFILLED' && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Commande expédiée</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.updatedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
