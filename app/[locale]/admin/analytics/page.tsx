'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/admin/StatCard'
import { SalesChart, FunnelChart, TopProductsTable } from '@/components/admin/analytics'
import { formatPrice } from '@/lib/utils'
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Activity,
  Download,
  RefreshCw,
  Calendar,
  BarChart3,
  Package,
} from 'lucide-react'

type Period = 'day' | 'week' | 'month' | 'year'
type ProductSortBy = 'revenue' | 'quantity' | 'views'

export default function AnalyticsPage() {
  const storeId = '000000000000000000000001' // TODO: Get from context

  const [period, setPeriod] = useState<Period>('month')
  const [productSortBy, setProductSortBy] = useState<ProductSortBy>('revenue')

  // Fetch analytics data
  const { data: salesData, isLoading: salesLoading, refetch: refetchSales } =
    trpc.analytics.getSalesOverview.useQuery({ storeId, period })

  const { data: topProducts, isLoading: productsLoading } =
    trpc.analytics.getTopProducts.useQuery({
      storeId,
      limit: 10,
      sortBy: productSortBy,
      period: period === 'day' ? 'week' : period,
    })

  const { data: funnel, isLoading: funnelLoading } =
    trpc.analytics.getConversionFunnel.useQuery({
      storeId,
      period: period === 'day' ? 'week' : period === 'year' ? 'year' : period,
    })

  const { data: realTimeStats, refetch: refetchRealTime } =
    trpc.analytics.getRealTimeStats.useQuery({ storeId })

  const { data: customerStats } =
    trpc.analytics.getCustomerStats.useQuery({
      storeId,
      period: period === 'day' ? 'week' : period === 'year' ? 'year' : period,
    })

  const handleRefresh = () => {
    refetchSales()
    refetchRealTime()
  }

  const handleExport = () => {
    // Simple CSV export
    if (!salesData?.salesData) return

    const csvContent = [
      ['Date', 'Revenu', 'Commandes', 'Panier Moyen'].join(','),
      ...salesData.salesData.map(row =>
        [row.date, row.revenue.toFixed(2), row.orders, row.averageOrderValue.toFixed(2)].join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${period}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const periodLabels: Record<Period, string> = {
    day: 'Aujourd\'hui',
    week: '7 derniers jours',
    month: '30 derniers jours',
    year: '12 derniers mois',
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Analyse détaillée de vos performances</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600 mr-2">Période :</span>
        {(['day', 'week', 'month', 'year'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              period === p
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {/* Real-time stats */}
      {realTimeStats && (
        <Card className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold text-primary-700">Temps réel</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-xs text-gray-600">Visiteurs actifs</p>
              <p className="text-lg font-bold text-gray-900">{realTimeStats.activeVisitors}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Commandes (1h)</p>
              <p className="text-lg font-bold text-gray-900">{realTimeStats.ordersLastHour}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Revenu (1h)</p>
              <p className="text-lg font-bold text-gray-900">{formatPrice(realTimeStats.revenueLastHour)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Commandes aujourd'hui</p>
              <p className="text-lg font-bold text-gray-900">{realTimeStats.todayOrders}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Revenu aujourd'hui</p>
              <p className="text-lg font-bold text-gray-900">{formatPrice(realTimeStats.todayRevenue)}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Main stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenu"
          value={formatPrice(salesData?.totals.revenue || 0)}
          icon={DollarSign}
          trend={salesData?.changes.revenue !== undefined ? {
            value: Math.abs(salesData.changes.revenue),
            isPositive: salesData.changes.revenue >= 0,
          } : undefined}
          colorVariant="teal"
        />
        <StatCard
          title="Commandes"
          value={salesData?.totals.orders || 0}
          icon={ShoppingCart}
          trend={salesData?.changes.orders !== undefined ? {
            value: Math.abs(salesData.changes.orders),
            isPositive: salesData.changes.orders >= 0,
          } : undefined}
          colorVariant="pink"
        />
        <StatCard
          title="Panier Moyen"
          value={formatPrice(salesData?.totals.averageOrderValue || 0)}
          icon={TrendingUp}
          colorVariant="yellow"
        />
        <StatCard
          title="Nouveaux Clients"
          value={customerStats?.newCustomers || 0}
          icon={Users}
          colorVariant="blue"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales chart */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            Évolution des ventes
          </h3>
          {salesLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : salesData?.salesData && salesData.salesData.length > 0 ? (
            <SalesChart data={salesData.salesData} height={300} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Aucune donnée disponible pour cette période
            </div>
          )}
        </Card>

        {/* Customer stats */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600" />
            Clients
          </h3>
          {customerStats ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total clients</span>
                <span className="font-semibold text-gray-900">{customerStats.totalCustomers}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">Nouveaux ({periodLabels[period]})</span>
                <span className="font-semibold text-gray-900">{customerStats.newCustomers}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">Clients fidèles</span>
                <span className="font-semibold text-gray-900">{customerStats.returningCustomers}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">Taux de rétention</span>
                <span className="font-semibold text-gray-900">{customerStats.retentionRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-gray-600">Valeur client moy.</span>
                <span className="font-semibold text-gray-900">{formatPrice(customerStats.averageLifetimeValue)}</span>
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          )}
        </Card>
      </div>

      {/* Funnel and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion funnel */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            Entonnoir de conversion
          </h3>
          {funnelLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : funnel && funnel.length > 0 ? (
            <FunnelChart data={funnel} height={300} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Aucune donnée disponible
            </div>
          )}
        </Card>

        {/* Top products */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-600" />
              Top produits
            </h3>
            <select
              value={productSortBy}
              onChange={(e) => setProductSortBy(e.target.value as ProductSortBy)}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="revenue">Par revenu</option>
              <option value="quantity">Par quantité</option>
            </select>
          </div>
          {productsLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <TopProductsTable products={topProducts || []} sortBy={productSortBy} />
          )}
        </Card>
      </div>
    </div>
  )
}
