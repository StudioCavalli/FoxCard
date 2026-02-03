'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
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
  Edit
} from 'lucide-react'
import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-400',
  CONFIRMED: 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400',
  CHECKED_IN: 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400',
  COMPLETED: 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-400',
  CANCELLED: 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400',
  NO_SHOW: 'bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-400',
}

export default function GuestDetailPage() {
  const t = useTranslations('merchant.hotel.guests')
  const tRes = useTranslations('merchant.hotel.reservations')
  const { storeId } = useStoreContext()
  const params = useParams()
  const locale = params?.locale || 'fr'
  const guestId = params?.id as string // email
  const basePath = `/${locale}/merchant`

  // Get all bookings for this guest (by email)
  const { data: bookingsData, isLoading } = trpc.booking.getAll.useQuery(
    { storeId: storeId!, search: guestId, limit: 100 },
    { enabled: !!storeId && !!guestId }
  )

  // Get products for room info
  const { data: productsData } = trpc.product.getAll.useQuery(
    { storeId: storeId!, limit: 100 },
    { enabled: !!storeId }
  )

  // Aggregate guest info from bookings
  const guest = useMemo(() => {
    if (!bookingsData?.bookings) return null
    const products = productsData?.products || []

    // Filter bookings by exact email match
    const guestBookings = bookingsData.bookings.filter(
      (b: any) => b.customerEmail === guestId
    )

    if (guestBookings.length === 0) return null

    const first = guestBookings[guestBookings.length - 1]
    const last = guestBookings[0]

    const reservations = guestBookings.map((booking: any) => {
      const product = products.find(p => p.id === booking.productId)
      const opts = (booking.options || {}) as any
      const checkInDate = new Date(booking.date)
      const checkOutDate = opts.checkOutDate ? new Date(opts.checkOutDate) : new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000)
      const nights = opts.nights || Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

      return {
        id: booking.id,
        checkInDate,
        checkOutDate,
        status: booking.status,
        totalAmount: booking.totalPrice,
        room: product ? { roomNumber: product.sku || product.name } : null,
      }
    })

    const totalNights = guestBookings.reduce((sum: number, b: any) => {
      const opts = (b.options || {}) as any
      const checkIn = new Date(b.date)
      const checkOut = opts.checkOutDate ? new Date(opts.checkOutDate) : new Date(checkIn.getTime() + 24 * 60 * 60 * 1000)
      return sum + Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    }, 0)

    return {
      id: guestId,
      name: last.customerName,
      email: last.customerEmail,
      phone: last.customerPhone,
      totalStays: guestBookings.length,
      totalNights,
      totalSpent: guestBookings.reduce((sum: number, b: any) => sum + b.totalPrice, 0),
      lastStay: last.date,
      createdAt: first.createdAt,
      isVip: false,
      reservations,
      notes: null,
    }
  }, [bookingsData, productsData, guestId])

  // VIP toggle placeholder (would need store settings to persist)
  const toggleVip = { mutate: (_args: { storeId: string; guestId: string }) => {} }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!guest) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">Client introuvable</p>
        <Link href={`${basePath}/guests`}>
          <AdminButton variant="primary" className="mt-4">
            Retour aux clients
          </AdminButton>
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
            <AdminButton variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/20">
              {guest.isVip ? (
                <Star className="w-7 h-7 text-amber-300" />
              ) : (
                <span className="text-2xl font-semibold text-white">
                  {guest.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{guest.name}</h1>
                {guest.isVip && (
                  <span className="px-2 py-1 text-xs bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 rounded-full font-medium">
                    VIP
                  </span>
                )}
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                Client depuis {new Date(guest.createdAt).toLocaleDateString(locale as string)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AdminButton
            variant="secondary"
            onClick={() => toggleVip?.mutate({ storeId: storeId!, guestId })}
            icon={<Star className={`w-4 h-4 ${guest.isVip ? 'text-amber-500' : ''}`} />}
          >
            {guest.isVip ? 'Retirer VIP' : 'Marquer VIP'}
          </AdminButton>
          <AdminButton variant="secondary" icon={<Edit className="w-4 h-4" />}>
            Modifier
          </AdminButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <AdminCard padding="lg">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-slate-400" />
              Informations de contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                <p className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {guest.email}
                </p>
              </div>
              {guest.phone && (
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Téléphone</p>
                  <p className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {guest.phone}
                  </p>
                </div>
              )}
            </div>
          </AdminCard>

          {/* Reservation History */}
          <AdminCard padding="lg">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" />
              Historique des séjours
            </h2>
            {guest.reservations?.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">Aucun séjour enregistré</p>
            ) : (
              <div className="space-y-3">
                {guest.reservations?.map((res: any) => (
                  <Link
                    key={res.id}
                    href={`${basePath}/reservations/${res.id}`}
                    className="block p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                          <Bed className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">Chambre {res.room?.roomNumber}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {new Date(res.checkInDate).toLocaleDateString(locale as string)} - {new Date(res.checkOutDate).toLocaleDateString(locale as string)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${STATUS_COLORS[res.status]}`}>
                          {tRes(`status.${res.status.toLowerCase()}`)}
                        </span>
                        <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">{res.totalAmount}€</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </AdminCard>

          {/* Notes */}
          {guest.notes && (
            <AdminCard padding="lg" className="border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Notes internes</h2>
              <p className="text-slate-600 dark:text-slate-400">{guest.notes}</p>
            </AdminCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <AdminCard padding="lg">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Statistiques</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Total séjours</span>
                <span className="font-bold text-lg text-slate-900 dark:text-white">{guest.totalStays || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Total nuits</span>
                <span className="font-bold text-lg text-slate-900 dark:text-white">{guest.totalNights || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Dépenses totales</span>
                <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">{guest.totalSpent || 0}€</span>
              </div>
              {guest.lastStay && (
                <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">Dernier séjour</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {new Date(guest.lastStay).toLocaleDateString(locale as string)}
                  </span>
                </div>
              )}
            </div>
          </AdminCard>

          {/* Preferences */}
          <AdminCard padding="lg">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Préférences</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Aucune préférence enregistrée</p>
          </AdminCard>
        </div>
      </div>
    </div>
  )
}
