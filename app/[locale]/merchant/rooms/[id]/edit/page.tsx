'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function EditRoomPage() {
  const t = useTranslations('merchant.hotel.rooms')
  const tTypes = useTranslations('merchant.hotel.roomTypes')
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale || 'fr'
  const roomId = params?.id as string
  const basePath = `/${locale}/merchant`
  const { storeId } = useStoreContext()

  const [formData, setFormData] = useState({
    roomNumber: '',
    roomTypeId: '',
    floor: '',
    building: '',
    status: 'AVAILABLE',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get room data
  const { data: room, isLoading } = trpc.hotel.getHotelRoom?.useQuery(
    { storeId: storeId!, roomId },
    { enabled: !!storeId && !!roomId }
  )

  // Get room types for dropdown
  const { data: roomTypes } = trpc.hotel.getStoreRoomTypes?.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  )

  // Populate form when room data loads
  useEffect(() => {
    if (room) {
      setFormData({
        roomNumber: room.roomNumber || '',
        roomTypeId: room.roomTypeId || '',
        floor: room.floor?.toString() || '',
        building: room.building || '',
        status: room.status || 'AVAILABLE',
        notes: room.notes || '',
      })
    }
  }, [room])

  const updateRoom = trpc.hotel.updateHotelRoom?.useMutation({
    onSuccess: () => {
      router.push(`${basePath}/rooms`)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeId || !roomId || !formData.roomNumber) return

    setIsSubmitting(true)
    try {
      await updateRoom?.mutateAsync({
        storeId,
        roomId,
        roomNumber: formData.roomNumber,
        roomTypeId: formData.roomTypeId || undefined,
        floor: formData.floor ? parseInt(formData.floor) : undefined,
        building: formData.building || undefined,
        status: formData.status as any,
        notes: formData.notes || undefined,
      })
    } catch (error) {
      console.error('Error updating room:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
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
          <h1 className="text-2xl font-bold text-gray-900">{t('edit')}</h1>
          <p className="text-gray-500 mt-1">Chambre {room?.roomNumber}</p>
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
              {tTypes('title')}
            </label>
            <select
              value={formData.roomTypeId}
              onChange={(e) => setFormData({ ...formData, roomTypeId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white"
            >
              <option value="">Sélectionner un type</option>
              {roomTypes?.map((type: any) => (
                <option key={type.id} value={type.id}>
                  {type.name} - {type.basePrice}€/nuit
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('status')}
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white"
            >
              <option value="AVAILABLE">{t('available')}</option>
              <option value="OCCUPIED">{t('occupied')}</option>
              <option value="CLEANING">{t('cleaning')}</option>
              <option value="MAINTENANCE">{t('maintenance')}</option>
              <option value="OUT_OF_ORDER">{t('outOfOrder')}</option>
            </select>
          </div>

          {/* Floor & Building */}
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
              disabled={isSubmitting || !formData.roomNumber}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Enregistrer
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}
