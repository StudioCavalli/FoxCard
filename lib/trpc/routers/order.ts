import { z } from 'zod'
import { randomBytes } from 'crypto'
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../trpc'
import { OrderStatus, PaymentStatus, FulfillmentStatus } from '@prisma/client'
import { emailService } from '@/lib/email/service'
import { pdfService } from '@/lib/pdf/service'
import { createHookExecutor } from '@/lib/plugins/hook-executor'

const addressSchema = z.object({
  firstName: z.string().max(100),
  lastName: z.string().max(100),
  address: z.string().max(200),
  address2: z.string().max(200).optional(),
  city: z.string().max(100),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20),
  country: z.string().max(100),
  phone: z.string().max(30).optional(),
}).optional()

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
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
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

  getById: adminProcedure
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
    .input(z.object({ orderNumber: z.string(), customerEmail: z.string().email() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.order.findUnique({
        where: { orderNumber: input.orderNumber, customerEmail: input.customerEmail },
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

  /**
   * Create multiple orders from cart (multi-store support)
   * Groups cart items by store and creates separate orders
   */
  createFromCart: publicProcedure
    .input(
      z.object({
        customerEmail: z.string().email(),
        customerName: z.string().optional(),
        items: z.array(
          z.object({
            productId: z.string(),
            storeId: z.string(), // Multi-store: each item has its storeId
            quantity: z.number().min(1),
            variantId: z.string().optional(),
            variantName: z.string().optional(),
            // Restaurant modifiers
            modifiers: z.array(z.object({
              groupId: z.string(),
              groupName: z.string(),
              modifierId: z.string(),
              modifierName: z.string(),
              price: z.number(),
              quantity: z.number().optional(),
            })).optional(),
            specialInstructions: z.string().optional(),
          })
        ),
        shippingAddress: addressSchema, // Optional for digital/booking only orders
        billingAddress: addressSchema,
        notes: z.string().optional(),
        // Booking data for reservation-type orders
        bookingData: z.object({
          commerceType: z.string(),
          checkInDate: z.string().optional(),
          checkOutDate: z.string().optional(),
          selectedDate: z.string().optional(),
          selectedTime: z.string().optional(),
          adults: z.number().optional(),
          children: z.number().optional(),
          roomType: z.string().optional(),
          specialRequests: z.string().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { items, ...customerData } = input

      // Group items by storeId
      const itemsByStore = items.reduce((acc, item) => {
        if (!acc[item.storeId]) {
          acc[item.storeId] = []
        }
        acc[item.storeId].push(item)
        return acc
      }, {} as Record<string, typeof items>)

      // Create one order per store
      const orders = await Promise.all(
        Object.entries(itemsByStore).map(async ([storeId, storeItems]) => {
          // Generate order number
          const orderNumber = 'ORD-' + randomBytes(8).toString('hex').toUpperCase()

          // Calculate totals for this store
          const productsData = await ctx.prisma.product.findMany({
            where: {
              id: { in: storeItems.map((item) => item.productId) },
            },
          })

          const orderItems = storeItems.map((item) => {
            const product = productsData.find((p) => p.id === item.productId)
            if (!product) throw new Error(`Product ${item.productId} not found`)

            // Calculate modifier total
            const modifierTotal = item.modifiers?.reduce((sum, mod) => sum + (mod.price * (mod.quantity || 1)), 0) || 0
            const itemTotal = (product.price + modifierTotal) * item.quantity

            return {
              productId: item.productId,
              name: product.name,
              price: product.price,
              quantity: item.quantity,
              variantId: item.variantId,
              variantName: item.variantName,
              // Restaurant modifiers
              modifiers: item.modifiers || null,
              modifierTotal: modifierTotal || null,
              specialInstructions: item.specialInstructions || null,
              total: itemTotal,
            }
          })

          const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0)

          // Calculate shipping for this store
          let shippingCost = 0
          try {
            const shippingZone = await ctx.prisma.shippingZone.findFirst({
              where: {
                storeId,
                countries: {
                  has: customerData.shippingAddress?.country || 'France',
                },
                isActive: true,
              },
              include: {
                rates: true,
              },
            })

            if (shippingZone && shippingZone.rates.length > 0) {
              const applicableRate = shippingZone.rates.find((rate) => {
                if (rate.minOrderAmount) {
                  return subtotal >= rate.minOrderAmount
                }
                return true
              })
              shippingCost = applicableRate?.price || shippingZone.rates[0].price
            } else {
              shippingCost = subtotal > 50 ? 0 : 5.99
            }
          } catch (err) {
            shippingCost = subtotal > 50 ? 0 : 5.99
          }

          const total = Math.max(0, subtotal + shippingCost)

          // Create order for this store
          const order = await ctx.prisma.order.create({
            data: {
              storeId,
              ...customerData,
              orderNumber,
              subtotal,
              total,
              shipping: shippingCost,
              discount: 0,
              tax: 0,
              items: {
                create: orderItems,
              },
            },
            include: {
              items: true,
              store: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          })

          // Send order confirmation email (async, don't block response)
          emailService.sendOrderConfirmation(order.id, storeId).catch((err) => {
            console.error(`Failed to send order confirmation email for store ${storeId}:`, err)
          })

          // Execute plugin hooks (async, don't block response)
          const hookExecutor = createHookExecutor(ctx.prisma)
          hookExecutor.onOrderCreated(storeId, {
            orderId: order.id,
            orderNumber: order.orderNumber,
            total: order.total,
            customerEmail: order.customerEmail,
          }).catch((err) => {
            console.error(`Failed to execute order created hooks for store ${storeId}:`, err)
          })

          return order
        })
      )

      return {
        orders,
        totalOrders: orders.length,
        totalAmount: orders.reduce((sum, order) => sum + order.total, 0),
      }
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
        shippingAddress: addressSchema, // Optional for digital/booking only orders
        billingAddress: addressSchema,
        notes: z.string().optional(),
        discountCodeId: z.string().optional(),
        // Booking data for reservation-type orders
        bookingData: z.object({
          commerceType: z.string(),
          checkInDate: z.string().optional(),
          checkOutDate: z.string().optional(),
          selectedDate: z.string().optional(),
          selectedTime: z.string().optional(),
          adults: z.number().optional(),
          children: z.number().optional(),
          roomType: z.string().optional(),
          specialRequests: z.string().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { items, discountCodeId, ...orderData } = input

      // Generate order number
      const orderNumber = 'ORD-' + randomBytes(8).toString('hex').toUpperCase()

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

      // Execute plugin hooks (async, don't block response)
      const hookExecutor = createHookExecutor(ctx.prisma)
      hookExecutor.onOrderCreated(orderData.storeId, {
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        customerEmail: order.customerEmail,
      }).catch((err) => {
        console.error('Failed to execute order created hooks:', err)
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

      // Get current order for comparison
      const currentOrder = await ctx.prisma.order.findUnique({
        where: { id },
      })

      if (!currentOrder) {
        throw new Error('Order not found')
      }

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

      // Generate invoice if payment status changed to PAID (async, don't block response)
      if (input.paymentStatus === 'PAID') {
        pdfService.generateInvoice(order.id).catch((err) => {
          console.error('Failed to generate invoice:', err)
        })
      }

      // Execute plugin hooks (async, don't block response)
      const hookExecutor = createHookExecutor(ctx.prisma)

      // Status changed hook
      if (input.status && input.status !== currentOrder.status) {
        hookExecutor.onOrderStatusChanged(order.storeId, {
          orderId: order.id,
          orderNumber: order.orderNumber,
          oldStatus: currentOrder.status,
          newStatus: input.status,
        }).catch((err) => {
          console.error('Failed to execute order status changed hooks:', err)
        })
      }

      // Payment completed hook
      if (input.paymentStatus === 'PAID' && currentOrder.paymentStatus !== 'PAID') {
        hookExecutor.onOrderPaid(order.storeId, {
          orderId: order.id,
          orderNumber: order.orderNumber,
          total: order.total,
          paymentMethod: 'unknown', // TODO: Get from payment provider
        }).catch((err) => {
          console.error('Failed to execute order paid hooks:', err)
        })
      }

      return order
    }),
})
