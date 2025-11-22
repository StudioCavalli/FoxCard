'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function NewRoomPage() {
  const t = useTranslations('merchant.hotel.rooms')
  const tTypes = useTranslations('merchant.hotel.roomTypes')
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale || 'fr'
  const basePath = `/${locale}/merchant`
  const { storeId } = useStoreContext()

  const [formData, setFormData] = useState({
    roomNumber: '',
    roomTypeId: '',
    floor: '',
    building: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get room types for dropdown
  const { data: roomTypes } = trpc.hotel.getStoreRoomTypes?.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  )

  const createRoom = trpc.hotel.createHotelRoom?.useMutation({
    onSuccess: () => {
      router.push(`${basePath}/rooms`)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeId || !formData.roomNumber || !formData.roomTypeId) return

    setIsSubmitting(true)
    try {
      await createRoom?.mutateAsync({
        storeId,
        roomNumber: formData.roomNumber,
        roomTypeId: formData.roomTypeId,
        floor: formData.floor ? parseInt(formData.floor) : undefined,
        building: formData.building || undefined,
        notes: formData.notes || undefined,
      })
    } catch (error) {
      console.error('Error creating room:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`${basePath}/rooms`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('create')}</h1>
          <p className="text-gray-500 mt-1">Ajouter une nouvelle chambre</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          {/* Room Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('roomNumber')} *
            </label>
            <Input
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              placeholder="101, 201A..."
              required
            />
          </div>

          {/* Room Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {tTypes('title')} *
            </label>
            <select
              value={formData.roomTypeId}
              onChange={(e) => setFormData({ ...formData, roomTypeId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white"
              required
            >
              <option value="">Sélectionner un type</option>
              {roomTypes?.map((type: any) => (
                <option key={type.id} value={type.id}>
                  {type.name} - {type.basePrice}€/nuit
                </option>
              ))}
            </select>
            {(!roomTypes || roomTypes.length === 0) && (
              <p className="text-sm text-orange-600 mt-2">
                <Link href={`${basePath}/room-types`} className="underline">
                  Créez d'abord des types de chambres
                </Link>
              </p>
            )}
          </div>

          {/* Floor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('floor')}
              </label>
              <Input
                type="number"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                placeholder="1, 2, 3..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('building')}
              </label>
              <Input
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                placeholder="Bâtiment A..."
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('notes')}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg resize-none"
              rows={3}
              placeholder="Notes internes..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Link href={`${basePath}/rooms`}>
              <Button variant="secondary" type="button">
                Annuler
              </Button>
            </Link>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting || !formData.roomNumber || !formData.roomTypeId}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Créer la chambre
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}
