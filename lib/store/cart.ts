import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId: string
  storeId: string // Store ID for multi-store support
  storeName?: string // Optional store name for display
  name: string
  slug: string
  price: number
  quantity: number
  image?: string
  variantId?: string
  variantName?: string
  maxQuantity?: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  getItemsByStore: () => Record<string, CartItem[]>
  getStoreSubtotal: (storeId: string) => number
  getUniqueStoresCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = get().items
        const existingItemIndex = items.findIndex(
          (i) => i.productId === item.productId && i.variantId === item.variantId
        )

        if (existingItemIndex > -1) {
          const newItems = [...items]
          const currentQuantity = newItems[existingItemIndex].quantity
          const maxQuantity = newItems[existingItemIndex].maxQuantity
          const newQuantity = currentQuantity + (item.quantity || 1)

          newItems[existingItemIndex].quantity = maxQuantity
            ? Math.min(newQuantity, maxQuantity)
            : newQuantity

          set({ items: newItems })
        } else {
          set({
            items: [
              ...items,
              {
                ...item,
                id: item.variantId || item.productId,
                quantity: item.quantity || 1,
              },
            ],
          })
        }
      },

      removeItem: (productId, variantId) => {
        set({
          items: get().items.filter(
            (item) => !(item.productId === productId && item.variantId === variantId)
          ),
        })
      },

      updateQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId)
          return
        }

        const items = get().items
        const itemIndex = items.findIndex(
          (i) => i.productId === productId && i.variantId === variantId
        )

        if (itemIndex > -1) {
          const newItems = [...items]
          const maxQuantity = newItems[itemIndex].maxQuantity
          newItems[itemIndex].quantity = maxQuantity
            ? Math.min(quantity, maxQuantity)
            : quantity

          set({ items: newItems })
        }
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getItemsByStore: () => {
        const items = get().items
        return items.reduce((acc, item) => {
          if (!acc[item.storeId]) {
            acc[item.storeId] = []
          }
          acc[item.storeId].push(item)
          return acc
        }, {} as Record<string, CartItem[]>)
      },

      getStoreSubtotal: (storeId) => {
        const items = get().items.filter((item) => item.storeId === storeId)
        return items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getUniqueStoresCount: () => {
        const storeIds = new Set(get().items.map((item) => item.storeId))
        return storeIds.size
      },
    }),
    {
      name: 'foxcard-cart',
    }
  )
)
