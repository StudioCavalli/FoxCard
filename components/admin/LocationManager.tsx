'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MapPin, Plus, Edit, Trash2, Save, X, Building, Package, Home, Warehouse as WarehouseIcon, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface LocationFormData {
  id?: string
  type: 'LEGAL_ADDRESS' | 'PHYSICAL_STORE' | 'PICKUP_POINT' | 'WAREHOUSE'
  name: string
  street: string
  street2?: string
  city: string
  state?: string
  postalCode: string
  country: string
  latitude: number
  longitude: number
  phone?: string
  email?: string
  contactName?: string
  isActive: boolean
  isPrimary: boolean
  isPublic: boolean
}

const LOCATION_TYPES = [
  { value: 'LEGAL_ADDRESS', label: 'Adresse légale', icon: Home },
  { value: 'PHYSICAL_STORE', label: 'Boutique physique', icon: Building },
  { value: 'PICKUP_POINT', label: 'Point de retrait', icon: Package },
  { value: 'WAREHOUSE', label: 'Entrepôt', icon: WarehouseIcon },
]

export function LocationManager({ storeId }: { storeId: string }) {
  const t = useTranslations('admin')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<LocationFormData>({
    type: 'LEGAL_ADDRESS',
    name: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'FR',
    latitude: 48.8566,
    longitude: 2.3522,
    isActive: true,
    isPrimary: false,
    isPublic: true,
  })

  const { data: locations, refetch } = trpc.storeLocation.getByStore.useQuery({ storeId })
  const createMutation = trpc.storeLocation.create.useMutation()
  const updateMutation = trpc.storeLocation.update.useMutation()
  const deleteMutation = trpc.storeLocation.delete.useMutation()

  const resetForm = () => {
    setFormData({
      type: 'LEGAL_ADDRESS',
      name: '',
      street: '',
      city: '',
      postalCode: '',
      country: 'FR',
      latitude: 48.8566,
      longitude: 2.3522,
      isActive: true,
      isPrimary: false,
      isPublic: true,
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (location: any) => {
    setFormData({
      id: location.id,
      type: location.type,
      name: location.name,
      street: location.street,
      street2: location.street2 || '',
      city: location.city,
      state: location.state || '',
      postalCode: location.postalCode,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude,
      phone: location.phone || '',
      email: location.email || '',
      contactName: location.contactName || '',
      isActive: location.isActive,
      isPrimary: location.isPrimary,
      isPublic: location.isPublic,
    })
    setEditingId(location.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          data: formData,
        })
      } else {
        const { id, ...dataWithoutId } = formData
        await createMutation.mutateAsync({
          storeId,
          data: dataWithoutId,
        })
      }
      await refetch()
      resetForm()
    } catch (error) {
      console.error('Failed to save location:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) return

    try {
      await deleteMutation.mutateAsync({ id })
      await refetch()
    } catch (error) {
      console.error('Failed to delete location:', error)
    }
  }

  // Geocoding helper function (simple approximation based on country)
  const geocodeAddress = () => {
    const countryCoordinates: Record<string, [number, number]> = {
      FR: [48.8566, 2.3522],
      DE: [52.5200, 13.4050],
      ES: [40.4168, -3.7038],
      IT: [41.9028, 12.4964],
      GB: [51.5074, -0.1278],
      BE: [50.8503, 4.3517],
      NL: [52.3676, 4.9041],
      CH: [46.9480, 7.4474],
      US: [38.9072, -77.0369],
    }

    const coords = countryCoordinates[formData.country] || [48.8566, 2.3522]
    const offset = (Math.random() - 0.5) * 0.1

    setFormData({
      ...formData,
      latitude: Number((coords[0] + offset).toFixed(6)),
      longitude: Number((coords[1] + offset).toFixed(6)),
    })
  }

  const getTypeIcon = (type: string) => {
    const locationTypeObj = LOCATION_TYPES.find(t => t.value === type)
    const Icon = locationTypeObj?.icon || MapPin
    return <Icon className="w-4 h-4" />
  }

  const getTypeLabel = (type: string) => {
    return LOCATION_TYPES.find(t => t.value === type)?.label || type
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Adresses & Localisations
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Gérez vos différentes adresses (légale, boutiques, points de retrait, entrepôts)
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une adresse
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-primary-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Modifier l\'adresse' : 'Nouvelle adresse'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'adresse *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {LOCATION_TYPES.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.value as any })}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        formData.type === type.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'adresse *
              </label>
              <Input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Boutique Paris Centre, Entrepôt Sud..."
              />
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rue *
                </label>
                <Input
                  type="text"
                  required
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="123 Rue de la République"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complément d'adresse
                </label>
                <Input
                  type="text"
                  value={formData.street2 || ''}
                  onChange={(e) => setFormData({ ...formData, street2: e.target.value })}
                  placeholder="Bâtiment, Étage, Appartement..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville *
                </label>
                <Input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Paris"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal *
                </label>
                <Input
                  type="text"
                  required
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="75001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Région/État
                </label>
                <Input
                  type="text"
                  value={formData.state || ''}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Île-de-France"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays *
                </label>
                <Input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="FR"
                  maxLength={2}
                />
              </div>
            </div>

            {/* GPS Coordinates */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Coordonnées GPS *
                </label>
                <button
                  type="button"
                  onClick={geocodeAddress}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Générer automatiquement
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Latitude</label>
                  <Input
                    type="number"
                    step="0.000001"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                    placeholder="48.8566"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Longitude</label>
                  <Input
                    type="number"
                    step="0.000001"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                    placeholder="2.3522"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                💡 Astuce: Trouvez les coordonnées exactes sur <a href="https://www.google.com/maps" target="_blank" className="text-primary-600 hover:underline">Google Maps</a> (clic droit sur la carte)
              </p>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <Input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact
                </label>
                <Input
                  type="text"
                  value={formData.contactName || ''}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="Nom du responsable"
                />
              </div>
            </div>

            {/* Options */}
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Adresse principale</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Visible publiquement</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={resetForm}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Locations List */}
      <div className="space-y-3">
        {locations?.length === 0 && !showForm && (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">Aucune adresse enregistrée</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter votre première adresse
            </Button>
          </div>
        )}

        {locations?.map((location: any) => (
          <div
            key={location.id}
            className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:border-gray-300 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                    {getTypeIcon(location.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{location.name}</h3>
                      {location.isPrimary && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                      {!location.isActive && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{getTypeLabel(location.type)}</p>
                  </div>
                </div>

                <div className="text-sm text-gray-600 space-y-1 ml-11">
                  <p>{location.street}</p>
                  {location.street2 && <p>{location.street2}</p>}
                  <p>{location.postalCode} {location.city}</p>
                  <p>{location.country}</p>
                  {location.phone && (
                    <p className="text-xs text-gray-500">📞 {location.phone}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    GPS: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(location)}
                  className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(location.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
