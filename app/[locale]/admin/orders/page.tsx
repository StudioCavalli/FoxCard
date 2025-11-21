'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { trpc } from '@/lib/trpc/client'
import { formatPrice } from '@/lib/utils'
import { Eye, RefreshCw, Store } from 'lucide-react'
import Link from 'next/link'
import { useStoreContext } from '@/lib/context/store-context'

export default function AdminOrdersPage() {
  const { storeId } = useStoreContext()

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Commandes</h1>
        <p className="text-gray-600">Gérez toutes vos commandes</p>
      </div>

      {/* Orders Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">Chargement des commandes...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">Aucune commande pour le moment</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">N° Commande</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Client</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Articles</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Boutique</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      #{order.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{order.customerName || 'Client'}</p>
                        <p className="text-sm text-gray-600">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {order.items.length} article{order.items.length > 1 ? 's' : ''}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                      {formatPrice(order.total)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'PENDING' && 'En attente'}
                        {order.status === 'PROCESSING' && 'En cours'}
                        {order.status === 'COMPLETED' && 'Complétée'}
                        {order.status === 'CANCELLED' && 'Annulée'}
                        {order.status === 'REFUNDED' && 'Remboursée'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {order.store && (
                        <div className="flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs text-gray-600">{order.store.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/order-confirmation/${order.orderNumber}`} target="_blank">
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
      </Card>

      {/* Refund Modal */}
      {refundModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">
                Rembourser la commande #{selectedOrder.orderNumber}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Montant du remboursement (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={selectedOrder.total}
                      step="0.01"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 outline-none"
                      placeholder="0.00"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Raison du remboursement (optionnel)
                  </label>
                  <textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 outline-none resize-none"
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
                  variant="ghost"
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
          </Card>
        </div>
      )}
    </div>
  )
}
