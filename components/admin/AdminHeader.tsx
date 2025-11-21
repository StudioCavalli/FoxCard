'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Bell, User, LogOut, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import StoreSelector from './StoreSelector'
import { useStoreContext } from '@/lib/context/store-context'

export function AdminHeader() {
  const { data: session } = useSession()
  const { isSuperAdmin } = useStoreContext()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tableau de bord</h2>
          <p className="text-gray-600">Gérez votre boutique en ligne</p>
        </div>

        <div className="flex items-center space-x-4">
          {isSuperAdmin && (
            <Link href="/superadmin">
              <Button variant="outline" size="sm">
                <Shield className="w-4 h-4 mr-2" />
                Super Admin
              </Button>
            </Link>
          )}

          <StoreSelector />

          <Button variant="ghost" size="sm">
            <Bell className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {session?.user?.name || session?.user?.email}
              </p>
              {isSuperAdmin && (
                <p className="text-xs text-purple-600 font-semibold">SUPER ADMIN</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
