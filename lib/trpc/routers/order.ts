import { z } from 'zod'
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../trpc'
import { OrderStatus, PaymentStatus, FulfillmentStatus } from '@prisma/client'
import { emailService } from '@/lib/email/service'

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
        discountCodeId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { items, discountCodeId, ...orderData } = input

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

      // Calculate discount if applicable
      let discountAmount = 0
      if (discountCodeId) {
        const discountCode = await ctx.prisma.discountCode.findUnique({
          where: { id: discountCodeId },
        })

        if (discountCode && discountCode.isActive) {
          if (discountCode.type === 'PERCENTAGE') {
            discountAmount = (subtotal * discountCode.value) / 100
          } else {
            discountAmount = discountCode.value
          }
        }
      }

      // Calculate shipping dynamically based on shipping address country
      let shippingCost = 0
      try {
        const shippingZone = await ctx.prisma.shippingZone.findFirst({
          where: {
            storeId: orderData.storeId,
            countries: {
              has: orderData.shippingAddress?.country || 'France',
            },
            isActive: true,
          },
          include: {
            rates: true,
          },
        })

        if (shippingZone && shippingZone.rates.length > 0) {
          // Find applicable rate based on order amount
          const applicableRate = shippingZone.rates.find((rate) => {
            if (rate.minOrderAmount) {
              return subtotal >= rate.minOrderAmount
            }
            return true
          })

          shippingCost = applicableRate?.price || shippingZone.rates[0].price
        } else {
          // Fallback to default shipping cost if no zone found
          shippingCost = subtotal > 50 ? 0 : 5.99
        }
      } catch (err) {
        // Fallback to default shipping cost on error
        shippingCost = subtotal > 50 ? 0 : 5.99
      }

      const total = Math.max(0, subtotal + shippingCost - discountAmount)

      // Create order with items
      const order = await ctx.prisma.order.create({
        data: {
          ...orderData,
          orderNumber,
          subtotal,
          total,
          shipping: shippingCost,
          discount: discountAmount,
          tax: 0, // TODO: Calculate tax based on shipping address
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      })

      // Send order confirmation email (async, don't block response)
      emailService.sendOrderConfirmation(order.id, order.storeId).catch((err) => {
        console.error('Failed to send order confirmation email:', err)
      })

      return order
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

      const order = await ctx.prisma.order.update({
        where: { id },
        data,
      })

      // Send status update email if order status changed (async, don't block response)
      if (input.status) {
        emailService.sendOrderStatusUpdate(order.id, order.storeId).catch((err) => {
          console.error('Failed to send order status update email:', err)
        })
      }

      return order
    }),
})
