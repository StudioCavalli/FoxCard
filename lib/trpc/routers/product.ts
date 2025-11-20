import { z } from 'zod'
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../trpc'
import { ProductStatus, ProductType } from '@prisma/client'
import { createHookExecutor } from '@/lib/plugins/hook-executor'

export const productRouter = router({
  getAll: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
        categoryId: z.string().optional(),
        status: z.nativeEnum(ProductStatus).optional(),
        featured: z.boolean().optional(),
        search: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        sortBy: z.enum(['createdAt', 'price', 'name', 'featured']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { storeId, categoryId, status, featured, search, minPrice, maxPrice, sortBy, sortOrder, limit, cursor } = input

      // Build orderBy based on sortBy and sortOrder
      const orderBy: any = []
      if (sortBy) {
        if (sortBy === 'featured') {
          orderBy.push({ featured: sortOrder || 'desc' })
          orderBy.push({ createdAt: 'desc' })
        } else {
          orderBy.push({ [sortBy]: sortOrder || 'desc' })
        }
      } else {
        orderBy.push({ createdAt: 'desc' })
      }

      const products = await ctx.prisma.product.findMany({
        take: limit + 1,
        where: {
          storeId,
          ...(categoryId && { categoryId }),
          ...(status && { status }),
          ...(featured !== undefined && { featured }),
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
            ],
          }),
          ...(minPrice !== undefined && {
            price: {
              gte: minPrice,
              ...(maxPrice !== undefined && { lte: maxPrice }),
            },
          }),
          ...(maxPrice !== undefined && minPrice === undefined && {
            price: {
              lte: maxPrice,
            },
          }),
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy,
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
      const product = await ctx.prisma.product.create({
        data: input,
      })

      // Execute plugin hooks (async, don't block response)
      const hookExecutor = createHookExecutor(ctx.prisma)
      hookExecutor.onProductCreated(input.storeId, {
        productId: product.id,
        name: product.name,
        price: product.price,
        sku: product.sku || '',
      }).catch((err) => {
        console.error('Failed to execute product created hooks:', err)
      })

      return product
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
      const product = await ctx.prisma.product.update({
        where: { id },
        data,
      })

      // Execute plugin hooks (async, don't block response)
      const hookExecutor = createHookExecutor(ctx.prisma)
      hookExecutor.onProductUpdated(product.storeId, {
        productId: product.id,
        name: product.name,
        changes: data,
      }).catch((err) => {
        console.error('Failed to execute product updated hooks:', err)
      })

      return product
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get product before deletion for hook data
      const product = await ctx.prisma.product.findUnique({
        where: { id: input.id },
      })

      if (!product) {
        throw new Error('Product not found')
      }

      await ctx.prisma.product.delete({
        where: { id: input.id },
      })

      // Execute plugin hooks (async, don't block response)
      const hookExecutor = createHookExecutor(ctx.prisma)
      hookExecutor.onProductDeleted(product.storeId, {
        productId: product.id,
        name: product.name,
      }).catch((err) => {
        console.error('Failed to execute product deleted hooks:', err)
      })

      return product
    }),
})
