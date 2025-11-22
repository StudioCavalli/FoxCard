'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Bed,
  Mail,
  Phone,
  CreditCard,
  CheckCircle,
  XCircle,
  LogIn,
  LogOut,
  Loader2,
  Edit,
  FileText
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

export default function ReservationDetailPage() {
  const t = useTranslations('merchant.hotel.reservations')
  const { storeId } = useStoreContext()
  const params = useParams()
  const router = useRouter()
  const locale = params?.locale || 'fr'
  const reservationId = params?.id as string
  const basePath = `/${locale}/merchant`

  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const { data: reservation, isLoading, refetch } = trpc.hotel.getReservation?.useQuery(
    { storeId: storeId!, reservationId },
    { enabled: !!storeId && !!reservationId }
  )

  const checkIn = trpc.hotel.checkInReservation?.useMutation({
    onSuccess: () => {
      refetch()
      setIsCheckingIn(false)
    },
  })

  const checkOut = trpc.hotel.checkOutReservation?.useMutation({
    onSuccess: () => {
      refetch()
      setIsCheckingOut(false)
    },
  })

  const handleCheckIn = async () => {
    if (!storeId || !reservationId) return
    setIsCheckingIn(true)
    try {
      await checkIn?.mutateAsync({ storeId, reservationId })
    } catch (error) {
      console.error('Check-in error:', error)
    } finally {
      setIsCheckingIn(false)
    }
  }

  const handleCheckOut = async () => {
    if (!storeId || !reservationId) return
    setIsCheckingOut(true)
    try {
      await checkOut?.mutateAsync({ storeId, reservationId })
    } catch (error) {
      console.error('Check-out error:', error)
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!reservation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Réservation introuvable</p>
        <Link href={`${basePath}/reservations`}>
          <Button variant="primary" className="mt-4">
            Retour aux réservations
          </Button>
        </Link>
      </div>
    )
  }

  const checkInDate = new Date(reservation.checkInDate)
  const checkOutDate = new Date(reservation.checkOutDate)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`${basePath}/reservations`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Réservation #{reservation.id.slice(-6).toUpperCase()}
            </h1>
            <p className="text-gray-500">
              {reservation.guestName} - Chambre {reservation.room?.roomNumber}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_COLORS[reservation.status]}`}>
          {t(`status.${reservation.status.toLowerCase()}`)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              Informations client
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nom</p>
                <p className="font-medium">{reservation.guestName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {reservation.guestEmail}
                </p>
              </div>
              {reservation.guestPhone && (
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {reservation.guestPhone}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Voyageurs</p>
                <p className="font-medium">
                  {reservation.adultCount} adulte{reservation.adultCount > 1 ? 's' : ''}
                  {reservation.childCount > 0 && `, ${reservation.childCount} enfant${reservation.childCount > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
          </Card>

          {/* Stay Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              Détails du séjour
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Arrivée</p>
                <p className="font-medium">{checkInDate.toLocaleDateString(locale)}</p>
                {reservation.actualCheckIn && (
                  <p className="text-xs text-green-600">
                    Arrivé le {new Date(reservation.actualCheckIn).toLocaleDateString(locale)}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Départ</p>
                <p className="font-medium">{checkOutDate.toLocaleDateString(locale)}</p>
                {reservation.actualCheckOut && (
                  <p className="text-xs text-green-600">
                    Parti le {new Date(reservation.actualCheckOut).toLocaleDateString(locale)}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Durée</p>
                <p className="font-medium">{reservation.nights} nuit{reservation.nights > 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Room */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Bed className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">Chambre {reservation.room?.roomNumber}</p>
                  <p className="text-sm text-gray-500">{reservation.room?.roomType?.name}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Special Requests */}
          {reservation.specialRequests && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" />
                Demandes spéciales
              </h2>
              <p className="text-gray-600">{reservation.specialRequests}</p>
            </Card>
          )}

          {/* Internal Notes */}
          {reservation.internalNotes && (
            <Card className="p-6 border-orange-200 bg-orange-50">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes internes</h2>
              <p className="text-gray-600">{reservation.internalNotes}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              {reservation.status === 'CONFIRMED' && (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleCheckIn}
                  disabled={isCheckingIn}
                >
                  {isCheckingIn ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4 mr-2" />
                  )}
                  Enregistrer l'arrivée
                </Button>
              )}
              {reservation.status === 'CHECKED_IN' && (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleCheckOut}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4 mr-2" />
                  )}
                  Enregistrer le départ
                </Button>
              )}
              <Button variant="secondary" className="w-full">
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
              {reservation.status !== 'CANCELLED' && reservation.status !== 'CHECKED_OUT' && (
                <Button variant="secondary" className="w-full text-red-600 hover:bg-red-50">
                  <XCircle className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              )}
            </div>
          </Card>

          {/* Payment */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-400" />
              Paiement
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Tarif/nuit</span>
                <span className="font-medium">{reservation.roomRate}€</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{reservation.nights} nuit{reservation.nights > 1 ? 's' : ''}</span>
                <span className="font-medium">{(reservation.roomRate * reservation.nights).toFixed(2)}€</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">{reservation.totalAmount}€</span>
              </div>
              {reservation.depositPaid > 0 && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>Acompte reçu</span>
                    <span>-{reservation.depositPaid}€</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Reste à payer</span>
                    <span>{(reservation.totalAmount - reservation.depositPaid).toFixed(2)}€</span>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              Historique
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Réservation créée</p>
                  <p className="text-xs text-gray-500">
                    {new Date(reservation.createdAt).toLocaleDateString(locale)}
                  </p>
                </div>
              </div>
              {reservation.actualCheckIn && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <LogIn className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Check-in effectué</p>
                    <p className="text-xs text-gray-500">
                      {new Date(reservation.actualCheckIn).toLocaleDateString(locale)}
                    </p>
                  </div>
                </div>
              )}
              {reservation.actualCheckOut && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <LogOut className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Check-out effectué</p>
                    <p className="text-xs text-gray-500">
                      {new Date(reservation.actualCheckOut).toLocaleDateString(locale)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
