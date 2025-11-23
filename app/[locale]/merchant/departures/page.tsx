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
  Plus,
  Users,
  Loader2,
  Plane,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit2,
  Eye
} from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-800 border-green-200',
  LIMITED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  SOLD_OUT: 'bg-red-100 text-red-800 border-red-200',
  CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200',
}

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Disponible',
  LIMITED: 'Places limitées',
  SOLD_OUT: 'Complet',
  CANCELLED: 'Annulé',
}

interface Departure {
  id: string
  date: string
  endDate: string
  price: number
  spotsAvailable: number
  spotsTotal: number
  status: string
  guaranteedDeparture: boolean
}

interface TravelPackage {
  id: string
  name: string
  destination: string
  duration: number
  basePrice: number
  departureDates: Departure[]
}

export default function DeparturesPage() {
  const { storeId } = useStoreContext()
  const params = useParams()
  const locale = params?.locale || 'fr'

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingDeparture, setEditingDeparture] = useState<Departure | null>(null)

  // Form state for adding/editing departures
  const [formData, setFormData] = useState({
    date: '',
    endDate: '',
    price: 0,
    spotsTotal: 20,
    guaranteedDeparture: false,
  })

  // Get travel packages
  const { data: packages, isLoading, refetch } = trpc.travel.getPackages.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  )

  // Add departure mutation
  const addDeparture = trpc.travel.addDeparture.useMutation({
    onSuccess: () => {
      refetch()
      setShowAddModal(false)
      resetForm()
    },
  })

  // Update departure mutation
  const updateDeparture = trpc.travel.updateDeparture.useMutation({
    onSuccess: () => {
      refetch()
      setEditingDeparture(null)
      resetForm()
    },
  })

  const resetForm = () => {
    setFormData({
      date: '',
      endDate: '',
      price: 0,
      spotsTotal: 20,
      guaranteedDeparture: false,
    })
  }

  // Get departures for selected package
  const selectedPackageData = useMemo(() => {
    if (!packages || !selectedPackage) return null
    return packages.find((p: TravelPackage) => p.id === selectedPackage) || null
  }, [packages, selectedPackage])

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

  // Get departures for a specific day
  const getDeparturesForDay = (date: Date): Departure[] => {
    if (!selectedPackageData) return []
    return selectedPackageData.departureDates.filter((d: Departure) => {
      const depDate = new Date(d.date)
      return depDate.toDateString() === date.toDateString()
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
  const totalDepartures = selectedPackageData?.departureDates?.length || 0
  const availableDepartures = selectedPackageData?.departureDates?.filter(
    (d: Departure) => d.status === 'AVAILABLE'
  ).length || 0
  const totalSpots = selectedPackageData?.departureDates?.reduce(
    (sum: number, d: Departure) => sum + d.spotsTotal, 0
  ) || 0
  const bookedSpots = selectedPackageData?.departureDates?.reduce(
    (sum: number, d: Departure) => sum + (d.spotsTotal - d.spotsAvailable), 0
  ) || 0

  const handleAddDeparture = () => {
    if (!selectedPackage || !formData.date || !formData.endDate) return

    addDeparture.mutate({
      storeId: storeId!,
      packageId: selectedPackage,
      date: formData.date,
      endDate: formData.endDate,
      price: formData.price,
      spotsTotal: formData.spotsTotal,
      guaranteedDeparture: formData.guaranteedDeparture,
    })
  }

  const handleUpdateDeparture = () => {
    if (!selectedPackage || !editingDeparture) return

    updateDeparture.mutate({
      storeId: storeId!,
      packageId: selectedPackage,
      departureId: editingDeparture.id,
      updates: {
        price: formData.price,
        spotsAvailable: formData.spotsTotal,
        guaranteedDeparture: formData.guaranteedDeparture,
      },
    })
  }

  const openEditModal = (departure: Departure) => {
    setEditingDeparture(departure)
    setFormData({
      date: departure.date,
      endDate: departure.endDate,
      price: departure.price,
      spotsTotal: departure.spotsAvailable,
      guaranteedDeparture: departure.guaranteedDeparture,
    })
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Calendrier des Départs</h1>
          <p className="text-gray-600">Gérez les dates de départ de vos voyages</p>
        </div>
        {selectedPackage && (
          <AdminButton onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un départ
          </AdminButton>
        )}
      </div>

      {/* Package selector */}
      <AdminCard>
        <h3 className="font-medium text-gray-900 mb-4">Sélectionner un voyage</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages?.map((pkg: TravelPackage) => (
            <button
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedPackage === pkg.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plane className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{pkg.name}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{pkg.destination}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{pkg.duration} jours</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
        {(!packages || packages.length === 0) && (
          <p className="text-gray-500 text-center py-8">
            Aucun voyage configuré. Créez d'abord un produit de type voyage.
          </p>
        )}
      </AdminCard>

      {selectedPackageData && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AdminCard>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalDepartures}</p>
                  <p className="text-sm text-gray-500">Départs planifiés</p>
                </div>
              </div>
            </AdminCard>
            <AdminCard>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{availableDepartures}</p>
                  <p className="text-sm text-gray-500">Disponibles</p>
                </div>
              </div>
            </AdminCard>
            <AdminCard>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalSpots}</p>
                  <p className="text-sm text-gray-500">Places totales</p>
                </div>
              </div>
            </AdminCard>
            <AdminCard>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{bookedSpots}</p>
                  <p className="text-sm text-gray-500">Places réservées</p>
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
                  return <div key={`empty-${idx}`} className="bg-white p-2 min-h-[100px]" />
                }

                const departures = getDeparturesForDay(date)
                const isToday = date.toDateString() === today.toDateString()
                const isPast = date < today

                return (
                  <div
                    key={date.toISOString()}
                    className={`bg-white p-2 min-h-[100px] ${
                      isPast ? 'opacity-50' : ''
                    } ${isToday ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
                  >
                    <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                      {date.getDate()}
                    </div>
                    <div className="mt-1 space-y-1">
                      {departures.map((dep: Departure) => (
                        <button
                          key={dep.id}
                          onClick={() => openEditModal(dep)}
                          className={`w-full text-left text-xs p-1 rounded border ${STATUS_COLORS[dep.status]} hover:opacity-80 transition-opacity`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{dep.price}€</span>
                            <span>{dep.spotsAvailable}/{dep.spotsTotal}</span>
                          </div>
                          {dep.guaranteedDeparture && (
                            <div className="flex items-center gap-1 mt-0.5 text-green-700">
                              <CheckCircle className="w-3 h-3" />
                              <span>Garanti</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </AdminCard>

          {/* Departures list */}
          <AdminCard>
            <h3 className="font-medium text-gray-900 mb-4">Liste des départs</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Retour</th>
                    <th className="pb-3 font-medium">Prix</th>
                    <th className="pb-3 font-medium">Places</th>
                    <th className="pb-3 font-medium">Statut</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedPackageData.departureDates.map((dep: Departure) => (
                    <tr key={dep.id} className="text-sm">
                      <td className="py-3">
                        {new Date(dep.date).toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                      <td className="py-3">
                        {new Date(dep.endDate).toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                      <td className="py-3 font-medium">{dep.price}€</td>
                      <td className="py-3">
                        <span className={dep.spotsAvailable === 0 ? 'text-red-600' : ''}>
                          {dep.spotsAvailable}/{dep.spotsTotal}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[dep.status]}`}>
                          {STATUS_LABELS[dep.status]}
                        </span>
                        {dep.guaranteedDeparture && (
                          <span className="ml-2 text-green-600">
                            <CheckCircle className="w-4 h-4 inline" />
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => openEditModal(dep)}
                          className="p-1 text-gray-500 hover:text-blue-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {selectedPackageData.departureDates.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  Aucun départ planifié pour ce voyage.
                </p>
              )}
            </div>
          </AdminCard>
        </>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingDeparture) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingDeparture ? 'Modifier le départ' : 'Ajouter un départ'}
            </h3>
            <div className="space-y-4">
              {!editingDeparture && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de départ
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de retour
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix (€)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingDeparture ? 'Places disponibles' : 'Nombre de places'}
                </label>
                <input
                  type="number"
                  value={formData.spotsTotal}
                  onChange={(e) => setFormData({ ...formData, spotsTotal: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="guaranteed"
                  checked={formData.guaranteedDeparture}
                  onChange={(e) => setFormData({ ...formData, guaranteedDeparture: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="guaranteed" className="text-sm text-gray-700">
                  Départ garanti
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <AdminButton
                variant="secondary"
                onClick={() => {
                  setShowAddModal(false)
                  setEditingDeparture(null)
                  resetForm()
                }}
              >
                Annuler
              </AdminButton>
              <AdminButton
                onClick={editingDeparture ? handleUpdateDeparture : handleAddDeparture}
                disabled={addDeparture.isPending || updateDeparture.isPending}
              >
                {(addDeparture.isPending || updateDeparture.isPending) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingDeparture ? (
                  'Modifier'
                ) : (
                  'Ajouter'
                )}
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
