import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'

export function useProductsCRUD(storeId: string | null) {
  const [searchQuery, setSearchQuery] = useState('')

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

  const handleDelete = (productId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      deleteProduct.mutate({ id: productId, storeId: storeId! })
    }
  }

  // Stats derived from products
  const activeCount = products.filter(p => p.status === 'ACTIVE').length
  const draftCount = products.filter(p => p.status === 'DRAFT').length
  const lowStockCount = products.filter(p => p.quantity <= 5 && p.quantity > 0).length
  const outOfStockCount = products.filter(p => p.quantity === 0).length

  return {
    products,
    filteredProducts,
    isLoading,
    searchQuery,
    setSearchQuery,
    handleDelete,
    deleteProduct,
    // Stats
    activeCount,
    draftCount,
    lowStockCount,
    outOfStockCount,
  }
}
