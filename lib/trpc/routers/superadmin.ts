import { z } from 'zod'
import { router, superAdminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const superadminRouter = router({
  // Get all stores with pagination
  getAllStores: superAdminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        status: z.enum(['active', 'suspended', 'all']).default('all'),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {}

      // Search by name, slug, or owner email
      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { slug: { contains: input.search, mode: 'insensitive' } },
          { owner: { email: { contains: input.search, mode: 'insensitive' } } },
        ]
      }

      // Filter by status (for future use if we add status field)
      // Currently all stores are considered 'active' unless we add a status field

      const [stores, total] = await Promise.all([
        ctx.prisma.store.findMany({
          where,
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
            _count: {
              select: {
                products: true,
                orders: true,
                customers: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.store.count({ where }),
      ])

      // Calculate revenue per store
      const storesWithRevenue = await Promise.all(
        stores.map(async (store) => {
          const orders = await ctx.prisma.order.findMany({
            where: {
              storeId: store.id,
              status: { in: ['COMPLETED', 'PROCESSING'] },
            },
            select: { total: true },
          })

          const revenue = orders.reduce((sum, order) => sum + order.total, 0)

          return {
            ...store,
            revenue,
          }
        })
      )

      return {
        stores: storesWithRevenue,
        total,
        hasMore: input.offset + input.limit < total,
      }
    }),

  // Get detailed store information
  getStoreDetails: superAdminProcedure
    .input(z.object({ storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      const store = await ctx.prisma.store.findUnique({
        where: { id: input.storeId },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
            },
          },
          storeUsers: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
              role: true,
            },
          },
          _count: {
            select: {
              products: true,
              orders: true,
              customers: true,
              categories: true,
              discountCodes: true,
              shippingZones: true,
            },
          },
        },
      })

      if (!store) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' })
      }

      // Get revenue statistics
      const orders = await ctx.prisma.order.findMany({
        where: { storeId: input.storeId },
        select: { total: true, status: true, createdAt: true },
      })

      const totalRevenue = orders
        .filter((o) => o.status === 'COMPLETED' || o.status === 'PROCESSING')
        .reduce((sum, order) => sum + order.total, 0)

      const pendingRevenue = orders
        .filter((o) => o.status === 'PENDING')
        .reduce((sum, order) => sum + order.total, 0)

      // Monthly revenue for last 6 months
      const now = new Date()
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)

      const monthlyRevenue = orders
        .filter((o) => o.createdAt >= sixMonthsAgo && (o.status === 'COMPLETED' || o.status === 'PROCESSING'))
        .reduce((acc, order) => {
          const month = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`
          acc[month] = (acc[month] || 0) + order.total
          return acc
        }, {} as Record<string, number>)

      return {
        ...store,
        stats: {
          totalRevenue,
          pendingRevenue,
          monthlyRevenue,
        },
      }
    }),

  // Get platform-wide statistics
  getPlatformStats: superAdminProcedure.query(async ({ ctx }) => {
    const [
      totalStores,
      totalUsers,
      totalProducts,
      totalOrders,
      orders,
    ] = await Promise.all([
      ctx.prisma.store.count(),
      ctx.prisma.user.count(),
      ctx.prisma.product.count(),
      ctx.prisma.order.count(),
      ctx.prisma.order.findMany({
        where: {
          status: { in: ['COMPLETED', 'PROCESSING'] },
        },
        select: { total: true, createdAt: true },
      }),
    ])

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)

    // Monthly stats for last 12 months
    const now = new Date()
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, 1)

    const monthlyStats = orders
      .filter((o) => o.createdAt >= twelveMonthsAgo)
      .reduce((acc, order) => {
        const month = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`
        if (!acc[month]) {
          acc[month] = { revenue: 0, orders: 0 }
        }
        acc[month].revenue += order.total
        acc[month].orders += 1
        return acc
      }, {} as Record<string, { revenue: number; orders: number }>)

    // Growth metrics
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const [thisMonthRevenue, lastMonthRevenue] = await Promise.all([
      ctx.prisma.order.findMany({
        where: {
          createdAt: { gte: thisMonth },
          status: { in: ['COMPLETED', 'PROCESSING'] },
        },
        select: { total: true },
      }),
      ctx.prisma.order.findMany({
        where: {
          createdAt: { gte: lastMonth, lt: thisMonth },
          status: { in: ['COMPLETED', 'PROCESSING'] },
        },
        select: { total: true },
      }),
    ])

    const thisMonthTotal = thisMonthRevenue.reduce((sum, o) => sum + o.total, 0)
    const lastMonthTotal = lastMonthRevenue.reduce((sum, o) => sum + o.total, 0)
    const revenueGrowth = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0

    return {
      totalStores,
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      monthlyStats,
      revenueGrowth,
    }
  }),

  // Get revenue breakdown by store
  getRevenueByStore: superAdminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        period: z.enum(['week', 'month', 'year', 'all']).default('month'),
      })
    )
    .query(async ({ ctx, input }) => {
      // Calculate date range
      const now = new Date()
      let startDate: Date | undefined

      switch (input.period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1)
          break
        case 'all':
          startDate = undefined
          break
      }

      const stores = await ctx.prisma.store.findMany({
        include: {
          owner: {
            select: { name: true, email: true },
          },
          orders: {
            where: {
              ...(startDate && { createdAt: { gte: startDate } }),
              status: { in: ['COMPLETED', 'PROCESSING'] },
            },
            select: { total: true },
          },
        },
      })

      const storesWithRevenue = stores
        .map((store) => ({
          storeId: store.id,
          storeName: store.name,
          storeSlug: store.slug,
          ownerName: store.owner.name,
          ownerEmail: store.owner.email,
          revenue: store.orders.reduce((sum, order) => sum + order.total, 0),
          ordersCount: store.orders.length,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, input.limit)

      return storesWithRevenue
    }),

  // Update store status (activate/suspend)
  updateStoreStatus: superAdminProcedure
    .input(
      z.object({
        storeId: z.string(),
        action: z.enum(['activate', 'suspend']),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const store = await ctx.prisma.store.findUnique({
        where: { id: input.storeId },
      })

      if (!store) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' })
      }

      // Log the action in audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          storeId: input.storeId,
          action: `STORE_${input.action.toUpperCase()}`,
          entity: 'Store',
          entityId: input.storeId,
          metadata: {
            action: input.action,
            reason: input.reason,
            storeName: store.name,
            performedBy: ctx.session.user.email,
          },
        },
      })

      // For now, we don't have a status field on Store
      // This would require a schema migration to add status: StoreStatus
      // TODO: Add status field to Store model

      return {
        success: true,
        message: `Store ${input.action}d successfully`,
      }
    }),

  // Delete store (with confirmation)
  deleteStore: superAdminProcedure
    .input(
      z.object({
        storeId: z.string(),
        confirm: z.literal(true),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const store = await ctx.prisma.store.findUnique({
        where: { id: input.storeId },
        include: {
          _count: {
            select: {
              products: true,
              orders: true,
              customers: true,
            },
          },
        },
      })

      if (!store) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' })
      }

      // Log the action before deletion
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          storeId: input.storeId,
          action: 'STORE_DELETE',
          entity: 'Store',
          entityId: input.storeId,
          metadata: {
            reason: input.reason,
            storeName: store.name,
            productsCount: store._count.products,
            ordersCount: store._count.orders,
            customersCount: store._count.customers,
            performedBy: ctx.session.user.email,
          },
        },
      })

      // Delete the store (cascade will handle related records)
      await ctx.prisma.store.delete({
        where: { id: input.storeId },
      })

      return {
        success: true,
        message: 'Store deleted successfully',
      }
    }),

  // Get all users with pagination
  getAllUsers: superAdminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN', 'all']).default('all'),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {}

      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { email: { contains: input.search, mode: 'insensitive' } },
        ]
      }

      if (input.role !== 'all') {
        where.role = input.role
      }

      const [users, total] = await Promise.all([
        ctx.prisma.user.findMany({
          where,
          include: {
            stores: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            storeUsers: {
              include: {
                store: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.user.count({ where }),
      ])

      return {
        users,
        total,
        hasMore: input.offset + input.limit < total,
      }
    }),

  // Update user role
  updateUserRole: superAdminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
      })

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
      }

      // Prevent removing the last super admin
      if (user.role === 'SUPER_ADMIN' && input.role !== 'SUPER_ADMIN') {
        const superAdminCount = await ctx.prisma.user.count({
          where: { role: 'SUPER_ADMIN' },
        })

        if (superAdminCount <= 1) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot remove the last super admin',
          })
        }
      }

      // Update user role
      await ctx.prisma.user.update({
        where: { id: input.userId },
        data: { role: input.role },
      })

      // Log the action
      // Note: We can't log to a specific store since this is a platform-wide action
      // We'd need to modify AuditLog to make storeId optional
      // For now, we'll skip the audit log or log to the first store if the user has one
      const firstStore = await ctx.prisma.store.findFirst({
        where: { ownerId: input.userId },
        select: { id: true },
      })

      if (firstStore) {
        await ctx.prisma.auditLog.create({
          data: {
            userId: ctx.session.user.id,
            storeId: firstStore.id,
            action: 'USER_ROLE_UPDATE',
            entity: 'User',
            entityId: input.userId,
            metadata: {
              oldRole: user.role,
              newRole: input.role,
              reason: input.reason,
              targetUser: user.email,
              performedBy: ctx.session.user.email,
            },
          },
        })
      }

      return {
        success: true,
        message: `User role updated to ${input.role}`,
      }
    }),
})
