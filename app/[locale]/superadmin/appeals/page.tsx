'use client'

import { useState } from 'react'
import { AdminCard, AdminCardHeader } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { AdminModal } from '@/components/admin/ui/AdminModal'
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState'
import { AdminTextarea } from '@/components/admin/ui/AdminTextarea'
import { AdminTabs } from '@/components/admin/ui/AdminTabs'
import { trpc } from '@/lib/trpc/client'
import { formatDate } from '@/lib/utils'
import {
  Gavel,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Store,
  User,
  MessageSquare,
  Calendar,
  Search,
  RefreshCw
} from 'lucide-react'

type AppealStatus = 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'all'

const statusConfig: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'danger' | 'default'; icon: typeof Clock }> = {
  PENDING: { label: 'En attente', variant: 'warning', icon: Clock },
  REVIEWING: { label: 'En examen', variant: 'info', icon: Eye },
  APPROVED: { label: 'Approuve', variant: 'success', icon: CheckCircle },
  REJECTED: { label: 'Rejete', variant: 'danger', icon: XCircle },
}

export default function SuperAdminAppealsPage() {
  const [statusFilter, setStatusFilter] = useState<AppealStatus>('all')
  const [selectedAppeal, setSelectedAppeal] = useState<any>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false)
  const [responseAction, setResponseAction] = useState<'APPROVED' | 'REJECTED' | 'REVIEWING'>('REVIEWING')
  const [adminResponse, setAdminResponse] = useState('')
  const [reactivateStore, setReactivateStore] = useState(true)

  const { data, isLoading, refetch } = trpc.superadmin.getAllAppeals.useQuery({
    limit: 50,
    offset: 0,
    status: statusFilter,
  })

  const updateAppealStatus = trpc.superadmin.updateAppealStatus.useMutation({
    onSuccess: () => {
      setIsResponseModalOpen(false)
      setSelectedAppeal(null)
      setAdminResponse('')
      refetch()
    },
  })

  const appeals = data?.appeals || []
  const statusCounts = data?.statusCounts || { pending: 0, reviewing: 0, approved: 0, rejected: 0 }

  const openDetailModal = (appeal: any) => {
    setSelectedAppeal(appeal)
    setIsDetailModalOpen(true)
  }

  const openResponseModal = (appeal: any, action: 'APPROVED' | 'REJECTED' | 'REVIEWING') => {
    setSelectedAppeal(appeal)
    setResponseAction(action)
    setAdminResponse('')
    setReactivateStore(action === 'APPROVED')
    setIsResponseModalOpen(true)
  }

  const handleSubmitResponse = async () => {
    if (!selectedAppeal) return
    await updateAppealStatus.mutateAsync({
      appealId: selectedAppeal.id,
      status: responseAction,
      adminResponse: adminResponse || undefined,
      reactivateStore: responseAction === 'APPROVED' ? reactivateStore : false,
    })
  }

  const tabItems = [
    { value: 'all', label: 'Tous', count: statusCounts.pending + statusCounts.reviewing + statusCounts.approved + statusCounts.rejected },
    { value: 'PENDING', label: 'En attente', count: statusCounts.pending, icon: <Clock className="w-4 h-4" /> },
    { value: 'REVIEWING', label: 'En examen', count: statusCounts.reviewing, icon: <Eye className="w-4 h-4" /> },
    { value: 'APPROVED', label: 'Approuves', count: statusCounts.approved, icon: <CheckCircle className="w-4 h-4" /> },
    { value: 'REJECTED', label: 'Rejetes', count: statusCounts.rejected, icon: <XCircle className="w-4 h-4" /> },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Appels de Suspension</h1>
          <p className="text-slate-500 dark:text-slate-400">Gerez les demandes de reactivation des boutiques suspendues</p>
        </div>
        <AdminButton variant="outline" icon={<RefreshCw className="w-4 h-4" />} onClick={() => refetch()}>
          Actualiser
        </AdminButton>
      </div>

      {/* Tabs Filter */}
      <AdminTabs
        items={tabItems}
        value={statusFilter}
        onChange={(v) => setStatusFilter(v as AppealStatus)}
        variant="pills"
      />

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && appeals.length === 0 && (
        <AdminEmptyState
          icon={Gavel}
          title="Aucun appel trouve"
          description={statusFilter === 'all' ? "Il n'y a aucun appel de suspension pour le moment." : "Aucun appel avec ce statut."}
        />
      )}

      {/* Appeals List */}
      {!isLoading && appeals.length > 0 && (
        <div className="grid gap-4">
          {appeals.map((appeal) => {
            const config = statusConfig[appeal.status] || statusConfig.PENDING
            const StatusIcon = config.icon

            return (
              <AdminCard key={appeal.id} padding="none" className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Store Logo */}
                    <div className="flex-shrink-0">
                      {appeal.store?.logo ? (
                        <img src={appeal.store.logo} alt={appeal.store.name} className="w-14 h-14 rounded-xl object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center">
                          <Store className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{appeal.store?.name || 'Boutique inconnue'}</h3>
                        <AdminBadge variant={config.variant} icon={StatusIcon}>{config.label}</AdminBadge>
                      </div>

                      {/* Appeal Message Preview */}
                      <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5" />
                          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{appeal.message}</p>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          <span>{appeal.user?.name || appeal.user?.email || 'Utilisateur'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(appeal.createdAt)}</span>
                        </div>
                        {appeal.reviewedAt && (
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4" />
                            <span>Examine le {formatDate(appeal.reviewedAt)}</span>
                          </div>
                        )}
                      </div>

                      {/* Admin Response (if any) */}
                      {appeal.adminResponse && (
                        <div className="mt-3 p-3 rounded-xl bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20">
                          <p className="text-xs font-medium text-primary-700 dark:text-primary-300 mb-1">Reponse admin</p>
                          <p className="text-sm text-primary-600 dark:text-primary-400">{appeal.adminResponse}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <AdminButton variant="outline" size="sm" icon={<Eye className="w-4 h-4" />} onClick={() => openDetailModal(appeal)}>
                        Details
                      </AdminButton>

                      {(appeal.status === 'PENDING' || appeal.status === 'REVIEWING') && (
                        <>
                          {appeal.status === 'PENDING' && (
                            <AdminButton variant="secondary" size="sm" icon={<Search className="w-4 h-4" />} onClick={() => openResponseModal(appeal, 'REVIEWING')}>
                              Examiner
                            </AdminButton>
                          )}
                          <AdminButton variant="success" size="sm" icon={<CheckCircle className="w-4 h-4" />} onClick={() => openResponseModal(appeal, 'APPROVED')}>
                            Approuver
                          </AdminButton>
                          <AdminButton variant="danger" size="sm" icon={<XCircle className="w-4 h-4" />} onClick={() => openResponseModal(appeal, 'REJECTED')}>
                            Rejeter
                          </AdminButton>
                        </>
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
      <AdminModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Details de l'appel"
        size="lg"
      >
        {selectedAppeal && (
          <div className="space-y-6">
            {/* Store Info */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              {selectedAppeal.store?.logo ? (
                <img src={selectedAppeal.store.logo} alt={selectedAppeal.store.name} className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-500/10 flex items-center justify-center">
                  <Store className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedAppeal.store?.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">/{selectedAppeal.store?.slug}</p>
                <AdminBadge variant={statusConfig[selectedAppeal.status]?.variant || 'default'} className="mt-1">
                  {statusConfig[selectedAppeal.status]?.label || selectedAppeal.status}
                </AdminBadge>
              </div>
            </div>

            {/* Suspension Reason */}
            {selectedAppeal.store?.suspendedReason && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Raison de la suspension</h4>
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-400">{selectedAppeal.store.suspendedReason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Appeal Message */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message d'appel</h4>
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{selectedAppeal.message}</p>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Chronologie</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                    <Gavel className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Appel soumis</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(selectedAppeal.createdAt)}</p>
                  </div>
                </div>
                {selectedAppeal.reviewedAt && (
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      selectedAppeal.status === 'APPROVED' ? 'bg-emerald-100 dark:bg-emerald-500/20' :
                      selectedAppeal.status === 'REJECTED' ? 'bg-red-100 dark:bg-red-500/20' :
                      'bg-blue-100 dark:bg-blue-500/20'
                    }`}>
                      {selectedAppeal.status === 'APPROVED' ? <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> :
                       selectedAppeal.status === 'REJECTED' ? <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" /> :
                       <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {selectedAppeal.status === 'APPROVED' ? 'Approuve' : selectedAppeal.status === 'REJECTED' ? 'Rejete' : 'En examen'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(selectedAppeal.reviewedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Response */}
            {selectedAppeal.adminResponse && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Reponse de l'administrateur</h4>
                <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20">
                  <p className="text-sm text-primary-700 dark:text-primary-400 whitespace-pre-wrap">{selectedAppeal.adminResponse}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </AdminModal>

      {/* Response Modal */}
      <AdminModal
        isOpen={isResponseModalOpen}
        onClose={() => setIsResponseModalOpen(false)}
        title={
          responseAction === 'APPROVED' ? "Approuver l'appel" :
          responseAction === 'REJECTED' ? "Rejeter l'appel" :
          "Mettre en examen"
        }
        size="md"
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setIsResponseModalOpen(false)}>Annuler</AdminButton>
            <AdminButton
              variant={responseAction === 'APPROVED' ? 'success' : responseAction === 'REJECTED' ? 'danger' : 'primary'}
              onClick={handleSubmitResponse}
              loading={updateAppealStatus.isPending}
            >
              {responseAction === 'APPROVED' ? 'Approuver' : responseAction === 'REJECTED' ? 'Rejeter' : 'Confirmer'}
            </AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          {responseAction === 'APPROVED' && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Approbation de l'appel</p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">Le marchand sera notifie et pourra reprendre son activite.</p>
                </div>
              </div>
            </div>
          )}

          {responseAction === 'REJECTED' && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">Rejet de l'appel</p>
                  <p className="text-sm text-red-700 dark:text-red-400">La suspension sera maintenue. Le marchand peut soumettre un nouvel appel.</p>
                </div>
              </div>
            </div>
          )}

          <AdminTextarea
            label="Reponse (optionnel)"
            value={adminResponse}
            onChange={(e) => setAdminResponse(e.target.value)}
            placeholder="Expliquez votre decision..."
            rows={4}
          />

          {responseAction === 'APPROVED' && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <input
                type="checkbox"
                id="reactivate"
                checked={reactivateStore}
                onChange={(e) => setReactivateStore(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="reactivate" className="text-sm text-slate-700 dark:text-slate-300">
                Reactiver la boutique immediatement
              </label>
            </div>
          )}
        </div>
      </AdminModal>
    </div>
  )
}
