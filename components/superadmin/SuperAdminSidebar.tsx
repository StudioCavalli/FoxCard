'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/superadmin', icon: LayoutDashboard },
  { name: 'Boutiques', href: '/superadmin/stores', icon: Store },
  { name: 'Appels', href: '/superadmin/appeals', icon: Gavel },
  { name: 'Utilisateurs', href: '/superadmin/users', icon: Users },
  { name: 'Commandes', href: '/superadmin/orders', icon: ShoppingCart },
  { name: 'Analytics', href: '/superadmin/analytics', icon: BarChart3 },
  { name: 'Activité', href: '/superadmin/activity', icon: Activity },
  { name: 'Rôles', href: '/superadmin/roles', icon: UserCog },
  { name: 'Support', href: '/superadmin/support', icon: MessageSquare },
  { name: 'Paramètres', href: '/superadmin/settings', icon: Settings },
]

export function SuperAdminSidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 px-4 mb-8">
        <Shield className="w-8 h-8 text-purple-200" />
        <span className="ml-3 text-xl font-bold text-white">Super Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-purple-800 text-white'
                  : 'text-purple-100 hover:bg-purple-800/50 hover:text-white'
              }`}
            >
              <item.icon
                className={`mr-3 flex-shrink-0 h-5 w-5 ${
                  isActive ? 'text-white' : 'text-purple-300'
                }`}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 flex border-t border-purple-800 p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-200" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Platform Admin</p>
            <p className="text-xs text-purple-300">Super Admin</p>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-purple-900 text-white shadow-lg"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-5 bg-gradient-to-b from-purple-900 to-indigo-900 overflow-y-auto">
          <NavContent />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-gradient-to-b from-purple-900 to-indigo-900 overflow-y-auto">
          <NavContent />
        </div>
      </div>
    </>
  )
}
