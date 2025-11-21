'use client'

/**
 * Customers Management Page - Gestion des clients crsdpay
 */

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { ArrowLeft, Search, User, CreditCard, DollarSign } from 'lucide-react'
import Link from 'next/link'

export default function CustomersPage() {
  const [storeId, setStoreId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [offset, setOffset] = useState(0)
  const limit = 20

  useEffect(() => {
    const mockStoreId = '507f1f77bcf86cd799439011'
    setStoreId(mockStoreId)
  }, [])

  const { data, isLoading, refetch } = trpc.crsdpay.listCustomers.useQuery(
    {
      storeId,
      limit,
      offset,
    },
    { enabled: !!storeId }
  )

  const customers = data?.data || []
  const total = data?.pagination.total || 0
  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.floor(offset / limit) + 1

  const filteredCustomers = customers.filter((customer: any) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      customer.email.toLowerCase().includes(query) ||
      customer.firstName?.toLowerCase().includes(query) ||
      customer.lastName?.toLowerCase().includes(query)
    )
  })

  const handlePrevPage = () => {
    if (offset > 0) {
      setOffset(offset - limit)
    }
  }

  const handleNextPage = () => {
    if (offset + limit < total) {
      setOffset(offset + limit)
    }
  }

  if (isLoading || !storeId) {
    return (
      <div className="p-8">
        <div className="animate-pulse">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <Link href="/admin/crsdpay">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au dashboard
          </Button>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Clients</h1>
            <p className="text-gray-600">{total} clients au total</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher par email ou nom..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total clients</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Cartes enregistrées</p>
              <p className="text-2xl font-bold">
                {customers.reduce((sum: number, c: any) => sum + (c._count?.cards || 0), 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Transactions totales</p>
              <p className="text-2xl font-bold">
                {customers.reduce((sum: number, c: any) => sum + (c._count?.transactions || 0), 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Customers Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cartes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transactions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inscrit le
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucun client trouvé
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer: any) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.firstName && customer.lastName
                              ? `${customer.firstName} ${customer.lastName}`
                              : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {customer._count?.cards || 0} carte(s)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {customer._count?.transactions || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(customer.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link href={`/admin/crsdpay/customers/${customer.id}`}>
                        <Button variant="outline" size="sm">
                          Voir détails
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} sur {totalPages} • {total} clients au total
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrevPage}
                disabled={offset === 0}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={offset + limit >= total}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
