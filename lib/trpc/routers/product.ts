import { z } from 'zod'
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../trpc'
import { ProductStatus, ProductType } from '@prisma/client'

export const productRouter = router({
  getAll: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
        categoryId: z.string().optional(),
        status: z.nativeEnum(ProductStatus).optional(),
        featured: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { storeId, categoryId, status, featured, limit, cursor } = input

      const products = await ctx.prisma.product.findMany({
        take: limit + 1,
        where: {
          storeId,
          ...(categoryId && { categoryId }),
          ...(status && { status }),
          ...(featured !== undefined && { featured }),
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          category: true,
          variants: true,
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (products.length > limit) {
        const nextItem = products.pop()
        nextCursor = nextItem!.id
      }

      return {
        products,
        nextCursor,
      }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.product.findUnique({
        where: { id: input.id },
        include: {
          category: true,
          variants: true,
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
      return ctx.prisma.product.findUnique({
        where: {
          storeId_slug: {
            storeId: input.storeId,
            slug: input.slug,
          },
        },
        include: {
          category: true,
          variants: true,
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
        price: z.number().min(0),
        compareAtPrice: z.number().min(0).optional(),
        cost: z.number().min(0).optional(),
        type: z.nativeEnum(ProductType),
        sku: z.string().optional(),
        barcode: z.string().optional(),
        trackInventory: z.boolean().default(true),
        quantity: z.number().int().min(0).default(0),
        lowStockThreshold: z.number().int().min(0).optional(),
        images: z.array(z.string()),
        thumbnail: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        status: z.nativeEnum(ProductStatus),
        featured: z.boolean().default(false),
        categoryId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.product.create({
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
        price: z.number().min(0).optional(),
        compareAtPrice: z.number().min(0).optional(),
        cost: z.number().min(0).optional(),
        type: z.nativeEnum(ProductType).optional(),
        sku: z.string().optional(),
        barcode: z.string().optional(),
        trackInventory: z.boolean().optional(),
        quantity: z.number().int().min(0).optional(),
        lowStockThreshold: z.number().int().min(0).optional(),
        images: z.array(z.string()).optional(),
        thumbnail: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        status: z.nativeEnum(ProductStatus).optional(),
        featured: z.boolean().optional(),
        categoryId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.prisma.product.update({
        where: { id },
        data,
      })
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.product.delete({
        where: { id: input.id },
      })
    }),
})
