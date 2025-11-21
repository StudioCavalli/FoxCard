'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { formatPrice, formatDate } from '@/lib/utils'
import {
  Store,
  Search,
  ArrowRight,
  Package,
  ShoppingCart,
  Users,
  DollarSign
} from 'lucide-react'

export default function SuperAdminStoresPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'active' | 'suspended' | 'all'>('all')

  const { data, isLoading } = trpc.superadmin.getAllStores.useQuery({
    limit: 50,
    offset: 0,
    search: search || undefined,
    status,
  })

  const stores = data?.stores || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Boutiques</h1>
        <p className="text-gray-600">
          {data?.total || 0} boutique{(data?.total || 0) > 1 ? 's' : ''} sur la plateforme
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Rechercher par nom, slug ou email du propriétaire..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actives</option>
            <option value="suspended">Suspendues</option>
          </select>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      )}

      {/* Stores List */}
      {!isLoading && stores.length === 0 && (
        <Card className="p-12 text-center">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucune boutique trouvée</p>
        </Card>
      )}

      {!isLoading && stores.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {stores.map((store) => (
            <Card key={store.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                {/* Store Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {store.logo ? (
                      <img
                        src={store.logo}
                        alt={store.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Store className="w-6 h-6 text-purple-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{store.name}</h3>
                      <p className="text-sm text-gray-600">/{store.slug}</p>
                    </div>
                  </div>

                  {store.description && (
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">{store.description}</p>
                  )}

                  {/* Owner Info */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Propriétaire:</span> {store.owner.name || store.owner.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Email:</span> {store.owner.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Créée le:</span> {formatDate(store.createdAt)}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-600">Produits</p>
                        <p className="text-sm font-semibold text-gray-900">{store._count.products}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-600">Commandes</p>
                        <p className="text-sm font-semibold text-gray-900">{store._count.orders}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="text-xs text-gray-600">Clients</p>
                        <p className="text-sm font-semibold text-gray-900">{store._count.customers}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="text-xs text-gray-600">Revenu</p>
                        <p className="text-sm font-semibold text-gray-900">{formatPrice(store.revenue)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="ml-4">
                  <Link href={`/superadmin/stores/${store.id}`}>
                    <Button variant="ghost" size="sm">
                      Détails
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
