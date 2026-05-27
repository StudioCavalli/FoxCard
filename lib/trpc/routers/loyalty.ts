import { z } from 'zod'
import { router, protectedProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

/**
 * Loyalty Program Configuration
 * - 1 point = 1€ spent
 * - Points expire after 12 months
 * - Signup bonus: 100 points
 * - Tier thresholds: Bronze (0-999€), Silver (1000-4999€), Gold (5000€+)
 */

const POINTS_PER_EURO = 1
const SIGNUP_BONUS = 100
const POINTS_EXPIRY_MONTHS = 12

// Tier thresholds based on lifetime spend
const TIER_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 1000,
  GOLD: 5000,
}

export const loyaltyRouter = router({
  // Get customer's loyalty balance and tier info
  getBalance: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const customer = await ctx.prisma.customer.findUnique({
        where: { id: input.customerId },
      })

      if (!customer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Customer not found',
        })
      }

      // Verify the caller is associated with this customer or is the store owner
      const sessionEmail = ctx.session.user.email
      const store = await ctx.prisma.store.findUnique({
        where: { id: customer.storeId },
        select: { ownerId: true },
      })
      const isStoreOwner = store?.ownerId === ctx.session.user.id
      const isAdmin = ctx.session.user.role === 'ADMIN' || ctx.session.user.role === 'SUPER_ADMIN'

      if (customer.email !== sessionEmail && !isStoreOwner && !isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this customer\'s loyalty data',
        })
      }

      // Calculate total lifetime spend from paid orders
      const lifetimeSpend = await ctx.prisma.order.aggregate({
        where: {
          customerId: input.customerId,
          paymentStatus: 'PAID',
        },
        _sum: { total: true },
      })

      const totalSpent = lifetimeSpend._sum.total || 0

      // Determine tier
      let tier: 'BRONZE' | 'SILVER' | 'GOLD' = 'BRONZE'
      if (totalSpent >= TIER_THRESHOLDS.GOLD) {
        tier = 'GOLD'
      } else if (totalSpent >= TIER_THRESHOLDS.SILVER) {
        tier = 'SILVER'
      }

      // Calculate points until next tier
      let pointsToNextTier: number | null = null
      let nextTier: string | null = null
      if (tier === 'BRONZE') {
        pointsToNextTier = TIER_THRESHOLDS.SILVER - totalSpent
        nextTier = 'SILVER'
      } else if (tier === 'SILVER') {
        pointsToNextTier = TIER_THRESHOLDS.GOLD - totalSpent
        nextTier = 'GOLD'
      }

      // Get points expiring soon (within 30 days)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

      const expiringTransactions = await ctx.prisma.loyaltyTransaction.findMany({
        where: {
          customerId: input.customerId,
          type: 'EARN',
          isExpired: false,
          expiresAt: {
            lte: thirtyDaysFromNow,
            gte: new Date(),
          },
        },
      })

      const pointsExpiringSoon = expiringTransactions.reduce((sum, tx) => sum + tx.points, 0)

      return {
        points: customer.loyaltyPoints,
        tier: tier,
        totalSpent,
        totalPointsEarned: customer.totalPointsEarned,
        pointsToNextTier,
        nextTier,
        pointsExpiringSoon,
        tierBenefits: getTierBenefits(tier),
      }
    }),

  // Get transaction history
  getHistory: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify the caller is associated with this customer or is the store owner
      const customer = await ctx.prisma.customer.findUnique({
        where: { id: input.customerId },
        select: { email: true, storeId: true },
      })

      if (!customer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Customer not found',
        })
      }

      const sessionEmail = ctx.session.user.email
      const store = await ctx.prisma.store.findUnique({
        where: { id: customer.storeId },
        select: { ownerId: true },
      })
      const isStoreOwner = store?.ownerId === ctx.session.user.id
      const isAdmin = ctx.session.user.role === 'ADMIN' || ctx.session.user.role === 'SUPER_ADMIN'

      if (customer.email !== sessionEmail && !isStoreOwner && !isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this customer\'s loyalty data',
        })
      }

      const transactions = await ctx.prisma.loyaltyTransaction.findMany({
        where: {
          customerId: input.customerId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: input.limit,
        skip: input.offset,
      })

      const total = await ctx.prisma.loyaltyTransaction.count({
        where: {
          customerId: input.customerId,
        },
      })

      return {
        transactions,
        total,
        hasMore: total > input.offset + input.limit,
      }
    }),

  // Redeem points for discount (called during checkout)
  redeemPoints: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
        points: z.number().positive(),
        orderId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const customer = await ctx.prisma.customer.findUnique({
        where: { id: input.customerId },
      })

      if (!customer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Customer not found',
        })
      }

      // Verify the caller is associated with this customer or is the store owner
      const sessionEmail = ctx.session.user.email
      const store = await ctx.prisma.store.findUnique({
        where: { id: customer.storeId },
        select: { ownerId: true },
      })
      const isStoreOwner = store?.ownerId === ctx.session.user.id
      const isAdmin = ctx.session.user.role === 'ADMIN' || ctx.session.user.role === 'SUPER_ADMIN'

      if (customer.email !== sessionEmail && !isStoreOwner && !isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to redeem points for this customer',
        })
      }

      // Check if customer has enough points
      if (customer.loyaltyPoints < input.points) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `Insufficient points. You have ${customer.loyaltyPoints} points, but tried to redeem ${input.points}.`,
        })
      }

      // Deduct points and create transaction
      await ctx.prisma.$transaction([
        ctx.prisma.customer.update({
          where: { id: input.customerId },
          data: {
            loyaltyPoints: {
              decrement: input.points,
            },
          },
        }),
        ctx.prisma.loyaltyTransaction.create({
          data: {
            customerId: input.customerId,
            storeId: customer.storeId,
            type: 'REDEEM',
            points: -input.points, // Negative for redemption
            orderId: input.orderId,
            description: `Points redeemed for order`,
          },
        }),
      ])

      // Return discount amount (1 point = 1 euro)
      const discountAmount = input.points * POINTS_PER_EURO

      return {
        success: true,
        pointsRedeemed: input.points,
        discountAmount,
        remainingPoints: customer.loyaltyPoints - input.points,
      }
    }),

  // Award signup bonus (called when customer creates account)
  awardSignupBonus: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const customer = await ctx.prisma.customer.findUnique({
        where: { id: input.customerId },
        include: {
          loyaltyTransactions: {
            where: {
              type: 'EARN',
              description: 'Bonus inscription',
            },
          },
        },
      })

      if (!customer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Customer not found',
        })
      }

      // Verify the caller is associated with this customer or is the store owner
      const sessionEmail = ctx.session.user.email
      const store = await ctx.prisma.store.findUnique({
        where: { id: customer.storeId },
        select: { ownerId: true },
      })
      const isStoreOwner = store?.ownerId === ctx.session.user.id
      const isAdmin = ctx.session.user.role === 'ADMIN' || ctx.session.user.role === 'SUPER_ADMIN'

      if (customer.email !== sessionEmail && !isStoreOwner && !isAdmin) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to award bonus for this customer',
        })
      }

      // Check if signup bonus already awarded
      if (customer.loyaltyTransactions.length > 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Signup bonus already awarded',
        })
      }

      // Award signup bonus
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + POINTS_EXPIRY_MONTHS)

      await ctx.prisma.$transaction([
        ctx.prisma.customer.update({
          where: { id: input.customerId },
          data: {
            loyaltyPoints: {
              increment: SIGNUP_BONUS,
            },
            totalPointsEarned: {
              increment: SIGNUP_BONUS,
            },
          },
        }),
        ctx.prisma.loyaltyTransaction.create({
          data: {
            customerId: input.customerId,
            storeId: customer.storeId,
            type: 'EARN',
            points: SIGNUP_BONUS,
            description: 'Bonus inscription',
            expiresAt,
          },
        }),
      ])

      return {
        success: true,
        pointsAwarded: SIGNUP_BONUS,
      }
    }),

  // Internal: Award points for purchase (called by webhooks)
  awardPurchasePoints: adminProcedure
    .input(
      z.object({
        customerId: z.string(),
        orderId: z.string(),
        orderTotal: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const customer = await ctx.prisma.customer.findUnique({
        where: { id: input.customerId },
      })

      if (!customer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Customer not found',
        })
      }

      // Check if points already awarded for this order
      const existingTransaction = await ctx.prisma.loyaltyTransaction.findFirst({
        where: {
          orderId: input.orderId,
          type: 'EARN',
        },
      })

      if (existingTransaction) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Points already awarded for this order',
        })
      }

      // Calculate points (1 point per euro spent)
      const pointsToAward = Math.floor(input.orderTotal * POINTS_PER_EURO)

      // Set expiration date
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + POINTS_EXPIRY_MONTHS)

      // Award points and create transaction
      await ctx.prisma.$transaction([
        ctx.prisma.customer.update({
          where: { id: input.customerId },
          data: {
            loyaltyPoints: {
              increment: pointsToAward,
            },
            totalPointsEarned: {
              increment: pointsToAward,
            },
          },
        }),
        ctx.prisma.loyaltyTransaction.create({
          data: {
            customerId: input.customerId,
            storeId: customer.storeId,
            type: 'EARN',
            points: pointsToAward,
            orderId: input.orderId,
            description: `Achat confirmé`,
            expiresAt,
          },
        }),
      ])

      // Update tier if needed
      const lifetimeSpend = await ctx.prisma.order.aggregate({
        where: {
          customerId: input.customerId,
          paymentStatus: 'PAID',
        },
        _sum: { total: true },
      })

      const totalSpent = lifetimeSpend._sum.total || 0
      let newTier: 'BRONZE' | 'SILVER' | 'GOLD' = 'BRONZE'
      if (totalSpent >= TIER_THRESHOLDS.GOLD) {
        newTier = 'GOLD'
      } else if (totalSpent >= TIER_THRESHOLDS.SILVER) {
        newTier = 'SILVER'
      }

      // Update tier if changed
      if (newTier !== customer.loyaltyTier) {
        await ctx.prisma.customer.update({
          where: { id: input.customerId },
          data: { loyaltyTier: newTier },
        })

        // TODO: Send tier upgrade email
        console.log(`[Loyalty] Customer ${customer.email} upgraded to ${newTier}`)
      }

      return {
        success: true,
        pointsAwarded: pointsToAward,
        newTier: newTier,
        tierUpgraded: newTier !== customer.loyaltyTier,
      }
    }),

  // Admin: Get all customers with loyalty stats
  getAllCustomersLoyalty: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        tier: z.enum(['BRONZE', 'SILVER', 'GOLD']).optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const customers = await ctx.prisma.customer.findMany({
        where: {
          storeId: input.storeId,
          loyaltyTier: input.tier,
        },
        orderBy: {
          loyaltyPoints: 'desc',
        },
        take: input.limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          loyaltyPoints: true,
          loyaltyTier: true,
          totalPointsEarned: true,
          createdAt: true,
        },
      })

      return customers
    }),

  // Admin: Manually adjust points
  adminAdjustPoints: adminProcedure
    .input(
      z.object({
        customerId: z.string(),
        points: z.number(), // Can be positive or negative
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const customer = await ctx.prisma.customer.findUnique({
        where: { id: input.customerId },
      })

      if (!customer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Customer not found',
        })
      }

      // Check if adjustment would result in negative balance
      const newBalance = customer.loyaltyPoints + input.points
      if (newBalance < 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `Cannot adjust. Customer has ${customer.loyaltyPoints} points, adjustment of ${input.points} would result in negative balance.`,
        })
      }

      // Apply adjustment
      await ctx.prisma.$transaction([
        ctx.prisma.customer.update({
          where: { id: input.customerId },
          data: {
            loyaltyPoints: {
              increment: input.points,
            },
          },
        }),
        ctx.prisma.loyaltyTransaction.create({
          data: {
            customerId: input.customerId,
            storeId: customer.storeId,
            type: 'ADMIN_ADJUST',
            points: input.points,
            description: `Ajustement manuel: ${input.reason}`,
          },
        }),
      ])

      return {
        success: true,
        newBalance: newBalance,
      }
    }),
})

/**
 * Get tier benefits description
 */
function getTierBenefits(tier: 'BRONZE' | 'SILVER' | 'GOLD') {
  const benefits = {
    BRONZE: [
      'Accumulation de points sur tous les achats',
      '1 point = 1€ dépensé',
      'Points valables 12 mois',
    ],
    SILVER: [
      'Tous les avantages Bronze',
      'Livraison gratuite dès 50€',
      'Accès aux ventes privées',
      'Points de fidélité doublés lors des événements spéciaux',
    ],
    GOLD: [
      'Tous les avantages Silver',
      'Livraison gratuite sans minimum',
      'Accès prioritaire aux nouveautés',
      'Service client prioritaire',
      'Bonus anniversaire de 500 points',
    ],
  }

  return benefits[tier]
}
