import { z } from 'zod'
import { router, publicProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const discountRouter = router({
  // Get all discount codes for a store
  getAll: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.discountCode.findMany({
        where: {
          storeId: input.storeId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    }),

  // Get a discount code by ID
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.discountCode.findUnique({
        where: { id: input.id },
      })
    }),

  // Validate and apply a discount code (public endpoint for checkout)
  validateCode: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
        code: z.string(),
        orderAmount: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const discount = await ctx.prisma.discountCode.findUnique({
        where: {
          storeId_code: {
            storeId: input.storeId,
            code: input.code.toUpperCase(),
          },
        },
      })

      if (!discount) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Code promo invalide',
        })
      }

      // Check if active
      if (!discount.isActive) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Ce code promo n\'est plus actif',
        })
      }

      // Check start date
      if (discount.startsAt && new Date(discount.startsAt) > new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Ce code promo n\'est pas encore valide',
        })
      }

      // Check expiration
      if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Ce code promo a expire',
        })
      }

      // Check usage limit
      if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Ce code promo a atteint sa limite d\'utilisation',
        })
      }

      // Check minimum order amount
      if (discount.minOrderAmount && input.orderAmount < discount.minOrderAmount) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Montant minimum de commande : ${discount.minOrderAmount}€`,
        })
      }

      // Calculate discount amount
      let discountAmount = 0
      if (discount.type === 'PERCENTAGE') {
        discountAmount = (input.orderAmount * discount.value) / 100
      } else {
        discountAmount = discount.value
      }

      return {
        id: discount.id,
        code: discount.code,
        type: discount.type,
        value: discount.value,
        discountAmount,
      }
    }),

  // Create a new discount code
  create: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        code: z.string().min(1).toUpperCase(),
        description: z.string().optional(),
        type: z.enum(['PERCENTAGE', 'FIXED']),
        value: z.number().positive(),
        usageLimit: z.number().int().positive().optional(),
        minOrderAmount: z.number().positive().optional(),
        startsAt: z.date().optional(),
        expiresAt: z.date().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if code already exists
      const existing = await ctx.prisma.discountCode.findUnique({
        where: {
          storeId_code: {
            storeId: input.storeId,
            code: input.code,
          },
        },
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Ce code promo existe deja',
        })
      }

      return ctx.prisma.discountCode.create({
        data: {
          ...input,
          usageCount: 0,
        },
      })
    }),

  // Update a discount code
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        code: z.string().min(1).toUpperCase().optional(),
        description: z.string().optional(),
        type: z.enum(['PERCENTAGE', 'FIXED']).optional(),
        value: z.number().positive().optional(),
        usageLimit: z.number().int().positive().optional(),
        minOrderAmount: z.number().positive().optional(),
        startsAt: z.date().optional(),
        expiresAt: z.date().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.prisma.discountCode.update({
        where: { id },
        data,
      })
    }),

  // Delete a discount code
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.discountCode.delete({
        where: { id: input.id },
      })
    }),

  // Increment usage count (internal use only - called when order is created)
  incrementUsage: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.discountCode.update({
        where: { id: input.id },
        data: {
          usageCount: {
            increment: 1,
          },
        },
      })
    }),
})
