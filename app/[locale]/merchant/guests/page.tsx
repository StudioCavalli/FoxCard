'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
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

  const { data: guests, isLoading } = trpc.hotel.getGuests?.useQuery(
    { storeId: storeId!, search: searchQuery },
    { enabled: !!storeId }
  )

  const filteredGuests = guests || []

  // Stats
  const totalGuests = filteredGuests.length
  const returningGuests = filteredGuests.filter((g: any) => g.totalStays > 1).length
  const vipGuests = filteredGuests.filter((g: any) => g.isVip).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-500 mt-1">Répertoire de vos clients</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total clients</p>
              <p className="text-2xl font-bold">{totalGuests}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Clients fidèles</p>
              <p className="text-2xl font-bold">{returningGuests}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">VIP</p>
              <p className="text-2xl font-bold">{vipGuests}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Rechercher par nom, email ou téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Guests List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : filteredGuests.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun client</h3>
          <p className="text-gray-500">
            {searchQuery ? 'Aucun résultat pour cette recherche' : 'Les clients apparaîtront ici après leurs réservations'}
          </p>
        </Card>
      ) : (
        <Card className="divide-y">
          {filteredGuests.map((guest: any) => (
            <Link
              key={guest.id}
              href={`${basePath}/guests/${guest.id}`}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  {guest.isVip ? (
                    <Star className="w-6 h-6 text-yellow-500" />
                  ) : (
                    <span className="text-lg font-semibold text-gray-500">
                      {guest.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{guest.name}</p>
                    {guest.isVip && (
                      <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        VIP
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
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
                  <p className="text-sm font-medium text-gray-900">
                    {guest.totalStays} séjour{guest.totalStays > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-gray-500">
                    {guest.lastStay && `Dernier: ${new Date(guest.lastStay).toLocaleDateString(locale)}`}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
          ))}
        </Card>
      )}
    </div>
  )
}
