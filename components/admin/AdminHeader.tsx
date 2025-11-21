'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Bell, User, LogOut, Shield, Search, ChevronDown, Eye, Settings, HelpCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import StoreSelector from './StoreSelector'
import { useStoreContext } from '@/lib/context/store-context'
import { trpc } from '@/lib/trpc/client'

export function AdminHeader() {
  const { data: session } = useSession()
  const { isSuperAdmin, storeId, storeName } = useStoreContext()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  // Get store for preview link
  const { data: store } = trpc.store.getById.useQuery(
    { id: storeId! },
    { enabled: !!storeId }
  )

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Store info */}
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{storeName || 'Tableau de bord'}</h2>
              <p className="text-sm text-gray-500">Administration</p>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {/* Search (placeholder) */}
            <button className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-500 transition-colors">
              <Search className="w-4 h-4" />
              <span>Rechercher...</span>
              <kbd className="hidden xl:inline px-2 py-0.5 text-xs bg-white border border-gray-300 rounded">⌘K</kbd>
            </button>

            {/* Super Admin Link */}
            {isSuperAdmin && (
              <Link href="/superadmin">
                <Button variant="outline" size="sm" className="border-purple-300 text-purple-600 hover:bg-purple-50">
                  <Shield className="w-4 h-4 mr-2" />
                  Super Admin
                </Button>
              </Link>
            )}

            {/* Store Selector */}
            <StoreSelector />

            {/* View Store Link */}
            {store?.slug && (
              <Link
                href={`/stores/${store.slug}`}
                target="_blank"
                className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Voir la boutique</span>
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
                {/* Notification badge */}
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
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
                      <div className="p-4 text-center text-gray-500 text-sm">
                        <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        Aucune nouvelle notification
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
                className="flex items-center gap-2 pl-3 pr-2 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || session?.user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 max-w-[120px] truncate">
                    {session?.user?.name || session?.user?.email?.split('@')[0]}
                  </p>
                  {isSuperAdmin ? (
                    <p className="text-xs text-purple-600 font-semibold">SUPER ADMIN</p>
                  ) : (
                    <p className="text-xs text-gray-500">Admin</p>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{session?.user?.name}</p>
                      <p className="text-sm text-gray-500 truncate">{session?.user?.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/account"
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        Mon compte
                      </Link>
                      <Link
                        href="/admin/settings"
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Paramètres
                      </Link>
                      <a
                        href="https://github.com/StudioCavalli/FoxCard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <HelpCircle className="w-4 h-4" />
                        Documentation
                      </a>
                    </div>
                    <div className="p-2 border-t border-gray-100">
                      <button
                        onClick={() => signOut({ callbackUrl: '/auth/login' })}
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
