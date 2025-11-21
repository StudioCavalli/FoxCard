'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'

export default function PaymentDashboardPage() {
  const { storeId } = useStoreContext()
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week')

  const { data: dashboard, isLoading } = trpc.paymentGateway.getDashboard.useQuery(
    { storeId: storeId!, period },
    { enabled: !!storeId }
  )

  const { data: config } = trpc.paymentGateway.getConfig.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  )

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Paiements</h1>
          <p className="text-gray-600">Vue d'ensemble du gateway de paiement</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Gateway status */}
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            config?.isEnabled
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {config?.isEnabled ? '🟢 Actif' : '🔴 Inactif'}
          </div>

          {config?.testMode && (
            <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              Mode Test
            </div>
          )}

          {/* Period selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="day">Aujourd'hui</option>
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm text-gray-500 mb-1">Volume total</p>
          <p className="text-3xl font-bold text-gray-900">
            {((dashboard?.volume || 0) / 100).toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'EUR'
            })}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {dashboard?.transactionCount || 0} transactions
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm text-gray-500 mb-1">Panier moyen</p>
          <p className="text-3xl font-bold text-blue-600">
            {((dashboard?.averageTransaction || 0) / 100).toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'EUR'
            })}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm text-gray-500 mb-1">Taux de succès</p>
          <p className="text-3xl font-bold text-green-600">
            {(dashboard?.successRate || 0).toFixed(1)}%
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm text-gray-500 mb-1">Frais collectés</p>
          <p className="text-3xl font-bold text-purple-600">
            {((dashboard?.fees || 0) / 100).toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'EUR'
            })}
          </p>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold text-gray-900 mb-4">Répartition par statut</h3>
          <div className="space-y-3">
            <StatusBar
              label="Capturées"
              count={dashboard?.byStatus.captured || 0}
              total={dashboard?.transactionCount || 1}
              color="bg-green-500"
            />
            <StatusBar
              label="En attente"
              count={dashboard?.byStatus.pending || 0}
              total={dashboard?.transactionCount || 1}
              color="bg-yellow-500"
            />
            <StatusBar
              label="Autorisées"
              count={dashboard?.byStatus.authorized || 0}
              total={dashboard?.transactionCount || 1}
              color="bg-blue-500"
            />
            <StatusBar
              label="Échouées"
              count={dashboard?.byStatus.failed || 0}
              total={dashboard?.transactionCount || 1}
              color="bg-red-500"
            />
            <StatusBar
              label="Remboursées"
              count={dashboard?.byStatus.refunded || 0}
              total={dashboard?.transactionCount || 1}
              color="bg-purple-500"
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold text-gray-900 mb-4">Remboursements & Litiges</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600 mb-1">Remboursements</p>
              <p className="text-2xl font-bold text-red-700">
                {((dashboard?.refunds || 0) / 100).toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                })}
              </p>
              <p className="text-xs text-red-500 mt-1">
                {dashboard?.refundCount || 0} remboursements
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-600 mb-1">Litiges</p>
              <p className="text-2xl font-bold text-orange-700">
                {dashboard?.disputes || 0}
              </p>
              <p className="text-xs text-orange-500 mt-1">
                litiges ouverts
              </p>
            </div>
          </div>

          {/* Refund rate */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Taux de remboursement</span>
              <span className={`font-medium ${
                (dashboard?.refundCount || 0) / (dashboard?.transactionCount || 1) * 100 > 5
                  ? 'text-red-600'
                  : 'text-green-600'
              }`}>
                {((dashboard?.refundCount || 0) / (dashboard?.transactionCount || 1) * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration summary */}
      {config && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold text-gray-900 mb-4">Configuration actuelle</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">3D Secure</p>
              <p className="font-medium">
                {config.threeDSEnabled ? '✅ Activé' : '❌ Désactivé'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Seuil 3DS</p>
              <p className="font-medium">
                {config.threeDSThreshold
                  ? `${config.threeDSThreshold / 100}€`
                  : 'Toujours'
                }
              </p>
            </div>
            <div>
              <p className="text-gray-500">Frais</p>
              <p className="font-medium">
                {config.transactionFeePercent}% + {config.transactionFeeFixed}€
              </p>
            </div>
            <div>
              <p className="text-gray-500">Score risque max</p>
              <p className="font-medium">
                {config.maxRiskScore}/100
              </p>
            </div>
            <div>
              <p className="text-gray-500">Payout</p>
              <p className="font-medium">
                {config.payoutSchedule}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Minimum payout</p>
              <p className="font-medium">
                {config.minimumPayout}€
              </p>
            </div>
            <div>
              <p className="text-gray-500">Pays bloqués</p>
              <p className="font-medium">
                {config.blockedCountries?.length || 0}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Velocity check</p>
              <p className="font-medium">
                {config.velocityCheck ? '✅ Activé' : '❌ Désactivé'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="mt-6 flex flex-wrap gap-4">
        <a
          href="/admin/payments/transactions"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          📋 Voir les transactions
        </a>
        <a
          href="/admin/payments/config"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          ⚙️ Configuration
        </a>
        <a
          href="/admin/payments/payouts"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          💰 Virements
        </a>
      </div>
    </div>
  )
}

// Status bar component
function StatusBar({
  label,
  count,
  total,
  color
}: {
  label: string
  count: number
  total: number
  color: string
}) {
  const percentage = (count / total) * 100

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{count}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
