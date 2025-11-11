import { z } from 'zod'
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../trpc'
import { OrderStatus, PaymentStatus, FulfillmentStatus } from '@prisma/client'

export const orderRouter = router({
  getAll: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        status: z.nativeEnum(OrderStatus).optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { storeId, status, limit, cursor } = input

      const orders = await ctx.prisma.order.findMany({
        take: limit + 1,
        where: {
          storeId,
          ...(status && { status }),
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (orders.length > limit) {
        const nextItem = orders.pop()
        nextCursor = nextItem!.id
      }

      return {
        orders,
        nextCursor,
      }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.order.findUnique({
        where: { id: input.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
        },
      })
    }),

  getByOrderNumber: publicProcedure
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.order.findUnique({
        where: { orderNumber: input.orderNumber },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
        },
      })
    }),

  create: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
        customerEmail: z.string().email(),
        customerName: z.string().optional(),
        items: z.array(
          z.object({
            productId: z.string(),
            quantity: z.number().min(1),
            variantId: z.string().optional(),
            variantName: z.string().optional(),
          })
        ),
        shippingAddress: z.any(),
        billingAddress: z.any().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { items, ...orderData } = input

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`

      // Calculate totals
      const productsData = await ctx.prisma.product.findMany({
        where: {
          id: { in: items.map((item) => item.productId) },
        },
      })

      const orderItems = items.map((item) => {
        const product = productsData.find((p) => p.id === item.productId)
        if (!product) throw new Error(`Product ${item.productId} not found`)

        const itemTotal = product.price * item.quantity
        return {
          productId: item.productId,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          variantId: item.variantId,
          variantName: item.variantName,
          total: itemTotal,
        }
      })

      const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0)
      const total = subtotal // Add tax and shipping calculation later

      // Create order with items
      return ctx.prisma.order.create({
        data: {
          ...orderData,
          orderNumber,
          subtotal,
          total,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      })
    }),

  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(OrderStatus).optional(),
        paymentStatus: z.nativeEnum(PaymentStatus).optional(),
        fulfillmentStatus: z.nativeEnum(FulfillmentStatus).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.prisma.order.update({
        where: { id },
        data,
      })
    }),
})
