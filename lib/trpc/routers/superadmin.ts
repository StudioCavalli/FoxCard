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
        status: z.enum(['ACTIVE', 'SUSPENDED', 'PENDING', 'CLOSED', 'all']).default('all'),
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

      // Filter by store status
      if (input.status !== 'all') {
        where.status = input.status
      }

      const [stores, total, statusCounts] = await Promise.all([
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
        // Get counts per status
        Promise.all([
          ctx.prisma.store.count({ where: { status: 'ACTIVE' } }),
          ctx.prisma.store.count({ where: { status: 'SUSPENDED' } }),
          ctx.prisma.store.count({ where: { status: 'PENDING' } }),
          ctx.prisma.store.count({ where: { status: 'CLOSED' } }),
        ]),
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
        statusCounts: {
          active: statusCounts[0],
          suspended: statusCounts[1],
          pending: statusCounts[2],
          closed: statusCounts[3],
        },
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

  // Update store status (activate/suspend/close)
  updateStoreStatus: superAdminProcedure
    .input(
      z.object({
        storeId: z.string(),
        status: z.enum(['ACTIVE', 'SUSPENDED', 'PENDING', 'CLOSED']),
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

      // Update store status
      const updatedStore = await ctx.prisma.store.update({
        where: { id: input.storeId },
        data: {
          status: input.status,
          suspendedAt: input.status === 'SUSPENDED' ? new Date() : null,
          suspendedReason: input.status === 'SUSPENDED' ? input.reason : null,
        },
      })

      // Log the action in audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          storeId: input.storeId,
          action: `STORE_STATUS_${input.status}`,
          entity: 'Store',
          entityId: input.storeId,
          metadata: {
            previousStatus: store.status,
            newStatus: input.status,
            reason: input.reason,
            storeName: store.name,
            performedBy: ctx.session.user.email,
          },
        },
      })

      return {
        success: true,
        store: updatedStore,
        message: `Boutique ${input.status === 'ACTIVE' ? 'activée' : input.status === 'SUSPENDED' ? 'suspendue' : input.status === 'CLOSED' ? 'fermée' : 'mise en attente'}`,
      }
    }),

  // Create a new store (by superadmin)
  createStore: superAdminProcedure
    .input(
      z.object({
        name: z.string().min(2),
        slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
        description: z.string().optional(),
        ownerEmail: z.string().email(),
        status: z.enum(['ACTIVE', 'PENDING']).default('ACTIVE'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if slug already exists
      const existingStore = await ctx.prisma.store.findUnique({
        where: { slug: input.slug },
      })

      if (existingStore) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Ce slug est déjà utilisé',
        })
      }

      // Find or create owner
      let owner = await ctx.prisma.user.findUnique({
        where: { email: input.ownerEmail },
      })

      if (!owner) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Utilisateur non trouvé. Créez d\'abord un compte utilisateur.',
        })
      }

      // Create the store
      const store = await ctx.prisma.store.create({
        data: {
          name: input.name,
          slug: input.slug,
          description: input.description,
          ownerId: owner.id,
          status: input.status,
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      // Log the action
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          storeId: store.id,
          action: 'STORE_CREATE',
          entity: 'Store',
          entityId: store.id,
          metadata: {
            storeName: store.name,
            storeSlug: store.slug,
            ownerEmail: owner.email,
            performedBy: ctx.session.user.email,
          },
        },
      })

      return store
    }),

  // Update store details
  updateStore: superAdminProcedure
    .input(
      z.object({
        storeId: z.string(),
        name: z.string().min(2).optional(),
        slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
        description: z.string().optional(),
        domain: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { storeId, ...data } = input

      const store = await ctx.prisma.store.findUnique({
        where: { id: storeId },
      })

      if (!store) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' })
      }

      // Check slug uniqueness if changing
      if (data.slug && data.slug !== store.slug) {
        const existing = await ctx.prisma.store.findUnique({
          where: { slug: data.slug },
        })
        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Ce slug est déjà utilisé',
          })
        }
      }

      const updatedStore = await ctx.prisma.store.update({
        where: { id: storeId },
        data,
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      // Log the action
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          storeId: storeId,
          action: 'STORE_UPDATE',
          entity: 'Store',
          entityId: storeId,
          metadata: {
            changes: data,
            performedBy: ctx.session.user.email,
          },
        },
      })

      return updatedStore
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
        status: z.enum(['ACTIVE', 'SUSPENDED', 'BANNED', 'all']).default('all'),
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

      if (input.status !== 'all') {
        where.status = input.status
      }

      const [users, total, statusCounts] = await Promise.all([
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
        // Get counts by status
        Promise.all([
          ctx.prisma.user.count({ where: { status: 'ACTIVE' } }),
          ctx.prisma.user.count({ where: { status: 'SUSPENDED' } }),
          ctx.prisma.user.count({ where: { status: 'BANNED' } }),
        ]),
      ])

      return {
        users,
        total,
        hasMore: input.offset + input.limit < total,
        statusCounts: {
          active: statusCounts[0],
          suspended: statusCounts[1],
          banned: statusCounts[2],
        },
      }
    }),

  // Create a new user
  createUser: superAdminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).default('USER'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if email already exists
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      })

      if (existingUser) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Un utilisateur avec cet email existe deja',
        })
      }

      // Hash password
      const bcrypt = await import('bcryptjs')
      const hashedPassword = await bcrypt.hash(input.password, 12)

      const user = await ctx.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: input.role,
          status: 'ACTIVE',
        },
      })

      // Audit log
      const firstStore = await ctx.prisma.store.findFirst()
      if (firstStore) {
        await ctx.prisma.auditLog.create({
          data: {
            userId: ctx.session.user.id,
            storeId: firstStore.id,
            action: 'USER_CREATED',
            entity: 'User',
            entityId: user.id,
            metadata: {
              newUserEmail: user.email,
              newUserRole: user.role,
              performedBy: ctx.session.user.email,
            },
          },
        })
      }

      return {
        success: true,
        message: 'Utilisateur cree avec succes',
        user,
      }
    }),

  // Update user status (suspend/ban/activate)
  updateUserStatus: superAdminProcedure
    .input(
      z.object({
        userId: z.string(),
        status: z.enum(['ACTIVE', 'SUSPENDED', 'BANNED']),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
      })

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Utilisateur non trouve' })
      }

      // Cannot suspend/ban a SUPER_ADMIN
      if (user.role === 'SUPER_ADMIN' && input.status !== 'ACTIVE') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Impossible de suspendre un Super Admin',
        })
      }

      // Cannot modify your own status
      if (user.id === ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Vous ne pouvez pas modifier votre propre statut',
        })
      }

      const updatedUser = await ctx.prisma.user.update({
        where: { id: input.userId },
        data: {
          status: input.status,
          suspendedAt: input.status !== 'ACTIVE' ? new Date() : null,
          suspendedReason: input.status !== 'ACTIVE' ? input.reason : null,
        },
      })

      // If suspended or banned, invalidate all sessions
      if (input.status !== 'ACTIVE') {
        await ctx.prisma.session.deleteMany({
          where: { userId: input.userId },
        })
      }

      // Audit log
      const firstStore = await ctx.prisma.store.findFirst()
      if (firstStore) {
        await ctx.prisma.auditLog.create({
          data: {
            userId: ctx.session.user.id,
            storeId: firstStore.id,
            action: 'USER_STATUS_UPDATED',
            entity: 'User',
            entityId: user.id,
            metadata: {
              oldStatus: user.status,
              newStatus: input.status,
              reason: input.reason,
              targetUser: user.email,
              performedBy: ctx.session.user.email,
            },
          },
        })
      }

      return {
        success: true,
        message:
          input.status === 'ACTIVE'
            ? 'Utilisateur reactive'
            : input.status === 'SUSPENDED'
            ? 'Utilisateur suspendu'
            : 'Utilisateur banni',
        user: updatedUser,
      }
    }),

  // Delete a user
  deleteUser: superAdminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        include: {
          stores: true,
        },
      })

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Utilisateur non trouve' })
      }

      // Cannot delete a SUPER_ADMIN
      if (user.role === 'SUPER_ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Impossible de supprimer un Super Admin',
        })
      }

      // Cannot delete yourself
      if (user.id === ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Vous ne pouvez pas vous supprimer vous-meme',
        })
      }

      // Warning if user owns stores
      if (user.stores.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cet utilisateur possede ${user.stores.length} boutique(s). Transférez ou supprimez les boutiques d'abord.`,
        })
      }

      // Delete user (cascades to sessions, accounts, storeUsers)
      await ctx.prisma.user.delete({
        where: { id: input.userId },
      })

      // Audit log
      const firstStore = await ctx.prisma.store.findFirst()
      if (firstStore) {
        await ctx.prisma.auditLog.create({
          data: {
            userId: ctx.session.user.id,
            storeId: firstStore.id,
            action: 'USER_DELETED',
            entity: 'User',
            entityId: input.userId,
            metadata: {
              deletedUserEmail: user.email,
              deletedUserRole: user.role,
              performedBy: ctx.session.user.email,
            },
          },
        })
      }

      return {
        success: true,
        message: 'Utilisateur supprime avec succes',
      }
    }),

  // Get all orders platform-wide
  getAllOrders: superAdminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {}

      if (input.status) {
        where.status = input.status
      }

      if (input.search) {
        where.OR = [
          { orderNumber: { contains: input.search, mode: 'insensitive' } },
          { customerEmail: { contains: input.search, mode: 'insensitive' } },
          { customerName: { contains: input.search, mode: 'insensitive' } },
        ]
      }

      const [orders, total, stats] = await Promise.all([
        ctx.prisma.order.findMany({
          where,
          include: {
            store: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            items: {
              select: {
                id: true,
                quantity: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.order.count({ where }),
        // Get stats by status
        Promise.all([
          ctx.prisma.order.count({ where: { status: 'PENDING' } }),
          ctx.prisma.order.count({ where: { status: 'PROCESSING' } }),
          ctx.prisma.order.count({ where: { status: 'COMPLETED' } }),
          ctx.prisma.order.count({ where: { status: 'CANCELLED' } }),
        ]),
      ])

      return {
        orders,
        total,
        hasMore: input.offset + input.limit < total,
        stats: {
          pending: stats[0],
          processing: stats[1],
          completed: stats[2],
          cancelled: stats[3],
        },
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

  // ============================================
  // SUSPENSION APPEALS MANAGEMENT
  // ============================================

  // Get all suspension appeals
  getAllAppeals: superAdminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(['PENDING', 'REVIEWING', 'APPROVED', 'REJECTED', 'all']).default('all'),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {}

      if (input.status !== 'all') {
        where.status = input.status
      }

      const [appeals, total, statusCounts] = await Promise.all([
        ctx.prisma.suspensionAppeal.findMany({
          where,
          include: {
            store: {
              select: {
                id: true,
                name: true,
                slug: true,
                suspendedAt: true,
                suspendedReason: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.suspensionAppeal.count({ where }),
        // Get counts by status
        Promise.all([
          ctx.prisma.suspensionAppeal.count({ where: { status: 'PENDING' } }),
          ctx.prisma.suspensionAppeal.count({ where: { status: 'REVIEWING' } }),
          ctx.prisma.suspensionAppeal.count({ where: { status: 'APPROVED' } }),
          ctx.prisma.suspensionAppeal.count({ where: { status: 'REJECTED' } }),
        ]),
      ])

      return {
        appeals,
        total,
        statusCounts: {
          pending: statusCounts[0],
          reviewing: statusCounts[1],
          approved: statusCounts[2],
          rejected: statusCounts[3],
        },
      }
    }),

  // Update appeal status (review, approve, reject)
  updateAppealStatus: superAdminProcedure
    .input(
      z.object({
        appealId: z.string(),
        status: z.enum(['REVIEWING', 'APPROVED', 'REJECTED']),
        adminResponse: z.string().optional(),
        reactivateStore: z.boolean().default(false), // Only for APPROVED
      })
    )
    .mutation(async ({ ctx, input }) => {
      const appeal = await ctx.prisma.suspensionAppeal.findUnique({
        where: { id: input.appealId },
        include: { store: true },
      })

      if (!appeal) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Appeal not found' })
      }

      // Update the appeal
      const updatedAppeal = await ctx.prisma.suspensionAppeal.update({
        where: { id: input.appealId },
        data: {
          status: input.status,
          adminResponse: input.adminResponse,
          reviewedBy: ctx.session.user.id,
          reviewedAt: new Date(),
        },
      })

      // If approved and reactivateStore is true, reactivate the store
      if (input.status === 'APPROVED' && input.reactivateStore) {
        await ctx.prisma.store.update({
          where: { id: appeal.storeId },
          data: {
            status: 'ACTIVE',
            suspendedAt: null,
            suspendedReason: null,
          },
        })

        // Log the reactivation
        await ctx.prisma.auditLog.create({
          data: {
            userId: ctx.session.user.id,
            storeId: appeal.storeId,
            action: 'STORE_REACTIVATED',
            entity: 'Store',
            entityId: appeal.storeId,
            metadata: {
              appealId: appeal.id,
              previousStatus: 'SUSPENDED',
              newStatus: 'ACTIVE',
              reason: 'Appeal approved',
              performedBy: ctx.session.user.email,
            },
          },
        })
      }

      // Log the appeal review
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          storeId: appeal.storeId,
          action: 'APPEAL_REVIEWED',
          entity: 'SuspensionAppeal',
          entityId: appeal.id,
          metadata: {
            newStatus: input.status,
            adminResponse: input.adminResponse,
            reactivated: input.status === 'APPROVED' && input.reactivateStore,
            performedBy: ctx.session.user.email,
          },
        },
      })

      return {
        success: true,
        message:
          input.status === 'APPROVED'
            ? input.reactivateStore
              ? 'Appel approuvé et boutique réactivée'
              : 'Appel approuvé'
            : input.status === 'REJECTED'
            ? 'Appel rejeté'
            : 'Appel en cours d\'examen',
        appeal: updatedAppeal,
      }
    }),
})
