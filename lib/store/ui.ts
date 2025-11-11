import { create } from 'zustand'

interface UIStore {
  // Cart drawer
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void

  // Mobile menu
  isMobileMenuOpen: boolean
  openMobileMenu: () => void
  closeMobileMenu: () => void
  toggleMobileMenu: () => void

  // Product quick view
  quickViewProduct: string | null
  openQuickView: (productId: string) => void
  closeQuickView: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  // Cart drawer
  isCartOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  // Mobile menu
  isMobileMenuOpen: false,
  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  // Product quick view
  quickViewProduct: null,
  openQuickView: (productId) => set({ quickViewProduct: productId }),
  closeQuickView: () => set({ quickViewProduct: null }),
}))
