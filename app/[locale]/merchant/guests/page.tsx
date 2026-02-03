'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import {
  Search,
  Users,
  Mail,
  Phone,
  Calendar,
  Loader2,
  Star,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

export default function GuestsPage() {
  const t = useTranslations('merchant.hotel.guests')
  const { storeId } = useStoreContext()
  const params = useParams()
  const locale = params?.locale || 'fr'
  const basePath = `/${locale}/merchant`

  const [searchQuery, setSearchQuery] = useState('')

  // Get all bookings to aggregate guests
  const { data: bookingsData, isLoading } = trpc.booking.getAll.useQuery(
    { storeId: storeId!, limit: 500 },
    { enabled: !!storeId }
  )

  // Aggregate guests from bookings
  const guests = useMemo(() => {
    if (!bookingsData?.bookings) return []

    const guestMap = new Map<string, any>()
    for (const booking of bookingsData.bookings) {
      const existing = guestMap.get(booking.customerEmail)
      const opts = (booking.options || {}) as any
      const checkInDate = new Date(booking.date)
      const checkOutDate = opts.checkOutDate ? new Date(opts.checkOutDate) : new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000)
      const nights = opts.nights || Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

      if (existing) {
        existing.totalStays++
        existing.totalNights += nights
        existing.totalSpent += booking.totalPrice
        if (new Date(checkOutDate) > new Date(existing.lastStay || 0)) {
          existing.lastStay = checkOutDate
        }
      } else {
        guestMap.set(booking.customerEmail, {
          id: booking.customerEmail,
          name: booking.customerName,
          email: booking.customerEmail,
          phone: booking.customerPhone,
          totalStays: 1,
          totalNights: nights,
          totalSpent: booking.totalPrice,
          lastStay: checkOutDate,
          createdAt: booking.createdAt,
          isVip: false,
        })
      }
    }

    return Array.from(guestMap.values()).sort((a, b) =>
      new Date(b.lastStay).getTime() - new Date(a.lastStay).getTime()
    )
  }, [bookingsData])

  // Filter by search query
  const filteredGuests = useMemo(() => {
    if (!searchQuery) return guests
    const query = searchQuery.toLowerCase()
    return guests.filter((g: any) =>
      g.name.toLowerCase().includes(query) ||
      g.email.toLowerCase().includes(query) ||
      g.phone?.includes(query)
    )
  }, [guests, searchQuery])

  // Stats
  const totalGuests = filteredGuests.length
  const returningGuests = filteredGuests.filter((g: any) => g.totalStays > 1).length
  const vipGuests = filteredGuests.filter((g: any) => g.isVip).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Répertoire de vos clients</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <AdminCard padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-primary-500/20 dark:from-blue-500/30 dark:to-primary-500/30 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total clients</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalGuests}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-green-500/20 dark:from-emerald-500/30 dark:to-green-500/30 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Clients fidèles</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{returningGuests}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 dark:from-amber-500/30 dark:to-yellow-500/30 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">VIP</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{vipGuests}</p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Search */}
      <AdminCard padding="md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>
      </AdminCard>

      {/* Guests List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : filteredGuests.length === 0 ? (
        <AdminCard padding="lg" className="text-center">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Aucun client</h3>
          <p className="text-slate-500 dark:text-slate-400">
            {searchQuery ? 'Aucun résultat pour cette recherche' : 'Les clients apparaîtront ici après leurs réservations'}
          </p>
        </AdminCard>
      ) : (
        <AdminCard padding="none" className="divide-y divide-slate-100 dark:divide-slate-700">
          {filteredGuests.map((guest: any) => (
            <Link
              key={guest.id}
              href={`${basePath}/guests/${guest.id}`}
              className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  {guest.isVip ? (
                    <Star className="w-6 h-6 text-amber-500" />
                  ) : (
                    <span className="text-lg font-semibold text-slate-500 dark:text-slate-400">
                      {guest.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900 dark:text-white">{guest.name}</p>
                    {guest.isVip && (
                      <span className="px-2 py-0.5 text-xs bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 rounded-full">
                        VIP
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {guest.email}
                    </span>
                    {guest.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {guest.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {guest.totalStays} séjour{guest.totalStays > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {guest.lastStay && `Dernier: ${new Date(guest.lastStay).toLocaleDateString(locale as string)}`}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            </Link>
          ))}
        </AdminCard>
      )}
    </div>
  )
}
