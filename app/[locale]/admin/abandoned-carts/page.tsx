'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { trpc } from '@/lib/trpc/client'
import { formatPrice, formatDate } from '@/lib/utils'
import { ShoppingCart, TrendingUp, Mail, DollarSign, BarChart3, Send } from 'lucide-react'

export default function AbandonedCartsPage() {
  const DEMO_STORE_ID = '000000000000000000000001'
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data: analytics, refetch: refetchAnalytics } = trpc.abandonedCart.getAnalytics.useQuery({
    storeId: DEMO_STORE_ID,
  })

  const { data: carts, refetch: refetchCarts } = trpc.abandonedCart.getAll.useQuery({
    storeId: DEMO_STORE_ID,
    status: statusFilter === 'all' ? undefined : statusFilter as any,
  })

  const sendEmail = trpc.abandonedCart.sendRecoveryEmail.useMutation({
    onSuccess: () => {
      refetchCarts()
      refetchAnalytics()
    },
  })

  const handleSendEmail = async (cartId: string, type: 'first' | 'second') => {
    if (confirm(`Envoyer l'email de récupération ${type === 'first' ? '1' : '2'} ?`)) {
      await sendEmail.mutateAsync({ id: cartId, type })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paniers Abandonnés</h1>
        <p className="text-gray-600">Récupérez vos ventes perdues avec des emails automatiques</p>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.totalAbandoned}</p>
            <p className="text-sm text-gray-600">Paniers abandonnés</p>
            <div className="mt-2 text-xs text-gray-500">
              Valeur: {formatPrice(analytics.totalCartValue)}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.recovered}</p>
            <p className="text-sm text-gray-600">Récupérés</p>
            <div className="mt-2 text-xs font-semibold text-green-600">
              {analytics.recoveryRate}% taux de récupération
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.firstEmailSent}</p>
            <p className="text-sm text-gray-600">1er email envoyé</p>
            <div className="mt-2 text-xs text-gray-500">
              +{analytics.secondEmailSent} 2ème email
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatPrice(analytics.recoveredValue)}</p>
            <p className="text-sm text-gray-600">Valeur récupérée</p>
            <div className="mt-2 text-xs text-gray-500">
              Moy: {formatPrice(analytics.averageCartValue)}
            </div>
          </Card>
        </div>
      )}

      {/* Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold text-gray-700">Filtrer par statut:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 outline-none transition-all"
          >
            <option value="all">Tous</option>
            <option value="PENDING">En attente</option>
            <option value="FIRST_EMAIL_SENT">1er email envoyé</option>
            <option value="SECOND_EMAIL_SENT">2ème email envoyé</option>
            <option value="RECOVERED">Récupérés</option>
            <option value="EXPIRED">Expirés</option>
          </select>
        </div>
      </Card>

      {/* Carts List */}
      <div className="space-y-4">
        {carts?.map((cart: any) => {
          const items = cart.cartData?.items || []
          const total = items.reduce((sum: number, item: any) => {
            return sum + (item.price || 0) * (item.quantity || 0)
          }, 0)

          return (
            <Card key={cart.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{cart.customerName || cart.email}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        cart.status === 'RECOVERED'
                          ? 'bg-green-100 text-green-800'
                          : cart.status === 'EXPIRED'
                          ? 'bg-gray-100 text-gray-600'
                          : cart.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {cart.status === 'PENDING' && 'En attente'}
                      {cart.status === 'FIRST_EMAIL_SENT' && '1er email envoyé'}
                      {cart.status === 'SECOND_EMAIL_SENT' && '2ème email envoyé'}
                      {cart.status === 'RECOVERED' && 'Récupéré'}
                      {cart.status === 'EXPIRED' && 'Expiré'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{cart.email}</p>
                  {cart.phone && <p className="text-sm text-gray-600">{cart.phone}</p>}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(total)}</p>
                  <p className="text-xs text-gray-500">{items.length} article(s)</p>
                </div>
              </div>

              {/* Items */}
              <div className="mb-4 space-y-2">
                {items.slice(0, 3).map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="text-gray-600">
                      {item.quantity} × {formatPrice(item.price)}
                    </span>
                  </div>
                ))}
                {items.length > 3 && (
                  <p className="text-xs text-gray-500 text-center">+{items.length - 3} autres articles</p>
                )}
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4 pb-4 border-b">
                <div>
                  <p className="text-gray-500">Abandonné</p>
                  <p className="font-semibold text-gray-900">{formatDate(cart.abandonedAt)}</p>
                </div>
                {cart.firstEmailSentAt && (
                  <div>
                    <p className="text-gray-500">1er email</p>
                    <p className="font-semibold text-gray-900">{formatDate(cart.firstEmailSentAt)}</p>
                  </div>
                )}
                {cart.secondEmailSentAt && (
                  <div>
                    <p className="text-gray-500">2ème email</p>
                    <p className="font-semibold text-gray-900">{formatDate(cart.secondEmailSentAt)}</p>
                  </div>
                )}
                {cart.recoveredAt && (
                  <div>
                    <p className="text-gray-500">Récupéré</p>
                    <p className="font-semibold text-green-600">{formatDate(cart.recoveredAt)}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {!cart.wasRecovered && cart.status !== 'EXPIRED' && (
                <div className="flex items-center gap-2">
                  {cart.status === 'PENDING' && (
                    <button
                      onClick={() => handleSendEmail(cart.id, 'first')}
                      disabled={sendEmail.isPending}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      Envoyer 1er email maintenant
                    </button>
                  )}
                  {cart.status === 'FIRST_EMAIL_SENT' && (
                    <button
                      onClick={() => handleSendEmail(cart.id, 'second')}
                      disabled={sendEmail.isPending}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold text-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      Envoyer 2ème email maintenant
                    </button>
                  )}
                </div>
              )}
            </Card>
          )
        })}

        {carts?.length === 0 && (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600">Aucun panier abandonné trouvé</p>
          </Card>
        )}
      </div>
    </div>
  )
}
