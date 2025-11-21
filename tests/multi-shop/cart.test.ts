import { describe, it, expect, beforeEach } from 'vitest'

// Mock cart item structure
interface CartItem {
  id: string
  productId: string
  storeId: string
  storeName?: string
  name: string
  price: number
  quantity: number
}

describe('Multi-Store Cart', () => {
  let cart: CartItem[] = []

  beforeEach(() => {
    cart = []
  })

  const addItem = (item: CartItem) => {
    const existingIndex = cart.findIndex((i) => i.productId === item.productId)
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += item.quantity
    } else {
      cart.push(item)
    }
  }

  const removeItem = (productId: string) => {
    cart = cart.filter((item) => item.productId !== productId)
  }

  const getItemsByStore = (storeId: string) => {
    return cart.filter((item) => item.storeId === storeId)
  }

  const groupItemsByStore = () => {
    return cart.reduce(
      (groups, item) => {
        const storeId = item.storeId
        if (!groups[storeId]) {
          groups[storeId] = {
            storeId,
            storeName: item.storeName,
            items: [],
            subtotal: 0,
          }
        }
        groups[storeId].items.push(item)
        groups[storeId].subtotal += item.price * item.quantity
        return groups
      },
      {} as Record<string, { storeId: string; storeName?: string; items: CartItem[]; subtotal: number }>
    )
  }

  const getTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  describe('Adding Items', () => {
    it('should add item to cart', () => {
      addItem({
        id: '1',
        productId: 'p1',
        storeId: 'store-1',
        storeName: 'Store 1',
        name: 'Product 1',
        price: 1000,
        quantity: 1,
      })

      expect(cart).toHaveLength(1)
      expect(cart[0].name).toBe('Product 1')
    })

    it('should add items from multiple stores', () => {
      addItem({
        id: '1',
        productId: 'p1',
        storeId: 'store-1',
        storeName: 'Store 1',
        name: 'Product 1',
        price: 1000,
        quantity: 1,
      })

      addItem({
        id: '2',
        productId: 'p2',
        storeId: 'store-2',
        storeName: 'Store 2',
        name: 'Product 2',
        price: 2000,
        quantity: 2,
      })

      expect(cart).toHaveLength(2)
      expect(cart[0].storeId).toBe('store-1')
      expect(cart[1].storeId).toBe('store-2')
    })

    it('should increment quantity for existing item', () => {
      addItem({
        id: '1',
        productId: 'p1',
        storeId: 'store-1',
        name: 'Product 1',
        price: 1000,
        quantity: 1,
      })

      addItem({
        id: '1',
        productId: 'p1',
        storeId: 'store-1',
        name: 'Product 1',
        price: 1000,
        quantity: 2,
      })

      expect(cart).toHaveLength(1)
      expect(cart[0].quantity).toBe(3)
    })
  })

  describe('Removing Items', () => {
    it('should remove item from cart', () => {
      addItem({
        id: '1',
        productId: 'p1',
        storeId: 'store-1',
        name: 'Product 1',
        price: 1000,
        quantity: 1,
      })

      removeItem('p1')
      expect(cart).toHaveLength(0)
    })

    it('should only remove specified item', () => {
      addItem({
        id: '1',
        productId: 'p1',
        storeId: 'store-1',
        name: 'Product 1',
        price: 1000,
        quantity: 1,
      })

      addItem({
        id: '2',
        productId: 'p2',
        storeId: 'store-1',
        name: 'Product 2',
        price: 2000,
        quantity: 1,
      })

      removeItem('p1')
      expect(cart).toHaveLength(1)
      expect(cart[0].productId).toBe('p2')
    })
  })

  describe('Store Grouping', () => {
    beforeEach(() => {
      addItem({
        id: '1',
        productId: 'p1',
        storeId: 'store-1',
        storeName: 'Store 1',
        name: 'Product 1',
        price: 1000,
        quantity: 1,
      })

      addItem({
        id: '2',
        productId: 'p2',
        storeId: 'store-1',
        storeName: 'Store 1',
        name: 'Product 2',
        price: 2000,
        quantity: 2,
      })

      addItem({
        id: '3',
        productId: 'p3',
        storeId: 'store-2',
        storeName: 'Store 2',
        name: 'Product 3',
        price: 1500,
        quantity: 1,
      })
    })

    it('should get items by store', () => {
      const store1Items = getItemsByStore('store-1')
      expect(store1Items).toHaveLength(2)

      const store2Items = getItemsByStore('store-2')
      expect(store2Items).toHaveLength(1)
    })

    it('should group items by store', () => {
      const groups = groupItemsByStore()

      expect(Object.keys(groups)).toHaveLength(2)
      expect(groups['store-1'].items).toHaveLength(2)
      expect(groups['store-2'].items).toHaveLength(1)
    })

    it('should calculate subtotal per store', () => {
      const groups = groupItemsByStore()

      // Store 1: 1000 * 1 + 2000 * 2 = 5000
      expect(groups['store-1'].subtotal).toBe(5000)

      // Store 2: 1500 * 1 = 1500
      expect(groups['store-2'].subtotal).toBe(1500)
    })

    it('should calculate total across all stores', () => {
      const total = getTotal()
      // 1000 * 1 + 2000 * 2 + 1500 * 1 = 6500
      expect(total).toBe(6500)
    })
  })

  describe('Order Creation', () => {
    it('should create separate orders per store', () => {
      addItem({
        id: '1',
        productId: 'p1',
        storeId: 'store-1',
        storeName: 'Store 1',
        name: 'Product 1',
        price: 1000,
        quantity: 1,
      })

      addItem({
        id: '2',
        productId: 'p2',
        storeId: 'store-2',
        storeName: 'Store 2',
        name: 'Product 2',
        price: 2000,
        quantity: 1,
      })

      const groups = groupItemsByStore()
      const storeIds = Object.keys(groups)

      // Should create 2 separate orders
      expect(storeIds).toHaveLength(2)

      // Each order should have only items from that store
      storeIds.forEach((storeId) => {
        const storeItems = groups[storeId].items
        expect(storeItems.every((item) => item.storeId === storeId)).toBe(true)
      })
    })
  })
})
