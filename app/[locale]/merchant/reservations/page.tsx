'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
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
  CHECKED_OUT: 'bg-gray-100 text-gray-800 border-gray-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  NO_SHOW: 'bg-orange-100 text-orange-800 border-orange-200',
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

  // Get reservations for the current month
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

  const { data: reservations, isLoading } = trpc.hotel.getReservations?.useQuery(
    {
      storeId: storeId!,
      startDate: startOfMonth.toISOString(),
      endDate: endOfMonth.toISOString(),
    },
    { enabled: !!storeId }
  )

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
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-500 mt-1">Gérez vos réservations et disponibilités</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`${basePath}/check-in`}>
            <Button variant="secondary">
              <Clock className="w-4 h-4 mr-2" />
              Check-in/out
            </Button>
          </Link>
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            {t('create')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarDays className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Arrivées aujourd'hui</p>
              <p className="text-2xl font-bold">{todayReservations.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Départs aujourd'hui</p>
              <p className="text-2xl font-bold">{todayCheckouts.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">En séjour</p>
              <p className="text-2xl font-bold">
                {reservations?.filter((r: any) => r.status === 'CHECKED_IN').length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Ce mois</p>
              <p className="text-2xl font-bold">{reservations?.length || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Calendar */}
      <Card className="p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigateMonth(-1)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigateMonth(1)}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'month' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Mois
            </Button>
            <Button
              variant={viewMode === 'week' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Semaine
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <>
            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, idx) => {
                if (!date) {
                  return <div key={`empty-${idx}`} className="h-24 bg-gray-50 rounded" />
                }

                const dayReservations = getReservationsForDay(date)
                const isToday = date.toDateString() === today.toDateString()

                return (
                  <div
                    key={date.toISOString()}
                    className={`h-24 border rounded p-1 overflow-hidden ${
                      isToday ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-orange-600' : 'text-gray-700'
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-0.5">
                      {dayReservations.slice(0, 2).map((res: any) => (
                        <Link
                          key={res.id}
                          href={`${basePath}/reservations/${res.id}`}
                          className={`block text-xs px-1 py-0.5 rounded truncate border ${
                            STATUS_COLORS[res.status] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {res.guestName}
                        </Link>
                      ))}
                      {dayReservations.length > 2 && (
                        <div className="text-xs text-gray-500 px-1">
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
      </Card>

      {/* Reservations List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Réservations du mois</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-48"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {reservations?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune réservation ce mois
            </div>
          ) : (
            reservations?.slice(0, 10).map((res: any) => (
              <Link
                key={res.id}
                href={`${basePath}/reservations/${res.id}`}
                className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{res.guestName}</p>
                      <p className="text-sm text-gray-500">
                        {res.room?.roomNumber} - {res.nights} nuit{res.nights > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${STATUS_COLORS[res.status]}`}>
                      {t(`status.${res.status.toLowerCase()}`)}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(res.checkInDate).toLocaleDateString(locale)} → {new Date(res.checkOutDate).toLocaleDateString(locale)}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
