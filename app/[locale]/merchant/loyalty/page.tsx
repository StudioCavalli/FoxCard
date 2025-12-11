'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import { useTranslations } from 'next-intl'
import {
  Award,
  Users,
  Star,
  Settings,
  Loader2,
  Search,
  TrendingUp,
  Gift,
  Crown,
  Medal,
  Trophy,
  Plus,
  Minus,
  X,
  Info
} from 'lucide-react'

// Default loyalty configuration (should match backend)
const LOYALTY_CONFIG = {
  pointsPerEuro: 1,
  signupBonus: 100,
  pointsExpiryMonths: 12,
  tiers: {
    BRONZE: { threshold: 0, color: 'bg-amber-600', icon: Medal },
    SILVER: { threshold: 1000, color: 'bg-slate-400', icon: Crown },
    GOLD: { threshold: 5000, color: 'bg-yellow-500', icon: Trophy },
  }
}

export default function MerchantLoyaltyPage() {
  const params = useParams()
  const locale = params?.locale || 'fr'
  const { storeId } = useStoreContext()
  const t = useTranslations('merchant.restaurant.loyalty')

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTier, setSelectedTier] = useState<'BRONZE' | 'SILVER' | 'GOLD' | 'ALL'>('ALL')
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [adjustPoints, setAdjustPoints] = useState('')
  const [adjustReason, setAdjustReason] = useState('')

  // Fetch customers with loyalty data
  const { data: customers, isLoading, refetch } = trpc.loyalty.getAllCustomersLoyalty.useQuery(
    {
      storeId: storeId!,
      tier: selectedTier === 'ALL' ? undefined : selectedTier,
      limit: 100
    },
    { enabled: !!storeId }
  )

  // Mutation for adjusting points
  const adjustPointsMutation = trpc.loyalty.adminAdjustPoints.useMutation({
    onSuccess: () => {
      refetch()
      setShowAdjustModal(false)
      setSelectedCustomer(null)
      setAdjustPoints('')
      setAdjustReason('')
    }
  })

  const handleAdjustPoints = () => {
    if (!selectedCustomer || !adjustPoints || !adjustReason) return

    adjustPointsMutation.mutate({
      customerId: selectedCustomer.id,
      points: parseInt(adjustPoints),
      reason: adjustReason
    })
  }

  const openAdjustModal = (customer: any, type: 'add' | 'remove') => {
    setSelectedCustomer(customer)
    setAdjustPoints(type === 'add' ? '' : '-')
    setShowAdjustModal(true)
  }

  // Filter customers by search
  const filteredCustomers = customers?.filter(c =>
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculate stats
  const totalCustomers = customers?.length || 0
  const totalPoints = customers?.reduce((sum, c) => sum + c.loyaltyPoints, 0) || 0
  const tierCounts = {
    BRONZE: customers?.filter(c => c.loyaltyTier === 'BRONZE').length || 0,
    SILVER: customers?.filter(c => c.loyaltyTier === 'SILVER').length || 0,
    GOLD: customers?.filter(c => c.loyaltyTier === 'GOLD').length || 0,
  }

  const getTierIcon = (tier: 'BRONZE' | 'SILVER' | 'GOLD') => {
    const config = LOYALTY_CONFIG.tiers[tier]
    const Icon = config.icon
    return <Icon className="w-4 h-4" />
  }

  const getTierColor = (tier: 'BRONZE' | 'SILVER' | 'GOLD') => {
    switch (tier) {
      case 'GOLD': return 'warning'
      case 'SILVER': return 'info'
      default: return 'default'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-primary-500/20 dark:from-primary-500/30 dark:to-primary-500/30 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('stats.totalMembers')}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-green-500/20 dark:from-emerald-500/30 dark:to-green-500/30 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('stats.totalPoints')}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{totalPoints.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 dark:from-yellow-500/30 dark:to-amber-500/30 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('stats.goldMembers')}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{tierCounts.GOLD}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-500/20 to-gray-500/20 dark:from-slate-500/30 dark:to-gray-500/30 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('stats.silverMembers')}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{tierCounts.SILVER}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loyalty Program Settings */}
      <AdminCard>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="font-semibold text-slate-900 dark:text-white">{t('settings.title')}</h2>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Points per Euro */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('settings.pointsPerEuro')}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{LOYALTY_CONFIG.pointsPerEuro} pt / €</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('settings.pointsPerEuroDesc')}</p>
            </div>

            {/* Signup Bonus */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-primary-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('settings.signupBonus')}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{LOYALTY_CONFIG.signupBonus} pts</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('settings.signupBonusDesc')}</p>
            </div>

            {/* Points Expiry */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('settings.pointsExpiry')}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{LOYALTY_CONFIG.pointsExpiryMonths} {t('settings.months')}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('settings.pointsExpiryDesc')}</p>
            </div>
          </div>

          {/* Tiers */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{t('settings.tiers')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl">
                <Medal className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Bronze</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">0 - 999€</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-500/10 border border-slate-300 dark:border-slate-500/30 rounded-xl">
                <Crown className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Silver</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">1,000€ - 4,999€</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30 rounded-xl">
                <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Gold</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">5,000€+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminCard>

      {/* Members List */}
      <AdminCard>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-semibold text-slate-900 dark:text-white">{t('members.title')}</h2>
            <div className="flex items-center gap-3">
              {/* Tier Filter */}
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value as any)}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="ALL">{t('members.allTiers')}</option>
                <option value="BRONZE">Bronze</option>
                <option value="SILVER">Silver</option>
                <option value="GOLD">Gold</option>
              </select>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('members.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : filteredCustomers && filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">{t('members.customer')}</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">{t('members.tier')}</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">{t('members.points')}</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">{t('members.totalEarned')}</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">{t('members.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {customer.firstName?.charAt(0) || customer.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {customer.firstName} {customer.lastName}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <AdminBadge variant={getTierColor(customer.loyaltyTier as any)}>
                        <span className="flex items-center gap-1">
                          {getTierIcon(customer.loyaltyTier as any)}
                          {customer.loyaltyTier}
                        </span>
                      </AdminBadge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {customer.loyaltyPoints.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-slate-500 dark:text-slate-400">
                        {customer.totalPointsEarned.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openAdjustModal(customer, 'add')}
                          className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
                          title={t('members.addPoints')}
                        >
                          <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </button>
                        <button
                          onClick={() => openAdjustModal(customer, 'remove')}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          title={t('members.removePoints')}
                        >
                          <Minus className="w-4 h-4 text-red-500 dark:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">{t('members.noMembers')}</h3>
            <p className="text-slate-500 dark:text-slate-400">{t('members.noMembersDesc')}</p>
          </div>
        )}
      </AdminCard>

      {/* Adjust Points Modal */}
      {showAdjustModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t('adjust.title')}
              </h2>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedCustomer.firstName?.charAt(0) || selectedCustomer.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t('adjust.currentBalance')}: {selectedCustomer.loyaltyPoints.toLocaleString()} pts
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('adjust.points')} *
                </label>
                <input
                  type="number"
                  value={adjustPoints}
                  onChange={(e) => setAdjustPoints(e.target.value)}
                  placeholder={t('adjust.pointsPlaceholder')}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t('adjust.pointsHint')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('adjust.reason')} *
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder={t('adjust.reasonPlaceholder')}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <AdminButton
                  variant="secondary"
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1"
                >
                  {t('adjust.cancel')}
                </AdminButton>
                <AdminButton
                  onClick={handleAdjustPoints}
                  disabled={!adjustPoints || !adjustReason || adjustPointsMutation.isPending}
                  className="flex-1"
                  icon={adjustPointsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                >
                  {adjustPointsMutation.isPending ? '' : t('adjust.confirm')}
                </AdminButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
