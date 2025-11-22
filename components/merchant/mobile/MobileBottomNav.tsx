'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Settings,
  MoreHorizontal,
  Store,
  BarChart3,
  MessageSquare,
  type LucideIcon
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { useStoreContext } from '@/lib/context/store-context'
import { useStoreCommerceType } from '@/lib/commerce-types/hooks'
import {
  getNavigationForCommerceType,
  isNavGroup,
  type NavItem as NavConfigItem,
} from '@/lib/merchant/navigation-config'

interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  href: string
  badge?: number
}

interface MobileBottomNavProps {
  pendingOrders?: number
  unreadMessages?: number
}

export function MobileBottomNav({ pendingOrders = 0, unreadMessages = 0 }: MobileBottomNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations()
  const [showMore, setShowMore] = useState(false)
  const { storeId } = useStoreContext()
  const { type: commerceType } = useStoreCommerceType(storeId || undefined)

  const basePath = `/${locale}/merchant`

  // Get adaptive navigation based on commerce type
  const navigation = useMemo(() => {
    return getNavigationForCommerceType(commerceType || 'GENERAL')
  }, [commerceType])

  // Extract main navigation items (first 4 relevant items + more)
  const { mainItems, moreItems } = useMemo(() => {
    const flatItems: NavItem[] = []

    // Always start with dashboard
    flatItems.push({
      id: 'dashboard',
      label: t('merchant.navigation.dashboard'),
      icon: LayoutDashboard,
      href: basePath,
    })

    // Extract key items from navigation config
    navigation.forEach((item) => {
      if (isNavGroup(item)) {
        // Get first item from each group for main nav
        item.items.forEach((subItem) => {
          flatItems.push({
            id: subItem.key,
            label: t(subItem.labelKey),
            icon: subItem.icon,
            href: `${basePath}${subItem.href}`,
            badge: subItem.key === 'orders' ? pendingOrders : undefined,
          })
        })
      } else if (item.key !== 'dashboard') {
        flatItems.push({
          id: item.key,
          label: t(item.labelKey),
          icon: item.icon,
          href: `${basePath}${item.href}`,
        })
      }
    })

    // Main items: dashboard + 3 most important items + more button
    const priorityKeys = ['orders', 'products', 'customers', 'reservations', 'rooms', 'menu', 'activities', 'wines', 'downloads']
    const mainNavItems = [flatItems[0]] // dashboard

    for (const key of priorityKeys) {
      const item = flatItems.find(i => i.id === key || i.id === key.replace('s', ''))
      if (item && !mainNavItems.find(m => m.id === item.id)) {
        mainNavItems.push(item)
        if (mainNavItems.length >= 4) break
      }
    }

    // Add more button
    mainNavItems.push({
      id: 'more',
      label: t('merchant.nav.more'),
      icon: MoreHorizontal,
      href: '#more',
    })

    // More items: rest of the items
    const mainIds = mainNavItems.map(m => m.id)
    const moreNavItems = flatItems.filter(i => !mainIds.includes(i.id)).slice(0, 5)

    // Always include settings and analytics in more
    if (!moreNavItems.find(i => i.id === 'store')) {
      moreNavItems.push({
        id: 'store',
        label: t('merchant.navigation.store'),
        icon: Store,
        href: `${basePath}/store`,
      })
    }
    if (!moreNavItems.find(i => i.id === 'analytics' && !moreNavItems.find(i => i.id === 'overview'))) {
      moreNavItems.push({
        id: 'analytics',
        label: t('merchant.navigation.analytics'),
        icon: BarChart3,
        href: `${basePath}/analytics`,
      })
    }
    if (!moreNavItems.find(i => i.id === 'settings' && !moreNavItems.find(i => i.id === 'general'))) {
      moreNavItems.push({
        id: 'settings',
        label: t('merchant.navigation.settings'),
        icon: Settings,
        href: `${basePath}/settings`,
      })
    }

    return {
      mainItems: mainNavItems.slice(0, 5),
      moreItems: moreNavItems.slice(0, 5),
    }
  }, [navigation, t, basePath, pendingOrders])

  const isActive = (href: string) => {
    if (href === '#more') return showMore
    return pathname.startsWith(href)
  }

  const handleNavClick = (item: NavItem) => {
    if (item.id === 'more') {
      setShowMore(!showMore)
    } else {
      setShowMore(false)
      router.push(item.href)
    }
  }

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More Menu Panel */}
      <div
        className={cn(
          "fixed bottom-16 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 md:hidden",
          "transform transition-transform duration-300 ease-out",
          showMore ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="grid grid-cols-5 gap-1 p-3">
          {moreItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={cn(
                "flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all",
                isActive(item.href)
                  ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium truncate max-w-full">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 md:hidden safe-area-bottom">
        <div className="grid grid-cols-5 h-16">
          {mainItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95",
                isActive(item.href)
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-gray-500 dark:text-gray-400"
              )}
            >
              <div className="relative">
                <item.icon className={cn(
                  "w-6 h-6 transition-transform",
                  isActive(item.href) && "scale-110"
                )} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                isActive(item.href) && "font-semibold"
              )}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
