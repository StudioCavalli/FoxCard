'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import {
  Plus,
  Edit,
  Trash2,
  Wifi,
  Car,
  Dumbbell,
  UtensilsCrossed,
  Bath,
  Tv,
  Wind,
  Coffee,
  Save,
  X,
  Loader2,
  Sparkles
} from 'lucide-react'

const categoryIcons: Record<string, any> = {
  GENERAL: Wifi,
  BATHROOM: Bath,
  BEDROOM: Tv,
  OUTDOOR: Car,
  WELLNESS: Dumbbell,
  DINING: UtensilsCrossed,
  BUSINESS: Coffee,
  FAMILY: Sparkles,
  ACCESSIBILITY: Wind,
}

const categories = [
  'GENERAL',
  'BATHROOM',
  'BEDROOM',
  'OUTDOOR',
  'WELLNESS',
  'DINING',
  'BUSINESS',
  'FAMILY',
  'ACCESSIBILITY',
]

export default function AmenitiesPage() {
  const t = useTranslations('merchant.hotel.amenities')
  const { storeId } = useStoreContext()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [formData, setFormData] = useState({
    name: '',
    category: 'GENERAL',
    description: '',
    icon: '',
    isHighlighted: false,
  })

  const { data: amenities, isLoading, refetch } = trpc.hotel.getStoreAmenities?.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  )

  const createAmenity = trpc.hotel.createAmenity?.useMutation({
    onSuccess: () => {
      refetch()
      setIsCreating(false)
      resetForm()
    },
  })

  const updateAmenity = trpc.hotel.updateAmenity?.useMutation({
    onSuccess: () => {
      refetch()
      setEditingId(null)
      resetForm()
    },
  })

  const deleteAmenity = trpc.hotel.deleteAmenity?.useMutation({
    onSuccess: () => refetch(),
  })

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'GENERAL',
      description: '',
      icon: '',
      isHighlighted: false,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeId || !formData.name) return

    const data = {
      storeId,
      name: formData.name,
      category: formData.category as 'GENERAL' | 'BATHROOM' | 'BEDROOM' | 'OUTDOOR' | 'WELLNESS' | 'DINING' | 'BUSINESS' | 'FAMILY' | 'ACCESSIBILITY',
      description: formData.description || undefined,
      icon: formData.icon || undefined,
      isHighlighted: formData.isHighlighted,
    }

    if (editingId) {
      await updateAmenity?.mutateAsync({ ...data, amenityId: editingId })
    } else {
      await createAmenity?.mutateAsync(data)
    }
  }

  const startEdit = (amenity: any) => {
    setEditingId(amenity.id)
    setIsCreating(false)
    setFormData({
      name: amenity.name,
      category: amenity.category,
      description: amenity.description || '',
      icon: amenity.icon || '',
      isHighlighted: amenity.isHighlighted,
    })
  }

  const filteredAmenities = amenities?.filter((a: any) =>
    selectedCategory === 'all' || a.category === selectedCategory
  ) || []

  // Group by category
  const groupedAmenities = filteredAmenities.reduce((acc: any, amenity: any) => {
    const cat = amenity.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(amenity)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-500 mt-1">Gérez les équipements de votre établissement</p>
        </div>
        {!isCreating && !editingId && (
          <Button variant="primary" onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('create')}
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          Tous
        </Button>
        {categories.map((cat) => {
          const Icon = categoryIcons[cat] || Wifi
          return (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              <Icon className="w-4 h-4 mr-1" />
              {t(`categories.${cat.toLowerCase()}`)}
            </Button>
          )
        })}
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                {editingId ? 'Modifier l\'équipement' : t('create')}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => {
                  setIsCreating(false)
                  setEditingId(null)
                  resetForm()
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="WiFi, Piscine, Spa..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {t(`categories.${cat.toLowerCase()}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description optionnelle..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isHighlighted}
                    onChange={(e) => setFormData({ ...formData, isHighlighted: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Mettre en avant cet équipement</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setIsCreating(false)
                  setEditingId(null)
                  resetForm()
                }}
              >
                Annuler
              </Button>
              <Button variant="primary" type="submit">
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Enregistrer' : 'Créer'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Amenities List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : filteredAmenities.length === 0 ? (
        <Card className="p-12 text-center">
          <Wifi className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun équipement</h3>
          <p className="text-gray-500 mb-6">Ajoutez les équipements de votre établissement</p>
          <Button variant="primary" onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('create')}
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAmenities).map(([category, items]: [string, any]) => {
            const Icon = categoryIcons[category] || Wifi
            return (
              <div key={category}>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-3">
                  <Icon className="w-4 h-4" />
                  {t(`categories.${category.toLowerCase()}`)}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {items.map((amenity: any) => (
                    <Card
                      key={amenity.id}
                      className={`p-3 ${amenity.isHighlighted ? 'ring-2 ring-orange-500' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{amenity.name}</p>
                          {amenity.description && (
                            <p className="text-xs text-gray-500 truncate">{amenity.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5 ml-2">
                          <Button variant="ghost" size="sm" onClick={() => startEdit(amenity)} className="p-1">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 text-red-600 hover:bg-red-50"
                            onClick={() => {
                              if (confirm('Supprimer ?')) {
                                deleteAmenity?.mutate({ storeId: storeId!, amenityId: amenity.id })
                              }
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
