'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Settings,
  Percent,
  Truck,
  Palette,
  Mail,
  FileText,
  Send,
  BarChart3,
  TrendingUp,
  Warehouse,
  MapPin,
  Eye,
  Box,
  X,
  Receipt,
  Store,
  CreditCard,
  Megaphone,
  TestTube,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Menu,
  LucideIcon
} from 'lucide-react'
import { StoreSelector } from './StoreSelector'
import { useSidebar } from '@/lib/context/sidebar-context'
import { useStoreContext } from '@/lib/context/store-context'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

interface NavGroup {
  title: string
  icon: LucideIcon
  items: NavItem[]
}

export function MerchantSidebar() {
  const { isOpen, close } = useSidebar()
  const { storeName } = useStoreContext()
  const { data: session } = useSession()
  const params = useParams()
  const pathname = usePathname()
  const locale = params?.locale || 'fr'
  const t = useTranslations()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Catalogue', 'Ventes'])

  const basePath = `/${locale}/merchant`

  // Remove locale prefix from pathname for comparison
  const pathnameWithoutLocale = pathname?.replace(/^\/[a-z]{2}(?=\/|$)/, '') || ''

  const isLinkActive = (href: string) => {
    const hrefWithoutLocale = href.replace(/^\/[a-z]{2}(?=\/|$)/, '')
    if (hrefWithoutLocale === '/merchant') {
      return pathnameWithoutLocale === '/merchant' || pathnameWithoutLocale === '/merchant/'
    }
    return pathnameWithoutLocale === hrefWithoutLocale || pathnameWithoutLocale.startsWith(hrefWithoutLocale + '/')
  }

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev =>
      prev.includes(title) ? prev.filter(g => g !== title) : [...prev, title]
    )
  }

  const navigation: (NavItem | NavGroup)[] = [
    { name: t('merchant.dashboard'), href: basePath, icon: LayoutDashboard },
    {
      title: 'Catalogue',
      icon: Package,
      items: [
        { name: t('merchant.products'), href: `${basePath}/products`, icon: Box },
        { name: t('common.categories'), href: `${basePath}/categories`, icon: FolderTree },
        { name: t('admin.warehouse'), href: `${basePath}/warehouses`, icon: Warehouse },
      ]
    },
    {
      title: 'Ventes',
      icon: ShoppingCart,
      items: [
        { name: t('merchant.orders'), href: `${basePath}/orders`, icon: Package },
        { name: t('merchant.customers'), href: `${basePath}/customers`, icon: Users },
        { name: t('common.cart'), href: `${basePath}/abandoned-carts`, icon: ShoppingCart },
        { name: t('admin.discounts'), href: `${basePath}/discounts`, icon: Percent },
      ]
    },
    {
      title: 'Livraison',
      icon: Truck,
      items: [
        { name: t('merchant.shippingZones'), href: `${basePath}/shipping`, icon: MapPin },
        { name: t('admin.taxes'), href: `${basePath}/taxes`, icon: Receipt },
      ]
    },
    {
      title: 'Marketing',
      icon: Megaphone,
      items: [
        { name: t('admin.emails'), href: `${basePath}/emails`, icon: Mail },
        { name: t('admin.reports'), href: `${basePath}/email-templates`, icon: FileText },
        { name: t('admin.newsletter'), href: `${basePath}/newsletter`, icon: Send },
        { name: 'A/B Testing', href: `${basePath}/ab-testing`, icon: TestTube },
      ]
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      items: [
        { name: t('merchant.analytics'), href: `${basePath}/analytics`, icon: TrendingUp },
        { name: t('admin.reports'), href: `${basePath}/reports`, icon: FileText },
      ]
    },
    {
      title: 'Paiements',
      icon: CreditCard,
      items: [
        { name: t('admin.payments'), href: `${basePath}/payments`, icon: CreditCard },
      ]
    },
    {
      title: 'Paramètres',
      icon: Settings,
      items: [
        { name: t('merchant.store'), href: `${basePath}/store`, icon: Store },
        { name: t('merchant.team'), href: `${basePath}/team`, icon: Users },
        { name: t('admin.themes'), href: `${basePath}/themes`, icon: Palette },
        { name: t('merchant.settings'), href: `${basePath}/settings`, icon: Settings },
      ]
    },
  ]

  const NavContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Store Selector Header */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-slate-700/50',
        collapsed ? 'justify-center' : ''
      )}>
        {collapsed ? (
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Store className="w-5 h-5 text-white" />
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <StoreSelector onSelect={close} />
          </div>
        )}
        {/* Mobile Close Button */}
        {!collapsed && (
          <button
            onClick={close}
            className="lg:hidden ml-2 p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          // Single nav item
          if ('href' in item) {
            const isActive = isLinkActive(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={close}
                title={collapsed ? item.name : undefined}
                className={cn(
                  'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-violet-500/20 to-indigo-500/20 text-white border border-violet-500/30 shadow-lg shadow-violet-500/10'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white',
                  collapsed ? 'justify-center' : ''
                )}
              >
                <div className={cn(
                  'flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all',
                  isActive ? 'bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md' : ''
                )}>
                  <item.icon className={cn(
                    'h-5 w-5 transition-colors',
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                  )} />
                </div>
                {!collapsed && <span className={cn('ml-3', isActive ? 'font-semibold' : '')}>{item.name}</span>}
                {!collapsed && isActive && (
                  <div className="ml-auto flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
                  </div>
                )}
              </Link>
            )
          }

          // Group nav item
          const isGroupExpanded = expandedGroups.includes(item.title) || collapsed
          const hasActiveChild = item.items.some(i => isLinkActive(i.href))

          return (
            <div key={item.title} className="space-y-1">
              {!collapsed ? (
                <button
                  onClick={() => toggleGroup(item.title)}
                  className={cn(
                    'w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
                    hasActiveChild
                      ? 'text-white'
                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                  )}
                >
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    <item.icon className={cn(
                      'h-5 w-5 transition-colors',
                      hasActiveChild ? 'text-violet-400' : 'text-slate-500'
                    )} />
                  </div>
                  <span className="ml-3">{item.title}</span>
                  <ChevronDown className={cn(
                    'ml-auto w-4 h-4 transition-transform duration-200',
                    isGroupExpanded ? 'rotate-180' : ''
                  )} />
                </button>
              ) : null}

              {/* Group items */}
              <div className={cn(
                'space-y-1 overflow-hidden transition-all duration-200',
                !collapsed && !isGroupExpanded ? 'max-h-0' : 'max-h-96',
                !collapsed ? 'ml-4' : ''
              )}>
                {item.items.map((subItem) => {
                  const isActive = isLinkActive(subItem.href)
                  return (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      onClick={close}
                      title={collapsed ? subItem.name : undefined}
                      className={cn(
                        'group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200',
                        isActive
                          ? 'bg-gradient-to-r from-violet-500/20 to-indigo-500/20 text-white border border-violet-500/30'
                          : 'text-slate-400 hover:bg-slate-700/50 hover:text-white',
                        collapsed ? 'justify-center' : ''
                      )}
                    >
                      <div className={cn(
                        'flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-all',
                        isActive ? 'bg-gradient-to-br from-violet-500 to-indigo-600' : ''
                      )}>
                        <subItem.icon className={cn(
                          'h-4 w-4 transition-colors',
                          isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                        )} />
                      </div>
                      {!collapsed && <span className={cn('ml-3', isActive ? 'font-semibold' : '')}>{subItem.name}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-700/50 p-4">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-violet-500/20">
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
      {/* Mobile Menu Button */}
      <button
        onClick={() => (isOpen ? close() : null)}
        className="lg:hidden fixed top-4 left-4 z-[110] p-2.5 rounded-xl bg-slate-800 text-white shadow-lg border border-slate-700 hidden"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

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
        'hidden lg:flex flex-col transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-72'
      )}>
        <div className="h-full bg-slate-800 border-r border-slate-700/50 relative">
          <NavContent collapsed={isCollapsed} />

          {/* Collapse Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-20 w-6 h-6 bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition-colors shadow-lg"
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
