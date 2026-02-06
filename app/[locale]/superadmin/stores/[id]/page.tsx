'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
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
import { getCountryFlag, getCountryLabel } from '@/lib/countries'
import { useParams } from 'next/navigation'

export default function StoreDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const t = useTranslations('superadmin')
  const { id } = use(params)
  const routeParams = useParams()
  const locale = (routeParams?.locale as string) || 'fr'
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
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('storeDetailsPage.loadingStore')}</p>
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <AdminEmptyState
        icon={AlertTriangle}
        title={t('storeDetailsPage.storeNotFound')}
        description={t('storeDetailsPage.storeNotFoundDesc')}
        action={
          <Link href="/superadmin/stores">
            <AdminButton variant="primary" icon={<ArrowLeft className="w-4 h-4" />}>
              {t('storeDetailsPage.backToStores')}
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
              {t('storeDetailsPage.back')}
            </AdminButton>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {store.name}
                </h1>
                {isSuspended ? (
                  <AdminBadge variant="danger">{t('storeDetailsPage.suspended')}</AdminBadge>
                ) : (
                  <AdminBadge variant="success">{t('storeDetailsPage.active')}</AdminBadge>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">/{store.slug}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/stores/${store.slug}`} target="_blank">
            <AdminButton variant="secondary" size="sm" icon={<ExternalLink className="w-4 h-4" />}>
              {t('storeDetailsPage.viewStore')}
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
              {t('storeDetailsPage.reactivate')}
            </AdminButton>
          ) : (
            <AdminButton
              variant="warning"
              size="sm"
              icon={<Ban className="w-4 h-4" />}
              onClick={() => setShowSuspendModal(true)}
            >
              {t('storeDetailsPage.suspend')}
            </AdminButton>
          )}
          <AdminButton
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setShowDeleteModal(true)}
          >
            {t('storeDetailsPage.delete')}
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
              <p className="font-semibold text-rose-900 dark:text-rose-300">{t('storeDetailsPage.storeSuspended')}</p>
              <p className="text-sm text-rose-700 dark:text-rose-400 mt-1">
                {store.suspendedReason || t('storeDetailsPage.noReasonSpecified')}
              </p>
              <p className="text-xs text-rose-600 dark:text-rose-500 mt-2">
                {t('storeDetailsPage.suspendedOn')} {new Date(store.suspendedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title={t('storeDetailsPage.products')}
          value={store._count.products}
          icon={Package}
          variant="blue"
        />
        <AdminStatCard
          title={t('storeDetailsPage.orders')}
          value={store._count.orders}
          icon={ShoppingCart}
          variant="emerald"
        />
        <AdminStatCard
          title={t('storeDetailsPage.customers')}
          value={store._count.customers}
          icon={Users}
          variant="violet"
        />
        <AdminStatCard
          title={t('storeDetailsPage.categories')}
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
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('storeDetailsPage.totalRevenue')}</p>
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
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('storeDetailsPage.pendingRevenue')}</p>
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
            <BarChart3 className="w-4 h-4 text-primary-500" />
            {t('storeDetailsPage.monthlyRevenue')}
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
                          className="h-full bg-gradient-to-r from-primary-500 to-primary-500 flex items-center px-2 transition-all duration-500"
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
                {t('storeDetailsPage.noRevenueData')}
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
              <Store className="w-4 h-4 text-primary-500" />
              {t('storeDetailsPage.information')}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-sm text-slate-500 dark:text-slate-400">{t('storeDetailsPage.slug')}</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">/{store.slug}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-sm text-slate-500 dark:text-slate-400">{t('storeDetailsPage.createdOn')}</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {new Date(store.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-sm text-slate-500 dark:text-slate-400">{t('storeDetailsPage.updatedOn')}</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {new Date(store.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              {store.domain && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> {t('storeDetailsPage.domain')}
                  </span>
                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400">{store.domain}</span>
                </div>
              )}
              {store.description && (
                <div className="pt-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">{t('storeDetailsPage.description')}</span>
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
              <User className="w-4 h-4 text-primary-500" />
              {t('storeDetailsPage.owner')}
            </h3>
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold">
                {store.owner.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 dark:text-white truncate">
                  {store.owner.name || t('storeDetailsPage.noName')}
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
                  {t('storeDetailsPage.view')}
                </AdminButton>
              </Link>
            </div>
          </div>
        </AdminCard>

        {/* Countries */}
        {store.countries && store.countries.length > 0 && (
          <AdminCard>
            <div className="p-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary-500" />
                {t('storeDetailsPage.activityCountries')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {store.countries.map((code: string) => (
                  <div
                    key={code}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <span className="text-2xl">{getCountryFlag(code)}</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {getCountryLabel(code, locale)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </AdminCard>
        )}
      </div>

      {/* Team */}
      {store.storeUsers.length > 0 && (
        <AdminCard>
          <div className="p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-500" />
              {t('storeDetailsPage.team')} ({store.storeUsers.length})
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
                      {storeUser.status === 'ACTIVE' ? t('storeDetailsPage.activeStatus') : storeUser.status}
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
        title={t('storeDetailsPage.deleteStore')}
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-rose-50 dark:bg-rose-500/10 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-900 dark:text-rose-300">{t('storeDetailsPage.irreversibleAction')}</p>
                <p className="text-sm text-rose-700 dark:text-rose-400 mt-1">
                  {t('storeDetailsPage.deleteWarning')}
                </p>
              </div>
            </div>
          </div>

          <AdminTextarea
            label={t('storeDetailsPage.deletionReason')}
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            placeholder={t('storeDetailsPage.deletionReasonPlaceholder')}
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-2">
            <AdminButton variant="secondary" onClick={() => setShowDeleteModal(false)}>
              {t('storeDetailsPage.cancel')}
            </AdminButton>
            <AdminButton
              variant="danger"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={handleDelete}
              isLoading={deleteStore.isPending}
              disabled={!deleteReason.trim()}
            >
              {t('storeDetailsPage.deleteForever')}
            </AdminButton>
          </div>
        </div>
      </AdminModal>

      {/* Suspend Modal */}
      <AdminModal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        title={t('storeDetailsPage.suspendStore')}
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
            <div className="flex items-start gap-3">
              <Ban className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-300">{t('storeDetailsPage.temporarySuspension')}</p>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  {t('storeDetailsPage.suspensionWarning')}
                </p>
              </div>
            </div>
          </div>

          <AdminTextarea
            label={t('storeDetailsPage.suspensionReason')}
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            placeholder={t('storeDetailsPage.suspensionReasonPlaceholder')}
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-2">
            <AdminButton variant="secondary" onClick={() => setShowSuspendModal(false)}>
              {t('storeDetailsPage.cancel')}
            </AdminButton>
            <AdminButton
              variant="warning"
              icon={<Ban className="w-4 h-4" />}
              onClick={handleSuspend}
              isLoading={suspendStore.isPending}
              disabled={!suspendReason.trim()}
            >
              {t('storeDetailsPage.suspendStoreButton')}
            </AdminButton>
          </div>
        </div>
      </AdminModal>
    </div>
  )
}
