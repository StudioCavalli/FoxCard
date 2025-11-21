'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  Store,
  User,
  Calendar,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

type AppealStatus = 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'all'

export default function AppealsPage() {
  const [statusFilter, setStatusFilter] = useState<AppealStatus>('all')
  const [selectedAppeal, setSelectedAppeal] = useState<any>(null)
  const [adminResponse, setAdminResponse] = useState('')
  const [reactivateStore, setReactivateStore] = useState(true)

  const { data, isLoading, refetch } = trpc.superadmin.getAllAppeals.useQuery({
    limit: 100,
    offset: 0,
    status: statusFilter,
  })

  const updateAppealStatus = trpc.superadmin.updateAppealStatus.useMutation({
    onSuccess: () => {
      setSelectedAppeal(null)
      setAdminResponse('')
      refetch()
    },
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'REVIEWING':
        return <Eye className="w-4 h-4 text-blue-500" />
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'En attente'
      case 'REVIEWING':
        return 'En examen'
      case 'APPROVED':
        return 'Approuve'
      case 'REJECTED':
        return 'Rejete'
      default:
        return status
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'REVIEWING':
        return 'bg-blue-100 text-blue-800'
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleApprove = () => {
    if (selectedAppeal) {
      updateAppealStatus.mutate({
        appealId: selectedAppeal.id,
        status: 'APPROVED',
        adminResponse: adminResponse || undefined,
        reactivateStore,
      })
    }
  }

  const handleReject = () => {
    if (selectedAppeal && adminResponse) {
      updateAppealStatus.mutate({
        appealId: selectedAppeal.id,
        status: 'REJECTED',
        adminResponse,
      })
    }
  }

  const handleStartReview = () => {
    if (selectedAppeal) {
      updateAppealStatus.mutate({
        appealId: selectedAppeal.id,
        status: 'REVIEWING',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des appels</h1>
        <p className="text-gray-500">Examinez et traitez les appels de suspension des marchands</p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-lg border text-left transition-all ${
            statusFilter === 'all'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{data?.total || 0}</p>
        </button>

        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`p-4 rounded-lg border text-left transition-all ${
            statusFilter === 'PENDING'
              ? 'border-yellow-500 bg-yellow-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <p className="text-sm text-gray-500">En attente</p>
          <p className="text-2xl font-bold text-yellow-600">{data?.statusCounts?.pending || 0}</p>
        </button>

        <button
          onClick={() => setStatusFilter('REVIEWING')}
          className={`p-4 rounded-lg border text-left transition-all ${
            statusFilter === 'REVIEWING'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <p className="text-sm text-gray-500">En examen</p>
          <p className="text-2xl font-bold text-blue-600">{data?.statusCounts?.reviewing || 0}</p>
        </button>

        <button
          onClick={() => setStatusFilter('APPROVED')}
          className={`p-4 rounded-lg border text-left transition-all ${
            statusFilter === 'APPROVED'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <p className="text-sm text-gray-500">Approuves</p>
          <p className="text-2xl font-bold text-green-600">{data?.statusCounts?.approved || 0}</p>
        </button>

        <button
          onClick={() => setStatusFilter('REJECTED')}
          className={`p-4 rounded-lg border text-left transition-all ${
            statusFilter === 'REJECTED'
              ? 'border-red-500 bg-red-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <p className="text-sm text-gray-500">Rejetes</p>
          <p className="text-2xl font-bold text-red-600">{data?.statusCounts?.rejected || 0}</p>
        </button>
      </div>

      {/* Appeals list */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent mx-auto" />
            <p className="text-gray-500 mt-2">Chargement...</p>
          </div>
        ) : data?.appeals?.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun appel trouve</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Boutique
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Marchand
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Raison suspension
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.appeals?.map((appeal: any) => (
                  <tr key={appeal.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{appeal.store.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm">{appeal.user.name || 'Sans nom'}</p>
                          <p className="text-xs text-gray-500">{appeal.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                          appeal.status
                        )}`}
                      >
                        {getStatusIcon(appeal.status)}
                        {getStatusLabel(appeal.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {format(new Date(appeal.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600 max-w-[200px] truncate">
                        {appeal.store.suspendedReason || 'Non specifiee'}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => setSelectedAppeal(appeal)}
                        className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                      >
                        Voir details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Appeal detail modal */}
      {selectedAppeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Detail de l'appel</h2>
                <button
                  onClick={() => {
                    setSelectedAppeal(null)
                    setAdminResponse('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  X
                </button>
              </div>
            </div>

            {/* Modal content */}
            <div className="p-6 space-y-6">
              {/* Store info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  Boutique: {selectedAppeal.store.name}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Slug</p>
                    <p>{selectedAppeal.store.slug}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Suspendue le</p>
                    <p>
                      {selectedAppeal.store.suspendedAt
                        ? format(new Date(selectedAppeal.store.suspendedAt), 'dd/MM/yyyy HH:mm', {
                            locale: fr,
                          })
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-gray-500 text-sm">Raison de la suspension</p>
                  <p className="text-red-600">{selectedAppeal.store.suspendedReason || 'Non specifiee'}</p>
                </div>
              </div>

              {/* Merchant info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Marchand
                </h3>
                <p>{selectedAppeal.user.name || 'Sans nom'}</p>
                <p className="text-sm text-gray-500">{selectedAppeal.user.email}</p>
              </div>

              {/* Appeal message */}
              <div>
                <h3 className="font-semibold mb-2">Message d'appel</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                  {selectedAppeal.message}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Soumis le {format(new Date(selectedAppeal.createdAt), "d MMMM yyyy 'a' HH:mm", { locale: fr })}
                </p>
              </div>

              {/* Admin response (if already responded) */}
              {selectedAppeal.adminResponse && (
                <div>
                  <h3 className="font-semibold mb-2">Reponse precedente</h3>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm">
                    {selectedAppeal.adminResponse}
                  </div>
                </div>
              )}

              {/* Actions for pending/reviewing appeals */}
              {(selectedAppeal.status === 'PENDING' || selectedAppeal.status === 'REVIEWING') && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold">Traiter l'appel</h3>

                  {selectedAppeal.status === 'PENDING' && (
                    <button
                      onClick={handleStartReview}
                      disabled={updateAppealStatus.isPending}
                      className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                      Marquer comme "En examen"
                    </button>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reponse a l'appel (obligatoire pour rejeter)
                    </label>
                    <textarea
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      placeholder="Votre reponse au marchand..."
                      className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="reactivate"
                      checked={reactivateStore}
                      onChange={(e) => setReactivateStore(e.target.checked)}
                      className="rounded text-orange-500 focus:ring-orange-500"
                    />
                    <label htmlFor="reactivate" className="text-sm text-gray-700">
                      Reactiver automatiquement la boutique si approuve
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleApprove}
                      disabled={updateAppealStatus.isPending}
                      className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                    >
                      {updateAppealStatus.isPending ? 'Traitement...' : 'Approuver'}
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={updateAppealStatus.isPending || !adminResponse}
                      className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                      {updateAppealStatus.isPending ? 'Traitement...' : 'Rejeter'}
                    </button>
                  </div>
                </div>
              )}

              {/* Status badge for resolved appeals */}
              {(selectedAppeal.status === 'APPROVED' || selectedAppeal.status === 'REJECTED') && (
                <div className={`p-4 rounded-lg ${selectedAppeal.status === 'APPROVED' ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className={`font-semibold ${selectedAppeal.status === 'APPROVED' ? 'text-green-800' : 'text-red-800'}`}>
                    Appel {selectedAppeal.status === 'APPROVED' ? 'approuve' : 'rejete'}
                    {selectedAppeal.reviewedAt && (
                      <span className="font-normal text-sm ml-2">
                        le {format(new Date(selectedAppeal.reviewedAt), 'dd/MM/yyyy', { locale: fr })}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="p-6 border-t bg-gray-50">
              <button
                onClick={() => {
                  setSelectedAppeal(null)
                  setAdminResponse('')
                }}
                className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
