'use client'

import { useState, useEffect } from 'react'
import { AdminCard, AdminCardHeader } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { AdminInput } from '@/components/admin/ui/AdminInput'
import { AdminToggle } from '@/components/admin/ui/AdminToggle'
import { AdminStatCard } from '@/components/admin/ui/AdminStatCard'
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import {
  Coins,
  Wallet,
  Save,
  AlertTriangle,
  ExternalLink,
  ArrowLeftRight,
  Hash,
  TrendingUp,
  Receipt,
  Info,
} from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

function isValidWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export default function MerchantSunPayPage() {
  const locale = useLocale()
  const { storeId } = useStoreContext()

  const [isEnabled, setIsEnabled] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [walletError, setWalletError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  // tRPC queries — these endpoints will be created by another agent
  const { data: config, isLoading } = trpc.sunpay.getConfig.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  )

  useEffect(() => {
    if (!hasLoaded && config) {
      setIsEnabled(config.isEnabled)
      setWalletAddress(config.walletAddress || '')
      setHasLoaded(true)
    }
  }, [config, hasLoaded])

  const updateConfig = trpc.sunpay.updateConfig.useMutation({
    onSuccess: () => {
      setIsSaving(false)
    },
    onError: () => {
      setIsSaving(false)
    },
  })

  const handleWalletChange = (value: string) => {
    setWalletAddress(value)
    if (value && !isValidWalletAddress(value)) {
      setWalletError('Invalid wallet address. Must be 0x followed by 40 hexadecimal characters.')
    } else {
      setWalletError('')
    }
  }

  const handleSave = () => {
    if (walletAddress && !isValidWalletAddress(walletAddress)) {
      setWalletError('Invalid wallet address. Must be 0x followed by 40 hexadecimal characters.')
      return
    }
    setIsSaving(true)
    updateConfig.mutate({
      storeId: storeId!,
      isEnabled,
      walletAddress: walletAddress || undefined,
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-64 animate-pulse" />
        <div className="h-16 bg-amber-100 dark:bg-amber-900/20 rounded-xl animate-pulse" />
        <AdminCard padding="lg">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
            ))}
          </div>
        </AdminCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              SunPay
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              GoldenEra Blockchain Payments
            </p>
          </div>
        </div>
        <AdminButton
          onClick={handleSave}
          loading={isSaving}
          icon={<Save className="w-4 h-4" />}
        >
          {isSaving ? 'Saving...' : 'Save configuration'}
        </AdminButton>
      </div>

      {/* Integration Banner */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-800 dark:text-amber-300">
            Integration in progress
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
            The GoldenEra API will be connected soon. You can configure your settings now.
          </p>
        </div>
      </div>

      {/* Configuration Card */}
      <AdminCard padding="none" className="overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <AdminCardHeader
            title="SunPay configuration"
            description="Enable SunPay to accept SunCoin (SCGE) payments on your store"
          />

          {/* Enable Toggle */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <AdminToggle
              label="Enable SunPay"
              description="Accept SCGE payments at checkout"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
            />
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Wallet Address */}
          <AdminInput
            label="Wallet address (SCGE)"
            placeholder="0x0000000000000000000000000000000000000000"
            value={walletAddress}
            onChange={(e) => handleWalletChange(e.target.value)}
            error={walletError}
            hint="Your GoldenEra wallet address where payments will be received"
            leftIcon={<Wallet className="w-4 h-4" />}
          />

          {/* Info */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">How it works</p>
              <p>When a customer selects SunPay at checkout, they will send SCGE tokens directly to your wallet address. Transactions are confirmed on the GoldenEra Blockchain and settlement is instant.</p>
            </div>
          </div>
        </div>
      </AdminCard>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard
          title="Total SCGE received"
          value="0.00"
          icon={Coins}
          variant="amber"
          subtitle="SunCoin"
        />
        <AdminStatCard
          title="Transactions"
          value={0}
          icon={Hash}
          variant="blue"
          subtitle="Total count"
        />
        <AdminStatCard
          title="Conversion rate"
          value="0%"
          icon={TrendingUp}
          variant="emerald"
          subtitle="SunPay / Total"
        />
      </div>

      {/* Transaction History */}
      <AdminCard padding="none" className="overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <AdminCardHeader
            title="Transaction history"
            description="Your SunPay SCGE transactions"
            action={
              <AdminBadge variant="default" size="sm">
                0 transactions
              </AdminBadge>
            }
          />
        </div>
        <div className="p-0">
          <AdminEmptyState
            icon={Receipt}
            title="No transactions yet"
            description="SunPay transactions will appear here once the integration is live and you receive your first SCGE payment."
            className="border-none rounded-none"
          />
        </div>
      </AdminCard>

      {/* Link to Public Page */}
      <AdminCard padding="md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-500/20 dark:to-yellow-500/20 rounded-xl flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">GoldenEra Blockchain</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Learn more about the ecosystem</p>
            </div>
          </div>
          <Link href={`/${locale}/goldenera`}>
            <AdminButton variant="outline" size="sm" icon={<ExternalLink className="w-4 h-4" />}>
              View page
            </AdminButton>
          </Link>
        </div>
      </AdminCard>
    </div>
  )
}
