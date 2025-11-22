'use client'

import { useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users,
  Package,
  Euro,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Sparkles
} from 'lucide-react'

interface StatWidgetProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ComponentType<{ className?: string }>
  color: 'orange' | 'blue' | 'green' | 'purple'
  href?: string
}

const colorClasses = {
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-600 dark:text-orange-400',
    gradient: 'from-orange-500 to-orange-600'
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-500 to-blue-600'
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-600 dark:text-green-400',
    gradient: 'from-green-500 to-green-600'
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
    gradient: 'from-purple-500 to-purple-600'
  }
}

export function MobileStatWidget({ title, value, change, changeLabel, icon: Icon, color, href }: StatWidgetProps) {
  const router = useRouter()

  return (
    <button
      onClick={() => href && router.push(href)}
      className={cn(
        "flex-1 min-w-[140px] p-4 rounded-2xl bg-white dark:bg-gray-800",
        "border border-gray-100 dark:border-gray-700",
        "active:scale-95 transition-transform",
        "text-left"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          colorClasses[color].bg
        )}>
          <Icon className={cn("w-5 h-5", colorClasses[color].text)} />
        </div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-0.5 text-xs font-medium",
            change >= 0 ? "text-green-600" : "text-red-500"
          )}>
            {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">
        {value}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {title}
      </p>
    </button>
  )
}

interface RevenueChartWidgetProps {
  data: { day: string; value: number }[]
  total: number
  currency: string
  change: number
}

export function MobileRevenueChartWidget({ data, total, currency, change }: RevenueChartWidgetProps) {
  const locale = useLocale()
  const t = useTranslations('merchant')
  const maxValue = Math.max(...data.map(d => d.value))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount)
  }

  return (
    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-white/80 mb-1">{t('dashboard.revenue')}</p>
          <p className="text-3xl font-bold">{formatCurrency(total)}</p>
        </div>
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
          change >= 0 ? "bg-green-500/30 text-green-100" : "bg-red-500/30 text-red-100"
        )}>
          {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      </div>

      {/* Mini Chart */}
      <div className="flex items-end gap-1 h-16">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-white/30 rounded-sm transition-all"
              style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: '4px' }}
            />
            <span className="text-[9px] text-white/60">{item.day}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface RecentOrdersWidgetProps {
  orders: {
    id: string
    orderNumber: string
    customer: string
    total: number
    currency: string
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED'
  }[]
  onViewAll?: () => void
}

export function MobileRecentOrdersWidget({ orders, onViewAll }: RecentOrdersWidgetProps) {
  const t = useTranslations('merchant')
  const locale = useLocale()

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-500',
    PROCESSING: 'bg-blue-500',
    SHIPPED: 'bg-purple-500',
    DELIVERED: 'bg-green-500'
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {t('dashboard.recentOrders')}
        </h3>
        <button
          onClick={onViewAll}
          className="text-sm text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1"
        >
          {t('common.viewAll')}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-2 h-2 rounded-full",
                statusColors[order.status]
              )} />
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  #{order.orderNumber}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {order.customer}
                </p>
              </div>
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(order.total, order.currency)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

interface LowStockAlertProps {
  products: {
    id: string
    name: string
    stock: number
    image?: string
  }[]
  onViewProduct?: (id: string) => void
}

export function MobileLowStockAlert({ products, onViewProduct }: LowStockAlertProps) {
  const t = useTranslations('merchant')

  if (products.length === 0) return null

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
        <h3 className="font-semibold text-red-800 dark:text-red-200">
          {t('dashboard.lowStock')}
        </h3>
      </div>

      <div className="space-y-2">
        {products.slice(0, 3).map((product) => (
          <button
            key={product.id}
            onClick={() => onViewProduct?.(product.id)}
            className="w-full flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-gray-800 active:scale-98 transition-transform"
          >
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {product.name}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                {product.stock} {t('common.remaining')}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
}

export function MobilePullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const PULL_THRESHOLD = 80
  const MAX_PULL = 120

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return

    const currentY = e.touches[0].clientY
    const diff = currentY - startY.current

    if (diff > 0) {
      const distance = Math.min(diff * 0.5, MAX_PULL)
      setPullDistance(distance)
    }
  }, [isPulling, isRefreshing])

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true)
      setPullDistance(60)
      await onRefresh()
      setIsRefreshing(false)
    }
    setIsPulling(false)
    setPullDistance(0)
  }, [pullDistance, isRefreshing, onRefresh])

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto overscroll-contain"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull Indicator */}
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden transition-all",
          isRefreshing && "h-14"
        )}
        style={{ height: isRefreshing ? '56px' : `${pullDistance}px` }}
      >
        <div className={cn(
          "flex items-center gap-2 text-orange-600 dark:text-orange-400",
          isRefreshing && "animate-pulse"
        )}>
          <RefreshCw className={cn(
            "w-5 h-5 transition-transform",
            isRefreshing && "animate-spin"
          )} />
          <span className="text-sm font-medium">
            {isRefreshing ? 'Refreshing...' : pullDistance >= PULL_THRESHOLD ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </div>

      {children}
    </div>
  )
}

interface QuickStatsRowProps {
  stats: {
    revenue: { value: number; change: number; currency: string }
    orders: { value: number; change: number }
    customers: { value: number; change: number }
    products: { value: number }
  }
}

export function MobileQuickStatsRow({ stats }: QuickStatsRowProps) {
  const locale = useLocale()
  const t = useTranslations('merchant')
  const router = useRouter()
  const basePath = `/${locale}/merchant`

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount)
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
      <MobileStatWidget
        title={t('dashboard.revenue')}
        value={formatCurrency(stats.revenue.value, stats.revenue.currency)}
        change={stats.revenue.change}
        icon={Euro}
        color="orange"
        href={`${basePath}/analytics`}
      />
      <MobileStatWidget
        title={t('dashboard.orders')}
        value={stats.orders.value}
        change={stats.orders.change}
        icon={ShoppingBag}
        color="blue"
        href={`${basePath}/orders`}
      />
      <MobileStatWidget
        title={t('dashboard.customers')}
        value={stats.customers.value}
        change={stats.customers.change}
        icon={Users}
        color="green"
        href={`${basePath}/customers`}
      />
      <MobileStatWidget
        title={t('dashboard.products')}
        value={stats.products.value}
        icon={Package}
        color="purple"
        href={`${basePath}/products`}
      />
    </div>
  )
}
