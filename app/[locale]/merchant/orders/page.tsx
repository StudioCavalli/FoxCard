'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { formatPrice } from '@/lib/utils'
import { Eye, RefreshCw, Search, Filter, ShoppingCart, Package, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useStoreContext } from '@/lib/context/store-context'

export default function MerchantOrdersPage() {
  const { storeId } = useStoreContext()
  const params = useParams()
  const locale = params?.locale || 'fr'
  const basePath = `/${locale}/merchant`

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [refundModalOpen, setRefundModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')

  const { data, isLoading, refetch } = trpc.order.getAll.useQuery(
    {
      storeId: storeId!,
      limit: 50,
    },
    {
      enabled: !!storeId,
    }
  )

  const refundMutation = trpc.payment.refundPayment.useMutation({
    onSuccess: () => {
      alert('Remboursement effectué avec succès')
      setRefundModalOpen(false)
      setSelectedOrder(null)
      setRefundAmount('')
      setRefundReason('')
      refetch()
    },
    onError: (error) => {
      alert(`Erreur: ${error.message}`)
    },
  })

  const handleRefund = () => {
    if (!selectedOrder) return

    const isPartial = refundAmount && parseFloat(refundAmount) > 0
    const amount = isPartial ? parseFloat(refundAmount) : undefined

    if (isPartial && amount! > selectedOrder.total) {
      alert('Le montant du remboursement ne peut pas dépasser le total de la commande')
      return
    }

    if (confirm(
      `Confirmez-vous le remboursement ${isPartial ? 'partiel de ' + amount + '€' : 'total de ' + selectedOrder.total + '€'} pour la commande #${selectedOrder.orderNumber} ?`
    )) {
      refundMutation.mutate({
        orderId: selectedOrder.id,
        amount,
        reason: refundReason || undefined,
      })
    }
  }

  const orders = data?.orders || []

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchQuery ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = !statusFilter || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Stats
  const pendingCount = orders.filter(o => o.status === 'PENDING').length
  const processingCount = orders.filter(o => o.status === 'PROCESSING').length
  const completedCount = orders.filter(o => o.status === 'COMPLETED').length
  const cancelledCount = orders.filter(o => o.status === 'CANCELLED').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
          <p className="text-gray-500 mt-1">Gérez et suivez vos commandes</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter(statusFilter === 'PENDING' ? '' : 'PENDING')}
          className={`bg-white rounded-xl border p-4 text-left transition-all ${statusFilter === 'PENDING' ? 'border-yellow-500 ring-2 ring-yellow-100' : 'border-gray-200 hover:border-gray-300'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === 'PROCESSING' ? '' : 'PROCESSING')}
          className={`bg-white rounded-xl border p-4 text-left transition-all ${statusFilter === 'PROCESSING' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">En cours</p>
              <p className="text-xl font-bold text-gray-900">{processingCount}</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === 'COMPLETED' ? '' : 'COMPLETED')}
          className={`bg-white rounded-xl border p-4 text-left transition-all ${statusFilter === 'COMPLETED' ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-200 hover:border-gray-300'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Complétées</p>
              <p className="text-xl font-bold text-gray-900">{completedCount}</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === 'CANCELLED' ? '' : 'CANCELLED')}
          className={`bg-white rounded-xl border p-4 text-left transition-all ${statusFilter === 'CANCELLED' ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 hover:border-gray-300'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Annulées</p>
              <p className="text-xl font-bold text-gray-900">{cancelledCount}</p>
            </div>
          </div>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher par n° commande, client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {statusFilter && (
            <Button variant="outline" onClick={() => setStatusFilter('')}>
              Effacer le filtre
            </Button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-24 h-4 bg-gray-200 rounded" />
                  <div className="flex-1 h-4 bg-gray-200 rounded" />
                  <div className="w-20 h-4 bg-gray-200 rounded" />
                  <div className="w-20 h-6 bg-gray-200 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {orders.length === 0 ? 'Aucune commande' : 'Aucun résultat'}
            </h3>
            <p className="text-gray-500">
              {orders.length === 0
                ? 'Les commandes de vos clients apparaîtront ici'
                : 'Essayez de modifier vos filtres de recherche'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">N° Commande</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Articles</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        href={`${basePath}/orders/${order.id}`}
                        className="font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{order.customerName || 'Client'}</p>
                        <p className="text-xs text-gray-500 truncate">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 hidden md:table-cell">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 hidden sm:table-cell">
                      {order.items.length} article{order.items.length > 1 ? 's' : ''}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                      {formatPrice(order.total)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status === 'PENDING' && 'En attente'}
                        {order.status === 'PROCESSING' && 'En cours'}
                        {order.status === 'COMPLETED' && 'Complétée'}
                        {order.status === 'CANCELLED' && 'Annulée'}
                        {order.status === 'REFUNDED' && 'Remboursée'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/${locale}/order-confirmation/${order.orderNumber}`} target="_blank">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        {order.paymentStatus === 'PAID' && (order.paymentMethod === 'card' || order.paymentMethod === 'paypal') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order)
                              setRefundModalOpen(true)
                            }}
                            title="Rembourser"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {refundModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">
                Rembourser la commande #{selectedOrder.orderNumber}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de remboursement
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="refundType"
                        checked={!refundAmount}
                        onChange={() => setRefundAmount('')}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-900">
                        Remboursement total ({formatPrice(selectedOrder.total)})
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="refundType"
                        checked={!!refundAmount}
                        onChange={() => setRefundAmount('0')}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-900">Remboursement partiel</span>
                    </label>
                  </div>
                </div>

                {refundAmount !== '' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant du remboursement (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={selectedOrder.total}
                      step="0.01"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 outline-none"
                      placeholder="0.00"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raison du remboursement (optionnel)
                  </label>
                  <textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 outline-none resize-none"
                    placeholder="Ex: Produit défectueux, demande du client..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button
                  onClick={() => {
                    setRefundModalOpen(false)
                    setSelectedOrder(null)
                    setRefundAmount('')
                    setRefundReason('')
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleRefund}
                  disabled={refundMutation.isPending}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  {refundMutation.isPending ? 'Traitement...' : 'Rembourser'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
