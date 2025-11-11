import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { emailService } from '@/lib/email/service'
import { TRPCError } from '@trpc/server'

export const emailRouter = router({
  // Get email logs for a store
  getLogs: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(['PENDING', 'SENDING', 'SENT', 'FAILED', 'BOUNCED']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        storeId: input.storeId,
      }

      if (input.status) {
        where.status = input.status
      }

      const logs = await ctx.prisma.emailLog.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: input.limit,
        skip: input.offset,
      })

      const total = await ctx.prisma.emailLog.count({ where })

      return {
        logs,
        total,
        hasMore: input.offset + input.limit < total,
      }
    }),

  // Get a single email log
  getLogById: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const log = await ctx.prisma.emailLog.findUnique({
        where: { id: input.id },
      })

      if (!log) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Email log not found',
        })
      }

      return log
    }),

  // Get email statistics
  getStats: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const [total, sent, failed, opened] = await Promise.all([
        ctx.prisma.emailLog.count({
          where: { storeId: input.storeId },
        }),
        ctx.prisma.emailLog.count({
          where: { storeId: input.storeId, status: 'SENT' },
        }),
        ctx.prisma.emailLog.count({
          where: { storeId: input.storeId, status: 'FAILED' },
        }),
        ctx.prisma.emailLog.count({
          where: { storeId: input.storeId, opened: true },
        }),
      ])

      const openRate = sent > 0 ? (opened / sent) * 100 : 0

      return {
        total,
        sent,
        failed,
        opened,
        openRate: Math.round(openRate * 10) / 10, // Round to 1 decimal
      }
    }),

  // Send test email
  sendTest: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        to: z.string().email(),
        template: z.enum(['OrderConfirmation', 'OrderStatusUpdate', 'WelcomeEmail', 'ResetPassword']),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Generate test data based on template
        const testData = generateTestData(input.template)

        const success = await emailService.sendEmail({
          to: input.to,
          subject: `[TEST] ${testData.subject}`,
          template: input.template,
          props: testData.props,
          storeId: input.storeId,
          trackingEnabled: false, // Disable tracking for test emails
        })

        if (!success) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to send test email',
          })
        }

        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to send test email: ${error instanceof Error ? error.message : 'Unknown error'}`,
        })
      }
    }),

  // Resend a failed email
  resend: adminProcedure
    .input(
      z.object({
        logId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const log = await ctx.prisma.emailLog.findUnique({
        where: { id: input.logId },
      })

      if (!log) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Email log not found',
        })
      }

      try {
        // Reset status and resend
        await ctx.prisma.emailLog.update({
          where: { id: input.logId },
          data: {
            status: 'PENDING',
            attempts: 0,
            error: null,
          },
        })

        // Note: In a real implementation, you'd need to queue this
        // or have a background job pick up PENDING emails
        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to resend email',
        })
      }
    }),
})

/**
 * Generate test data for different email templates
 */
function generateTestData(template: string): { subject: string; props: any } {
  switch (template) {
    case 'OrderConfirmation':
      return {
        subject: 'Confirmation de commande #TEST-001',
        props: {
          customerName: 'Jean Dupont',
          orderNumber: 'TEST-001',
          orderDate: new Date().toLocaleDateString('fr-FR'),
          items: [
            {
              name: 'Produit Test 1',
              variantName: 'Taille M',
              quantity: 2,
              price: 29.99,
              total: 59.98,
            },
            {
              name: 'Produit Test 2',
              quantity: 1,
              price: 19.99,
              total: 19.99,
            },
          ],
          subtotal: 79.97,
          shipping: 5.99,
          tax: 17.19,
          discount: 10.0,
          total: 93.15,
          shippingAddress: {
            address: '123 Rue de Test',
            city: 'Paris',
            postalCode: '75001',
            country: 'France',
          },
          trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/order-confirmation/TEST-001`,
        },
      }

    case 'OrderStatusUpdate':
      return {
        subject: 'Mise à jour de votre commande #TEST-001',
        props: {
          customerName: 'Jean Dupont',
          orderNumber: 'TEST-001',
          status: 'PROCESSING',
          statusMessage: 'Votre commande est en cours de préparation.',
          trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/order-confirmation/TEST-001`,
        },
      }

    case 'WelcomeEmail':
      return {
        subject: 'Bienvenue sur FoxCard !',
        props: {
          customerName: 'Jean Dupont',
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`,
        },
      }

    case 'ResetPassword':
      return {
        subject: 'Réinitialisation de votre mot de passe',
        props: {
          customerName: 'Jean Dupont',
          resetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=test-token`,
          expiresIn: '1 heure',
        },
      }

    default:
      return {
        subject: 'Email de test',
        props: {},
      }
  }
}
