import { z } from 'zod'
import { router, publicProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import crypto from 'crypto'
import { emailService } from '@/lib/email/service'

export const newsletterRouter = router({
  // Public: Subscribe to newsletter (double opt-in)
  subscribe: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
        email: z.string().email(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        source: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if already subscribed
      const existing = await ctx.prisma.newsletterSubscriber.findUnique({
        where: {
          storeId_email: {
            storeId: input.storeId,
            email: input.email,
          },
        },
      })

      // If already confirmed, return success
      if (existing?.status === 'CONFIRMED') {
        return {
          success: true,
          message: 'Vous êtes déjà inscrit à notre newsletter',
          alreadySubscribed: true,
        }
      }

      // Generate confirmation token
      const confirmationToken = crypto.randomBytes(32).toString('hex')

      // Create or update subscriber
      const subscriber = await ctx.prisma.newsletterSubscriber.upsert({
        where: {
          storeId_email: {
            storeId: input.storeId,
            email: input.email,
          },
        },
        create: {
          storeId: input.storeId,
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          source: input.source || 'website',
          status: 'PENDING',
          // Store confirmation token temporarily in preferences
          preferences: { confirmationToken } as any,
        },
        update: {
          firstName: input.firstName,
          lastName: input.lastName,
          status: 'PENDING',
          unsubscribedAt: null,
          preferences: { confirmationToken } as any,
        },
      })

      // Send confirmation email
      try {
        const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/newsletter/confirm?token=${confirmationToken}&email=${encodeURIComponent(input.email)}&storeId=${input.storeId}`

        await emailService.sendEmail({
          to: input.email,
          subject: 'Confirmez votre inscription à la newsletter',
          template: 'NewsletterConfirmation',
          props: {
            firstName: input.firstName || 'Cher abonné',
            confirmUrl,
          },
          storeId: input.storeId,
          trackingEnabled: false,
        })
      } catch (error) {
        console.error('Failed to send confirmation email:', error)
        // Don't fail the subscription, just log the error
      }

      return {
        success: true,
        message: 'Un email de confirmation vous a été envoyé',
        subscriberId: subscriber.id,
      }
    }),

  // Public: Confirm subscription
  confirm: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
        email: z.string().email(),
        token: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const subscriber = await ctx.prisma.newsletterSubscriber.findUnique({
        where: {
          storeId_email: {
            storeId: input.storeId,
            email: input.email,
          },
        },
      })

      if (!subscriber) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Abonnement introuvable',
        })
      }

      // Verify token
      const storedToken = (subscriber.preferences as any)?.confirmationToken
      if (storedToken !== input.token) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Token de confirmation invalide',
        })
      }

      // Already confirmed
      if (subscriber.status === 'CONFIRMED') {
        return {
          success: true,
          message: 'Votre inscription était déjà confirmée',
        }
      }

      // Confirm subscription
      await ctx.prisma.newsletterSubscriber.update({
        where: { id: subscriber.id },
        data: {
          status: 'CONFIRMED',
          confirmedAt: new Date(),
          preferences: null, // Clear confirmation token
        },
      })

      // Send welcome email
      try {
        await emailService.sendEmail({
          to: input.email,
          subject: 'Bienvenue dans notre newsletter !',
          template: 'NewsletterWelcome',
          props: {
            firstName: subscriber.firstName || 'Cher abonné',
          },
          storeId: input.storeId,
          trackingEnabled: true,
        })
      } catch (error) {
        console.error('Failed to send welcome email:', error)
      }

      return {
        success: true,
        message: 'Votre inscription est confirmée !',
      }
    }),

  // Public: Unsubscribe
  unsubscribe: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
        email: z.string().email(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const subscriber = await ctx.prisma.newsletterSubscriber.findUnique({
        where: {
          storeId_email: {
            storeId: input.storeId,
            email: input.email,
          },
        },
      })

      if (!subscriber) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Abonnement introuvable',
        })
      }

      await ctx.prisma.newsletterSubscriber.update({
        where: { id: subscriber.id },
        data: {
          status: 'UNSUBSCRIBED',
          unsubscribedAt: new Date(),
          unsubscribeReason: input.reason,
        },
      })

      return {
        success: true,
        message: 'Vous êtes désinscrit de notre newsletter',
      }
    }),

  // Admin: Get all subscribers
  getSubscribers: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        status: z.enum(['PENDING', 'CONFIRMED', 'UNSUBSCRIBED']).optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        storeId: input.storeId,
      }

      if (input.status) {
        where.status = input.status
      }

      if (input.search) {
        where.OR = [
          { email: { contains: input.search, mode: 'insensitive' } },
          { firstName: { contains: input.search, mode: 'insensitive' } },
          { lastName: { contains: input.search, mode: 'insensitive' } },
        ]
      }

      const [subscribers, total] = await Promise.all([
        ctx.prisma.newsletterSubscriber.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.newsletterSubscriber.count({ where }),
      ])

      return {
        subscribers,
        total,
        hasMore: input.offset + input.limit < total,
      }
    }),

  // Admin: Get subscriber stats
  getStats: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const [total, confirmed, pending, unsubscribed, thisMonth] = await Promise.all([
        ctx.prisma.newsletterSubscriber.count({
          where: { storeId: input.storeId },
        }),
        ctx.prisma.newsletterSubscriber.count({
          where: { storeId: input.storeId, status: 'CONFIRMED' },
        }),
        ctx.prisma.newsletterSubscriber.count({
          where: { storeId: input.storeId, status: 'PENDING' },
        }),
        ctx.prisma.newsletterSubscriber.count({
          where: { storeId: input.storeId, status: 'UNSUBSCRIBED' },
        }),
        ctx.prisma.newsletterSubscriber.count({
          where: {
            storeId: input.storeId,
            status: 'CONFIRMED',
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
      ])

      return {
        total,
        confirmed,
        pending,
        unsubscribed,
        thisMonth,
        confirmationRate: total > 0 ? Math.round((confirmed / total) * 100) : 0,
      }
    }),

  // Admin: Update subscriber
  updateSubscriber: adminProcedure
    .input(
      z.object({
        id: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      const subscriber = await ctx.prisma.newsletterSubscriber.update({
        where: { id },
        data,
      })

      return subscriber
    }),

  // Admin: Delete subscriber
  deleteSubscriber: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.newsletterSubscriber.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // Admin: Send campaign to all confirmed subscribers
  sendCampaign: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        subject: z.string(),
        templateId: z.string().optional(), // Custom template ID
        htmlContent: z.string().optional(), // Or direct HTML
        tags: z.array(z.string()).optional(), // Send to specific segments
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get confirmed subscribers
      const where: any = {
        storeId: input.storeId,
        status: 'CONFIRMED',
      }

      if (input.tags && input.tags.length > 0) {
        where.tags = {
          hasSome: input.tags,
        }
      }

      const subscribers = await ctx.prisma.newsletterSubscriber.findMany({
        where,
      })

      if (subscribers.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Aucun abonné confirmé à qui envoyer la campagne',
        })
      }

      // Send emails asynchronously (don't block the response)
      const sendPromises = subscribers.map(async (subscriber) => {
        try {
          await emailService.sendEmail({
            to: subscriber.email,
            subject: input.subject,
            template: 'NewsletterCampaign',
            props: {
              firstName: subscriber.firstName || 'Cher abonné',
              htmlContent: input.htmlContent || '',
              unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}&storeId=${input.storeId}`,
            },
            storeId: input.storeId,
            trackingEnabled: true,
          })
        } catch (error) {
          console.error(`Failed to send campaign to ${subscriber.email}:`, error)
        }
      })

      // Don't await all sends, just trigger them
      Promise.all(sendPromises).catch((error) => {
        console.error('Some campaign emails failed:', error)
      })

      return {
        success: true,
        message: `Campagne en cours d'envoi à ${subscribers.length} abonné(s)`,
        recipientCount: subscribers.length,
      }
    }),
})
