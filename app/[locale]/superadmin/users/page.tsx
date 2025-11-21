'use client'

import { useState } from 'react'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { AdminModal } from '@/components/admin/ui/AdminModal'
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState'
import { AdminSearchInput } from '@/components/admin/ui/AdminSearchInput'
import { AdminSelect } from '@/components/admin/ui/AdminSelect'
import { AdminInput } from '@/components/admin/ui/AdminInput'
import { AdminTextarea } from '@/components/admin/ui/AdminTextarea'
import { AdminTabs } from '@/components/admin/ui/AdminTabs'
import { AdminStatCard } from '@/components/admin/ui/AdminStatCard'
import { trpc } from '@/lib/trpc/client'
import { formatDate } from '@/lib/utils'
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Ban,
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
  Calendar,
  Store,
  MoreVertical,
  Edit,
  Trash2,
  Crown,
  User,
  AlertTriangle,
  RefreshCw,
  Eye
} from 'lucide-react'

type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'all'
type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'all'

const roleConfig: Record<string, { label: string; variant: 'default' | 'info' | 'purple'; icon: typeof User }> = {
  USER: { label: 'Utilisateur', variant: 'default', icon: User },
  ADMIN: { label: 'Admin', variant: 'info', icon: Shield },
  SUPER_ADMIN: { label: 'Super Admin', variant: 'purple', icon: Crown },
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger'; icon: typeof CheckCircle }> = {
  ACTIVE: { label: 'Actif', variant: 'success', icon: CheckCircle },
  SUSPENDED: { label: 'Suspendu', variant: 'warning', icon: Ban },
  BANNED: { label: 'Banni', variant: 'danger', icon: XCircle },
}

