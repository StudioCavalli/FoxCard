'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { trpc } from '@/lib/trpc/client'

interface Store {
  id: string
  name: string
  slug?: string
}

interface StoreContextType {
  storeId: string | null
  storeName: string | null
  stores: Store[]
  isLoading: boolean
  error: string | null
  isSuperAdmin: boolean
  setStoreId: (id: string) => void
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  const { data: session, status: sessionStatus } = useSession()
  const [storeId, setStoreId] = useState<string | null>(null)
  const [storeName, setStoreName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  // Combine stores based on role
  const stores = isSuperAdmin
    ? allStoresData?.stores
    : userStores

  const storesError = isSuperAdmin ? allStoresError : userStoresError

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
  }, [stores, storesError, sessionStatus])

  const handleSetStoreId = (id: string) => {
    const store = stores?.find(s => s.id === id)
    if (store) {
      setStoreId(id)
      setStoreName(store.name)
      localStorage.setItem('selectedStoreId', id)
    }
  }

  // Map stores to simple format
  const storesList: Store[] = stores?.map(s => ({
    id: s.id,
    name: s.name,
    slug: 'slug' in s ? s.slug : undefined
  })) || []

  return (
    <StoreContext.Provider
      value={{
        storeId,
        storeName,
        stores: storesList,
        isLoading,
        error,
        isSuperAdmin,
        setStoreId: handleSetStoreId
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
