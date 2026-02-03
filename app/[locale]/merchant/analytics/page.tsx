'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import { formatPrice } from '@/lib/utils'
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  Eye,
  ShoppingCart,
  CreditCard,
  CheckCircle,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react'
import { AdminButton } from '@/components/admin/ui/AdminButton'

type Period = 'day' | 'week' | 'month' | 'year'

export default function MerchantAnalyticsPage() {
  const params = useParams()
  const locale = params?.locale || 'fr'
  const { storeId } = useStoreContext()
  const [period, setPeriod] = useState<Period>('month')

  const { data: salesData, isLoading: salesLoading, refetch: refetchSales } = trpc.analytics.getSalesOverview.useQuery(
    { storeId: storeId!, period },
    { enabled: !!storeId }
  )

  const { data: topProducts, isLoading: productsLoading } = trpc.analytics.getTopProducts.useQuery(
    { storeId: storeId!, limit: 5, period: period === 'day' ? 'week' : period },
    { enabled: !!storeId }
  )

  const { data: funnel, isLoading: funnelLoading } = trpc.analytics.getConversionFunnel.useQuery(
    { storeId: storeId!, period: period === 'day' ? 'week' : period === 'year' ? 'year' : period },
    { enabled: !!storeId }
  )

  const { data: customerStats, isLoading: customerLoading } = trpc.analytics.getCustomerStats.useQuery(
    { storeId: storeId!, period: period === 'day' ? 'week' : period === 'year' ? 'year' : period },
    { enabled: !!storeId }
  )

  const { data: realTimeStats, refetch: refetchRealTime } = trpc.analytics.getRealTimeStats.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId, refetchInterval: 60000 }
  )

  const isLoading = salesLoading || productsLoading || funnelLoading || customerLoading

  const periodLabels: Record<Period, string> = {
    day: "Aujourd'hui",
    week: '7 jours',
    month: '30 jours',
    year: '12 mois',
  }

  const formatChange = (value: number) => {
    const isPositive = value >= 0
    return (
      <span className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        {Math.abs(value).toFixed(1)}%
      </span>
    )
  }

  // Simple bar chart component
  const SimpleBarChart = ({ data }: { data: { date: string; revenue: number }[] }) => {
    if (!data || data.length === 0) return null
    const maxRevenue = Math.max(...data.map(d => d.revenue), 1)

    return (
      <div className="flex items-end gap-1 h-32">
        {data.slice(-14).map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-primary-500 rounded-t transition-all hover:bg-primary-600"
              style={{ height: `${(item.revenue / maxRevenue) * 100}%`, minHeight: item.revenue > 0 ? '4px' : '0' }}
              title={`${item.date}: ${formatPrice(item.revenue)}`}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Analysez les performances de votre boutique</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {(['day', 'week', 'month', 'year'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  period === p
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
          <AdminButton
            variant="secondary"
            size="sm"
            onClick={() => { refetchSales(); refetchRealTime(); }}
            icon={<RefreshCw className="w-4 h-4" />}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <>
          {/* Real-time Stats */}
          <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Temps réel</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm opacity-90">En direct</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-sm opacity-80">Visiteurs actifs</p>
                <p className="text-2xl font-bold">{realTimeStats?.activeVisitors || 0}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Commandes (1h)</p>
                <p className="text-2xl font-bold">{realTimeStats?.ordersLastHour || 0}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">CA aujourd'hui</p>
                <p className="text-2xl font-bold">{formatPrice(realTimeStats?.todayRevenue || 0)}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Commandes aujourd'hui</p>
                <p className="text-2xl font-bold">{realTimeStats?.todayOrders || 0}</p>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                {salesData?.changes && formatChange(salesData.changes.revenue)}
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-4">
                {formatPrice(salesData?.totals?.revenue || 0)}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Chiffre d'affaires</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
                {salesData?.changes && formatChange(salesData.changes.orders)}
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-4">
                {salesData?.totals?.orders || 0}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Commandes</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-4">
                {formatPrice(salesData?.totals?.averageOrderValue || 0)}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Panier moyen</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-4">
                {customerStats?.totalCustomers || 0}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Clients</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Évolution du CA</h3>
              {salesData?.salesData && salesData.salesData.length > 0 ? (
                <SimpleBarChart data={salesData.salesData} />
              ) : (
                <div className="h-32 flex items-center justify-center text-slate-400">
                  <p>Pas de données pour cette période</p>
                </div>
              )}
              <div className="flex justify-between mt-4 text-xs text-slate-500 dark:text-slate-400">
                <span>{salesData?.salesData?.[0]?.date || '-'}</span>
                <span>{salesData?.salesData?.[salesData.salesData.length - 1]?.date || '-'}</span>
              </div>
            </div>

            {/* Conversion Funnel */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Entonnoir de conversion</h3>
              <div className="space-y-3">
                {funnel?.map((stage, index) => {
                  const icons = [Eye, ShoppingCart, Package, CreditCard, CheckCircle]
                  const Icon = icons[index] || Package
                  const widthPercent = funnel[0]?.count > 0
                    ? Math.max(10, (stage.count / funnel[0].count) * 100)
                    : 100

                  return (
                    <div key={stage.stage} className="relative">
                      <div
                        className="h-12 bg-primary-100 dark:bg-primary-500/20 rounded-lg flex items-center px-4 transition-all"
                        style={{ width: `${widthPercent}%` }}
                      >
                        <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{stage.stage}</p>
                        </div>
                        <div className="text-right ml-2">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{stage.count}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{stage.conversionRate.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top produits</h3>
              {topProducts && topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.productId} className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-400">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white truncate">{product.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{product.quantity} vendus</p>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white">{formatPrice(product.revenue)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune vente pour cette période</p>
                </div>
              )}
            </div>

            {/* Customer Stats */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Statistiques clients</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Nouveaux clients</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{customerStats?.newCustomers || 0}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Clients fidèles</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{customerStats?.returningCustomers || 0}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Taux de rétention</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{customerStats?.retentionRate?.toFixed(1) || 0}%</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Valeur vie client</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatPrice(customerStats?.averageLifetimeValue || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
