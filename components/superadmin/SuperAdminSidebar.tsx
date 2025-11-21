'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Store,
  Users,
  BarChart3,
  Settings,
  Shield,
  Activity
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/superadmin', icon: LayoutDashboard },
  { name: 'Boutiques', href: '/superadmin/stores', icon: Store },
  { name: 'Utilisateurs', href: '/superadmin/users', icon: Users },
  { name: 'Analytics', href: '/superadmin/analytics', icon: BarChart3 },
  { name: 'Activité', href: '/superadmin/activity', icon: Activity },
  { name: 'Paramètres', href: '/superadmin/settings', icon: Settings },
]

export function SuperAdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-gradient-to-b from-purple-900 to-indigo-900 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4 mb-8">
          <Shield className="w-8 h-8 text-purple-200" />
          <span className="ml-3 text-xl font-bold text-white">Super Admin</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
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
      </div>
    </div>
  )
}
