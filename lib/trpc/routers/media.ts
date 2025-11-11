import { z } from 'zod'
import { router, publicProcedure, adminProcedure } from '../trpc'
import { getUploadUrl, generateFileKey, deleteFromR2, PUBLIC_URL } from '@/lib/r2'
import { TRPCError } from '@trpc/server'

export const mediaRouter = router({
  // Get a presigned URL for direct upload to R2
  getUploadUrl: adminProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        folder: z.enum(['products', 'categories', 'store', 'users']).default('products'),
      })
    )
    .mutation(async ({ input }) => {
      // Generate unique key for the file
      const key = generateFileKey(input.filename, input.folder)

      // Get presigned URL for upload
      const uploadUrl = await getUploadUrl(key, input.contentType)

      // Return upload URL and file key
      return {
        uploadUrl,
        key,
        publicUrl: `${PUBLIC_URL}/${key}`,
      }
    }),

  // Delete a file from R2
  delete: adminProcedure
    .input(
      z.object({
        key: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await deleteFromR2(input.key)
        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete file',
        })
      }
    }),

  // Delete multiple files
  deleteMany: adminProcedure
    .input(
      z.object({
        keys: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await Promise.all(input.keys.map((key) => deleteFromR2(key)))
        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete files',
        })
      }
    }),
})
