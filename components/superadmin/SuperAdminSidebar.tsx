'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Store,
  Users,
  BarChart3,
  Settings,
  Shield,
  Activity,
  ShoppingCart,
  UserCog,
  MessageSquare,
  Menu,
  X,
  Gavel,
  ChevronLeft,
  LogOut,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/superadmin', icon: LayoutDashboard },
  { name: 'Boutiques', href: '/superadmin/stores', icon: Store },
  { name: 'Types Commerce', href: '/superadmin/commerce-types', icon: ShoppingBag },
  { name: 'Appels', href: '/superadmin/appeals', icon: Gavel },
  { name: 'Utilisateurs', href: '/superadmin/users', icon: Users },
  { name: 'Commandes', href: '/superadmin/orders', icon: ShoppingCart },
  { name: 'Analytics', href: '/superadmin/analytics', icon: BarChart3 },
  { name: 'Activite', href: '/superadmin/activity', icon: Activity },
  { name: 'Roles', href: '/superadmin/roles', icon: UserCog },
  { name: 'Support', href: '/superadmin/support', icon: MessageSquare },
  { name: 'Parametres', href: '/superadmin/settings', icon: Settings },
]

export function SuperAdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Remove locale prefix from pathname for comparison
  const pathnameWithoutLocale = pathname?.replace(/^\/[a-z]{2}(?=\/|$)/, '') || ''

  const isLinkActive = (href: string) => {
    // Exact match for dashboard
    if (href === '/superadmin') {
      return pathnameWithoutLocale === '/superadmin' || pathnameWithoutLocale === '/superadmin/'
    }
    // Starts with for other pages
    return pathnameWithoutLocale === href || pathnameWithoutLocale.startsWith(href + '/')
  }

  const NavContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-slate-700/50 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
          <Shield className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="ml-3">
            <span className="text-lg font-bold text-white tracking-tight">Super Admin</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = isLinkActive(item.href)

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              title={collapsed ? item.name : undefined}
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-primary-500/20 to-primary-500/20 text-white border border-primary-500/30 shadow-lg shadow-primary-500/10'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              {/* Fixed size icon container for consistent row height */}
              <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-md'
                  : ''
              }`}>
                <item.icon
                  className={`h-5 w-5 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
              </div>
              {!collapsed && <span className={`ml-3 ${isActive ? 'font-semibold' : ''}`}>{item.name}</span>}
              {!collapsed && isActive && (
                <div className="ml-auto flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" />
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-700/50 p-4">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
              {session?.user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session?.user?.name || 'Admin'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                Super Admin
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
              title="Deconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors flex justify-center"
            title="Deconnexion"
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
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-[110] p-2.5 rounded-xl bg-slate-800 text-white shadow-lg border border-slate-700"
      >
        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[105]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-[106] w-72 transform transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full bg-slate-800 border-r border-slate-700/50">
          <NavContent />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
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
