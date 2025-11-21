'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { formatDate } from '@/lib/utils'
import {
  Users,
  Search,
  Shield,
  User,
  ChevronDown,
  Store
} from 'lucide-react'

export default function SuperAdminUsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'all'>('all')

  const { data, isLoading } = trpc.superadmin.getAllUsers.useQuery({
    limit: 50,
    offset: 0,
    search: search || undefined,
    role: roleFilter,
  })

  const updateRole = trpc.superadmin.updateUserRole.useMutation({
    onSuccess: () => {
      window.location.reload()
    },
  })

  const users = data?.users || []

  const handleRoleChange = async (userId: string, newRole: 'USER' | 'ADMIN' | 'SUPER_ADMIN') => {
    const reason = prompt(`Raison du changement de rôle:`)
    if (!reason) return

    if (confirm(`Confirmer le changement de rôle vers ${newRole}?`)) {
      await updateRole.mutateAsync({
        userId,
        role: newRole,
        reason,
      })
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800'
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
        <p className="text-gray-600">
          {data?.total || 0} utilisateur{(data?.total || 0) > 1 ? 's' : ''} sur la plateforme
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Tous les rôles</option>
            <option value="USER">Utilisateurs</option>
            <option value="ADMIN">Admins</option>
            <option value="SUPER_ADMIN">Super Admins</option>
          </select>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      )}

      {/* Users List */}
      {!isLoading && users.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucun utilisateur trouvé</p>
        </Card>
      )}

      {!isLoading && users.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {users.map((user) => (
            <Card key={user.id} className="p-6">
              <div className="flex items-start justify-between">
                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      {user.role === 'SUPER_ADMIN' ? (
                        <Shield className="w-6 h-6 text-white" />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">{user.name || 'Sans nom'}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600">Inscrit le</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(user.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Boutiques possédées</p>
                      <p className="text-sm font-medium text-gray-900">{user.stores.length}</p>
                    </div>
                  </div>

                  {/* Owned Stores */}
                  {user.stores.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 mb-2">Boutiques:</p>
                      <div className="flex flex-wrap gap-2">
                        {user.stores.map((store) => (
                          <div key={store.id} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                            <Store className="w-3 h-3" />
                            {store.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Store Access */}
                  {user.storeUsers.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-600 mb-2">Accès aux boutiques:</p>
                      <div className="flex flex-wrap gap-2">
                        {user.storeUsers.map((su) => (
                          <div key={su.id} className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            <Store className="w-3 h-3" />
                            {su.store.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="ml-4">
                  <div className="relative inline-block text-left">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                      className="px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium appearance-none cursor-pointer"
                      disabled={updateRole.isPending}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
