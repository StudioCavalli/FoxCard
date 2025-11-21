'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Bell, Search, ChevronRight, Home, ExternalLink } from 'lucide-react'

// Map paths to readable names
const pathNames: Record<string, string> = {
  '/superadmin': 'Dashboard',
  '/superadmin/stores': 'Boutiques',
  '/superadmin/appeals': 'Appels',
  '/superadmin/users': 'Utilisateurs',
  '/superadmin/orders': 'Commandes',
  '/superadmin/analytics': 'Analytics',
  '/superadmin/activity': 'Activité',
  '/superadmin/roles': 'Rôles',
  '/superadmin/support': 'Support',
  '/superadmin/settings': 'Paramètres',
}

// Check if a segment looks like an ID (MongoDB ObjectId, UUID, or long alphanumeric)
const isIdSegment = (segment: string): boolean => {
  // MongoDB ObjectId (24 hex chars)
  if (/^[a-f0-9]{24}$/i.test(segment)) return true
  // UUID
  if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(segment)) return true
  // Long alphanumeric (likely an ID)
  if (/^[a-z0-9]{16,}$/i.test(segment)) return true
  return false
}

export function SuperAdminHeader() {
  const { data: session } = useSession()
  const pathname = usePathname()

  // Generate breadcrumbs
  const getBreadcrumbs = () => {
    if (!pathname) return []

    // Remove locale prefix
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '')
    const segments = pathWithoutLocale.split('/').filter(Boolean)

    const breadcrumbs: { name: string; href: string }[] = []
    let currentPath = ''

    segments.forEach((segment) => {
      currentPath += `/${segment}`

      // Skip ID segments in breadcrumbs (they'll be shown as part of the page content)
      if (isIdSegment(segment)) {
        return // Don't add ID to breadcrumbs
      }

      const name = pathNames[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1)
      breadcrumbs.push({ name, href: currentPath })
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  // Get the parent section name for pages with dynamic IDs
  const pathWithoutLocale = pathname?.replace(/^\/[a-z]{2}/, '') || ''
  const segments = pathWithoutLocale.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1] || ''
  const parentSection = segments.length > 1 ? segments[segments.length - 2] : ''

  // If last segment is an ID, use parent section name + "Détails"
  let pageTitle = breadcrumbs[breadcrumbs.length - 1]?.name || 'Dashboard'
  if (isIdSegment(lastSegment) && parentSection) {
    const parentName = pathNames[`/superadmin/${parentSection}`] || parentSection
    pageTitle = `Détails ${parentName.toLowerCase()}`
  }

  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/50 flex items-center pl-16 pr-4 lg:px-6 gap-4">
      {/* Breadcrumbs & Title */}
      <div className="flex-1 min-w-0">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mb-0.5">
          <Link
            href="/superadmin"
            className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-1">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              {index === breadcrumbs.length - 1 ? (
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
            placeholder="Rechercher..."
            className="w-64 pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-600 rounded border border-slate-200 dark:border-slate-500">
            /K
          </kbd>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* View Site Link */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Voir le site</span>
        </Link>

        {/* Notifications */}
        <button className="relative p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-3 pl-2 ml-2 border-l border-slate-200 dark:border-slate-700">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {session?.user?.name || 'Admin'}
            </p>
            <p className="text-xs text-violet-600 dark:text-violet-400 font-medium">
              Super Admin
            </p>
          </div>
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-violet-500/20">
            {session?.user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </header>
  )
}
