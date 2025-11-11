import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import crypto from 'crypto'

const scopeEnum = z.enum([
  '*',
  'products:read',
  'products:write',
  'orders:read',
  'orders:write',
  'customers:read',
  'customers:write',
])

export const apiKeyRouter = router({
  // List all API keys for a store
  list: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const apiKeys = await ctx.prisma.apiKey.findMany({
        where: {
          storeId: input.storeId,
        },
        select: {
          id: true,
          name: true,
          prefix: true,
          scopes: true,
          isActive: true,
          rateLimit: true,
          lastUsedAt: true,
          expiresAt: true,
          createdAt: true,
          updatedAt: true,
          // Never return the actual key
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return apiKeys
    }),

  // Create a new API key
  create: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        name: z.string().min(1).max(100),
        scopes: z.array(scopeEnum).min(1),
        rateLimit: z.number().min(100).max(10000).default(1000),
        expiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate a random API key
      const apiKey = `foxcard_${crypto.randomBytes(32).toString('hex')}`
      const prefix = apiKey.substring(0, 16) // Store prefix for identification

      // Hash the API key before storing
      const hashedKey = crypto
        .createHash('sha256')
        .update(apiKey)
        .digest('hex')

      const createdKey = await ctx.prisma.apiKey.create({
        data: {
          storeId: input.storeId,
          name: input.name,
          key: hashedKey,
          prefix,
          scopes: input.scopes,
          rateLimit: input.rateLimit,
          expiresAt: input.expiresAt,
          isActive: true,
        },
      })

      // Return the plain API key ONLY on creation
      // This is the only time the user will see it
      return {
        id: createdKey.id,
        name: createdKey.name,
        apiKey, // Plain text key (only returned on creation)
        prefix,
        scopes: createdKey.scopes,
        rateLimit: createdKey.rateLimit,
        expiresAt: createdKey.expiresAt,
        createdAt: createdKey.createdAt,
      }
    }),

  // Update API key
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        scopes: z.array(scopeEnum).min(1).optional(),
        rateLimit: z.number().min(100).max(10000).optional(),
        isActive: z.boolean().optional(),
        expiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      const apiKey = await ctx.prisma.apiKey.update({
        where: { id },
        data,
        select: {
          id: true,
          name: true,
          prefix: true,
          scopes: true,
          isActive: true,
          rateLimit: true,
          lastUsedAt: true,
          expiresAt: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return apiKey
    }),

  // Delete API key
  delete: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.apiKey.delete({
        where: {
          id: input.id,
        },
      })

      return { success: true }
    }),

  // Get API key usage stats
  getUsageStats: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const apiKey = await ctx.prisma.apiKey.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          lastUsedAt: true,
          rateLimit: true,
        },
      })

      if (!apiKey) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'API key not found',
        })
      }

      // In a production system, you would track API usage in a separate table
      // For now, we just return the basic info
      return {
        ...apiKey,
        // TODO: Implement actual usage tracking
        requestsThisHour: 0,
        requestsToday: 0,
        requestsThisMonth: 0,
      }
    }),
})
