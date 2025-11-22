/**
 * Subscription tRPC Router
 * Handles subscription plans, customer subscriptions, and billing
 */

import { z } from 'zod'
import { router, publicProcedure, adminProcedure, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import {
  getSubscriptionPlans,
  getSubscriptionPlan,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  getSubscriptions,
  getSubscription,
  getCustomerSubscriptions,
  createSubscription,
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
  changePlan,
  getSubscriptionStats,
  handlePaymentSuccess,
  handlePaymentFailure,
  processDueSubscriptions,
  formatBillingInterval,
  calculateSubscriptionPrice,
  BILLING_INTERVAL_LABELS,
  SUBSCRIPTION_STATUS_LABELS,
} from '@/lib/subscription/subscription-manager'

const BillingIntervalEnum = z.enum(['DAY', 'WEEK', 'MONTH', 'YEAR'])
const SubscriptionStatusEnum = z.enum(['TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'PAUSED', 'EXPIRED'])

export const subscriptionRouter = router({
  // ============ PUBLIC PROCEDURES ============

  /**
   * Get all subscription plans for a store
   */
  getPlans: publicProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input }) => {
      return getSubscriptionPlans(input.storeId)
    }),

  /**
   * Get a single plan details
   */
  getPlan: publicProcedure
    .input(z.object({
      storeId: z.string(),
      planId: z.string(),
    }))
    .query(async ({ input }) => {
      const plan = await getSubscriptionPlan(input.storeId, input.planId)
      if (!plan) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Plan not found' })
      }
      return plan
    }),

  /**
   * Get billing interval labels
   */
  getOptions: publicProcedure.query(() => {
    return {
      billingIntervals: Object.entries(BILLING_INTERVAL_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
      subscriptionStatuses: Object.entries(SUBSCRIPTION_STATUS_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    }
  }),

  /**
   * Calculate subscription price
   */
  calculatePrice: publicProcedure
    .input(z.object({
      storeId: z.string(),
      planId: z.string(),
      includeSetupFee: z.boolean().default(true),
    }))
    .query(async ({ input }) => {
      const plan = await getSubscriptionPlan(input.storeId, input.planId)
      if (!plan) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Plan not found' })
      }
      return calculateSubscriptionPrice(plan, input.includeSetupFee)
    }),

  /**
   * Format billing interval for display
   */
  formatInterval: publicProcedure
    .input(z.object({
      interval: BillingIntervalEnum,
      count: z.number().min(1),
    }))
    .query(({ input }) => {
      return formatBillingInterval(input.interval, input.count)
    }),

  // ============ PROTECTED PROCEDURES (Logged-in users) ============

  /**
   * Get current user's subscriptions
   */
  getMySubscriptions: protectedProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      return getCustomerSubscriptions(input.storeId, ctx.session.user.id)
    }),

  /**
   * Subscribe to a plan
   */
  subscribe: protectedProcedure
    .input(z.object({
      storeId: z.string(),
      planId: z.string(),
      startTrial: z.boolean().default(true),
      paymentMethodId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Check if user already has an active subscription to this plan
      const existing = await getCustomerSubscriptions(input.storeId, ctx.session.user.id)
      const hasActive = existing.some(
        (s) => s.planId === input.planId && ['ACTIVE', 'TRIALING'].includes(s.status)
      )

      if (hasActive) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You already have an active subscription to this plan',
        })
      }

      const subscription = await createSubscription(input.storeId, {
        customerId: ctx.session.user.id,
        customerEmail: ctx.session.user.email || '',
        planId: input.planId,
        paymentMethodId: input.paymentMethodId,
        startTrial: input.startTrial,
      })

      if (!subscription) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Plan not found' })
      }

      return subscription
    }),

  /**
   * Cancel subscription
   */
  cancel: protectedProcedure
    .input(z.object({
      storeId: z.string(),
      subscriptionId: z.string(),
      immediately: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const subscription = await getSubscription(input.storeId, input.subscriptionId)
      if (!subscription || subscription.customerId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Subscription not found' })
      }

      const result = await cancelSubscription(input.storeId, input.subscriptionId, input.immediately)
      if (!result) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Subscription not found' })
      }

      return result
    }),

  /**
   * Change subscription plan
   */
  changePlan: protectedProcedure
    .input(z.object({
      storeId: z.string(),
      subscriptionId: z.string(),
      newPlanId: z.string(),
      prorate: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const subscription = await getSubscription(input.storeId, input.subscriptionId)
      if (!subscription || subscription.customerId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Subscription not found' })
      }

      const result = await changePlan(
        input.storeId,
        input.subscriptionId,
        input.newPlanId,
        input.prorate
      )

      if (!result) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Subscription or plan not found' })
      }

      return result
    }),

  // ============ ADMIN PROCEDURES ============

  /**
   * Create a subscription plan
   */
  createPlan: adminProcedure
    .input(z.object({
      storeId: z.string(),
      productId: z.string(),
      name: z.string().min(1),
      description: z.string().optional(),
      price: z.number().min(0),
      interval: BillingIntervalEnum,
      intervalCount: z.number().min(1).default(1),
      trialPeriodDays: z.number().min(0).optional(),
      features: z.array(z.string()).default([]),
      setupFee: z.number().min(0).optional(),
      active: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      const { storeId, productId, ...planData } = input
      const plan = await createSubscriptionPlan(storeId, productId, planData)

      if (!plan) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' })
      }

      return plan
    }),

  /**
   * Update a subscription plan
   */
  updatePlan: adminProcedure
    .input(z.object({
      storeId: z.string(),
      productId: z.string(),
      planId: z.string(),
      updates: z.object({
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        price: z.number().min(0).optional(),
        interval: BillingIntervalEnum.optional(),
        intervalCount: z.number().min(1).optional(),
        trialPeriodDays: z.number().min(0).optional(),
        features: z.array(z.string()).optional(),
        setupFee: z.number().min(0).optional(),
        active: z.boolean().optional(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      const plan = await updateSubscriptionPlan(
        input.storeId,
        input.productId,
        input.planId,
        input.updates
      )

      if (!plan) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Plan not found' })
      }

      return plan
    }),

  /**
   * Delete a subscription plan
   */
  deletePlan: adminProcedure
    .input(z.object({
      storeId: z.string(),
      productId: z.string(),
      planId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      const success = await deleteSubscriptionPlan(input.storeId, input.productId, input.planId)

      if (!success) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Plan not found' })
      }

      return { success: true }
    }),

  /**
   * Get all subscriptions for admin
   */
  getAllSubscriptions: adminProcedure
    .input(z.object({
      storeId: z.string(),
      status: SubscriptionStatusEnum.optional(),
    }))
    .query(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      let subscriptions = await getSubscriptions(input.storeId)

      if (input.status) {
        subscriptions = subscriptions.filter((s) => s.status === input.status)
      }

      return subscriptions
    }),

  /**
   * Get subscription details (admin)
   */
  getSubscription: adminProcedure
    .input(z.object({
      storeId: z.string(),
      subscriptionId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      const subscription = await getSubscription(input.storeId, input.subscriptionId)

      if (!subscription) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Subscription not found' })
      }

      return subscription
    }),

  /**
   * Pause a subscription (admin)
   */
  pauseSubscription: adminProcedure
    .input(z.object({
      storeId: z.string(),
      subscriptionId: z.string(),
      resumeAt: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      const result = await pauseSubscription(
        input.storeId,
        input.subscriptionId,
        input.resumeAt ? new Date(input.resumeAt) : undefined
      )

      if (!result) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Subscription not found' })
      }

      return result
    }),

  /**
   * Resume a subscription (admin)
   */
  resumeSubscription: adminProcedure
    .input(z.object({
      storeId: z.string(),
      subscriptionId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      const result = await resumeSubscription(input.storeId, input.subscriptionId)

      if (!result) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Subscription not found' })
      }

      return result
    }),

  /**
   * Cancel subscription (admin)
   */
  adminCancelSubscription: adminProcedure
    .input(z.object({
      storeId: z.string(),
      subscriptionId: z.string(),
      immediately: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      const result = await cancelSubscription(
        input.storeId,
        input.subscriptionId,
        input.immediately
      )

      if (!result) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Subscription not found' })
      }

      return result
    }),

  /**
   * Get subscription statistics
   */
  getStats: adminProcedure
    .input(z.object({
      storeId: z.string(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      const startDate = input.startDate
        ? new Date(input.startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const endDate = input.endDate ? new Date(input.endDate) : new Date()

      return getSubscriptionStats(input.storeId, startDate, endDate)
    }),

  /**
   * Process due subscriptions (internal/webhook)
   */
  processDue: adminProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      return processDueSubscriptions(input.storeId)
    }),

  /**
   * Handle payment webhook - success
   */
  handlePaymentSuccess: adminProcedure
    .input(z.object({
      storeId: z.string(),
      subscriptionId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      const result = await handlePaymentSuccess(input.storeId, input.subscriptionId)

      if (!result) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Subscription not found' })
      }

      return result
    }),

  /**
   * Handle payment webhook - failure
   */
  handlePaymentFailure: adminProcedure
    .input(z.object({
      storeId: z.string(),
      subscriptionId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      const result = await handlePaymentFailure(input.storeId, input.subscriptionId)

      if (!result) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Subscription not found' })
      }

      return result
    }),
})
