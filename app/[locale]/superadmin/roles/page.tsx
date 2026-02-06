'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { trpc } from '@/lib/trpc/client'
import {
  AdminCard,
  AdminButton,
  AdminInput,
  AdminBadge,
  AdminModal,
  AdminEmptyState,
} from '@/components/admin/ui'
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Users,
  Check,
  Loader2,
  Info,
  Store,
  ShoppingCart,
  BarChart3,
  Settings,
  Headphones,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Lock,
  Key,
} from 'lucide-react'

// Permissions disponibles (platform-level)
const allPermissions = [
  // Stores
  { id: 'stores.view', name: 'Voir les boutiques', description: 'Voir la liste des boutiques', category: 'Boutiques', icon: Store },
  { id: 'stores.create', name: 'Créer des boutiques', description: 'Créer de nouvelles boutiques', category: 'Boutiques', icon: Store },
  { id: 'stores.edit', name: 'Modifier les boutiques', description: 'Modifier les informations des boutiques', category: 'Boutiques', icon: Store },
  { id: 'stores.delete', name: 'Supprimer des boutiques', description: 'Supprimer des boutiques existantes', category: 'Boutiques', icon: Store },
  { id: 'stores.suspend', name: 'Suspendre des boutiques', description: 'Suspendre ou réactiver des boutiques', category: 'Boutiques', icon: Store },
  // Users
  { id: 'users.view', name: 'Voir les utilisateurs', description: 'Voir la liste des utilisateurs', category: 'Utilisateurs', icon: Users },
  { id: 'users.create', name: 'Créer des utilisateurs', description: 'Créer de nouveaux utilisateurs', category: 'Utilisateurs', icon: Users },
  { id: 'users.edit', name: 'Modifier les utilisateurs', description: 'Modifier les informations des utilisateurs', category: 'Utilisateurs', icon: Users },
  { id: 'users.delete', name: 'Supprimer des utilisateurs', description: 'Supprimer des utilisateurs', category: 'Utilisateurs', icon: Users },
  { id: 'users.suspend', name: 'Suspendre des utilisateurs', description: 'Suspendre ou bannir des utilisateurs', category: 'Utilisateurs', icon: Users },
  // Orders
  { id: 'orders.view', name: 'Voir les commandes', description: 'Voir toutes les commandes de la plateforme', category: 'Commandes', icon: ShoppingCart },
  { id: 'orders.manage', name: 'Gérer les commandes', description: 'Modifier le statut des commandes', category: 'Commandes', icon: ShoppingCart },
  { id: 'orders.refund', name: 'Rembourser', description: 'Effectuer des remboursements', category: 'Commandes', icon: ShoppingCart },
  // Analytics
  { id: 'analytics.view', name: 'Voir les analytics', description: 'Accéder aux statistiques de la plateforme', category: 'Analytics', icon: BarChart3 },
  { id: 'analytics.export', name: 'Exporter les données', description: 'Exporter les rapports et données', category: 'Analytics', icon: BarChart3 },
  // Settings
  { id: 'settings.view', name: 'Voir les paramètres', description: 'Voir les paramètres de la plateforme', category: 'Paramètres', icon: Settings },
  { id: 'settings.edit', name: 'Modifier les paramètres', description: 'Modifier les paramètres de la plateforme', category: 'Paramètres', icon: Settings },
  // Support
  { id: 'support.view', name: 'Voir le support', description: 'Voir les tickets de support', category: 'Support', icon: Headphones },
  { id: 'support.manage', name: 'Gérer le support', description: 'Répondre et gérer les tickets', category: 'Support', icon: Headphones },
  // Appeals
  { id: 'appeals.view', name: 'Voir les appels', description: 'Voir les appels de suspension', category: 'Appels', icon: AlertTriangle },
  { id: 'appeals.manage', name: 'Gérer les appels', description: 'Approuver ou rejeter les appels', category: 'Appels', icon: AlertTriangle },
]

const categoryIcons: Record<string, any> = {
  Boutiques: Store,
  Utilisateurs: Users,
  Commandes: ShoppingCart,
  Analytics: BarChart3,
  Paramètres: Settings,
  Support: Headphones,
  Appels: AlertTriangle,
}

