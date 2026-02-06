import { z } from 'zod'
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../trpc'
import { ProductStatus, ProductType } from '@prisma/client'
import { createHookExecutor } from '@/lib/plugins/hook-executor'

export const productRouter = router({
  getAll: publicProcedure
    .input(
      z.object({
        storeId: z.string().optional(), // Make optional for "All Stores" mode
        categoryId: z.string().optional(),
        status: z.nativeEnum(ProductStatus).optional(),
        featured: z.boolean().optional(),
        search: z.string().optional(),
        tags: z.array(z.string()).optional(), // Filter by tags
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        sortBy: z.enum(['createdAt', 'price', 'name', 'featured']).optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
        countries: z.array(z.string()).optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { storeId, categoryId, status, featured, search, tags, minPrice, maxPrice, sortBy, sortOrder, countries, limit, cursor } = input

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
          ...(storeId && { storeId }), // Only filter by storeId if provided
          ...(categoryId && { categoryId }),
          // For public endpoint, only show active products unless status is explicitly provided
          status: status || ProductStatus.ACTIVE,
          // Only show products from active stores (not suspended, pending, or closed)
          store: {
            status: 'ACTIVE',
            ...(countries && countries.length > 0 && { countries: { hasSome: countries } }),
          },
          ...(featured !== undefined && { featured }),
          ...(tags && tags.length > 0 && {
            tags: {
              hasSome: tags, // Match products that have any of the specified tags
            },
          }),
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
          store: { // Include store info for "All Stores" mode
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
            },
          },
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
        storeId: z.string().optional(), // Optional for "All Stores" mode
        slug: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // If storeId provided, use unique constraint (fast)
      if (input.storeId) {
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
            store: {
              select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
              },
            },
          },
        })
      }

      // If no storeId, find first matching slug across all stores
      return ctx.prisma.product.findFirst({
        where: {
          slug: input.slug,
          status: ProductStatus.ACTIVE, // Only active products in "all stores" mode
        },
        include: {
          category: true,
          variants: true,
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
            },
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
        tags: z.array(z.string()).default([]), // Product tags
        status: z.nativeEnum(ProductStatus),
        featured: z.boolean().default(false),
        categoryId: z.string().optional(),
        attributes: z.record(z.string(), z.unknown()).optional(), // Commerce type specific attributes
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { attributes, ...productData } = input
      const product = await ctx.prisma.product.create({
        data: {
          ...productData,
          attributes: attributes ? JSON.parse(JSON.stringify(attributes)) : undefined,
        },
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
        tags: z.array(z.string()).optional(), // Product tags
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

  // ============================================
  // PRODUCT VARIANTS CRUD
  // ============================================

  // Create a product variant
  createVariant: adminProcedure
    .input(
      z.object({
        productId: z.string(),
        name: z.string().min(1),
        sku: z.string().optional(),
        price: z.number().min(0).optional(),
        quantity: z.number().int().min(0).default(0),
        image: z.string().optional(),
        options: z.record(z.string(), z.any()), // e.g., { color: "red", size: "L" }
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify product exists
      const product = await ctx.prisma.product.findUnique({
        where: { id: input.productId },
      })

      if (!product) {
        throw new Error('Product not found')
      }

      const variant = await ctx.prisma.productVariant.create({
        data: {
          productId: input.productId,
          name: input.name,
          sku: input.sku,
          price: input.price,
          quantity: input.quantity,
          image: input.image,
          options: input.options as any,
        },
      })

      return variant
    }),

  // Update a product variant
  updateVariant: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        sku: z.string().optional(),
        price: z.number().min(0).optional(),
        quantity: z.number().int().min(0).optional(),
        image: z.string().optional(),
        options: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      const variant = await ctx.prisma.productVariant.update({
        where: { id },
        data: {
          ...data,
          ...(data.options && { options: data.options as any }),
        },
      })

      return variant
    }),

  // Delete a product variant
  deleteVariant: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const variant = await ctx.prisma.productVariant.delete({
        where: { id: input.id },
      })

      return variant
    }),

  // Update variant stock (for inventory management)
  updateVariantStock: adminProcedure
    .input(
      z.object({
        id: z.string(),
        quantity: z.number().int().min(0),
        operation: z.enum(['set', 'increment', 'decrement']).default('set'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, quantity, operation } = input

      let updateData: any
      if (operation === 'set') {
        updateData = { quantity }
      } else if (operation === 'increment') {
        updateData = { quantity: { increment: quantity } }
      } else if (operation === 'decrement') {
        updateData = { quantity: { decrement: quantity } }
      }

      const variant = await ctx.prisma.productVariant.update({
        where: { id },
        data: updateData,
      })

      return variant
    }),

  // Bulk create/update variants for a product
  bulkUpsertVariants: adminProcedure
    .input(
      z.object({
        productId: z.string(),
        variants: z.array(
          z.object({
            id: z.string().optional(), // If provided, update; otherwise create
            name: z.string().min(1),
            sku: z.string().optional(),
            price: z.number().min(0).optional(),
            quantity: z.number().int().min(0).default(0),
            image: z.string().optional(),
            options: z.record(z.string(), z.any()),
          })
        ),
        deleteExisting: z.boolean().default(false), // Delete variants not in the list
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { productId, variants, deleteExisting } = input

      // Verify product exists
      const product = await ctx.prisma.product.findUnique({
        where: { id: productId },
      })

      if (!product) {
        throw new Error('Product not found')
      }

      // Get existing variants
      const existingVariants = await ctx.prisma.productVariant.findMany({
        where: { productId },
      })

      const existingIds = new Set(existingVariants.map((v) => v.id))
      const inputIds = new Set(variants.filter((v) => v.id).map((v) => v.id!))

      // Determine what to create, update, and delete
      const toCreate = variants.filter((v) => !v.id)
      const toUpdate = variants.filter((v) => v.id && existingIds.has(v.id))
      const toDelete = deleteExisting
        ? existingVariants.filter((v) => !inputIds.has(v.id))
        : []

      // Execute all operations in a transaction
      await ctx.prisma.$transaction(async (tx) => {
        // Delete old variants
        if (toDelete.length > 0) {
          await tx.productVariant.deleteMany({
            where: {
              id: { in: toDelete.map((v) => v.id) },
            },
          })
        }

        // Create new variants
        if (toCreate.length > 0) {
          await tx.productVariant.createMany({
            data: toCreate.map((v) => ({
              productId,
              name: v.name,
              sku: v.sku,
              price: v.price,
              quantity: v.quantity,
              image: v.image,
              options: v.options as any,
            })),
          })
        }

        // Update existing variants
        for (const variant of toUpdate) {
          await tx.productVariant.update({
            where: { id: variant.id! },
            data: {
              name: variant.name,
              sku: variant.sku,
              price: variant.price,
              quantity: variant.quantity,
              image: variant.image,
              options: variant.options as any,
            },
          })
        }
      })

      // Return updated variants
      const updatedVariants = await ctx.prisma.productVariant.findMany({
        where: { productId },
        orderBy: { createdAt: 'asc' },
      })

      return {
        created: toCreate.length,
        updated: toUpdate.length,
        deleted: toDelete.length,
        variants: updatedVariants,
      }
    }),

  // Get variants for a product
  getProductVariants: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const variants = await ctx.prisma.productVariant.findMany({
        where: { productId: input.productId },
        orderBy: { createdAt: 'asc' },
      })

      return variants
    }),

  // Delete all variants for a product
  deleteAllVariants: adminProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.productVariant.deleteMany({
        where: { productId: input.productId },
      })

      return { deleted: result.count }
    }),
})
