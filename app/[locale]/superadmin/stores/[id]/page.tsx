'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { formatPrice } from '@/lib/utils'
import {
  AdminCard,
  AdminStatCard,
  AdminButton,
  AdminBadge,
  AdminModal,
  AdminEmptyState,
  AdminTextarea,
} from '@/components/admin/ui'
import {
  ArrowLeft,
  Store,
  User,
  Package,
  ShoppingCart,
  Users,
  Trash2,
  AlertTriangle,
  Ban,
  ExternalLink,
  Calendar,
  Globe,
  Mail,
  Shield,
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  BarChart3,
  Tag,
} from 'lucide-react'

export default function StoreDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')
  const [suspendReason, setSuspendReason] = useState('')

  const { data: store, isLoading, refetch } = trpc.superadmin.getStoreDetails.useQuery({ storeId: id })
  const deleteStore = trpc.superadmin.deleteStore.useMutation({
    onSuccess: () => {
      window.location.href = '/superadmin/stores'
    }
  })
  const suspendStore = trpc.superadmin.suspendStore.useMutation({
    onSuccess: () => {
      refetch()
      setShowSuspendModal(false)
      setSuspendReason('')
    }
  })
  const unsuspendStore = trpc.superadmin.unsuspendStore.useMutation({
    onSuccess: () => {
      refetch()
    }
  })

  const handleDelete = async () => {
    if (!deleteReason.trim()) return
    await deleteStore.mutateAsync({
      storeId: id,
      confirm: true,
      reason: deleteReason,
    })
  }

  const handleSuspend = async () => {
    if (!suspendReason.trim()) return
    await suspendStore.mutateAsync({
      storeId: id,
      reason: suspendReason,
    })
  }

  const handleUnsuspend = async () => {
    await unsuspendStore.mutateAsync({ storeId: id })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Chargement de la boutique...</p>
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <AdminEmptyState
        icon={AlertTriangle}
        title="Boutique introuvable"
        description="Cette boutique n'existe pas ou a été supprimée"
        action={
          <Link href="/superadmin/stores">
            <AdminButton variant="primary" icon={<ArrowLeft className="w-4 h-4" />}>
              Retour aux boutiques
            </AdminButton>
          </Link>
        }
      />
    )
  }

  const isSuspended = store.status === 'SUSPENDED'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/superadmin/stores">
            <AdminButton variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Retour
            </AdminButton>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {store.name}
                </h1>
                {isSuspended ? (
                  <AdminBadge variant="danger">Suspendue</AdminBadge>
                ) : (
                  <AdminBadge variant="success">Active</AdminBadge>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">/{store.slug}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/stores/${store.slug}`} target="_blank">
            <AdminButton variant="secondary" size="sm" icon={<ExternalLink className="w-4 h-4" />}>
              Voir la boutique
            </AdminButton>
          </Link>
          {isSuspended ? (
            <AdminButton
              variant="success"
              size="sm"
              icon={<CheckCircle className="w-4 h-4" />}
              onClick={handleUnsuspend}
              isLoading={unsuspendStore.isPending}
            >
              Réactiver
            </AdminButton>
          ) : (
            <AdminButton
              variant="warning"
              size="sm"
              icon={<Ban className="w-4 h-4" />}
              onClick={() => setShowSuspendModal(true)}
            >
              Suspendre
            </AdminButton>
          )}
          <AdminButton
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setShowDeleteModal(true)}
          >
            Supprimer
          </AdminButton>
        </div>
      </div>

      {/* Suspended Banner */}
      {isSuspended && store.suspendedAt && (
        <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center flex-shrink-0">
              <Ban className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="font-semibold text-rose-900 dark:text-rose-300">Boutique suspendue</p>
              <p className="text-sm text-rose-700 dark:text-rose-400 mt-1">
                {store.suspendedReason || 'Aucune raison spécifiée'}
              </p>
              <p className="text-xs text-rose-600 dark:text-rose-500 mt-2">
                Suspendue le {new Date(store.suspendedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="Produits"
          value={store._count.products}
          icon={Package}
          variant="blue"
        />
        <AdminStatCard
          title="Commandes"
          value={store._count.orders}
          icon={ShoppingCart}
          variant="emerald"
        />
        <AdminStatCard
          title="Clients"
          value={store._count.customers}
          icon={Users}
          variant="violet"
        />
        <AdminStatCard
          title="Catégories"
          value={store._count.categories}
          icon={Tag}
          variant="amber"
        />
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AdminCard>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Revenu Total</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatPrice(store.stats.totalRevenue)}
                </p>
              </div>
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Revenu en attente</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {formatPrice(store.stats.pendingRevenue)}
                </p>
              </div>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Monthly Revenue Chart */}
      <AdminCard>
        <div className="p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-violet-500" />
            Revenus mensuels
          </h3>
          <div className="space-y-3">
            {Object.entries(store.stats.monthlyRevenue)
              .sort(([a], [b]) => a.localeCompare(b))
              .slice(-6)
              .map(([month, revenue]) => {
                const maxRevenue = Math.max(...Object.values(store.stats.monthlyRevenue), 1)
                const percentage = (revenue / maxRevenue) * 100

                return (
                  <div key={month} className="flex items-center gap-3">
                    <div className="w-16 text-xs font-medium text-slate-500 dark:text-slate-400">{month}</div>
                    <div className="flex-1">
                      <div className="h-7 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center px-2 transition-all duration-500"
                          style={{ width: `${Math.max(percentage, 5)}%` }}
                        >
                          {percentage > 20 && (
                            <span className="text-xs font-medium text-white">
                              {formatPrice(revenue)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {percentage <= 20 && (
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 w-20 text-right">
                        {formatPrice(revenue)}
                      </span>
                    )}
                  </div>
                )
              })}
            {Object.keys(store.stats.monthlyRevenue).length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                Aucune donnée de revenu disponible
              </p>
            )}
          </div>
        </div>
      </AdminCard>

      {/* Store Info & Owner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Store Info */}
        <AdminCard>
          <div className="p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Store className="w-4 h-4 text-violet-500" />
              Informations
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-sm text-slate-500 dark:text-slate-400">Slug</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">/{store.slug}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-sm text-slate-500 dark:text-slate-400">Créée le</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {new Date(store.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-sm text-slate-500 dark:text-slate-400">Mise à jour</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {new Date(store.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              {store.domain && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> Domaine
                  </span>
                  <span className="text-sm font-medium text-violet-600 dark:text-violet-400">{store.domain}</span>
                </div>
              )}
              {store.description && (
                <div className="pt-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Description</span>
                  <p className="text-sm text-slate-900 dark:text-white mt-1">{store.description}</p>
                </div>
              )}
            </div>
          </div>
        </AdminCard>

        {/* Owner Info */}
        <AdminCard>
          <div className="p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-violet-500" />
              Propriétaire
            </h3>
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                {store.owner.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 dark:text-white truncate">
                  {store.owner.name || 'Sans nom'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {store.owner.email}
                </p>
                <AdminBadge variant="purple" className="mt-2">
                  <Shield className="w-3 h-3" />
                  {store.owner.role}
                </AdminBadge>
              </div>
              <Link href={`/superadmin/users?search=${store.owner.email}`}>
                <AdminButton variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />}>
                  Voir
                </AdminButton>
              </Link>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Team */}
      {store.storeUsers.length > 0 && (
        <AdminCard>
          <div className="p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-500" />
              Équipe ({store.storeUsers.length})
            </h3>
            <div className="space-y-2">
              {store.storeUsers.map((storeUser) => (
                <div
                  key={storeUser.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {storeUser.user.name || storeUser.user.email}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {storeUser.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AdminBadge variant="info">{storeUser.role.name}</AdminBadge>
                    <AdminBadge
                      variant={storeUser.status === 'ACTIVE' ? 'success' : 'warning'}
                    >
                      {storeUser.status === 'ACTIVE' ? 'Actif' : storeUser.status}
                    </AdminBadge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AdminCard>
      )}

      {/* Delete Modal */}
      <AdminModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Supprimer la boutique"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-rose-50 dark:bg-rose-500/10 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-900 dark:text-rose-300">Action irréversible</p>
                <p className="text-sm text-rose-700 dark:text-rose-400 mt-1">
                  Toutes les données de la boutique seront définitivement supprimées : produits, commandes, clients, etc.
                </p>
              </div>
            </div>
          </div>

          <AdminTextarea
            label="Raison de la suppression"
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            placeholder="Expliquez pourquoi cette boutique est supprimée..."
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-2">
            <AdminButton variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Annuler
            </AdminButton>
            <AdminButton
              variant="danger"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={handleDelete}
              isLoading={deleteStore.isPending}
              disabled={!deleteReason.trim()}
            >
              Supprimer définitivement
            </AdminButton>
          </div>
        </div>
      </AdminModal>

      {/* Suspend Modal */}
      <AdminModal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        title="Suspendre la boutique"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
            <div className="flex items-start gap-3">
              <Ban className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-300">Suspension temporaire</p>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  La boutique sera inaccessible aux visiteurs. Le propriétaire pourra faire appel de cette décision.
                </p>
              </div>
            </div>
          </div>

          <AdminTextarea
            label="Raison de la suspension"
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            placeholder="Expliquez pourquoi cette boutique est suspendue..."
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-2">
            <AdminButton variant="secondary" onClick={() => setShowSuspendModal(false)}>
              Annuler
            </AdminButton>
            <AdminButton
              variant="warning"
              icon={<Ban className="w-4 h-4" />}
              onClick={handleSuspend}
              isLoading={suspendStore.isPending}
              disabled={!suspendReason.trim()}
            >
              Suspendre la boutique
            </AdminButton>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}
