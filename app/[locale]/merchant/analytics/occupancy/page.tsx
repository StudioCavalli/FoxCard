'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import {
  Loader2,
  Calendar,
  TrendingUp,
  TrendingDown,
  Bed,
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import Link from 'next/link'

type Period = 'week' | 'month' | 'quarter' | 'year'

export default function OccupancyAnalyticsPage() {
  const t = useTranslations('merchant.hotel.analytics')
  const { storeId } = useStoreContext()
  const params = useParams()
  const locale = params?.locale || 'fr'
  const basePath = `/${locale}/merchant`

  const [period, setPeriod] = useState<Period>('month')
  const [currentDate, setCurrentDate] = useState(new Date())

  // Calculate date range based on period
  const dateRange = useMemo(() => {
    const end = new Date(currentDate)
    const start = new Date(currentDate)

    switch (period) {
      case 'week':
        start.setDate(start.getDate() - 7)
        break
      case 'month':
        start.setMonth(start.getMonth() - 1)
        break
      case 'quarter':
        start.setMonth(start.getMonth() - 3)
        break
      case 'year':
        start.setFullYear(start.getFullYear() - 1)
        break
    }

    return { start, end }
  }, [currentDate, period])

  // Get hotel stats using the existing router
  const { data: stats, isLoading, refetch } = trpc.hotel.getStats.useQuery(
    {
      storeId: storeId!,
      startDate: dateRange.start.toISOString(),
      endDate: dateRange.end.toISOString(),
    },
    { enabled: !!storeId }
  )

  // Get rooms count
  const { data: products } = trpc.product.getAll.useQuery(
    { storeId: storeId!, limit: 100 },
    { enabled: !!storeId }
  )

  const totalRooms = products?.products?.length || 0

  // Get bookings for chart data
  const { data: bookingsData } = trpc.booking.getAll.useQuery(
    {
      storeId: storeId!,
      dateFrom: dateRange.start.toISOString(),
      dateTo: dateRange.end.toISOString(),
      limit: 500,
    },
    { enabled: !!storeId }
  )

  // Calculate occupancy by day for chart
  const chartData = useMemo(() => {
    if (!bookingsData?.bookings || totalRooms === 0) return []

    const days: Record<string, number> = {}
    const current = new Date(dateRange.start)

    while (current <= dateRange.end) {
      days[current.toISOString().split('T')[0]] = 0
      current.setDate(current.getDate() + 1)
    }

    for (const booking of bookingsData.bookings) {
      const dateStr = new Date(booking.date).toISOString().split('T')[0]
      if (days[dateStr] !== undefined) {
        days[dateStr]++
      }
    }

    return Object.entries(days).map(([date, count]) => ({
      date,
      occupancy: Math.round((count / totalRooms) * 100),
      rooms: count,
    }))
  }, [bookingsData, dateRange, totalRooms])

  const periodLabels: Record<Period, string> = {
    week: '7 jours',
    month: '30 jours',
    quarter: '3 mois',
    year: '12 mois',
  }

  const navigate = (direction: number) => {
    const newDate = new Date(currentDate)
    switch (period) {
      case 'week':
        newDate.setDate(newDate.getDate() + direction * 7)
        break
      case 'month':
        newDate.setMonth(newDate.getMonth() + direction)
        break
      case 'quarter':
        newDate.setMonth(newDate.getMonth() + direction * 3)
        break
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + direction)
        break
    }
    setCurrentDate(newDate)
  }

  // Calculate average occupancy
  const avgOccupancy = chartData.length > 0
    ? Math.round(chartData.reduce((sum, d) => sum + d.occupancy, 0) / chartData.length)
    : 0

  // Find peak and low days
  const peakDay = chartData.length > 0
    ? chartData.reduce((max, d) => d.occupancy > max.occupancy ? d : max, chartData[0])
    : null

  const lowDay = chartData.length > 0
    ? chartData.reduce((min, d) => d.occupancy < min.occupancy ? d : min, chartData[0])
    : null

  // Simple bar chart
  const maxOccupancy = Math.max(...chartData.map(d => d.occupancy), 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('occupancy')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Analysez le taux d'occupation de vos chambres</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`${basePath}/analytics/revenue`}>
            <AdminButton variant="secondary">
              Revenus
            </AdminButton>
          </Link>
        </div>
      </div>

      {/* Period Selector */}
      <AdminCard padding="md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AdminButton variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ChevronLeft className="w-5 h-5" />
            </AdminButton>
            <span className="font-medium px-2 text-slate-900 dark:text-white">
              {dateRange.start.toLocaleDateString(locale)} - {dateRange.end.toLocaleDateString(locale)}
            </span>
            <AdminButton variant="ghost" size="sm" onClick={() => navigate(1)}>
              <ChevronRight className="w-5 h-5" />
            </AdminButton>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            {(['week', 'month', 'quarter', 'year'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  period === p
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </div>
      </AdminCard>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminCard padding="lg">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 dark:from-blue-500/30 dark:to-cyan-500/30 rounded-xl flex items-center justify-center">
                  <Bed className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-4">
                {avgOccupancy}%
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Occupation moyenne</p>
            </AdminCard>

            <AdminCard padding="lg">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-green-500/20 dark:from-emerald-500/30 dark:to-green-500/30 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-4">
                {peakDay?.occupancy || 0}%
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Pic ({peakDay ? new Date(peakDay.date).toLocaleDateString(locale, { day: 'numeric', month: 'short' }) : '-'})
              </p>
            </AdminCard>

            <AdminCard padding="lg">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-orange-500/20 dark:from-amber-500/30 dark:to-orange-500/30 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-4">
                {lowDay?.occupancy || 0}%
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Creux ({lowDay ? new Date(lowDay.date).toLocaleDateString(locale, { day: 'numeric', month: 'short' }) : '-'})
              </p>
            </AdminCard>

            <AdminCard padding="lg">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500/20 to-purple-500/20 dark:from-violet-500/30 dark:to-purple-500/30 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-4">
                {totalRooms}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Chambres total</p>
            </AdminCard>
          </div>

          {/* Occupancy Chart */}
          <AdminCard padding="lg">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Évolution du taux d'occupation
            </h3>
            {chartData.length > 0 ? (
              <>
                <div className="flex items-end gap-1 h-48">
                  {chartData.map((item, index) => (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center group"
                    >
                      <div className="relative w-full">
                        <div
                          className={`w-full rounded-t transition-all ${
                            item.occupancy >= 80 ? 'bg-emerald-500 dark:bg-emerald-600' :
                            item.occupancy >= 50 ? 'bg-yellow-500 dark:bg-yellow-600' :
                            item.occupancy >= 30 ? 'bg-amber-500 dark:bg-amber-600' :
                            'bg-red-500 dark:bg-red-600'
                          }`}
                          style={{
                            height: `${Math.max((item.occupancy / maxOccupancy) * 180, 4)}px`,
                          }}
                          title={`${item.date}: ${item.occupancy}%`}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {new Date(item.date).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}: {item.occupancy}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{new Date(chartData[0]?.date).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</span>
                  <span>{new Date(chartData[chartData.length - 1]?.date).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</span>
                </div>
                {/* Legend */}
                <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="w-3 h-3 bg-emerald-500 rounded" />
                    <span>80%+</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="w-3 h-3 bg-yellow-500 rounded" />
                    <span>50-79%</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="w-3 h-3 bg-amber-500 rounded" />
                    <span>30-49%</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="w-3 h-3 bg-red-500 rounded" />
                    <span>&lt;30%</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400 dark:text-slate-500">
                <p>Pas de données pour cette période</p>
              </div>
            )}
          </AdminCard>

          {/* Real-time Stats */}
          <AdminCard padding="lg">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" />
              Statut actuel
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                <p className="text-sm text-slate-600 dark:text-slate-400">Chambres disponibles</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats?.roomsAvailable || 0}</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                <p className="text-sm text-slate-600 dark:text-slate-400">Chambres occupées</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats?.roomsOccupied || 0}</p>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
                <p className="text-sm text-slate-600 dark:text-slate-400">Arrivées aujourd'hui</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats?.upcomingCheckIns || 0}</p>
              </div>
              <div className="p-4 bg-violet-50 dark:bg-violet-500/10 rounded-xl">
                <p className="text-sm text-slate-600 dark:text-slate-400">Départs aujourd'hui</p>
                <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{stats?.upcomingCheckOuts || 0}</p>
              </div>
            </div>
          </AdminCard>
        </>
      )}
    </div>
  )
}
