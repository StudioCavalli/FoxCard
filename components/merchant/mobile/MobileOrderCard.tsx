'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { fr, enUS, de, es, sk } from 'date-fns/locale'
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  MoreVertical
} from 'lucide-react'

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  image?: string
}

interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  total: number
  currency: string
  createdAt: Date
  customer: {
    name: string
    email: string
    phone?: string
  }
  shippingAddress?: {
    city: string
    country: string
  }
  items: OrderItem[]
  itemCount: number
}

interface MobileOrderCardProps {
  order: Order
  onStatusChange?: (orderId: string, status: OrderStatus) => void
  onViewDetails?: (orderId: string) => void
}

const statusConfig: Record<OrderStatus, { icon: any; color: string; bgColor: string }> = {
  PENDING: {
    icon: Clock,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
  },
  PROCESSING: {
    icon: Package,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30'
  },
  SHIPPED: {
    icon: Truck,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30'
  },
  DELIVERED: {
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30'
  },
  CANCELLED: {
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30'
  }
}

const localeMap: Record<string, any> = {
  fr: fr,
  en: enUS,
  de: de,
  es: es,
  sk: sk
}

export function MobileOrderCard({ order, onStatusChange, onViewDetails }: MobileOrderCardProps) {
  const [swipeX, setSwipeX] = useState(0)
  const [isSwipeActive, setIsSwipeActive] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const touchStartX = useRef(0)
  const cardRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('merchant')

  const StatusIcon = statusConfig[order.status].icon

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    setIsSwipeActive(true)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwipeActive) return
    const currentX = e.touches[0].clientX
    const diff = currentX - touchStartX.current
    // Only allow left swipe (negative diff), max -120px
    const newX = Math.max(-120, Math.min(0, diff))
    setSwipeX(newX)
  }, [isSwipeActive])

  const handleTouchEnd = useCallback(() => {
    setIsSwipeActive(false)
    // If swiped more than 60px, keep actions visible
    if (swipeX < -60) {
      setSwipeX(-120)
      setShowActions(true)
    } else {
      setSwipeX(0)
      setShowActions(false)
    }
  }, [swipeX])

  const resetSwipe = () => {
    setSwipeX(0)
    setShowActions(false)
  }

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    onStatusChange?.(order.id, newStatus)
    resetSwipe()
  }

  const handleViewDetails = () => {
    resetSwipe()
    if (onViewDetails) {
      onViewDetails(order.id)
    } else {
      router.push(`/${locale}/merchant/orders/${order.id}`)
    }
  }

  const getNextStatus = (): OrderStatus | null => {
    switch (order.status) {
      case 'PENDING': return 'PROCESSING'
      case 'PROCESSING': return 'SHIPPED'
      case 'SHIPPED': return 'DELIVERED'
      default: return null
    }
  }

  const nextStatus = getNextStatus()

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Swipe Actions (revealed on swipe) */}
      <div className="absolute inset-y-0 right-0 flex items-stretch">
        {nextStatus && (
          <button
            onClick={() => handleStatusUpdate(nextStatus)}
            className={cn(
              "w-20 flex flex-col items-center justify-center gap-1",
              nextStatus === 'PROCESSING' && "bg-blue-500",
              nextStatus === 'SHIPPED' && "bg-purple-500",
              nextStatus === 'DELIVERED' && "bg-green-500"
            )}
          >
            {nextStatus === 'PROCESSING' && <Package className="w-5 h-5 text-white" />}
            {nextStatus === 'SHIPPED' && <Truck className="w-5 h-5 text-white" />}
            {nextStatus === 'DELIVERED' && <CheckCircle className="w-5 h-5 text-white" />}
            <span className="text-[10px] text-white font-medium">
              {t(`orders.status.${nextStatus.toLowerCase()}`)}
            </span>
          </button>
        )}
        <button
          onClick={() => handleStatusUpdate('CANCELLED')}
          className="w-20 bg-red-500 flex flex-col items-center justify-center gap-1"
        >
          <XCircle className="w-5 h-5 text-white" />
          <span className="text-[10px] text-white font-medium">
            {t('orders.cancel')}
          </span>
        </button>
      </div>

      {/* Main Card Content */}
      <div
        ref={cardRef}
        className={cn(
          "relative bg-white dark:bg-gray-800 p-4",
          "transform transition-transform duration-200 ease-out",
          !isSwipeActive && "transition-transform"
        )}
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={showActions ? resetSwipe : handleViewDetails}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              statusConfig[order.status].bgColor
            )}>
              <StatusIcon className={cn("w-5 h-5", statusConfig[order.status].color)} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                #{order.orderNumber}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(order.createdAt, {
                  addSuffix: true,
                  locale: localeMap[locale] || enUS
                })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900 dark:text-white">
              {formatCurrency(order.total, order.currency)}
            </p>
            <span className={cn(
              "inline-block px-2 py-0.5 rounded-full text-[10px] font-medium",
              statusConfig[order.status].bgColor,
              statusConfig[order.status].color
            )}>
              {t(`orders.status.${order.status.toLowerCase()}`)}
            </span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-medium text-gray-600 dark:text-gray-300">
              {order.customer.name.charAt(0).toUpperCase()}
            </div>
            <span className="truncate max-w-[120px]">{order.customer.name}</span>
          </div>
          {order.shippingAddress && (
            <div className="flex items-center gap-1 text-gray-400">
              <MapPin className="w-3 h-3" />
              <span className="text-xs">{order.shippingAddress.city}</span>
            </div>
          )}
        </div>

        {/* Items Preview */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {order.items.slice(0, 3).map((item, index) => (
              <div
                key={item.id}
                className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden"
                style={{ marginLeft: index > 0 ? '-8px' : 0, zIndex: 3 - index }}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
            {order.itemCount > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                +{order.itemCount - 3}
              </span>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>

        {/* Swipe Hint */}
        {!showActions && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-30">
            <div className="w-1 h-8 rounded-full bg-gray-400 dark:bg-gray-600" />
          </div>
        )}
      </div>
    </div>
  )
}
