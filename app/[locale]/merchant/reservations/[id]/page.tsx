'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
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
  XCircle,
  LogIn,
  LogOut,
  Loader2,
  Edit,
  FileText
} from 'lucide-react'
import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-400',
  CONFIRMED: 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400',
  CHECKED_IN: 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400',
  CHECKED_OUT: 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-400',
  CANCELLED: 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400',
  NO_SHOW: 'bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-400',
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
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    )
  }

  if (!reservation) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">Réservation introuvable</p>
        <Link href={`${basePath}/reservations`}>
          <AdminButton variant="primary" className="mt-4">
            Retour aux réservations
          </AdminButton>
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
            <AdminButton variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Réservation #{reservation.id.slice(-6).toUpperCase()}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
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
          <AdminCard padding="lg">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-slate-400" />
              Informations client
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Nom</p>
                <p className="font-medium text-slate-900 dark:text-white">{reservation.guestName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                <p className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {reservation.guestEmail}
                </p>
              </div>
              {reservation.guestPhone && (
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Téléphone</p>
                  <p className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {reservation.guestPhone}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Voyageurs</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {reservation.adultCount} adulte{reservation.adultCount > 1 ? 's' : ''}
                  {reservation.childCount > 0 && `, ${reservation.childCount} enfant${reservation.childCount > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
          </AdminCard>

          {/* Stay Info */}
          <AdminCard padding="lg">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" />
              Détails du séjour
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Arrivée</p>
                <p className="font-medium text-slate-900 dark:text-white">{checkInDate.toLocaleDateString(locale as string)}</p>
                {reservation.actualCheckIn && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    Arrivé le {new Date(reservation.actualCheckIn).toLocaleDateString(locale as string)}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Départ</p>
                <p className="font-medium text-slate-900 dark:text-white">{checkOutDate.toLocaleDateString(locale as string)}</p>
                {reservation.actualCheckOut && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    Parti le {new Date(reservation.actualCheckOut).toLocaleDateString(locale as string)}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Durée</p>
                <p className="font-medium text-slate-900 dark:text-white">{reservation.nights} nuit{reservation.nights > 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Room */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                  <Bed className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Chambre {reservation.room?.roomNumber}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{reservation.room?.roomType?.name}</p>
                </div>
              </div>
            </div>
          </AdminCard>

          {/* Special Requests */}
          {reservation.specialRequests && (
            <AdminCard padding="lg">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" />
                Demandes spéciales
              </h2>
              <p className="text-slate-600 dark:text-slate-400">{reservation.specialRequests}</p>
            </AdminCard>
          )}

          {/* Internal Notes */}
          {reservation.internalNotes && (
            <AdminCard padding="lg" className="border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Notes internes</h2>
              <p className="text-slate-600 dark:text-slate-400">{reservation.internalNotes}</p>
            </AdminCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <AdminCard padding="lg">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Actions</h2>
            <div className="space-y-3">
              {reservation.status === 'CONFIRMED' && (
                <AdminButton
                  variant="primary"
                  className="w-full"
                  onClick={handleCheckIn}
                  disabled={isCheckingIn}
                  icon={isCheckingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                >
                  Enregistrer l'arrivée
                </AdminButton>
              )}
              {reservation.status === 'CHECKED_IN' && (
                <AdminButton
                  variant="primary"
                  className="w-full"
                  onClick={handleCheckOut}
                  disabled={isCheckingOut}
                  icon={isCheckingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                >
                  Enregistrer le départ
                </AdminButton>
              )}
              <AdminButton variant="secondary" className="w-full" icon={<Edit className="w-4 h-4" />}>
                Modifier
              </AdminButton>
              {reservation.status !== 'CANCELLED' && reservation.status !== 'CHECKED_OUT' && (
                <AdminButton variant="secondary" className="w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10" icon={<XCircle className="w-4 h-4" />}>
                  Annuler
                </AdminButton>
              )}
            </div>
          </AdminCard>

          {/* Payment */}
          <AdminCard padding="lg">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-slate-400" />
              Paiement
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Tarif/nuit</span>
                <span className="font-medium text-slate-900 dark:text-white">{reservation.roomRate}€</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">{reservation.nights} nuit{reservation.nights > 1 ? 's' : ''}</span>
                <span className="font-medium text-slate-900 dark:text-white">{(reservation.roomRate * reservation.nights).toFixed(2)}€</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between">
                <span className="font-semibold text-slate-900 dark:text-white">Total</span>
                <span className="font-bold text-lg text-slate-900 dark:text-white">{reservation.totalAmount}€</span>
              </div>
              {reservation.depositPaid > 0 && (
                <>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Acompte reçu</span>
                    <span>-{reservation.depositPaid}€</span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-900 dark:text-white">
                    <span>Reste à payer</span>
                    <span>{(reservation.totalAmount - reservation.depositPaid).toFixed(2)}€</span>
                  </div>
                </>
              )}
            </div>
          </AdminCard>

          {/* Timeline */}
          <AdminCard padding="lg">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              Historique
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Réservation créée</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(reservation.createdAt).toLocaleDateString(locale as string)}
                  </p>
                </div>
              </div>
              {reservation.actualCheckIn && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <LogIn className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Check-in effectué</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(reservation.actualCheckIn).toLocaleDateString(locale as string)}
                    </p>
                  </div>
                </div>
              )}
              {reservation.actualCheckOut && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <LogOut className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Check-out effectué</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(reservation.actualCheckOut).toLocaleDateString(locale as string)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  )
}
