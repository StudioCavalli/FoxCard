'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
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

interface Amenity {
  id: string
  name: string
  category: string
  description?: string
  icon?: string
  isHighlighted: boolean
}

export default function AmenitiesPage() {
  const t = useTranslations('merchant.hotel.amenities')
  const { storeId } = useStoreContext()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [formData, setFormData] = useState({
    name: '',
    category: 'GENERAL',
    description: '',
    icon: '',
    isHighlighted: false,
  })

  // Fetch store commerceConfig which contains amenities
  const { data: storeTypeData, isLoading, refetch } = trpc.commerceType.getStoreType.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  )

  const updateStoreType = trpc.commerceType.updateStoreType.useMutation({
    onSuccess: () => refetch(),
  })

  // Extract amenities from commerceConfig
  useEffect(() => {
    if (storeTypeData?.storeConfig) {
      const config = storeTypeData.storeConfig as any
      setAmenities(config.amenities || [])
    }
  }, [storeTypeData])

  const saveAmenities = async (newAmenities: Amenity[]) => {
    if (!storeId || !storeTypeData) return

    const currentConfig = (storeTypeData.storeConfig as any) || {}
    await updateStoreType.mutateAsync({
      storeId,
      commerceType: storeTypeData.type as any,
      commerceConfig: {
        ...currentConfig,
        amenities: newAmenities,
      },
    })
    setAmenities(newAmenities)
  }

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

    const newAmenity: Amenity = {
      id: editingId || crypto.randomUUID(),
      name: formData.name,
      category: formData.category,
      description: formData.description || undefined,
      icon: formData.icon || undefined,
      isHighlighted: formData.isHighlighted,
    }

    let newAmenities: Amenity[]
    if (editingId) {
      newAmenities = amenities.map(a => a.id === editingId ? newAmenity : a)
    } else {
      newAmenities = [...amenities, newAmenity]
    }

    await saveAmenities(newAmenities)
    setIsCreating(false)
    setEditingId(null)
    resetForm()
  }

  const handleDelete = async (amenityId: string) => {
    if (!confirm('Supprimer ?')) return
    const newAmenities = amenities.filter(a => a.id !== amenityId)
    await saveAmenities(newAmenities)
  }

  const startEdit = (amenity: Amenity) => {
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

  const filteredAmenities = amenities.filter(a =>
    selectedCategory === 'all' || a.category === selectedCategory
  )

  // Group by category
  const groupedAmenities = filteredAmenities.reduce((acc: Record<string, Amenity[]>, amenity) => {
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gérez les équipements de votre établissement</p>
        </div>
        {!isCreating && !editingId && (
          <AdminButton icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreating(true)}>
            {t('create')}
          </AdminButton>
        )}
      </div>

      {/* Category Filter */}
      <AdminCard padding="md">
        <div className="flex flex-wrap gap-2">
          <AdminButton
            variant={selectedCategory === 'all' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            Tous
          </AdminButton>
          {categories.map((cat) => {
            const Icon = categoryIcons[cat] || Wifi
            return (
              <AdminButton
                key={cat}
                variant={selectedCategory === cat ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                <Icon className="w-4 h-4 mr-1" />
                {t(`categories.${cat.toLowerCase()}`)}
              </AdminButton>
            )
          })}
        </div>
      </AdminCard>

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <AdminCard padding="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {editingId ? 'Modifier l\'équipement' : t('create')}
              </h3>
              <AdminButton
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
              </AdminButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="WiFi, Piscine, Spa..."
                  required
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Catégorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {t(`categories.${cat.toLowerCase()}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description optionnelle..."
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isHighlighted}
                    onChange={(e) => setFormData({ ...formData, isHighlighted: e.target.checked })}
                    className="rounded border-slate-300 dark:border-slate-600 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Mettre en avant cet équipement</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <AdminButton
                variant="secondary"
                type="button"
                onClick={() => {
                  setIsCreating(false)
                  setEditingId(null)
                  resetForm()
                }}
              >
                Annuler
              </AdminButton>
              <AdminButton type="submit" icon={<Save className="w-4 h-4" />}>
                {editingId ? 'Enregistrer' : 'Créer'}
              </AdminButton>
            </div>
          </form>
        </AdminCard>
      )}

      {/* Amenities List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : filteredAmenities.length === 0 ? (
        <AdminCard padding="lg">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wifi className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Aucun équipement</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Ajoutez les équipements de votre établissement</p>
            <AdminButton icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreating(true)}>
              {t('create')}
            </AdminButton>
          </div>
        </AdminCard>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAmenities).map(([category, items]: [string, any]) => {
            const Icon = categoryIcons[category] || Wifi
            return (
              <div key={category}>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">
                  <Icon className="w-4 h-4" />
                  {t(`categories.${category.toLowerCase()}`)}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {items.map((amenity: any) => (
                    <AdminCard
                      key={amenity.id}
                      padding="sm"
                      className={amenity.isHighlighted ? 'ring-2 ring-primary-500' : ''}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white truncate">{amenity.name}</p>
                          {amenity.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{amenity.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5 ml-2">
                          <AdminButton variant="ghost" size="sm" onClick={() => startEdit(amenity)} className="p-1">
                            <Edit className="w-3 h-3" />
                          </AdminButton>
                          <AdminButton
                            variant="ghost"
                            size="sm"
                            className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                            onClick={() => handleDelete(amenity.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </AdminButton>
                        </div>
                      </div>
                    </AdminCard>
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
