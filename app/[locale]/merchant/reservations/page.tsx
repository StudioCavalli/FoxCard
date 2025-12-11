'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Users,
  Loader2,
  CalendarDays,
  Clock
} from 'lucide-react'
import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  CHECKED_IN: 'bg-green-100 text-green-800 border-green-200',
  COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  NO_SHOW: 'bg-orange-100 text-orange-800 border-orange-200',
}

// Helper to calculate nights between dates
const calculateNights = (checkIn: Date, checkOut: Date) => {
  return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
}

export default function ReservationsPage() {
  const t = useTranslations('merchant.hotel.reservations')
  const { storeId } = useStoreContext()
  const params = useParams()
  const locale = params?.locale || 'fr'
  const basePath = `/${locale}/merchant`

  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Get reservations for the current month using Booking system
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

  // Use booking.getAll - bookings have productId linking to rooms (Products)
  const { data: bookingsData, isLoading } = trpc.booking.getAll.useQuery(
    {
      storeId: storeId!,
      dateFrom: startOfMonth.toISOString(),
      dateTo: endOfMonth.toISOString(),
      limit: 100,
    },
    { enabled: !!storeId }
  )

  // Also get products (rooms) to display room info
  const { data: productsData } = trpc.product.getAll.useQuery(
    { storeId: storeId!, limit: 100 },
    { enabled: !!storeId }
  )

  // Transform bookings to reservation format
  const reservations = useMemo(() => {
    if (!bookingsData?.bookings) return []
    const products = productsData?.products || []

    return bookingsData.bookings.map((booking: any) => {
      const product = products.find(p => p.id === booking.productId)
      const opts = (booking.options || {}) as any
      const checkInDate = new Date(booking.date)
      const checkOutDate = opts.checkOutDate ? new Date(opts.checkOutDate) : new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000)
      const nights = opts.nights || calculateNights(checkInDate, checkOutDate)

      return {
        id: booking.id,
        guestName: booking.customerName,
        guestEmail: booking.customerEmail,
        checkInDate,
        checkOutDate,
        nights,
        status: booking.status,
        totalAmount: booking.totalPrice,
        room: product ? {
          roomNumber: product.sku || product.name,
          name: product.name,
        } : null,
        productId: booking.productId,
      }
    })
  }, [bookingsData, productsData])

  // Calendar generation
  const calendarDays = useMemo(() => {
    const days = []
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    // Add empty days for alignment
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1 // Monday start
    for (let i = 0; i < startDay; i++) {
      days.push(null)
    }

    // Add actual days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), d))
    }

    return days
  }, [currentDate])

  // Get reservations for a specific day
  const getReservationsForDay = (date: Date) => {
    if (!reservations) return []
    return reservations.filter((r: any) => {
      const checkIn = new Date(r.checkInDate)
      const checkOut = new Date(r.checkOutDate)
      return date >= checkIn && date < checkOut
    })
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Stats
  const todayReservations = reservations?.filter((r: any) => {
    const checkIn = new Date(r.checkInDate)
    checkIn.setHours(0, 0, 0, 0)
    return checkIn.getTime() === today.getTime()
  }) || []

  const todayCheckouts = reservations?.filter((r: any) => {
    const checkOut = new Date(r.checkOutDate)
    checkOut.setHours(0, 0, 0, 0)
    return checkOut.getTime() === today.getTime()
  }) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gérez vos réservations et disponibilités</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`${basePath}/check-in`}>
            <AdminButton variant="secondary">
              <Clock className="w-4 h-4 mr-2" />
              Check-in/out
            </AdminButton>
          </Link>
          <AdminButton icon={<Plus className="w-4 h-4" />}>
            {t('create')}
          </AdminButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminCard padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-primary-500/20 dark:from-blue-500/30 dark:to-primary-500/30 rounded-xl flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Arrivées aujourd'hui</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{todayReservations.length}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-amber-500/20 dark:from-orange-500/30 dark:to-amber-500/30 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Départs aujourd'hui</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{todayCheckouts.length}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-green-500/20 dark:from-emerald-500/30 dark:to-green-500/30 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">En séjour</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {reservations?.filter((r: any) => r.status === 'CHECKED_IN').length || 0}
              </p>
            </div>
          </div>
        </AdminCard>
        <AdminCard padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-purple-500/20 dark:from-primary-500/30 dark:to-purple-500/30 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Ce mois</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{reservations?.length || 0}</p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Calendar */}
      <AdminCard padding="lg">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <AdminButton variant="ghost" size="sm" onClick={() => navigateMonth(-1)}>
              <ChevronLeft className="w-5 h-5" />
            </AdminButton>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <AdminButton variant="ghost" size="sm" onClick={() => navigateMonth(1)}>
              <ChevronRight className="w-5 h-5" />
            </AdminButton>
          </div>
          <div className="flex items-center gap-2">
            <AdminButton
              variant={viewMode === 'month' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Mois
            </AdminButton>
            <AdminButton
              variant={viewMode === 'week' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Semaine
            </AdminButton>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <>
            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, idx) => {
                if (!date) {
                  return <div key={`empty-${idx}`} className="h-24 bg-slate-50 dark:bg-slate-800/50 rounded-lg" />
                }

                const dayReservations = getReservationsForDay(date)
                const isToday = date.toDateString() === today.toDateString()

                return (
                  <div
                    key={date.toISOString()}
                    className={`h-24 border rounded-lg p-1 overflow-hidden ${
                      isToday ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-primary-600 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-0.5">
                      {dayReservations.slice(0, 2).map((res: any) => (
                        <Link
                          key={res.id}
                          href={`${basePath}/reservations/${res.id}`}
                          className={`block text-xs px-1 py-0.5 rounded truncate border ${
                            STATUS_COLORS[res.status] || 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {res.guestName}
                        </Link>
                      ))}
                      {dayReservations.length > 2 && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 px-1">
                          +{dayReservations.length - 2} autres
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </AdminCard>

      {/* Reservations List */}
      <AdminCard padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">Réservations du mois</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-48 px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {reservations?.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              Aucune réservation ce mois
            </div>
          ) : (
            reservations?.slice(0, 10).map((res: any) => (
              <Link
                key={res.id}
                href={`${basePath}/reservations/${res.id}`}
                className="block p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-lg shadow-primary-500/20">
                      {res.guestName?.charAt(0) || 'G'}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{res.guestName}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {res.room?.roomNumber} - {res.nights} nuit{res.nights > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${STATUS_COLORS[res.status]}`}>
                      {t(`status.${res.status.toLowerCase()}`)}
                    </span>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {new Date(res.checkInDate).toLocaleDateString(locale)} → {new Date(res.checkOutDate).toLocaleDateString(locale)}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </AdminCard>
    </div>
  )
}
