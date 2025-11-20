'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Package,
  DollarSign,
  Calendar,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from 'lucide-react'

type ForecastPeriod = 7 | 30 | 90

export default function ForecastPage() {
  const storeId = '000000000000000000000001' // TODO: Get from context

  const [forecastDays, setForecastDays] = useState<ForecastPeriod>(30)

  // Fetch forecast data
  const { data: salesForecast, isLoading: salesLoading, refetch: refetchSales } =
    trpc.forecast.getSalesForecast.useQuery({ storeId, forecastDays })

  const { data: stockForecast, isLoading: stockLoading } =
    trpc.forecast.getStockForecast.useQuery({ storeId, forecastDays })

  const { data: productTrends, isLoading: trendsLoading } =
    trpc.forecast.getProductTrends.useQuery({ storeId, limit: 5 })

  const { data: recommendations } =
    trpc.forecast.getRecommendations.useQuery({ storeId })

  const isLoading = salesLoading || stockLoading || trendsLoading

  const handleRefresh = () => {
    refetchSales()
  }

  // Combine historical and forecast data for chart
  const chartData = salesForecast ? [
    ...salesForecast.historical.map((d) => ({
      ...d,
      type: 'historical',
    })),
    ...salesForecast.forecast.map((d) => ({
      ...d,
      type: 'forecast',
    })),
  ] : []

  const TrendIcon = ({ direction }: { direction: 'up' | 'down' | 'stable' | 'rising' | 'falling' }) => {
    if (direction === 'up' || direction === 'rising') {
      return <TrendingUp className="w-4 h-4 text-green-600" />
    }
    if (direction === 'down' || direction === 'falling') {
      return <TrendingDown className="w-4 h-4 text-red-600" />
    }
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prévisions</h1>
          <p className="text-gray-600">Anticipez vos ventes et gérez votre stock</p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600 mr-2">Horizon :</span>
        {([7, 30, 90] as ForecastPeriod[]).map((days) => (
          <button
            key={days}
            onClick={() => setForecastDays(days)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              forecastDays === days
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {days} jours
          </button>
        ))}
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.recommendations.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Recommandations ({recommendations.recommendations.length})
          </h3>
          <div className="space-y-3">
            {recommendations.recommendations.slice(0, 3).map((rec, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  rec.priority === 'high' ? 'bg-red-50 border border-red-200' :
                  rec.priority === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-green-50 border border-green-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`font-medium ${
                      rec.priority === 'high' ? 'text-red-800' :
                      rec.priority === 'medium' ? 'text-yellow-800' :
                      'text-green-800'
                    }`}>
                      {rec.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {rec.priority === 'high' ? 'Urgent' : rec.priority === 'medium' ? 'Important' : 'Info'}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-700 mt-2">→ {rec.action}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Sales Forecast Summary */}
      {salesForecast && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Revenu prévu ({forecastDays}j)</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatPrice(salesForecast.summary.totalRevenue)}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Commandes prévues</p>
                <p className="text-xl font-bold text-gray-900">
                  {salesForecast.summary.totalOrders}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendIcon direction={salesForecast.trends.revenue} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tendance revenu</p>
                <p className="text-xl font-bold text-gray-900 capitalize">
                  {salesForecast.trends.revenue === 'up' ? 'Hausse' :
                   salesForecast.trends.revenue === 'down' ? 'Baisse' : 'Stable'}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                salesForecast.comparison.revenueChange >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {salesForecast.comparison.revenueChange >= 0 ?
                  <ArrowUp className="w-5 h-5 text-green-600" /> :
                  <ArrowDown className="w-5 h-5 text-red-600" />
                }
              </div>
              <div>
                <p className="text-sm text-gray-600">vs 30 derniers jours</p>
                <p className={`text-xl font-bold ${
                  salesForecast.comparison.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {salesForecast.comparison.revenueChange >= 0 ? '+' : ''}
                  {salesForecast.comparison.revenueChange.toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Sales Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Prévision des ventes
        </h3>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getDate()}/${date.getMonth() + 1}`
                }}
              />
              <YAxis
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => `${value}€`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
                formatter={(value: number, name: string) => [
                  formatPrice(value),
                  name === 'revenue' ? 'Revenu' : 'Commandes',
                ]}
                labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR')}
              />
              <Legend
                formatter={(value) => value === 'revenue' ? 'Revenu' : 'Commandes'}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                strokeDasharray={(d: any) => d.type === 'forecast' ? '5 5' : '0'}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            Aucune donnée disponible
          </div>
        )}
        <p className="text-sm text-gray-500 mt-2">
          La ligne en pointillés représente les prévisions basées sur l'historique des ventes.
        </p>
      </Card>

      {/* Stock Alerts and Product Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Alerts */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Alertes Stock
          </h3>
          {stockForecast ? (
            <>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{stockForecast.summary.critical}</p>
                  <p className="text-xs text-red-700">Critique</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{stockForecast.summary.warning}</p>
                  <p className="text-xs text-yellow-700">Attention</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{stockForecast.summary.healthy}</p>
                  <p className="text-xs text-green-700">OK</p>
                </div>
              </div>

              {stockForecast.alerts.critical.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-700">Rupture imminente (&lt; 7 jours)</p>
                  {stockForecast.alerts.critical.slice(0, 5).map((product) => (
                    <div key={product.productId} className="flex justify-between items-center p-2 bg-red-50 rounded">
                      <span className="text-sm text-gray-900">{product.name}</span>
                      <span className="text-sm font-medium text-red-600">
                        {product.daysUntilStockout}j ({product.currentStock} en stock)
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {stockForecast.alerts.warning.length > 0 && stockForecast.alerts.critical.length === 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-yellow-700">À surveiller (7-30 jours)</p>
                  {stockForecast.alerts.warning.slice(0, 5).map((product) => (
                    <div key={product.productId} className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                      <span className="text-sm text-gray-900">{product.name}</span>
                      <span className="text-sm font-medium text-yellow-600">
                        {product.daysUntilStockout}j
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {stockForecast.alerts.critical.length === 0 && stockForecast.alerts.warning.length === 0 && (
                <div className="text-center py-8 text-green-600">
                  <Package className="w-8 h-8 mx-auto mb-2" />
                  <p>Tous les stocks sont OK</p>
                </div>
              )}
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          )}
        </Card>

        {/* Product Trends */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            Tendances Produits
          </h3>
          {productTrends ? (
            <div className="space-y-4">
              {productTrends.rising.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-green-700 mb-2">En hausse</p>
                  {productTrends.rising.map((product) => (
                    <div key={product.productId} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-900">{product.name}</span>
                      <span className="text-sm font-medium text-green-600">
                        +{product.revenueChange.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {productTrends.falling.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-red-700 mb-2">En baisse</p>
                  {productTrends.falling.map((product) => (
                    <div key={product.productId} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-900">{product.name}</span>
                      <span className="text-sm font-medium text-red-600">
                        {product.revenueChange.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {productTrends.rising.length === 0 && productTrends.falling.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Minus className="w-8 h-8 mx-auto mb-2" />
                  <p>Pas de tendances significatives</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  {productTrends.summary.totalRising} produits en hausse, {productTrends.summary.totalFalling} en baisse, {productTrends.summary.totalStable} stables
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
