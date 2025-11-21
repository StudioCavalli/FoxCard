'use client'

/**
 * crsdpay Admin Dashboard - Page principale
 * Vue d'ensemble du système de paiement crsdpay
 */

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  LineChart as LineChartIcon,
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { LineChart } from '@/components/charts/LineChart'
import { BarChart } from '@/components/charts/BarChart'

export default function CrsdpayDashboard() {
  const [storeId, setStoreId] = useState<string>('')
  const [period, setPeriod] = useState<7 | 30 | 90>(30)

  useEffect(() => {
    // En production, récupérer le storeId depuis le contexte utilisateur
    const mockStoreId = '507f1f77bcf86cd799439011'
    setStoreId(mockStoreId)
  }, [])

  const { data: stats, isLoading: statsLoading } = trpc.crsdpay.getStats.useQuery(
    { storeId },
    { enabled: !!storeId }
  )

  const { data: recentTransactions, isLoading: transactionsLoading } =
    trpc.crsdpay.listTransactions.useQuery(
      { storeId, limit: 10 },
      { enabled: !!storeId }
    )

  const { data: config } = trpc.crsdpay.getConfig.useQuery(
    { storeId },
    { enabled: !!storeId }
  )

  const { data: chartData, isLoading: chartLoading } = trpc.crsdpay.getChartData.useQuery(
    { storeId, days: period },
    { enabled: !!storeId }
  )

  const { data: paymentMethodStats, isLoading: methodStatsLoading } =
    trpc.crsdpay.getPaymentMethodStats.useQuery(
      { storeId, days: period },
      { enabled: !!storeId }
    )

  if (!storeId) {
    return (
      <div className="p-8">
        <div className="animate-pulse">Chargement...</div>
      </div>
    )
  }

  const formatAmount = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
    }).format(amount / 100)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'pending':
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'Réussi'
      case 'failed':
        return 'Échoué'
      case 'pending':
        return 'En attente'
      case 'processing':
        return 'En cours'
      case 'canceled':
        return 'Annulé'
      default:
        return status
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">crsdpay Payment Gateway</h1>
          <p className="text-gray-600">
            Votre système de paiement personnalisé -{' '}
            {config?.isEnabled ? (
              <span className="text-green-600 font-semibold">Activé</span>
            ) : (
              <span className="text-red-600 font-semibold">Désactivé</span>
            )}
            {' '} ({config?.mode === 'test' ? 'Mode Test' : 'Mode Production'})
          </p>
        </div>

        <Link href="/admin/crsdpay/settings">
          <Button>Configuration</Button>
        </Link>
      </div>

      {/* KPIs */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Volume */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Volume Total</p>
                <p className="text-2xl font-bold">
                  {formatAmount(stats?.totalAmount || 0)}
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-primary-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {stats?.succeededTransactions || 0} transactions réussies
            </p>
          </Card>

          {/* Taux de Succès */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux de Succès</p>
                <p className="text-2xl font-bold">
                  {stats?.successRate.toFixed(1) || 0}%
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {stats?.totalTransactions || 0} transactions au total
            </p>
          </Card>

          {/* Remboursements */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Remboursements</p>
                <p className="text-2xl font-bold">
                  {formatAmount(stats?.totalRefunded || 0)}
                </p>
              </div>
              <CreditCard className="h-10 w-10 text-orange-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {((stats?.totalRefunded || 0) / (stats?.totalAmount || 1) * 100).toFixed(1)}% du volume
            </p>
          </Card>

          {/* Clients */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clients</p>
                <p className="text-2xl font-bold">-</p>
              </div>
              <Users className="h-10 w-10 text-blue-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              <Link href="/admin/crsdpay/customers" className="text-primary-500 hover:underline">
                Voir les clients →
              </Link>
            </p>
          </Card>
        </div>
      )}

      {/* Period Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">Période:</span>
        <Button
          variant={period === 7 ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setPeriod(7)}
        >
          7 jours
        </Button>
        <Button
          variant={period === 30 ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setPeriod(30)}
        >
          30 jours
        </Button>
        <Button
          variant={period === 90 ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setPeriod(90)}
        >
          90 jours
        </Button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <LineChartIcon className="h-5 w-5 text-primary-600" />
              Revenus
            </h2>
            <span className="text-sm text-gray-600">{period} derniers jours</span>
          </div>

          {chartLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse text-gray-400">Chargement...</div>
            </div>
          ) : chartData && chartData.length > 0 ? (
            <LineChart
              data={chartData.map((d) => ({ date: d.date, value: d.revenue }))}
              height={250}
              color="#6366f1"
              label="Revenu"
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Aucune donnée pour cette période
            </div>
          )}
        </Card>

        {/* Transactions Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <LineChartIcon className="h-5 w-5 text-green-600" />
              Transactions
            </h2>
            <span className="text-sm text-gray-600">{period} derniers jours</span>
          </div>

          {chartLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse text-gray-400">Chargement...</div>
            </div>
          ) : chartData && chartData.length > 0 ? (
            <LineChart
              data={chartData.map((d) => ({ date: d.date, value: d.transactions }))}
              height={250}
              color="#10b981"
              label="Transactions"
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Aucune donnée pour cette période
            </div>
          )}
        </Card>
      </div>

      {/* Payment Methods Stats */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Méthodes de paiement
          </h2>
          <span className="text-sm text-gray-600">{period} derniers jours</span>
        </div>

        {methodStatsLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Chargement...</div>
          </div>
        ) : paymentMethodStats && paymentMethodStats.length > 0 ? (
          <div>
            <BarChart
              data={paymentMethodStats.map((stat) => ({
                label: stat.method === 'card' ? 'Carte' : stat.method === 'crypto' ? 'Crypto' : stat.method,
                value: stat.amount,
                color: stat.method === 'card' ? '#6366f1' : stat.method === 'crypto' ? '#f59e0b' : '#8b5cf6',
              }))}
              height={250}
            />

            {/* Stats Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-2 font-semibold">Méthode</th>
                    <th className="pb-2 font-semibold text-right">Transactions</th>
                    <th className="pb-2 font-semibold text-right">Montant total</th>
                    <th className="pb-2 font-semibold text-right">Montant moyen</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paymentMethodStats.map((stat) => (
                    <tr key={stat.method}>
                      <td className="py-2 capitalize font-medium">{stat.method === 'card' ? 'Carte bancaire' : stat.method === 'crypto' ? 'Cryptomonnaie' : stat.method}</td>
                      <td className="py-2 text-right">{stat.count}</td>
                      <td className="py-2 text-right font-semibold">
                        {formatAmount(stat.amount)}
                      </td>
                      <td className="py-2 text-right text-gray-600">
                        {formatAmount(Math.floor(stat.amount / stat.count))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            Aucune donnée pour cette période
          </div>
        )}
      </Card>

      {/* Transactions Récentes */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Transactions Récentes</h2>
          <Link href="/admin/crsdpay/transactions">
            <Button variant="outline">Voir tout</Button>
          </Link>
        </div>

        {transactionsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : !recentTransactions || recentTransactions.data.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Aucune transaction pour le moment</p>
            <p className="text-sm">Les transactions apparaîtront ici</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-3 font-semibold">ID Transaction</th>
                  <th className="pb-3 font-semibold">Client</th>
                  <th className="pb-3 font-semibold">Montant</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentTransactions.data.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="py-4">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {transaction.transactionId.slice(0, 20)}...
                      </code>
                    </td>
                    <td className="py-4">
                      {transaction.customer ? (
                        <div>
                          <p className="font-medium">{transaction.customer.email}</p>
                          {transaction.customer.firstName && (
                            <p className="text-sm text-gray-500">
                              {transaction.customer.firstName} {transaction.customer.lastName}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 font-semibold">
                      {formatAmount(transaction.amount, transaction.currency)}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(transaction.status)}
                        <span>{getStatusText(transaction.status)}</span>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-gray-600">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="py-4">
                      <Link href={`/admin/crsdpay/transactions/${transaction.transactionId}`}>
                        <Button variant="ghost" size="sm">
                          Détails
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link href="/admin/crsdpay/transactions">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <CreditCard className="h-8 w-8 text-primary-500 mb-3" />
            <h3 className="font-semibold mb-2">Transactions</h3>
            <p className="text-sm text-gray-600">
              Gérer et consulter toutes les transactions
            </p>
          </Card>
        </Link>

        <Link href="/admin/crsdpay/crypto">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-orange-50 to-yellow-50">
            <div className="text-3xl mb-3">₿</div>
            <h3 className="font-semibold mb-2">Cryptocurrency</h3>
            <p className="text-sm text-gray-600">
              Bitcoin, Ethereum, USDT et Lightning
            </p>
          </Card>
        </Link>

        <Link href="/admin/crsdpay/customers">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Users className="h-8 w-8 text-blue-500 mb-3" />
            <h3 className="font-semibold mb-2">Clients</h3>
            <p className="text-sm text-gray-600">
              Consulter les clients et leurs cartes
            </p>
          </Card>
        </Link>

        <Link href="/admin/crsdpay/settings">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <AlertTriangle className="h-8 w-8 text-orange-500 mb-3" />
            <h3 className="font-semibold mb-2">Configuration</h3>
            <p className="text-sm text-gray-600">
              Paramétrer le gateway et l'anti-fraude
            </p>
          </Card>
        </Link>
      </div>
    </div>
  )
}
