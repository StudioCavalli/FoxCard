/**
 * Restaurant tRPC Router
 * Handles restaurant-specific operations: menu, tables, kitchen orders
 */

import { z } from 'zod'
import { router, publicProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import {
  getMenuByCategory,
  getMenuCategories,
  getTables,
  updateTableStatus,
  createTable,
  deleteTable,
  getDeliverySlots,
  getKitchenOrders,
  updateKitchenOrderStatus,
  getRestaurantStats,
  calculateEstimatedPrepTime,
  ALLERGENS,
} from '@/lib/restaurant/restaurant-manager'

const TableStatusEnum = z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING'])
const OrderTypeEnum = z.enum(['DINE_IN', 'TAKEAWAY', 'DELIVERY'])
const KitchenStatusEnum = z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'COMPLETED', 'CANCELLED'])

export const restaurantRouter = router({
  // ============ PUBLIC PROCEDURES ============

  /**
   * Get menu organized by category
   */
  getMenu: publicProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input }) => {
      return getMenuByCategory(input.storeId)
    }),

  /**
   * Get menu categories
   */
  getCategories: publicProcedure.query(() => {
    return getMenuCategories()
  }),

  /**
   * Get allergens list
   */
  getAllergens: publicProcedure.query(() => {
    return ALLERGENS
  }),

  /**
   * Get available delivery/takeaway slots
   */
  getDeliverySlots: publicProcedure
    .input(z.object({
      storeId: z.string(),
      date: z.string(),
      orderType: z.enum(['DELIVERY', 'TAKEAWAY']),
    }))
    .query(async ({ input }) => {
      return getDeliverySlots(
        input.storeId,
        new Date(input.date),
        input.orderType
      )
    }),

  /**
   * Calculate estimated prep time for order
   */
  calculatePrepTime: publicProcedure
    .input(z.object({
      items: z.array(z.object({
        prepTime: z.number().optional(),
        quantity: z.number(),
      })),
    }))
    .query(({ input }) => {
      return calculateEstimatedPrepTime(input.items)
    }),

  // ============ ADMIN PROCEDURES ============

  /**
   * Get all tables
   */
  getTables: adminProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      // Verify store ownership
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      return getTables(input.storeId)
    }),

  /**
   * Create a new table
   */
  createTable: adminProcedure
    .input(z.object({
      storeId: z.string(),
      number: z.string(),
      capacity: z.number().min(1).max(20),
      floor: z.string().optional(),
      section: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      return createTable(input.storeId, {
        number: input.number,
        capacity: input.capacity,
        floor: input.floor,
        section: input.section,
      })
    }),

  /**
   * Update table status
   */
  updateTableStatus: adminProcedure
    .input(z.object({
      storeId: z.string(),
      tableId: z.string(),
      status: TableStatusEnum,
      orderId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      const table = await updateTableStatus(
        input.storeId,
        input.tableId,
        input.status,
        input.orderId
      )

      if (!table) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Table not found' })
      }

      return table
    }),

  /**
   * Delete a table
   */
  deleteTable: adminProcedure
    .input(z.object({
      storeId: z.string(),
      tableId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      const success = await deleteTable(input.storeId, input.tableId)

      if (!success) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Table not found' })
      }

      return { success: true }
    }),

  /**
   * Get kitchen orders (for KDS - Kitchen Display System)
   */
  getKitchenOrders: adminProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      return getKitchenOrders(input.storeId)
    }),

  /**
   * Update kitchen order status
   */
  updateKitchenStatus: adminProcedure
    .input(z.object({
      storeId: z.string(),
      orderId: z.string(),
      status: KitchenStatusEnum,
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify the order belongs to the store
      const order = await ctx.prisma.order.findFirst({
        where: { id: input.orderId, storeId: input.storeId },
        include: { store: true },
      })

      if (!order) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' })
      }

      if (order.store.ownerId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      await updateKitchenOrderStatus(input.orderId, input.status)

      return { success: true }
    }),

  /**
   * Get restaurant statistics for a day
   */
  getStats: adminProcedure
    .input(z.object({
      storeId: z.string(),
      date: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      return getRestaurantStats(
        input.storeId,
        input.date ? new Date(input.date) : new Date()
      )
    }),

  /**
   * Update delivery settings
   */
  updateDeliverySettings: adminProcedure
    .input(z.object({
      storeId: z.string(),
      preparationTime: z.number().min(5).max(120).optional(),
      deliveryRadius: z.number().min(1).max(50).optional(),
      minimumOrder: z.number().min(0).optional(),
      slots: z.array(z.object({
        time: z.string(),
        capacity: z.number().min(1).max(50),
      })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
        select: { id: true, settings: true },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      const currentSettings = (store.settings as Record<string, unknown>) || {}
      const currentDelivery = (currentSettings.delivery as Record<string, unknown>) || {}

      const newDelivery = {
        ...currentDelivery,
        ...(input.preparationTime !== undefined && { preparationTime: input.preparationTime }),
        ...(input.deliveryRadius !== undefined && { deliveryRadius: input.deliveryRadius }),
        ...(input.minimumOrder !== undefined && { minimumOrder: input.minimumOrder }),
        ...(input.slots !== undefined && { slots: input.slots }),
      }

      await ctx.prisma.store.update({
        where: { id: input.storeId },
        data: {
          settings: {
            ...currentSettings,
            delivery: newDelivery,
          },
        },
      })

      return { success: true }
    }),

  /**
   * Bulk update menu item availability
   */
  updateMenuAvailability: adminProcedure
    .input(z.object({
      storeId: z.string(),
      items: z.array(z.object({
        productId: z.string(),
        available: z.boolean(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      // Update all items
      await Promise.all(
        input.items.map((item) =>
          ctx.prisma.product.updateMany({
            where: {
              id: item.productId,
              storeId: input.storeId,
            },
            data: {
              quantity: item.available ? 999 : 0,
            },
          })
        )
      )

      return { success: true, updated: input.items.length }
    }),

  /**
   * Create order with restaurant-specific data
   */
  createOrder: publicProcedure
    .input(z.object({
      storeId: z.string(),
      orderType: OrderTypeEnum,
      tableNumber: z.string().optional(),
      deliverySlot: z.string().optional(),
      deliveryAddress: z.object({
        street: z.string(),
        city: z.string(),
        postalCode: z.string(),
        phone: z.string(),
      }).optional(),
      items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().min(1),
        variantName: z.string().optional(),
      })),
      customerNotes: z.string().optional(),
      customerEmail: z.string().email(),
      customerName: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Validate delivery address for delivery orders
      if (input.orderType === 'DELIVERY' && !input.deliveryAddress) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Delivery address is required for delivery orders',
        })
      }

      // Validate delivery slot
      if ((input.orderType === 'DELIVERY' || input.orderType === 'TAKEAWAY') && !input.deliverySlot) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Delivery/pickup slot is required',
        })
      }

      // Get products to calculate total
      const products = await ctx.prisma.product.findMany({
        where: {
          id: { in: input.items.map((i) => i.productId) },
          storeId: input.storeId,
        },
      })

      if (products.length !== input.items.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Some products were not found',
        })
      }

      // Calculate total and prep time
      let total = 0
      const prepTimes: { prepTime?: number; quantity: number }[] = []

      const orderItems = input.items.map((item) => {
        const product = products.find((p) => p.id === item.productId)!
        const attributes = product.attributes as Record<string, unknown>
        const itemTotal = product.price * item.quantity
        total += itemTotal

        prepTimes.push({
          prepTime: attributes?.prepTime as number | undefined,
          quantity: item.quantity,
        })

        return {
          productId: item.productId,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          variantName: item.variantName,
          total: itemTotal,
        }
      })

      const estimatedPrepTime = calculateEstimatedPrepTime(prepTimes)
      const estimatedReady = new Date(Date.now() + estimatedPrepTime * 60 * 1000)

      // Generate order number
      const orderCount = await ctx.prisma.order.count({
        where: { storeId: input.storeId },
      })
      const orderNumber = `R${(orderCount + 1).toString().padStart(4, '0')}`

      // Store restaurant-specific data in notes as JSON
      const restaurantData = JSON.stringify({
        orderType: input.orderType,
        tableNumber: input.tableNumber,
        deliverySlot: input.deliverySlot,
        estimatedPrepTime,
        estimatedReady: estimatedReady.toISOString(),
        customerNotes: input.customerNotes,
      })

      // Create order
      const order = await ctx.prisma.order.create({
        data: {
          storeId: input.storeId,
          orderNumber,
          status: 'PENDING',
          subtotal: total,
          total,
          paymentStatus: 'PENDING',
          customerEmail: input.customerEmail,
          customerName: input.customerName,
          notes: restaurantData,
          shippingAddress: input.deliveryAddress ? {
            firstName: input.customerName || 'Client',
            lastName: '',
            address1: input.deliveryAddress.street,
            city: input.deliveryAddress.city,
            postalCode: input.deliveryAddress.postalCode,
            country: 'FR',
            phone: input.deliveryAddress.phone,
          } : undefined,
          items: {
            create: orderItems.map((item) => ({
              productId: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              variantName: item.variantName,
              total: item.total,
            })),
          },
        },
        include: {
          items: true,
        },
      })

      // Update table status if dine-in
      if (input.orderType === 'DINE_IN' && input.tableNumber) {
        const tables = await getTables(input.storeId)
        const table = tables.find((t) => t.number === input.tableNumber)
        if (table) {
          await updateTableStatus(input.storeId, table.id, 'OCCUPIED', order.id)
        }
      }

      return {
        orderId: order.id,
        orderNumber,
        estimatedPrepTime,
        estimatedReady,
        total,
      }
    }),
})
