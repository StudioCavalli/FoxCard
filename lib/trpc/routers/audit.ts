import { z } from 'zod'
import { router, requirePermission } from '../trpc'
import { PERMISSIONS } from '@/lib/rbac/roles'

export const auditRouter = router({
  // Get audit logs for a store with filters
  list: requirePermission(PERMISSIONS.AUDIT_VIEW)
    .input(
      z.object({
        storeId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        action: z.string().optional(),
        userId: z.string().optional(),
        entity: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        storeId: input.storeId,
      }

      if (input.action) {
        where.action = { contains: input.action, mode: 'insensitive' }
      }

      if (input.userId) {
        where.userId = input.userId
      }

      if (input.entity) {
        where.entity = input.entity
      }

      if (input.startDate || input.endDate) {
        where.createdAt = {}
        if (input.startDate) {
          where.createdAt.gte = input.startDate
        }
        if (input.endDate) {
          where.createdAt.lte = input.endDate
        }
      }

      const [logs, total] = await Promise.all([
        ctx.prisma.auditLog.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.auditLog.count({ where }),
      ])

      return {
        logs,
        total,
        hasMore: input.offset + input.limit < total,
      }
    }),

  // Get detailed log
  get: requirePermission(PERMISSIONS.AUDIT_VIEW)
    .input(
      z.object({
        storeId: z.string(),
        logId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const log = await ctx.prisma.auditLog.findFirst({
        where: {
          id: input.logId,
          storeId: input.storeId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return log
    }),

  // Get stats
  getStats: requirePermission(PERMISSIONS.AUDIT_VIEW)
    .input(
      z.object({
        storeId: z.string(),
        days: z.number().min(1).max(90).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - input.days)

      const [totalLogs, failedLogs, uniqueUsers, actionCounts] = await Promise.all([
        // Total logs in period
        ctx.prisma.auditLog.count({
          where: {
            storeId: input.storeId,
            createdAt: { gte: startDate },
          },
        }),

        // Failed actions
        ctx.prisma.auditLog.count({
          where: {
            storeId: input.storeId,
            success: false,
            createdAt: { gte: startDate },
          },
        }),

        // Unique users
        ctx.prisma.auditLog.findMany({
          where: {
            storeId: input.storeId,
            createdAt: { gte: startDate },
          },
          select: {
            userId: true,
          },
          distinct: ['userId'],
        }),

        // Action counts
        ctx.prisma.auditLog.groupBy({
          by: ['action'],
          where: {
            storeId: input.storeId,
            createdAt: { gte: startDate },
          },
          _count: {
            action: true,
          },
          orderBy: {
            _count: {
              action: 'desc',
            },
          },
          take: 10,
        }),
      ])

      return {
        totalLogs,
        failedLogs,
        uniqueUsers: uniqueUsers.length,
        successRate:
          totalLogs > 0 ? ((totalLogs - failedLogs) / totalLogs) * 100 : 100,
        topActions: actionCounts.map((item) => ({
          action: item.action,
          count: item._count.action,
        })),
      }
    }),

  // Get available actions (for filters)
  getActions: requirePermission(PERMISSIONS.AUDIT_VIEW)
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const actions = await ctx.prisma.auditLog.findMany({
        where: { storeId: input.storeId },
        select: { action: true },
        distinct: ['action'],
        orderBy: { action: 'asc' },
      })

      return actions.map((a) => a.action)
    }),

  // Get available entities (for filters)
  getEntities: requirePermission(PERMISSIONS.AUDIT_VIEW)
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const entities = await ctx.prisma.auditLog.findMany({
        where: { storeId: input.storeId },
        select: { entity: true },
        distinct: ['entity'],
        orderBy: { entity: 'asc' },
      })

      return entities.map((e) => e.entity)
    }),
})
