'use client'

import { useState } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { formatPrice, formatDate } from '@/lib/utils'
import {
  AdminCard,
  AdminStatCard,
  AdminBadge,
  AdminSearchInput,
  AdminTabs,
  AdminModal,
  AdminButton,
  AdminEmptyState,
} from '@/components/admin/ui'
import {
  ShoppingCart,
  Store,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  ExternalLink,
  User,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  Hash,
  Truck,
  RefreshCw,
} from 'lucide-react'

type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'

const statusConfig: Record<OrderStatus, { label: string; variant: 'warning' | 'info' | 'success' | 'danger' | 'default' }> = {
  PENDING: { label: 'En attente', variant: 'warning' },
  PROCESSING: { label: 'En cours', variant: 'info' },
  COMPLETED: { label: 'Complétée', variant: 'success' },
  CANCELLED: { label: 'Annulée', variant: 'danger' },
  REFUNDED: { label: 'Remboursée', variant: 'default' },
}

interface ShippingAddress {
  firstName?: string
  lastName?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  phone?: string
}

interface Order {
  id: string
  orderNumber: string
  customerName: string | null
  customerEmail: string
  total: number
  status: OrderStatus
  createdAt: Date
  storeId: string
  shippingAddress?: ShippingAddress | string | null
  paymentMethod?: string | null
  store: {
    id: string
    name: string
    slug: string
  }
  items: {
    id: string
    quantity: number
  }[]
}

