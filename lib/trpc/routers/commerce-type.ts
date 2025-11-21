import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { prisma } from '@/lib/prisma'
import { TRPCError } from '@trpc/server'
import {
  commerceTypeConfigs,
  commerceTypeLabels,
  commerceTypeIcons,
  validateProductAttributes
} from '@/lib/commerce-types'
import type { CommerceType } from '@/lib/commerce-types'

const CommerceTypeEnum = z.enum([
  'GENERAL',
  'FOOD',
  'ALCOHOL',
  'FASHION',
  'ELECTRONICS',
  'BEAUTY',
  'HOME',
  'SPORTS'
])

export const commerceTypeRouter = router({
  // Get all available commerce types
  getTypes: protectedProcedure.query(async () => {
    return Object.entries(commerceTypeConfigs).map(([key, config]) => ({
      type: key as CommerceType,
      label: commerceTypeLabels[key as CommerceType],
      icon: commerceTypeIcons[key as CommerceType],
      config
    }))
  }),

  // Get commerce type configuration
  getConfig: protectedProcedure
    .input(z.object({
      type: CommerceTypeEnum
    }))
    .query(async ({ input }) => {
      const config = commerceTypeConfigs[input.type]
      return {
        type: input.type,
        label: commerceTypeLabels[input.type],
        icon: commerceTypeIcons[input.type],
        config
      }
    }),

  // Get store's current commerce type
  getStoreType: protectedProcedure
    .input(z.object({
      storeId: z.string()
    }))
    .query(async ({ input }) => {
      const store = await prisma.store.findUnique({
        where: { id: input.storeId },
        select: {
          commerceType: true,
          commerceConfig: true
        }
      })

      if (!store) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Store not found'
        })
      }

      const type = store.commerceType as CommerceType
      return {
        type,
        label: commerceTypeLabels[type],
        icon: commerceTypeIcons[type],
        config: commerceTypeConfigs[type],
        storeConfig: store.commerceConfig
      }
    }),

  // Update store's commerce type
  updateStoreType: protectedProcedure
    .input(z.object({
      storeId: z.string(),
      commerceType: CommerceTypeEnum,
      commerceConfig: z.record(z.string(), z.unknown()).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const store = await prisma.store.findFirst({
        where: {
          id: input.storeId,
          ownerId: ctx.session.user.id
        }
      })

      if (!store) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this store'
        })
      }

      // Update store
      const updated = await prisma.store.update({
        where: { id: input.storeId },
        data: {
          commerceType: input.commerceType,
          commerceConfig: input.commerceConfig as any || null
        }
      })

      return {
        success: true,
        store: updated
      }
    }),

  // Validate product attributes for commerce type
  validateAttributes: protectedProcedure
    .input(z.object({
      storeId: z.string(),
      attributes: z.record(z.string(), z.unknown())
    }))
    .mutation(async ({ input }) => {
      const store = await prisma.store.findUnique({
        where: { id: input.storeId },
        select: { commerceType: true }
      })

      if (!store) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Store not found'
        })
      }

      return validateProductAttributes(
        store.commerceType as CommerceType,
        input.attributes
      )
    }),

  // Get default categories for commerce type
  getDefaultCategories: protectedProcedure
    .input(z.object({
      type: CommerceTypeEnum
    }))
    .query(async ({ input }) => {
      const config = commerceTypeConfigs[input.type]
      return config.defaultCategories
    }),

  // Create default categories for a store based on its commerce type
  createDefaultCategories: protectedProcedure
    .input(z.object({
      storeId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const store = await prisma.store.findFirst({
        where: {
          id: input.storeId,
          ownerId: ctx.session.user.id
        },
        select: {
          commerceType: true
        }
      })

      if (!store) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to modify this store'
        })
      }

      const config = commerceTypeConfigs[store.commerceType as CommerceType]

      // Create categories
      const categories = await Promise.all(
        config.defaultCategories.map(async (name, index) => {
          const slug = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')

          return prisma.category.upsert({
            where: {
              storeId_slug: {
                storeId: input.storeId,
                slug
              }
            },
            create: {
              storeId: input.storeId,
              name,
              slug
            },
            update: {}
          })
        })
      )

      return {
        success: true,
        categories
      }
    }),

  // Get age verification status for store
  requiresAgeVerification: protectedProcedure
    .input(z.object({
      storeId: z.string()
    }))
    .query(async ({ input }) => {
      const store = await prisma.store.findUnique({
        where: { id: input.storeId },
        select: { commerceType: true }
      })

      if (!store) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Store not found'
        })
      }

      const config = commerceTypeConfigs[store.commerceType as CommerceType]

      return {
        required: config.ageVerification || false,
        minAge: config.minAge || null,
        regulations: config.regulations || []
      }
    }),

  // Get product form schema for commerce type
  getProductFormSchema: protectedProcedure
    .input(z.object({
      storeId: z.string()
    }))
    .query(async ({ input }) => {
      const store = await prisma.store.findUnique({
        where: { id: input.storeId },
        select: { commerceType: true }
      })

      if (!store) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Store not found'
        })
      }

      const type = store.commerceType as CommerceType
      const config = commerceTypeConfigs[type]

      return {
        type,
        label: commerceTypeLabels[type],
        requiredAttributes: config.requiredAttributes,
        optionalAttributes: config.optionalAttributes,
        displayOptions: config.displayOptions
      }
    })
})
