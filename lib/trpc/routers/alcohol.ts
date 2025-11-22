/**
 * Alcohol tRPC Router
 * Handles alcohol-specific operations: vintages, compliance, age verification
 */

import { z } from 'zod'
import { router, publicProcedure, requireStoreAccess, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

const AgeVerificationMethodEnum = z.enum([
  'SELF_DECLARATION',
  'DATE_OF_BIRTH',
  'DOCUMENT_UPLOAD',
  'THIRD_PARTY',
  'IN_PERSON',
])
const VerificationStatusEnum = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'])

// Input schemas
const createVintageInput = z.object({
  storeId: z.string(),
  productId: z.string(),
  year: z.number().min(1900).max(new Date().getFullYear()),
  quantity: z.number().min(0).default(0),
  price: z.number().optional(),
  tastingNotes: z.string().optional(),
  sommelierNotes: z.string().optional(),
  rating: z.number().min(0).max(100).optional(),
  ratingSource: z.string().optional(),
  drinkFrom: z.number().optional(),
  drinkUntil: z.number().optional(),
  peakYear: z.number().optional(),
  cellarTemp: z.number().optional(),
  humidity: z.number().optional(),
})

const verifyAgeInput = z.object({
  storeId: z.string(),
  orderId: z.string().optional(),
  customerId: z.string().optional(),
  method: AgeVerificationMethodEnum,
  dateOfBirth: z.string().optional(),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  documentExpiry: z.string().optional(),
  documentCountry: z.string().optional(),
})

const complianceSettingsInput = z.object({
  storeId: z.string(),
  minimumAge: z.number().min(16).max(25).default(18),
  requireVerification: z.boolean().default(true),
  verificationMethods: z.array(AgeVerificationMethodEnum).default(['SELF_DECLARATION']),
  maxQuantityPerOrder: z.number().optional(),
  maxAlcoholPerOrder: z.number().optional(),
  deliveryRestrictions: z.any().optional(),
  ageWarningMessage: z.string().optional(),
  legalDisclaimer: z.string().optional(),
  requireSignature: z.boolean().default(true),
  requireAdultSignature: z.boolean().default(true),
  enableSalesReporting: z.boolean().default(true),
})

export const alcoholRouter = router({
  // ============ PUBLIC PROCEDURES ============

  /**
   * Get vintages for a product
   */
  getVintages: publicProcedure
    .input(z.object({
      productId: z.string(),
      storeId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      return ctx.prisma.vintage.findMany({
        where: {
          productId: input.productId,
          storeId: input.storeId,
          isActive: true,
          quantity: { gt: 0 },
        },
        orderBy: { year: 'desc' },
      })
    }),

  /**
   * Get vintage details
   */
  getVintage: publicProcedure
    .input(z.object({
      storeId: z.string(),
      productId: z.string(),
      year: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      const vintage = await ctx.prisma.vintage.findUnique({
        where: {
          storeId_productId_year: {
            storeId: input.storeId,
            productId: input.productId,
            year: input.year,
          },
        },
      })

      if (!vintage) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Vintage not found' })
      }

      return vintage
    }),

  /**
   * Get compliance settings for store
   */
  getComplianceSettings: publicProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const settings = await ctx.prisma.alcoholComplianceSettings.findUnique({
        where: { storeId: input.storeId },
      })

      // Return defaults if no settings exist
      if (!settings) {
        return {
          minimumAge: 18,
          requireVerification: true,
          verificationMethods: ['SELF_DECLARATION'],
          ageWarningMessage: null,
          legalDisclaimer: null,
        }
      }

      return settings
    }),

  /**
   * Verify age (self-declaration)
   */
  verifyAge: publicProcedure
    .input(verifyAgeInput)
    .mutation(async ({ input, ctx }) => {
      // Calculate age if DOB provided
      let verifiedAge: number | undefined
      if (input.dateOfBirth) {
        const dob = new Date(input.dateOfBirth)
        const today = new Date()
        let age = today.getFullYear() - dob.getFullYear()
        const monthDiff = today.getMonth() - dob.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--
        }
        verifiedAge = age
      }

      // Get compliance settings
      const settings = await ctx.prisma.alcoholComplianceSettings.findUnique({
        where: { storeId: input.storeId },
      })

      const minimumAge = settings?.minimumAge ?? 18

      // Check if approved
      const isApproved = verifiedAge !== undefined && verifiedAge >= minimumAge

      // Create verification log
      const log = await ctx.prisma.ageVerificationLog.create({
        data: {
          storeId: input.storeId,
          orderId: input.orderId,
          customerId: input.customerId,
          verificationMethod: input.method,
          dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
          verifiedAge,
          documentType: input.documentType,
          documentNumber: input.documentNumber ? input.documentNumber.slice(-4) : undefined,
          documentExpiry: input.documentExpiry ? new Date(input.documentExpiry) : undefined,
          documentCountry: input.documentCountry,
          status: isApproved ? 'APPROVED' : 'PENDING',
          isApproved,
          verifiedAt: isApproved ? new Date() : undefined,
        },
      })

      return {
        id: log.id,
        isApproved,
        minimumAge,
        verifiedAge,
        message: isApproved
          ? 'Age verification successful'
          : verifiedAge !== undefined
            ? `You must be at least ${minimumAge} years old to purchase alcohol`
            : 'Age verification pending',
      }
    }),

  // ============ ADMIN PROCEDURES ============

  /**
   * Get all vintages for a store (admin)
   */
  getAllVintages: requireStoreAccess
    .input(z.object({
      storeId: z.string(),
      productId: z.string().optional(),
      includeOutOfStock: z.boolean().default(false),
    }))
    .query(async ({ input, ctx }) => {
      return ctx.prisma.vintage.findMany({
        where: {
          storeId: input.storeId,
          productId: input.productId,
          ...(input.includeOutOfStock ? {} : { quantity: { gt: 0 } }),
        },
        orderBy: [
          { productId: 'asc' },
          { year: 'desc' },
        ],
      })
    }),

  /**
   * Create a vintage
   */
  createVintage: requireStoreAccess
    .input(createVintageInput)
    .mutation(async ({ input, ctx }) => {
      // Check if vintage already exists
      const existing = await ctx.prisma.vintage.findUnique({
        where: {
          storeId_productId_year: {
            storeId: input.storeId,
            productId: input.productId,
            year: input.year,
          },
        },
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `Vintage ${input.year} already exists for this product`,
        })
      }

      return ctx.prisma.vintage.create({
        data: {
          storeId: input.storeId,
          productId: input.productId,
          year: input.year,
          quantity: input.quantity,
          price: input.price,
          tastingNotes: input.tastingNotes,
          sommelierNotes: input.sommelierNotes,
          rating: input.rating,
          ratingSource: input.ratingSource,
          drinkFrom: input.drinkFrom,
          drinkUntil: input.drinkUntil,
          peakYear: input.peakYear,
          cellarTemp: input.cellarTemp,
          humidity: input.humidity,
        },
      })
    }),

  /**
   * Update a vintage
   */
  updateVintage: requireStoreAccess
    .input(z.object({
      storeId: z.string(),
      productId: z.string(),
      year: z.number(),
      data: createVintageInput.partial().omit({ storeId: true, productId: true, year: true }),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.vintage.update({
        where: {
          storeId_productId_year: {
            storeId: input.storeId,
            productId: input.productId,
            year: input.year,
          },
        },
        data: input.data,
      })
    }),

  /**
   * Delete a vintage
   */
  deleteVintage: requireStoreAccess
    .input(z.object({
      storeId: z.string(),
      productId: z.string(),
      year: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.vintage.delete({
        where: {
          storeId_productId_year: {
            storeId: input.storeId,
            productId: input.productId,
            year: input.year,
          },
        },
      })
    }),

  /**
   * Update compliance settings
   */
  updateComplianceSettings: requireStoreAccess
    .input(complianceSettingsInput)
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.alcoholComplianceSettings.upsert({
        where: { storeId: input.storeId },
        create: {
          storeId: input.storeId,
          minimumAge: input.minimumAge,
          requireVerification: input.requireVerification,
          verificationMethods: input.verificationMethods,
          maxQuantityPerOrder: input.maxQuantityPerOrder,
          maxAlcoholPerOrder: input.maxAlcoholPerOrder,
          deliveryRestrictions: input.deliveryRestrictions,
          ageWarningMessage: input.ageWarningMessage,
          legalDisclaimer: input.legalDisclaimer,
          requireSignature: input.requireSignature,
          requireAdultSignature: input.requireAdultSignature,
          enableSalesReporting: input.enableSalesReporting,
        },
        update: {
          minimumAge: input.minimumAge,
          requireVerification: input.requireVerification,
          verificationMethods: input.verificationMethods,
          maxQuantityPerOrder: input.maxQuantityPerOrder,
          maxAlcoholPerOrder: input.maxAlcoholPerOrder,
          deliveryRestrictions: input.deliveryRestrictions,
          ageWarningMessage: input.ageWarningMessage,
          legalDisclaimer: input.legalDisclaimer,
          requireSignature: input.requireSignature,
          requireAdultSignature: input.requireAdultSignature,
          enableSalesReporting: input.enableSalesReporting,
        },
      })
    }),

  /**
   * Get verification logs
   */
  getVerificationLogs: requireStoreAccess
    .input(z.object({
      storeId: z.string(),
      status: VerificationStatusEnum.optional(),
      from: z.string().optional(),
      to: z.string().optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ input, ctx }) => {
      return ctx.prisma.ageVerificationLog.findMany({
        where: {
          storeId: input.storeId,
          status: input.status,
          ...(input.from || input.to ? {
            createdAt: {
              ...(input.from && { gte: new Date(input.from) }),
              ...(input.to && { lte: new Date(input.to) }),
            },
          } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
      })
    }),

  /**
   * Manually verify/reject an age verification
   */
  processVerification: requireStoreAccess
    .input(z.object({
      storeId: z.string(),
      verificationId: z.string(),
      status: z.enum(['APPROVED', 'REJECTED']),
      rejectionReason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.ageVerificationLog.update({
        where: { id: input.verificationId },
        data: {
          status: input.status,
          isApproved: input.status === 'APPROVED',
          rejectionReason: input.rejectionReason,
          verifiedBy: ctx.session.user.id,
          verifiedAt: new Date(),
        },
      })
    }),

  /**
   * Get inventory by vintage (cellar analytics)
   */
  getCellarInventory: requireStoreAccess
    .input(z.object({
      storeId: z.string(),
      minYear: z.number().optional(),
      maxYear: z.number().optional(),
      sortBy: z.enum(['year', 'quantity', 'rating']).default('year'),
    }))
    .query(async ({ input, ctx }) => {
      const vintages = await ctx.prisma.vintage.findMany({
        where: {
          storeId: input.storeId,
          isActive: true,
          ...(input.minYear || input.maxYear ? {
            year: {
              ...(input.minYear && { gte: input.minYear }),
              ...(input.maxYear && { lte: input.maxYear }),
            },
          } : {}),
        },
        orderBy: input.sortBy === 'year'
          ? { year: 'desc' }
          : input.sortBy === 'quantity'
            ? { quantity: 'desc' }
            : { rating: 'desc' },
      })

      // Calculate totals
      const totalBottles = vintages.reduce((sum, v) => sum + v.quantity, 0)
      const totalValue = vintages.reduce((sum, v) => sum + (v.quantity * (v.price ?? 0)), 0)
      const avgRating = vintages.filter(v => v.rating).length > 0
        ? vintages.filter(v => v.rating).reduce((sum, v) => sum + (v.rating ?? 0), 0)
          / vintages.filter(v => v.rating).length
        : null

      // Group by decade
      const byDecade = vintages.reduce((acc, v) => {
        const decade = Math.floor(v.year / 10) * 10
        if (!acc[decade]) {
          acc[decade] = { count: 0, bottles: 0 }
        }
        acc[decade].count++
        acc[decade].bottles += v.quantity
        return acc
      }, {} as Record<number, { count: number; bottles: number }>)

      // Ready to drink vs cellaring
      const currentYear = new Date().getFullYear()
      const readyToDrink = vintages.filter(v =>
        !v.drinkFrom || v.drinkFrom <= currentYear
      )
      const stillCellaring = vintages.filter(v =>
        v.drinkFrom && v.drinkFrom > currentYear
      )

      return {
        vintages,
        summary: {
          totalVintages: vintages.length,
          totalBottles,
          totalValue,
          avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
          byDecade,
          readyToDrinkCount: readyToDrink.length,
          stillCellaringCount: stillCellaring.length,
        },
      }
    }),
})
