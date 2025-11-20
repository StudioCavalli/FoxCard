import { z } from 'zod'
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../trpc'
import { PERMISSIONS } from '@/lib/rbac/roles'
import { TRPCError } from '@trpc/server'
import { checkPermission } from '../permissions'

export const pluginRouter = router({
  // Get all installed plugins for a store
  getAll: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.SETTINGS_VIEW)

      return ctx.prisma.plugin.findMany({
        where: {
          storeId: input.storeId,
        },
        include: {
          preset: {
            select: {
              name: true,
              slug: true,
              version: true,
            },
          },
        },
        orderBy: {
          installedAt: 'desc',
        },
      })
    }),

  // Get a plugin by ID
  getById: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.SETTINGS_VIEW)

      const plugin = await ctx.prisma.plugin.findUnique({
        where: { id: input.id },
        include: {
          preset: true,
        },
      })

      if (!plugin || plugin.storeId !== input.storeId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plugin not found',
        })
      }

      return plugin
    }),

  // Get enabled plugins for a store (for runtime)
  getEnabled: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
        type: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.plugin.findMany({
        where: {
          storeId: input.storeId,
          isEnabled: true,
          ...(input.type && { type: input.type as any }),
        },
        orderBy: {
          name: 'asc',
        },
      })
    }),

  // Update plugin configuration
  updateConfig: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        id: z.string(),
        config: z.record(z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.SETTINGS_UPDATE)

      const plugin = await ctx.prisma.plugin.findUnique({
        where: { id: input.id },
      })

      if (!plugin || plugin.storeId !== input.storeId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plugin not found',
        })
      }

      return ctx.prisma.plugin.update({
        where: { id: input.id },
        data: {
          config: input.config,
        },
      })
    }),

  // Enable a plugin
  enable: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.SETTINGS_UPDATE)

      const plugin = await ctx.prisma.plugin.findUnique({
        where: { id: input.id },
      })

      if (!plugin || plugin.storeId !== input.storeId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plugin not found',
        })
      }

      return ctx.prisma.plugin.update({
        where: { id: input.id },
        data: {
          isEnabled: true,
          enabledAt: new Date(),
        },
      })
    }),

  // Disable a plugin
  disable: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.SETTINGS_UPDATE)

      const plugin = await ctx.prisma.plugin.findUnique({
        where: { id: input.id },
      })

      if (!plugin || plugin.storeId !== input.storeId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plugin not found',
        })
      }

      return ctx.prisma.plugin.update({
        where: { id: input.id },
        data: {
          isEnabled: false,
          disabledAt: new Date(),
        },
      })
    }),

  // Uninstall a plugin
  uninstall: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.SETTINGS_UPDATE)

      const plugin = await ctx.prisma.plugin.findUnique({
        where: { id: input.id },
      })

      if (!plugin || plugin.storeId !== input.storeId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plugin not found',
        })
      }

      return ctx.prisma.plugin.delete({
        where: { id: input.id },
      })
    }),

  // ============================================
  // MARKETPLACE ENDPOINTS
  // ============================================

  // Get all public plugin presets
  getPresets: publicProcedure
    .input(
      z
        .object({
          type: z.string().optional(),
          category: z.string().optional(),
          tags: z.array(z.string()).optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        isPublic: true,
      }

      if (input?.type) {
        where.type = input.type
      }

      if (input?.category) {
        where.category = input.category
      }

      if (input?.tags && input.tags.length > 0) {
        where.tags = {
          hasSome: input.tags,
        }
      }

      if (input?.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { description: { contains: input.search, mode: 'insensitive' } },
        ]
      }

      return ctx.prisma.pluginPreset.findMany({
        where,
        orderBy: [{ installCount: 'desc' }, { rating: 'desc' }],
      })
    }),

  // Get a plugin preset by ID or slug
  getPresetById: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        slug: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!input.id && !input.slug) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Either id or slug must be provided',
        })
      }

      const preset = await ctx.prisma.pluginPreset.findUnique({
        where: input.id ? { id: input.id } : { slug: input.slug },
      })

      if (!preset) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plugin preset not found',
        })
      }

      return preset
    }),

  // Install a plugin from a preset
  installFromPreset: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        presetId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.SETTINGS_UPDATE)

      const preset = await ctx.prisma.pluginPreset.findUnique({
        where: { id: input.presetId },
      })

      if (!preset) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plugin preset not found',
        })
      }

      // Check if already installed
      const existingPlugin = await ctx.prisma.plugin.findFirst({
        where: {
          storeId: input.storeId,
          slug: preset.slug,
        },
      })

      if (existingPlugin) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Ce plugin est déjà installé',
        })
      }

      // Create plugin from preset
      const plugin = await ctx.prisma.plugin.create({
        data: {
          storeId: input.storeId,
          presetId: preset.id,
          name: preset.name,
          slug: preset.slug,
          description: preset.description,
          type: preset.type,
          category: preset.category,
          icon: preset.icon,
          version: preset.version,
          config: preset.config as any,
          isEnabled: true,
          installedAt: new Date(),
          enabledAt: new Date(),
        },
      })

      // Increment install count
      await ctx.prisma.pluginPreset.update({
        where: { id: preset.id },
        data: {
          installCount: {
            increment: 1,
          },
        },
      })

      return plugin
    }),

  // Seed plugin presets (admin only)
  seedPresets: adminProcedure.mutation(async ({ ctx }) => {
    const { seedPluginPresets, hasPluginPresets } = await import('@/lib/plugins/seed')

    const hasPresets = await hasPluginPresets(ctx.prisma)

    if (hasPresets) {
      return {
        success: true,
        message: 'Les plugins existent déjà',
        presets: await ctx.prisma.pluginPreset.findMany({
          where: { isPublic: true },
        }),
      }
    }

    const presets = await seedPluginPresets(ctx.prisma)

    return {
      success: true,
      message: `${presets.length} plugins créés avec succès`,
      presets,
    }
  }),
})
