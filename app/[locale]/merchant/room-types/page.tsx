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
  Bed,
  Users,
  Save,
  X,
  Loader2
} from 'lucide-react'

export default function RoomTypesPage() {
  const t = useTranslations('merchant.hotel.roomTypes')
  const { storeId } = useStoreContext()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    basePrice: '',
    maxOccupancy: '2',
    maxAdults: '2',
    maxChildren: '0',
    bedConfiguration: '',
    sizeSqm: '',
  })

  const { data: roomTypes, isLoading, refetch } = trpc.hotel.getStoreRoomTypes?.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  )

  const createRoomType = trpc.hotel.createRoomType?.useMutation({
    onSuccess: () => {
      refetch()
      setIsCreating(false)
      resetForm()
    },
  })

  const updateRoomType = trpc.hotel.updateRoomType?.useMutation({
    onSuccess: () => {
      refetch()
      setEditingId(null)
      resetForm()
    },
  })

  const deleteRoomType = trpc.hotel.deleteRoomType?.useMutation({
    onSuccess: () => refetch(),
  })

  const resetForm = () => {
    setFormData({
      name: '',
      basePrice: '',
      maxOccupancy: '2',
      maxAdults: '2',
      maxChildren: '0',
      bedConfiguration: '',
      sizeSqm: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeId || !formData.name || !formData.basePrice) return

    const data = {
      storeId,
      name: formData.name,
      basePrice: parseFloat(formData.basePrice),
      maxOccupancy: parseInt(formData.maxOccupancy),
      maxAdults: parseInt(formData.maxAdults),
      maxChildren: parseInt(formData.maxChildren),
      bedConfiguration: formData.bedConfiguration || undefined,
      sizeSqm: formData.sizeSqm ? parseFloat(formData.sizeSqm) : undefined,
    }

    if (editingId) {
      await updateRoomType?.mutateAsync({ ...data, roomTypeId: editingId })
    } else {
      await createRoomType?.mutateAsync(data)
    }
  }

  const startEdit = (type: any) => {
    setEditingId(type.id)
    setIsCreating(false)
    setFormData({
      name: type.name,
      basePrice: type.basePrice.toString(),
      maxOccupancy: type.maxOccupancy.toString(),
      maxAdults: type.maxAdults.toString(),
      maxChildren: type.maxChildren.toString(),
      bedConfiguration: type.bedConfiguration || '',
      sizeSqm: type.sizeSqm?.toString() || '',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-500 mt-1">Gérez vos catégories de chambres</p>
        </div>
        {!isCreating && !editingId && (
          <Button variant="primary" onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('create')}
          </Button>
        )}
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                {editingId ? 'Modifier le type' : t('create')}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('name')} *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Standard, Deluxe, Suite..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('basePrice')} (€) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  placeholder="99.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('maxOccupancy')}
                </label>
                <Input
                  type="number"
                  value={formData.maxOccupancy}
                  onChange={(e) => setFormData({ ...formData, maxOccupancy: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('maxAdults')}
                </label>
                <Input
                  type="number"
                  value={formData.maxAdults}
                  onChange={(e) => setFormData({ ...formData, maxAdults: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('maxChildren')}
                </label>
                <Input
                  type="number"
                  value={formData.maxChildren}
                  onChange={(e) => setFormData({ ...formData, maxChildren: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('sizeSqm')}
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.sizeSqm}
                  onChange={(e) => setFormData({ ...formData, sizeSqm: e.target.value })}
                  placeholder="25"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('bedConfiguration')}
                </label>
                <Input
                  value={formData.bedConfiguration}
                  onChange={(e) => setFormData({ ...formData, bedConfiguration: e.target.value })}
                  placeholder="1 King, 2 Queen, 1 King + 1 Sofa..."
                />
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

      {/* Room Types List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : !roomTypes || roomTypes.length === 0 ? (
        <Card className="p-12 text-center">
          <Bed className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun type de chambre</h3>
          <p className="text-gray-500 mb-6">Créez vos catégories de chambres (Standard, Suite, etc.)</p>
          <Button variant="primary" onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('create')}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roomTypes.map((type: any) => (
            <Card key={type.id} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
                  <p className="text-2xl font-bold text-orange-600 mt-1">
                    {type.basePrice}€ <span className="text-sm font-normal text-gray-500">/ nuit</span>
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(type)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => {
                      if (confirm('Supprimer ce type ?')) {
                        deleteRoomType?.mutate({ storeId: storeId!, roomTypeId: type.id })
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{type.maxOccupancy} personnes max ({type.maxAdults} adultes, {type.maxChildren} enfants)</span>
                </div>
                {type.sizeSqm && (
                  <div>Surface: {type.sizeSqm} m²</div>
                )}
                {type.bedConfiguration && (
                  <div>Lits: {type.bedConfiguration}</div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
