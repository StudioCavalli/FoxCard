import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { PERMISSIONS } from '@/lib/rbac/roles'
import { checkPermission } from '../permissions'
import { TRPCError } from '@trpc/server'

// Statistical functions for A/B testing

// Normal distribution CDF approximation (for p-value calculation)
function normalCDF(x: number): number {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const sign = x < 0 ? -1 : 1
  x = Math.abs(x) / Math.sqrt(2)

  const t = 1.0 / (1.0 + p * x)
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

  return 0.5 * (1.0 + sign * y)
}

// Calculate z-score for two proportions
function calculateZScore(
  conversions1: number,
  visitors1: number,
  conversions2: number,
  visitors2: number
): number {
  if (visitors1 === 0 || visitors2 === 0) return 0

  const p1 = conversions1 / visitors1
  const p2 = conversions2 / visitors2
  const p = (conversions1 + conversions2) / (visitors1 + visitors2)

  const se = Math.sqrt(p * (1 - p) * (1 / visitors1 + 1 / visitors2))
  if (se === 0) return 0

  return (p1 - p2) / se
}

// Calculate p-value from z-score (two-tailed)
function calculatePValue(zScore: number): number {
  return 2 * (1 - normalCDF(Math.abs(zScore)))
}

// Calculate statistical confidence
function calculateConfidence(pValue: number): number {
  return (1 - pValue) * 100
}

// Calculate minimum sample size needed for statistical significance
function calculateMinSampleSize(
  baselineConversionRate: number,
  minimumDetectableEffect: number,
  significance: number = 0.05,
  power: number = 0.8
): number {
  // Z-scores for significance and power
  const zAlpha = 1.96 // 95% confidence
  const zBeta = 0.84 // 80% power

  const p1 = baselineConversionRate
  const p2 = baselineConversionRate * (1 + minimumDetectableEffect)

  const numerator = Math.pow(
    zAlpha * Math.sqrt(2 * p1 * (1 - p1)) +
      zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)),
    2
  )
  const denominator = Math.pow(p2 - p1, 2)

  if (denominator === 0) return Infinity

  return Math.ceil(numerator / denominator)
}

// Determine if test has reached statistical significance
function isStatisticallySignificant(pValue: number, threshold: number = 0.05): boolean {
  return pValue < threshold
}

