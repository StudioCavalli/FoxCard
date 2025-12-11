'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import { formatPrice } from '@/lib/utils'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Bed,
  Users,
  Eye,
  Loader2,
  DollarSign,
  FileEdit
} from 'lucide-react'

export default function RoomsPage() {
  const t = useTranslations('merchant.hotel.rooms')
  const { storeId } = useStoreContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const params = useParams()
  const locale = params?.locale || 'fr'
  const basePath = `/${locale}/merchant`

  // Use Product system - rooms are Products for HOTEL stores
  const { data, isLoading, refetch } = trpc.product.getAll.useQuery(
    { storeId: storeId!, limit: 100 },
    { enabled: !!storeId }
  )

  const deleteProduct = trpc.product.delete.useMutation({
    onSuccess: () => refetch(),
  })

  const products = data?.products || []

  // Filter products for hotel rooms (could filter by category or type)
  const rooms = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Stats
  const totalRooms = products.length
  const activeCount = products.filter(p => p.status === 'ACTIVE').length
  const draftCount = products.filter(p => p.status === 'DRAFT').length

  // Get hotel-specific attributes from product
  const getAttributes = (product: any) => {
    const attrs = product.attributes || {}
    return {
      maxGuests: attrs.maxGuests || attrs.capacity || 2,
      roomType: attrs.roomType || product.category?.name || 'Standard',
      amenities: attrs.amenities || [],
      bedType: attrs.bedType || '',
      size: attrs.size || attrs.sizeSqm || null,
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gérez vos chambres et hébergements</p>
        </div>
        <Link href={`${basePath}/rooms/new`}>
          <AdminButton icon={<Plus className="w-4 h-4" />}>
            {t('create')}
          </AdminButton>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminCard padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-primary-500/20 dark:from-primary-500/30 dark:to-primary-500/30 rounded-xl flex items-center justify-center">
              <Bed className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total chambres</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalRooms}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-green-500/20 dark:from-emerald-500/30 dark:to-green-500/30 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Actives</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeCount}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 dark:from-amber-500/30 dark:to-yellow-500/30 rounded-xl flex items-center justify-center">
              <FileEdit className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Brouillons</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{draftCount}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-red-500/20 dark:from-orange-500/30 dark:to-red-500/30 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Prix moyen</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {products.length > 0
                  ? formatPrice(products.reduce((sum, p) => sum + p.price, 0) / products.length)
                  : '0€'
                }
              </p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Filters */}
      <AdminCard padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une chambre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          >
            <option value="all">Tous les statuts</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Brouillon</option>
            <option value="ARCHIVED">Archivée</option>
          </select>
        </div>
      </AdminCard>

      {/* Rooms Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : rooms.length === 0 ? (
        <AdminCard padding="lg">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bed className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Aucune chambre</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Commencez par créer votre première chambre</p>
            <Link href={`${basePath}/rooms/new`}>
              <AdminButton icon={<Plus className="w-4 h-4" />}>
                {t('create')}
              </AdminButton>
            </Link>
          </div>
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((product) => {
            const attrs = getAttributes(product)
            const image = product.thumbnail || product.images?.[0] || '/placeholder-hotel.png'

            return (
              <AdminCard key={product.id} padding="none" hover className="overflow-hidden">
                {/* Image */}
                <div className="aspect-[4/3] relative bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <AdminBadge
                      variant={
                        product.status === 'ACTIVE' ? 'success' :
                        product.status === 'DRAFT' ? 'warning' :
                        'default'
                      }
                    >
                      {product.status === 'ACTIVE' ? 'Active' : product.status === 'DRAFT' ? 'Brouillon' : 'Archivée'}
                    </AdminBadge>
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{attrs.roomType}</p>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>{attrs.maxGuests} personnes max</span>
                      </div>
                    </div>
                    {attrs.size && (
                      <div className="text-slate-500 dark:text-slate-400">{attrs.size} m²</div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-primary-600 dark:text-primary-400">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-slate-400">/ nuit</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <Link href={`${basePath}/products/${product.id}/edit`} className="flex-1">
                      <AdminButton variant="secondary" size="sm" className="w-full">
                        <Edit className="w-4 h-4 mr-1" />
                        Modifier
                      </AdminButton>
                    </Link>
                    <Link href={`/${locale}/products/${product.slug}`} target="_blank">
                      <AdminButton variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </AdminButton>
                    </Link>
                    <AdminButton
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Supprimer cette chambre ?')) {
                          deleteProduct.mutate({ id: product.id })
                        }
                      }}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </AdminButton>
                  </div>
                </div>
              </AdminCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