export default function SuperAdminUsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole>('all')
  const [statusFilter, setStatusFilter] = useState<UserStatus>('all')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [statusAction, setStatusAction] = useState<'ACTIVE' | 'SUSPENDED' | 'BANNED'>('SUSPENDED')
  const [actionReason, setActionReason] = useState('')
  const [newRole, setNewRole] = useState<'USER' | 'ADMIN' | 'SUPER_ADMIN'>('USER')
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'USER' as const })

  const { data, isLoading, refetch } = trpc.superadmin.getAllUsers.useQuery({
    limit: 100, offset: 0, search: search || undefined, role: roleFilter, status: statusFilter,
  })

  const updateUserStatus = trpc.superadmin.updateUserStatus.useMutation({
    onSuccess: () => { setIsStatusModalOpen(false); setSelectedUser(null); setActionReason(''); refetch() },
  })

  const updateUserRole = trpc.superadmin.updateUserRole.useMutation({
    onSuccess: () => { setIsRoleModalOpen(false); setSelectedUser(null); setActionReason(''); refetch() },
  })

  const createUser = trpc.superadmin.createUser.useMutation({
    onSuccess: () => { setIsCreateModalOpen(false); setCreateForm({ name: '', email: '', password: '', role: 'USER' }); refetch() },
  })

  const users = data?.users || []
  const statusCounts = data?.statusCounts || { active: 0, suspended: 0, banned: 0 }
  const total = data?.total || 0

  const openStatusModal = (user: any, action: 'ACTIVE' | 'SUSPENDED' | 'BANNED') => {
    setSelectedUser(user)
    setStatusAction(action)
    setActionReason('')
    setIsStatusModalOpen(true)
  }

  const openRoleModal = (user: any) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setActionReason('')
    setIsRoleModalOpen(true)
  }

  const handleStatusChange = async () => {
    if (!selectedUser) return
    await updateUserStatus.mutateAsync({ userId: selectedUser.id, status: statusAction, reason: actionReason || undefined })
  }

  const handleRoleChange = async () => {
    if (!selectedUser || !actionReason) return
    await updateUserRole.mutateAsync({ userId: selectedUser.id, role: newRole, reason: actionReason })
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    await createUser.mutateAsync(createForm)
  }

  const statusTabs = [
    { value: 'all', label: 'Tous', count: total },
    { value: 'ACTIVE', label: 'Actifs', count: statusCounts.active, icon: <CheckCircle className="w-4 h-4" /> },
    { value: 'SUSPENDED', label: 'Suspendus', count: statusCounts.suspended, icon: <Ban className="w-4 h-4" /> },
    { value: 'BANNED', label: 'Bannis', count: statusCounts.banned, icon: <XCircle className="w-4 h-4" /> },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des Utilisateurs</h1>
          <p className="text-slate-500 dark:text-slate-400">{total} utilisateurs sur la plateforme</p>
        </div>
        <div className="flex items-center gap-3">
          <AdminButton variant="outline" icon={<RefreshCw className="w-4 h-4" />} onClick={() => refetch()}>Actualiser</AdminButton>
          <AdminButton variant="primary" icon={<UserPlus className="w-4 h-4" />} onClick={() => setIsCreateModalOpen(true)}>Nouvel utilisateur</AdminButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard title="Actifs" value={statusCounts.active} icon={CheckCircle} variant="emerald" />
        <AdminStatCard title="Suspendus" value={statusCounts.suspended} icon={Ban} variant="amber" />
        <AdminStatCard title="Bannis" value={statusCounts.banned} icon={XCircle} variant="rose" />
      </div>

      {/* Filters */}
      <AdminCard padding="md">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <AdminSearchInput placeholder="Rechercher par nom ou email..." value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} />
          </div>
          <AdminSelect value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as UserRole)} options={[
            { value: 'all', label: 'Tous les roles' },
            { value: 'USER', label: 'Utilisateurs' },
            { value: 'ADMIN', label: 'Admins' },
            { value: 'SUPER_ADMIN', label: 'Super Admins' },
          ]} />
          <AdminTabs items={statusTabs} value={statusFilter} onChange={(v) => setStatusFilter(v as UserStatus)} variant="pills" size="sm" />
        </div>
      </AdminCard>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && users.length === 0 && (
        <AdminEmptyState icon={Users} title="Aucun utilisateur trouve" description="Modifiez vos filtres ou creez un nouvel utilisateur." action={<AdminButton variant="primary" icon={<UserPlus className="w-4 h-4" />} onClick={() => setIsCreateModalOpen(true)}>Creer</AdminButton>} />
      )}

      {/* Users List */}
      {!isLoading && users.length > 0 && (
        <div className="grid gap-3">
          {users.map((user) => {
            const role = roleConfig[user.role] || roleConfig.USER
            const status = statusConfig[user.status] || statusConfig.ACTIVE
            const RoleIcon = role.icon
            const StatusIcon = status.icon

            return (
              <AdminCard key={user.id} padding="none" className="overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {user.image ? (
                        <img src={user.image} alt={user.name || 'User'} className="w-12 h-12 rounded-xl object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">{user.name || 'Sans nom'}</h3>
                        <AdminBadge variant={role.variant} icon={RoleIcon} size="sm">{role.label}</AdminBadge>
                        <AdminBadge variant={status.variant} icon={StatusIcon} size="sm">{status.label}</AdminBadge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{user.email}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(user.createdAt)}</span>
                        {user.stores && user.stores.length > 0 && (
                          <span className="flex items-center gap-1"><Store className="w-3.5 h-3.5" />{user.stores.length} boutique(s)</span>
                        )}
                      </div>
                      {user.suspendedReason && user.status !== 'ACTIVE' && (
                        <div className="mt-2 text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {user.suspendedReason}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <AdminButton variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} onClick={() => { setSelectedUser(user); setIsDetailModalOpen(true) }}>Details</AdminButton>
                      <AdminButton variant="ghost" size="sm" icon={<Shield className="w-4 h-4" />} onClick={() => openRoleModal(user)}>Role</AdminButton>
                      {user.status === 'ACTIVE' && (
                        <AdminButton variant="ghost" size="sm" icon={<Ban className="w-4 h-4" />} className="text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10" onClick={() => openStatusModal(user, 'SUSPENDED')}>Suspendre</AdminButton>
                      )}
                      {user.status === 'SUSPENDED' && (
                        <>
                          <AdminButton variant="ghost" size="sm" icon={<CheckCircle className="w-4 h-4" />} className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10" onClick={() => openStatusModal(user, 'ACTIVE')}>Reactiver</AdminButton>
                          <AdminButton variant="ghost" size="sm" icon={<XCircle className="w-4 h-4" />} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={() => openStatusModal(user, 'BANNED')}>Bannir</AdminButton>
                        </>
                      )}
                      {user.status === 'BANNED' && (
                        <AdminButton variant="ghost" size="sm" icon={<CheckCircle className="w-4 h-4" />} className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10" onClick={() => openStatusModal(user, 'ACTIVE')}>Debannir</AdminButton>
                      )}
                    </div>
                  </div>
                </div>
              </AdminCard>
            )
          })}
        </div>
      )}

      {/* Detail Modal */}
      <AdminModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Details de l'utilisateur" size="lg">
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              {selectedUser.image ? (
                <img src={selectedUser.image} alt={selectedUser.name} className="w-20 h-20 rounded-xl object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl">
                  {(selectedUser.name || selectedUser.email).charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{selectedUser.name || 'Sans nom'}</h3>
                <p className="text-slate-500 dark:text-slate-400">{selectedUser.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <AdminBadge variant={roleConfig[selectedUser.role]?.variant || 'default'}>{roleConfig[selectedUser.role]?.label || selectedUser.role}</AdminBadge>
                  <AdminBadge variant={statusConfig[selectedUser.status]?.variant || 'default'}>{statusConfig[selectedUser.status]?.label || selectedUser.status}</AdminBadge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Inscrit le</p>
                <p className="font-medium text-slate-900 dark:text-white">{formatDate(selectedUser.createdAt)}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Email verifie</p>
                <p className="font-medium text-slate-900 dark:text-white">{selectedUser.emailVerified ? 'Oui' : 'Non'}</p>
              </div>
            </div>

            {selectedUser.stores && selectedUser.stores.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Boutiques ({selectedUser.stores.length})</h4>
                <div className="space-y-2">
                  {selectedUser.stores.map((store: any) => (
                    <div key={store.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <Store className="w-5 h-5 text-violet-500" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{store.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">/{store.slug}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedUser.suspendedReason && selectedUser.status !== 'ACTIVE' && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">Raison de la suspension/ban</p>
                <p className="text-sm text-amber-700 dark:text-amber-400">{selectedUser.suspendedReason}</p>
              </div>
            )}
          </div>
        )}
      </AdminModal>

      {/* Status Modal */}
      <AdminModal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} title={statusAction === 'ACTIVE' ? "Réactiver l'utilisateur" : statusAction === 'SUSPENDED' ? "Suspendre l'utilisateur" : "Bannir l'utilisateur"} size="md" footer={
        <>
          <AdminButton variant="outline" onClick={() => setIsStatusModalOpen(false)}>Annuler</AdminButton>
          <AdminButton variant={statusAction === 'ACTIVE' ? 'success' : statusAction === 'SUSPENDED' ? 'secondary' : 'danger'} onClick={handleStatusChange} loading={updateUserStatus.isPending}>
            {statusAction === 'ACTIVE' ? 'Reactiver' : statusAction === 'SUSPENDED' ? 'Suspendre' : 'Bannir'}
          </AdminButton>
        </>
      }>
        <div className="space-y-4">
          {statusAction === 'BANNED' && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">Bannissement permanent</p>
                  <p className="text-sm text-red-700 dark:text-red-400">L'utilisateur ne pourra plus se connecter ni creer de compte avec cet email.</p>
                </div>
              </div>
            </div>
          )}
          <AdminTextarea label="Raison (optionnel)" value={actionReason} onChange={(e) => setActionReason(e.target.value)} placeholder="Expliquez la raison..." rows={3} />
        </div>
      </AdminModal>

      {/* Role Modal */}
      <AdminModal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} title="Modifier le role" size="md" footer={
        <>
          <AdminButton variant="outline" onClick={() => setIsRoleModalOpen(false)}>Annuler</AdminButton>
          <AdminButton variant="primary" onClick={handleRoleChange} loading={updateUserRole.isPending} disabled={!actionReason.trim()}>Modifier</AdminButton>
        </>
      }>
        <div className="space-y-4">
          <AdminSelect label="Nouveau role" value={newRole} onChange={(e) => setNewRole(e.target.value as any)} options={[
            { value: 'USER', label: 'Utilisateur' },
            { value: 'ADMIN', label: 'Admin' },
            { value: 'SUPER_ADMIN', label: 'Super Admin' },
          ]} />
          <AdminTextarea label="Raison du changement *" value={actionReason} onChange={(e) => setActionReason(e.target.value)} placeholder="Expliquez pourquoi ce changement de role..." rows={3} />
        </div>
      </AdminModal>

      {/* Create Modal */}
      <AdminModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Creer un utilisateur" size="md" footer={
        <>
          <AdminButton variant="outline" onClick={() => setIsCreateModalOpen(false)}>Annuler</AdminButton>
          <AdminButton variant="primary" onClick={handleCreateUser} loading={createUser.isPending}>Creer</AdminButton>
        </>
      }>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <AdminInput label="Nom" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="Jean Dupont" required />
          <AdminInput label="Email" type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} placeholder="jean@exemple.com" required />
          <AdminInput label="Mot de passe" type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} placeholder="********" required />
          <AdminSelect label="Role" value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as any })} options={[
            { value: 'USER', label: 'Utilisateur' },
            { value: 'ADMIN', label: 'Admin' },
            { value: 'SUPER_ADMIN', label: 'Super Admin' },
          ]} />
          {createUser.error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-700 dark:text-red-400">{createUser.error.message}</div>}
        </form>
      </AdminModal>
    </div>
  )
}
