'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Users,
  Clock,
  Loader2,
  Plus,
  X,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface Session {
  id: string
  activityName: string
  date: string
  startTime: string
  endTime: string
  capacity: number
  booked: number
  instructor?: string
  location?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
}

export default function CalendarPage() {
  const { storeId } = useStoreContext()
  const params = useParams()
  const locale = params?.locale || 'fr'

  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  // Mock sessions data
  const sessions: Session[] = useMemo(() => {
    const data: Session[] = []
    const today = new Date()

    // Generate sample sessions for the current month
    for (let i = 0; i < 30; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1)
      const dayOfWeek = date.getDay()

      // Skip past dates
      if (date < new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)) continue

      // Add sessions based on day of week
      if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
        data.push({
          id: `yoga-${i}`,
          activityName: 'Yoga Matinal',
          date: date.toISOString().split('T')[0],
          startTime: '07:00',
          endTime: '08:00',
          capacity: 15,
          booked: Math.floor(Math.random() * 15),
          instructor: 'Marie D.',
          location: 'Salle A',
          status: date < today ? 'completed' : 'scheduled',
        })
      }

      if (dayOfWeek === 2 || dayOfWeek === 4) {
        data.push({
          id: `pilates-${i}`,
          activityName: 'Pilates',
          date: date.toISOString().split('T')[0],
          startTime: '12:00',
          endTime: '13:00',
          capacity: 12,
          booked: Math.floor(Math.random() * 12),
          instructor: 'Julie M.',
          location: 'Salle B',
          status: date < today ? 'completed' : 'scheduled',
        })
      }

      if (dayOfWeek === 4 || dayOfWeek === 6) {
        data.push({
          id: `spinning-${i}`,
          activityName: 'Spinning',
          date: date.toISOString().split('T')[0],
          startTime: '18:00',
          endTime: '19:00',
          capacity: 20,
          booked: Math.floor(Math.random() * 20),
          instructor: 'Thomas L.',
          location: 'Salle Spinning',
          status: date < today ? 'completed' : 'scheduled',
        })
      }
    }

    return data
  }, [currentDate])

  // Calendar generation
  const calendarDays = useMemo(() => {
    const days = []
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    // Add empty days for alignment
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
    for (let i = 0; i < startDay; i++) {
      days.push(null)
    }

    // Add actual days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), d))
    }

    return days
  }, [currentDate])

  // Get sessions for a specific day
  const getSessionsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return sessions.filter(s => s.date === dateStr)
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
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled').length
  const totalBooked = sessions.filter(s => s.status === 'scheduled').reduce((sum, s) => sum + s.booked, 0)
  const avgOccupancy = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.booked / s.capacity) * 100, 0) / sessions.length)
    : 0

  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_progress': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-gray-100 text-gray-600 border-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getOccupancyColor = (booked: number, capacity: number) => {
    const ratio = booked / capacity
    if (ratio >= 0.9) return 'text-red-600'
    if (ratio >= 0.7) return 'text-orange-600'
    if (ratio >= 0.5) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendrier des Sessions</h1>
          <p className="text-gray-600">Visualisez et gérez toutes vos sessions d'activités</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-2 text-sm ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-white'}`}
            >
              Semaine
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-2 text-sm ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-white'}`}
            >
              Mois
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{upcomingSessions}</p>
              <p className="text-sm text-gray-500">Sessions à venir</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalBooked}</p>
              <p className="text-sm text-gray-500">Réservations</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{avgOccupancy}%</p>
              <p className="text-sm text-gray-500">Taux moyen</p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Calendar */}
      <AdminCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center gap-2">
            <AdminButton variant="secondary" onClick={() => navigateMonth(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </AdminButton>
            <AdminButton variant="secondary" onClick={() => setCurrentDate(new Date())}>
              Aujourd'hui
            </AdminButton>
            <AdminButton variant="secondary" onClick={() => navigateMonth(1)}>
              <ChevronRight className="w-4 h-4" />
            </AdminButton>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {/* Day headers */}
          {dayNames.map((day) => (
            <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((date, idx) => {
            if (!date) {
              return <div key={`empty-${idx}`} className="bg-white p-2 min-h-[120px]" />
            }

            const daySessions = getSessionsForDay(date)
            const isToday = date.toDateString() === today.toDateString()
            const isPast = date < today

            return (
              <div
                key={date.toISOString()}
                className={`bg-white p-2 min-h-[120px] ${
                  isPast ? 'opacity-60' : ''
                } ${isToday ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {daySessions.slice(0, 3).map((session) => (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className={`w-full text-left text-xs p-1 rounded border ${getStatusColor(session.status)} hover:opacity-80`}
                    >
                      <div className="font-medium truncate">{session.activityName}</div>
                      <div className="flex items-center justify-between">
                        <span>{session.startTime}</span>
                        <span className={getOccupancyColor(session.booked, session.capacity)}>
                          {session.booked}/{session.capacity}
                        </span>
                      </div>
                    </button>
                  ))}
                  {daySessions.length > 3 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{daySessions.length - 3} autres
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </AdminCard>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedSession.activityName}</h3>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">
                    {new Date(selectedSession.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Horaire</p>
                  <p className="font-medium">
                    {selectedSession.startTime} - {selectedSession.endTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Instructeur</p>
                  <p className="font-medium">{selectedSession.instructor || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lieu</p>
                  <p className="font-medium">{selectedSession.location || '-'}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Occupation</span>
                  <span className={`font-bold ${getOccupancyColor(selectedSession.booked, selectedSession.capacity)}`}>
                    {selectedSession.booked}/{selectedSession.capacity}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(selectedSession.booked / selectedSession.capacity) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedSession.capacity - selectedSession.booked} places disponibles
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Statut</p>
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(selectedSession.status)}`}>
                  {selectedSession.status === 'scheduled' && 'Programmé'}
                  {selectedSession.status === 'in_progress' && 'En cours'}
                  {selectedSession.status === 'completed' && 'Terminé'}
                  {selectedSession.status === 'cancelled' && 'Annulé'}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <AdminButton variant="secondary" onClick={() => setSelectedSession(null)}>
                Fermer
              </AdminButton>
              {selectedSession.status === 'scheduled' && (
                <AdminButton>
                  Voir participants
                </AdminButton>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
