import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { WebhookEventType } from '@/lib/webhooks/types'
import { TRPCError } from '@trpc/server'
import crypto from 'crypto'

const webhookEventTypeEnum = z.enum([
  'order.created',
  'order.updated',
  'order.completed',
  'order.cancelled',
  'product.created',
  'product.updated',
  'product.deleted',
  'customer.created',
  'payment.succeeded',
  'payment.failed',
])

export const webhookRouter = router({
  // List all webhooks for a store
  list: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const webhooks = await ctx.prisma.webhook.findMany({
        where: {
          storeId: input.storeId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return webhooks
    }),

  // Get a single webhook
  getById: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const webhook = await ctx.prisma.webhook.findUnique({
        where: {
          id: input.id,
        },
      })

      if (!webhook) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Webhook not found',
        })
      }

      return webhook
    }),

  // Create a webhook
  create: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        url: z.string().url(),
        events: z.array(webhookEventTypeEnum).min(1),
        enabled: z.boolean().default(true),
        headers: z.record(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate a secret for the webhook
      const secret = crypto.randomBytes(32).toString('hex')

      const webhook = await ctx.prisma.webhook.create({
        data: {
          storeId: input.storeId,
          url: input.url,
          events: input.events,
          secret,
          enabled: input.enabled,
          headers: input.headers || {},
        },
      })

      return webhook
    }),

  // Update a webhook
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        url: z.string().url().optional(),
        events: z.array(webhookEventTypeEnum).min(1).optional(),
        enabled: z.boolean().optional(),
        headers: z.record(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      const webhook = await ctx.prisma.webhook.update({
        where: {
          id,
        },
        data,
      })

      return webhook
    }),

  // Delete a webhook
  delete: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.webhook.delete({
        where: {
          id: input.id,
        },
      })

      return { success: true }
    }),

  // Regenerate webhook secret
  regenerateSecret: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newSecret = crypto.randomBytes(32).toString('hex')

      const webhook = await ctx.prisma.webhook.update({
        where: {
          id: input.id,
        },
        data: {
          secret: newSecret,
        },
      })

      return webhook
    }),

  // Test a webhook by sending a test payload
  test: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const webhook = await ctx.prisma.webhook.findUnique({
        where: {
          id: input.id,
        },
      })

      if (!webhook) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Webhook not found',
        })
      }

      // Create a test payload
      const testPayload = {
        event: 'order.created' as WebhookEventType,
        timestamp: new Date().toISOString(),
        data: {
          orderId: 'test-order-123',
          orderNumber: 'TEST-001',
          total: 99.99,
          status: 'PENDING',
        },
        storeId: webhook.storeId,
      }

      // Generate signature
      const payloadString = JSON.stringify(testPayload)
      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(payloadString)
        .digest('hex')

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': testPayload.event,
        'X-Webhook-ID': webhook.id,
        'X-Webhook-Timestamp': testPayload.timestamp,
        'X-Webhook-Test': 'true',
        ...(webhook.headers as Record<string, string>),
      }

      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers,
          body: payloadString,
        })

        const responseText = await response.text()

        return {
          success: response.ok,
          statusCode: response.status,
          response: responseText,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to send test webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
        })
      }
    }),

  // Get webhook deliveries/logs
  getDeliveries: adminProcedure
    .input(
      z.object({
        webhookId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const deliveries = await ctx.prisma.webhookDelivery.findMany({
        where: {
          webhookId: input.webhookId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: input.limit,
        skip: input.offset,
      })

      const total = await ctx.prisma.webhookDelivery.count({
        where: {
          webhookId: input.webhookId,
        },
      })

      return {
        deliveries,
        total,
        hasMore: input.offset + input.limit < total,
      }
    }),
})
