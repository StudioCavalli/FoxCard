'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Users,
  Repeat,
  Loader2,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const DAYS_OF_WEEK = [
  { value: 0, label: 'Dimanche' },
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
]

interface Schedule {
  id: string
  activityId: string
  activityName: string
  dayOfWeek: number
  startTime: string
  endTime: string
  duration: number
  capacity: number
  recurring: boolean
  instructor?: string
  location?: string
  isActive: boolean
}

export default function SchedulesPage() {
  const { storeId } = useStoreContext()
  const params = useParams()
  const locale = params?.locale || 'fr'

  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    activityId: '',
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:00',
    capacity: 10,
    recurring: true,
    instructor: '',
    location: '',
  })

  // Get products (activities)
  const { data: productsData, isLoading } = trpc.product.getAll.useQuery(
    { storeId: storeId!, limit: 100 },
    { enabled: !!storeId }
  )

  const activities = productsData?.products || []

  // Mock schedules
  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: '1',
      activityId: '1',
      activityName: 'Yoga Matinal',
      dayOfWeek: 1,
      startTime: '07:00',
      endTime: '08:00',
      duration: 60,
      capacity: 15,
      recurring: true,
      instructor: 'Marie D.',
      location: 'Salle A',
      isActive: true,
    },
    {
      id: '2',
      activityId: '1',
      activityName: 'Yoga Matinal',
      dayOfWeek: 3,
      startTime: '07:00',
      endTime: '08:00',
      duration: 60,
      capacity: 15,
      recurring: true,
      instructor: 'Marie D.',
      location: 'Salle A',
      isActive: true,
    },
    {
      id: '3',
      activityId: '2',
      activityName: 'Pilates',
      dayOfWeek: 2,
      startTime: '12:00',
      endTime: '13:00',
      duration: 60,
      capacity: 12,
      recurring: true,
      instructor: 'Julie M.',
      location: 'Salle B',
      isActive: true,
    },
    {
      id: '4',
      activityId: '3',
      activityName: 'Spinning',
      dayOfWeek: 4,
      startTime: '18:00',
      endTime: '19:00',
      duration: 60,
      capacity: 20,
      recurring: true,
      instructor: 'Thomas L.',
      location: 'Salle Spinning',
      isActive: true,
    },
    {
      id: '5',
      activityId: '3',
      activityName: 'Spinning',
      dayOfWeek: 6,
      startTime: '10:00',
      endTime: '11:00',
      duration: 60,
      capacity: 20,
      recurring: true,
      instructor: 'Thomas L.',
      location: 'Salle Spinning',
      isActive: true,
    },
  ])

  // Get schedules for a specific day
  const getSchedulesForDay = (day: number) => {
    return schedules
      .filter(s => s.dayOfWeek === day && s.isActive)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  const resetForm = () => {
    setFormData({
      activityId: '',
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '10:00',
      capacity: 10,
      recurring: true,
      instructor: '',
      location: '',
    })
  }

  const handleSave = () => {
    const activity = activities.find(a => a.id === formData.activityId)
    const [startHour, startMin] = formData.startTime.split(':').map(Number)
    const [endHour, endMin] = formData.endTime.split(':').map(Number)
    const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin)

    if (editingSchedule) {
      setSchedules(schedules.map(s =>
        s.id === editingSchedule.id
          ? {
              ...s,
              ...formData,
              activityName: activity?.name || 'Activité',
              duration,
            }
          : s
      ))
    } else {
      const newSchedule: Schedule = {
        id: Date.now().toString(),
        activityId: formData.activityId,
        activityName: activity?.name || 'Activité',
        dayOfWeek: formData.dayOfWeek,
        startTime: formData.startTime,
        endTime: formData.endTime,
        duration,
        capacity: formData.capacity,
        recurring: formData.recurring,
        instructor: formData.instructor || undefined,
        location: formData.location || undefined,
        isActive: true,
      }
      setSchedules([...schedules, newSchedule])
    }
    setShowAddModal(false)
    setEditingSchedule(null)
    resetForm()
  }

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setFormData({
      activityId: schedule.activityId,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      capacity: schedule.capacity,
      recurring: schedule.recurring,
      instructor: schedule.instructor || '',
      location: schedule.location || '',
    })
    setShowAddModal(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) {
      setSchedules(schedules.filter(s => s.id !== id))
    }
  }

  // Stats
  const totalSlots = schedules.filter(s => s.isActive).length
  const totalCapacity = schedules.filter(s => s.isActive).reduce((sum, s) => sum + s.capacity, 0)
  const uniqueActivities = new Set(schedules.map(s => s.activityId)).size

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Horaires des Activités</h1>
          <p className="text-gray-600">Gérez le planning hebdomadaire de vos activités</p>
        </div>
        <AdminButton onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un créneau
        </AdminButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalSlots}</p>
              <p className="text-sm text-gray-500">Créneaux/semaine</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalCapacity}</p>
              <p className="text-sm text-gray-500">Places totales</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Repeat className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{uniqueActivities}</p>
              <p className="text-sm text-gray-500">Activités</p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Weekly Schedule Grid */}
      <AdminCard>
        <h3 className="font-medium text-gray-900 mb-4">Planning hebdomadaire</h3>
        <div className="grid grid-cols-7 gap-2">
          {DAYS_OF_WEEK.map(({ value, label }) => {
            const daySchedules = getSchedulesForDay(value)
            return (
              <div key={value} className="min-h-[200px]">
                <div className="text-center font-medium text-sm text-gray-700 mb-2 pb-2 border-b">
                  {label}
                </div>
                <div className="space-y-2">
                  {daySchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="bg-blue-50 border border-blue-200 rounded p-2 text-xs group relative"
                    >
                      <p className="font-medium text-blue-900 truncate">{schedule.activityName}</p>
                      <p className="text-blue-700">
                        {schedule.startTime} - {schedule.endTime}
                      </p>
                      {schedule.instructor && (
                        <p className="text-blue-600 truncate">{schedule.instructor}</p>
                      )}
                      <p className="text-blue-600">
                        <Users className="w-3 h-3 inline mr-1" />
                        {schedule.capacity}
                      </p>
                      <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                        <button
                          onClick={() => handleEdit(schedule)}
                          className="p-1 bg-white rounded shadow hover:bg-blue-100"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="p-1 bg-white rounded shadow hover:bg-red-100"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {daySchedules.length === 0 && (
                    <p className="text-gray-400 text-xs text-center py-4">
                      Aucun créneau
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </AdminCard>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {editingSchedule ? 'Modifier le créneau' : 'Ajouter un créneau'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingSchedule(null)
                    resetForm()
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activité *
                </label>
                <select
                  value={formData.activityId}
                  onChange={(e) => setFormData({ ...formData, activityId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner une activité</option>
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>{activity.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jour *
                </label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {DAYS_OF_WEEK.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Début *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fin *
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacité *
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructeur
                </label>
                <input
                  type="text"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom de l'instructeur"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lieu
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Salle, terrain..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={formData.recurring}
                  onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="recurring" className="text-sm text-gray-700">
                  Récurrent chaque semaine
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <AdminButton
                variant="secondary"
                onClick={() => {
                  setShowAddModal(false)
                  setEditingSchedule(null)
                  resetForm()
                }}
              >
                Annuler
              </AdminButton>
              <AdminButton onClick={handleSave} disabled={!formData.activityId}>
                {editingSchedule ? 'Modifier' : 'Ajouter'}
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
