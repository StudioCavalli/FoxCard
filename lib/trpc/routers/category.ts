import { z } from 'zod'
import { router, publicProcedure, adminProcedure, requireStoreAccess } from '../trpc'
import { withCache } from '@/lib/cache'

export const categoryRouter = router({
  getAll: publicProcedure
    .input(
      z.object({
        storeId: z.string().optional(), // Make optional for "All Stores" mode
        parentId: z.string().optional().nullable(),
      })
    )
    .query(async ({ ctx, input }) => {
      const cacheKey = `categories:${input.storeId || 'all'}:${input.parentId ?? 'root'}`

      return withCache(cacheKey, 60_000, () =>
        ctx.prisma.category.findMany({
          where: {
            ...(input.storeId && { storeId: input.storeId }),
            ...(input.parentId !== undefined && { parentId: input.parentId }),
          },
          include: {
            children: true,
            store: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            _count: {
              select: { products: true },
            },
          },
          orderBy: {
            name: 'asc',
          },
        })
      )
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.category.findUnique({
        where: { id: input.id },
        include: {
          children: true,
          parent: true,
          _count: {
            select: { products: true },
          },
        },
      })
    }),

  getBySlug: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
        slug: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.category.findUnique({
        where: {
          storeId_slug: {
            storeId: input.storeId,
            slug: input.slug,
          },
        },
        include: {
          children: true,
          parent: true,
          _count: {
            select: { products: true },
          },
        },
      })
    }),

  create: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        image: z.string().optional(),
        parentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.category.create({
        data: input,
      })
    }),

  update: requireStoreAccess
    .input(
      z.object({
        id: z.string(),
        storeId: z.string(),
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        parentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, storeId, ...data } = input
      return ctx.prisma.category.update({
        where: { id, storeId },
        data,
      })
    }),

  delete: requireStoreAccess
    .input(z.object({ id: z.string(), storeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.category.delete({
        where: { id: input.id, storeId: input.storeId },
      })
    }),
})
