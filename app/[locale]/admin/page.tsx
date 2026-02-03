'use client'

import Link from 'next/link'
import { EnhancedStatCard } from '@/components/admin/EnhancedStatCard'
import { RevenueChart } from '@/components/admin/charts/RevenueChart'
import { OrdersChart } from '@/components/admin/charts/OrdersChart'
import { OrderStatusChart } from '@/components/admin/charts/OrderStatusChart'
import { Card } from '@/components/ui/Card'
import { trpc } from '@/lib/trpc/client'
import { formatPrice } from '@/lib/utils'
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Plus,
  ArrowRight,
  Calendar
} from 'lucide-react'
import { useStoreContext } from '@/lib/context/store-context'
import { useMemo } from 'react'

export default function AdminDashboard() {
  const { storeId } = useStoreContext()

  const { data: products, isLoading: loadingProducts } = trpc.product.getAll.useQuery(
    {
      storeId: storeId!,
      limit: 100,
    },
    {
      enabled: !!storeId,
    }
  )

  const { data: ordersData, isLoading: loadingOrders } = trpc.order.getAll.useQuery(
    {
      storeId: storeId!,
      limit: 100,
    },
    {
      enabled: !!storeId,
    }
  )

  const { data: customersData, isLoading: loadingCustomers } = trpc.customer.getAll.useQuery(
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

  // Get recent orders
  const recentOrders = ordersData?.orders.slice(0, 5) || []

  // Generate chart data from orders
  const chartData = useMemo(() => {
    const orders = ordersData?.orders || []

    // Group orders by date for the last 7 days
    const last7Days: { date: string; revenue: number; orders: number }[] = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })

      const dayOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt)
        return orderDate.toDateString() === date.toDateString()
      })

      const dayRevenue = dayOrders
        .filter((o) => o.status === 'COMPLETED' || o.status === 'PROCESSING')
        .reduce((sum, o) => sum + o.total, 0)

      last7Days.push({
        date: dateStr,
        revenue: dayRevenue,
        orders: dayOrders.length,
      })
    }

    return last7Days
  }, [ordersData?.orders])

  // Order status distribution for pie chart
  const orderStatusData = useMemo(() => {
    const orders = ordersData?.orders || []

    const pending = orders.filter((o) => o.status === 'PENDING').length
    const processing = orders.filter((o) => o.status === 'PROCESSING').length
    const completed = orders.filter((o) => o.status === 'COMPLETED').length
    const cancelled = orders.filter((o) => o.status === 'CANCELLED').length

    return [
      { name: 'En attente', value: pending, color: '#f59e0b' },
      { name: 'En cours', value: processing, color: '#3b82f6' },
      { name: 'Complétées', value: completed, color: '#10b981' },
      { name: 'Annulées', value: cancelled, color: '#ef4444' },
    ].filter((item) => item.value > 0)
  }, [ordersData?.orders])

  const isLoading = loadingProducts || loadingOrders || loadingCustomers

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">Vue d'ensemble de votre boutique</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>7 derniers jours</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EnhancedStatCard
          title="Revenu Total"
          value={formatPrice(totalRevenue)}
          change={12.5}
          icon={DollarSign}
          color="indigo"
          href="/admin/analytics"
          loading={isLoading}
        />
        <EnhancedStatCard
          title="Commandes"
          value={totalOrders}
          change={8.2}
          icon={ShoppingCart}
          color="green"
          href="/admin/orders"
          loading={isLoading}
        />
        <EnhancedStatCard
          title="Produits"
          value={totalProducts}
          icon={Package}
          color="amber"
          href="/admin/products"
          loading={isLoading}
        />
        <EnhancedStatCard
          title="Clients"
          value={totalCustomers}
          change={5.4}
          icon={Users}
          color="blue"
          href="/admin/customers"
          loading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Revenus</h3>
              <p className="text-sm text-gray-500">Évolution sur les 7 derniers jours</p>
            </div>
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+12.5%</span>
            </div>
          </div>
          {isLoading ? (
            <div className="h-[300px] animate-pulse bg-gray-100 rounded-lg" />
          ) : (
            <RevenueChart data={chartData} />
          )}
        </div>

        {/* Order Status Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Statut des commandes</h3>
            <p className="text-sm text-gray-500">Répartition actuelle</p>
          </div>
          {isLoading ? (
            <div className="h-[250px] animate-pulse bg-gray-100 rounded-lg" />
          ) : orderStatusData.length > 0 ? (
            <OrderStatusChart data={orderStatusData} />
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">
              Aucune commande
            </div>
          )}
        </div>
      </div>

      {/* Orders Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Volume de commandes</h3>
            <p className="text-sm text-gray-500">Nombre de commandes par jour</p>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Voir tout
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {isLoading ? (
          <div className="h-[300px] animate-pulse bg-gray-100 rounded-lg" />
        ) : (
          <OrdersChart data={chartData} />
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Commandes récentes</h3>
              <p className="text-sm text-gray-500">Les 5 dernières commandes</p>
            </div>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Voir toutes
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-4">
                <div className="w-20 h-4 bg-gray-200 rounded" />
                <div className="flex-1 h-4 bg-gray-200 rounded" />
                <div className="w-24 h-4 bg-gray-200 rounded" />
                <div className="w-20 h-6 bg-gray-200 rounded-full" />
              </div>
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucune commande pour le moment</p>
            <p className="text-sm text-gray-400 mt-1">Les commandes apparaîtront ici</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">N° Commande</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <Link href={`/admin/orders/${order.id}`} className="text-sm font-medium text-primary-600 hover:text-primary-700">
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">{order.customerEmail}</td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold text-gray-900">
                      {formatPrice(order.total)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
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
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/products/new" className="group">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 text-white transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Ajouter un Produit</h3>
            <p className="text-primary-100 text-sm">Créez un nouveau produit dans votre catalogue</p>
          </div>
        </Link>

        <Link href="/admin/orders" className="group">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Gérer les Commandes</h3>
            <p className="text-green-100 text-sm">Traitez et suivez vos commandes en cours</p>
          </div>
        </Link>

        <Link href="/admin/customers" className="group">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Base Clients</h3>
            <p className="text-amber-100 text-sm">Consultez et gérez vos clients</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
