import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'

export function useOrdersManagement(storeId: string | null) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [refundModalOpen, setRefundModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')

  const { data, isLoading, refetch } = trpc.order.getAll.useQuery(
    {
      storeId: storeId!,
      limit: 50,
    },
    {
      enabled: !!storeId,
    }
  )

  const refundMutation = trpc.payment.refundPayment.useMutation({
    onSuccess: () => {
      alert('Remboursement effectué avec succès')
      setRefundModalOpen(false)
      setSelectedOrder(null)
      setRefundAmount('')
      setRefundReason('')
      refetch()
    },
    onError: (error) => {
      alert(`Erreur: ${error.message}`)
    },
  })

  const handleRefund = () => {
    if (!selectedOrder) return

    const isPartial = refundAmount && parseFloat(refundAmount) > 0
    const amount = isPartial ? parseFloat(refundAmount) : undefined

    if (isPartial && isNaN(amount!)) {
      alert('Invalid refund amount')
      return
    }

    if (isPartial && amount! > selectedOrder.total) {
      alert('Le montant du remboursement ne peut pas dépasser le total de la commande')
      return
    }

    if (confirm(
      `Confirmez-vous le remboursement ${isPartial ? 'partiel de ' + amount + '€' : 'total de ' + selectedOrder.total + '€'} pour la commande #${selectedOrder.orderNumber} ?`
    )) {
      refundMutation.mutate({
        orderId: selectedOrder.id,
        amount,
        reason: refundReason || undefined,
      })
    }
  }

  const openRefundModal = (order: any) => {
    setSelectedOrder(order)
    setRefundModalOpen(true)
  }

  const closeRefundModal = () => {
    setRefundModalOpen(false)
    setSelectedOrder(null)
    setRefundAmount('')
    setRefundReason('')
  }

  const orders = data?.orders || []

  // Filter orders by search query and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchQuery ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = !statusFilter || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Stats derived from orders
  const pendingCount = orders.filter(o => o.status === 'PENDING').length
  const processingCount = orders.filter(o => o.status === 'PROCESSING').length
  const completedCount = orders.filter(o => o.status === 'COMPLETED').length
  const cancelledCount = orders.filter(o => o.status === 'CANCELLED').length

  return {
    // Data
    orders,
    filteredOrders,
    isLoading,
    // Search & filters
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    // Refund modal state
    refundModalOpen,
    selectedOrder,
    refundAmount,
    setRefundAmount,
    refundReason,
    setRefundReason,
    // Refund actions
    handleRefund,
    openRefundModal,
    closeRefundModal,
    refundMutation,
    // Stats
    pendingCount,
    processingCount,
    completedCount,
    cancelledCount,
  }
}
