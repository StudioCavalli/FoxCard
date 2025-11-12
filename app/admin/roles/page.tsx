'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, Trash2, Edit, Users, Shield, ShieldCheck } from 'lucide-react'
import { PERMISSION_GROUPS, PERMISSION_LABELS, PERMISSIONS } from '@/lib/rbac/roles'

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = useState<any>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  })

  const storeId = '000000000000000000000001' // TODO: Get from context

  // Queries
  const { data: roles, refetch: refetchRoles } = trpc.role.list.useQuery({ storeId })
  const { data: myPermissions } = trpc.role.getMyPermissions.useQuery({ storeId })

  // Mutations
  const createRoleMutation = trpc.role.create.useMutation()
  const updateRoleMutation = trpc.role.update.useMutation()
  const deleteRoleMutation = trpc.role.delete.useMutation()
  const seedSystemRolesMutation = trpc.role.seedSystemRoles.useMutation()

  const hasPermission = (permission: string) => {
    return myPermissions?.permissions?.includes(permission) || false
  }

  const handleCreateRole = async () => {
    if (!formData.name) {
      alert('Le nom du rôle est requis')
      return
    }

    createRoleMutation.mutate(
      {
        storeId,
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
      },
      {
        onSuccess: () => {
          refetchRoles()
          setIsCreating(false)
          setFormData({ name: '', description: '', permissions: [] })
        },
        onError: (error) => {
          alert(error.message)
        },
      }
    )
  }

  const handleUpdateRole = async () => {
    if (!selectedRole) return

    updateRoleMutation.mutate(
      {
        storeId,
        roleId: selectedRole.id,
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
      },
      {
        onSuccess: () => {
          refetchRoles()
          setSelectedRole(null)
          setFormData({ name: '', description: '', permissions: [] })
        },
        onError: (error) => {
          alert(error.message)
        },
      }
    )
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) return

    deleteRoleMutation.mutate(
      { storeId, roleId },
      {
        onSuccess: () => {
          refetchRoles()
        },
        onError: (error) => {
          alert(error.message)
        },
      }
    )
  }

  const handleSeedSystemRoles = async () => {
    seedSystemRolesMutation.mutate(
      { storeId },
      {
        onSuccess: () => {
          refetchRoles()
          alert('Rôles système créés avec succès')
        },
        onError: (error) => {
          alert(error.message)
        },
      }
    )
  }

  const handleEditRole = (role: any) => {
    setSelectedRole(role)
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions,
    })
    setIsCreating(false)
  }

  const handleTogglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }))
  }

  const handleSelectAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: Object.values(PERMISSIONS),
    }))
  }

  const handleDeselectAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: [],
    }))
  }

  if (isCreating || selectedRole) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isCreating ? 'Créer un rôle' : 'Modifier le rôle'}
            </h1>
            <p className="text-gray-600">
              {isCreating
                ? 'Définissez les permissions pour le nouveau rôle'
                : `Modifiez les permissions pour ${selectedRole?.name}`}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              setIsCreating(false)
              setSelectedRole(null)
              setFormData({ name: '', description: '', permissions: [] })
            }}
          >
            Annuler
          </Button>
        </div>

        <div className="max-w-4xl">
          <Card className="p-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du rôle
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={selectedRole?.isSystem}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  placeholder="Ex: Gestionnaire de stock"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Décrivez les responsabilités de ce rôle..."
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Permissions</h2>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAllPermissions}
                  disabled={selectedRole?.isSystem}
                >
                  Tout sélectionner
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeselectAllPermissions}
                  disabled={selectedRole?.isSystem}
                >
                  Tout désélectionner
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {Object.entries(PERMISSION_GROUPS).map(([groupName, permissions]) => (
                <div key={groupName} className="border-b border-gray-200 pb-4 last:border-0">
                  <h3 className="font-medium text-gray-900 mb-3">{groupName}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {permissions.map((permission) => (
                      <label
                        key={permission}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission)}
                          onChange={() => handleTogglePermission(permission)}
                          disabled={selectedRole?.isSystem}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">
                          {PERMISSION_LABELS[permission] || permission}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="primary"
                onClick={isCreating ? handleCreateRole : handleUpdateRole}
                disabled={
                  createRoleMutation.isPending ||
                  updateRoleMutation.isPending ||
                  selectedRole?.isSystem
                }
              >
                {isCreating ? 'Créer le rôle' : 'Enregistrer les modifications'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsCreating(false)
                  setSelectedRole(null)
                  setFormData({ name: '', description: '', permissions: [] })
                }}
              >
                Annuler
              </Button>
            </div>

            {selectedRole?.isSystem && (
              <p className="mt-4 text-sm text-amber-600">
                ⚠️ Les rôles système ne peuvent pas être modifiés ou supprimés
              </p>
            )}
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des rôles</h1>
          <p className="text-gray-600">
            Gérez les rôles et permissions des utilisateurs de votre magasin
          </p>
        </div>
        <div className="flex gap-3">
          {hasPermission(PERMISSIONS.ROLES_CREATE) && (
            <>
              <Button variant="ghost" onClick={handleSeedSystemRoles}>
                <ShieldCheck className="w-4 h-4 mr-2" />
                Créer rôles système
              </Button>
              <Button variant="primary" onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau rôle
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Current user's role info */}
      {myPermissions?.role && (
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Votre rôle : {myPermissions.role.name}
              </p>
              <p className="text-xs text-blue-700">
                {myPermissions.permissions.length} permission(s)
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Roles list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles?.map((role: any) => (
          <Card key={role.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                {role.isSystem ? (
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                ) : (
                  <Shield className="w-5 h-5 text-gray-600" />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{role.name}</h3>
                  {role.isSystem && (
                    <span className="text-xs text-blue-600">Système</span>
                  )}
                </div>
              </div>
              {!role.isSystem && hasPermission(PERMISSIONS.ROLES_DELETE) && (
                <button
                  onClick={() => handleDeleteRole(role.id)}
                  className="text-red-600 hover:text-red-700 p-1"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {role.description && (
              <p className="text-sm text-gray-600 mb-4">{role.description}</p>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{role._count.users} utilisateur(s)</span>
              </div>
              <div className="text-sm text-gray-600">
                {role.permissions.length} permission(s)
              </div>
            </div>

            {hasPermission(PERMISSIONS.ROLES_UPDATE) && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => handleEditRole(role)}
              >
                <Edit className="w-4 h-4 mr-2" />
                {role.isSystem ? 'Voir les permissions' : 'Modifier'}
              </Button>
            )}
          </Card>
        ))}
      </div>

      {roles?.length === 0 && (
        <Card className="p-12 text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun rôle créé
          </h3>
          <p className="text-gray-600 mb-6">
            Commencez par créer les rôles système ou un rôle personnalisé
          </p>
          {hasPermission(PERMISSIONS.ROLES_CREATE) && (
            <div className="flex gap-3 justify-center">
              <Button variant="ghost" onClick={handleSeedSystemRoles}>
                Créer rôles système
              </Button>
              <Button variant="primary" onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau rôle
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
