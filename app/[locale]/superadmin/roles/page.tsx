'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Users,
  Check,
  X,
  Loader2,
  Info
} from 'lucide-react'

// Types pour les rôles
type Permission = {
  id: string
  name: string
  description: string
  category: string
}

type Role = {
  id: string
  name: string
  description: string
  permissions: string[]
  isSystem: boolean
  usersCount: number
}

// Permissions disponibles
const allPermissions: Permission[] = [
  // Stores
  { id: 'stores.view', name: 'Voir les boutiques', description: 'Voir la liste des boutiques', category: 'Boutiques' },
  { id: 'stores.create', name: 'Créer des boutiques', description: 'Créer de nouvelles boutiques', category: 'Boutiques' },
  { id: 'stores.edit', name: 'Modifier les boutiques', description: 'Modifier les informations des boutiques', category: 'Boutiques' },
  { id: 'stores.delete', name: 'Supprimer des boutiques', description: 'Supprimer des boutiques existantes', category: 'Boutiques' },
  // Users
  { id: 'users.view', name: 'Voir les utilisateurs', description: 'Voir la liste des utilisateurs', category: 'Utilisateurs' },
  { id: 'users.create', name: 'Créer des utilisateurs', description: 'Créer de nouveaux utilisateurs', category: 'Utilisateurs' },
  { id: 'users.edit', name: 'Modifier les utilisateurs', description: 'Modifier les informations des utilisateurs', category: 'Utilisateurs' },
  { id: 'users.delete', name: 'Supprimer des utilisateurs', description: 'Supprimer des utilisateurs', category: 'Utilisateurs' },
  // Orders
  { id: 'orders.view', name: 'Voir les commandes', description: 'Voir toutes les commandes de la plateforme', category: 'Commandes' },
  { id: 'orders.manage', name: 'Gérer les commandes', description: 'Modifier le statut des commandes', category: 'Commandes' },
  { id: 'orders.refund', name: 'Rembourser', description: 'Effectuer des remboursements', category: 'Commandes' },
  // Analytics
  { id: 'analytics.view', name: 'Voir les analytics', description: 'Accéder aux statistiques de la plateforme', category: 'Analytics' },
  { id: 'analytics.export', name: 'Exporter les données', description: 'Exporter les rapports et données', category: 'Analytics' },
  // Settings
  { id: 'settings.view', name: 'Voir les paramètres', description: 'Voir les paramètres de la plateforme', category: 'Paramètres' },
  { id: 'settings.edit', name: 'Modifier les paramètres', description: 'Modifier les paramètres de la plateforme', category: 'Paramètres' },
  // Support
  { id: 'support.view', name: 'Voir le support', description: 'Voir les tickets de support', category: 'Support' },
  { id: 'support.manage', name: 'Gérer le support', description: 'Répondre et gérer les tickets', category: 'Support' },
]

// Rôles par défaut (simulés)
const defaultRoles: Role[] = [
  {
    id: '1',
    name: 'Super Admin',
    description: 'Accès complet à toutes les fonctionnalités',
    permissions: allPermissions.map(p => p.id),
    isSystem: true,
    usersCount: 1,
  },
  {
    id: '2',
    name: 'Admin',
    description: 'Gestion des boutiques et utilisateurs',
    permissions: ['stores.view', 'stores.edit', 'users.view', 'users.edit', 'orders.view', 'analytics.view', 'support.view', 'support.manage'],
    isSystem: true,
    usersCount: 3,
  },
  {
    id: '3',
    name: 'Support',
    description: 'Gestion du support client uniquement',
    permissions: ['stores.view', 'users.view', 'orders.view', 'support.view', 'support.manage'],
    isSystem: false,
    usersCount: 5,
  },
  {
    id: '4',
    name: 'Analyste',
    description: 'Accès aux analytics et rapports',
    permissions: ['stores.view', 'orders.view', 'analytics.view', 'analytics.export'],
    isSystem: false,
    usersCount: 2,
  },
]

