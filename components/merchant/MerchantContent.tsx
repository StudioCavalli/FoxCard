'use client'

import { useStoreContext } from '@/lib/context/store-context'
import { SuspendedStoreView } from './SuspendedStoreView'

interface MerchantContentProps {
  children: React.ReactNode
}

export function MerchantContent({ children }: MerchantContentProps) {
  const {
    storeId,
    storeName,
    isSuspended,
    suspendedAt,
    suspendedReason,
    hasPendingAppeal,
    lastAppeal,
    refetchStoreStatus,
    isLoading,
    error,
  } = useStoreContext()

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Erreur</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  // Show suspended store view
  if (isSuspended && storeId && storeName) {
    return (
      <SuspendedStoreView
        storeId={storeId}
        storeName={storeName}
        suspendedAt={suspendedAt}
        suspendedReason={suspendedReason}
        hasPendingAppeal={hasPendingAppeal}
        lastAppeal={lastAppeal}
        onAppealSubmitted={refetchStoreStatus}
      />
    )
  }

  // Show normal content
  return <>{children}</>
}