export default function SuperAdminOrdersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const { data, isLoading, refetch } = trpc.superadmin.getAllOrders.useQuery({
    limit: 50,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: search || undefined,
  })

  const orders = (data?.orders || []) as Order[]
  const stats = data?.stats || { pending: 0, processing: 0, completed: 0, cancelled: 0 }

  const tabItems = [
    { value: 'all', label: 'Toutes', count: data?.total || 0 },
    { value: 'PENDING', label: 'En attente', count: stats.pending, icon: <Clock className="w-4 h-4" /> },
    { value: 'PROCESSING', label: 'En cours', count: stats.processing, icon: <Package className="w-4 h-4" /> },
    { value: 'COMPLETED', label: 'Complétées', count: stats.completed, icon: <CheckCircle className="w-4 h-4" /> },
    { value: 'CANCELLED', label: 'Annulées', count: stats.cancelled, icon: <XCircle className="w-4 h-4" /> },
  ]

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setShowDetailModal(true)
  }

  const totalItems = orders.reduce((acc, order) => acc + (order.items?.length || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Commandes Plateforme
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {data?.total || 0} commande{(data?.total || 0) > 1 ? 's' : ''} sur toutes les boutiques
          </p>
        </div>
        <AdminButton
          variant="secondary"
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={() => refetch()}
        >
          Actualiser
        </AdminButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="En attente"
          value={stats.pending}
          icon={Clock}
          variant="amber"
          onClick={() => setStatusFilter('PENDING')}
          subtitle="Nécessitent attention"
        />
        <AdminStatCard
          title="En cours"
          value={stats.processing}
          icon={Package}
          variant="blue"
          onClick={() => setStatusFilter('PROCESSING')}
          subtitle="En préparation"
        />
        <AdminStatCard
          title="Complétées"
          value={stats.completed}
          icon={CheckCircle}
          variant="emerald"
          onClick={() => setStatusFilter('COMPLETED')}
          subtitle="Livrées avec succès"
        />
        <AdminStatCard
          title="Annulées"
          value={stats.cancelled}
          icon={XCircle}
          variant="rose"
          onClick={() => setStatusFilter('CANCELLED')}
          subtitle="Commandes annulées"
        />
      </div>

      {/* Filters */}
      <AdminCard>
        <div className="p-4 space-y-4">
          {/* Tabs */}
          <AdminTabs
            items={tabItems}
            value={statusFilter}
            onChange={setStatusFilter}
            variant="pills"
            size="sm"
          />

          {/* Search */}
          <AdminSearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par numéro de commande, email ou nom client..."
          />
        </div>
      </AdminCard>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Chargement des commandes...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && orders.length === 0 && (
        <AdminEmptyState
          icon={ShoppingCart}
          title="Aucune commande trouvée"
          description={search || statusFilter !== 'all'
            ? "Aucune commande ne correspond à vos critères de recherche"
            : "Les commandes de toutes les boutiques apparaîtront ici"
          }
          action={
            (search || statusFilter !== 'all') ? (
              <AdminButton
                variant="secondary"
                onClick={() => {
                  setSearch('')
                  setStatusFilter('all')
                }}
              >
                Réinitialiser les filtres
              </AdminButton>
            ) : undefined
          }
        />
      )}

      {/* Orders Table */}
      {!isLoading && orders.length > 0 && (
        <AdminCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Commande
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Boutique
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((order) => {
                  const status = statusConfig[order.status] || statusConfig.PENDING
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/10 to-indigo-500/10 dark:from-violet-500/20 dark:to-indigo-500/20 flex items-center justify-center flex-shrink-0">
                            <Hash className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-mono text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[140px]" title={order.orderNumber}>
                              #{order.orderNumber.length > 12 ? `${order.orderNumber.slice(0, 12)}...` : order.orderNumber}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {order.items?.length || 0} article{(order.items?.length || 0) > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                            <Store className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                          </div>
                          <span className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[120px]">
                            {order.store?.name || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[140px]">
                            {order.customerName || 'Client'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                            {order.customerEmail}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {formatPrice(order.total)}
                        </p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <AdminBadge variant={status.variant}>
                          {status.label}
                        </AdminBadge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">
                            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link href={`/superadmin/stores/${order.storeId}`}>
                            <button
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400"
                              title="Voir la boutique"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Affichage de {orders.length} sur {data?.total || 0} commandes
            </p>
            {data?.hasMore && (
              <AdminButton variant="ghost" size="sm">
                Charger plus
              </AdminButton>
            )}
          </div>
        </AdminCard>
      )}

      {/* Order Detail Modal */}
      <AdminModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Commande #${selectedOrder?.orderNumber?.slice(0, 16) || ''}${(selectedOrder?.orderNumber?.length || 0) > 16 ? '...' : ''}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-5">
            {/* Status & Amount Header */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedOrder.status === 'COMPLETED' ? 'bg-emerald-100 dark:bg-emerald-500/20' :
                  selectedOrder.status === 'PENDING' ? 'bg-amber-100 dark:bg-amber-500/20' :
                  selectedOrder.status === 'PROCESSING' ? 'bg-blue-100 dark:bg-blue-500/20' :
                  'bg-rose-100 dark:bg-rose-500/20'
                }`}>
                  {selectedOrder.status === 'COMPLETED' && <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                  {selectedOrder.status === 'PENDING' && <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                  {selectedOrder.status === 'PROCESSING' && <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                  {(selectedOrder.status === 'CANCELLED' || selectedOrder.status === 'REFUNDED') && <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
                </div>
                <div>
                  <AdminBadge variant={statusConfig[selectedOrder.status]?.variant || 'default'}>
                    {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                  </AdminBadge>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatPrice(selectedOrder.total)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedOrder.items?.length || 0} article{(selectedOrder.items?.length || 0) > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Order Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Customer Info */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {selectedOrder.customerName || 'Client'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {selectedOrder.customerEmail}
                    </p>
                  </div>
                </div>
              </div>

              {/* Store Info */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <Store className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {selectedOrder.store?.name}
                    </p>
                    <Link
                      href={`/superadmin/stores/${selectedOrder.storeId}`}
                      className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      Voir la boutique →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Paiement
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedOrder.paymentMethod || 'Non spécifié'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Livraison
                    </p>
                    {selectedOrder.shippingAddress ? (
                      typeof selectedOrder.shippingAddress === 'string' ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{selectedOrder.shippingAddress}</p>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.country}
                        </p>
                      )
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400">Non spécifié</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Full Shipping Address (if available) */}
            {selectedOrder.shippingAddress && typeof selectedOrder.shippingAddress !== 'string' && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-slate-600 dark:text-slate-400 space-y-0.5">
                    {(selectedOrder.shippingAddress.firstName || selectedOrder.shippingAddress.lastName) && (
                      <p className="font-medium text-slate-900 dark:text-white">
                        {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                      </p>
                    )}
                    {selectedOrder.shippingAddress.address && <p>{selectedOrder.shippingAddress.address}</p>}
                    <p>{selectedOrder.shippingAddress.postalCode} {selectedOrder.shippingAddress.city}</p>
                    {selectedOrder.shippingAddress.country && <p>{selectedOrder.shippingAddress.country}</p>}
                    {selectedOrder.shippingAddress.phone && (
                      <p className="text-slate-500">Tél: {selectedOrder.shippingAddress.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Articles ({selectedOrder.items?.length || 0})
              </h4>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700 last:border-0"
                      >
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Article #{index + 1}
                        </span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          × {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                    Aucun détail d'article disponible
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <AdminButton
                variant="secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Fermer
              </AdminButton>
              <Link href={`/superadmin/stores/${selectedOrder.storeId}`}>
                <AdminButton variant="primary" icon={<Store className="w-4 h-4" />}>
                  Voir la boutique
                </AdminButton>
              </Link>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  )
}
