'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AdminCard, AdminCardHeader } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { formatPrice } from '@/lib/utils'
import { Eye, RefreshCw, Search, ShoppingCart, Package, Clock, CheckCircle, XCircle, X } from 'lucide-react'
import { useStoreContext } from '@/lib/context/store-context'
import { useTranslations } from 'next-intl'
import { useOrdersManagement } from '@/hooks/useOrdersManagement'

export default function MerchantOrdersPage() {
  const { storeId } = useStoreContext()
  const params = useParams()
  const locale = params?.locale || 'fr'
  const basePath = `/${locale}/merchant`
  const t = useTranslations('merchant')

  const {
    orders,
    filteredOrders,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    refundModalOpen,
    selectedOrder,
    refundAmount,
    setRefundAmount,
    refundReason,
    setRefundReason,
    handleRefund,
    openRefundModal,
    closeRefundModal,
    refundMutation,
    pendingCount,
    processingCount,
    completedCount,
    cancelledCount,
  } = useOrdersManagement(storeId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('orders')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gérez et suivez vos commandes</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter(statusFilter === 'PENDING' ? '' : 'PENDING')}
          className="text-left"
        >
          <AdminCard
            padding="md"
            className={`transition-all ${statusFilter === 'PENDING' ? 'ring-2 ring-amber-500 dark:ring-amber-400' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 dark:from-amber-500/30 dark:to-yellow-500/30 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('statusPending')}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{pendingCount}</p>
              </div>
            </div>
          </AdminCard>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === 'PROCESSING' ? '' : 'PROCESSING')}
          className="text-left"
        >
          <AdminCard
            padding="md"
            className={`transition-all ${statusFilter === 'PROCESSING' ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-primary-500/20 dark:from-blue-500/30 dark:to-primary-500/30 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('statusProcessing')}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{processingCount}</p>
              </div>
            </div>
          </AdminCard>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === 'COMPLETED' ? '' : 'COMPLETED')}
          className="text-left"
        >
          <AdminCard
            padding="md"
            className={`transition-all ${statusFilter === 'COMPLETED' ? 'ring-2 ring-emerald-500 dark:ring-emerald-400' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-green-500/20 dark:from-emerald-500/30 dark:to-green-500/30 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('statusCompleted')}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{completedCount}</p>
              </div>
            </div>
          </AdminCard>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === 'CANCELLED' ? '' : 'CANCELLED')}
          className="text-left"
        >
          <AdminCard
            padding="md"
            className={`transition-all ${statusFilter === 'CANCELLED' ? 'ring-2 ring-red-500 dark:ring-red-400' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-rose-500/20 dark:from-red-500/30 dark:to-rose-500/30 rounded-xl flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('statusCancelled')}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{cancelledCount}</p>
              </div>
            </div>
          </AdminCard>
        </button>
      </div>

      {/* Search & Filters */}
      <AdminCard padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par n° commande, client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>
          {statusFilter && (
            <AdminButton variant="secondary" onClick={() => setStatusFilter('')}>
              Effacer le filtre
            </AdminButton>
          )}
        </div>
      </AdminCard>

      {/* Orders Table */}
      <AdminCard padding="none">
        {isLoading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="w-20 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="w-20 h-6 bg-slate-200 dark:bg-slate-700 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {orders.length === 0 ? t('noOrdersYet') : 'Aucun résultat'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {orders.length === 0
                ? t('ordersWillAppearHere')
                : 'Essayez de modifier vos filtres de recherche'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('orderNumber')}</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('client')}</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">{t('date')}</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Articles</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('total')}</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('status')}</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        href={`${basePath}/orders/${order.id}`}
                        className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                      >
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white truncate">{order.customerName || 'Client'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300 hidden sm:table-cell">
                      {order.items.length} article{order.items.length > 1 ? 's' : ''}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                      {formatPrice(order.total)}
                    </td>
                    <td className="py-3 px-4">
                      <AdminBadge
                        variant={
                          order.status === 'COMPLETED' ? 'success' :
                          order.status === 'PROCESSING' ? 'info' :
                          order.status === 'PENDING' ? 'warning' :
                          order.status === 'CANCELLED' ? 'danger' :
                          'default'
                        }
                        dot
                      >
                        {order.status === 'PENDING' && t('statusPending')}
                        {order.status === 'PROCESSING' && t('statusProcessing')}
                        {order.status === 'COMPLETED' && t('statusCompleted')}
                        {order.status === 'CANCELLED' && t('statusCancelled')}
                        {order.status === 'REFUNDED' && 'Remboursée'}
                      </AdminBadge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/${locale}/order-confirmation/${order.orderNumber}`} target="_blank">
                          <AdminButton variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </AdminButton>
                        </Link>
                        {order.paymentStatus === 'PAID' && (order.paymentMethod === 'card' || order.paymentMethod === 'paypal') && (
                          <AdminButton
                            variant="ghost"
                            size="sm"
                            onClick={() => openRefundModal(order)}
                            title="Rembourser"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </AdminButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* Refund Modal */}
      {refundModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Rembourser #{selectedOrder.orderNumber}
              </h2>
              <button
                onClick={closeRefundModal}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Type de remboursement
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <input
                      type="radio"
                      name="refundType"
                      checked={!refundAmount}
                      onChange={() => setRefundAmount('')}
                      className="mr-3 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-slate-900 dark:text-white">
                      Remboursement total ({formatPrice(selectedOrder.total)})
                    </span>
                  </label>
                  <label className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <input
                      type="radio"
                      name="refundType"
                      checked={!!refundAmount}
                      onChange={() => setRefundAmount('0')}
                      className="mr-3 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-slate-900 dark:text-white">Remboursement partiel</span>
                  </label>
                </div>
              </div>

              {refundAmount !== '' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Montant du remboursement (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={selectedOrder.total}
                    step="0.01"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    placeholder="0.00"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Raison du remboursement (optionnel)
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                  placeholder="Ex: Produit défectueux, demande du client..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <AdminButton
                onClick={closeRefundModal}
                variant="secondary"
                className="flex-1"
              >
                Annuler
              </AdminButton>
              <AdminButton
                onClick={handleRefund}
                disabled={refundMutation.isPending}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                {refundMutation.isPending ? 'Traitement...' : 'Rembourser'}
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
