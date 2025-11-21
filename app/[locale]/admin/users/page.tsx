'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Users,
  Shield,
  UserX,
  UserCheck,
  Trash2,
  ChevronDown,
  Mail,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import { PERMISSIONS } from '@/lib/rbac/roles'

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRoleId, setInviteRoleId] = useState('')

  const storeId = '000000000000000000000001' // TODO: Get from context

  // Queries
  const { data: storeUsers, refetch: refetchUsers } = trpc.role.getStoreUsers.useQuery({
    storeId,
  })
  const { data: roles } = trpc.role.list.useQuery({ storeId })
  const { data: myPermissions } = trpc.role.getMyPermissions.useQuery({ storeId })

  // Mutations
  const assignRoleMutation = trpc.role.assignRole.useMutation()
  const suspendUserMutation = trpc.role.suspendUser.useMutation()
  const reactivateUserMutation = trpc.role.reactivateUser.useMutation()
  const removeUserMutation = trpc.role.removeUser.useMutation()
  const inviteUserMutation = trpc.role.inviteUser.useMutation()

  const hasPermission = (permission: string) => {
    return myPermissions?.permissions?.includes(permission) || false
  }

  const handleChangeRole = async () => {
    if (!selectedUser || !selectedRoleId) return

    assignRoleMutation.mutate(
      {
        storeId,
        userId: selectedUser.user.id,
        roleId: selectedRoleId,
      },
      {
        onSuccess: () => {
          refetchUsers()
          setShowRoleModal(false)
          setSelectedUser(null)
          setSelectedRoleId('')
        },
        onError: (error) => {
          alert(error.message)
        },
      }
    )
  }

  const handleSuspendUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir suspendre cet utilisateur ?')) return

    suspendUserMutation.mutate(
      { storeId, userId },
      {
        onSuccess: () => {
          refetchUsers()
        },
        onError: (error) => {
          alert(error.message)
        },
      }
    )
  }

  const handleReactivateUser = async (userId: string) => {
    reactivateUserMutation.mutate(
      { storeId, userId },
      {
        onSuccess: () => {
          refetchUsers()
        },
        onError: (error) => {
          alert(error.message)
        },
      }
    )
  }

  const handleRemoveUser = async (userId: string) => {
    if (
      !confirm(
        'Êtes-vous sûr de vouloir retirer cet utilisateur du magasin ? Cette action est irréversible.'
      )
    )
      return

    removeUserMutation.mutate(
      { storeId, userId },
      {
        onSuccess: () => {
          refetchUsers()
        },
        onError: (error) => {
          alert(error.message)
        },
      }
    )
  }

  const handleInviteUser = async () => {
    if (!inviteEmail || !inviteRoleId) {
      alert('Veuillez remplir tous les champs')
      return
    }

    inviteUserMutation.mutate(
      {
        storeId,
        email: inviteEmail,
        roleId: inviteRoleId,
      },
      {
        onSuccess: () => {
          refetchUsers()
          setShowInviteModal(false)
          setInviteEmail('')
          setInviteRoleId('')
          alert('Invitation envoyée avec succès')
        },
        onError: (error) => {
          alert(error.message)
        },
      }
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <UserCheck className="w-3 h-3" />
            Actif
          </span>
        )
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <UserX className="w-3 h-3" />
            Suspendu
          </span>
        )
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <AlertCircle className="w-3 h-3" />
            En attente
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p className="text-gray-600">
            Gérez les utilisateurs de votre magasin et leurs permissions
          </p>
        </div>
        {hasPermission(PERMISSIONS.USERS_INVITE) && (
          <Button variant="primary" onClick={() => setShowInviteModal(true)}>
            <Mail className="w-4 h-4 mr-2" />
            Inviter un utilisateur
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900">
                {storeUsers?.length || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Utilisateurs actifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {storeUsers?.filter((u: any) => u.status === 'ACTIVE').length || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Utilisateurs suspendus</p>
              <p className="text-2xl font-bold text-gray-900">
                {storeUsers?.filter((u: any) => u.status === 'SUSPENDED').length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Users table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ajouté le
                </th>
                {(hasPermission(PERMISSIONS.USERS_UPDATE) ||
                  hasPermission(PERMISSIONS.USERS_DELETE)) && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {storeUsers?.map((storeUser: any) => (
                <tr key={storeUser.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {storeUser.user.image ? (
                        <img
                          src={storeUser.user.image}
                          alt={storeUser.user.name || ''}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <Users className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {storeUser.user.name || 'Sans nom'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {storeUser.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {storeUser.role?.name || 'Aucun rôle'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(storeUser.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(storeUser.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  {(hasPermission(PERMISSIONS.USERS_UPDATE) ||
                    hasPermission(PERMISSIONS.USERS_DELETE)) && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {hasPermission(PERMISSIONS.USERS_UPDATE) && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedUser(storeUser)
                                setSelectedRoleId(storeUser.role?.id || '')
                                setShowRoleModal(true)
                              }}
                              className="text-blue-600 hover:text-blue-700 p-1"
                              title="Changer le rôle"
                            >
                              <Shield className="w-4 h-4" />
                            </button>

                            {storeUser.status === 'ACTIVE' ? (
                              <button
                                onClick={() => handleSuspendUser(storeUser.user.id)}
                                className="text-orange-600 hover:text-orange-700 p-1"
                                title="Suspendre"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReactivateUser(storeUser.user.id)}
                                className="text-green-600 hover:text-green-700 p-1"
                                title="Réactiver"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}

                        {hasPermission(PERMISSIONS.USERS_DELETE) && (
                          <button
                            onClick={() => handleRemoveUser(storeUser.user.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Retirer du magasin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {storeUsers?.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun utilisateur
            </h3>
            <p className="text-gray-600">
              Invitez des collaborateurs pour commencer à gérer votre magasin à plusieurs
            </p>
          </div>
        )}
      </Card>

      {/* Change Role Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Changer le rôle</h2>
            <p className="text-sm text-gray-600 mb-4">
              Modifier le rôle de <strong>{selectedUser.user.name}</strong>
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner un rôle
              </label>
              <div className="relative">
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                >
                  <option value="">Sélectionnez un rôle</option>
                  {roles?.map((role: any) => (
                    <option key={role.id} value={role.id}>
                      {role.name} ({role.permissions.length} permissions)
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleChangeRole}
                disabled={!selectedRoleId || assignRoleMutation.isPending}
                className="flex-1"
              >
                {assignRoleMutation.isPending ? 'Modification...' : 'Confirmer'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowRoleModal(false)
                  setSelectedUser(null)
                  setSelectedRoleId('')
                }}
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Inviter un utilisateur
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Envoyez une invitation par email pour ajouter un nouveau collaborateur à votre
              magasin
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="utilisateur@exemple.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle
                </label>
                <div className="relative">
                  <select
                    value={inviteRoleId}
                    onChange={(e) => setInviteRoleId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                  >
                    <option value="">Sélectionnez un rôle</option>
                    {roles?.map((role: any) => (
                      <option key={role.id} value={role.id}>
                        {role.name} ({role.permissions.length} permissions)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-800">
                ℹ️ L'utilisateur recevra un email avec un lien d'invitation valable 7 jours
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleInviteUser}
                disabled={!inviteEmail || !inviteRoleId || inviteUserMutation.isPending}
                className="flex-1"
              >
                {inviteUserMutation.isPending ? 'Envoi...' : 'Envoyer l\'invitation'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowInviteModal(false)
                  setInviteEmail('')
                  setInviteRoleId('')
                }}
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
