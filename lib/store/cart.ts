import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId: string
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
    }),
    {
      name: 'foxcard-cart',
    }
  )
)
