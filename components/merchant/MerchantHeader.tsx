'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import {
  Bell,
  User,
  LogOut,
  Search,
  ChevronDown,
  ChevronRight,
  Eye,
  Settings,
  HelpCircle,
  ExternalLink,
  Menu,
  Store,
  Home
} from 'lucide-react'
import { useStoreContext } from '@/lib/context/store-context'
import { useSidebar } from '@/lib/context/sidebar-context'
import { trpc } from '@/lib/trpc/client'
import { LanguageSelector } from '@/components/i18n/LanguageSelector'

// Map paths to readable names
const pathNames: Record<string, string> = {
  '/merchant': 'Dashboard',
  '/merchant/products': 'Produits',
  '/merchant/categories': 'Catégories',
  '/merchant/orders': 'Commandes',
  '/merchant/customers': 'Clients',
  '/merchant/analytics': 'Analytiques',
  '/merchant/settings': 'Paramètres',
  '/merchant/store': 'Ma Boutique',
  '/merchant/team': 'Équipe',
  '/merchant/themes': 'Thèmes',
  '/merchant/shipping': 'Livraison',
  '/merchant/taxes': 'Taxes',
  '/merchant/discounts': 'Réductions',
  '/merchant/warehouses': 'Entrepôts',
  '/merchant/emails': 'Emails',
  '/merchant/reports': 'Rapports',
  '/merchant/payments': 'Paiements',
  '/merchant/rooms': 'Chambres',
  '/merchant/reservations': 'Réservations',
  '/merchant/rates': 'Tarifs',
  '/merchant/seasons': 'Saisons',
}

// Check if a segment looks like an ID
const isIdSegment = (segment: string): boolean => {
  if (/^[a-f0-9]{24}$/i.test(segment)) return true
  if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(segment)) return true
  if (/^[a-z0-9]{16,}$/i.test(segment)) return true
  return false
}

export function MerchantHeader() {
  const { toggle } = useSidebar()
  const { data: session } = useSession()
  const { storeId, storeName } = useStoreContext()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const params = useParams()
  const pathname = usePathname()
  const locale = params?.locale || 'fr'
  const t = useTranslations('merchant')

  // Get store for preview link
  const { data: store } = trpc.store.getById.useQuery(
    { id: storeId! },
    { enabled: !!storeId }
  )

  // Generate breadcrumbs
  const getBreadcrumbs = () => {
    if (!pathname) return []

    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '')
    const segments = pathWithoutLocale.split('/').filter(Boolean)

    const breadcrumbs: { name: string; href: string }[] = []
    let currentPath = ''

    segments.forEach((segment) => {
      currentPath += `/${segment}`

      if (isIdSegment(segment)) return

      const name = pathNames[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1)
      breadcrumbs.push({ name, href: `/${locale}${currentPath}` })
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  // Get page title
  const pathWithoutLocale = pathname?.replace(/^\/[a-z]{2}/, '') || ''
  const segments = pathWithoutLocale.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1] || ''
  const parentSection = segments.length > 1 ? segments[segments.length - 2] : ''

  let pageTitle = breadcrumbs[breadcrumbs.length - 1]?.name || 'Dashboard'
  if (isIdSegment(lastSegment) && parentSection) {
    const parentName = pathNames[`/merchant/${parentSection}`] || parentSection
    pageTitle = `Détails ${parentName.toLowerCase()}`
  }

  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/50 flex items-center pl-16 pr-4 lg:px-6 gap-4 sticky top-0 z-20">
      {/* Mobile Menu Toggle */}
      <button
        onClick={toggle}
        className="lg:hidden absolute left-4 p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumbs & Title */}
      <div className="flex-1 min-w-0">
        {/* Breadcrumbs */}
        <nav className="hidden sm:flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mb-0.5">
          <Link
            href={`/${locale}/merchant`}
            className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
          </Link>
          {breadcrumbs.slice(1).map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-1">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              {index === breadcrumbs.length - 2 ? (
                <span className="text-slate-700 dark:text-slate-200 font-medium">{crumb.name}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  {crumb.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Page Title */}
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('header.search')}
            className="w-64 pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-600 rounded border border-slate-200 dark:border-slate-500">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* View Store Link */}
        {store?.slug && (
          <Link
            href={`/${locale}/stores/${store.slug}`}
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden lg:inline">{t('header.viewStore')}</span>
          </Link>
        )}

        {/* Language Selector */}
        <div className="hidden sm:block">
          <LanguageSelector variant="compact" />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{t('header.notifications')}</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                    <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p>{t('header.noNotifications')}</p>
                  </div>
                </div>
                <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <button className="w-full text-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                    {t('header.viewAllNotifications')}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Avatar & Menu */}
        <div className="relative">
          <div className="flex items-center gap-3 pl-2 ml-2 border-l border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[120px]">
                  {session?.user?.name || session?.user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                  {t('header.merchant')}
                </p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-primary-500/20">
                {session?.user?.name?.charAt(0)?.toUpperCase() || session?.user?.email?.charAt(0)?.toUpperCase() || 'M'}
              </div>
            </button>
          </div>

          {/* User Dropdown */}
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                  <p className="font-medium text-slate-900 dark:text-white truncate">{session?.user?.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{session?.user?.email}</p>
                </div>
                <div className="p-2">
                  <Link
                    href={`/${locale}/account`}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="w-4 h-4" />
                    {t('header.myAccount')}
                  </Link>
                  <Link
                    href={`/${locale}/merchant/store`}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Store className="w-4 h-4" />
                    {t('header.myStore')}
                  </Link>
                  <Link
                    href={`/${locale}/merchant/settings`}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="w-4 h-4" />
                    {t('header.settings')}
                  </Link>
                  <a
                    href="https://docs.foxcard.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                    {t('header.help')}
                  </a>
                </div>
                <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => signOut({ callbackUrl: `/${locale}/auth/login` })}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('header.logout')}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
