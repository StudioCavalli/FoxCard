'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AdminCard, AdminCardHeader } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
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
  TrendingDown,
  Plus,
  ArrowRight,
  Calendar,
  Store,
  Package,
  Activity
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

  // Calculate revenue growth (mock for now, could be computed from historical data)
  const revenueGrowth = useMemo(() => {
    if (chartData.length < 7) return 0
    const firstHalf = chartData.slice(0, 3).reduce((sum, d) => sum + d.revenue, 0)
    const secondHalf = chartData.slice(4).reduce((sum, d) => sum + d.revenue, 0)
    if (firstHalf === 0) return secondHalf > 0 ? 100 : 0
    return ((secondHalf - firstHalf) / firstHalf) * 100
  }, [chartData])

  const isLoading = loadingProducts || loadingOrders || loadingCustomers

  // If no store selected
  if (!storeId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <Store className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('noStoreSelected')}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
          {t('selectStoreDescription')}
        </p>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-64 mb-2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse"></div>
          <div className="h-80 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Commerce-Type Adaptive Stats Grid */}
      <DashboardWidgets storeId={storeId} />

      {/* Revenue & Orders Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <AdminCard className="lg:col-span-2" padding="lg">
          <AdminCardHeader
            title={t('revenue')}
            description={t('revenueEvolution')}
            action={
              revenueGrowth !== 0 && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
                  revenueGrowth > 0
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                    : 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                }`}>
                  {revenueGrowth > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {revenueGrowth > 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                </div>
              )
            }
          />
          <div className="flex items-baseline gap-4 mb-6">
            <span className="text-4xl font-bold text-slate-900 dark:text-white">{formatPrice(totalRevenue)}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">{t('last7Days')}</span>
          </div>
          <RevenueChart data={chartData} />
        </AdminCard>

        {/* Order Status Chart */}
        <AdminCard padding="lg">
          <AdminCardHeader
            title={t('orderStatus')}
            description={t('currentDistribution')}
          />
          {orderStatusData.length > 0 ? (
            <OrderStatusChart data={orderStatusData} />
          ) : (
            <div className="h-[250px] flex items-center justify-center">
              <div className="text-center">
                <Activity className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">{t('noOrders')}</p>
              </div>
            </div>
          )}
        </AdminCard>
      </div>

      {/* Orders Chart */}
      <AdminCard padding="lg">
        <AdminCardHeader
          title={t('orderVolume')}
          description={t('ordersPerDay')}
          action={
            <Link href={`${basePath}/orders`}>
              <AdminButton variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                {t('viewAll')}
              </AdminButton>
            </Link>
          }
        />
        <OrdersChart data={chartData} />
      </AdminCard>

      {/* Recent Orders */}
      <AdminCard padding="none">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <AdminCardHeader
            title={t('recentOrders')}
            description={t('last5Orders')}
            action={
              <Link href={`${basePath}/orders`}>
                <AdminButton variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                  {t('viewAllFeminine')}
                </AdminButton>
              </Link>
            }
            className="mb-0"
          />
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">{t('noOrdersYet')}</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">{t('ordersWillAppearHere')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('orderNumber')}</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('client')}</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">{t('date')}</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('total')}</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <Link href={`${basePath}/orders/${order.id}`} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-700 dark:text-slate-300">{order.customerEmail}</td>
                    <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold text-slate-900 dark:text-white">
                      {formatPrice(order.total)}
                    </td>
                    <td className="py-4 px-6">
                      <AdminBadge
                        variant={
                          order.status === 'COMPLETED' ? 'success' :
                          order.status === 'PROCESSING' ? 'info' :
                          order.status === 'PENDING' ? 'warning' :
                          'danger'
                        }
                        dot
                      >
                        {order.status === 'PENDING' && t('statusPending')}
                        {order.status === 'PROCESSING' && t('statusProcessing')}
                        {order.status === 'COMPLETED' && t('statusCompleted')}
                        {order.status === 'CANCELLED' && t('statusCancelled')}
                      </AdminBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <h3 className="lg:col-span-3 text-lg font-semibold text-slate-900 dark:text-white">Actions Rapides</h3>
        {[
          { href: `${basePath}/products/new`, icon: Plus, title: t('addProduct'), desc: t('createNewProduct'), gradient: 'from-primary-500 to-primary-600', shadow: 'violet' },
          { href: `${basePath}/orders`, icon: ShoppingCart, title: t('manageOrders'), desc: t('processOrders'), gradient: 'from-emerald-500 to-green-600', shadow: 'emerald' },
          { href: `${basePath}/customers`, icon: Users, title: t('customerBase'), desc: t('manageCustomers'), gradient: 'from-amber-500 to-orange-600', shadow: 'amber' },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="block group">
            <AdminCard hover padding="md" className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg shadow-${item.shadow}-500/25`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-all" />
            </AdminCard>
          </Link>
        ))}
      </div>
    </div>
  )
}
