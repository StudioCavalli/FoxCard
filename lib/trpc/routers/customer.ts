import { z } from 'zod'
import { router, publicProcedure, adminProcedure, requireStoreAccess } from '../trpc'

export const customerRouter = router({
  getAll: requireStoreAccess
    .input(
      z.object({
        storeId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { storeId, limit, cursor } = input

      const customers = await ctx.prisma.customer.findMany({
        where: {
          storeId,
        },
        take: limit + 1,
        ...(cursor && {
          skip: 1,
          cursor: {
            id: cursor,
          },
        }),
        include: {
          _count: {
            select: { orders: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (customers.length > limit) {
        const nextItem = customers.pop()
        nextCursor = nextItem!.id
      }

      // Calculate total spent for each customer
      const customersWithStats = await Promise.all(
        customers.map(async (customer) => {
          const orders = await ctx.prisma.order.findMany({
            where: {
              customerId: customer.id,
              status: { not: 'CANCELLED' },
            },
            select: {
              total: true,
            },
          })

          const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)

          return {
            ...customer,
            totalSpent,
          }
        })
      )

      return {
        customers: customersWithStats,
        nextCursor,
      }
    }),

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const customer = await ctx.prisma.customer.findUnique({
        where: { id: input.id },
        include: {
          orders: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 10,
          },
          _count: {
            select: { orders: true },
          },
        },
      })

      if (!customer) {
        return null
      }

      // Calculate total spent
      const orders = await ctx.prisma.order.findMany({
        where: {
          customerId: customer.id,
          status: { not: 'CANCELLED' },
        },
        select: {
          total: true,
        },
      })

      const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)

      return {
        ...customer,
        totalSpent,
      }
    }),

  delete: requireStoreAccess
    .input(z.object({ storeId: z.string(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.customer.delete({
        where: { id: input.id },
      })
    }),
})
