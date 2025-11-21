import { z } from 'zod'
import { router, publicProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const shippingRouter = router({
  // Get all shipping zones for a store
  getAll: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.shippingZone.findMany({
        where: {
          storeId: input.storeId,
        },
        include: {
          rates: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    }),

  // Get a shipping zone by ID
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.shippingZone.findUnique({
        where: { id: input.id },
        include: {
          rates: true,
        },
      })
    }),

  // Calculate shipping for multiple stores (multi-store cart)
  calculateMultiStoreShipping: publicProcedure
    .input(
      z.object({
        items: z.array(z.object({
          storeId: z.string(),
          amount: z.number(),
        })),
        country: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const results = await Promise.all(
        input.items.map(async (item) => {
          // Find shipping zone that includes the country
          const shippingZone = await ctx.prisma.shippingZone.findFirst({
            where: {
              storeId: item.storeId,
              countries: {
                has: input.country,
              },
              isActive: true,
            },
            include: {
              rates: true,
            },
          })

          if (!shippingZone) {
            return {
              storeId: item.storeId,
              available: false,
              cost: 0,
              message: 'Aucune zone de livraison disponible',
            }
          }

          // Find applicable rate based on order amount
          const applicableRate = shippingZone.rates.find((rate) => {
            if (rate.minOrderAmount) {
              return item.amount >= rate.minOrderAmount
            }
            return true
          })

          if (!applicableRate) {
            return {
              storeId: item.storeId,
              available: false,
              cost: 0,
              message: 'Aucun tarif disponible',
            }
          }

          return {
            storeId: item.storeId,
            available: true,
            cost: applicableRate.price,
            message: null,
            estimatedDays: applicableRate.estimatedDays,
            rateName: applicableRate.name,
            zoneName: shippingZone.name,
          }
        })
      )

      const totalShipping = results.reduce((sum, r) => sum + r.cost, 0)

      return {
        byStore: results,
        total: totalShipping,
      }
    }),

  // Calculate shipping cost for an order (public endpoint)
  calculateShipping: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
        country: z.string(),
        orderAmount: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Find shipping zone that includes the country
      const shippingZone = await ctx.prisma.shippingZone.findFirst({
        where: {
          storeId: input.storeId,
          countries: {
            has: input.country,
          },
          isActive: true,
        },
        include: {
          rates: true,
        },
      })

      if (!shippingZone) {
        // Return null instead of throwing error
        // This allows the frontend to handle gracefully
        return {
          available: false,
          message: 'Aucune zone de livraison disponible pour ce pays',
          shippingZone: null,
          rate: null,
        }
      }

      // Find applicable rate based on order amount
      const applicableRate = shippingZone.rates.find((rate) => {
        if (rate.minOrderAmount) {
          return input.orderAmount >= rate.minOrderAmount
        }
        return true
      })

      if (!applicableRate) {
        return {
          available: false,
          message: 'Aucun tarif de livraison disponible',
          shippingZone: {
            id: shippingZone.id,
            name: shippingZone.name,
          },
          rate: null,
        }
      }

      return {
        available: true,
        message: null,
        shippingZone: {
          id: shippingZone.id,
          name: shippingZone.name,
        },
        rate: {
          id: applicableRate.id,
          name: applicableRate.name,
          price: applicableRate.price,
          estimatedDays: applicableRate.estimatedDays,
        },
      }
    }),

  // Create a new shipping zone
  create: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        name: z.string().min(1),
        countries: z.array(z.string()).min(1),
        isActive: z.boolean().default(true),
        rates: z.array(
          z.object({
            name: z.string().min(1),
            price: z.number().nonnegative(),
            minOrderAmount: z.number().nonnegative().optional(),
            estimatedDays: z.string().optional(),
          })
        ).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { rates, ...zoneData } = input

      return ctx.prisma.shippingZone.create({
        data: {
          ...zoneData,
          rates: {
            create: rates,
          },
        },
        include: {
          rates: true,
        },
      })
    }),

  // Update a shipping zone
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        countries: z.array(z.string()).min(1).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.prisma.shippingZone.update({
        where: { id },
        data,
        include: {
          rates: true,
        },
      })
    }),

  // Delete a shipping zone
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.shippingZone.delete({
        where: { id: input.id },
      })
    }),

  // Create a shipping rate for a zone
  createRate: adminProcedure
    .input(
      z.object({
        shippingZoneId: z.string(),
        name: z.string().min(1),
        price: z.number().nonnegative(),
        minOrderAmount: z.number().nonnegative().optional(),
        estimatedDays: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.shippingRate.create({
        data: input,
      })
    }),

  // Update a shipping rate
  updateRate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        price: z.number().nonnegative().optional(),
        minOrderAmount: z.number().nonnegative().optional(),
        estimatedDays: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.prisma.shippingRate.update({
        where: { id },
        data,
      })
    }),

  // Delete a shipping rate
  deleteRate: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.shippingRate.delete({
        where: { id: input.id },
      })
    }),
})
