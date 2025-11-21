'use client'

import Link from 'next/link'
import { StatCard } from '@/components/admin/StatCard'
import { Card } from '@/components/ui/Card'
import { trpc } from '@/lib/trpc/client'
import { formatPrice } from '@/lib/utils'
import { DollarSign, Package, ShoppingCart, Users } from 'lucide-react'
import { useStoreContext } from '@/lib/context/store-context'

export default function AdminDashboard() {
  const { storeId } = useStoreContext()

  const { data: products } = trpc.product.getAll.useQuery(
    {
      storeId: storeId!,
      limit: 100,
    },
    {
      enabled: !!storeId,
    }
  )

  const { data: ordersData } = trpc.order.getAll.useQuery(
    {
      storeId: storeId!,
      limit: 100,
    },
    {
      enabled: !!storeId,
    }
  )

  const { data: customersData } = trpc.customer.getAll.useQuery(
    {
      storeId: storeId!,
      limit: 100,
    },
    {
      enabled: !!storeId,
    }
  )

  const totalProducts = products?.products.length || 0
  const totalOrders = ordersData?.orders.length || 0
  const totalCustomers = customersData?.customers.length || 0

  // Calculate total revenue from completed and processing orders
  const totalRevenue =
    ordersData?.orders
      .filter((order) => order.status === 'COMPLETED' || order.status === 'PROCESSING')
      .reduce((sum, order) => sum + order.total, 0) || 0

  // Calculate average order value
  const completedOrders = ordersData?.orders.filter(
    (order) => order.status === 'COMPLETED' || order.status === 'PROCESSING'
  ) || []
  const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0

  // Get recent orders
  const recentOrders = ordersData?.orders.slice(0, 5) || []

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenu Total"
          value={formatPrice(totalRevenue)}
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
          colorVariant="teal"
        />
        <StatCard
          title="Commandes"
          value={totalOrders}
          icon={ShoppingCart}
          trend={{ value: 8.2, isPositive: true }}
          colorVariant="pink"
        />
        <StatCard
          title="Produits"
          value={totalProducts}
          icon={Package}
          colorVariant="yellow"
        />
        <StatCard
          title="Clients"
          value={totalCustomers}
          icon={Users}
          colorVariant="blue"
        />
      </div>

      {/* Recent Orders */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Commandes Récentes</h3>

        {recentOrders.length === 0 ? (
          <p className="text-gray-600 text-center py-8">Aucune commande pour le moment</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">N° Commande</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Client</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">#{order.orderNumber}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{order.customerEmail}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                      {formatPrice(order.total)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'PENDING' && 'En attente'}
                        {order.status === 'PROCESSING' && 'En cours'}
                        {order.status === 'COMPLETED' && 'Complétée'}
                        {order.status === 'CANCELLED' && 'Annulée'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/products/new">
          <Card variant="teal" className="p-6 hover:shadow-card-hover transition-shadow cursor-pointer">
            <Package className="w-8 h-8 text-primary-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Ajouter un Produit</h3>
            <p className="text-sm text-gray-600">Creez un nouveau produit dans votre catalogue</p>
          </Card>
        </Link>

        <Link href="/admin/orders">
          <Card variant="pink" className="p-6 hover:shadow-card-hover transition-shadow cursor-pointer">
            <ShoppingCart className="w-8 h-8 text-secondary-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Voir les Commandes</h3>
            <p className="text-sm text-gray-600">Gerez toutes vos commandes en cours</p>
          </Card>
        </Link>

        <Link href="/admin/customers">
          <Card variant="yellow" className="p-6 hover:shadow-card-hover transition-shadow cursor-pointer">
            <Users className="w-8 h-8 text-yellow-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Clients</h3>
            <p className="text-sm text-gray-600">Consultez votre base de clients</p>
          </Card>
        </Link>
      </div>
    </div>
  )
}
