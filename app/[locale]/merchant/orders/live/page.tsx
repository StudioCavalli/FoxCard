'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import {
  Loader2,
  Clock,
  ChefHat,
  CheckCircle2,
  Bell,
  RefreshCw,
  Utensils,
  Package,
  Bike,
  Timer,
  Volume2,
  VolumeX,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED'

interface KitchenOrderItem {
  id: string
  name: string
  quantity: number
  variantName?: string | null
}

interface KitchenOrder {
  id: string
  orderNumber: string
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'
  tableNumber?: string
  items: KitchenOrderItem[]
  status: string
  createdAt: Date
  estimatedReady?: Date
  priority: number
  notes?: string
}

export default function LiveOrdersPage() {
  const t = useTranslations('merchant.restaurant.liveOrders')
  const tKds = useTranslations('merchant.restaurant.kds')
  const { storeId } = useStoreContext()
  const params = useParams()
  const locale = params?.locale || 'fr'
  const basePath = `/${locale}/merchant`

  const [soundEnabled, setSoundEnabled] = useState(true)
  const [lastOrderCount, setLastOrderCount] = useState(0)

  // Fetch kitchen orders with auto-refresh
  const { data: orders, isLoading, refetch } = trpc.restaurant.getKitchenOrders.useQuery(
    { storeId: storeId! },
    {
      enabled: !!storeId,
      refetchInterval: 5000, // Auto-refresh every 5 seconds
    }
  )

  // Update status mutation
  const updateStatusMutation = trpc.restaurant.updateKitchenStatus.useMutation({
    onSuccess: () => refetch(),
  })

  // Play sound for new orders
  useEffect(() => {
    if (orders && orders.length > lastOrderCount && soundEnabled && lastOrderCount > 0) {
      // Play notification sound
      const audio = new Audio('/sounds/notification.mp3')
      audio.play().catch(() => {}) // Ignore errors if sound doesn't exist
    }
    if (orders) {
      setLastOrderCount(orders.length)
    }
  }, [orders, lastOrderCount, soundEnabled])

  // Calculate time since order
  const getOrderAge = useCallback((createdAt: Date) => {
    const minutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
    if (minutes < 1) return 'À l\'instant'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    return `${hours}h${minutes % 60}m`
  }, [])

  // Get urgency level based on age
  const getUrgency = useCallback((createdAt: Date) => {
    const minutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
    if (minutes >= 20) return 'critical' // Red
    if (minutes >= 10) return 'warning' // Orange
    return 'normal' // Green
  }, [])

  // Handle status update
  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    if (!storeId) return
    updateStatusMutation.mutate({
      storeId,
      orderId,
      status: newStatus,
    })
  }

  // Group orders by status
  const pendingOrders = orders?.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED') || []
  const preparingOrders = orders?.filter(o => o.status === 'PREPARING') || []
  const readyOrders = orders?.filter(o => o.status === 'READY') || []

  // Order type icon
  const OrderTypeIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'DINE_IN':
        return <Utensils className="w-4 h-4" />
      case 'TAKEAWAY':
        return <Package className="w-4 h-4" />
      case 'DELIVERY':
        return <Bike className="w-4 h-4" />
      default:
        return <Utensils className="w-4 h-4" />
    }
  }

  // Order card component
  const OrderCard = ({ order, actions }: { order: KitchenOrder; actions: React.ReactNode }) => {
    const urgency = getUrgency(order.createdAt)
    const urgencyColors = {
      normal: 'border-l-emerald-500',
      warning: 'border-l-amber-500',
      critical: 'border-l-red-500 animate-pulse',
    }

    return (
      <div
        className={`bg-white dark:bg-slate-800 rounded-xl border-l-4 ${urgencyColors[urgency]} shadow-sm overflow-hidden`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                #{order.orderNumber}
              </span>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full text-xs text-slate-600 dark:text-slate-400">
                <OrderTypeIcon type={order.orderType} />
                <span>
                  {order.orderType === 'DINE_IN' && order.tableNumber
                    ? `Table ${order.tableNumber}`
                    : order.orderType === 'TAKEAWAY'
                    ? 'À emporter'
                    : 'Livraison'}
                </span>
              </div>
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              urgency === 'critical' ? 'text-red-600 dark:text-red-400 font-bold' :
              urgency === 'warning' ? 'text-amber-600 dark:text-amber-400' :
              'text-slate-500 dark:text-slate-400'
            }`}>
              <Timer className="w-4 h-4" />
              {getOrderAge(order.createdAt)}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="p-4 space-y-3">
          {order.items.map((item: any, index: number) => (
            <div key={index} className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400 rounded-full flex items-center justify-center text-sm font-bold">
                {item.quantity}
              </span>
              <div className="flex-1">
                <p className="text-slate-900 dark:text-white font-medium">{item.name}</p>
                {item.variantName && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.variantName}</p>
                )}
                {/* Restaurant Modifiers */}
                {item.modifiers && Array.isArray(item.modifiers) && item.modifiers.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {item.modifiers.map((mod: any, modIndex: number) => (
                      <p key={modIndex} className="text-xs text-emerald-600 dark:text-emerald-400">
                        + {mod.modifierName || mod.name}
                        {mod.price > 0 && ` (+${mod.price.toFixed(2)}€)`}
                      </p>
                    ))}
                  </div>
                )}
                {/* Special Instructions */}
                {item.specialInstructions && (
                  <div className="mt-1 px-2 py-1 bg-amber-50 dark:bg-amber-500/10 rounded text-xs text-amber-700 dark:text-amber-400">
                    ⚠️ {item.specialInstructions}
                  </div>
                )}
              </div>
            </div>
          ))}
          {order.notes && (
            <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-400">
                <span className="font-medium">Note:</span> {order.notes}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
          {actions}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {orders?.length || 0} commande(s) en cours
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AdminButton
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Désactiver le son' : 'Activer le son'}
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-400" />
            )}
          </AdminButton>
          <AdminButton
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </AdminButton>
          <Link href={`${basePath}/orders`}>
            <AdminButton variant="secondary" size="sm">
              Toutes les commandes
            </AdminButton>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      ) : !orders || orders.length === 0 ? (
        <AdminCard padding="lg">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Aucune commande en attente
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Les nouvelles commandes apparaîtront ici automatiquement
            </p>
          </div>
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: New Orders */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">{t('newOrders')}</h2>
                <p className="text-xs text-slate-500">{pendingOrders.length} commande(s)</p>
              </div>
            </div>
            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  actions={
                    <AdminButton
                      className="w-full"
                      onClick={() => handleStatusUpdate(order.id, 'PREPARING')}
                      disabled={updateStatusMutation.isPending}
                    >
                      <ChefHat className="w-4 h-4 mr-2" />
                      {tKds('startPreparing')}
                    </AdminButton>
                  }
                />
              ))}
              {pendingOrders.length === 0 && (
                <div className="p-6 text-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                  Aucune nouvelle commande
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Preparing */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-500/20 rounded-lg flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">{t('preparing')}</h2>
                <p className="text-xs text-slate-500">{preparingOrders.length} commande(s)</p>
              </div>
            </div>
            <div className="space-y-4">
              {preparingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  actions={
                    <AdminButton
                      className="w-full bg-emerald-500 hover:bg-emerald-600"
                      onClick={() => handleStatusUpdate(order.id, 'READY')}
                      disabled={updateStatusMutation.isPending}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {tKds('markReady')}
                    </AdminButton>
                  }
                />
              ))}
              {preparingOrders.length === 0 && (
                <div className="p-6 text-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                  Aucune commande en préparation
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Ready */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">{t('ready')}</h2>
                <p className="text-xs text-slate-500">{readyOrders.length} commande(s)</p>
              </div>
            </div>
            <div className="space-y-4">
              {readyOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  actions={
                    <AdminButton
                      variant="secondary"
                      className="w-full"
                      onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
                      disabled={updateStatusMutation.isPending}
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      {tKds('markDelivered')}
                    </AdminButton>
                  }
                />
              ))}
              {readyOrders.length === 0 && (
                <div className="p-6 text-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                  Aucune commande prête
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
