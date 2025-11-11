import { z } from 'zod'
import { router, publicProcedure, adminProcedure } from '../trpc'

export const categoryRouter = router({
  getAll: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
        parentId: z.string().optional().nullable(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.category.findMany({
        where: {
          storeId: input.storeId,
          ...(input.parentId !== undefined && { parentId: input.parentId }),
        },
        include: {
          children: true,
          _count: {
            select: { products: true },
          },
        },
        orderBy: {
          name: 'asc',
        },
      })
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

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        parentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.prisma.category.update({
        where: { id },
        data,
      })
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.category.delete({
        where: { id: input.id },
      })
    }),
})
