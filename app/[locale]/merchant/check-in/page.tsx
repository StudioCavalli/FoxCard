'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
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

  const { data: todayData, isLoading, refetch } = trpc.hotel.getTodayChecks?.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  )

  const checkIn = trpc.hotel.checkInReservation?.useMutation({
    onSuccess: () => refetch(),
  })

  const checkOut = trpc.hotel.checkOutReservation?.useMutation({
    onSuccess: () => refetch(),
  })

  const handleCheckIn = async (reservationId: string) => {
    if (!storeId) return
    setProcessingId(reservationId)
    try {
      await checkIn?.mutateAsync({ storeId, reservationId })
    } catch (error) {
      console.error('Check-in error:', error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleCheckOut = async (reservationId: string) => {
    if (!storeId) return
    setProcessingId(reservationId)
    try {
      await checkOut?.mutateAsync({ storeId, reservationId })
    } catch (error) {
      console.error('Check-out error:', error)
    } finally {
      setProcessingId(null)
    }
  }

  const arrivals = todayData?.arrivals || []
  const departures = todayData?.departures || []
  const inHouse = todayData?.inHouse || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-500 mt-1">
            {today.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link href={`${basePath}/reservations`}>
          <Button variant="secondary">
            <Calendar className="w-4 h-4 mr-2" />
            Voir le calendrier
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Arrivées</p>
              <p className="text-3xl font-bold text-green-600">{arrivals.length}</p>
            </div>
            <LogIn className="w-8 h-8 text-green-200" />
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Départs</p>
              <p className="text-3xl font-bold text-orange-600">{departures.length}</p>
            </div>
            <LogOut className="w-8 h-8 text-orange-200" />
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">En séjour</p>
              <p className="text-3xl font-bold text-blue-600">{inHouse.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Arrivals */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <LogIn className="w-5 h-5 text-green-600" />
              Arrivées du jour
            </h2>
            {arrivals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Aucune arrivée prévue</p>
              </div>
            ) : (
              <div className="space-y-3">
                {arrivals.map((res: any) => (
                  <div
                    key={res.id}
                    className={`p-4 border rounded-lg ${
                      res.status === 'CHECKED_IN' ? 'bg-green-50 border-green-200' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          res.status === 'CHECKED_IN' ? 'bg-green-200' : 'bg-gray-100'
                        }`}>
                          <Bed className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{res.guestName}</p>
                          <p className="text-sm text-gray-500">
                            Chambre {res.room?.roomNumber} - {res.nights} nuit{res.nights > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {res.status === 'CHECKED_IN' ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Arrivé
                          </span>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleCheckIn(res.id)}
                            disabled={processingId === res.id}
                          >
                            {processingId === res.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <LogIn className="w-4 h-4 mr-1" />
                                Check-in
                              </>
                            )}
                          </Button>
                        )}
                        <Link href={`${basePath}/reservations/${res.id}`}>
                          <Button variant="ghost" size="sm">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Departures */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <LogOut className="w-5 h-5 text-orange-600" />
              Départs du jour
            </h2>
            {departures.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Aucun départ prévu</p>
              </div>
            ) : (
              <div className="space-y-3">
                {departures.map((res: any) => (
                  <div
                    key={res.id}
                    className={`p-4 border rounded-lg ${
                      res.status === 'CHECKED_OUT' ? 'bg-gray-50 border-gray-200' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          res.status === 'CHECKED_OUT' ? 'bg-gray-200' : 'bg-orange-100'
                        }`}>
                          <Bed className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{res.guestName}</p>
                          <p className="text-sm text-gray-500">
                            Chambre {res.room?.roomNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {res.status === 'CHECKED_OUT' ? (
                          <span className="flex items-center gap-1 text-gray-600 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Parti
                          </span>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCheckOut(res.id)}
                            disabled={processingId === res.id}
                          >
                            {processingId === res.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <LogOut className="w-4 h-4 mr-1" />
                                Check-out
                              </>
                            )}
                          </Button>
                        )}
                        <Link href={`${basePath}/reservations/${res.id}`}>
                          <Button variant="ghost" size="sm">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Currently In House */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Clients actuellement en séjour
        </h2>
        {inHouse.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Aucun client en séjour</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inHouse.map((res: any) => (
              <Link
                key={res.id}
                href={`${basePath}/reservations/${res.id}`}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bed className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{res.guestName}</p>
                    <p className="text-sm text-gray-500">Chambre {res.room?.roomNumber}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Départ: {new Date(res.checkOutDate).toLocaleDateString(locale)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
