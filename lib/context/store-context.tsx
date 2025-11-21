'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { trpc } from '@/lib/trpc/client'

interface StoreContextType {
  storeId: string | null
  storeName: string | null
  isLoading: boolean
  setStoreId: (id: string) => void
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [storeId, setStoreId] = useState<string | null>(null)
  const [storeName, setStoreName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Get user's stores
  const { data: stores } = trpc.store.getUserStores.useQuery(undefined, {
    enabled: !!session?.user
  })

  useEffect(() => {
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
      setIsLoading(false)
    }
  }, [stores])

  const handleSetStoreId = (id: string) => {
    const store = stores?.find(s => s.id === id)
    if (store) {
      setStoreId(id)
      setStoreName(store.name)
      localStorage.setItem('selectedStoreId', id)
    }
  }

  return (
    <StoreContext.Provider
      value={{
        storeId,
        storeName,
        isLoading,
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
