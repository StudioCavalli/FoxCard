'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { trpc } from '@/lib/trpc/client'
import { formatPrice } from '@/lib/utils'
import {
  DollarSign,
  TrendingUp,
  Store,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function SuperAdminAnalyticsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month')

  const { data: revenueByStore, isLoading } = trpc.superadmin.getRevenueByStore.useQuery({
    limit: 20,
    period,
  })

  const stores = revenueByStore || []
  const totalRevenue = stores.reduce((sum, store) => sum + store.revenue, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Plateforme</h1>
        <p className="text-gray-600">Performances détaillées par boutique</p>
      </div>

      {/* Period Selector */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Période:</span>
          <div className="flex gap-2">
            {[
              { value: 'week', label: 'Semaine' },
              { value: 'month', label: 'Mois' },
              { value: 'year', label: 'Année' },
              { value: 'all', label: 'Tout' },
            ].map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === p.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Total Revenue */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="w-8 h-8 text-green-600" />
          <div>
            <p className="text-sm text-gray-600">Revenu Total - {
              period === 'week' ? 'Cette semaine' :
              period === 'month' ? 'Ce mois' :
              period === 'year' ? 'Cette année' :
              'Tout le temps'
            }</p>
            <p className="text-4xl font-bold text-gray-900">{formatPrice(totalRevenue)}</p>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      )}

      {/* Revenue by Store */}
      {!isLoading && stores.length === 0 && (
        <Card className="p-12 text-center">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucune donnée disponible pour cette période</p>
        </Card>
      )}

      {!isLoading && stores.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Top Boutiques par Revenu</h3>
          <div className="space-y-4">
            {stores.map((store, index) => {
              const percentage = (store.revenue / totalRevenue) * 100

              return (
                <div key={store.storeId} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-200 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{store.storeName}</h4>
                            <p className="text-sm text-gray-600">{store.ownerEmail}</p>
                          </div>
                          <Link
                            href={`/superadmin/stores/${store.storeId}`}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                        <div
                          className={`h-full flex items-center px-3 transition-all ${
                            index === 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                            'bg-gradient-to-r from-green-400 to-emerald-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        >
                          <span className="text-xs font-medium text-white">
                            {formatPrice(store.revenue)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-32 text-right">
                      <p className="text-sm font-semibold text-gray-900">{percentage.toFixed(1)}%</p>
                      <p className="text-xs text-gray-600">{store.ordersCount} commandes</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
