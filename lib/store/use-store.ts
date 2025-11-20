import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Store {
  id: string
  name: string
  slug: string
}

interface StoreState {
  currentStore: Store | null
  setCurrentStore: (store: Store) => void
  clearCurrentStore: () => void
}

// Default store for development/demo
const DEFAULT_STORE: Store = {
  id: '000000000000000000000001',
  name: 'FoxCard Demo Store',
  slug: 'demo',
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      currentStore: DEFAULT_STORE,
      setCurrentStore: (store) => set({ currentStore: store }),
      clearCurrentStore: () => set({ currentStore: null }),
    }),
    {
      name: 'foxcard-store',
    }
  )
)
