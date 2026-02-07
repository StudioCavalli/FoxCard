import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '@/lib/trpc/trpc'
import { prisma } from '@/lib/prisma'
import { TRPCError } from '@trpc/server'

const storeLocationSchema = z.object({
  type: z.enum([
    'LEGAL_ADDRESS',
    'PHYSICAL_STORE',
    'PICKUP_POINT',
    'WAREHOUSE',
    'OFFICE',
    'SHOWROOM',
    'EVENT_LOCATION',
  ]),
  name: z.string().min(1),
  description: z.string().optional(),
  street: z.string().min(1),
  street2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().min(1),
  country: z.string().length(2).default('FR'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  contactName: z.string().optional(),
  openingHours: z.any().optional(),
  specialDates: z.any().optional(),
  isActive: z.boolean().default(true),
  isPrimary: z.boolean().default(false),
  isPublic: z.boolean().default(true),
  displayOrder: z.number().default(0),
  instructions: z.string().optional(),
  notes: z.string().optional(),
})

export const storeLocationRouter = router({
  // Get all locations for a store
  getByStore: publicProcedure
    .input(z.object({ storeId: z.string() }))
    .query(async ({ input }) => {
      return await prisma.storeLocation.findMany({
        where: { storeId: input.storeId },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
      })
    }),

  // Get public locations (for map display)
  getPublicLocations: publicProcedure
    .input(
      z.object({
        type: z
          .enum([
            'LEGAL_ADDRESS',
            'PHYSICAL_STORE',
            'PICKUP_POINT',
            'WAREHOUSE',
            'OFFICE',
            'SHOWROOM',
            'EVENT_LOCATION',
          ])
          .optional(),
        country: z.string().optional(),
        bounds: z
          .object({
            north: z.number(),
            south: z.number(),
            east: z.number(),
            west: z.number(),
          })
          .optional(),
      })
    )
    .query(async ({ input }) => {
      const where: any = {
        isActive: true,
        isPublic: true,
      }

      if (input.type) {
        where.type = input.type
      }

      if (input.country) {
        where.country = input.country
      }

      if (input.bounds) {
        where.latitude = {
          gte: input.bounds.south,
          lte: input.bounds.north,
        }
        where.longitude = {
          gte: input.bounds.west,
          lte: input.bounds.east,
        }
      }

      const locations = await prisma.storeLocation.findMany({
        where,
        include: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              tagline: true,
              rating: true,
              reviewsCount: true,
            },
          },
        },
      })

      return locations
    }),

  // Create location
  create: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        data: storeLocationSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify user owns the store or is admin
      const store = await prisma.store.findUnique({
        where: { id: input.storeId },
        select: { ownerId: true },
      })

      if (
        !store ||
        (store.ownerId !== ctx.session.user.id &&
          ctx.session.user.role !== 'SUPER_ADMIN')
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to create location for this store',
        })
      }

      // If isPrimary is true, unset other primary locations of the same type
      if (input.data.isPrimary) {
        await prisma.storeLocation.updateMany({
          where: {
            storeId: input.storeId,
            type: input.data.type,
            isPrimary: true,
          },
          data: { isPrimary: false },
        })
      }

      return await prisma.storeLocation.create({
        data: {
          ...input.data,
          storeId: input.storeId,
        },
      })
    }),

  // Update location
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: storeLocationSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const location = await prisma.storeLocation.findUnique({
        where: { id: input.id },
        include: { store: { select: { ownerId: true } } },
      })

      if (!location) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Location not found',
        })
      }

      if (
        location.store.ownerId !== ctx.session.user.id &&
        ctx.session.user.role !== 'SUPER_ADMIN'
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to update this location',
        })
      }

      // If isPrimary is being set to true, unset other primary locations
      if (input.data.isPrimary && input.data.type) {
        await prisma.storeLocation.updateMany({
          where: {
            storeId: location.storeId,
            type: input.data.type,
            isPrimary: true,
            id: { not: input.id },
          },
          data: { isPrimary: false },
        })
      }

      return await prisma.storeLocation.update({
        where: { id: input.id },
        data: input.data,
      })
    }),

  // Delete location
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const location = await prisma.storeLocation.findUnique({
        where: { id: input.id },
        include: { store: { select: { ownerId: true } } },
      })

      if (!location) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Location not found',
        })
      }

      if (
        location.store.ownerId !== ctx.session.user.id &&
        ctx.session.user.role !== 'SUPER_ADMIN'
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to delete this location',
        })
      }

      await prisma.storeLocation.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