const categoryColors: Record<string, string> = {
  Boutiques: 'from-primary-500 to-primary-600',
  Utilisateurs: 'from-blue-500 to-cyan-600',
  Commandes: 'from-amber-500 to-orange-600',
  Analytics: 'from-emerald-500 to-green-600',
  Paramètres: 'from-slate-500 to-gray-600',
  Support: 'from-rose-500 to-primary-500',
  Appels: 'from-red-500 to-rose-600',
}

export default function SuperAdminRolesPage() {
  const t = useTranslations('superadmin')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<any>(null)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const { data: roles, isLoading, refetch } = trpc.superadmin.getPlatformRoles.useQuery()

  const createRole = trpc.superadmin.createPlatformRole.useMutation({
    onSuccess: () => {
      handleCloseModal()
      refetch()
    },
  })

  const updateRole = trpc.superadmin.updatePlatformRole.useMutation({
    onSuccess: () => {
      handleCloseModal()
      refetch()
    },
  })

  const deleteRole = trpc.superadmin.deletePlatformRole.useMutation({
    onSuccess: () => refetch(),
  })

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  })

  const handleOpenModal = (role?: any) => {
    if (role) {
      setEditingRole(role)
      setFormData({
        name: role.name,
        description: role.description || '',
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
    setExpandedCategories(Object.keys(permissionsByCategory))
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingRole(null)
    setFormData({ name: '', description: '', permissions: [] })
    setExpandedCategories([])
  }

  const handleTogglePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }))
  }

  const handleToggleCategory = (category: string) => {
    const categoryPermissions = allPermissions.filter((p) => p.category === category).map((p) => p.id)
    const allSelected = categoryPermissions.every((p) => formData.permissions.includes(p))

    setFormData((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((p) => !categoryPermissions.includes(p))
        : [...new Set([...prev.permissions, ...categoryPermissions])],
    }))
  }

  const toggleCategoryExpand = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  const handleSave = async () => {
    if (editingRole) {
      updateRole.mutate({
        roleId: editingRole.id,
        ...formData,
      })
    } else {
      createRole.mutate(formData)
    }
  }

  const handleDelete = async (roleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) return
    deleteRole.mutate({ roleId })
  }

  // Group permissions by category
  const permissionsByCategory = allPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = []
    }
    acc[permission.category].push(permission)
    return acc
  }, {} as Record<string, typeof allPermissions>)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('rolesPage.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('rolesPage.title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {t('rolesPage.subtitle')}
          </p>
        </div>
        <AdminButton
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => handleOpenModal()}
        >
          {t('rolesPage.newRole')}
        </AdminButton>
      </div>

      {/* Info Card */}
      <AdminCard className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 border-blue-200 dark:border-blue-500/30">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{t('rolesPage.infoCard.title')}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {t('rolesPage.infoCard.description')}
            </p>
          </div>
        </div>
      </AdminCard>

      {/* Roles Grid */}
      {!roles || roles.length === 0 ? (
        <AdminEmptyState
          icon={Shield}
          title={t('rolesPage.empty.title')}
          description={t('rolesPage.empty.description')}
          action={
            <AdminButton
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => handleOpenModal()}
            >
              {t('rolesPage.empty.createFirst')}
            </AdminButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {roles.map((role) => {
            const permCount = role.permissions.length
            const displayPerms = role.permissions.slice(0, 5)

            return (
              <AdminCard key={role.id} className="overflow-hidden">
                {/* Card Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        role.isSystem
                          ? 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30'
                          : 'bg-slate-100 dark:bg-slate-700'
                      }`}>
                        {role.isSystem ? (
                          <Lock className="w-6 h-6 text-white" />
                        ) : (
                          <Shield className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                            {role.name}
                          </h3>
                          {role.isSystem && (
                            <AdminBadge variant="default" size="sm">
                              {t('rolesPage.systemBadge')}
                            </AdminBadge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                          {role.description || t('rolesPage.noDescription')}
                        </p>
                      </div>
                    </div>
                    {!role.isSystem && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenModal(role)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-primary-600 dark:hover:text-primary-400"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(role.id)}
                          disabled={deleteRole.isPending}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  {/* Stats */}
                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {role.usersCount}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {t('rolesPage.users', { count: role.usersCount })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                        <Key className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {permCount}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {t('rolesPage.permissions', { count: permCount })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Permissions Preview */}
                  <div className="flex flex-wrap gap-1.5">
                    {displayPerms.map((permId: string) => {
                      const perm = allPermissions.find((p) => p.id === permId)
                      return perm ? (
                        <span
                          key={permId}
                          className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg"
                        >
                          {perm.name}
                        </span>
                      ) : null
                    })}
                    {permCount > 5 && (
                      <span className="px-2.5 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 rounded-lg">
                        {t('rolesPage.morePermissions', { count: permCount - 5 })}
                      </span>
                    )}
                  </div>
                </div>
              </AdminCard>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingRole ? t('rolesPage.modal.editTitle') : t('rolesPage.modal.createTitle')}
        size="lg"
      >
        <div className="space-y-6">
          {/* Name & Description */}
          <div className="space-y-4">
            <AdminInput
              label={t('rolesPage.modal.nameLabel')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('rolesPage.modal.namePlaceholder')}
              disabled={editingRole?.isSystem}
            />
            <AdminInput
              label={t('rolesPage.modal.descriptionLabel')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('rolesPage.modal.descriptionPlaceholder')}
            />
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              {t('rolesPage.modal.permissionsLabel', { count: formData.permissions.length })}
            </label>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {Object.entries(permissionsByCategory).map(([category, permissions]) => {
                const CategoryIcon = categoryIcons[category] || Shield
                const allSelected = permissions.every((p) => formData.permissions.includes(p.id))
                const someSelected = permissions.some((p) => formData.permissions.includes(p.id))
                const isExpanded = expandedCategories.includes(category)
                const selectedCount = permissions.filter((p) => formData.permissions.includes(p.id)).length

                return (
                  <div
                    key={category}
                    className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
                  >
                    {/* Category Header */}
                    <div className="flex items-center bg-slate-50 dark:bg-slate-800/50">
                      <button
                        type="button"
                        onClick={() => toggleCategoryExpand(category)}
                        className="flex-1 flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${categoryColors[category] || 'from-slate-500 to-gray-600'} flex items-center justify-center shadow-sm`}>
                          <CategoryIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {category}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          ({selectedCount}/{permissions.length})
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleCategory(category)}
                        className="px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            allSelected
                              ? 'bg-primary-600 border-primary-600'
                              : someSelected
                              ? 'bg-primary-100 dark:bg-primary-500/20 border-primary-400 dark:border-primary-500'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {allSelected && <Check className="w-3 h-3 text-white" />}
                          {!allSelected && someSelected && (
                            <div className="w-2 h-2 bg-primary-600 rounded-sm" />
                          )}
                        </div>
                      </button>
                    </div>

                    {/* Permissions List */}
                    {isExpanded && (
                      <div className="p-3 space-y-1 bg-white dark:bg-slate-900">
                        {permissions.map((permission) => {
                          const isSelected = formData.permissions.includes(permission.id)
                          return (
                            <label
                              key={permission.id}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-primary-50 dark:bg-primary-500/10'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'bg-primary-600 border-primary-600'
                                    : 'border-slate-300 dark:border-slate-600'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleTogglePermission(permission.id)}
                                className="sr-only"
                              />
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${
                                  isSelected
                                    ? 'text-primary-700 dark:text-primary-300'
                                    : 'text-slate-700 dark:text-slate-300'
                                }`}>
                                  {permission.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {permission.description}
                                </p>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Error Message */}
          {(createRole.error || updateRole.error) && (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-red-700 dark:text-red-400 text-sm">
              {createRole.error?.message || updateRole.error?.message}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <AdminButton variant="secondary" onClick={handleCloseModal}>
              {t('rolesPage.modal.cancel')}
            </AdminButton>
            <AdminButton
              variant="primary"
              onClick={handleSave}
              disabled={!formData.name || createRole.isPending || updateRole.isPending}
              loading={createRole.isPending || updateRole.isPending}
            >
              {editingRole ? t('rolesPage.modal.save') : t('rolesPage.modal.create')}
            </AdminButton>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}
