'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Bed,
  Users,
  Filter,
  CheckCircle,
  XCircle,
  Wrench,
  Loader2
} from 'lucide-react'

const statusConfig = {
  AVAILABLE: { label: 'available', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  OCCUPIED: { label: 'occupied', color: 'bg-blue-100 text-blue-700', icon: Users },
  CLEANING: { label: 'cleaning', color: 'bg-yellow-100 text-yellow-700', icon: Loader2 },
  MAINTENANCE: { label: 'maintenance', color: 'bg-orange-100 text-orange-700', icon: Wrench },
  OUT_OF_ORDER: { label: 'outOfOrder', color: 'bg-red-100 text-red-700', icon: XCircle },
}

export default function RoomsPage() {
  const t = useTranslations('merchant.hotel.rooms')
  const { storeId } = useStoreContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const params = useParams()
  const locale = params?.locale || 'fr'
  const basePath = `/${locale}/merchant`

  const { data: rooms, isLoading, refetch } = trpc.hotel.getHotelRooms?.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  )

  const deleteRoom = trpc.hotel.deleteHotelRoom?.useMutation({
    onSuccess: () => refetch(),
  })

  const roomList = rooms || []
  const filteredRooms = roomList.filter(room => {
    const matchesSearch = room.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.roomType?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Stats
  const totalRooms = roomList.length
  const availableCount = roomList.filter(r => r.status === 'AVAILABLE').length
  const occupiedCount = roomList.filter(r => r.status === 'OCCUPIED').length
  const maintenanceCount = roomList.filter(r => r.status === 'MAINTENANCE' || r.status === 'OUT_OF_ORDER').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-500 mt-1">{t('list')}</p>
        </div>
        <Link href={`${basePath}/rooms/new`}>
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            {t('create')}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{totalRooms}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">{t('available')}</p>
          <p className="text-2xl font-bold text-green-600">{availableCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">{t('occupied')}</p>
          <p className="text-2xl font-bold text-blue-600">{occupiedCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">{t('maintenance')}</p>
          <p className="text-2xl font-bold text-orange-600">{maintenanceCount}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={`${t('roomNumber')}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="AVAILABLE">{t('available')}</option>
            <option value="OCCUPIED">{t('occupied')}</option>
            <option value="CLEANING">{t('cleaning')}</option>
            <option value="MAINTENANCE">{t('maintenance')}</option>
            <option value="OUT_OF_ORDER">{t('outOfOrder')}</option>
          </select>
        </div>
      </Card>

      {/* Rooms Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : filteredRooms.length === 0 ? (
        <Card className="p-12 text-center">
          <Bed className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune chambre</h3>
          <p className="text-gray-500 mb-6">Commencez par créer votre première chambre</p>
          <Link href={`${basePath}/rooms/new`}>
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              {t('create')}
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map((room) => {
            const status = statusConfig[room.status as keyof typeof statusConfig] || statusConfig.AVAILABLE
            const StatusIcon = status.icon

            return (
              <Card key={room.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {t('roomNumber')} {room.roomNumber}
                      </h3>
                      <p className="text-sm text-gray-500">{room.roomType?.name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {t(status.label)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    {room.floor && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">{t('floor')}:</span>
                        <span>{room.floor}</span>
                      </div>
                    )}
                    {room.roomType?.maxOccupancy && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{room.roomType.maxOccupancy} {t('guests')}</span>
                      </div>
                    )}
                    {room.roomType?.basePrice && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-orange-600">
                          {room.roomType.basePrice}€ / nuit
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                    <Link href={`${basePath}/rooms/${room.id}/edit`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full">
                        <Edit className="w-4 h-4 mr-1" />
                        {t('edit')}
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Supprimer cette chambre ?')) {
                          deleteRoom?.mutate({ storeId: storeId!, roomId: room.id })
                        }
                      }}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
