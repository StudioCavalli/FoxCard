'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import {
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react'

interface ActivityStats {
  id: string
  name: string
  totalSessions: number
  totalCapacity: number
  totalBooked: number
  totalAttended: number
  avgOccupancy: number
  noShowRate: number
}

interface TimeSlotStats {
  timeSlot: string
  bookings: number
  attendance: number
  noShows: number
}

export default function AttendanceAnalyticsPage() {
  const { storeId } = useStoreContext()
  const params = useParams()
  const locale = params?.locale || 'fr'

  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d')

  // Mock activity stats
  const activityStats: ActivityStats[] = [
    {
      id: '1',
      name: 'Yoga Matinal',
      totalSessions: 24,
      totalCapacity: 360,
      totalBooked: 312,
      totalAttended: 289,
      avgOccupancy: 87,
      noShowRate: 7.4,
    },
    {
      id: '2',
      name: 'Pilates',
      totalSessions: 16,
      totalCapacity: 192,
      totalBooked: 178,
      totalAttended: 156,
      avgOccupancy: 93,
      noShowRate: 12.4,
    },
    {
      id: '3',
      name: 'Spinning',
      totalSessions: 12,
      totalCapacity: 240,
      totalBooked: 228,
      totalAttended: 215,
      avgOccupancy: 95,
      noShowRate: 5.7,
    },
    {
      id: '4',
      name: 'CrossFit',
      totalSessions: 20,
      totalCapacity: 200,
      totalBooked: 145,
      totalAttended: 138,
      avgOccupancy: 73,
      noShowRate: 4.8,
    },
  ]

  // Mock time slot popularity
  const timeSlotStats: TimeSlotStats[] = [
    { timeSlot: '06:00 - 08:00', bookings: 245, attendance: 228, noShows: 17 },
    { timeSlot: '08:00 - 10:00', bookings: 189, attendance: 171, noShows: 18 },
    { timeSlot: '10:00 - 12:00', bookings: 156, attendance: 148, noShows: 8 },
    { timeSlot: '12:00 - 14:00', bookings: 312, attendance: 289, noShows: 23 },
    { timeSlot: '14:00 - 16:00', bookings: 98, attendance: 91, noShows: 7 },
    { timeSlot: '16:00 - 18:00', bookings: 178, attendance: 162, noShows: 16 },
    { timeSlot: '18:00 - 20:00', bookings: 387, attendance: 356, noShows: 31 },
    { timeSlot: '20:00 - 22:00', bookings: 123, attendance: 112, noShows: 11 },
  ]

  // Mock daily attendance trend
  const dailyAttendance = useMemo(() => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
    const data = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toISOString().split('T')[0],
        booked: Math.floor(Math.random() * 50) + 30,
        attended: Math.floor(Math.random() * 45) + 25,
      })
    }
    return data
  }, [dateRange])

  // Calculate totals
  const totalBooked = activityStats.reduce((sum, s) => sum + s.totalBooked, 0)
  const totalAttended = activityStats.reduce((sum, s) => sum + s.totalAttended, 0)
  const avgOccupancy = Math.round(
    activityStats.reduce((sum, s) => sum + s.avgOccupancy, 0) / activityStats.length
  )
  const avgNoShowRate = Math.round(
    (activityStats.reduce((sum, s) => sum + s.noShowRate, 0) / activityStats.length) * 10
  ) / 10

  // Find peak time
  const peakTime = timeSlotStats.reduce((max, slot) =>
    slot.bookings > max.bookings ? slot : max
  , timeSlotStats[0])

  const maxBookings = Math.max(...timeSlotStats.map(s => s.bookings))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Assiduité</h1>
          <p className="text-gray-600">Suivez la présence et l'engagement de vos participants</p>
        </div>
        <div className="flex border rounded-lg overflow-hidden">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-2 text-sm ${
                dateRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {range === '7d' ? '7 jours' : range === '30d' ? '30 jours' : '90 jours'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalBooked}</p>
              <p className="text-sm text-gray-500">Réservations</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalAttended}</p>
              <p className="text-sm text-gray-500">Présences</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{avgOccupancy}%</p>
              <p className="text-sm text-gray-500">Taux occupation</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{avgNoShowRate}%</p>
              <p className="text-sm text-gray-500">Taux no-show</p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Attendance Trend */}
      <AdminCard>
        <h3 className="font-medium text-gray-900 mb-4">Tendance des présences</h3>
        <div className="h-64">
          <div className="flex items-end gap-1 h-48">
            {dailyAttendance.map((day, idx) => {
              const maxVal = Math.max(...dailyAttendance.map(d => d.booked))
              const bookedHeight = (day.booked / maxVal) * 100
              const attendedHeight = (day.attended / maxVal) * 100
              return (
                <div key={day.date} className="flex-1 group relative flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center" style={{ height: `${bookedHeight}%` }}>
                    <div
                      className="w-full bg-blue-200 rounded-t"
                      style={{ height: `${100 - (attendedHeight / bookedHeight) * 100}%` }}
                    />
                    <div
                      className="w-full bg-blue-500 rounded-b"
                      style={{ height: `${(attendedHeight / bookedHeight) * 100}%` }}
                    />
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    {new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    <br />
                    Réservés: {day.booked}
                    <br />
                    Présents: {day.attended}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>
              {new Date(dailyAttendance[0]?.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
            </span>
            <span>
              {new Date(dailyAttendance[dailyAttendance.length - 1]?.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
            </span>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-200 rounded" />
              <span>No-shows</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span>Présences</span>
            </div>
          </div>
        </div>
      </AdminCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Activity */}
        <AdminCard>
          <h3 className="font-medium text-gray-900 mb-4">Par activité</h3>
          <div className="space-y-4">
            {activityStats.map((stat) => (
              <div key={stat.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{stat.name}</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-600">{stat.avgOccupancy}% occup.</span>
                    <span className={stat.noShowRate > 10 ? 'text-red-600' : 'text-gray-600'}>
                      {stat.noShowRate}% no-show
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <div
                    className="h-2 bg-green-500 rounded-l"
                    style={{ width: `${(stat.totalAttended / stat.totalCapacity) * 100}%` }}
                  />
                  <div
                    className="h-2 bg-red-400"
                    style={{ width: `${((stat.totalBooked - stat.totalAttended) / stat.totalCapacity) * 100}%` }}
                  />
                  <div
                    className="h-2 bg-gray-200 rounded-r flex-1"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{stat.totalAttended} présents</span>
                  <span>{stat.totalBooked - stat.totalAttended} absents</span>
                  <span>{stat.totalCapacity - stat.totalBooked} non réservés</span>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        {/* Popular Times */}
        <AdminCard>
          <h3 className="font-medium text-gray-900 mb-4">Créneaux populaires</h3>
          <div className="space-y-3">
            {timeSlotStats.map((slot) => (
              <div key={slot.timeSlot} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{slot.timeSlot}</span>
                    {slot.timeSlot === peakTime.timeSlot && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                        Peak
                      </span>
                    )}
                  </div>
                  <span className="text-gray-600">{slot.bookings} résa.</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(slot.bookings / maxBookings) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span className="text-green-600">{slot.attendance} présents</span>
                  <span className="text-red-600">{slot.noShows} absents</span>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>

      {/* No-Show Analysis */}
      <AdminCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Analyse des absences</h3>
          <AlertTriangle className="w-5 h-5 text-orange-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Pic d'absences</p>
            <p className="font-bold text-lg">Lundi 18:00</p>
            <p className="text-xs text-gray-500">23% taux no-show</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Activité critique</p>
            <p className="font-bold text-lg">Pilates</p>
            <p className="text-xs text-gray-500">12.4% taux no-show</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Récidivistes</p>
            <p className="font-bold text-lg">8 membres</p>
            <p className="text-xs text-gray-500">3+ absences/mois</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            <strong>Suggestion:</strong> Envisagez une politique de pénalité pour les absences répétées
            ou un système de rappel 24h avant la session.
          </p>
        </div>
      </AdminCard>
    </div>
  )
}
