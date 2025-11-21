'use client'

/**
 * crsdpay Crypto Payments Admin Page
 * Gestion des paiements cryptocurrency
 */

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { trpc } from '@/lib/trpc/client'
import Link from 'next/link'
import { ArrowLeft, Bitcoin, CheckCircle, Clock, XCircle, Loader2, RefreshCw } from 'lucide-react'

export default function CrsdpayCryptoPage() {
  const [storeId, setStoreId] = useState<string>('')

  useEffect(() => {
    const mockStoreId = '507f1f77bcf86cd799439011'
    setStoreId(mockStoreId)
  }, [])

  const { data: payments, isLoading, refetch } = trpc.crsdpay.listCryptoPayments.useQuery(
    { storeId },
    { enabled: !!storeId }
  )

  const formatAmount = (amount: number, symbol: string) => {
    return `${amount.toFixed(8)} ${symbol}`
  }

  const formatFiatAmount = (amount: number, currency: string = 'EUR') => {
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
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'confirming':
        return <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-500" />
      case 'expired':
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmé'
      case 'confirming':
        return 'En confirmation'
      case 'pending':
        return 'En attente'
      case 'expired':
        return 'Expiré'
      case 'failed':
        return 'Échoué'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600'
      case 'confirming':
        return 'text-yellow-600'
      case 'pending':
        return 'text-gray-600'
      case 'expired':
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getCryptoIcon = (crypto: string) => {
    const icons: Record<string, string> = {
      BTC: '₿',
      ETH: 'Ξ',
      USDT: '₮',
      USDC: '$',
      LTC: 'Ł',
      BCH: '₿',
    }
    return icons[crypto] || '₿'
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <Link href="/admin/crsdpay">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au dashboard
          </Button>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bitcoin className="h-8 w-8" />
              Paiements Cryptocurrency
            </h1>
            <p className="text-gray-600">Gérez vos paiements en Bitcoin, Ethereum et stablecoins</p>
          </div>

          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Liste des paiements */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-6">Tous les paiements crypto</h2>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : !payments || payments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Bitcoin className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Aucun paiement cryptocurrency</p>
            <p className="text-sm">Les paiements en crypto apparaîtront ici</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-3 font-semibold">ID Paiement</th>
                  <th className="pb-3 font-semibold">Crypto</th>
                  <th className="pb-3 font-semibold">Montant Crypto</th>
                  <th className="pb-3 font-semibold">Montant Fiat</th>
                  <th className="pb-3 font-semibold">Adresse</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Confirmations</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Expire</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="py-4">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {payment.paymentId.slice(0, 20)}...
                      </code>
                    </td>

                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getCryptoIcon(payment.cryptocurrency)}</span>
                        <div>
                          <p className="font-medium">{payment.cryptocurrency}</p>
                          <p className="text-xs text-gray-500">{payment.network}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 font-mono text-sm">
                      {formatAmount(payment.amount, payment.cryptocurrency)}
                    </td>

                    <td className="py-4 font-semibold">
                      {formatFiatAmount(payment.amountFiat, payment.currency)}
                    </td>

                    <td className="py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {payment.address.slice(0, 12)}...{payment.address.slice(-8)}
                      </code>
                    </td>

                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <span className={getStatusColor(payment.status)}>
                          {getStatusText(payment.status)}
                        </span>
                      </div>
                    </td>

                    <td className="py-4">
                      {payment.status === 'confirmed' || payment.status === 'confirming' ? (
                        <span>
                          {payment.confirmations}/{payment.requiredConfirmations}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    <td className="py-4 text-sm text-gray-600">
                      {formatDate(payment.createdAt)}
                    </td>

                    <td className="py-4 text-sm">
                      {payment.status === 'pending' || payment.status === 'confirming' ? (
                        <span className={payment.expiresAt < new Date() ? 'text-red-500' : ''}>
                          {formatDate(payment.expiresAt)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Statistiques */}
      {payments && payments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">Total Paiements</p>
            <p className="text-2xl font-bold">{payments.length}</p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">Confirmés</p>
            <p className="text-2xl font-bold text-green-600">
              {payments.filter((p) => p.status === 'confirmed').length}
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">En attente</p>
            <p className="text-2xl font-bold text-yellow-600">
              {payments.filter((p) => p.status === 'pending' || p.status === 'confirming').length}
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">Expirés</p>
            <p className="text-2xl font-bold text-red-600">
              {payments.filter((p) => p.status === 'expired').length}
            </p>
          </Card>
        </div>
      )}
    </div>
  )
}
