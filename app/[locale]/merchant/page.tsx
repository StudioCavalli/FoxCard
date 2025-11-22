'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { RevenueChart } from '@/components/admin/charts/RevenueChart'
import { OrdersChart } from '@/components/admin/charts/OrdersChart'
import { OrderStatusChart } from '@/components/admin/charts/OrderStatusChart'
import { DashboardWidgets } from '@/components/merchant/dashboard/DashboardWidgets'
import { trpc } from '@/lib/trpc/client'
import { formatPrice } from '@/lib/utils'
import {
  ShoppingCart,
  Users,
  TrendingUp,
  Plus,
  ArrowRight,
  Calendar,
  Store
} from 'lucide-react'
import { useStoreContext } from '@/lib/context/store-context'
import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useIsMobile } from '@/hooks/useIsMobile'
import { MobileDashboard } from '@/components/merchant/mobile'

export default function MerchantDashboard() {
  const { storeId, storeName } = useStoreContext()
  const params = useParams()
  const locale = params?.locale || 'fr'
  const basePath = `/${locale}/merchant`
  const t = useTranslations('merchant')
  const isMobile = useIsMobile()

  // Show mobile dashboard on mobile devices
  if (isMobile) {
    return <MobileDashboard />
  }

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
      { name: t('statusPending'), value: pending, color: '#f59e0b' },
      { name: t('statusProcessing'), value: processing, color: '#3b82f6' },
      { name: t('statusCompleted'), value: completed, color: '#10b981' },
      { name: t('statusCancelled'), value: cancelled, color: '#ef4444' },
    ].filter((item) => item.value > 0)
  }, [ordersData?.orders, t])

  const isLoading = loadingProducts || loadingOrders || loadingCustomers

  // If no store selected
  if (!storeId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Store className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('noStoreSelected')}</h2>
        <p className="text-gray-500 mb-6 max-w-md">
          {t('selectStoreDescription')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard')}</h1>
          <p className="text-gray-500 mt-1">{t('overviewOf', { storeName: storeName || t('store') })}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{t('last7Days')}</span>
          </div>
        </div>
      </div>

      {/* Commerce-Type Adaptive Stats Grid */}
      <DashboardWidgets storeId={storeId} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{t('revenue')}</h3>
              <p className="text-sm text-gray-500">{t('revenueEvolution')}</p>
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
            <h3 className="text-lg font-semibold text-gray-900">{t('orderStatus')}</h3>
            <p className="text-sm text-gray-500">{t('currentDistribution')}</p>
          </div>
          {isLoading ? (
            <div className="h-[250px] animate-pulse bg-gray-100 rounded-lg" />
          ) : orderStatusData.length > 0 ? (
            <OrderStatusChart data={orderStatusData} />
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">
              {t('noOrders')}
            </div>
          )}
        </div>
      </div>

      {/* Orders Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('orderVolume')}</h3>
            <p className="text-sm text-gray-500">{t('ordersPerDay')}</p>
          </div>
          <Link
            href={`${basePath}/orders`}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {t('viewAll')}
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
              <h3 className="text-lg font-semibold text-gray-900">{t('recentOrders')}</h3>
              <p className="text-sm text-gray-500">{t('last5Orders')}</p>
            </div>
            <Link
              href={`${basePath}/orders`}
              className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {t('viewAllFeminine')}
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
            <p className="text-gray-500">{t('noOrdersYet')}</p>
            <p className="text-sm text-gray-400 mt-1">{t('ordersWillAppearHere')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('orderNumber')}</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('client')}</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">{t('date')}</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('total')}</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <Link href={`${basePath}/orders/${order.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">{order.customerEmail}</td>
                    <td className="py-4 px-6 text-sm text-gray-500 hidden sm:table-cell">
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
                        {order.status === 'PENDING' && t('statusPending')}
                        {order.status === 'PROCESSING' && t('statusProcessing')}
                        {order.status === 'COMPLETED' && t('statusCompleted')}
                        {order.status === 'CANCELLED' && t('statusCancelled')}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <Link href={`${basePath}/products/new`} className="group">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-1">{t('addProduct')}</h3>
            <p className="text-indigo-100 text-sm">{t('createNewProduct')}</p>
          </div>
        </Link>

        <Link href={`${basePath}/orders`} className="group">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-1">{t('manageOrders')}</h3>
            <p className="text-green-100 text-sm">{t('processOrders')}</p>
          </div>
        </Link>

        <Link href={`${basePath}/customers`} className="group">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-1">{t('customerBase')}</h3>
            <p className="text-amber-100 text-sm">{t('manageCustomers')}</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
