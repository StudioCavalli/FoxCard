import { z } from 'zod'
import { router, publicProcedure, protectedProcedure, requireStoreAccess } from '../trpc'

export const storeRouter = router({
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.store.findUnique({
        where: { slug: input.slug },
      })
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.store.findUnique({
        where: { id: input.id },
      })
    }),

  getUserStores: protectedProcedure.query(async ({ ctx }) => {
    // Get stores owned by the user
    const ownedStores = await ctx.prisma.store.findMany({
      where: {
        ownerId: ctx.session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Get stores where user is a member with ACTIVE status
    const memberStores = await ctx.prisma.storeUser.findMany({
      where: {
        userId: ctx.session.user.id,
        status: 'ACTIVE',
      },
      include: {
        store: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Combine and deduplicate stores
    const allStores = [
      ...ownedStores,
      ...memberStores.map(su => su.store),
    ]

    // Remove duplicates based on store ID
    const uniqueStores = allStores.filter((store, index, self) =>
      index === self.findIndex(s => s.id === store.id)
    )

    return uniqueStores.sort((a, b) =>
      b.createdAt.getTime() - a.createdAt.getTime()
    )
  }),

  getPublicStores: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.store.findMany({
      where: {
        // Add conditions for public visibility if needed
        // For now, return all stores for "All Stores" mode
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        description: true,
      },
      orderBy: { name: 'asc' },
    })
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        logo: z.string().optional(),
        domain: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.store.create({
        data: {
          ...input,
          ownerId: ctx.session.user.id,
        },
      })
    }),

  update: requireStoreAccess
    .input(
      z.object({
        storeId: z.string(),
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        logo: z.string().optional(),
        domain: z.string().optional(),
        settings: z.any().optional(),
        theme: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { storeId, ...data } = input
      return ctx.prisma.store.update({
        where: { id: storeId },
        data,
      })
    }),

  delete: requireStoreAccess
    .input(z.object({ storeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Only store owner can delete the store
      if (!(ctx as any).isStoreOwner) {
        throw new Error('Only the store owner can delete the store')
      }

      return ctx.prisma.store.delete({
        where: { id: input.storeId },
      })
    }),
})
