'use client'

import { useState } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { formatPrice } from '@/lib/utils'
import {
  AdminCard,
  AdminStatCard,
  AdminTabs,
  AdminEmptyState,
  AdminBadge,
} from '@/components/admin/ui'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Store,
  ShoppingCart,
  Users,
  Package,
  Loader2,
  ExternalLink,
  Trophy,
  Medal,
  Award,
  BarChart3,
  Calendar,
} from 'lucide-react'

type Period = 'week' | 'month' | 'year' | 'all'

const periodLabels: Record<Period, string> = {
  week: 'Cette semaine',
  month: 'Ce mois',
  year: 'Cette année',
  all: 'Tout le temps',
}

export default function SuperAdminAnalyticsPage() {
  const [period, setPeriod] = useState<Period>('month')

  const { data: platformStats } = trpc.superadmin.getPlatformStats.useQuery()
  const { data: revenueByStore, isLoading } = trpc.superadmin.getRevenueByStore.useQuery({
    limit: 20,
    period,
  })

  const stores = revenueByStore || []
  const totalRevenue = stores.reduce((sum, store) => sum + store.revenue, 0)
  const totalOrders = stores.reduce((sum, store) => sum + store.ordersCount, 0)
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const periodTabs = [
    { value: 'week', label: 'Semaine', icon: <Calendar className="w-4 h-4" /> },
    { value: 'month', label: 'Mois', icon: <Calendar className="w-4 h-4" /> },
    { value: 'year', label: 'Année', icon: <Calendar className="w-4 h-4" /> },
    { value: 'all', label: 'Tout', icon: <BarChart3 className="w-4 h-4" /> },
  ]

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-amber-500" />
      case 1:
        return <Medal className="w-5 h-5 text-slate-400" />
      case 2:
        return <Award className="w-5 h-5 text-orange-500" />
      default:
        return <span className="text-sm font-bold text-slate-500">#{index + 1}</span>
    }
  }

  const getRankBg = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-br from-amber-500/10 to-yellow-500/10 dark:from-amber-500/20 dark:to-yellow-500/20 border-amber-200 dark:border-amber-500/30'
      case 1:
        return 'bg-gradient-to-br from-slate-500/10 to-gray-500/10 dark:from-slate-500/20 dark:to-gray-500/20 border-slate-200 dark:border-slate-500/30'
      case 2:
        return 'bg-gradient-to-br from-orange-500/10 to-amber-500/10 dark:from-orange-500/20 dark:to-amber-500/20 border-orange-200 dark:border-orange-500/30'
      default:
        return 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
    }
  }

  const getProgressBarColor = (index: number) => {
    switch (index) {
      case 0:
        return 'from-amber-500 to-yellow-500'
      case 1:
        return 'from-slate-400 to-gray-500'
      case 2:
        return 'from-orange-500 to-amber-500'
      default:
        return 'from-violet-500 to-indigo-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Analytics Plateforme
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Performances détaillées et métriques de la plateforme
        </p>
      </div>

      {/* Platform Overview Stats */}
      {platformStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatCard
            title="Revenu Total"
            value={formatPrice(platformStats.totalRevenue)}
            icon={DollarSign}
            variant="emerald"
            trend={platformStats.revenueGrowth ? {
              value: platformStats.revenueGrowth,
              label: 'vs mois dernier'
            } : undefined}
          />
          <AdminStatCard
            title="Boutiques"
            value={platformStats.totalStores}
            icon={Store}
            variant="violet"
          />
          <AdminStatCard
            title="Utilisateurs"
            value={platformStats.totalUsers}
            icon={Users}
            variant="blue"
          />
          <AdminStatCard
            title="Commandes"
            value={platformStats.totalOrders}
            icon={ShoppingCart}
            variant="amber"
          />
        </div>
      )}

      {/* Period Selector */}
      <AdminCard>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Performance par période
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {periodLabels[period]}
              </p>
            </div>
            <AdminTabs
              items={periodTabs}
              value={period}
              onChange={(v) => setPeriod(v as Period)}
              variant="default"
              size="sm"
            />
          </div>
        </div>
      </AdminCard>

      {/* Period Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminCard className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <DollarSign className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Revenu {periodLabels[period].toLowerCase()}
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatPrice(totalRevenue)}
              </p>
            </div>
          </div>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <ShoppingCart className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Commandes
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {totalOrders.toLocaleString('fr-FR')}
              </p>
            </div>
          </div>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Panier moyen
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatPrice(avgOrderValue)}
              </p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Chargement des données...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && stores.length === 0 && (
        <AdminEmptyState
          icon={BarChart3}
          title="Aucune donnée disponible"
          description={`Aucune vente enregistrée pour ${periodLabels[period].toLowerCase()}`}
        />
      )}

      {/* Top Stores Ranking */}
      {!isLoading && stores.length > 0 && (
        <AdminCard>
          <div className="p-5 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Classement des boutiques
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Top {stores.length} par revenu - {periodLabels[period]}
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {stores.map((store, index) => {
              const percentage = totalRevenue > 0 ? (store.revenue / totalRevenue) * 100 : 0

              return (
                <div
                  key={store.storeId}
                  className={`p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                    index < 3 ? 'bg-gradient-to-r from-transparent to-transparent' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Rank Badge */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getRankBg(index)}`}>
                      {getRankIcon(index)}
                    </div>

                    {/* Store Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                            {store.storeName}
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                            {store.ownerEmail}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                              {formatPrice(store.revenue)}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {store.ordersCount} commande{store.ordersCount > 1 ? 's' : ''}
                            </p>
                          </div>
                          <Link href={`/superadmin/stores/${store.storeId}`}>
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-violet-600 dark:hover:text-violet-400">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </Link>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${getProgressBarColor(index)} transition-all duration-500`}
                            style={{ width: `${Math.max(percentage, 2)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-14 text-right">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Store className="w-4 h-4" />
                <span>{stores.length} boutique{stores.length > 1 ? 's' : ''} avec des ventes</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <AdminBadge variant="success">
                    {formatPrice(totalRevenue)} total
                  </AdminBadge>
                </div>
                <div className="flex items-center gap-2">
                  <AdminBadge variant="info">
                    {totalOrders} commandes
                  </AdminBadge>
                </div>
              </div>
            </div>
          </div>
        </AdminCard>
      )}

      {/* Monthly Stats Chart (if available) */}
      {platformStats?.monthlyStats && Object.keys(platformStats.monthlyStats).length > 0 && (
        <AdminCard>
          <div className="p-5 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Évolution mensuelle
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Revenus des 12 derniers mois
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-end gap-2 h-48">
              {Object.entries(platformStats.monthlyStats)
                .sort(([a], [b]) => a.localeCompare(b))
                .slice(-12)
                .map(([month, data]) => {
                  const maxRevenue = Math.max(
                    ...Object.values(platformStats.monthlyStats).map((d: any) => d.revenue)
                  )
                  const heightPercent = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0
                  const monthLabel = month.split('-')[1]

                  return (
                    <div
                      key={month}
                      className="flex-1 flex flex-col items-center gap-2 group"
                    >
                      <div className="relative w-full flex justify-center">
                        <div
                          className="w-full max-w-8 bg-gradient-to-t from-violet-500 to-indigo-500 rounded-t-lg transition-all duration-300 group-hover:from-violet-600 group-hover:to-indigo-600"
                          style={{ height: `${Math.max(heightPercent, 4)}%`, minHeight: '8px' }}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-slate-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {formatPrice(data.revenue)}
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {monthLabel}
                      </span>
                    </div>
                  )
                })}
            </div>
          </div>
        </AdminCard>
      )}
    </div>
  )
}
