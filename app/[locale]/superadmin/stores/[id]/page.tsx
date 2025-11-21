'use client'

import { use } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { trpc } from '@/lib/trpc/client'
import { formatPrice, formatDate } from '@/lib/utils'
import {
  ArrowLeft,
  Store,
  User,
  Package,
  ShoppingCart,
  Users,
  Trash2,
  AlertCircle,
  Ban
} from 'lucide-react'

export default function StoreDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: store, isLoading } = trpc.superadmin.getStoreDetails.useQuery({ storeId: id })

  const deleteStore = trpc.superadmin.deleteStore.useMutation()

  const handleDelete = async () => {
    const reason = prompt('Raison de la suppression de cette boutique:')
    if (!reason) return

    const confirmText = 'SUPPRIMER'
    const confirm = prompt(
      `Cette action est irréversible. Tapez "${confirmText}" pour confirmer:`
    )

    if (confirm === confirmText) {
      await deleteStore.mutateAsync({
        storeId: id,
        confirm: true,
        reason,
      })
      window.location.href = '/superadmin/stores'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse h-8 bg-gray-200 rounded w-64"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Boutique introuvable</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/superadmin/stores">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>
            <p className="text-gray-600">/{store.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Ban className="w-4 h-4 mr-2" />
            Suspendre
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      </div>

      {/* Store Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de la Boutique</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Nom</p>
            <p className="font-medium text-gray-900">{store.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Slug</p>
            <p className="font-medium text-gray-900">{store.slug}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Créée le</p>
            <p className="font-medium text-gray-900">{formatDate(store.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Dernière mise à jour</p>
            <p className="font-medium text-gray-900">{formatDate(store.updatedAt)}</p>
          </div>
          {store.description && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 mb-1">Description</p>
              <p className="font-medium text-gray-900">{store.description}</p>
            </div>
          )}
          {store.domain && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 mb-1">Domaine personnalisé</p>
              <p className="font-medium text-gray-900">{store.domain}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Owner Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Propriétaire</h3>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{store.owner.name || 'Sans nom'}</p>
            <p className="text-sm text-gray-600">{store.owner.email}</p>
            <p className="text-xs text-purple-600 font-semibold">{store.owner.role}</p>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Produits</p>
              <p className="text-2xl font-bold text-gray-900">{store._count.products}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Commandes</p>
              <p className="text-2xl font-bold text-gray-900">{store._count.orders}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Clients</p>
              <p className="text-2xl font-bold text-gray-900">{store._count.customers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Store className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Catégories</p>
              <p className="text-2xl font-bold text-gray-900">{store._count.categories}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques de Revenu</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Revenu Total</p>
            <p className="text-3xl font-bold text-green-600">{formatPrice(store.stats.totalRevenue)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Revenu En Attente</p>
            <p className="text-3xl font-bold text-orange-600">{formatPrice(store.stats.pendingRevenue)}</p>
          </div>
        </div>
      </Card>

      {/* Monthly Revenue */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenus Mensuels</h3>
        <div className="space-y-3">
          {Object.entries(store.stats.monthlyRevenue)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-6)
            .map(([month, revenue]) => {
              const maxRevenue = Math.max(...Object.values(store.stats.monthlyRevenue))
              const percentage = (revenue / maxRevenue) * 100

              return (
                <div key={month} className="flex items-center gap-4">
                  <div className="w-20 text-sm text-gray-600">{month}</div>
                  <div className="flex-1">
                    <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center px-3 transition-all"
                        style={{ width: `${percentage}%` }}
                      >
                        <span className="text-xs font-medium text-white">
                          {formatPrice(revenue)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </Card>

      {/* Store Users/Team */}
      {store.storeUsers.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Équipe</h3>
          <div className="space-y-3">
            {store.storeUsers.map((storeUser) => (
              <div key={storeUser.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{storeUser.user.name || storeUser.user.email}</p>
                    <p className="text-sm text-gray-600">{storeUser.user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{storeUser.role.name}</p>
                  <p className="text-xs text-gray-600">{storeUser.status}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
