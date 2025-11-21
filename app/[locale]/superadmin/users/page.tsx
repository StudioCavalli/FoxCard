'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { formatDate } from '@/lib/utils'
import {
  Users,
  Search,
  Shield,
  User,
  UserPlus,
  Store,
  Ban,
  CheckCircle,
  XCircle,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react'

type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'all'
type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'all'

export default function SuperAdminUsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole>('all')
  const [statusFilter, setStatusFilter] = useState<UserStatus>('all')

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  // Form states
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'USER' as const })
  const [suspendReason, setSuspendReason] = useState('')

  const { data, isLoading, refetch } = trpc.superadmin.getAllUsers.useQuery({
    limit: 100,
    offset: 0,
    search: search || undefined,
    role: roleFilter,
    status: statusFilter,
  })

  const createUser = trpc.superadmin.createUser.useMutation({
    onSuccess: () => {
      setShowCreateModal(false)
      setNewUser({ name: '', email: '', password: '', role: 'USER' })
      refetch()
    },
  })

  const updateUserStatus = trpc.superadmin.updateUserStatus.useMutation({
    onSuccess: () => {
      setShowSuspendModal(false)
      setSelectedUser(null)
      setSuspendReason('')
      refetch()
    },
  })

  const updateUserRole = trpc.superadmin.updateUserRole.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const deleteUser = trpc.superadmin.deleteUser.useMutation({
    onSuccess: () => {
      setShowDeleteModal(false)
      setSelectedUser(null)
      refetch()
    },
  })

  const users = data?.users || []

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    createUser.mutate(newUser)
  }

  const handleSuspend = (user: any, action: 'SUSPENDED' | 'BANNED') => {
    setSelectedUser(user)
    setShowSuspendModal(true)
  }

  const confirmSuspend = (status: 'SUSPENDED' | 'BANNED') => {
    if (selectedUser) {
      updateUserStatus.mutate({
        userId: selectedUser.id,
        status,
        reason: suspendReason,
      })
    }
  }

  const handleReactivate = (userId: string) => {
    updateUserStatus.mutate({
      userId,
      status: 'ACTIVE',
    })
  }

  const handleRoleChange = (userId: string, newRole: 'USER' | 'ADMIN' | 'SUPER_ADMIN') => {
    const reason = prompt('Raison du changement de role:')
    if (reason) {
      updateUserRole.mutate({ userId, role: newRole, reason })
    }
  }

  const handleDelete = (user: any) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (selectedUser) {
      deleteUser.mutate({ userId: selectedUser.id })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Actif
          </span>
        )
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertTriangle className="w-3 h-3" />
            Suspendu
          </span>
        )
      case 'BANNED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <Ban className="w-3 h-3" />
            Banni
          </span>
        )
      default:
        return null
    }
  }

  const getRoleBadge = (role: string) => {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-500">{data?.total || 0} utilisateur(s) sur la plateforme</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Nouvel utilisateur
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-lg border text-left transition-all ${
            statusFilter === 'all'
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{data?.total || 0}</p>
        </button>

        <button
          onClick={() => setStatusFilter('ACTIVE')}
          className={`p-4 rounded-lg border text-left transition-all ${
            statusFilter === 'ACTIVE'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <p className="text-sm text-gray-500">Actifs</p>
          <p className="text-2xl font-bold text-green-600">{data?.statusCounts?.active || 0}</p>
        </button>

        <button
          onClick={() => setStatusFilter('SUSPENDED')}
          className={`p-4 rounded-lg border text-left transition-all ${
            statusFilter === 'SUSPENDED'
              ? 'border-yellow-500 bg-yellow-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <p className="text-sm text-gray-500">Suspendus</p>
          <p className="text-2xl font-bold text-yellow-600">{data?.statusCounts?.suspended || 0}</p>
        </button>

        <button
          onClick={() => setStatusFilter('BANNED')}
          className={`p-4 rounded-lg border text-left transition-all ${
            statusFilter === 'BANNED'
              ? 'border-red-500 bg-red-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <p className="text-sm text-gray-500">Bannis</p>
          <p className="text-2xl font-bold text-red-600">{data?.statusCounts?.banned || 0}</p>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Tous les roles</option>
            <option value="USER">Utilisateurs</option>
            <option value="ADMIN">Admins</option>
            <option value="SUPER_ADMIN">Super Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto" />
            <p className="text-gray-500 mt-2">Chargement...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun utilisateur trouve</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Utilisateur
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Boutiques
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Inscription
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          {user.role === 'SUPER_ADMIN' ? (
                            <Shield className="w-5 h-5 text-white" />
                          ) : (
                            <User className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name || 'Sans nom'}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                        disabled={user.role === 'SUPER_ADMIN' || updateUserRole.isPending}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border-0 ${getRoleBadge(user.role)} ${
                          user.role === 'SUPER_ADMIN' ? 'cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(user.status || 'ACTIVE')}
                      {user.suspendedReason && (
                        <p className="text-xs text-gray-500 mt-1 max-w-[150px] truncate" title={user.suspendedReason}>
                          {user.suspendedReason}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {user.stores.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.stores.slice(0, 2).map((store: any) => (
                            <span key={store.id} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                              <Store className="w-3 h-3" />
                              {store.name}
                            </span>
                          ))}
                          {user.stores.length > 2 && (
                            <span className="text-xs text-gray-500">+{user.stores.length - 2}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Aucune</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {(user.status === 'ACTIVE' || !user.status) && user.role !== 'SUPER_ADMIN' && (
                          <>
                            <button
                              onClick={() => handleSuspend(user, 'SUSPENDED')}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="Suspendre"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleSuspend(user, 'BANNED')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Bannir"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {(user.status === 'SUSPENDED' || user.status === 'BANNED') && (
                          <button
                            onClick={() => handleReactivate(user.id)}
                            disabled={updateUserStatus.isPending}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Reactiver"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {user.role !== 'SUPER_ADMIN' && (
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Nouvel utilisateur</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="USER">Utilisateur</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              {createUser.error && (
                <p className="text-sm text-red-600">{createUser.error.message}</p>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createUser.isPending}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {createUser.isPending ? 'Creation...' : 'Creer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suspend/Ban Modal */}
      {showSuspendModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Suspendre ou Bannir</h2>
              <p className="text-gray-500 text-sm mt-1">{selectedUser.email}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Raison</label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Raison de la suspension ou du bannissement..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24 resize-none"
                />
              </div>
              {updateUserStatus.error && (
                <p className="text-sm text-red-600">{updateUserStatus.error.message}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSuspendModal(false)
                    setSelectedUser(null)
                    setSuspendReason('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => confirmSuspend('SUSPENDED')}
                  disabled={updateUserStatus.isPending}
                  className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                >
                  Suspendre
                </button>
                <button
                  onClick={() => confirmSuspend('BANNED')}
                  disabled={updateUserStatus.isPending}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                >
                  Bannir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-red-600">Supprimer l'utilisateur</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Etes-vous sur de vouloir supprimer <strong>{selectedUser.name || selectedUser.email}</strong> ?
                Cette action est irreversible.
              </p>
              {selectedUser.stores?.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-yellow-800 text-sm">
                    Attention: Cet utilisateur possede {selectedUser.stores.length} boutique(s).
                    Vous devez d'abord transferer ou supprimer ces boutiques.
                  </p>
                </div>
              )}
              {deleteUser.error && (
                <p className="text-sm text-red-600 mb-4">{deleteUser.error.message}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedUser(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteUser.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteUser.isPending ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
