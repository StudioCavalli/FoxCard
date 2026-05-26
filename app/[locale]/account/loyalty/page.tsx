'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/Card'
import { trpc } from '@/lib/trpc/client'
import { formatPrice, formatDate } from '@/lib/utils'
import { Trophy, Star, TrendingUp, Clock, Gift, ChevronRight, Award, Zap } from 'lucide-react'

export default function LoyaltyDashboardPage() {
  const { data: session } = useSession()
  const customerId = session?.user?.id

  const { data: loyaltyData, isLoading } = trpc.loyalty.getBalance.useQuery({
    customerId: customerId!,
  }, { enabled: !!customerId })

  const { data: historyData } = trpc.loyalty.getHistory.useQuery({
    customerId: customerId!,
    limit: 20,
  }, { enabled: !!customerId })

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'GOLD':
        return 'from-yellow-400 to-yellow-600'
      case 'SILVER':
        return 'from-gray-300 to-gray-500'
      default:
        return 'from-orange-400 to-orange-600'
    }
  }

  const getTierBadgeIcon = (tier: string) => {
    switch (tier) {
      case 'GOLD':
        return <Trophy className="w-8 h-8 text-yellow-500" />
      case 'SILVER':
        return <Award className="w-8 h-8 text-gray-400" />
      default:
        return <Star className="w-8 h-8 text-orange-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary"></div>
      </div>
    )
  }

  if (!loyaltyData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-theme-text-muted">Impossible de charger vos données de fidélité</p>
      </div>
    )
  }

  const progressToNextTier = loyaltyData.pointsToNextTier
    ? ((loyaltyData.totalSpent / (loyaltyData.totalSpent + loyaltyData.pointsToNextTier)) * 100)
    : 100

  return (
    <div className="min-h-screen py-12 px-4" style={{ fontFamily: 'var(--theme-font-body)' }}>
      <div className="mx-auto" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-4xl font-bold text-theme-text mb-2"
            style={{ fontFamily: 'var(--theme-font-heading)' }}
          >
            Programme de Fidélité
          </h1>
          <p className="text-theme-text-secondary">
            Gagnez des points à chaque achat et profitez d'avantages exclusifs
          </p>
        </div>

        {/* Tier Card */}
        <Card className={`p-8 mb-6 bg-gradient-to-br ${getTierColor(loyaltyData.tier)} text-white border-none shadow-2xl`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                {getTierBadgeIcon(loyaltyData.tier)}
              </div>
              <div>
                <p className="text-white/80 text-sm">Votre niveau</p>
                <h2 className="text-3xl font-bold">{loyaltyData.tier}</h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">Points disponibles</p>
              <p className="text-5xl font-bold">{loyaltyData.points}</p>
            </div>
          </div>

          {/* Progress to next tier */}
          {loyaltyData.nextTier && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-white/90">Progression vers {loyaltyData.nextTier}</p>
                <p className="text-sm text-white/90">
                  {formatPrice(loyaltyData.totalSpent)} / {formatPrice(loyaltyData.totalSpent + (loyaltyData.pointsToNextTier || 0))}
                </p>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur">
                <div
                  className="bg-white h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressToNextTier}%` }}
                ></div>
              </div>
              <p className="text-xs text-white/70 mt-2">
                Plus que {formatPrice(loyaltyData.pointsToNextTier || 0)} pour atteindre {loyaltyData.nextTier}
              </p>
            </div>
          )}

          {loyaltyData.tier === 'GOLD' && (
            <div className="text-center">
              <p className="text-white flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                Vous avez atteint le niveau maximum !
              </p>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Points Earned */}
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-theme-text-muted">Points gagnés</p>
                <p className="text-2xl font-bold text-theme-text">{loyaltyData.totalPointsEarned}</p>
              </div>
            </div>
          </Card>

          {/* Total Spent */}
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Gift className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-theme-text-muted">Dépenses totales</p>
                <p className="text-2xl font-bold text-theme-text">{formatPrice(loyaltyData.totalSpent)}</p>
              </div>
            </div>
          </Card>

          {/* Expiring Soon */}
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-theme-text-muted">Expirent bientôt</p>
                <p className="text-2xl font-bold text-theme-text">{loyaltyData.pointsExpiringSoon}</p>
                <p className="text-xs text-theme-text-muted">Dans les 30 prochains jours</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Benefits */}
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-bold text-theme-text mb-4" style={{ fontFamily: 'var(--theme-font-heading)' }}>
            Vos Avantages {loyaltyData.tier}
          </h3>
          <ul className="space-y-3">
            {loyaltyData.tierBenefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-theme-primary mt-0.5 flex-shrink-0" />
                <span className="text-theme-text-secondary">{benefit}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Transaction History */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-theme-text mb-4" style={{ fontFamily: 'var(--theme-font-heading)' }}>
            Historique des Transactions
          </h3>

          {!historyData || historyData.transactions.length === 0 ? (
            <p className="text-center text-theme-text-muted py-8">Aucune transaction pour le moment</p>
          ) : (
            <div className="space-y-3">
              {historyData.transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-theme-surface border border-theme-border rounded-xl hover:border-theme-border-light transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        transaction.points > 0
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {transaction.points > 0 ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <Gift className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-theme-text">{transaction.description}</p>
                      <p className="text-sm text-theme-text-muted">
                        {formatDate(transaction.createdAt)}
                        {transaction.expiresAt && !transaction.isExpired && (
                          <span className="ml-2">
                            • Expire le {new Date(transaction.expiresAt).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.points > 0 ? '+' : ''}{transaction.points} pts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
