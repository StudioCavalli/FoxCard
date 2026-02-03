'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { AdminCard, AdminCardHeader } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { trpc } from '@/lib/trpc/client'
import { formatPrice } from '@/lib/utils'
import { Plus, Search, Edit, Trash2, Eye, Package, Filter, Box, AlertTriangle, Archive } from 'lucide-react'
import { useStoreContext } from '@/lib/context/store-context'
import { useTranslations } from 'next-intl'

export default function MerchantProductsPage() {
  const { storeId } = useStoreContext()
  const [searchQuery, setSearchQuery] = useState('')
  const params = useParams()
  const locale = params?.locale || 'fr'
  const basePath = `/${locale}/merchant`
  const t = useTranslations('merchant')

  const { data: store } = trpc.store.getById.useQuery(
    { id: storeId! },
    { enabled: !!storeId }
  )

  const { data, isLoading, refetch } = trpc.product.getAll.useQuery(
    {
      storeId: storeId!,
      limit: 50,
    },
    {
      enabled: !!storeId,
    }
  )

  const deleteProduct = trpc.product.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const products = data?.products || []
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeCount = products.filter(p => p.status === 'ACTIVE').length
  const draftCount = products.filter(p => p.status === 'DRAFT').length
  const lowStockCount = products.filter(p => p.quantity <= 5 && p.quantity > 0).length
  const outOfStockCount = products.filter(p => p.quantity === 0).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('products')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gérez votre catalogue de produits</p>
        </div>
        <Link href={`${basePath}/products/new`}>
          <AdminButton icon={<Plus className="w-4 h-4" />}>
            Nouveau Produit
          </AdminButton>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminCard padding="md" className="group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-primary-500/20 dark:from-primary-500/30 dark:to-primary-500/30 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total produits</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{products.length}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard padding="md" className="group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-green-500/20 dark:from-emerald-500/30 dark:to-green-500/30 rounded-xl flex items-center justify-center">
              <Box className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Actifs</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeCount}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard padding="md" className="group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 dark:from-amber-500/30 dark:to-yellow-500/30 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Stock faible</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{lowStockCount}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard padding="md" className="group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-rose-500/20 dark:from-red-500/30 dark:to-rose-500/30 rounded-xl flex items-center justify-center">
              <Archive className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Rupture</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{outOfStockCount}</p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Search & Filters */}
      <AdminCard padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>
          <AdminButton variant="secondary" icon={<Filter className="w-4 h-4" />}>
            Filtres
          </AdminButton>
        </div>
      </AdminCard>

      {/* Products Table */}
      <AdminCard padding="none">
        {isLoading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                  <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="w-20 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="w-16 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Aucun produit</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Commencez par ajouter votre premier produit</p>
            <Link href={`${basePath}/products/new`}>
              <AdminButton icon={<Plus className="w-4 h-4" />}>
                Ajouter un produit
              </AdminButton>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Produit</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">SKU</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stock</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Prix</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Statut</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex-shrink-0">
                          {product.thumbnail || product.images[0] ? (
                            <Image
                              src={product.thumbnail || product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white truncate">{product.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{product.category?.name || 'Sans catégorie'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell">
                      {product.sku || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-semibold ${
                        product.quantity > 10 ? 'text-emerald-600 dark:text-emerald-400' :
                        product.quantity > 0 ? 'text-amber-600 dark:text-amber-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                      {formatPrice(product.price)}
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <AdminBadge
                        variant={
                          product.status === 'ACTIVE' ? 'success' :
                          product.status === 'DRAFT' ? 'default' :
                          'danger'
                        }
                        dot
                      >
                        {product.status === 'ACTIVE' && 'Actif'}
                        {product.status === 'DRAFT' && 'Brouillon'}
                        {product.status === 'ARCHIVED' && 'Archivé'}
                      </AdminBadge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {store?.slug && (
                          <Link href={`/${locale}/stores/${store.slug}/products/${product.slug}`} target="_blank">
                            <AdminButton variant="ghost" size="sm" className="hidden sm:flex">
                              <Eye className="w-4 h-4" />
                            </AdminButton>
                          </Link>
                        )}
                        <Link href={`${basePath}/products/${product.id}/edit`}>
                          <AdminButton variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </AdminButton>
                        </Link>
                        <AdminButton
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
                              deleteProduct.mutate({ id: product.id })
                            }
                          }}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </AdminButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  )
}