export const abtestRouter = router({
  // Get all A/B tests for a store
  list: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        status: z.enum(['DRAFT', 'RUNNING', 'PAUSED', 'COMPLETED']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      const tests = await ctx.prisma.aBTest.findMany({
        where: {
          storeId: input.storeId,
          ...(input.status && { status: input.status }),
        },
        include: {
          variants: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return tests.map((test) => ({
        ...test,
        totalVisitors: test.variants.reduce((sum, v) => sum + v.visitors, 0),
        totalConversions: test.variants.reduce((sum, v) => sum + v.conversions, 0),
      }))
    }),

  // Get single A/B test with detailed stats
  get: protectedProcedure
    .input(z.object({ testId: z.string(), storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      const test = await ctx.prisma.aBTest.findUnique({
        where: { id: input.testId },
        include: {
          variants: {
            orderBy: { createdAt: 'asc' },
          },
        },
      })

      if (!test) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Test not found' })
      }

      // Calculate statistics
      const control = test.variants.find((v) => v.isControl)
      const variants = test.variants.filter((v) => !v.isControl)

      const stats = variants.map((variant) => {
        if (!control || control.visitors === 0) {
          return {
            variantId: variant.id,
            name: variant.name,
            visitors: variant.visitors,
            conversions: variant.conversions,
            conversionRate: variant.visitors > 0 ? (variant.conversions / variant.visitors) * 100 : 0,
            improvement: 0,
            pValue: 1,
            confidence: 0,
            isSignificant: false,
          }
        }

        const controlRate = control.conversions / control.visitors
        const variantRate = variant.visitors > 0 ? variant.conversions / variant.visitors : 0
        const improvement = controlRate > 0 ? ((variantRate - controlRate) / controlRate) * 100 : 0

        const zScore = calculateZScore(
          variant.conversions,
          variant.visitors,
          control.conversions,
          control.visitors
        )
        const pValue = calculatePValue(zScore)
        const confidence = calculateConfidence(pValue)

        return {
          variantId: variant.id,
          name: variant.name,
          visitors: variant.visitors,
          conversions: variant.conversions,
          conversionRate: variantRate * 100,
          improvement,
          pValue,
          confidence,
          isSignificant: isStatisticallySignificant(pValue),
        }
      })

      // Calculate minimum sample size needed
      const baselineRate = control && control.visitors > 0
        ? control.conversions / control.visitors
        : 0.05 // Default 5%
      const minSampleSize = calculateMinSampleSize(baselineRate, 0.1) // 10% MDE

      return {
        ...test,
        controlStats: control
          ? {
              variantId: control.id,
              name: control.name,
              visitors: control.visitors,
              conversions: control.conversions,
              conversionRate: control.visitors > 0 ? (control.conversions / control.visitors) * 100 : 0,
            }
          : null,
        variantStats: stats,
        minSampleSize,
        hasEnoughData: control ? control.visitors >= minSampleSize : false,
      }
    }),

  // Create new A/B test
  create: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        name: z.string().min(1),
        description: z.string().optional(),
        type: z.enum(['PAGE', 'ELEMENT', 'CHECKOUT', 'PRICE']),
        targetPage: z.string(),
        targetElement: z.string().optional(),
        trafficPercent: z.number().min(1).max(100).default(100),
        goalType: z.enum(['CONVERSION', 'CLICKS', 'REVENUE', 'ENGAGEMENT']),
        goalTarget: z.string().optional(),
        variants: z
          .array(
            z.object({
              name: z.string(),
              isControl: z.boolean().default(false),
              config: z.any(),
              weight: z.number().min(1).max(100).default(50),
            })
          )
          .min(2),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      const { variants, ...testData } = input

      // Ensure exactly one control
      const controlCount = variants.filter((v) => v.isControl).length
      if (controlCount !== 1) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Exactly one variant must be marked as control',
        })
      }

      // Normalize weights
      const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0)
      const normalizedVariants = variants.map((v) => ({
        ...v,
        weight: Math.round((v.weight / totalWeight) * 100),
      }))

      const test = await ctx.prisma.aBTest.create({
        data: {
          ...testData,
          variants: {
            create: normalizedVariants,
          },
        },
        include: {
          variants: true,
        },
      })

      return test
    }),

  // Update A/B test
  update: protectedProcedure
    .input(
      z.object({
        testId: z.string(),
        storeId: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        trafficPercent: z.number().min(1).max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      const { testId, storeId, ...data } = input

      const test = await ctx.prisma.aBTest.update({
        where: { id: testId },
        data,
        include: {
          variants: true,
        },
      })

      return test
    }),

  // Start A/B test
  start: protectedProcedure
    .input(z.object({ testId: z.string(), storeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      const test = await ctx.prisma.aBTest.update({
        where: { id: input.testId },
        data: {
          status: 'RUNNING',
          startDate: new Date(),
        },
      })

      return test
    }),

  // Pause A/B test
  pause: protectedProcedure
    .input(z.object({ testId: z.string(), storeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      const test = await ctx.prisma.aBTest.update({
        where: { id: input.testId },
        data: {
          status: 'PAUSED',
        },
      })

      return test
    }),

  // Complete A/B test and declare winner
  complete: protectedProcedure
    .input(
      z.object({
        testId: z.string(),
        storeId: z.string(),
        winnerVariantId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      const test = await ctx.prisma.aBTest.findUnique({
        where: { id: input.testId },
        include: { variants: true },
      })

      if (!test) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Test not found' })
      }

      // Auto-detect winner if not specified
      let winnerId = input.winnerVariantId
      let confidence = 0

      if (!winnerId) {
        const control = test.variants.find((v) => v.isControl)
        if (control) {
          let bestVariant = control
          let bestPValue = 1

          for (const variant of test.variants) {
            if (variant.isControl) continue

            const zScore = calculateZScore(
              variant.conversions,
              variant.visitors,
              control.conversions,
              control.visitors
            )
            const pValue = calculatePValue(zScore)

            if (pValue < bestPValue && variant.conversionRate > control.conversionRate) {
              bestPValue = pValue
              bestVariant = variant
              confidence = calculateConfidence(pValue)
            }
          }

          winnerId = bestVariant.id
        }
      }

      const updatedTest = await ctx.prisma.aBTest.update({
        where: { id: input.testId },
        data: {
          status: 'COMPLETED',
          endDate: new Date(),
          winnerVariantId: winnerId,
          declaredAt: new Date(),
          confidence,
        },
        include: {
          variants: true,
        },
      })

      return updatedTest
    }),

  // Delete A/B test
  delete: protectedProcedure
    .input(z.object({ testId: z.string(), storeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      await ctx.prisma.aBTest.delete({
        where: { id: input.testId },
      })

      return { success: true }
    }),

  // Record visitor for a variant
  recordVisitor: protectedProcedure
    .input(
      z.object({
        testId: z.string(),
        variantId: z.string(),
        storeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.aBTestVariant.update({
        where: { id: input.variantId },
        data: {
          visitors: { increment: 1 },
        },
      })

      return { success: true }
    }),

  // Record conversion for a variant
  recordConversion: protectedProcedure
    .input(
      z.object({
        testId: z.string(),
        variantId: z.string(),
        storeId: z.string(),
        revenue: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const variant = await ctx.prisma.aBTestVariant.update({
        where: { id: input.variantId },
        data: {
          conversions: { increment: 1 },
          ...(input.revenue && { revenue: { increment: input.revenue } }),
        },
      })

      // Update calculated metrics
      const conversionRate = variant.visitors > 0 ? variant.conversions / variant.visitors : 0
      const revenuePerVisitor = variant.visitors > 0 ? variant.revenue / variant.visitors : 0

      await ctx.prisma.aBTestVariant.update({
        where: { id: input.variantId },
        data: {
          conversionRate,
          revenuePerVisitor,
        },
      })

      return { success: true }
    }),

  // Get variant assignment for a visitor
  getVariantAssignment: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        targetPage: z.string(),
        visitorId: z.string(), // Cookie or session ID
      })
    )
    .query(async ({ ctx, input }) => {
      // Find running tests for this page
      const tests = await ctx.prisma.aBTest.findMany({
        where: {
          storeId: input.storeId,
          status: 'RUNNING',
          targetPage: input.targetPage,
        },
        include: {
          variants: true,
        },
      })

      if (tests.length === 0) {
        return { assignments: [] }
      }

      const assignments = tests.map((test) => {
        // Check if visitor should be included (based on trafficPercent)
        const hash = hashString(input.visitorId + test.id)
        const includeInTest = (hash % 100) < test.trafficPercent

        if (!includeInTest) {
          // Return control for excluded visitors
          const control = test.variants.find((v) => v.isControl)
          return {
            testId: test.id,
            variantId: control?.id || test.variants[0].id,
            config: control?.config || test.variants[0].config,
            isControl: true,
          }
        }

        // Assign variant based on weights
        const weightSum = test.variants.reduce((sum, v) => sum + v.weight, 0)
        const randomValue = hash % weightSum
        let cumulative = 0

        for (const variant of test.variants) {
          cumulative += variant.weight
          if (randomValue < cumulative) {
            return {
              testId: test.id,
              variantId: variant.id,
              config: variant.config,
              isControl: variant.isControl,
            }
          }
        }

        // Fallback to first variant
        return {
          testId: test.id,
          variantId: test.variants[0].id,
          config: test.variants[0].config,
          isControl: test.variants[0].isControl,
        }
      })

      return { assignments }
    }),

  // Get dashboard summary
  getDashboard: protectedProcedure
    .input(z.object({ storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      const [running, completed, draft] = await Promise.all([
        ctx.prisma.aBTest.count({
          where: { storeId: input.storeId, status: 'RUNNING' },
        }),
        ctx.prisma.aBTest.count({
          where: { storeId: input.storeId, status: 'COMPLETED' },
        }),
        ctx.prisma.aBTest.count({
          where: { storeId: input.storeId, status: 'DRAFT' },
        }),
      ])

      // Get recent tests with winners
      const recentWinners = await ctx.prisma.aBTest.findMany({
        where: {
          storeId: input.storeId,
          status: 'COMPLETED',
          winnerVariantId: { not: null },
        },
        include: {
          variants: true,
        },
        orderBy: { declaredAt: 'desc' },
        take: 5,
      })

      return {
        summary: {
          running,
          completed,
          draft,
          total: running + completed + draft,
        },
        recentWinners: recentWinners.map((test) => {
          const winner = test.variants.find((v) => v.id === test.winnerVariantId)
          const control = test.variants.find((v) => v.isControl)

          return {
            testId: test.id,
            testName: test.name,
            winnerName: winner?.name || 'Unknown',
            improvement:
              control && control.conversionRate > 0
                ? (((winner?.conversionRate || 0) - control.conversionRate) / control.conversionRate) * 100
                : 0,
            confidence: test.confidence || 0,
            declaredAt: test.declaredAt,
          }
        }),
      }
    }),
})

// Simple hash function for consistent variant assignment
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}
