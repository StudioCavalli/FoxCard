'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'

export default function TransactionsPage() {
  const { storeId } = useStoreContext()
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({})
  const [page, setPage] = useState(1)
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState<string>('CUSTOMER_REQUEST')
  const [showRefundModal, setShowRefundModal] = useState(false)

  const { data, isLoading, refetch } = trpc.paymentGateway.listTransactions.useQuery({
    storeId: storeId!,
    status: statusFilter as any || undefined,
    startDate: dateRange.start,
    endDate: dateRange.end,
    page,
    limit: 20
  }, { enabled: !!storeId })

  const { data: transactionDetails } = trpc.paymentGateway.getTransaction.useQuery(
    { transactionId: selectedTransaction! },
    { enabled: !!selectedTransaction }
  )

  const refundMutation = trpc.paymentGateway.createRefund.useMutation({
    onSuccess: () => {
      setShowRefundModal(false)
      setSelectedTransaction(null)
      setRefundAmount('')
      refetch()
    }
  })

  const handleRefund = async () => {
    if (!selectedTransaction || !refundAmount) return

    await refundMutation.mutateAsync({
      transactionId: selectedTransaction,
      amount: parseFloat(refundAmount) * 100, // Convert to cents
      reason: refundReason as any
    })
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      AUTHORIZED: 'bg-blue-100 text-blue-800',
      CAPTURED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
      REFUNDED: 'bg-purple-100 text-purple-800',
      PARTIALLY_REFUNDED: 'bg-orange-100 text-orange-800',
      DISPUTED: 'bg-red-100 text-red-800'
    }

    const labels: Record<string, string> = {
      PENDING: 'En attente',
      AUTHORIZED: 'Autorisé',
      CAPTURED: 'Capturé',
      FAILED: 'Échoué',
      CANCELLED: 'Annulé',
      REFUNDED: 'Remboursé',
      PARTIALLY_REFUNDED: 'Part. remboursé',
      DISPUTED: 'Litige'
    }

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    )
  }

  const getRiskBadge = (level: string) => {
    const styles: Record<string, string> = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      CRITICAL: 'bg-red-100 text-red-800'
    }

    return (
      <span className={`px-2 py-1 text-xs rounded ${styles[level] || 'bg-gray-100'}`}>
        {level}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-600">Gestion et réconciliation des paiements</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tous</option>
            <option value="PENDING">En attente</option>
            <option value="AUTHORIZED">Autorisé</option>
            <option value="CAPTURED">Capturé</option>
            <option value="FAILED">Échoué</option>
            <option value="REFUNDED">Remboursé</option>
            <option value="DISPUTED">Litige</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date début
          </label>
          <input
            type="date"
            onChange={(e) => {
              setDateRange({ ...dateRange, start: e.target.value ? new Date(e.target.value) : undefined })
              setPage(1)
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date fin
          </label>
          <input
            type="date"
            onChange={(e) => {
              setDateRange({ ...dateRange, end: e.target.value ? new Date(e.target.value) : undefined })
              setPage(1)
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <button
          onClick={() => {
            const csv = generateCSV(data?.transactions || [])
            downloadCSV(csv, 'transactions.csv')
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          📥 Exporter CSV
        </button>
      </div>

      {/* Transactions table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID Transaction
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Montant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Risque
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Méthode
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono text-sm">{tx.transactionId}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(tx.createdAt).toLocaleString('fr-FR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {(tx.amount / 100).toFixed(2)} {tx.currency}
                  </div>
                  {tx.refundedAmount > 0 && (
                    <div className="text-xs text-red-600">
                      -{(tx.refundedAmount / 100).toFixed(2)} remboursé
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(tx.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRiskBadge(tx.riskLevel)}
                  {tx.riskScore && (
                    <span className="ml-1 text-xs text-gray-500">
                      ({tx.riskScore})
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tx.paymentMethod}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={() => setSelectedTransaction(tx.id)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    Détails
                  </button>
                  {(tx.status === 'CAPTURED' || tx.status === 'PARTIALLY_REFUNDED') && (
                    <button
                      onClick={() => {
                        setSelectedTransaction(tx.id)
                        setRefundAmount(((tx.amount - tx.refundedAmount) / 100).toFixed(2))
                        setShowRefundModal(true)
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Rembourser
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data?.transactions.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Aucune transaction trouvée
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            ←
          </button>
          <span className="px-3 py-1">
            Page {page} / {data.pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= data.pagination.totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            →
          </button>
        </div>
      )}

      {/* Transaction details modal */}
      {selectedTransaction && transactionDetails && !showRefundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">
                Transaction {transactionDetails.transactionId}
              </h3>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Montant</p>
                <p className="font-semibold">
                  {(transactionDetails.amount / 100).toFixed(2)} {transactionDetails.currency}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Frais</p>
                <p className="font-semibold">
                  {(transactionDetails.processingFee / 100).toFixed(2)} {transactionDetails.currency}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Net</p>
                <p className="font-semibold text-green-600">
                  {((transactionDetails.netAmount || 0) / 100).toFixed(2)} {transactionDetails.currency}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Statut</p>
                <p>{getStatusBadge(transactionDetails.status)}</p>
              </div>
              <div>
                <p className="text-gray-500">Méthode</p>
                <p>{transactionDetails.paymentMethod}</p>
              </div>
              <div>
                <p className="text-gray-500">3D Secure</p>
                <p>{transactionDetails.threeDSStatus || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Code auth</p>
                <p className="font-mono">{transactionDetails.authCode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Score de risque</p>
                <p>
                  {getRiskBadge(transactionDetails.riskLevel)}
                  <span className="ml-1">({transactionDetails.riskScore || 0})</span>
                </p>
              </div>
              {transactionDetails.fraudFlags.length > 0 && (
                <div className="col-span-2">
                  <p className="text-gray-500">Indicateurs de fraude</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {transactionDetails.fraudFlags.map((flag: string) => (
                      <span key={flag} className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-gray-500">Créé</p>
                <p>{new Date(transactionDetails.createdAt).toLocaleString('fr-FR')}</p>
              </div>
              {transactionDetails.capturedAt && (
                <div>
                  <p className="text-gray-500">Capturé</p>
                  <p>{new Date(transactionDetails.capturedAt).toLocaleString('fr-FR')}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">IP</p>
                <p className="font-mono text-xs">{transactionDetails.ipAddress || 'N/A'}</p>
              </div>
            </div>

            {/* Refunds */}
            {transactionDetails.refunds && transactionDetails.refunds.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Remboursements</h4>
                <div className="space-y-2">
                  {transactionDetails.refunds.map((refund: any) => (
                    <div key={refund.id} className="p-3 bg-gray-50 rounded">
                      <div className="flex justify-between">
                        <span className="font-mono text-sm">{refund.refundId}</span>
                        <span className="font-semibold text-red-600">
                          -{(refund.amount / 100).toFixed(2)} €
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {refund.reason} • {new Date(refund.createdAt).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund modal */}
      {showRefundModal && transactionDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Rembourser la transaction
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant (max: {((transactionDetails.amount - transactionDetails.refundedAmount) / 100).toFixed(2)} €)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raison
                </label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="CUSTOMER_REQUEST">Demande client</option>
                  <option value="DUPLICATE">Transaction dupliquée</option>
                  <option value="FRAUDULENT">Frauduleuse</option>
                  <option value="ORDER_CANCELLED">Commande annulée</option>
                  <option value="PRODUCT_ISSUE">Problème produit</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRefundModal(false)
                  setSelectedTransaction(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={handleRefund}
                disabled={refundMutation.isPending || !refundAmount}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {refundMutation.isPending ? 'Traitement...' : 'Rembourser'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper to generate CSV
function generateCSV(transactions: any[]): string {
  const headers = ['ID', 'Date', 'Montant', 'Devise', 'Statut', 'Méthode', 'Risque', 'Frais', 'Net']
  const rows = transactions.map(tx => [
    tx.transactionId,
    new Date(tx.createdAt).toISOString(),
    (tx.amount / 100).toFixed(2),
    tx.currency,
    tx.status,
    tx.paymentMethod,
    tx.riskLevel,
    (tx.processingFee / 100).toFixed(2),
    ((tx.netAmount || 0) / 100).toFixed(2)
  ])

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
}

// Helper to download CSV
function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
}
