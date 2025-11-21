'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AdminCard, AdminCardHeader } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { AdminInput } from '@/components/admin/ui/AdminInput'
import { AdminSelect } from '@/components/admin/ui/AdminSelect'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { AdminModal, AdminConfirmModal } from '@/components/admin/ui/AdminModal'
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState'
import { AdminSearchInput } from '@/components/admin/ui/AdminSearchInput'
import { AdminTextarea } from '@/components/admin/ui/AdminTextarea'
import { AdminStatCard } from '@/components/admin/ui/AdminStatCard'
import { trpc } from '@/lib/trpc/client'
import { formatPrice, formatDate } from '@/lib/utils'
import {
  Store,
  ArrowRight,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Plus,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  ExternalLink,
  MoreVertical,
  Eye,
  Power,
  ShoppingBag,
} from 'lucide-react'
import { commerceTypeConfigs, getAllCommerceTypes, type CommerceType } from '@/lib/commerce-types'

type StoreStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'CLOSED' | 'all'

const statusConfig: Record<string, { label: string; variant: 'success' | 'danger' | 'warning' | 'default'; icon: typeof CheckCircle }> = {
  ACTIVE: { label: 'Active', variant: 'success', icon: CheckCircle },
  SUSPENDED: { label: 'Suspendue', variant: 'danger', icon: Ban },
  PENDING: { label: 'En attente', variant: 'warning', icon: Clock },
  CLOSED: { label: 'Fermée', variant: 'default', icon: XCircle },
}

