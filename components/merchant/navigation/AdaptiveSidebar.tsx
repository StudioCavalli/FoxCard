'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, X, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/lib/context/sidebar-context'
import { useStoreContext } from '@/lib/context/store-context'
import { useStoreCommerceType } from '@/lib/commerce-types/hooks'
import { StoreSelector } from '../StoreSelector'
import {
  getNavigationForCommerceType,
  isNavGroup,
  type NavItem,
  type NavGroup,
  type NavigationConfig,
} from '@/lib/merchant/navigation-config'
import { useTranslations } from 'next-intl'
import { commerceTypeConfigs, type CommerceType } from '@/lib/commerce-types'

export function AdaptiveSidebar() {
  const { isOpen, close } = useSidebar()
  const { storeId } = useStoreContext()
  const { type: commerceType, isLoading } = useStoreCommerceType(storeId || undefined)
  const params = useParams()
  const pathname = usePathname()
  const t = useTranslations()
  const locale = params?.locale || 'sk'

  const basePath = `/${locale}/merchant`
  const navigation = getNavigationForCommerceType(commerceType || 'GENERAL')
  const config = commerceType ? commerceTypeConfigs[commerceType] : null

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col overflow-hidden transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Store Selector */}
        <div className="p-3 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <StoreSelector onSelect={close} />
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={close}
              className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Commerce Type Badge */}
          {config && !isLoading && (
            <div className="mt-2 flex items-center gap-2 px-2 py-1.5 bg-slate-800/50 rounded-lg">
              <span className="text-lg">{config.emoji}</span>
              <span className="text-xs text-slate-400 truncate">{config.name}</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 bg-slate-800/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            navigation.map((item) =>
              isNavGroup(item) ? (
                <NavGroupComponent
                  key={item.key}
                  group={item}
                  basePath={basePath}
                  pathname={pathname}
                  onItemClick={close}
                  t={t}
                />
              ) : (
                <NavItemComponent
                  key={item.key}
                  item={item}
                  basePath={basePath}
                  pathname={pathname}
                  onClick={close}
                  t={t}
                />
              )
            )
          )}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900">
          <Link
            href={`/${locale}`}
            target="_blank"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-sm"
          >
            <Eye className="w-4 h-4" />
            <span>{t('merchant.navigation.viewStore')}</span>
          </Link>
        </div>
      </aside>
    </>
  )
}

interface NavItemComponentProps {
  item: NavItem
  basePath: string
  pathname: string
  onClick?: () => void
  t: ReturnType<typeof useTranslations>
  nested?: boolean
}

function NavItemComponent({
  item,
  basePath,
  pathname,
  onClick,
  t,
  nested = false,
}: NavItemComponentProps) {
  const href = `${basePath}${item.href}`
  const isActive = pathname === href || (item.href === '' && pathname === basePath)

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
        nested && 'pl-10',
        isActive
          ? 'bg-indigo-600 text-white'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      )}
    >
      <item.icon className="w-4 h-4 flex-shrink-0" />
      <span className="truncate">{t(item.labelKey)}</span>
      {item.badge !== undefined && (
        <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-indigo-500/20 text-indigo-400 rounded-full">
          {item.badge}
        </span>
      )}
    </Link>
  )
}

interface NavGroupComponentProps {
  group: NavGroup
  basePath: string
  pathname: string
  onItemClick?: () => void
  t: ReturnType<typeof useTranslations>
}

function NavGroupComponent({
  group,
  basePath,
  pathname,
  onItemClick,
  t,
}: NavGroupComponentProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Auto-expand if any child is active
  useEffect(() => {
    const hasActiveChild = group.items.some(
      (item) => pathname === `${basePath}${item.href}`
    )
    if (hasActiveChild) {
      setIsExpanded(true)
    }
  }, [pathname, basePath, group.items])

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors text-slate-400 hover:bg-slate-800 hover:text-white'
        )}
      >
        <group.icon className="w-4 h-4 flex-shrink-0" />
        <span className="truncate flex-1 text-left">{t(group.labelKey)}</span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-1">
          {group.items.map((item) => (
            <NavItemComponent
              key={item.key}
              item={item}
              basePath={basePath}
              pathname={pathname}
              onClick={onItemClick}
              t={t}
              nested
            />
          ))}
        </div>
      )}
    </div>
  )
}