export default function SuperAdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>(defaultRoles)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  })

  const handleOpenModal = (role?: Role) => {
    if (role) {
      setEditingRole(role)
      setFormData({
        name: role.name,
        description: role.description,
        permissions: [...role.permissions],
      })
    } else {
      setEditingRole(null)
      setFormData({
        name: '',
        description: '',
        permissions: [],
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingRole(null)
    setFormData({ name: '', description: '', permissions: [] })
  }

  const handleTogglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId],
    }))
  }

  const handleToggleCategory = (category: string) => {
    const categoryPermissions = allPermissions.filter(p => p.category === category).map(p => p.id)
    const allSelected = categoryPermissions.every(p => formData.permissions.includes(p))

    setFormData(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter(p => !categoryPermissions.includes(p))
        : [...new Set([...prev.permissions, ...categoryPermissions])],
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    if (editingRole) {
      setRoles(prev => prev.map(r =>
        r.id === editingRole.id
          ? { ...r, ...formData }
          : r
      ))
    } else {
      const newRole: Role = {
        id: Date.now().toString(),
        ...formData,
        isSystem: false,
        usersCount: 0,
      }
      setRoles(prev => [...prev, newRole])
    }

    setIsSaving(false)
    handleCloseModal()
  }

  const handleDelete = async (roleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) return
    setRoles(prev => prev.filter(r => r.id !== roleId))
  }

  // Group permissions by category
  const permissionsByCategory = allPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = []
    }
    acc[permission.category].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rôles & Permissions</h1>
          <p className="text-gray-600">Gérez les rôles et leurs permissions</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau rôle
        </Button>
      </div>

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">À propos des rôles système</p>
            <p className="text-sm text-blue-700">
              Les rôles "Super Admin" et "Admin" sont des rôles système et ne peuvent pas être supprimés.
              Vous pouvez créer des rôles personnalisés pour des besoins spécifiques.
            </p>
          </div>
        </div>
      </Card>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  role.isSystem ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  <Shield className={`w-5 h-5 ${role.isSystem ? 'text-purple-600' : 'text-gray-600'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{role.name}</h3>
                    {role.isSystem && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                        Système
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
              </div>
              {!role.isSystem && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenModal(role)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(role.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{role.usersCount} utilisateur{role.usersCount > 1 ? 's' : ''}</span>
              </div>
              <div className="text-sm text-gray-600">
                {role.permissions.length} permission{role.permissions.length > 1 ? 's' : ''}
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {role.permissions.slice(0, 6).map((permId) => {
                const perm = allPermissions.find(p => p.id === permId)
                return perm ? (
                  <span
                    key={permId}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                  >
                    {perm.name}
                  </span>
                ) : null
              })}
              {role.permissions.length > 6 && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                  +{role.permissions.length - 6} autres
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingRole ? 'Modifier le rôle' : 'Nouveau rôle'}
              </h2>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
              {/* Name & Description */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du rôle
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Modérateur"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Gestion de la modération du contenu"
                  />
                </div>
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Permissions
                </label>
                <div className="space-y-4">
                  {Object.entries(permissionsByCategory).map(([category, permissions]) => {
                    const allSelected = permissions.every(p => formData.permissions.includes(p.id))
                    const someSelected = permissions.some(p => formData.permissions.includes(p.id))

                    return (
                      <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleToggleCategory(category)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <span className="font-medium text-gray-900">{category}</span>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            allSelected
                              ? 'bg-purple-600 border-purple-600'
                              : someSelected
                              ? 'bg-purple-100 border-purple-300'
                              : 'border-gray-300'
                          }`}>
                            {allSelected && <Check className="w-3 h-3 text-white" />}
                            {!allSelected && someSelected && <div className="w-2 h-2 bg-purple-600 rounded-sm" />}
                          </div>
                        </button>
                        <div className="p-3 space-y-2">
                          {permissions.map((permission) => (
                            <label
                              key={permission.id}
                              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(permission.id)}
                                onChange={() => handleTogglePermission(permission.id)}
                                className="w-4 h-4 rounded text-purple-600 border-gray-300"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                                <p className="text-xs text-gray-500">{permission.description}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="outline" onClick={handleCloseModal}>
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!formData.name || isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {editingRole ? 'Enregistrer' : 'Créer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
