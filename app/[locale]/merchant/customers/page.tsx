'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { trpc } from '@/lib/trpc/client'
import { formatPrice, formatDate } from '@/lib/utils'
import { Mail, Calendar, ShoppingBag, Search, Trash2, Users, DollarSign, TrendingUp, Eye } from 'lucide-react'
import { useStoreContext } from '@/lib/context/store-context'
import { useTranslations } from 'next-intl'

export default function MerchantCustomersPage() {
  const { storeId } = useStoreContext()
  const params = useParams()
  const locale = params?.locale || 'fr'
  const basePath = `/${locale}/merchant`
  const [searchQuery, setSearchQuery] = useState('')
  const t = useTranslations('merchant')

  const { data, isLoading, refetch } = trpc.customer.getAll.useQuery(
    {
      storeId: storeId!,
      limit: 50,
    },
    {
      enabled: !!storeId,
    }
  )

  const deleteCustomer = trpc.customer.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const customers = data?.customers || []
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)
  const totalOrders = customers.reduce((sum, c) => sum + c._count.orders, 0)
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('customers')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Gérez votre base de clients</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminCard padding="md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-primary-500/20 dark:from-primary-500/30 dark:to-primary-500/30 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total clients</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{customers.length}</p>
            </div>
          </div>
        </AdminCard>

        <AdminCard padding="md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-green-500/20 dark:from-emerald-500/30 dark:to-green-500/30 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Revenu total</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatPrice(totalRevenue)}</p>
            </div>
          </div>
        </AdminCard>

        <AdminCard padding="md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 dark:from-amber-500/30 dark:to-yellow-500/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Panier moyen</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatPrice(avgOrderValue)}</p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Search */}
      <AdminCard padding="md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>
      </AdminCard>

      {/* Customers Table */}
      <AdminCard padding="none">
        {isLoading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {searchQuery ? 'Aucun client trouvé' : 'Aucun client'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {searchQuery
                ? 'Essayez une autre recherche'
                : 'Les clients seront créés automatiquement lors des commandes'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('client')}</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('orders')}</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('total')}</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Depuis</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <Link href={`${basePath}/customers/${customer.id}`} className="flex items-center gap-3 hover:opacity-80">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-lg shadow-primary-500/20">
                          {customer.firstName?.charAt(0) || customer.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white truncate hover:text-primary-600 dark:hover:text-primary-400">
                            {customer.firstName || customer.lastName
                              ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
                              : 'Client'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate md:hidden">{customer.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {customer._count.orders}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">
                      {formatPrice(customer.totalSpent)}
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Calendar className="w-4 h-4" />
                        {formatDate(customer.createdAt)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`${basePath}/customers/${customer.id}`}>
                          <AdminButton variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </AdminButton>
                        </Link>
                        <AdminButton
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (
                              confirm(
                                'Êtes-vous sûr de vouloir supprimer ce client ? Cela supprimera également toutes ses commandes.'
                              )
                            ) {
                              deleteCustomer.mutate({ id: customer.id, storeId: storeId! })
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
