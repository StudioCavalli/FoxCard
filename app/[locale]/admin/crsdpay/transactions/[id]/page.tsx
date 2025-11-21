'use client'

/**
 * Transaction Details Page - Détails complets d'une transaction crsdpay
 */

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  CreditCard,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'

export default function TransactionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const transactionId = params.id as string

  const {
    data: transaction,
    isLoading,
    refetch,
  } = trpc.crsdpay.getTransaction.useQuery(
    { transactionId },
    { enabled: !!transactionId }
  )

  const createRefundMutation = trpc.crsdpay.createRefund.useMutation()

  const [refundAmount, setRefundAmount] = useState<number | null>(null)
  const [refundReason, setRefundReason] = useState<string>('requested_by_customer')
  const [showRefundModal, setShowRefundModal] = useState(false)

  useEffect(() => {
    if (transaction) {
      // Set default refund amount to remaining available
      const available = transaction.amountCaptured - transaction.amountRefunded
      setRefundAmount(available)
    }
  }, [transaction])

  const handleRefund = async () => {
    if (!refundAmount || refundAmount <= 0) {
      toast({
        title: 'Erreur',
        description: 'Montant de remboursement invalide',
        variant: 'destructive',
      })
      return
    }

    try {
      await createRefundMutation.mutateAsync({
        transactionId,
        amount: refundAmount,
        reason: refundReason as any,
        description: `Remboursement ${refundAmount / 100}€`,
      })

      toast({
        title: 'Remboursement créé',
        description: `${refundAmount / 100}€ remboursé avec succès`,
      })

      setShowRefundModal(false)
      await refetch()
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">Chargement...</div>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-gray-600">Transaction non trouvée</p>
          <Link href="/admin/crsdpay">
            <Button className="mt-4">Retour au dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const availableForRefund = transaction.amountCaptured - transaction.amountRefunded
  const canRefund = transaction.status === 'succeeded' && availableForRefund > 0

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    succeeded: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    canceled: 'bg-gray-100 text-gray-800',
  }

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="h-4 w-4" />,
    processing: <RefreshCw className="h-4 w-4 animate-spin" />,
    succeeded: <CheckCircle className="h-4 w-4" />,
    failed: <XCircle className="h-4 w-4" />,
    canceled: <XCircle className="h-4 w-4" />,
  }

  return (
    <div className="p-8 space-y-6 max-w-6xl">
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
            <h1 className="text-3xl font-bold">Transaction #{transactionId}</h1>
            <p className="text-gray-600">
              Créée le {new Date(transaction.createdAt).toLocaleString('fr-FR')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={statusColors[transaction.status]}>
              {statusIcons[transaction.status]}
              <span className="ml-1">{transaction.status.toUpperCase()}</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transaction Info */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Informations de paiement
          </h2>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Montant</p>
              <p className="text-2xl font-bold">
                {(transaction.amount / 100).toFixed(2)} {transaction.currency.toUpperCase()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Montant capturé</p>
              <p className="text-lg font-semibold">
                {(transaction.amountCaptured / 100).toFixed(2)}{' '}
                {transaction.currency.toUpperCase()}
              </p>
            </div>

            {transaction.amountRefunded > 0 && (
              <div>
                <p className="text-sm text-gray-600">Montant remboursé</p>
                <p className="text-lg font-semibold text-red-600">
                  {(transaction.amountRefunded / 100).toFixed(2)}{' '}
                  {transaction.currency.toUpperCase()}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600">Méthode de paiement</p>
              <p className="font-semibold capitalize">{transaction.paymentMethod}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Mode de capture</p>
              <p className="font-semibold capitalize">{transaction.captureMethod}</p>
            </div>

            {transaction.description && (
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="font-semibold">{transaction.description}</p>
              </div>
            )}
          </div>

          {canRefund && (
            <Button
              onClick={() => setShowRefundModal(true)}
              variant="outline"
              className="w-full mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Créer un remboursement
            </Button>
          )}
        </Card>

        {/* Customer Info */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Client
          </h2>

          {transaction.customer ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{transaction.customer.email}</p>
              </div>

              {transaction.customer.firstName && (
                <div>
                  <p className="text-sm text-gray-600">Nom</p>
                  <p className="font-semibold">
                    {transaction.customer.firstName} {transaction.customer.lastName}
                  </p>
                </div>
              )}

              {transaction.customer.phone && (
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-semibold">{transaction.customer.phone}</p>
                </div>
              )}

              <div>
                <Link href={`/admin/crsdpay/customers/${transaction.customer.id}`}>
                  <Button variant="outline" className="w-full mt-2">
                    Voir le profil client
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Aucune information client</p>
          )}
        </Card>

        {/* Card Info */}
        {transaction.card && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Carte bancaire
            </h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Marque</p>
                <p className="font-semibold capitalize">{transaction.card.brand}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Numéro</p>
                <p className="font-semibold">**** **** **** {transaction.card.last4}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Expiration</p>
                <p className="font-semibold">
                  {String(transaction.card.expMonth).padStart(2, '0')}/
                  {transaction.card.expYear}
                </p>
              </div>

              {transaction.card.holderName && (
                <div>
                  <p className="text-sm text-gray-600">Titulaire</p>
                  <p className="font-semibold">{transaction.card.holderName}</p>
                </div>
              )}

              {transaction.card.country && (
                <div>
                  <p className="text-sm text-gray-600">Pays</p>
                  <p className="font-semibold">{transaction.card.country}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Fraud Detection */}
        {transaction.fraudChecks && transaction.fraudChecks.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Détection de fraude
            </h2>

            {transaction.fraudChecks.map((check: any) => (
              <div key={check.id} className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Score de risque</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          check.riskScore < 30
                            ? 'bg-green-500'
                            : check.riskScore < 70
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${check.riskScore}%` }}
                      />
                    </div>
                    <span className="font-bold">{check.riskScore}/100</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Recommandation</p>
                  <Badge
                    className={
                      check.recommendation === 'approve'
                        ? 'bg-green-100 text-green-800'
                        : check.recommendation === 'review'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }
                  >
                    {check.recommendation.toUpperCase()}
                  </Badge>
                </div>

                {check.reasons && check.reasons.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Signaux détectés</p>
                    <div className="space-y-1">
                      {check.reasons.map((reason: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* Refunds */}
      {transaction.refunds && transaction.refunds.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Remboursements</h2>

          <div className="space-y-4">
            {transaction.refunds.map((refund: any) => (
              <div
                key={refund.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-semibold">
                    {(refund.amount / 100).toFixed(2)} {refund.currency.toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {refund.description || 'Aucune description'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(refund.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>

                <Badge
                  className={
                    refund.status === 'succeeded'
                      ? 'bg-green-100 text-green-800'
                      : refund.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }
                >
                  {refund.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Timeline */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Chronologie</h2>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <p className="font-semibold">Transaction créée</p>
              <p className="text-sm text-gray-600">
                {new Date(transaction.createdAt).toLocaleString('fr-FR')}
              </p>
            </div>
          </div>

          {transaction.status === 'succeeded' && (
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold">Paiement réussi</p>
                <p className="text-sm text-gray-600">
                  {new Date(transaction.updatedAt).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
          )}

          {transaction.status === 'failed' && (
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-semibold">Paiement échoué</p>
                <p className="text-sm text-gray-600">
                  {new Date(transaction.updatedAt).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
          )}

          {transaction.refunds &&
            transaction.refunds.map((refund: any) => (
              <div key={refund.id} className="flex items-start gap-3">
                <div className="mt-1">
                  <RefreshCw className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">
                    Remboursement de {(refund.amount / 100).toFixed(2)}{' '}
                    {refund.currency.toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(refund.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </Card>

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Créer un remboursement</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Montant (max: {(availableForRefund / 100).toFixed(2)}{' '}
                  {transaction.currency.toUpperCase()})
                </label>
                <input
                  type="number"
                  value={refundAmount ? refundAmount / 100 : ''}
                  onChange={(e) => setRefundAmount(parseFloat(e.target.value) * 100)}
                  step="0.01"
                  max={availableForRefund / 100}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Raison</label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="requested_by_customer">Demandé par le client</option>
                  <option value="duplicate">Transaction en double</option>
                  <option value="fraudulent">Fraude</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleRefund} disabled={createRefundMutation.isPending}>
                  {createRefundMutation.isPending ? 'Traitement...' : 'Rembourser'}
                </Button>
                <Button variant="outline" onClick={() => setShowRefundModal(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
