import { z } from 'zod'
import { router, superAdminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { invalidateSettingsCache } from '@/lib/platform/settings'
import { invalidateAllPlatformPermissionsCache } from '@/lib/platform/permissions'

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
          ipAddress: ctx.ipAddress,
          userAgent: ctx.userAgent,
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
        commerceType: z.enum([
          'GENERAL', 'FOOD', 'ALCOHOL', 'FASHION', 'ELECTRONICS', 'BEAUTY', 'HOME', 'SPORTS',
          'TOYS', 'AUTOMOTIVE', 'BOOKS', 'PETS', 'DIGITAL', 'SERVICES', 'SEASONAL',
          'RESTAURANT', 'HOTEL', 'TRAVEL', 'RECREATION'
        ]).default('GENERAL'),
        countries: z.array(z.string()).optional(),
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
          commerceType: input.commerceType,
          countries: input.countries || [],
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
          ipAddress: ctx.ipAddress,
          userAgent: ctx.userAgent,
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
        countries: z.array(z.string()).optional(),
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
          ipAddress: ctx.ipAddress,
          userAgent: ctx.userAgent,
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
          ipAddress: ctx.ipAddress,
          userAgent: ctx.userAgent,
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
            ipAddress: ctx.ipAddress,
            userAgent: ctx.userAgent,
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
            ipAddress: ctx.ipAddress,
            userAgent: ctx.userAgent,
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
            ipAddress: ctx.ipAddress,
            userAgent: ctx.userAgent,
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
            ipAddress: ctx.ipAddress,
            userAgent: ctx.userAgent,
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
                logo: true,
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
            ipAddress: ctx.ipAddress,
            userAgent: ctx.userAgent,
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
          ipAddress: ctx.ipAddress,
          userAgent: ctx.userAgent,
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

  // ============================================
  // ACTIVITY / AUDIT LOG MANAGEMENT
  // ============================================

  // Get all activity logs across platform
  getAllActivity: superAdminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        action: z.string().optional(), // Filter by action type
        entity: z.string().optional(), // Filter by entity type
        userId: z.string().optional(), // Filter by user
        storeId: z.string().optional(), // Filter by store
        startDate: z.string().optional(), // Filter by date range
        endDate: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {}
      const platformWhere: any = {}

      // Search in action, entity, or metadata
      if (input.search) {
        where.OR = [
          { action: { contains: input.search, mode: 'insensitive' } },
          { entity: { contains: input.search, mode: 'insensitive' } },
        ]
        platformWhere.OR = [
          { action: { contains: input.search, mode: 'insensitive' } },
          { entity: { contains: input.search, mode: 'insensitive' } },
        ]
      }

      // Filter by action type
      if (input.action) {
        where.action = { contains: input.action, mode: 'insensitive' }
        platformWhere.action = { contains: input.action, mode: 'insensitive' }
      }

      // Filter by entity type
      if (input.entity) {
        where.entity = input.entity
        platformWhere.entity = input.entity
      }

      // Filter by user
      if (input.userId) {
        where.userId = input.userId
        platformWhere.userId = input.userId
      }

      // Filter by store (only applies to store audit logs)
      if (input.storeId) {
        where.storeId = input.storeId
      }

      // Filter by date range
      if (input.startDate || input.endDate) {
        where.createdAt = {}
        platformWhere.createdAt = {}
        if (input.startDate) {
          where.createdAt.gte = new Date(input.startDate)
          platformWhere.createdAt.gte = new Date(input.startDate)
        }
        if (input.endDate) {
          where.createdAt.lte = new Date(input.endDate)
          platformWhere.createdAt.lte = new Date(input.endDate)
        }
      }

      // Skip platform logs when filtering by store
      const includePlatformLogs = !input.storeId

      const [activities, platformActivities, total, platformTotal, entityCounts, platformEntityCounts, recentActions, platformActions] = await Promise.all([
        ctx.prisma.auditLog.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
            store: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset,
        }),
        includePlatformLogs ? ctx.prisma.platformAuditLog.findMany({
          where: platformWhere,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset,
        }) : Promise.resolve([]),
        ctx.prisma.auditLog.count({ where }),
        includePlatformLogs ? ctx.prisma.platformAuditLog.count({ where: platformWhere }) : Promise.resolve(0),
        ctx.prisma.auditLog.groupBy({
          by: ['entity'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10,
        }),
        includePlatformLogs ? ctx.prisma.platformAuditLog.groupBy({
          by: ['entity'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10,
        }) : Promise.resolve([]),
        ctx.prisma.auditLog.groupBy({
          by: ['action'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 20,
        }),
        includePlatformLogs ? ctx.prisma.platformAuditLog.groupBy({
          by: ['action'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 20,
        }) : Promise.resolve([]),
      ])

      // Merge and sort activities by date
      const allActivities = [
        ...activities.map((a) => ({ ...a, source: 'store' as const })),
        ...platformActivities.map((a) => ({ ...a, store: null, source: 'platform' as const })),
      ]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, input.limit)

      const combinedTotal = total + platformTotal

      // Merge entity counts
      const entityMap = new Map<string, number>()
      for (const e of entityCounts) {
        entityMap.set(e.entity, (entityMap.get(e.entity) || 0) + e._count.id)
      }
      for (const e of platformEntityCounts) {
        entityMap.set(e.entity, (entityMap.get(e.entity) || 0) + e._count.id)
      }

      // Merge action counts
      const actionMap = new Map<string, number>()
      for (const a of recentActions) {
        actionMap.set(a.action, (actionMap.get(a.action) || 0) + a._count.id)
      }
      for (const a of platformActions) {
        actionMap.set(a.action, (actionMap.get(a.action) || 0) + a._count.id)
      }

      return {
        activities: allActivities,
        total: combinedTotal,
        hasMore: input.offset + input.limit < combinedTotal,
        entityCounts: Array.from(entityMap.entries())
          .map(([entity, count]) => ({ entity, count }))
          .sort((a, b) => b.count - a.count),
        actionCounts: Array.from(actionMap.entries())
          .map(([action, count]) => ({ action, count }))
          .sort((a, b) => b.count - a.count),
      }
    }),

  // Get activity stats
  getActivityStats: superAdminProcedure.query(async ({ ctx }) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [totalActivities, todayCount, weekCount, monthCount, pTotal, pToday, pWeek, pMonth] = await Promise.all([
      ctx.prisma.auditLog.count(),
      ctx.prisma.auditLog.count({ where: { createdAt: { gte: today } } }),
      ctx.prisma.auditLog.count({ where: { createdAt: { gte: thisWeek } } }),
      ctx.prisma.auditLog.count({ where: { createdAt: { gte: thisMonth } } }),
      ctx.prisma.platformAuditLog.count(),
      ctx.prisma.platformAuditLog.count({ where: { createdAt: { gte: today } } }),
      ctx.prisma.platformAuditLog.count({ where: { createdAt: { gte: thisWeek } } }),
      ctx.prisma.platformAuditLog.count({ where: { createdAt: { gte: thisMonth } } }),
    ])

    return {
      total: totalActivities + pTotal,
      today: todayCount + pToday,
      thisWeek: weekCount + pWeek,
      thisMonth: monthCount + pMonth,
    }
  }),

  // Export audit logs for download
  exportAuditLogs: superAdminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        action: z.string().optional(),
        entity: z.string().optional(),
        userId: z.string().optional(),
        storeId: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().min(1).max(10000).default(1000),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {}
      const platformWhere: any = {}

      if (input.search) {
        where.OR = [
          { action: { contains: input.search, mode: 'insensitive' } },
          { entity: { contains: input.search, mode: 'insensitive' } },
        ]
        platformWhere.OR = [
          { action: { contains: input.search, mode: 'insensitive' } },
          { entity: { contains: input.search, mode: 'insensitive' } },
        ]
      }
      if (input.action) {
        where.action = { contains: input.action, mode: 'insensitive' }
        platformWhere.action = { contains: input.action, mode: 'insensitive' }
      }
      if (input.entity) {
        where.entity = input.entity
        platformWhere.entity = input.entity
      }
      if (input.userId) {
        where.userId = input.userId
        platformWhere.userId = input.userId
      }
      if (input.storeId) {
        where.storeId = input.storeId
      }
      if (input.startDate || input.endDate) {
        where.createdAt = {}
        platformWhere.createdAt = {}
        if (input.startDate) {
          where.createdAt.gte = new Date(input.startDate)
          platformWhere.createdAt.gte = new Date(input.startDate)
        }
        if (input.endDate) {
          where.createdAt.lte = new Date(input.endDate)
          platformWhere.createdAt.lte = new Date(input.endDate)
        }
      }

      const includePlatformLogs = !input.storeId

      const [storeLogs, platformLogs] = await Promise.all([
        ctx.prisma.auditLog.findMany({
          where,
          include: {
            user: { select: { name: true, email: true } },
            store: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
        }),
        includePlatformLogs ? ctx.prisma.platformAuditLog.findMany({
          where: platformWhere,
          include: {
            user: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
        }) : Promise.resolve([]),
      ])

      // Normalize to a common format
      const allLogs = [
        ...storeLogs.map((log) => ({
          id: log.id,
          date: log.createdAt,
          action: log.action,
          entity: log.entity,
          entityId: log.entityId,
          user: log.user?.name || log.user?.email || '-',
          store: log.store?.name || '-',
          ipAddress: log.ipAddress || '-',
          userAgent: log.userAgent || '-',
          success: log.success,
          errorMessage: log.errorMessage || '',
          metadata: log.metadata ? JSON.stringify(log.metadata) : '',
        })),
        ...platformLogs.map((log) => ({
          id: log.id,
          date: log.createdAt,
          action: log.action,
          entity: log.entity,
          entityId: log.entityId,
          user: log.user?.name || log.user?.email || '-',
          store: 'Platform',
          ipAddress: log.ipAddress || '-',
          userAgent: log.userAgent || '-',
          success: log.success,
          errorMessage: log.errorMessage || '',
          metadata: log.metadata ? JSON.stringify(log.metadata) : '',
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, input.limit)

      return allLogs
    }),

  // ============================================
  // PLATFORM SETTINGS
  // ============================================

  // Get platform settings
  getSettings: superAdminProcedure.query(async ({ ctx }) => {
    let settings = await ctx.prisma.platformSettings.findFirst()

    // Create default settings if none exist
    if (!settings) {
      settings = await ctx.prisma.platformSettings.create({
        data: {},
      })
    }

    return settings
  }),

  // Update platform settings
  updateSettings: superAdminProcedure
    .input(
      z.object({
        platformName: z.string().optional(),
        platformUrl: z.string().optional(),
        supportEmail: z.string().email().optional(),
        maxStoresPerUser: z.number().min(1).optional(),
        maintenanceMode: z.boolean().optional(),
        maintenanceMessage: z.string().optional(),
        defaultCurrency: z.string().optional(),
        defaultLanguage: z.string().optional(),
        supportedCurrencies: z.array(z.string()).optional(),
        supportedLanguages: z.array(z.string()).optional(),
        allowRegistration: z.boolean().optional(),
        requireEmailVerification: z.boolean().optional(),
        sessionTimeout: z.number().min(5).optional(),
        stripeEnabled: z.boolean().optional(),
        paypalEnabled: z.boolean().optional(),
        bankTransferEnabled: z.boolean().optional(),
        smtpHost: z.string().optional(),
        smtpPort: z.number().optional(),
        smtpUser: z.string().optional(),
        smtpPassword: z.string().optional(),
        smtpFromEmail: z.string().optional(),
        smtpFromName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let settings = await ctx.prisma.platformSettings.findFirst()

      if (!settings) {
        settings = await ctx.prisma.platformSettings.create({
          data: {
            ...input,
            updatedBy: ctx.session.user.id,
          },
        })
      } else {
        settings = await ctx.prisma.platformSettings.update({
          where: { id: settings.id },
          data: {
            ...input,
            updatedBy: ctx.session.user.id,
          },
        })
      }

      // Invalidate settings cache so changes take effect immediately
      invalidateSettingsCache()

      return {
        success: true,
        message: 'Parametres mis a jour',
        settings,
      }
    }),

  // ============================================
  // PLATFORM ROLES
  // ============================================

  // Get all platform roles
  getPlatformRoles: superAdminProcedure.query(async ({ ctx }) => {
    const roles = await ctx.prisma.platformRole.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return roles.map((role) => ({
      ...role,
      usersCount: role._count.users,
    }))
  }),

  // Create platform role
  createPlatformRole: superAdminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        permissions: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if role name exists
      const existing = await ctx.prisma.platformRole.findUnique({
        where: { name: input.name },
      })

      if (existing) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Un role avec ce nom existe deja',
        })
      }

      const role = await ctx.prisma.platformRole.create({
        data: input,
      })

      return {
        success: true,
        message: 'Role cree avec succes',
        role,
      }
    }),

  // Update platform role
  updatePlatformRole: superAdminProcedure
    .input(
      z.object({
        roleId: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        permissions: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { roleId, ...data } = input

      const role = await ctx.prisma.platformRole.findUnique({
        where: { id: roleId },
      })

      if (!role) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Role non trouve' })
      }

      if (role.isSystem && data.name && data.name !== role.name) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Impossible de renommer un role systeme',
        })
      }

      // Check name uniqueness
      if (data.name && data.name !== role.name) {
        const existing = await ctx.prisma.platformRole.findUnique({
          where: { name: data.name },
        })
        if (existing) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Un role avec ce nom existe deja',
          })
        }
      }

      const updatedRole = await ctx.prisma.platformRole.update({
        where: { id: roleId },
        data,
      })

      // Invalidate permissions cache so changes take effect immediately
      invalidateAllPlatformPermissionsCache()

      return {
        success: true,
        message: 'Role mis a jour',
        role: updatedRole,
      }
    }),

  // Delete platform role
  deletePlatformRole: superAdminProcedure
    .input(z.object({ roleId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const role = await ctx.prisma.platformRole.findUnique({
        where: { id: input.roleId },
        include: { _count: { select: { users: true } } },
      })

      if (!role) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Role non trouve' })
      }

      if (role.isSystem) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Impossible de supprimer un role systeme',
        })
      }

      if (role._count.users > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Ce role est assigne a ${role._count.users} utilisateur(s). Retirez-les d'abord.`,
        })
      }

      await ctx.prisma.platformRole.delete({
        where: { id: input.roleId },
      })

      // Invalidate permissions cache so changes take effect immediately
      invalidateAllPlatformPermissionsCache()

      return {
        success: true,
        message: 'Role supprime',
      }
    }),

  // ============================================
  // SUPPORT TICKETS
  // ============================================

  // Get all support tickets
  getAllTickets: superAdminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED', 'all']).default('all'),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'all']).default('all'),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {}

      if (input.search) {
        where.OR = [
          { subject: { contains: input.search, mode: 'insensitive' } },
          { ticketNumber: { contains: input.search, mode: 'insensitive' } },
          { user: { email: { contains: input.search, mode: 'insensitive' } } },
        ]
      }

      if (input.status !== 'all') {
        where.status = input.status
      }

      if (input.priority !== 'all') {
        where.priority = input.priority
      }

      const [tickets, total, statusCounts] = await Promise.all([
        ctx.prisma.supportTicket.findMany({
          where,
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
            messages: {
              select: { id: true },
            },
          },
          orderBy: { updatedAt: 'desc' },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.supportTicket.count({ where }),
        Promise.all([
          ctx.prisma.supportTicket.count({ where: { status: 'OPEN' } }),
          ctx.prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
          ctx.prisma.supportTicket.count({ where: { status: 'WAITING_CUSTOMER' } }),
          ctx.prisma.supportTicket.count({ where: { status: 'RESOLVED' } }),
          ctx.prisma.supportTicket.count({ where: { status: 'CLOSED' } }),
        ]),
      ])

      return {
        tickets: tickets.map((t) => ({
          ...t,
          messagesCount: t.messages.length,
        })),
        total,
        statusCounts: {
          open: statusCounts[0],
          inProgress: statusCounts[1],
          waitingCustomer: statusCounts[2],
          resolved: statusCounts[3],
          closed: statusCounts[4],
        },
      }
    }),

  // Get single ticket with messages
  getTicket: superAdminProcedure
    .input(z.object({ ticketId: z.string() }))
    .query(async ({ ctx, input }) => {
      const ticket = await ctx.prisma.supportTicket.findUnique({
        where: { id: input.ticketId },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      })

      if (!ticket) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Ticket non trouve' })
      }

      // Get store info if storeId exists
      let store = null
      if (ticket.storeId) {
        store = await ctx.prisma.store.findUnique({
          where: { id: ticket.storeId },
          select: { id: true, name: true, slug: true },
        })
      }

      return { ...ticket, store }
    }),

  // Update ticket status
  updateTicketStatus: superAdminProcedure
    .input(
      z.object({
        ticketId: z.string(),
        status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const ticket = await ctx.prisma.supportTicket.findUnique({
        where: { id: input.ticketId },
      })

      if (!ticket) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Ticket non trouve' })
      }

      const data: any = { status: input.status }

      if (input.status === 'RESOLVED' && !ticket.resolvedAt) {
        data.resolvedAt = new Date()
      }
      if (input.status === 'CLOSED' && !ticket.closedAt) {
        data.closedAt = new Date()
      }

      const updatedTicket = await ctx.prisma.supportTicket.update({
        where: { id: input.ticketId },
        data,
      })

      return {
        success: true,
        message: 'Statut mis a jour',
        ticket: updatedTicket,
      }
    }),

  // Add message to ticket
  addTicketMessage: superAdminProcedure
    .input(
      z.object({
        ticketId: z.string(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const ticket = await ctx.prisma.supportTicket.findUnique({
        where: { id: input.ticketId },
      })

      if (!ticket) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Ticket non trouve' })
      }

      if (ticket.status === 'CLOSED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Impossible de repondre a un ticket ferme',
        })
      }

      const message = await ctx.prisma.ticketMessage.create({
        data: {
          ticketId: input.ticketId,
          authorId: ctx.session.user.id,
          authorName: ctx.session.user.name || 'Support GoldenEra Marketplace',
          isAdmin: true,
          content: input.content,
        },
      })

      // Update ticket status to IN_PROGRESS if it was OPEN
      if (ticket.status === 'OPEN') {
        await ctx.prisma.supportTicket.update({
          where: { id: input.ticketId },
          data: { status: 'WAITING_CUSTOMER' },
        })
      }

      return {
        success: true,
        message: 'Message envoye',
        ticketMessage: message,
      }
    }),

  // Get support stats
  getSupportStats: superAdminProcedure.query(async ({ ctx }) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [total, openCount, urgentCount, todayCount, weekCount, avgResponseTime] = await Promise.all([
      ctx.prisma.supportTicket.count(),
      ctx.prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      ctx.prisma.supportTicket.count({ where: { priority: 'URGENT', status: { not: 'CLOSED' } } }),
      ctx.prisma.supportTicket.count({ where: { createdAt: { gte: today } } }),
      ctx.prisma.supportTicket.count({ where: { createdAt: { gte: thisWeek } } }),
      // Average resolution time (simplified)
      ctx.prisma.supportTicket.findMany({
        where: { resolvedAt: { not: null } },
        select: { createdAt: true, resolvedAt: true },
        take: 100,
        orderBy: { resolvedAt: 'desc' },
      }),
    ])

    // Calculate average resolution time in hours
    let avgHours = 0
    if (avgResponseTime.length > 0) {
      const totalHours = avgResponseTime.reduce((sum, t) => {
        if (t.resolvedAt) {
          return sum + (t.resolvedAt.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60)
        }
        return sum
      }, 0)
      avgHours = Math.round(totalHours / avgResponseTime.length)
    }

    return {
      total,
      open: openCount,
      urgent: urgentCount,
      today: todayCount,
      thisWeek: weekCount,
      avgResolutionHours: avgHours,
    }
  }),

  // ============================================
  // STORE SUSPENSION MANAGEMENT
  // ============================================

  // Suspend a store
  suspendStore: superAdminProcedure
    .input(
      z.object({
        storeId: z.string(),
        reason: z.string().min(1, 'La raison est requise'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const store = await ctx.prisma.store.findUnique({
        where: { id: input.storeId },
      })

      if (!store) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Boutique non trouvée' })
      }

      if (store.status === 'SUSPENDED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'La boutique est déjà suspendue' })
      }

      const updatedStore = await ctx.prisma.store.update({
        where: { id: input.storeId },
        data: {
          status: 'SUSPENDED',
          suspendedAt: new Date(),
          suspendedReason: input.reason,
        },
      })

      // Log the suspension
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          ipAddress: ctx.ipAddress,
          userAgent: ctx.userAgent,
          storeId: input.storeId,
          action: 'STORE_SUSPENDED',
          entity: 'Store',
          entityId: input.storeId,
          metadata: {
            reason: input.reason,
            performedBy: ctx.session.user.email,
          },
        },
      })

      return {
        success: true,
        message: 'Boutique suspendue avec succès',
        store: updatedStore,
      }
    }),

  // Unsuspend/reactivate a store
  unsuspendStore: superAdminProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const store = await ctx.prisma.store.findUnique({
        where: { id: input.storeId },
      })

      if (!store) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Boutique non trouvée' })
      }

      if (store.status !== 'SUSPENDED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'La boutique n\'est pas suspendue' })
      }

      const updatedStore = await ctx.prisma.store.update({
        where: { id: input.storeId },
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
          ipAddress: ctx.ipAddress,
          userAgent: ctx.userAgent,
          storeId: input.storeId,
          action: 'STORE_REACTIVATED',
          entity: 'Store',
          entityId: input.storeId,
          metadata: {
            previousStatus: 'SUSPENDED',
            newStatus: 'ACTIVE',
            performedBy: ctx.session.user.email,
          },
        },
      })

      return {
        success: true,
        message: 'Boutique réactivée avec succès',
        store: updatedStore,
      }
    }),

  // Get store locations for map visualization
  getStoreLocations: superAdminProcedure.query(async ({ ctx }) => {
    const stores = await ctx.prisma.store.findMany({
      where: {
        status: { in: ['ACTIVE', 'PENDING'] },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        countries: true,
        logo: true,
        tagline: true,
        rating: true,
        reviewsCount: true,
        _count: {
          select: {
            products: { where: { status: 'ACTIVE' } },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return stores.map((store) => ({
      ...store,
      productsCount: store._count.products,
    }))
  }),
})
