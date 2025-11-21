'use client'

import { Card } from '@/components/ui/Card'
import { trpc } from '@/lib/trpc/client'
import { formatPrice } from '@/lib/utils'
import {
  Store,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function SuperAdminDashboard() {
  const { data: stats, isLoading } = trpc.superadmin.getPlatformStats.useQuery()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return <div>Erreur de chargement des statistiques</div>
  }

  const statCards = [
    {
      title: 'Boutiques Totales',
      value: stats.totalStores,
      icon: Store,
      color: 'purple',
      href: '/superadmin/stores',
    },
    {
      title: 'Utilisateurs',
      value: stats.totalUsers,
      icon: Users,
      color: 'blue',
      href: '/superadmin/users',
    },
    {
      title: 'Produits',
      value: stats.totalProducts,
      icon: Package,
      color: 'green',
    },
    {
      title: 'Commandes',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'orange',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Plateforme</h1>
        <p className="text-gray-600">Vue d'ensemble de la plateforme FoxCard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}
              >
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              {stat.href && (
                <Link
                  href={stat.href}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  Voir
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value.toLocaleString()}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Revenue Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Revenu Total de la Plateforme</h3>
            <p className="text-sm text-gray-600">Toutes les boutiques confondues</p>
          </div>
          <Link
            href="/superadmin/analytics"
            className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
          >
            Analytics détaillées
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex items-baseline gap-3 mb-2">
          <div className="text-4xl font-bold text-gray-900">
            {formatPrice(stats.totalRevenue)}
          </div>
          {stats.revenueGrowth !== 0 && (
            <div
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                stats.revenueGrowth > 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {stats.revenueGrowth > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {Math.abs(stats.revenueGrowth).toFixed(1)}% vs mois dernier
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500">Commandes complétées et en cours</p>
      </Card>

      {/* Monthly Revenue Chart */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Revenus Mensuels (12 derniers mois)</h3>
        <div className="space-y-3">
          {Object.entries(stats.monthlyStats)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-12)
            .map(([month, data]) => {
              const maxRevenue = Math.max(
                ...Object.values(stats.monthlyStats).map((d) => d.revenue)
              )
              const percentage = (data.revenue / maxRevenue) * 100

              return (
                <div key={month} className="flex items-center gap-4">
                  <div className="w-20 text-sm text-gray-600">{month}</div>
                  <div className="flex-1">
                    <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center px-3 transition-all"
                        style={{ width: `${percentage}%` }}
                      >
                        <span className="text-xs font-medium text-white">
                          {formatPrice(data.revenue)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-24 text-sm text-gray-600 text-right">
                    {data.orders} commandes
                  </div>
                </div>
              )
            })}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/superadmin/stores">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-300">
            <Store className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Gérer les Boutiques</h3>
            <p className="text-sm text-gray-600">Voir et gérer toutes les boutiques de la plateforme</p>
          </Card>
        </Link>

        <Link href="/superadmin/users">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-300">
            <Users className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Gérer les Utilisateurs</h3>
            <p className="text-sm text-gray-600">Administrer les rôles et permissions des utilisateurs</p>
          </Card>
        </Link>

        <Link href="/superadmin/analytics">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-green-300">
            <DollarSign className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Analytics</h3>
            <p className="text-sm text-gray-600">Voir les performances détaillées par boutique</p>
          </Card>
        </Link>
      </div>
    </div>
  )
}
