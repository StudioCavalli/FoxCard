'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
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
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Commande introuvable</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Cette commande n'existe pas ou a été supprimée.</p>
        <Link href={`${basePath}/orders`}>
          <AdminButton className="mt-4">
            Retour aux commandes
          </AdminButton>
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
            <AdminButton variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </AdminButton>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Commande #{order.orderNumber}
              </h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
                order.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' :
                order.status === 'PROCESSING' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' :
                order.status === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                order.status === 'CANCELLED' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' :
                'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {statusLabels[order.status]}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
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
          <AdminButton variant="secondary" size="sm" icon={<Printer className="w-4 h-4" />}>
            Imprimer
          </AdminButton>
          <AdminButton variant="secondary" size="sm" icon={<FileText className="w-4 h-4" />}>
            Facture
          </AdminButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <AdminCard padding="none" className="overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5" />
                Articles ({order.items.length})
              </h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {order.items.map((item) => {
                const itemData = item as any
                return (
                  <div key={item.id} className="p-4 flex items-start gap-4">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden flex-shrink-0">
                      {item.product?.thumbnail || item.product?.images?.[0] ? (
                        <Image
                          src={item.product.thumbnail || item.product.images[0]}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                      {item.variantName && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">{item.variantName}</p>
                      )}
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                      {/* Restaurant Modifiers */}
                      {itemData.modifiers && Array.isArray(itemData.modifiers) && itemData.modifiers.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {itemData.modifiers.map((mod: any, idx: number) => (
                            <p key={idx} className="text-sm text-emerald-600 dark:text-emerald-400">
                              + {mod.modifierName || mod.name}
                              {mod.price > 0 && ` (+${formatPrice(mod.price)})`}
                            </p>
                          ))}
                          {itemData.modifierTotal > 0 && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Options: +{formatPrice(itemData.modifierTotal)}
                            </p>
                          )}
                        </div>
                      )}
                      {/* Special Instructions */}
                      {itemData.specialInstructions && (
                        <div className="mt-2 px-2 py-1.5 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                          <p className="text-sm text-amber-700 dark:text-amber-400">
                            ⚠️ {itemData.specialInstructions}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {formatPrice(item.total)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            {/* Totals */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Sous-total</span>
                <span className="text-slate-900 dark:text-white">{formatPrice((order as any).subtotal || order.total)}</span>
              </div>
              {(order as any).shippingAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Livraison</span>
                  <span className="text-slate-900 dark:text-white">{formatPrice((order as any).shippingAmount)}</span>
                </div>
              )}
              {(order as any).taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Taxes</span>
                  <span className="text-slate-900 dark:text-white">{formatPrice((order as any).taxAmount)}</span>
                </div>
              )}
              {(order as any).discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Réduction</span>
                  <span className="text-green-600 dark:text-green-400">-{formatPrice((order as any).discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </AdminCard>

          {/* Customer Info */}
          <AdminCard padding="lg">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <User className="w-5 h-5" />
              Client
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{order.customerName || 'Client'}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{order.customerEmail}</p>
                </div>
              </div>
              {(order as any).customerPhone && (
                <p className="text-sm text-slate-600 dark:text-slate-400">Tél: {(order as any).customerPhone}</p>
              )}
            </div>
          </AdminCard>

          {/* Addresses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Shipping Address */}
            <AdminCard padding="lg">
              <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5" />
                Adresse de livraison
              </h2>
              {shippingAddress ? (
                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <p className="font-medium text-slate-900 dark:text-white">
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
                <p className="text-sm text-slate-500 dark:text-slate-400">Non renseignée</p>
              )}
            </AdminCard>

            {/* Billing Address */}
            <AdminCard padding="lg">
              <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5" />
                Adresse de facturation
              </h2>
              {billingAddress ? (
                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <p className="font-medium text-slate-900 dark:text-white">
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
                <p className="text-sm text-slate-500 dark:text-slate-400">Identique à l'adresse de livraison</p>
              )}
            </AdminCard>
          </div>

          {/* Notes */}
          {order.notes && (
            <AdminCard padding="lg">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Notes du client</h2>
              <p className="text-slate-600 dark:text-slate-400">{order.notes}</p>
            </AdminCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <AdminCard padding="lg">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Gestion du statut</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Statut de la commande
                </label>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                  disabled={isUpdating}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all disabled:opacity-50"
                >
                  <option value="PENDING">En attente</option>
                  <option value="PROCESSING">En cours</option>
                  <option value="COMPLETED">Complétée</option>
                  <option value="CANCELLED">Annulée</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Statut d'expédition
                </label>
                <select
                  value={(order as any).fulfillmentStatus || 'UNFULFILLED'}
                  onChange={(e) => handleFulfillmentChange(e.target.value as FulfillmentStatus)}
                  disabled={isUpdating}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all disabled:opacity-50"
                >
                  <option value="UNFULFILLED">Non expédié</option>
                  <option value="PARTIALLY_FULFILLED">Partiellement expédié</option>
                  <option value="FULFILLED">Expédié</option>
                  <option value="RETURNED">Retourné</option>
                </select>
              </div>
            </div>
          </AdminCard>

          {/* Payment Info */}
          <AdminCard padding="lg">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5" />
              Paiement
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Méthode</span>
                <span className="font-medium text-slate-900 dark:text-white capitalize">
                  {(order as any).paymentMethod === 'card' ? 'Carte bancaire' :
                   (order as any).paymentMethod === 'paypal' ? 'PayPal' :
                   (order as any).paymentMethod === 'bank_transfer' ? 'Virement' :
                   (order as any).paymentMethod || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Statut</span>
                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                  (order as any).paymentStatus === 'PAID' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' :
                  (order as any).paymentStatus === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                  (order as any).paymentStatus === 'REFUNDED' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400' :
                  'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                }`}>
                  {paymentStatusLabels[(order as any).paymentStatus] || 'Inconnu'}
                </span>
              </div>
              {(order as any).paymentIntentId && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">ID Transaction</p>
                  <p className="text-sm font-mono text-slate-700 dark:text-slate-300 truncate">
                    {(order as any).paymentIntentId}
                  </p>
                </div>
              )}
            </div>
          </AdminCard>

          {/* Fulfillment Info */}
          <AdminCard padding="lg">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5" />
              Expédition
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Statut</span>
                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                  (order as any).fulfillmentStatus === 'FULFILLED' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' :
                  (order as any).fulfillmentStatus === 'PARTIALLY_FULFILLED' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' :
                  (order as any).fulfillmentStatus === 'RETURNED' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' :
                  'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {fulfillmentStatusLabels[(order as any).fulfillmentStatus] || 'Non expédié'}
                </span>
              </div>
              {(order as any).trackingNumber && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">N° de suivi</p>
                  <p className="text-sm font-mono text-slate-700 dark:text-slate-300">
                    {(order as any).trackingNumber}
                  </p>
                </div>
              )}
            </div>
          </AdminCard>

          {/* Timeline */}
          <AdminCard padding="lg">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5" />
              Historique
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Commande créée</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
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
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Paiement reçu</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
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
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Commande expédiée</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
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
          </AdminCard>
        </div>
      </div>
    </div>
  )
}
