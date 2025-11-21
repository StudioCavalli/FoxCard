'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  Bell,
  User,
  LogOut,
  Search,
  ChevronDown,
  Eye,
  Settings,
  HelpCircle,
  ExternalLink,
  Menu,
  Store
} from 'lucide-react'
import { useStoreContext } from '@/lib/context/store-context'
import { useSidebar } from '@/lib/context/sidebar-context'
import { trpc } from '@/lib/trpc/client'

export function MerchantHeader() {
  const { toggle } = useSidebar()
  const { data: session } = useSession()
  const { storeId, storeName } = useStoreContext()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const params = useParams()
  const locale = params?.locale || 'fr'

  // Get store for preview link
  const { data: store } = trpc.store.getById.useQuery(
    { id: storeId! },
    { enabled: !!storeId }
  )

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={toggle}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Page Title - shown on mobile */}
            <div className="lg:hidden">
              <h2 className="text-lg font-semibold text-gray-900">{storeName || 'Ma Boutique'}</h2>
            </div>

            {/* Search - Desktop */}
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-500 transition-colors cursor-pointer min-w-[280px]">
              <Search className="w-4 h-4" />
              <span>Rechercher produits, commandes...</span>
              <kbd className="ml-auto px-2 py-0.5 text-xs bg-white border border-gray-300 rounded">⌘K</kbd>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* View Store Link */}
            {store?.slug && (
              <Link
                href={`/${locale}/stores/${store.slug}`}
                target="_blank"
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden md:inline">Voir la boutique</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-8 text-center text-gray-500 text-sm">
                        <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p>Aucune nouvelle notification</p>
                      </div>
                    </div>
                    <div className="p-3 border-t border-gray-100 bg-gray-50">
                      <button className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                        Voir toutes les notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-2 pr-2 lg:pr-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || session?.user?.email?.charAt(0)?.toUpperCase() || 'M'}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-900 max-w-[120px] truncate">
                    {session?.user?.name || session?.user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500">Marchand</p>
                </div>
                <ChevronDown className="hidden lg:block w-4 h-4 text-gray-400" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                      <p className="font-medium text-gray-900 truncate">{session?.user?.name}</p>
                      <p className="text-sm text-gray-500 truncate">{session?.user?.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        href={`/${locale}/account`}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        Mon compte
                      </Link>
                      <Link
                        href={`/${locale}/merchant/store`}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Store className="w-4 h-4" />
                        Ma boutique
                      </Link>
                      <Link
                        href={`/${locale}/merchant/settings`}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Paramètres
                      </Link>
                      <a
                        href="https://docs.foxcard.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <HelpCircle className="w-4 h-4" />
                        Aide
                      </a>
                    </div>
                    <div className="p-2 border-t border-gray-100">
                      <button
                        onClick={() => signOut({ callbackUrl: `/${locale}/auth/login` })}
                        className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
