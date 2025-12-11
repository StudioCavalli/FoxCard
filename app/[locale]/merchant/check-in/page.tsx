'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import {
  LogIn,
  LogOut,
  Users,
  Bed,
  Clock,
  CheckCircle,
  Loader2,
  Calendar,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function CheckInPage() {
  const t = useTranslations('merchant.hotel.checkIn')
  const { storeId } = useStoreContext()
  const params = useParams()
  const locale = params?.locale || 'fr'
  const basePath = `/${locale}/merchant`

  const [processingId, setProcessingId] = useState<string | null>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Use booking.getAll - get today's and surrounding bookings
  const { data: bookingsData, isLoading, refetch } = trpc.booking.getAll.useQuery(
    {
      storeId: storeId!,
      dateFrom: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      dateTo: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ahead
      limit: 100,
    },
    { enabled: !!storeId }
  )

  // Get products (rooms) for display
  const { data: productsData } = trpc.product.getAll.useQuery(
    { storeId: storeId!, limit: 100 },
    { enabled: !!storeId }
  )

  const checkIn = trpc.booking.checkIn.useMutation({
    onSuccess: () => refetch(),
  })

  const updateStatus = trpc.booking.updateStatus.useMutation({
    onSuccess: () => refetch(),
  })

  const handleCheckIn = async (bookingId: string) => {
    if (!storeId) return
    setProcessingId(bookingId)
    try {
      await checkIn.mutateAsync({ id: bookingId })
    } catch (error) {
      console.error('Check-in error:', error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleCheckOut = async (bookingId: string) => {
    if (!storeId) return
    setProcessingId(bookingId)
    try {
      await updateStatus.mutateAsync({ id: bookingId, status: 'COMPLETED' })
    } catch (error) {
      console.error('Check-out error:', error)
    } finally {
      setProcessingId(null)
    }
  }

  // Transform bookings to reservation format with room info
  const { arrivals, departures, inHouse } = useMemo(() => {
    if (!bookingsData?.bookings) return { arrivals: [], departures: [], inHouse: [] }
    const products = productsData?.products || []

    const transformBooking = (booking: any) => {
      const product = products.find(p => p.id === booking.productId)
      const opts = (booking.options || {}) as any
      const checkInDate = new Date(booking.date)
      const checkOutDate = opts.checkOutDate ? new Date(opts.checkOutDate) : new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000)
      const nights = opts.nights || Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

      return {
        id: booking.id,
        guestName: booking.customerName,
        status: booking.status,
        checkInDate,
        checkOutDate,
        nights,
        room: product ? { roomNumber: product.sku || product.name } : null,
      }
    }

    const todayStart = today.getTime()
    const tomorrowStart = tomorrow.getTime()

    const allBookings = bookingsData.bookings.map(transformBooking)

    // Arrivals: check-in date is today, not yet checked in
    const arr = allBookings.filter((b: any) => {
      const checkIn = new Date(b.checkInDate)
      checkIn.setHours(0, 0, 0, 0)
      return checkIn.getTime() === todayStart && (b.status === 'CONFIRMED' || b.status === 'CHECKED_IN')
    })

    // Departures: check-out date is today
    const dep = allBookings.filter((b: any) => {
      const checkOut = new Date(b.checkOutDate)
      checkOut.setHours(0, 0, 0, 0)
      return checkOut.getTime() === todayStart && (b.status === 'CHECKED_IN' || b.status === 'COMPLETED')
    })

    // In house: currently checked in
    const house = allBookings.filter((b: any) => b.status === 'CHECKED_IN')

    return { arrivals: arr, departures: dep, inHouse: house }
  }, [bookingsData, productsData, today, tomorrow])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {today.toLocaleDateString(locale as string, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link href={`${basePath}/reservations`}>
          <AdminButton variant="secondary" icon={<Calendar className="w-4 h-4" />}>
            Voir le calendrier
          </AdminButton>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <AdminCard padding="md" className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Arrivées</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{arrivals.length}</p>
            </div>
            <LogIn className="w-8 h-8 text-emerald-200 dark:text-emerald-800" />
          </div>
        </AdminCard>
        <AdminCard padding="md" className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Départs</p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{departures.length}</p>
            </div>
            <LogOut className="w-8 h-8 text-amber-200 dark:text-amber-800" />
          </div>
        </AdminCard>
        <AdminCard padding="md" className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">En séjour</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{inHouse.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200 dark:text-blue-800" />
          </div>
        </AdminCard>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Arrivals */}
          <AdminCard padding="lg">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <LogIn className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Arrivées du jour
            </h2>
            {arrivals.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p>Aucune arrivée prévue</p>
              </div>
            ) : (
              <div className="space-y-3">
                {arrivals.map((res: any) => (
                  <div
                    key={res.id}
                    className={`p-4 border rounded-xl transition-colors ${
                      res.status === 'CHECKED_IN'
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          res.status === 'CHECKED_IN' ? 'bg-emerald-200 dark:bg-emerald-500/30' : 'bg-slate-100 dark:bg-slate-700'
                        }`}>
                          <Bed className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{res.guestName}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Chambre {res.room?.roomNumber} - {res.nights} nuit{res.nights > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {res.status === 'CHECKED_IN' ? (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Arrivé
                          </span>
                        ) : (
                          <AdminButton
                            variant="primary"
                            size="sm"
                            onClick={() => handleCheckIn(res.id)}
                            disabled={processingId === res.id}
                            icon={processingId === res.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                          >
                            {processingId !== res.id && 'Check-in'}
                          </AdminButton>
                        )}
                        <Link href={`${basePath}/reservations/${res.id}`}>
                          <AdminButton variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>

          {/* Departures */}
          <AdminCard padding="lg">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <LogOut className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Départs du jour
            </h2>
            {departures.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p>Aucun départ prévu</p>
              </div>
            ) : (
              <div className="space-y-3">
                {departures.map((res: any) => (
                  <div
                    key={res.id}
                    className={`p-4 border rounded-xl transition-colors ${
                      res.status === 'COMPLETED'
                        ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          res.status === 'COMPLETED' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-amber-100 dark:bg-amber-500/20'
                        }`}>
                          <Bed className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{res.guestName}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Chambre {res.room?.roomNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {res.status === 'COMPLETED' ? (
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Parti
                          </span>
                        ) : (
                          <AdminButton
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCheckOut(res.id)}
                            disabled={processingId === res.id}
                            icon={processingId === res.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                          >
                            {processingId !== res.id && 'Check-out'}
                          </AdminButton>
                        )}
                        <Link href={`${basePath}/reservations/${res.id}`}>
                          <AdminButton variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>
        </div>
      )}

      {/* Currently In House */}
      <AdminCard padding="lg">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Clients actuellement en séjour
        </h2>
        {inHouse.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <p>Aucun client en séjour</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inHouse.map((res: any) => (
              <Link
                key={res.id}
                href={`${basePath}/reservations/${res.id}`}
                className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Bed className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{res.guestName}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Chambre {res.room?.roomNumber}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Départ: {new Date(res.checkOutDate).toLocaleDateString(locale as string)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  )
}
