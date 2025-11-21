'use client'

import { AdminCard, AdminCardHeader } from '@/components/admin/ui/AdminCard'
import { AdminStatCard } from '@/components/admin/ui/AdminStatCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { trpc } from '@/lib/trpc/client'
import { formatPrice } from '@/lib/utils'
import {
  Store,
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Activity,
  Settings,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

export default function SuperAdminDashboard() {
  const { data: stats, isLoading } = trpc.superadmin.getPlatformStats.useQuery()

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
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Activity className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400">Erreur de chargement</p>
        </div>
      </div>
    )
  }

  const statCards = [
    { title: 'Boutiques', value: stats.totalStores, icon: Store, variant: 'violet' as const, href: '/superadmin/stores' },
    { title: 'Utilisateurs', value: stats.totalUsers, icon: Users, variant: 'blue' as const, href: '/superadmin/users' },
    { title: 'Produits', value: stats.totalProducts, icon: Package, variant: 'emerald' as const },
    { title: 'Commandes', value: stats.totalOrders, icon: ShoppingCart, variant: 'amber' as const },
  ]

  const recentMonths = Object.entries(stats.monthlyStats).sort(([a], [b]) => a.localeCompare(b)).slice(-6)
  const maxRevenue = Math.max(...recentMonths.map(([, d]) => d.revenue), 1)

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <AdminStatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} variant={stat.variant} href={stat.href} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AdminCard className="lg:col-span-2" padding="lg">
          <AdminCardHeader title="Revenu Total" description="Performance financière" action={
            <Link href="/superadmin/analytics">
              <AdminButton variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">Analytics</AdminButton>
            </Link>
          } />
          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-4xl font-bold text-slate-900 dark:text-white">{formatPrice(stats.totalRevenue)}</span>
            {stats.revenueGrowth !== 0 && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${stats.revenueGrowth > 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                {stats.revenueGrowth > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(stats.revenueGrowth).toFixed(1)}%
              </div>
            )}
          </div>
          <div className="space-y-3">
            {recentMonths.map(([month, data]) => {
              const pct = (data.revenue / maxRevenue) * 100
              return (
                <div key={month} className="group flex items-center gap-4">
                  <span className="w-16 text-sm font-medium text-slate-500 dark:text-slate-400">{month}</span>
                  <div className="flex-1 h-10 bg-slate-100 dark:bg-slate-700/50 rounded-xl overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl flex items-center justify-end px-3" style={{ width: `${Math.max(pct, 5)}%` }}>
                      <span className="text-xs font-semibold text-white whitespace-nowrap">{formatPrice(data.revenue)}</span>
                    </div>
                  </div>
                  <span className="w-24 text-sm text-slate-500 dark:text-slate-400 text-right">{data.orders} cmd</span>
                </div>
              )
            })}
          </div>
        </AdminCard>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Actions Rapides</h3>
          {[
            { href: '/superadmin/stores', icon: Store, title: 'Boutiques', desc: stats.totalStores + ' boutiques', gradient: 'from-violet-500 to-indigo-600', shadow: 'violet' },
            { href: '/superadmin/users', icon: Users, title: 'Utilisateurs', desc: stats.totalUsers + ' utilisateurs', gradient: 'from-blue-500 to-cyan-600', shadow: 'blue' },
            { href: '/superadmin/settings', icon: Settings, title: 'Paramètres', desc: 'Configurer', gradient: 'from-slate-500 to-slate-600', shadow: 'slate' },
            { href: '/superadmin/analytics', icon: BarChart3, title: 'Analytics', desc: 'Rapports', gradient: 'from-emerald-500 to-green-600', shadow: 'emerald' },
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

      <AdminCard padding="lg">
        <AdminCardHeader title="Santé de la Plateforme" description="État des services" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {['API', 'Base de données', 'Paiements', 'Stockage'].map((name) => (
            <div key={name} className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{name}</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Opérationnel</p>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  )
}
