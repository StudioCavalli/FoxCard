'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { formatDate } from '@/lib/utils'
import {
  AdminCard,
  AdminStatCard,
  AdminTabs,
  AdminSearchInput,
  AdminSelect,
  AdminButton,
  AdminBadge,
  AdminEmptyState,
} from '@/components/admin/ui'
import {
  Activity,
  User,
  Store,
  Package,
  ShoppingCart,
  Settings,
  Shield,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  Eye,
  Loader2,
  Filter,
  Hash,
} from 'lucide-react'

type EntityFilter = 'all' | 'User' | 'Store' | 'Product' | 'Order' | 'SuspensionAppeal'

const entityConfig: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  User: {
    icon: <User className="w-4 h-4" />,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-500/20',
  },
  Store: {
    icon: <Store className="w-4 h-4" />,
    color: 'text-primary-600 dark:text-primary-400',
    bgColor: 'bg-primary-100 dark:bg-primary-500/20',
  },
  Product: {
    icon: <Package className="w-4 h-4" />,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-500/20',
  },
  Order: {
    icon: <ShoppingCart className="w-4 h-4" />,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-500/20',
  },
  SuspensionAppeal: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-100 dark:bg-rose-500/20',
  },
  default: {
    icon: <Settings className="w-4 h-4" />,
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-500/20',
  },
}

const getActionConfig = (action: string) => {
  if (action.includes('CREATE') || action.includes('CREATED')) {
    return { icon: <Plus className="w-4 h-4" />, variant: 'success' as const, label: 'Création' }
  }
  if (action.includes('UPDATE') || action.includes('UPDATED')) {
    return { icon: <Edit className="w-4 h-4" />, variant: 'info' as const, label: 'Modification' }
  }
  if (action.includes('DELETE') || action.includes('DELETED')) {
    return { icon: <Trash2 className="w-4 h-4" />, variant: 'danger' as const, label: 'Suppression' }
  }
  if (action.includes('SUSPEND') || action.includes('BAN')) {
    return { icon: <XCircle className="w-4 h-4" />, variant: 'warning' as const, label: 'Suspension' }
  }
  if (action.includes('ACTIVE') || action.includes('APPROVED') || action.includes('REACTIVATED')) {
    return { icon: <CheckCircle className="w-4 h-4" />, variant: 'success' as const, label: 'Activation' }
  }
  if (action.includes('REVIEW')) {
    return { icon: <Eye className="w-4 h-4" />, variant: 'default' as const, label: 'Révision' }
  }
  return { icon: <Activity className="w-4 h-4" />, variant: 'default' as const, label: 'Action' }
}

const formatActionLabel = (action: string) => {
  return action
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase())
}

