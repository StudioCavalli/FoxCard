'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useStoreContext } from '@/lib/context/store-context'
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
import { CountryMultiSelect } from '@/components/ui/CountryMultiSelect'
import { getCountryFlag } from '@/lib/countries'

type StoreStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'CLOSED' | 'all'

const getStatusConfig = (t: (key: string) => string): Record<string, { label: string; variant: 'success' | 'danger' | 'warning' | 'default'; icon: typeof CheckCircle }> => ({
  ACTIVE: { label: t('active'), variant: 'success', icon: CheckCircle },
  SUSPENDED: { label: t('suspended'), variant: 'danger', icon: Ban },
  PENDING: { label: t('pending'), variant: 'warning', icon: Clock },
  CLOSED: { label: t('closed'), variant: 'default', icon: XCircle },
})

export default function SuperAdminStoresPage() {
  const t = useTranslations('superadmin')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale || 'fr'
  const { startImpersonation } = useStoreContext()

  const statusConfig = getStatusConfig(t)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StoreStatus>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false)
  const [selectedStore, setSelectedStore] = useState<any>(null)
  const [suspendReason, setSuspendReason] = useState('')
  const [createForm, setCreateForm] = useState({ name: '', slug: '', description: '', ownerEmail: '', commerceType: 'GENERAL' as CommerceType, countries: [] as string[] })

  const handleImpersonate = (storeId: string) => {
    startImpersonation(storeId)
    router.push(`/${locale}/merchant`)
  }

  const { data, isLoading, refetch } = trpc.superadmin.getAllStores.useQuery({
    limit: 50, offset: 0, search: search || undefined, status: statusFilter,
  })

  const createStore = trpc.superadmin.createStore.useMutation({
    onSuccess: () => { setIsCreateModalOpen(false); setCreateForm({ name: '', slug: '', description: '', ownerEmail: '', commerceType: 'GENERAL', countries: [] }); refetch() },
  })

  const updateStoreStatus = trpc.superadmin.updateStoreStatus.useMutation({
    onSuccess: () => { setIsSuspendModalOpen(false); setSelectedStore(null); setSuspendReason(''); refetch() },
  })

  const stores = data?.stores || []
  const statusCounts = data?.statusCounts || { active: 0, suspended: 0, pending: 0, closed: 0 }

  const generateSlug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault()
    await createStore.mutateAsync({ ...createForm, status: 'ACTIVE', commerceType: createForm.commerceType, countries: createForm.countries.length > 0 ? createForm.countries : undefined })
  }

  const commerceTypes = getAllCommerceTypes()

  const handleStatusChange = async (storeId: string, newStatus: 'ACTIVE' | 'SUSPENDED' | 'CLOSED', reason?: string) => {
    await updateStoreStatus.mutateAsync({ storeId, status: newStatus, reason })
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard title={t('active')} value={statusCounts.active} icon={CheckCircle} variant="emerald" className="cursor-pointer" onClick={() => setStatusFilter('ACTIVE')} />
        <AdminStatCard title={t('suspended')} value={statusCounts.suspended} icon={Ban} variant="rose" className="cursor-pointer" onClick={() => setStatusFilter('SUSPENDED')} />
        <AdminStatCard title={t('pending')} value={statusCounts.pending} icon={Clock} variant="amber" className="cursor-pointer" onClick={() => setStatusFilter('PENDING')} />
        <AdminStatCard title={t('closed')} value={statusCounts.closed} icon={XCircle} variant="slate" className="cursor-pointer" onClick={() => setStatusFilter('CLOSED')} />
      </div>

      {/* Filters */}
      <AdminCard padding="md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <AdminSearchInput
              placeholder={t('searchStores')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
            />
          </div>
          <AdminSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StoreStatus)}
            options={[
              { value: 'all', label: t('allStatuses') },
              { value: 'ACTIVE', label: t('active') },
              { value: 'SUSPENDED', label: t('suspended') },
              { value: 'PENDING', label: t('pending') },
              { value: 'CLOSED', label: t('closed') },
            ]}
          />
          <AdminButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateModalOpen(true)}>
            {t('newStore')}
          </AdminButton>
        </div>
      </AdminCard>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && stores.length === 0 && (
        <AdminEmptyState
          icon={Store}
          title={t('noStoresFound')}
          description={t('noStoresDescription')}
          action={<AdminButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateModalOpen(true)}>{t('createStore')}</AdminButton>}
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
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-500/10 flex items-center justify-center">
                          <Store className="w-8 h-8 text-primary-600 dark:text-primary-400" />
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
                            <p className="text-sm font-medium text-red-700 dark:text-red-400">{t('suspensionReason')}</p>
                            <p className="text-sm text-red-600 dark:text-red-300">{store.suspendedReason}</p>
                          </div>
                        </div>
                      )}

                      {/* Owner Info */}
                      <div className="text-sm text-slate-500 dark:text-slate-400 space-y-0.5 mb-4">
                        <p><span className="font-medium">{t('owner')}:</span> {store.owner.name || store.owner.email}</p>
                        <p><span className="font-medium">{t('email')}:</span> {store.owner.email}</p>
                        <p><span className="font-medium">{t('createdOn')}:</span> {formatDate(store.createdAt)}</p>
                        {store.countries && store.countries.length > 0 && (
                          <p className="flex items-center gap-1.5">
                            <span className="font-medium">{t('countries')}:</span>
                            <span className="text-xl flex items-center gap-1">
                              {store.countries.map((c: string) => (
                                <span key={c}>{getCountryFlag(c)}</span>
                              ))}
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                            <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('products')}</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{store._count.products}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                            <ShoppingCart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('orders')}</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{store._count.orders}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('clients')}</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{store._count.customers}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('revenue')}</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatPrice(store.revenue)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <AdminButton
                        variant="primary"
                        size="sm"
                        icon={<ExternalLink className="w-4 h-4" />}
                        onClick={() => handleImpersonate(store.id)}
                      >
                        {t('access')}
                      </AdminButton>
                      <Link href={`/superadmin/stores/${store.id}`}>
                        <AdminButton variant="outline" size="sm" icon={<Eye className="w-4 h-4" />}>{t('details')}</AdminButton>
                      </Link>

                      {store.status === 'ACTIVE' && (
                        <AdminButton variant="ghost" size="sm" icon={<Ban className="w-4 h-4" />}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10"
                          onClick={() => { setSelectedStore(store); setIsSuspendModalOpen(true) }}>
                          {t('suspend')}
                        </AdminButton>
                      )}

                      {store.status === 'SUSPENDED' && (
                        <AdminButton variant="success" size="sm" icon={<Power className="w-4 h-4" />}
                          onClick={() => handleStatusChange(store.id, 'ACTIVE')} loading={updateStoreStatus.isPending}>
                          {t('reactivate')}
                        </AdminButton>
                      )}

                      {store.status === 'PENDING' && (
                        <AdminButton variant="success" size="sm" icon={<CheckCircle className="w-4 h-4" />}
                          onClick={() => handleStatusChange(store.id, 'ACTIVE')} loading={updateStoreStatus.isPending}>
                          {t('approve')}
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
      <AdminModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title={t('createStoreTitle')} description={t('createStoreDescription')} size="md"
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setIsCreateModalOpen(false)}>{tCommon('cancel')}</AdminButton>
            <AdminButton variant="primary" onClick={handleCreateStore} loading={createStore.isPending}>{tCommon('add')}</AdminButton>
          </>
        }>
        <form onSubmit={handleCreateStore} className="space-y-4">
          <AdminInput label={t('storeName')} value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value, slug: generateSlug(e.target.value) })} placeholder={t('storeNamePlaceholder')} required />
          <AdminInput label={t('slug')} value={createForm.slug} onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} placeholder={t('slugPlaceholder')} hint={t('slugHint')} required />
          <AdminTextarea label={tCommon('description')} value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} placeholder={t('descriptionPlaceholder')} rows={3} />
          <AdminSelect
            label={t('commerceTypeLabel')}
            value={createForm.commerceType}
            onChange={(e) => setCreateForm({ ...createForm, commerceType: e.target.value as CommerceType })}
            options={commerceTypes.map((type) => ({
              value: type,
              label: `${commerceTypeConfigs[type].emoji} ${commerceTypeConfigs[type].name}`,
            }))}
            hint={t('commerceTypeHint')}
          />
          {createForm.commerceType !== 'GENERAL' && (
            <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20">
              <p className="text-sm text-primary-700 dark:text-primary-300">{commerceTypeConfigs[createForm.commerceType].description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {commerceTypeConfigs[createForm.commerceType].features.hasPhysicalProducts && (
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs rounded">{t('physical')}</span>
                )}
                {commerceTypeConfigs[createForm.commerceType].features.hasDigitalProducts && (
                  <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-xs rounded">{t('digital')}</span>
                )}
                {commerceTypeConfigs[createForm.commerceType].features.hasBookings && (
                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 text-xs rounded">{t('bookings')}</span>
                )}
                {commerceTypeConfigs[createForm.commerceType].features.requiresAgeVerification && (
                  <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs rounded">18+</span>
                )}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('activityCountries')}</label>
            <CountryMultiSelect value={createForm.countries} onChange={(countries) => setCreateForm({ ...createForm, countries })} placeholder={t('selectCountries')} />
          </div>
          <AdminInput label={t('ownerEmail')} type="email" value={createForm.ownerEmail} onChange={(e) => setCreateForm({ ...createForm, ownerEmail: e.target.value })} placeholder={t('emailPlaceholder')} hint={t('userMustHaveAccount')} required />
          {createStore.error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-700 dark:text-red-400">{createStore.error.message}</div>}
        </form>
      </AdminModal>

      {/* Suspend Modal */}
      <AdminModal isOpen={isSuspendModalOpen} onClose={() => setIsSuspendModalOpen(false)} title={t('suspendStoreTitle')} size="md"
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setIsSuspendModalOpen(false)}>{tCommon('cancel')}</AdminButton>
            <AdminButton variant="danger" onClick={() => selectedStore && handleStatusChange(selectedStore.id, 'SUSPENDED', suspendReason)} loading={updateStoreStatus.isPending} disabled={!suspendReason.trim()}>{t('suspend')}</AdminButton>
          </>
        }>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{t('warning')}</p>
              <p className="text-sm text-amber-700 dark:text-amber-400">{t('suspendWarning')}</p>
            </div>
          </div>
          <AdminTextarea label={t('suspensionReasonLabel')} value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} placeholder={t('suspensionReasonPlaceholder')} rows={3} required />
        </div>
      </AdminModal>
    </div>
  )
}
