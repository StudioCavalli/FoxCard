'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Star,
  Bed,
  Loader2,
  Edit,
  Clock
} from 'lucide-react'
import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  CHECKED_IN: 'bg-green-100 text-green-800',
  CHECKED_OUT: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
  NO_SHOW: 'bg-orange-100 text-orange-800',
}

export default function GuestDetailPage() {
  const t = useTranslations('merchant.hotel.guests')
  const tRes = useTranslations('merchant.hotel.reservations')
  const { storeId } = useStoreContext()
  const params = useParams()
  const locale = params?.locale || 'fr'
  const guestId = params?.id as string
  const basePath = `/${locale}/merchant`

  const { data: guest, isLoading } = trpc.hotel.getGuest?.useQuery(
    { storeId: storeId!, guestId },
    { enabled: !!storeId && !!guestId }
  )

  const toggleVip = trpc.hotel.toggleGuestVip?.useMutation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!guest) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Client introuvable</p>
        <Link href={`${basePath}/guests`}>
          <Button variant="primary" className="mt-4">
            Retour aux clients
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`${basePath}/guests`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center">
              {guest.isVip ? (
                <Star className="w-7 h-7 text-yellow-500" />
              ) : (
                <span className="text-2xl font-semibold text-gray-500">
                  {guest.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{guest.name}</h1>
                {guest.isVip && (
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full font-medium">
                    VIP
                  </span>
                )}
              </div>
              <p className="text-gray-500">
                Client depuis {new Date(guest.createdAt).toLocaleDateString(locale)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => toggleVip?.mutate({ storeId: storeId!, guestId })}
          >
            <Star className={`w-4 h-4 mr-2 ${guest.isVip ? 'text-yellow-500' : ''}`} />
            {guest.isVip ? 'Retirer VIP' : 'Marquer VIP'}
          </Button>
          <Button variant="secondary">
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              Informations de contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {guest.email}
                </p>
              </div>
              {guest.phone && (
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {guest.phone}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Reservation History */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              Historique des séjours
            </h2>
            {guest.reservations?.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun séjour enregistré</p>
            ) : (
              <div className="space-y-3">
                {guest.reservations?.map((res: any) => (
                  <Link
                    key={res.id}
                    href={`${basePath}/reservations/${res.id}`}
                    className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Bed className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">Chambre {res.room?.roomNumber}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(res.checkInDate).toLocaleDateString(locale)} - {new Date(res.checkOutDate).toLocaleDateString(locale)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${STATUS_COLORS[res.status]}`}>
                          {tRes(`status.${res.status.toLowerCase()}`)}
                        </span>
                        <p className="text-sm font-medium mt-1">{res.totalAmount}€</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Notes */}
          {guest.notes && (
            <Card className="p-6 border-orange-200 bg-orange-50">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes internes</h2>
              <p className="text-gray-600">{guest.notes}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total séjours</span>
                <span className="font-bold text-lg">{guest.totalStays || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total nuits</span>
                <span className="font-bold text-lg">{guest.totalNights || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Dépenses totales</span>
                <span className="font-bold text-lg text-green-600">{guest.totalSpent || 0}€</span>
              </div>
              {guest.lastStay && (
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-gray-500">Dernier séjour</span>
                  <span className="font-medium">
                    {new Date(guest.lastStay).toLocaleDateString(locale)}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Preferences */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Préférences</h2>
            <p className="text-sm text-gray-500">Aucune préférence enregistrée</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
