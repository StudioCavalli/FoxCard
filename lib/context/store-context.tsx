'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { trpc } from '@/lib/trpc/client'

interface Store {
  id: string
  name: string
  slug?: string
  status?: 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'CLOSED'
  suspendedAt?: Date | null
  suspendedReason?: string | null
}

interface StoreContextType {
  storeId: string | null
  storeName: string | null
  stores: Store[]
  isLoading: boolean
  error: string | null
  isSuperAdmin: boolean
  setStoreId: (id: string) => void
  // Suspension info
  isSuspended: boolean
  suspendedAt: Date | null
  suspendedReason: string | null
  hasPendingAppeal: boolean
  lastAppeal: {
    status: string
    message: string
    adminResponse: string | null
    createdAt: Date
    reviewedAt: Date | null
  } | null
  refetchStoreStatus: () => void
  // Impersonation (SuperAdmin only)
  isImpersonating: boolean
  impersonatedStore: Store | null
  startImpersonation: (storeId: string) => void
  endImpersonation: () => void
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  const { data: session, status: sessionStatus } = useSession()
  const [storeId, setStoreId] = useState<string | null>(null)
  const [storeName, setStoreName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Impersonation state (SuperAdmin only)
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [impersonatedStore, setImpersonatedStore] = useState<Store | null>(null)

  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN'

  // Get user's stores (for regular admins)
  const { data: userStores, error: userStoresError } = trpc.store.getUserStores.useQuery(undefined, {
    enabled: !!session?.user && !isSuperAdmin
  })

  // Get ALL stores (for super admins)
  const { data: allStoresData, error: allStoresError } = trpc.superadmin.getAllStores.useQuery(
    { limit: 1000, offset: 0 },
    { enabled: !!session?.user && isSuperAdmin }
  )

  // Get store status (for suspension info) - only for non-superadmins
  const { data: storeStatus, refetch: refetchStoreStatus } = trpc.store.getStoreStatus.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId && !isSuperAdmin }
  )

  // Combine stores based on role
  const stores = isSuperAdmin
    ? allStoresData?.stores
    : userStores

  const storesError = isSuperAdmin ? allStoresError : userStoresError

  // Combined effect for store initialization and impersonation restoration
  useEffect(() => {
    // Reset error state
    setError(null)

    // Handle session loading
    if (sessionStatus === 'loading') {
      setIsLoading(true)
      return
    }

    // Handle unauthenticated user
    if (sessionStatus === 'unauthenticated') {
      setIsLoading(false)
      setError('Vous devez être connecté pour accéder à cette page')
      return
    }

    // Handle stores error
    if (storesError) {
      setIsLoading(false)
      setError('Erreur lors du chargement des boutiques')
      return
    }

    if (stores && stores.length > 0) {
      // Check for impersonation first (SuperAdmin only)
      if (isSuperAdmin) {
        const impersonatingId = localStorage.getItem('impersonatingStoreId')
        if (impersonatingId) {
          const store = stores.find(s => s.id === impersonatingId)
          if (store) {
            setIsImpersonating(true)
            setImpersonatedStore({
              id: store.id,
              name: store.name,
              slug: 'slug' in store ? store.slug : undefined,
              status: 'status' in store ? store.status : undefined,
            })
            setStoreId(store.id)
            setStoreName(store.name)
            setIsLoading(false)
            return
          }
        }
      }

      // Check localStorage for previously selected store
      const savedStoreId = localStorage.getItem('selectedStoreId')
      const store = savedStoreId
        ? stores.find(s => s.id === savedStoreId) || stores[0]
        : stores[0]

      setStoreId(store.id)
      setStoreName(store.name)
      setIsLoading(false)
    } else if (stores) {
      // User has no stores
      setIsLoading(false)
      setError('Vous n\'avez pas encore de boutique. Créez-en une pour commencer.')
    }
  }, [stores, storesError, sessionStatus, isSuperAdmin])

  const handleSetStoreId = (id: string) => {
    const store = stores?.find(s => s.id === id)
    if (store) {
      setStoreId(id)
      setStoreName(store.name)
      localStorage.setItem('selectedStoreId', id)
    }
  }

  // Impersonation methods (SuperAdmin only)
  const startImpersonation = (targetStoreId: string) => {
    if (!isSuperAdmin) return

    const store = stores?.find(s => s.id === targetStoreId)
    if (store) {
      setIsImpersonating(true)
      setImpersonatedStore({
        id: store.id,
        name: store.name,
        slug: 'slug' in store ? store.slug : undefined,
        status: 'status' in store ? store.status : undefined,
      })
      setStoreId(store.id)
      setStoreName(store.name)
      localStorage.setItem('impersonatingStoreId', store.id)
    }
  }

  const endImpersonation = () => {
    setIsImpersonating(false)
    setImpersonatedStore(null)
    localStorage.removeItem('impersonatingStoreId')

    // Reset to first store or no store
    if (stores && stores.length > 0) {
      const savedStoreId = localStorage.getItem('selectedStoreId')
      const store = savedStoreId
        ? stores.find(s => s.id === savedStoreId) || stores[0]
        : stores[0]
      setStoreId(store.id)
      setStoreName(store.name)
    }
  }

  // Map stores to simple format
  const storesList: Store[] = stores?.map(s => ({
    id: s.id,
    name: s.name,
    slug: 'slug' in s ? s.slug : undefined
  })) || []

  // Suspension info (super admins are never suspended)
  const isSuspended = !isSuperAdmin && storeStatus?.status === 'SUSPENDED'
  const suspendedAt = storeStatus?.suspendedAt ?? null
  const suspendedReason = storeStatus?.suspendedReason ?? null
  const hasPendingAppeal = storeStatus?.hasPendingAppeal ?? false
  const lastAppeal = storeStatus?.lastAppeal ?? null

  return (
    <StoreContext.Provider
      value={{
        storeId,
        storeName,
        stores: storesList,
        isLoading,
        error,
        isSuperAdmin,
        setStoreId: handleSetStoreId,
        isSuspended,
        suspendedAt,
        suspendedReason,
        hasPendingAppeal,
        lastAppeal,
        refetchStoreStatus: () => refetchStoreStatus(),
        // Impersonation
        isImpersonating,
        impersonatedStore,
        startImpersonation,
        endImpersonation,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStoreContext() {
  const context = useContext(StoreContext)

  if (context === undefined) {
    throw new Error('useStoreContext must be used within a StoreProvider')
  }

  return context
}
