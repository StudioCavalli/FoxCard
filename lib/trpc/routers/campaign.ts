import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { sendCampaign, scheduleCampaign } from '@/lib/email/campaigns'

export const campaignRouter = router({
  // Get all campaigns for a store
  getAll: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        status: z.enum(['DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'CANCELLED']).optional(),
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

      const campaigns = await ctx.prisma.emailCampaign.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: input.limit,
        skip: input.offset,
      })

      const total = await ctx.prisma.emailCampaign.count({ where })

      return {
        campaigns,
        total,
        hasMore: input.offset + input.limit < total,
      }
    }),

  // Get a single campaign by ID
  getById: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const campaign = await ctx.prisma.emailCampaign.findUnique({
        where: { id: input.id },
      })

      if (!campaign) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Campaign not found',
        })
      }

      return campaign
    }),

  // Create a new campaign
  create: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        name: z.string(),
        subject: z.string(),
        htmlBody: z.string(),
        textBody: z.string().optional(),
        fromName: z.string(),
        fromEmail: z.string().email(),
        replyTo: z.string().email().optional(),
        segmentTags: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const campaign = await ctx.prisma.emailCampaign.create({
        data: {
          storeId: input.storeId,
          name: input.name,
          subject: input.subject,
          htmlBody: input.htmlBody,
          textBody: input.textBody,
          fromName: input.fromName,
          fromEmail: input.fromEmail,
          replyTo: input.replyTo,
          segmentTags: input.segmentTags,
          status: 'DRAFT',
        },
      })

      return campaign
    }),

  // Update a campaign
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        subject: z.string().optional(),
        htmlBody: z.string().optional(),
        textBody: z.string().optional(),
        fromName: z.string().optional(),
        fromEmail: z.string().email().optional(),
        replyTo: z.string().email().optional(),
        segmentTags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      const campaign = await ctx.prisma.emailCampaign.findUnique({
        where: { id },
      })

      if (!campaign) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Campaign not found',
        })
      }

      // Only allow editing drafts
      if (campaign.status !== 'DRAFT') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Can only edit campaigns in DRAFT status',
        })
      }

      const updated = await ctx.prisma.emailCampaign.update({
        where: { id },
        data,
      })

      return updated
    }),

  // Delete a campaign
  delete: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const campaign = await ctx.prisma.emailCampaign.findUnique({
        where: { id: input.id },
      })

      if (!campaign) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Campaign not found',
        })
      }

      // Only allow deleting drafts
      if (campaign.status !== 'DRAFT' && campaign.status !== 'CANCELLED') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Can only delete campaigns in DRAFT or CANCELLED status',
        })
      }

      await ctx.prisma.emailCampaign.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // Send a campaign immediately
  send: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const campaign = await ctx.prisma.emailCampaign.findUnique({
        where: { id: input.id },
      })

      if (!campaign) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Campaign not found',
        })
      }

      if (campaign.status !== 'DRAFT' && campaign.status !== 'SCHEDULED') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Can only send campaigns in DRAFT or SCHEDULED status',
        })
      }

      try {
        const result = await sendCampaign(input.id)
        return result
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to send campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
        })
      }
    }),

  // Schedule a campaign
  schedule: adminProcedure
    .input(
      z.object({
        id: z.string(),
        scheduledAt: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await scheduleCampaign(input.id, input.scheduledAt)
        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to schedule campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
        })
      }
    }),

  // Cancel a scheduled campaign
  cancel: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const campaign = await ctx.prisma.emailCampaign.findUnique({
        where: { id: input.id },
      })

      if (!campaign) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Campaign not found',
        })
      }

      if (campaign.status !== 'SCHEDULED') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Can only cancel SCHEDULED campaigns',
        })
      }

      await ctx.prisma.emailCampaign.update({
        where: { id: input.id },
        data: {
          status: 'CANCELLED',
        },
      })

      return { success: true }
    }),

  // Duplicate a campaign
  duplicate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        newName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const campaign = await ctx.prisma.emailCampaign.findUnique({
        where: { id: input.id },
      })

      if (!campaign) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Campaign not found',
        })
      }

      const duplicated = await ctx.prisma.emailCampaign.create({
        data: {
          storeId: campaign.storeId,
          name: input.newName,
          subject: campaign.subject,
          htmlBody: campaign.htmlBody,
          textBody: campaign.textBody,
          fromName: campaign.fromName,
          fromEmail: campaign.fromEmail,
          replyTo: campaign.replyTo,
          segmentTags: campaign.segmentTags,
          status: 'DRAFT',
        },
      })

      return duplicated
    }),

  // Get campaign statistics
  getStats: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const campaigns = await ctx.prisma.emailCampaign.findMany({
        where: { storeId: input.storeId, status: 'SENT' },
      })

      const totalSent = campaigns.reduce((acc, c) => acc + c.sent, 0)
      const totalOpened = campaigns.reduce((acc, c) => acc + c.opened, 0)
      const totalClicked = campaigns.reduce((acc, c) => acc + c.clicked, 0)

      const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0
      const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0

      return {
        totalCampaigns: campaigns.length,
        totalSent,
        totalOpened,
        totalClicked,
        openRate: Math.round(openRate * 10) / 10,
        clickRate: Math.round(clickRate * 10) / 10,
      }
    }),
})
