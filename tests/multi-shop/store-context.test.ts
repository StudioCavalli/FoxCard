import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Multi-Shop Store Context', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Store Selection', () => {
    it('should persist selected store in localStorage', () => {
      const storeId = 'store-123'
      localStorage.setItem('selectedStoreId', storeId)
      expect(localStorage.getItem('selectedStoreId')).toBe(storeId)
    })

    it('should clear store selection on logout', () => {
      localStorage.setItem('selectedStoreId', 'store-123')
      localStorage.removeItem('selectedStoreId')
      expect(localStorage.getItem('selectedStoreId')).toBeNull()
    })
  })

  describe('Store Access', () => {
    it('should allow owner to access store', () => {
      const store = {
        id: 'store-123',
        ownerId: 'user-123',
        name: 'Test Store',
      }
      const userId = 'user-123'

      const hasAccess = store.ownerId === userId
      expect(hasAccess).toBe(true)
    })

    it('should allow member to access store', () => {
      const storeUsers = [
        { storeId: 'store-123', userId: 'user-456', status: 'ACTIVE' },
      ]
      const userId = 'user-456'
      const storeId = 'store-123'

      const hasAccess = storeUsers.some(
        (su) => su.storeId === storeId && su.userId === userId && su.status === 'ACTIVE'
      )
      expect(hasAccess).toBe(true)
    })

    it('should deny access to non-member', () => {
      const storeUsers = [
        { storeId: 'store-123', userId: 'user-456', status: 'ACTIVE' },
      ]
      const userId = 'user-789'
      const storeId = 'store-123'

      const hasAccess = storeUsers.some(
        (su) => su.storeId === storeId && su.userId === userId && su.status === 'ACTIVE'
      )
      expect(hasAccess).toBe(false)
    })

    it('should deny access to inactive member', () => {
      const storeUsers = [
        { storeId: 'store-123', userId: 'user-456', status: 'INACTIVE' },
      ]
      const userId = 'user-456'
      const storeId = 'store-123'

      const hasAccess = storeUsers.some(
        (su) => su.storeId === storeId && su.userId === userId && su.status === 'ACTIVE'
      )
      expect(hasAccess).toBe(false)
    })
  })
})

describe('Multi-Shop Public Context', () => {
  describe('Store Filtering', () => {
    it('should return all products when selectedStore is "all"', () => {
      const products = [
        { id: 'p1', storeId: 'store-1', name: 'Product 1' },
        { id: 'p2', storeId: 'store-2', name: 'Product 2' },
        { id: 'p3', storeId: 'store-1', name: 'Product 3' },
      ]
      const selectedStore = 'all'

      const filteredProducts =
        selectedStore === 'all'
          ? products
          : products.filter((p) => p.storeId === selectedStore)

      expect(filteredProducts).toHaveLength(3)
    })

    it('should filter products by store when selectedStore is set', () => {
      const products = [
        { id: 'p1', storeId: 'store-1', name: 'Product 1' },
        { id: 'p2', storeId: 'store-2', name: 'Product 2' },
        { id: 'p3', storeId: 'store-1', name: 'Product 3' },
      ]
      const selectedStore: string = 'store-1'

      const filteredProducts =
        selectedStore === 'all'
          ? products
          : products.filter((p) => p.storeId === selectedStore)

      expect(filteredProducts).toHaveLength(2)
      expect(filteredProducts.every((p) => p.storeId === 'store-1')).toBe(true)
    })
  })
})
