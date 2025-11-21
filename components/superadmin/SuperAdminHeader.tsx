'use client'

import { useSession, signOut } from 'next-auth/react'
import { Bell, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function SuperAdminHeader() {
  const { data: session } = useSession()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Administration Plateforme
          </h2>
          <p className="text-sm text-gray-600">
            Gestion globale de FoxCard
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{session?.user?.name || session?.user?.email}</p>
              <p className="text-xs text-purple-600 font-semibold">SUPER ADMIN</p>
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
