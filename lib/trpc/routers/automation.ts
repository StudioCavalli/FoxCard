import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import {
  triggerWelcomeSeries,
  triggerAbandonedCartAutomation,
  triggerPostPurchaseAutomation,
  triggerReEngagementAutomation,
} from '@/lib/email/automation'

export const automationRouter = router({
  // Get all automations for a store
  getAll: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        trigger: z.enum([
          'WELCOME_SERIES',
          'ABANDONED_CART',
          'POST_PURCHASE',
          'RE_ENGAGEMENT',
          'BIRTHDAY',
          'PRODUCT_BACK_IN_STOCK',
        ]).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        storeId: input.storeId,
      }

      if (input.trigger) {
        where.trigger = input.trigger
      }

      if (input.isActive !== undefined) {
        where.isActive = input.isActive
      }

      const automations = await ctx.prisma.emailAutomation.findMany({
        where,
        include: {
          emails: {
            orderBy: { stepOrder: 'asc' },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return automations
    }),

  // Get a single automation by ID
  getById: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const automation = await ctx.prisma.emailAutomation.findUnique({
        where: { id: input.id },
        include: {
          emails: {
            orderBy: { stepOrder: 'asc' },
          },
        },
      })

      if (!automation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Automation not found',
        })
      }

      return automation
    }),

  // Create a new automation
  create: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        name: z.string(),
        description: z.string().optional(),
        trigger: z.enum([
          'WELCOME_SERIES',
          'ABANDONED_CART',
          'POST_PURCHASE',
          'RE_ENGAGEMENT',
          'BIRTHDAY',
          'PRODUCT_BACK_IN_STOCK',
        ]),
        config: z.any(),
        emails: z.array(
          z.object({
            stepOrder: z.number(),
            name: z.string(),
            subject: z.string(),
            htmlBody: z.string(),
            textBody: z.string().optional(),
            delayMinutes: z.number().min(0),
            conditions: z.any().optional(),
          })
        ),
        isActive: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { emails, ...automationData } = input

      const automation = await ctx.prisma.emailAutomation.create({
        data: {
          ...automationData,
          emails: {
            create: emails,
          },
        },
        include: {
          emails: true,
        },
      })

      return automation
    }),

  // Update an automation
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        config: z.any().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      const automation = await ctx.prisma.emailAutomation.findUnique({
        where: { id },
      })

      if (!automation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Automation not found',
        })
      }

      const updated = await ctx.prisma.emailAutomation.update({
        where: { id },
        data,
      })

      return updated
    }),

  // Delete an automation
  delete: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const automation = await ctx.prisma.emailAutomation.findUnique({
        where: { id: input.id },
      })

      if (!automation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Automation not found',
        })
      }

      await ctx.prisma.emailAutomation.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // Toggle automation active status
  toggle: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const automation = await ctx.prisma.emailAutomation.findUnique({
        where: { id: input.id },
      })

      if (!automation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Automation not found',
        })
      }

      const updated = await ctx.prisma.emailAutomation.update({
        where: { id: input.id },
        data: {
          isActive: !automation.isActive,
        },
      })

      return updated
    }),

  // Add a step to automation
  addStep: adminProcedure
    .input(
      z.object({
        automationId: z.string(),
        stepOrder: z.number(),
        name: z.string(),
        subject: z.string(),
        htmlBody: z.string(),
        textBody: z.string().optional(),
        delayMinutes: z.number().min(0),
        conditions: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { automationId, ...stepData } = input

      const step = await ctx.prisma.emailAutomationStep.create({
        data: {
          automationId,
          ...stepData,
        },
      })

      return step
    }),

  // Update a step
  updateStep: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        subject: z.string().optional(),
        htmlBody: z.string().optional(),
        textBody: z.string().optional(),
        delayMinutes: z.number().min(0).optional(),
        conditions: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      const step = await ctx.prisma.emailAutomationStep.update({
        where: { id },
        data,
      })

      return step
    }),

  // Delete a step
  deleteStep: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.emailAutomationStep.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // Get automation statistics
  getStats: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const automations = await ctx.prisma.emailAutomation.findMany({
        where: { storeId: input.storeId },
      })

      const totalActive = automations.filter((a) => a.isActive).length
      const totalTriggered = automations.reduce((acc, a) => acc + a.triggered, 0)
      const totalCompleted = automations.reduce((acc, a) => acc + a.completed, 0)

      const completionRate = totalTriggered > 0 ? (totalCompleted / totalTriggered) * 100 : 0

      return {
        totalAutomations: automations.length,
        totalActive,
        totalTriggered,
        totalCompleted,
        completionRate: Math.round(completionRate * 10) / 10,
      }
    }),

  // Get automation executions
  getExecutions: adminProcedure
    .input(
      z.object({
        automationId: z.string().optional(),
        storeId: z.string(),
        status: z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'CANCELLED', 'FAILED']).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        storeId: input.storeId,
      }

      if (input.automationId) {
        where.automationId = input.automationId
      }

      if (input.status) {
        where.status = input.status
      }

      const executions = await ctx.prisma.automationExecution.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: input.limit,
        skip: input.offset,
      })

      const total = await ctx.prisma.automationExecution.count({ where })

      return {
        executions,
        total,
        hasMore: input.offset + input.limit < total,
      }
    }),

  // Manually trigger automation for testing
  testTrigger: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        trigger: z.enum([
          'WELCOME_SERIES',
          'ABANDONED_CART',
          'POST_PURCHASE',
          'RE_ENGAGEMENT',
        ]),
        email: z.string().email(),
        testData: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        let result

        switch (input.trigger) {
          case 'WELCOME_SERIES':
            result = await triggerWelcomeSeries({
              storeId: input.storeId,
              email: input.email,
              customerName: 'Test User',
            })
            break

          case 'ABANDONED_CART':
            result = await triggerAbandonedCartAutomation({
              storeId: input.storeId,
              email: input.email,
              cartId: 'test-cart-id',
              cartItems: input.testData?.items || [],
              cartTotal: input.testData?.total || 0,
              checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
            })
            break

          case 'POST_PURCHASE':
            result = await triggerPostPurchaseAutomation({
              storeId: input.storeId,
              email: input.email,
              orderNumber: 'TEST-001',
              orderTotal: input.testData?.total || 0,
              orderItems: input.testData?.items || [],
            })
            break

          case 'RE_ENGAGEMENT':
            result = await triggerReEngagementAutomation({
              storeId: input.storeId,
              customerId: input.testData?.customerId || 'test-customer-id',
              email: input.email,
              customerName: 'Test User',
            })
            break

          default:
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Unsupported trigger type for testing',
            })
        }

        return { success: true, result }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to trigger automation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        })
      }
    }),
})
