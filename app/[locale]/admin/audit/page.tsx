'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  FileText,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Activity,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import { useStoreContext } from '@/lib/context/store-context'

export default function AuditLogsPage() {
  const { storeId } = useStoreContext()
  const [filters, setFilters] = useState({
    action: '',
    userId: '',
    entity: '',
    startDate: '',
    endDate: '',
  })
  const [page, setPage] = useState(0)
  const limit = 50

  // Queries
  const { data: logsData, isLoading } = trpc.audit.list.useQuery({
    storeId: storeId!,
    limit,
    offset: page * limit,
    action: filters.action || undefined,
    userId: filters.userId || undefined,
    entity: filters.entity || undefined,
    startDate: filters.startDate ? new Date(filters.startDate) : undefined,
    endDate: filters.endDate ? new Date(filters.endDate) : undefined,
  }, { enabled: !!storeId })

  const { data: stats } = trpc.audit.getStats.useQuery({
    storeId: storeId!,
    days: 30,
  }, { enabled: !!storeId })

  const { data: actions } = trpc.audit.getActions.useQuery({ storeId: storeId! }, { enabled: !!storeId })
  const { data: entities } = trpc.audit.getEntities.useQuery({ storeId: storeId! }, { enabled: !!storeId })
  const { data: users } = trpc.role.getStoreUsers.useQuery({ storeId: storeId! }, { enabled: !!storeId })

  const handleResetFilters = () => {
    setFilters({
      action: '',
      userId: '',
      entity: '',
      startDate: '',
      endDate: '',
    })
    setPage(0)
  }

  const getActionIcon = (action: string) => {
    if (action.includes('create')) return <CheckCircle className="w-4 h-4 text-green-600" />
    if (action.includes('update')) return <Activity className="w-4 h-4 text-blue-600" />
    if (action.includes('delete')) return <XCircle className="w-4 h-4 text-red-600" />
    if (action.includes('suspend')) return <AlertTriangle className="w-4 h-4 text-orange-600" />
    return <Activity className="w-4 h-4 text-gray-600" />
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'product.create': 'Produit créé',
      'product.update': 'Produit modifié',
      'product.delete': 'Produit supprimé',
      'order.create': 'Commande créée',
      'order.update': 'Commande modifiée',
      'order.refund': 'Commande remboursée',
      'user.assign_role': 'Rôle assigné',
      'user.suspend': 'Utilisateur suspendu',
      'user.reactivate': 'Utilisateur réactivé',
      'user.remove': 'Utilisateur retiré',
      'role.create': 'Rôle créé',
      'role.update': 'Rôle modifié',
      'role.delete': 'Rôle supprimé',
      'email.send': 'Email envoyé',
      'newsletter.send': 'Newsletter envoyée',
    }
    return labels[action] || action
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Journal d'audit</h1>
        <p className="text-gray-600">
          Consultez l'historique de toutes les actions effectuées sur votre magasin
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total actions (30j)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLogs}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Taux de réussite</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.successRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Actions échouées</p>
                <p className="text-2xl font-bold text-gray-900">{stats.failedLogs}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Utilisateurs actifs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.uniqueUsers}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Filtres</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <select
              value={filters.action}
              onChange={(e) => {
                setFilters({ ...filters, action: e.target.value })
                setPage(0)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Toutes les actions</option>
              {actions?.map((action) => (
                <option key={action} value={action}>
                  {getActionLabel(action)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entité
            </label>
            <select
              value={filters.entity}
              onChange={(e) => {
                setFilters({ ...filters, entity: e.target.value })
                setPage(0)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Toutes les entités</option>
              {entities?.map((entity) => (
                <option key={entity} value={entity}>
                  {entity}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Utilisateur
            </label>
            <select
              value={filters.userId}
              onChange={(e) => {
                setFilters({ ...filters, userId: e.target.value })
                setPage(0)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Tous les utilisateurs</option>
              {users?.map((user: any) => (
                <option key={user.user.id} value={user.user.id}>
                  {user.user.name || user.user.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date début
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => {
                setFilters({ ...filters, startDate: e.target.value })
                setPage(0)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date fin
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => {
                setFilters({ ...filters, endDate: e.target.value })
                setPage(0)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {(filters.action || filters.userId || filters.entity || filters.startDate || filters.endDate) && (
          <div className="mt-4">
            <Button variant="ghost" size="sm" onClick={handleResetFilters}>
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </Card>

      {/* Logs Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Heure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
                    Chargement...
                  </td>
                </tr>
              ) : logsData?.logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p>Aucun log trouvé</p>
                  </td>
                </tr>
              ) : (
                logsData?.logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.createdAt).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {log.user.name || 'Sans nom'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="text-sm text-gray-900">
                          {getActionLabel(log.action)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.entity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.success ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3" />
                          Succès
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <XCircle className="w-3 h-3" />
                          Échec
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {logsData && logsData.total > limit && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {page * limit + 1} - {Math.min((page + 1) * limit, logsData.total)} sur{' '}
              {logsData.total}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
              >
                Précédent
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!logsData.hasMore}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
