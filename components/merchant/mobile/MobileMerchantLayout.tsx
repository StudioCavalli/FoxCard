'use client'

import { ReactNode, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { MobileBottomNav } from './MobileBottomNav'
import { QuickActionsButton } from './QuickActionsButton'
import { MobilePullToRefresh } from './MobileDashboardWidgets'

interface MobileMerchantLayoutProps {
  children: ReactNode
  pendingOrders?: number
  unreadMessages?: number
  showQuickActions?: boolean
  onRefresh?: () => Promise<void>
  className?: string
}

export function MobileMerchantLayout({
  children,
  pendingOrders = 0,
  unreadMessages = 0,
  showQuickActions = true,
  onRefresh,
  className
}: MobileMerchantLayoutProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      setIsRefreshing(true)
      await onRefresh()
      setIsRefreshing(false)
    }
  }, [onRefresh])

  return (
    <div className={cn(
      "min-h-screen bg-gray-50 dark:bg-gray-950 md:hidden",
      className
    )}>
      {/* Main Content Area with Pull to Refresh */}
      {onRefresh ? (
        <MobilePullToRefresh onRefresh={handleRefresh}>
          <main className="pb-20">
            {children}
          </main>
        </MobilePullToRefresh>
      ) : (
        <main className="pb-20 overflow-y-auto">
          {children}
        </main>
      )}

      {/* Quick Actions FAB */}
      {showQuickActions && <QuickActionsButton />}

      {/* Bottom Navigation */}
      <MobileBottomNav
        pendingOrders={pendingOrders}
        unreadMessages={unreadMessages}
      />
    </div>
  )
}

interface MobilePageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export function MobilePageHeader({ title, subtitle, action, className }: MobilePageHeaderProps) {
  return (
    <div className={cn(
      "sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800",
      "px-4 py-3 safe-area-top",
      className
    )}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  )
}

interface MobileCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function MobileCard({ children, className, onClick }: MobileCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-2xl",
        "border border-gray-100 dark:border-gray-700",
        onClick && "active:scale-[0.98] transition-transform cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  )
}

interface MobileSectionProps {
  title?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function MobileSection({ title, action, children, className }: MobileSectionProps) {
  return (
    <section className={cn("px-4", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-3">
          {title && (
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

interface MobileEmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function MobileEmptyState({ icon, title, description, action }: MobileEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {description}
        </p>
      )}
      {action}
    </div>
  )
}

interface MobileListItemProps {
  icon?: ReactNode
  title: string
  subtitle?: string
  value?: string | ReactNode
  badge?: string | number
  badgeColor?: 'orange' | 'blue' | 'green' | 'red' | 'gray'
  chevron?: boolean
  onClick?: () => void
}

const badgeColors = {
  orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
}

export function MobileListItem({
  icon,
  title,
  subtitle,
  value,
  badge,
  badgeColor = 'gray',
  chevron = true,
  onClick
}: MobileListItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
    >
      {icon && (
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="flex-1 text-left">
        <p className="font-medium text-gray-900 dark:text-white">
          {title}
        </p>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
      {badge !== undefined && (
        <span className={cn(
          "px-2 py-0.5 rounded-full text-xs font-medium",
          badgeColors[badgeColor]
        )}>
          {badge}
        </span>
      )}
      {value && typeof value === 'string' ? (
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {value}
        </span>
      ) : value}
      {chevron && (
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  )
}

interface MobileSkeletonProps {
  variant?: 'card' | 'list' | 'stat'
  count?: number
}

export function MobileSkeleton({ variant = 'card', count = 1 }: MobileSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i)

  if (variant === 'stat') {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
        {items.map((i) => (
          <div key={i} className="flex-1 min-w-[140px] p-4 rounded-2xl bg-white dark:bg-gray-800 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 mb-2" />
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl divide-y divide-gray-100 dark:divide-gray-700">
        {items.map((i) => (
          <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      ))}
    </div>
  )
}
