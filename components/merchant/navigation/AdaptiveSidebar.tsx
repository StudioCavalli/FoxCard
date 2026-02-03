'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { ChevronDown, ChevronRight, ChevronLeft, X, Eye, LogOut, Menu } from 'lucide-react'
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
} from '@/lib/merchant/navigation-config'
import { useTranslations } from 'next-intl'
import { commerceTypeConfigs } from '@/lib/commerce-types'

export function AdaptiveSidebar() {
  const { isOpen, close } = useSidebar()
  const { storeId, storeName } = useStoreContext()
  const { data: session } = useSession()
  const { type: commerceType, isLoading } = useStoreCommerceType(storeId || undefined)
  const params = useParams()
  const pathname = usePathname()
  const t = useTranslations()
  const locale = params?.locale || 'fr'
  const [isCollapsed, setIsCollapsed] = useState(false)

  const basePath = `/${locale}/merchant`
  const navigation = getNavigationForCommerceType(commerceType || 'GENERAL')
  const config = commerceType ? commerceTypeConfigs[commerceType] : null

  const NavContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Store Selector Header */}
      <div className={cn(
        'p-3 border-b border-slate-700/50 sticky top-0 bg-slate-800 z-10',
        collapsed ? 'flex justify-center' : ''
      )}>
        {collapsed ? (
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <span className="text-lg">{config?.emoji || '🏪'}</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <StoreSelector onSelect={close} />
              </div>
              {/* Mobile Close Button */}
              <button
                onClick={close}
                className="lg:hidden p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Commerce Type Badge */}
            {config && !isLoading && (
              <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-slate-700/30 rounded-xl border border-slate-700/50">
                <span className="text-lg">{config.emoji}</span>
                <span className="text-xs text-slate-300 font-medium truncate">{config.name}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-slate-700/30 rounded-xl animate-pulse" />
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
                collapsed={collapsed}
              />
            ) : (
              <NavItemComponent
                key={item.key}
                item={item}
                basePath={basePath}
                pathname={pathname}
                onClick={close}
                t={t}
                collapsed={collapsed}
              />
            )
          )
        )}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-700/50 p-4">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-primary-500/20">
              {session?.user?.name?.charAt(0).toUpperCase() || 'M'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session?.user?.name || 'Marchand'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {storeName || 'Merchant'}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: `/${locale}/auth/login` })}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => signOut({ callbackUrl: `/${locale}/auth/login` })}
            className="w-full p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors flex justify-center"
            title="Déconnexion"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[105]"
          onClick={close}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-[106] w-72 transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-full bg-slate-800 border-r border-slate-700/50">
          <NavContent />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className={cn(
        'hidden lg:flex flex-col transition-all duration-300 overflow-visible',
        isCollapsed ? 'w-20' : 'w-72'
      )}>
        <div className="h-full bg-slate-800 border-r border-slate-700/50 relative overflow-visible">
          <NavContent collapsed={isCollapsed} />

          {/* Collapse Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-20 z-50 w-6 h-6 bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition-colors shadow-lg"
          >
            {isCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
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
  collapsed?: boolean
}

function NavItemComponent({
  item,
  basePath,
  pathname,
  onClick,
  t,
  nested = false,
  collapsed = false,
}: NavItemComponentProps) {
  const href = `${basePath}${item.href}`
  const isActive = pathname === href || (item.href === '' && pathname === basePath)

  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? t(item.labelKey) : undefined}
      className={cn(
        'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
        collapsed ? 'justify-center' : '',
        nested && !collapsed && 'ml-4',
        isActive
          ? 'bg-gradient-to-r from-primary-500/20 to-primary-500/20 text-white border border-primary-500/30 shadow-lg shadow-primary-500/10'
          : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
      )}
    >
      <div className={cn(
        'flex-shrink-0 flex items-center justify-center rounded-lg transition-all',
        nested ? 'w-7 h-7' : 'w-8 h-8',
        isActive ? 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-md' : ''
      )}>
        <item.icon className={cn(
          'transition-colors',
          nested ? 'w-4 h-4' : 'w-5 h-5',
          isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
        )} />
      </div>
      {!collapsed && (
        <>
          <span className={cn('truncate flex-1', isActive ? 'font-semibold' : '')}>{t(item.labelKey)}</span>
          {item.badge !== undefined && (
            <span className="px-2 py-0.5 text-xs font-medium bg-primary-500/20 text-primary-400 rounded-full">
              {item.badge}
            </span>
          )}
          {isActive && (
            <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" />
          )}
        </>
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
  collapsed?: boolean
}

function NavGroupComponent({
  group,
  basePath,
  pathname,
  onItemClick,
  t,
  collapsed = false,
}: NavGroupComponentProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Auto-expand if any child is active
  const hasActiveChild = group.items.some(
    (item) => pathname === `${basePath}${item.href}`
  )

  useEffect(() => {
    if (hasActiveChild) {
      setIsExpanded(true)
    }
  }, [hasActiveChild])

  // In collapsed mode, show items directly
  if (collapsed) {
    return (
      <div className="space-y-1">
        {group.items.map((item) => (
          <NavItemComponent
            key={item.key}
            item={item}
            basePath={basePath}
            pathname={pathname}
            onClick={onItemClick}
            t={t}
            collapsed={collapsed}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
          hasActiveChild
            ? 'text-white'
            : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
        )}
      >
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
          <group.icon className={cn(
            'w-5 h-5 transition-colors',
            hasActiveChild ? 'text-primary-400' : 'text-slate-500'
          )} />
        </div>
        <span className="truncate flex-1 text-left">{t(group.labelKey)}</span>
        <ChevronDown className={cn(
          'w-4 h-4 transition-transform duration-200',
          isExpanded ? 'rotate-180' : ''
        )} />
      </button>

      <div className={cn(
        'space-y-1 overflow-hidden transition-all duration-200',
        isExpanded ? 'max-h-96' : 'max-h-0'
      )}>
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
    </div>
  )
}
