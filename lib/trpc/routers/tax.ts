import { z } from 'zod'
import { router, publicProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const taxRouter = router({
  // Get all tax rates for a store
  getAll: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.taxRate.findMany({
        where: {
          storeId: input.storeId,
        },
        orderBy: [
          { countryCode: 'asc' },
          { stateCode: 'asc' },
        ],
      })
    }),

  // Get tax rates by country
  getByCountry: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
        countryCode: z.string(),
        stateCode: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.taxRate.findMany({
        where: {
          storeId: input.storeId,
          countryCode: input.countryCode,
          stateCode: input.stateCode || null,
          isActive: true,
        },
        orderBy: {
          isDefault: 'desc',
        },
      })
    }),

  // Get a tax rate by ID
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.taxRate.findUnique({
        where: { id: input.id },
      })
    }),

  // Calculate tax for an order (public endpoint)
  calculateTax: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
        countryCode: z.string(),
        stateCode: z.string().optional(),
        amount: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Find applicable tax rate
      const taxRate = await ctx.prisma.taxRate.findFirst({
        where: {
          storeId: input.storeId,
          countryCode: input.countryCode,
          stateCode: input.stateCode || null,
          isActive: true,
        },
        orderBy: {
          isDefault: 'desc',
        },
      })

      if (!taxRate) {
        return {
          available: false,
          message: 'Aucun taux de taxe disponible pour ce pays',
          taxRate: null,
          taxAmount: 0,
          totalAmount: input.amount,
        }
      }

      // Calculate tax amount
      let taxAmount: number
      let totalAmount: number

      if (taxRate.includedInPrice) {
        // Tax is included in price (TTC)
        // To extract tax: tax = price - (price / (1 + rate/100))
        taxAmount = input.amount - (input.amount / (1 + taxRate.rate / 100))
        totalAmount = input.amount
      } else {
        // Tax is not included in price (HT)
        // To add tax: tax = price * (rate/100)
        taxAmount = input.amount * (taxRate.rate / 100)
        totalAmount = input.amount + taxAmount
      }

      return {
        available: true,
        message: null,
        taxRate: {
          id: taxRate.id,
          name: taxRate.name,
          countryCode: taxRate.countryCode,
          stateCode: taxRate.stateCode,
          rate: taxRate.rate,
          includedInPrice: taxRate.includedInPrice,
        },
        taxAmount: Number(taxAmount.toFixed(2)),
        totalAmount: Number(totalAmount.toFixed(2)),
      }
    }),

  // Create a new tax rate
  create: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        name: z.string().min(1),
        countryCode: z.string().length(2),
        stateCode: z.string().optional(),
        rate: z.number().min(0).max(100),
        includedInPrice: z.boolean().default(false),
        isActive: z.boolean().default(true),
        isDefault: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // If setting as default, unset other defaults for the same country/state
      if (input.isDefault) {
        await ctx.prisma.taxRate.updateMany({
          where: {
            storeId: input.storeId,
            countryCode: input.countryCode,
            stateCode: input.stateCode || null,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        })
      }

      return ctx.prisma.taxRate.create({
        data: input,
      })
    }),

  // Update a tax rate
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        countryCode: z.string().length(2).optional(),
        stateCode: z.string().optional(),
        rate: z.number().min(0).max(100).optional(),
        includedInPrice: z.boolean().optional(),
        isActive: z.boolean().optional(),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      // Get current tax rate to check if making it default
      if (data.isDefault) {
        const current = await ctx.prisma.taxRate.findUnique({
          where: { id },
        })

        if (current) {
          // Unset other defaults for the same country/state
          await ctx.prisma.taxRate.updateMany({
            where: {
              storeId: current.storeId,
              countryCode: data.countryCode || current.countryCode,
              stateCode: data.stateCode !== undefined ? data.stateCode : current.stateCode,
              isDefault: true,
              NOT: {
                id: id,
              },
            },
            data: {
              isDefault: false,
            },
          })
        }
      }

      return ctx.prisma.taxRate.update({
        where: { id },
        data,
      })
    }),

  // Delete a tax rate
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.taxRate.delete({
        where: { id: input.id },
      })
    }),

  // Bulk create tax rates (useful for initial setup)
  bulkCreate: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        rates: z.array(
          z.object({
            name: z.string().min(1),
            countryCode: z.string().length(2),
            stateCode: z.string().optional(),
            rate: z.number().min(0).max(100),
            includedInPrice: z.boolean().default(false),
            isActive: z.boolean().default(true),
            isDefault: z.boolean().default(false),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const createData = input.rates.map((rate) => ({
        storeId: input.storeId,
        ...rate,
      }))

      return ctx.prisma.taxRate.createMany({
        data: createData,
      })
    }),
})
