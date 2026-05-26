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

// Default store will be null - actual store comes from PublicStoreContext
const DEFAULT_STORE: Store | null = null

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
