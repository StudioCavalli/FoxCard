'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { formatPrice } from '@/lib/utils'
import { Plus, Search, Edit, Trash2, Eye, Package, Filter, MoreVertical } from 'lucide-react'
import { useStoreContext } from '@/lib/context/store-context'

export default function MerchantProductsPage() {
  const { storeId } = useStoreContext()
  const [searchQuery, setSearchQuery] = useState('')
  const params = useParams()
  const locale = params?.locale || 'fr'
  const basePath = `/${locale}/merchant`

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
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <p className="text-gray-500 mt-1">Gérez votre catalogue de produits</p>
        </div>
        <Link href={`${basePath}/products/new`}>
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Produit
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total produits</p>
          <p className="text-2xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Actifs</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Stock faible</p>
          <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Rupture</p>
          <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom ou SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                  <div className="flex-1 h-4 bg-gray-200 rounded" />
                  <div className="w-20 h-4 bg-gray-200 rounded" />
                  <div className="w-16 h-4 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun produit</h3>
            <p className="text-gray-500 mb-4">Commencez par ajouter votre premier produit</p>
            <Link href={`${basePath}/products/new`}>
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un produit
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Produit</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">SKU</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prix</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Statut</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.thumbnail || product.images[0] ? (
                            <Image
                              src={product.thumbnail || product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-xs text-gray-500 truncate">{product.category?.name || 'Sans catégorie'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 hidden md:table-cell">
                      {product.sku || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-medium ${
                        product.quantity > 10 ? 'text-green-600' :
                        product.quantity > 0 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                      {formatPrice(product.price)}
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                        product.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        product.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {product.status === 'ACTIVE' && 'Actif'}
                        {product.status === 'DRAFT' && 'Brouillon'}
                        {product.status === 'ARCHIVED' && 'Archivé'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {store?.slug && (
                          <Link href={`/${locale}/stores/${store.slug}/products/${product.slug}`} target="_blank">
                            <Button variant="ghost" size="sm" className="hidden sm:flex">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                        <Link href={`${basePath}/products/${product.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
                              deleteProduct.mutate({ id: product.id })
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
