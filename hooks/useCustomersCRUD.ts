import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'

export function useCustomersCRUD(storeId: string | null) {
  const [searchQuery, setSearchQuery] = useState('')

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

  const handleDelete = (customerId: string) => {
    if (
      confirm(
        'Êtes-vous sûr de vouloir supprimer ce client ? Cela supprimera également toutes ses commandes.'
      )
    ) {
      deleteCustomer.mutate({ id: customerId, storeId: storeId! })
    }
  }

  // Stats derived from customers
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)
  const totalOrders = customers.reduce((sum, c) => sum + c._count.orders, 0)
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return {
    customers,
    filteredCustomers,
    isLoading,
    searchQuery,
    setSearchQuery,
    handleDelete,
    deleteCustomer,
    // Stats
    totalRevenue,
    totalOrders,
    avgOrderValue,
  }
}