export default function SuperAdminActivityPage() {
  const [search, setSearch] = useState('')
  const [entityFilter, setEntityFilter] = useState<EntityFilter>('all')
  const [actionFilter, setActionFilter] = useState('')
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const limit = 50

  const { data, isLoading, refetch } = trpc.superadmin.getAllActivity.useQuery({
    limit,
    offset: page * limit,
    search: search || undefined,
    entity: entityFilter !== 'all' ? entityFilter : undefined,
    action: actionFilter || undefined,
  })

  const { data: stats } = trpc.superadmin.getActivityStats.useQuery()

  const activities = data?.activities || []

  const entityTabs = [
    { value: 'all', label: 'Tout', count: data?.total || 0 },
    ...(data?.entityCounts?.map((ec) => ({
      value: ec.entity,
      label: ec.entity,
      count: ec.count,
      icon: entityConfig[ec.entity]?.icon || entityConfig.default.icon,
    })) || []),
  ]

  const actionOptions = [
    { value: '', label: 'Toutes les actions' },
    ...(data?.actionCounts?.map((ac) => ({
      value: ac.action,
      label: `${formatActionLabel(ac.action)} (${ac.count})`,
    })) || []),
  ]

  const formatMetadata = (metadata: any) => {
    if (!metadata) return null

    const entries = Object.entries(metadata).filter(
      ([key]) => !['performedBy'].includes(key)
    )

    if (entries.length === 0) return null

    return (
      <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm space-y-2">
        {entries.map(([key, value]) => (
          <div key={key} className="flex gap-3">
            <span className="text-slate-500 dark:text-slate-400 font-medium min-w-[140px]">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}:
            </span>
            <span className="text-slate-700 dark:text-slate-300">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Journal d'Activité
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {data?.total || 0} action{(data?.total || 0) > 1 ? 's' : ''} enregistrée{(data?.total || 0) > 1 ? 's' : ''}
          </p>
        </div>
        <AdminButton
          variant="secondary"
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={() => refetch()}
        >
          Actualiser
        </AdminButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="Aujourd'hui"
          value={stats?.today || 0}
          icon={Clock}
          variant="violet"
        />
        <AdminStatCard
          title="Cette semaine"
          value={stats?.thisWeek || 0}
          icon={Calendar}
          variant="blue"
        />
        <AdminStatCard
          title="Ce mois"
          value={stats?.thisMonth || 0}
          icon={Calendar}
          variant="emerald"
        />
        <AdminStatCard
          title="Total"
          value={stats?.total || 0}
          icon={Activity}
          variant="amber"
        />
      </div>

      {/* Filters */}
      <AdminCard>
        <div className="p-4 space-y-4">
          {/* Entity Tabs */}
          <AdminTabs
            items={entityTabs}
            value={entityFilter}
            onChange={(v) => {
              setEntityFilter(v as EntityFilter)
              setPage(0)
            }}
            variant="pills"
            size="sm"
          />

          {/* Search and Action Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <AdminSearchInput
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(0)
                }}
                placeholder="Rechercher par action ou entité..."
              />
            </div>
            <div className="sm:w-64">
              <AdminSelect
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value)
                  setPage(0)
                }}
                options={actionOptions}
              />
            </div>
          </div>
        </div>
      </AdminCard>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Chargement des activités...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && activities.length === 0 && (
        <AdminEmptyState
          icon={Activity}
          title="Aucune activité trouvée"
          description={search || entityFilter !== 'all' || actionFilter
            ? "Aucune activité ne correspond à vos critères de recherche"
            : "Les activités de la plateforme apparaîtront ici"
          }
          action={
            (search || entityFilter !== 'all' || actionFilter) ? (
              <AdminButton
                variant="secondary"
                onClick={() => {
                  setSearch('')
                  setEntityFilter('all')
                  setActionFilter('')
                }}
              >
                Réinitialiser les filtres
              </AdminButton>
            ) : undefined
          }
        />
      )}

      {/* Activity List */}
      {!isLoading && activities.length > 0 && (
        <AdminCard>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {activities.map((activity: any) => {
              const entity = entityConfig[activity.entity] || entityConfig.default
              const action = getActionConfig(activity.action)
              const isExpanded = expandedActivity === activity.id

              return (
                <div
                  key={activity.id}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Entity Icon */}
                    <div className={`w-10 h-10 rounded-xl ${entity.bgColor} ${entity.color} flex items-center justify-center flex-shrink-0`}>
                      {entity.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Action Header */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={entity.color}>{action.icon}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatActionLabel(activity.action)}
                        </span>
                        <AdminBadge variant={action.variant} size="sm">
                          {activity.entity}
                        </AdminBadge>
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                        {/* User who performed action */}
                        {activity.user && (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            <span>{activity.user.name || activity.user.email}</span>
                            {activity.user.role === 'SUPER_ADMIN' && (
                              <Shield className="w-3.5 h-3.5 text-primary-500" />
                            )}
                          </div>
                        )}

                        {/* Store */}
                        {activity.store && (
                          <div className="flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5" />
                            <span>{activity.store.name}</span>
                          </div>
                        )}

                        {/* Timestamp */}
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatDate(activity.createdAt)}</span>
                        </div>
                      </div>

                      {/* Expand/Collapse Metadata */}
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <button
                          onClick={() => setExpandedActivity(isExpanded ? null : activity.id)}
                          className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Masquer les détails
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Voir les détails
                            </>
                          )}
                        </button>
                      )}

                      {/* Expanded Metadata */}
                      {isExpanded && formatMetadata(activity.metadata)}
                    </div>

                    {/* Entity ID */}
                    {activity.entityId && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg flex-shrink-0">
                        <Hash className="w-3 h-3" />
                        {activity.entityId.slice(-8)}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination Footer */}
          {data && data.total > limit && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Affichage {page * limit + 1} - {Math.min((page + 1) * limit, data.total)} sur {data.total}
              </p>
              <div className="flex gap-2">
                <AdminButton
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Précédent
                </AdminButton>
                <AdminButton
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data.hasMore}
                >
                  Suivant
                </AdminButton>
              </div>
            </div>
          )}
        </AdminCard>
      )}
    </div>
  )
}
