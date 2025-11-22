'use client'

import { useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { trpc } from '@/lib/trpc/client'
import { formatPrice } from '@/lib/utils'
import { useStoreContext } from '@/lib/context/store-context'
import { useStoreCommerceType, useCommerceTypeTerminology } from '@/lib/commerce-types/hooks'
import { commerceTypeConfigs } from '@/lib/commerce-types'
import {
  Store,
  ShoppingBag,
  ArrowRight,
  Package,
  AlertTriangle,
  Plus
} from 'lucide-react'
import {
  MobileMerchantLayout,
  MobilePageHeader,
  MobileSection,
  MobileQuickStatsRow,
  MobileRevenueChartWidget,
  MobileRecentOrdersWidget,
  MobileLowStockAlert,
  MobileSkeleton,
  MobileEmptyState,
  PWAInstallBanner,
  OfflineBanner,
  NotificationPrompt
} from './index'

export function MobileDashboard() {
  const { storeId, storeName } = useStoreContext()
  const params = useParams()
  const router = useRouter()
  const locale = params?.locale || 'fr'
  const basePath = `/${locale}/merchant`
  const t = useTranslations('merchant')
  const { type: commerceType, config } = useStoreCommerceType(storeId || undefined)
  const terminology = useCommerceTypeTerminology(commerceType)
  const commerceConfig = commerceType ? commerceTypeConfigs[commerceType] : null

  // Fetch data
  const { data: products, isLoading: loadingProducts, refetch: refetchProducts } = trpc.product.getAll.useQuery(
    { storeId: storeId!, limit: 100 },
    { enabled: !!storeId }
  )

  const { data: ordersData, isLoading: loadingOrders, refetch: refetchOrders } = trpc.order.getAll.useQuery(
    { storeId: storeId!, limit: 100 },
    { enabled: !!storeId }
  )

  const { data: customersData, isLoading: loadingCustomers, refetch: refetchCustomers } = trpc.customer.getAll.useQuery(
    { storeId: storeId!, limit: 100 },
    { enabled: !!storeId }
  )

  const isLoading = loadingProducts || loadingOrders || loadingCustomers

  // Calculate stats
  const stats = useMemo(() => {
    const totalProducts = products?.products.length || 0
    const totalOrders = ordersData?.orders.length || 0
    const totalCustomers = customersData?.customers.length || 0
    const totalRevenue = ordersData?.orders
      .filter((order) => order.status === 'COMPLETED' || order.status === 'PROCESSING')
      .reduce((sum, order) => sum + order.total, 0) || 0

    return {
      revenue: { value: totalRevenue, change: 12, currency: 'EUR' },
      orders: { value: totalOrders, change: 8 },
      customers: { value: totalCustomers, change: 5 },
      products: { value: totalProducts }
    }
  }, [products, ordersData, customersData])

  // Chart data
  const chartData = useMemo(() => {
    const orders = ordersData?.orders || []
    const last7Days: { day: string; value: number }[] = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayName = date.toLocaleDateString(locale as string, { weekday: 'short' }).slice(0, 2)

      const dayOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt)
        return orderDate.toDateString() === date.toDateString()
      })

      const dayRevenue = dayOrders
        .filter((o) => o.status === 'COMPLETED' || o.status === 'PROCESSING')
        .reduce((sum, o) => sum + o.total, 0)

      last7Days.push({ day: dayName, value: dayRevenue })
    }

    return last7Days
  }, [ordersData?.orders, locale])

  // Recent orders for widget
  const recentOrders = useMemo(() => {
    return (ordersData?.orders || []).slice(0, 5).map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: order.customerEmail.split('@')[0],
      total: order.total,
      currency: 'EUR',
      status: order.status as 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED'
    }))
  }, [ordersData?.orders])

  // Low stock products
  const lowStockProducts = useMemo(() => {
    return (products?.products || [])
      .filter(p => p.quantity !== null && p.quantity < 10)
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        name: p.name,
        stock: p.quantity || 0,
        image: p.images?.[0]
      }))
  }, [products?.products])

  // Pending orders count
  const pendingOrders = useMemo(() => {
    return (ordersData?.orders || []).filter(o => o.status === 'PENDING').length
  }, [ordersData?.orders])

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refetchProducts(),
      refetchOrders(),
      refetchCustomers()
    ])
  }, [refetchProducts, refetchOrders, refetchCustomers])

  // No store selected
  if (!storeId) {
    return (
      <MobileMerchantLayout showQuickActions={false}>
        <div className="min-h-screen flex items-center justify-center p-6">
          <MobileEmptyState
            icon={<Store className="w-8 h-8 text-gray-400" />}
            title={t('noStoreSelected')}
            description={t('selectStoreDescription')}
          />
        </div>
      </MobileMerchantLayout>
    )
  }

  return (
    <MobileMerchantLayout
      pendingOrders={pendingOrders}
      onRefresh={handleRefresh}
    >
      {/* Offline Banner */}
      <OfflineBanner />

      {/* Header */}
      <MobilePageHeader
        title={t('dashboard')}
        subtitle={storeName || t('store')}
      />

      <div className="py-4 space-y-6">
        {/* Quick Stats */}
        <MobileSection>
          {isLoading ? (
            <MobileSkeleton variant="stat" count={4} />
          ) : (
            <MobileQuickStatsRow stats={stats} />
          )}
        </MobileSection>

        {/* Revenue Chart */}
        <MobileSection>
          {isLoading ? (
            <div className="bg-orange-500 rounded-2xl p-4 h-40 animate-pulse" />
          ) : (
            <MobileRevenueChartWidget
              data={chartData}
              total={stats.revenue.value}
              currency="EUR"
              change={stats.revenue.change}
            />
          )}
        </MobileSection>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <MobileSection>
            <MobileLowStockAlert
              products={lowStockProducts}
              onViewProduct={(id) => router.push(`${basePath}/products/${id}/edit`)}
            />
          </MobileSection>
        )}

        {/* Recent Orders */}
        <MobileSection>
          {isLoading ? (
            <MobileSkeleton variant="list" count={5} />
          ) : recentOrders.length > 0 ? (
            <MobileRecentOrdersWidget
              orders={recentOrders}
              onViewAll={() => router.push(`${basePath}/orders`)}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{t('noOrdersYet')}</p>
              <p className="text-sm text-gray-400 mt-1">{t('ordersWillAppearHere')}</p>
            </div>
          )}
        </MobileSection>

        {/* Quick Actions - Mobile Style (Adaptive) */}
        <MobileSection title={t('quickActions.title')}>
          <div className="grid grid-cols-2 gap-3">
            <Link href={`${basePath}/products/new`}>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white active:scale-95 transition-transform">
                <Plus className="w-6 h-6 mb-2" />
                <p className="font-medium text-sm">{terminology.addProduct}</p>
              </div>
            </Link>
            <Link href={`${basePath}/orders`}>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white active:scale-95 transition-transform">
                <ShoppingBag className="w-6 h-6 mb-2" />
                <p className="font-medium text-sm">{terminology.manageOrders}</p>
              </div>
            </Link>
          </div>
        </MobileSection>
      </div>

      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {/* Notification Prompt */}
      <NotificationPrompt />
    </MobileMerchantLayout>
  )
}
