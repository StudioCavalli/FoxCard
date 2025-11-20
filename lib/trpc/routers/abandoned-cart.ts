import { z } from 'zod'
import { router, publicProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const abandonedCartRouter = router({
  // Track abandoned cart (called from client)
  track: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
        email: z.string().email(),
        customerName: z.string().optional(),
        phone: z.string().optional(),
        cartData: z.any(), // Full cart state
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if cart already exists for this email
      const existing = await ctx.prisma.abandonedCart.findFirst({
        where: {
          storeId: input.storeId,
          email: input.email,
          status: {
            in: ['PENDING', 'FIRST_EMAIL_SENT', 'SECOND_EMAIL_SENT'],
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      if (existing) {
        // Update existing cart
        return ctx.prisma.abandonedCart.update({
          where: { id: existing.id },
          data: {
            cartData: input.cartData,
            customerName: input.customerName,
            phone: input.phone,
            abandonedAt: new Date(),
          },
        })
      }

      // Create new abandoned cart
      return ctx.prisma.abandonedCart.create({
        data: {
          storeId: input.storeId,
          email: input.email,
          customerName: input.customerName,
          phone: input.phone,
          cartData: input.cartData,
        },
      })
    }),

  // Mark cart as recovered when order is placed
  markRecovered: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        orderId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cart = await ctx.prisma.abandonedCart.findFirst({
        where: {
          email: input.email,
          wasRecovered: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      if (cart) {
        return ctx.prisma.abandonedCart.update({
          where: { id: cart.id },
          data: {
            status: 'RECOVERED',
            wasRecovered: true,
            recoveryOrderId: input.orderId,
            recoveredAt: new Date(),
          },
        })
      }

      return null
    }),

  // Admin: Get all abandoned carts
  getAll: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        status: z.enum(['PENDING', 'FIRST_EMAIL_SENT', 'SECOND_EMAIL_SENT', 'RECOVERED', 'EXPIRED']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.abandonedCart.findMany({
        where: {
          storeId: input.storeId,
          ...(input.status && { status: input.status }),
        },
        orderBy: {
          abandonedAt: 'desc',
        },
        take: 100,
      })
    }),

  // Admin: Get analytics
  getAnalytics: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { storeId, startDate, endDate } = input

      const where: any = {
        storeId,
      }

      if (startDate || endDate) {
        where.abandonedAt = {}
        if (startDate) where.abandonedAt.gte = startDate
        if (endDate) where.abandonedAt.lte = endDate
      }

      const [
        totalAbandoned,
        recovered,
        firstEmailSent,
        secondEmailSent,
        carts,
      ] = await Promise.all([
        ctx.prisma.abandonedCart.count({ where }),
        ctx.prisma.abandonedCart.count({ where: { ...where, wasRecovered: true } }),
        ctx.prisma.abandonedCart.count({ where: { ...where, status: 'FIRST_EMAIL_SENT' } }),
        ctx.prisma.abandonedCart.count({ where: { ...where, status: 'SECOND_EMAIL_SENT' } }),
        ctx.prisma.abandonedCart.findMany({
          where,
          select: {
            cartData: true,
            wasRecovered: true,
            recoveredAt: true,
            firstEmailSentAt: true,
            secondEmailSentAt: true,
          },
        }),
      ])

      // Calculate total cart value
      const totalCartValue = carts.reduce((sum, cart: any) => {
        const items = cart.cartData?.items || []
        const cartTotal = items.reduce((total: number, item: any) => {
          return total + (item.price || 0) * (item.quantity || 0)
        }, 0)
        return sum + cartTotal
      }, 0)

      // Calculate recovered value
      const recoveredValue = carts
        .filter((cart) => cart.wasRecovered)
        .reduce((sum, cart: any) => {
          const items = cart.cartData?.items || []
          const cartTotal = items.reduce((total: number, item: any) => {
            return total + (item.price || 0) * (item.quantity || 0)
          }, 0)
          return sum + cartTotal
        }, 0)

      const recoveryRate = totalAbandoned > 0 ? (recovered / totalAbandoned) * 100 : 0

      return {
        totalAbandoned,
        recovered,
        recoveryRate: Math.round(recoveryRate * 100) / 100,
        firstEmailSent,
        secondEmailSent,
        totalCartValue,
        recoveredValue,
        averageCartValue: totalAbandoned > 0 ? totalCartValue / totalAbandoned : 0,
      }
    }),

  // Admin: Send recovery email manually
  sendRecoveryEmail: adminProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.enum(['first', 'second']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cart = await ctx.prisma.abandonedCart.findUnique({
        where: { id: input.id },
      })

      if (!cart) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Abandoned cart not found',
        })
      }

      // Send email would go here (integrate with email service)
      // For now, just update the status

      const updateData: any = {}

      if (input.type === 'first') {
        updateData.firstEmailSentAt = new Date()
        updateData.status = 'FIRST_EMAIL_SENT'
      } else {
        updateData.secondEmailSentAt = new Date()
        updateData.status = 'SECOND_EMAIL_SENT'
      }

      return ctx.prisma.abandonedCart.update({
        where: { id: input.id },
        data: updateData,
      })
    }),
})
