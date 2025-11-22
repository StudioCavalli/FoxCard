import { z } from 'zod'
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../trpc'
import {
  createDigitalDownloadsForOrder,
  getCustomerDownloads,
  generateDownloadUrl,
  formatFileSize,
} from '@/lib/digital/download-manager'
import { DigitalDownloadStatus } from '@prisma/client'

export const digitalRouter = router({
  // ============================================
  // DIGITAL FILES MANAGEMENT (Admin)
  // ============================================

  /**
   * Get all digital files for a product
   */
  getProductFiles: adminProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const files = await ctx.prisma.digitalFile.findMany({
        where: { productId: input.productId },
        orderBy: { sortOrder: 'asc' },
      })

      return files.map((f) => ({
        ...f,
        formattedSize: formatFileSize(f.fileSize),
      }))
    }),

  /**
   * Create a digital file for a product
   */
  createFile: adminProcedure
    .input(
      z.object({
        productId: z.string(),
        name: z.string().min(1),
        fileName: z.string().min(1),
        fileUrl: z.string().url(),
        fileSize: z.number().min(1),
        mimeType: z.string().min(1),
        maxDownloads: z.number().min(1).optional(),
        expiryDays: z.number().min(1).optional(),
        licenseKey: z.string().optional(),
        licenseType: z.string().optional(),
        version: z.string().optional(),
        releaseNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get current max sort order
      const lastFile = await ctx.prisma.digitalFile.findFirst({
        where: { productId: input.productId },
        orderBy: { sortOrder: 'desc' },
      })

      const file = await ctx.prisma.digitalFile.create({
        data: {
          ...input,
          sortOrder: (lastFile?.sortOrder || 0) + 1,
        },
      })

      return file
    }),

  /**
   * Update a digital file
   */
  updateFile: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        fileName: z.string().min(1).optional(),
        fileUrl: z.string().url().optional(),
        fileSize: z.number().min(1).optional(),
        mimeType: z.string().min(1).optional(),
        maxDownloads: z.number().min(1).nullable().optional(),
        expiryDays: z.number().min(1).nullable().optional(),
        licenseKey: z.string().nullable().optional(),
        licenseType: z.string().nullable().optional(),
        version: z.string().nullable().optional(),
        releaseNotes: z.string().nullable().optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      const file = await ctx.prisma.digitalFile.update({
        where: { id },
        data,
      })

      return file
    }),

  /**
   * Delete a digital file
   */
  deleteFile: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.digitalFile.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  /**
   * Reorder digital files
   */
  reorderFiles: adminProcedure
    .input(
      z.object({
        productId: z.string(),
        fileIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updates = input.fileIds.map((id, index) =>
        ctx.prisma.digitalFile.update({
          where: { id },
          data: { sortOrder: index },
        })
      )

      await Promise.all(updates)

      return { success: true }
    }),

  // ============================================
  // DIGITAL DOWNLOADS (Admin)
  // ============================================

  /**
   * Get downloads for an order (Admin view)
   */
  getOrderDownloads: adminProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const downloads = await ctx.prisma.digitalDownload.findMany({
        where: { orderId: input.orderId },
        include: {
          file: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      return downloads.map((d) => ({
        id: d.id,
        fileName: d.file.name,
        fileSize: formatFileSize(d.file.fileSize),
        downloadCount: d.downloadCount,
        maxDownloads: d.maxDownloads,
        expiresAt: d.expiresAt,
        status: d.status,
        lastDownloadAt: d.lastDownloadAt,
        lastDownloadIp: d.lastDownloadIp,
        licenseKey: d.licenseKey,
        downloadUrl: generateDownloadUrl(d.token),
        createdAt: d.createdAt,
      }))
    }),

  /**
   * Manually create downloads for an order
   */
  createOrderDownloads: adminProcedure
    .input(
      z.object({
        orderId: z.string(),
        customerId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await createDigitalDownloadsForOrder(input.orderId, input.customerId)
      return { success: true }
    }),

  /**
   * Revoke a download
   */
  revokeDownload: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.digitalDownload.update({
        where: { id: input.id },
        data: { status: DigitalDownloadStatus.REVOKED },
      })

      return { success: true }
    }),

  /**
   * Reactivate a download
   */
  reactivateDownload: adminProcedure
    .input(
      z.object({
        id: z.string(),
        resetDownloadCount: z.boolean().default(false),
        extendExpiry: z.number().optional(), // Days to extend
      })
    )
    .mutation(async ({ ctx, input }) => {
      const download = await ctx.prisma.digitalDownload.findUnique({
        where: { id: input.id },
      })

      if (!download) {
        throw new Error('Download not found')
      }

      const updateData: Record<string, unknown> = {
        status: DigitalDownloadStatus.ACTIVE,
      }

      if (input.resetDownloadCount) {
        updateData.downloadCount = 0
      }

      if (input.extendExpiry && download.expiresAt) {
        updateData.expiresAt = new Date(
          download.expiresAt.getTime() + input.extendExpiry * 24 * 60 * 60 * 1000
        )
      }

      await ctx.prisma.digitalDownload.update({
        where: { id: input.id },
        data: updateData,
      })

      return { success: true }
    }),

  // ============================================
  // CUSTOMER DOWNLOADS (Public)
  // ============================================

  /**
   * Get customer's downloads by email
   */
  getMyDownloads: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      return getCustomerDownloads(input.email)
    }),

  /**
   * Get download info (for download page)
   */
  getDownloadInfo: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const download = await ctx.prisma.digitalDownload.findUnique({
        where: { token: input.token },
        include: {
          file: true,
          order: {
            select: {
              orderNumber: true,
              customerEmail: true,
              paymentStatus: true,
            },
          },
        },
      })

      if (!download) {
        return null
      }

      return {
        id: download.id,
        fileName: download.file.name,
        fileSize: formatFileSize(download.file.fileSize),
        mimeType: download.file.mimeType,
        downloadCount: download.downloadCount,
        maxDownloads: download.maxDownloads,
        downloadsRemaining:
          download.maxDownloads !== null
            ? download.maxDownloads - download.downloadCount
            : null,
        expiresAt: download.expiresAt,
        status: download.status,
        licenseKey: download.licenseKey,
        orderNumber: download.order.orderNumber,
        isPaid: download.order.paymentStatus === 'PAID',
        version: download.file.version,
        releaseNotes: download.file.releaseNotes,
      }
    }),
})
