'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { formatPrice, formatDate } from '@/lib/utils'
import { DollarSign, CheckCircle, Clock, XCircle, TrendingUp, Search, Filter } from 'lucide-react'
import Link from 'next/link'

export default function AdminPaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'PENDING' | 'PAID' | 'FAILED'>('all')

  // Get payment statistics
  const { data: stats } = trpc.payment.getPaymentStats.useQuery({
    storeId: '000000000000000000000001',
  })

  // Get all orders with pagination
  const { data: ordersData, isLoading, refetch } = trpc.order.getAll.useQuery({
    storeId: '000000000000000000000001',
    limit: 100,
  })

  const confirmPayment = trpc.payment.adminConfirmPayment.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  // Filter orders
  const filteredOrders = ordersData?.orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      paymentStatusFilter === 'all' || order.paymentStatus === paymentStatusFilter

    return matchesSearch && matchesStatus
  })

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'En attente' },
      PAID: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Payé' },
      FAILED: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Échoué' },
      REFUNDED: { bg: 'bg-gray-100', text: 'text-gray-800', icon: TrendingUp, label: 'Remboursé' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    const Icon = config.icon

    return (
      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </div>
    )
  }

  const getPaymentMethodLabel = (method: string | null) => {
    const methods: Record<string, string> = {
      card: 'Carte bancaire',
      paypal: 'PayPal',
      bank_transfer: 'Virement bancaire',
    }
    return methods[method || 'card'] || method || 'Non spécifié'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des paiements</h1>
          <p className="text-gray-600 mt-1">Gérez et confirmez les paiements de vos commandes</p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card variant="default" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
          </Card>

          <Card variant="default" className="p-6 bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Payés</p>
                <p className="text-2xl font-bold text-green-900">{stats.paid}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card variant="default" className="p-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">En attente</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>

          <Card variant="default" className="p-6 bg-red-50 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Échoués</p>
                <p className="text-2xl font-bold text-red-900">{stats.failed}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </Card>

          <Card variant="default" className="p-6 bg-primary-50 border-primary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-700">Revenu</p>
                <p className="text-2xl font-bold text-primary-900">{formatPrice(stats.revenue)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card variant="default" className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher par numéro de commande ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900"
            >
              <option value="all">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="PAID">Payés</option>
              <option value="FAILED">Échoués</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card variant="default" className="p-6">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="text-gray-600 mt-2">Chargement...</p>
            </div>
          ) : filteredOrders && filteredOrders.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Commande</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Client</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Montant</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Méthode</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <Link href={`/admin/orders/${order.id}`} className="font-medium text-primary-600 hover:text-primary-700">
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{order.customerName}</p>
                        <p className="text-sm text-gray-600">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-900">{formatPrice(order.total)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-700">{getPaymentMethodLabel(order.paymentMethod)}</span>
                    </td>
                    <td className="py-4 px-4">{getPaymentStatusBadge(order.paymentStatus)}</td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{formatDate(order.createdAt)}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {order.paymentStatus === 'PENDING' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Confirmer le paiement de la commande #${order.orderNumber} ?`)) {
                              confirmPayment.mutate({
                                orderId: order.id,
                                notes: `Paiement ${order.paymentMethod} confirmé manuellement`,
                              })
                            }
                          }}
                          isLoading={confirmPayment.isPending}
                        >
                          Confirmer le paiement
                        </Button>
                      )}
                      {order.paymentStatus === 'PAID' && (
                        <span className="text-sm text-green-600 font-medium">✓ Confirmé</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Aucune commande trouvée</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
