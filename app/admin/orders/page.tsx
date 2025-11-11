'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { trpc } from '@/lib/trpc/client'
import { formatPrice } from '@/lib/utils'
import { Eye } from 'lucide-react'
import Link from 'next/link'

export default function AdminOrdersPage() {
  const DEMO_STORE_ID = '000000000000000000000001'

  const { data, isLoading } = trpc.order.getAll.useQuery({
    storeId: DEMO_STORE_ID,
    limit: 50,
  })

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
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/order-confirmation/${order.orderNumber}`} target="_blank">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
