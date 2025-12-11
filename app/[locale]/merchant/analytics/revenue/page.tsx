'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import { formatPrice } from '@/lib/utils'
import {
  Loader2,
  DollarSign,
  TrendingUp,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Bed,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

type Period = 'week' | 'month' | 'quarter' | 'year'

export default function RevenueAnalyticsPage() {
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

  // Get hotel stats
  const { data: stats, isLoading } = trpc.hotel.getStats.useQuery(
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

  // Get bookings for revenue chart
  const { data: bookingsData } = trpc.booking.getAll.useQuery(
    {
      storeId: storeId!,
      dateFrom: dateRange.start.toISOString(),
      dateTo: dateRange.end.toISOString(),
      limit: 500,
    },
    { enabled: !!storeId }
  )

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!bookingsData?.bookings || totalRooms === 0) {
      return {
        totalRevenue: 0,
        adr: 0,
        revpar: 0,
        totalBookings: 0,
        avgStayLength: 0,
      }
    }

    const bookings = bookingsData.bookings
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0)
    const roomNights = bookings.length

    // Calculate total available room nights in period
    const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
    const availableRoomNights = totalRooms * days

    // ADR = Average Daily Rate = Revenue / Rooms Sold
    const adr = roomNights > 0 ? totalRevenue / roomNights : 0

    // RevPAR = Revenue Per Available Room = Revenue / Available Rooms
    const revpar = availableRoomNights > 0 ? totalRevenue / availableRoomNights : 0

    // Average stay length
    const avgStayLength = bookings.length > 0
      ? bookings.reduce((sum, b) => {
          const opts = (b.options || {}) as any
          return sum + (opts.nights || 1)
        }, 0) / bookings.length
      : 0

    return {
      totalRevenue,
      adr,
      revpar,
      totalBookings: bookings.length,
      avgStayLength,
    }
  }, [bookingsData, dateRange, totalRooms])

  // Revenue by day for chart
  const chartData = useMemo(() => {
    if (!bookingsData?.bookings) return []

    const days: Record<string, number> = {}
    const current = new Date(dateRange.start)

    while (current <= dateRange.end) {
      days[current.toISOString().split('T')[0]] = 0
      current.setDate(current.getDate() + 1)
    }

    for (const booking of bookingsData.bookings) {
      const dateStr = new Date(booking.date).toISOString().split('T')[0]
      if (days[dateStr] !== undefined) {
        days[dateStr] += booking.totalPrice
      }
    }

    return Object.entries(days).map(([date, revenue]) => ({
      date,
      revenue,
    }))
  }, [bookingsData, dateRange])

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

  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Revenus & Performance</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">RevPAR, ADR et analyse des revenus</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`${basePath}/analytics/occupancy`}>
            <AdminButton variant="secondary">
              Occupation
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
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <AdminCard padding="lg">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-green-500/20 dark:from-emerald-500/30 dark:to-green-500/30 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-4">
                {formatPrice(metrics.totalRevenue)}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Chiffre d'affaires</p>
            </AdminCard>

            <AdminCard padding="lg" className="ring-2 ring-blue-500/30 dark:ring-blue-400/30">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 dark:from-blue-500/30 dark:to-cyan-500/30 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-4">
                {formatPrice(metrics.revpar)}
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300">{t('revpar')}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Revenu par chambre disponible</p>
            </AdminCard>

            <AdminCard padding="lg" className="ring-2 ring-primary-500/30 dark:ring-primary-400/30">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-purple-500/20 dark:from-primary-500/30 dark:to-purple-500/30 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-4">
                {formatPrice(metrics.adr)}
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300">{t('adr')}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Prix moyen par nuit vendue</p>
            </AdminCard>

            <AdminCard padding="lg">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-orange-500/20 dark:from-amber-500/30 dark:to-orange-500/30 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-4">
                {metrics.totalBookings}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Réservations</p>
            </AdminCard>

            <AdminCard padding="lg">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-blue-500/20 dark:from-primary-500/30 dark:to-blue-500/30 rounded-xl flex items-center justify-center">
                  <Bed className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-4">
                {metrics.avgStayLength.toFixed(1)}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Durée moyenne (nuits)</p>
            </AdminCard>
          </div>

          {/* Metrics Explanation */}
          <AdminCard padding="md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-blue-600 dark:text-blue-400">RevPAR (Revenue Per Available Room)</p>
                <p className="text-slate-600 dark:text-slate-400">
                  Mesure la performance globale. RevPAR = CA / (Chambres x Jours)
                </p>
              </div>
              <div>
                <p className="font-medium text-primary-600 dark:text-primary-400">ADR (Average Daily Rate)</p>
                <p className="text-slate-600 dark:text-slate-400">
                  Prix moyen par nuit vendue. ADR = CA / Nuits vendues
                </p>
              </div>
            </div>
          </AdminCard>

          {/* Revenue Chart */}
          <AdminCard padding="lg">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Évolution du chiffre d'affaires
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
                          className="w-full bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-t transition-all"
                          style={{
                            height: `${Math.max((item.revenue / maxRevenue) * 180, item.revenue > 0 ? 4 : 0)}px`,
                          }}
                          title={`${item.date}: ${formatPrice(item.revenue)}`}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {new Date(item.date).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}: {formatPrice(item.revenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{new Date(chartData[0]?.date).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</span>
                  <span>{new Date(chartData[chartData.length - 1]?.date).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</span>
                </div>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400 dark:text-slate-500">
                <p>Pas de données pour cette période</p>
              </div>
            )}
          </AdminCard>

          {/* Performance Summary */}
          <AdminCard padding="lg">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Résumé de performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Occupation sur la période</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${stats?.occupancyRate || 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{Math.round(stats?.occupancyRate || 0)}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">RevPAR vs ADR</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  RevPAR représente <span className="font-bold text-slate-900 dark:text-white">
                    {metrics.adr > 0 ? Math.round((metrics.revpar / metrics.adr) * 100) : 0}%
                  </span> de l'ADR
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  (100% = occupation parfaite)
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Potentiel non réalisé</p>
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {formatPrice((metrics.adr * totalRooms * Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))) - metrics.totalRevenue)}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Si 100% d'occupation à l'ADR actuel</p>
              </div>
            </div>
          </AdminCard>
        </>
      )}
    </div>
  )
}