export default function SuperAdminStoresPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StoreStatus>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false)
  const [selectedStore, setSelectedStore] = useState<any>(null)
  const [suspendReason, setSuspendReason] = useState('')
  const [createForm, setCreateForm] = useState({ name: '', slug: '', description: '', ownerEmail: '', commerceType: 'GENERAL' as CommerceType })

  const { data, isLoading, refetch } = trpc.superadmin.getAllStores.useQuery({
    limit: 50, offset: 0, search: search || undefined, status: statusFilter,
  })

  const createStore = trpc.superadmin.createStore.useMutation({
    onSuccess: () => { setIsCreateModalOpen(false); setCreateForm({ name: '', slug: '', description: '', ownerEmail: '', commerceType: 'GENERAL' }); refetch() },
  })

  const updateStoreStatus = trpc.superadmin.updateStoreStatus.useMutation({
    onSuccess: () => { setIsSuspendModalOpen(false); setSelectedStore(null); setSuspendReason(''); refetch() },
  })

  const stores = data?.stores || []
  const statusCounts = data?.statusCounts || { active: 0, suspended: 0, pending: 0, closed: 0 }

  const generateSlug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault()
    await createStore.mutateAsync({ ...createForm, status: 'ACTIVE', commerceType: createForm.commerceType })
  }

  const commerceTypes = getAllCommerceTypes()

  const handleStatusChange = async (storeId: string, newStatus: 'ACTIVE' | 'SUSPENDED' | 'CLOSED', reason?: string) => {
    await updateStoreStatus.mutateAsync({ storeId, status: newStatus, reason })
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard title="Actives" value={statusCounts.active} icon={CheckCircle} variant="emerald" className="cursor-pointer" onClick={() => setStatusFilter('ACTIVE')} />
        <AdminStatCard title="Suspendues" value={statusCounts.suspended} icon={Ban} variant="rose" className="cursor-pointer" onClick={() => setStatusFilter('SUSPENDED')} />
        <AdminStatCard title="En attente" value={statusCounts.pending} icon={Clock} variant="amber" className="cursor-pointer" onClick={() => setStatusFilter('PENDING')} />
        <AdminStatCard title="Fermées" value={statusCounts.closed} icon={XCircle} variant="slate" className="cursor-pointer" onClick={() => setStatusFilter('CLOSED')} />
      </div>

      {/* Filters */}
      <AdminCard padding="md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <AdminSearchInput
              placeholder="Rechercher par nom, slug ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
            />
          </div>
          <AdminSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StoreStatus)}
            options={[
              { value: 'all', label: 'Tous les statuts' },
              { value: 'ACTIVE', label: 'Actives' },
              { value: 'SUSPENDED', label: 'Suspendues' },
              { value: 'PENDING', label: 'En attente' },
              { value: 'CLOSED', label: 'Fermées' },
            ]}
          />
          <AdminButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateModalOpen(true)}>
            Nouvelle boutique
          </AdminButton>
        </div>
      </AdminCard>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && stores.length === 0 && (
        <AdminEmptyState
          icon={Store}
          title="Aucune boutique trouvée"
          description="Créez une nouvelle boutique ou modifiez vos filtres de recherche."
          action={<AdminButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateModalOpen(true)}>Créer une boutique</AdminButton>}
        />
      )}

      {/* Stores List */}
      {!isLoading && stores.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {stores.map((store) => {
            const config = statusConfig[store.status] || statusConfig.ACTIVE
            const StatusIcon = config.icon

            return (
              <AdminCard key={store.id} hover padding="none" className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                      {store.logo ? (
                        <img src={store.logo} alt={store.name} className="w-16 h-16 rounded-xl object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center">
                          <Store className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">{store.name}</h3>
                        <AdminBadge variant={config.variant} icon={StatusIcon}>{config.label}</AdminBadge>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">/{store.slug}</p>

                      {store.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4">{store.description}</p>
                      )}

                      {store.status === 'SUSPENDED' && store.suspendedReason && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-700 dark:text-red-400">Raison de la suspension</p>
                            <p className="text-sm text-red-600 dark:text-red-300">{store.suspendedReason}</p>
                          </div>
                        </div>
                      )}

                      {/* Owner Info */}
                      <div className="text-sm text-slate-500 dark:text-slate-400 space-y-0.5 mb-4">
                        <p><span className="font-medium">Propriétaire:</span> {store.owner.name || store.owner.email}</p>
                        <p><span className="font-medium">Email:</span> {store.owner.email}</p>
                        <p><span className="font-medium">Créée le:</span> {formatDate(store.createdAt)}</p>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                            <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Produits</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{store._count.products}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                            <ShoppingCart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Commandes</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{store._count.orders}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Clients</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{store._count.customers}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Revenu</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatPrice(store.revenue)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Link href={`/superadmin/stores/${store.id}`}>
                        <AdminButton variant="outline" size="sm" icon={<Eye className="w-4 h-4" />}>Détails</AdminButton>
                      </Link>

                      {store.status === 'ACTIVE' && (
                        <AdminButton variant="ghost" size="sm" icon={<Ban className="w-4 h-4" />}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10"
                          onClick={() => { setSelectedStore(store); setIsSuspendModalOpen(true) }}>
                          Suspendre
                        </AdminButton>
                      )}

                      {store.status === 'SUSPENDED' && (
                        <AdminButton variant="success" size="sm" icon={<Power className="w-4 h-4" />}
                          onClick={() => handleStatusChange(store.id, 'ACTIVE')} loading={updateStoreStatus.isPending}>
                          Réactiver
                        </AdminButton>
                      )}

                      {store.status === 'PENDING' && (
                        <AdminButton variant="success" size="sm" icon={<CheckCircle className="w-4 h-4" />}
                          onClick={() => handleStatusChange(store.id, 'ACTIVE')} loading={updateStoreStatus.isPending}>
                          Approuver
                        </AdminButton>
                      )}
                    </div>
                  </div>
                </div>
              </AdminCard>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      <AdminModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Créer une boutique" description="Remplissez les informations pour créer une nouvelle boutique." size="md"
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setIsCreateModalOpen(false)}>Annuler</AdminButton>
            <AdminButton variant="primary" onClick={handleCreateStore} loading={createStore.isPending}>Créer</AdminButton>
          </>
        }>
        <form onSubmit={handleCreateStore} className="space-y-4">
          <AdminInput label="Nom de la boutique" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value, slug: generateSlug(e.target.value) })} placeholder="Ma Boutique" required />
          <AdminInput label="Slug (URL)" value={createForm.slug} onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} placeholder="ma-boutique" hint="foxcard.io/votre-slug" required />
          <AdminTextarea label="Description" value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} placeholder="Description..." rows={3} />
          <AdminSelect
            label="Type de commerce"
            value={createForm.commerceType}
            onChange={(e) => setCreateForm({ ...createForm, commerceType: e.target.value as CommerceType })}
            options={commerceTypes.map((type) => ({
              value: type,
              label: `${commerceTypeConfigs[type].emoji} ${commerceTypeConfigs[type].name}`,
            }))}
            hint="Définit les fonctionnalités disponibles pour cette boutique"
          />
          {createForm.commerceType !== 'GENERAL' && (
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
              <p className="text-sm text-indigo-700 dark:text-indigo-300">{commerceTypeConfigs[createForm.commerceType].description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {commerceTypeConfigs[createForm.commerceType].features.hasPhysicalProducts && (
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs rounded">Physique</span>
                )}
                {commerceTypeConfigs[createForm.commerceType].features.hasDigitalProducts && (
                  <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-xs rounded">Digital</span>
                )}
                {commerceTypeConfigs[createForm.commerceType].features.hasBookings && (
                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 text-xs rounded">Réservations</span>
                )}
                {commerceTypeConfigs[createForm.commerceType].features.requiresAgeVerification && (
                  <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs rounded">18+</span>
                )}
              </div>
            </div>
          )}
          <AdminInput label="Email du propriétaire" type="email" value={createForm.ownerEmail} onChange={(e) => setCreateForm({ ...createForm, ownerEmail: e.target.value })} placeholder="email@exemple.com" hint="L'utilisateur doit avoir un compte" required />
          {createStore.error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-700 dark:text-red-400">{createStore.error.message}</div>}
        </form>
      </AdminModal>

      {/* Suspend Modal */}
      <AdminModal isOpen={isSuspendModalOpen} onClose={() => setIsSuspendModalOpen(false)} title="Suspendre la boutique" size="md"
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setIsSuspendModalOpen(false)}>Annuler</AdminButton>
            <AdminButton variant="danger" onClick={() => selectedStore && handleStatusChange(selectedStore.id, 'SUSPENDED', suspendReason)} loading={updateStoreStatus.isPending} disabled={!suspendReason.trim()}>Suspendre</AdminButton>
          </>
        }>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Attention</p>
              <p className="text-sm text-amber-700 dark:text-amber-400">La suspension empêchera le marchand d'accéder à son espace et bloquera toutes les opérations.</p>
            </div>
          </div>
          <AdminTextarea label="Raison de la suspension" value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} placeholder="Expliquez la raison..." rows={3} required />
        </div>
      </AdminModal>
    </div>
  )
}
