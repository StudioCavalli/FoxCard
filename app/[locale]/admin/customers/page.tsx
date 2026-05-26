'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatPrice, formatDate } from '@/lib/utils'
import { Mail, Calendar, ShoppingBag, Search, Trash2 } from 'lucide-react'
import { useStoreContext } from '@/lib/context/store-context'
import { useCustomersCRUD } from '@/hooks/useCustomersCRUD'

export default function AdminCustomersPage() {
  const { storeId } = useStoreContext()

  const {
    customers,
    filteredCustomers,
    isLoading,
    searchQuery,
    setSearchQuery,
    handleDelete,
    totalRevenue,
    totalOrders,
    avgOrderValue,
  } = useCustomersCRUD(storeId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
        <p className="text-gray-600">Gerez votre base de clients</p>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>
        </div>
      </Card>

      {/* Customers Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">Chargement des clients...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchQuery ? 'Aucun client trouve' : 'Aucun client'}
              </h3>
              <p className="text-gray-600">
                {searchQuery
                  ? 'Essayez une autre recherche'
                  : 'Les clients seront automatiquement crees lorsque des commandes seront passees'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Client</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Commandes</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total depense</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Depuis</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {customer.firstName || customer.lastName
                            ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
                            : 'Client'}
                        </p>
                        {customer.phone && (
                          <p className="text-sm text-gray-600">{customer.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{customer.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {customer._count.orders} commande{customer._count.orders > 1 ? 's' : ''}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                      {formatPrice(customer.totalSpent)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDate(customer.createdAt)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(customer.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Stats */}
      {customers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="teal" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total clients</p>
                <p className="text-3xl font-bold text-gray-900">{customers.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>

          <Card variant="pink" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Revenu total</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatPrice(totalRevenue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-secondary-600" />
              </div>
            </div>
          </Card>

          <Card variant="yellow" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Panier moyen</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatPrice(avgOrderValue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
