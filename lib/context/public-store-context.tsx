'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { trpc } from '@/lib/trpc/client'

interface PublicStoreContextType {
  selectedStore: string | 'all'
  setSelectedStore: (storeId: string | 'all') => void
  stores: Array<{
    id: string
    name: string
    slug: string
    logo: string | null
    description: string | null
  }>
  isLoading: boolean
}

const PublicStoreContext = createContext<PublicStoreContextType | undefined>(undefined)

export function PublicStoreProvider({ children }: { children: ReactNode }) {
  const [selectedStore, setSelectedStoreState] = useState<string | 'all'>('all')

  // Fetch all public stores
  const { data: stores = [], isLoading } = trpc.store.getPublicStores.useQuery()

  // Load selected store from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('publicStoreSelection')
    if (saved) {
      setSelectedStoreState(saved)
    }
  }, [])

  const handleStoreChange = (storeId: string | 'all') => {
    setSelectedStoreState(storeId)
    localStorage.setItem('publicStoreSelection', storeId)
  }

  return (
    <PublicStoreContext.Provider
      value={{
        selectedStore,
        setSelectedStore: handleStoreChange,
        stores,
        isLoading,
      }}
    >
      {children}
    </PublicStoreContext.Provider>
  )
}

export function usePublicStore() {
  const context = useContext(PublicStoreContext)
  if (context === undefined) {
    throw new Error('usePublicStore must be used within a PublicStoreProvider')
  }
  return context
}
