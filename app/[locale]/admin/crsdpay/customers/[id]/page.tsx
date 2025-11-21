'use client'

/**
 * Customer Details Page - Détails d'un client crsdpay
 */

import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  User,
  CreditCard,
  DollarSign,
  Mail,
  Phone,
  Calendar,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function CustomerDetailsPage() {
  const params = useParams()
  const { toast } = useToast()
  const customerId = params.id as string

  const { data: customer, isLoading, refetch } = trpc.crsdpay.getCustomer.useQuery(
    { customerId },
    { enabled: !!customerId }
  )

  const deleteCardMutation = trpc.crsdpay.deleteCard.useMutation()
  const setDefaultCardMutation = trpc.crsdpay.setDefaultCard.useMutation()

  const [deletingCardId, setDeletingCardId] = useState<string | null>(null)

  const handleDeleteCard = async (token: string) => {
    if (!customer) return

    setDeletingCardId(token)
    try {
      await deleteCardMutation.mutateAsync({
        token,
        customerId: customer.id,
      })

      toast({
        title: 'Carte supprimée',
        description: 'La carte a été supprimée avec succès',
      })

      await refetch()
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setDeletingCardId(null)
    }
  }

  const handleSetDefaultCard = async (token: string) => {
    if (!customer) return

    try {
      await setDefaultCardMutation.mutateAsync({
        token,
        customerId: customer.id,
      })

      toast({
        title: 'Carte par défaut définie',
        description: 'La carte a été définie comme carte par défaut',
      })

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

  if (!customer) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-gray-600">Client non trouvé</p>
          <Link href="/admin/crsdpay/customers">
            <Button className="mt-4">Retour aux clients</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Calculate customer stats
  const totalTransactions = customer._count?.transactions || 0
  const succeededTransactions =
    customer.transactions?.filter((t: any) => t.status === 'succeeded').length || 0
  const totalRevenue =
    customer.transactions
      ?.filter((t: any) => t.status === 'succeeded')
      .reduce((sum: number, t: any) => sum + t.amountCaptured, 0) || 0

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    succeeded: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    canceled: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <Link href="/admin/crsdpay/customers">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux clients
          </Button>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {customer.firstName && customer.lastName
                ? `${customer.firstName} ${customer.lastName}`
                : customer.email}
            </h1>
            <p className="text-gray-600">Client depuis {new Date(customer.createdAt).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Revenu total</p>
              <p className="text-2xl font-bold">{(totalRevenue / 100).toFixed(2)}€</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Paiements réussis</p>
              <p className="text-2xl font-bold">{succeededTransactions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Transactions totales</p>
              <p className="text-2xl font-bold">{totalTransactions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Cartes enregistrées</p>
              <p className="text-2xl font-bold">{customer._count?.cards || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Informations client
          </h2>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{customer.email}</p>
              </div>
            </div>

            {customer.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-semibold">{customer.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Inscrit le</p>
                <p className="font-semibold">{new Date(customer.createdAt).toLocaleString('fr-FR')}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Saved Cards */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Cartes enregistrées ({customer.cards?.length || 0})
          </h2>

          <div className="space-y-3">
            {customer.cards && customer.cards.length > 0 ? (
              customer.cards.map((card: any) => (
                <div
                  key={card.id}
                  className="p-4 border rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="font-semibold capitalize">
                        {card.brand} •••• {card.last4}
                      </p>
                      <p className="text-sm text-gray-600">
                        Expire {String(card.expMonth).padStart(2, '0')}/{card.expYear}
                      </p>
                      {card.isDefault && (
                        <Badge className="mt-1 bg-blue-100 text-blue-800">Par défaut</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!card.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefaultCard(card.token)}
                        disabled={setDefaultCardMutation.isPending}
                      >
                        Définir par défaut
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCard(card.token)}
                      disabled={deletingCardId === card.token}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Aucune carte enregistrée</p>
            )}
          </div>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Historique des transactions</h2>

        <div className="space-y-3">
          {customer.transactions && customer.transactions.length > 0 ? (
            customer.transactions.map((transaction: any) => (
              <div
                key={transaction.id}
                className="p-4 border rounded-lg flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">
                      {(transaction.amount / 100).toFixed(2)} {transaction.currency.toUpperCase()}
                    </p>
                    <Badge className={statusColors[transaction.status]}>
                      {transaction.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {transaction.description || 'Aucune description'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(transaction.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Méthode</p>
                    <p className="font-semibold capitalize">{transaction.paymentMethod}</p>
                  </div>

                  <Link href={`/admin/crsdpay/transactions/${transaction.transactionId}`}>
                    <Button variant="outline" size="sm">
                      Détails
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune transaction</p>
          )}
        </div>
      </Card>
    </div>
  )
}
