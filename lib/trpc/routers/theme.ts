import { z } from 'zod'
import { router, publicProcedure, adminProcedure, protectedProcedure } from '../trpc'
import { PERMISSIONS } from '@/lib/rbac/roles'
import { TRPCError } from '@trpc/server'
import { seedSystemThemes, hasSystemThemes, seedThemePresets, hasThemePresets } from '@/lib/themes/seed'
import { checkPermission } from '../permissions'
import { mergeThemeConfigs, extractOverrides, hasThemeUpdates, detectConflicts, mergeWithUpdates } from '@/lib/themes/merge'
import { systemThemes } from '@/lib/themes/presets'

export const themeRouter = router({
  // Get all themes for a store
  getAll: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.THEMES_VIEW)

      return ctx.prisma.theme.findMany({
        where: {
          storeId: input.storeId,
        },
        include: {
          components: {
            orderBy: {
              order: 'asc',
            },
          },
          sourcePreset: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    }),

  // Get active theme for a store
  getActive: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const activeTheme = await ctx.prisma.theme.findFirst({
        where: {
          storeId: input.storeId,
          isActive: true,
        },
        include: {
          components: {
            where: {
              isEnabled: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      })

      return activeTheme
    }),

  // Get a theme by ID
  getById: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.THEMES_VIEW)

      const theme = await ctx.prisma.theme.findUnique({
        where: { id: input.id },
        include: {
          components: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      })

      if (!theme || theme.storeId !== input.storeId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Theme not found',
        })
      }

      return theme
    }),

  // Create a new theme
  create: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        name: z.string().min(1),
        description: z.string().optional(),
        config: z.object({
          colors: z.object({
            primary: z.string().default('#3B82F6'),
            secondary: z.string().default('#10B981'),
            accent: z.string().default('#F59E0B'),
            background: z.string().default('#FFFFFF'),
            surface: z.string().default('#FAFAFA'),
            text: z.string().default('#111827'),
            textSecondary: z.string().default('#6B7280'),
            textMuted: z.string().default('#9CA3AF'),
            border: z.string().default('#E5E5E5'),
            borderLight: z.string().default('#F5F5F5'),
          }),
          fonts: z.object({
            heading: z.string().default('Inter'),
            body: z.string().default('Inter'),
          }),
          spacing: z.object({
            containerMaxWidth: z.string().default('1280px'),
            sectionPadding: z.string().default('4rem'),
          }),
          borderRadius: z.string().default('0.5rem'),
          shadows: z.object({
            sm: z.string().default('0 1px 2px 0 rgba(0, 0, 0, 0.05)'),
            md: z.string().default('0 4px 6px -1px rgba(0, 0, 0, 0.1)'),
            lg: z.string().default('0 10px 15px -3px rgba(0, 0, 0, 0.1)'),
            xl: z.string().default('0 20px 25px -5px rgba(0, 0, 0, 0.1)'),
          }).optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.THEMES_CREATE)

      const { storeId, ...data } = input

      return ctx.prisma.theme.create({
        data: {
          ...data,
          storeId,
        },
        include: {
          components: true,
        },
      })
    }),

  // Update a theme
  update: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        config: z
          .object({
            colors: z
              .object({
                primary: z.string(),
                secondary: z.string(),
                accent: z.string(),
                background: z.string(),
                surface: z.string(),
                text: z.string(),
                textSecondary: z.string(),
                textMuted: z.string(),
                border: z.string(),
                borderLight: z.string(),
              })
              .optional(),
            fonts: z
              .object({
                heading: z.string(),
                body: z.string(),
              })
              .optional(),
            spacing: z
              .object({
                containerMaxWidth: z.string(),
                sectionPadding: z.string(),
              })
              .optional(),
            borderRadius: z.string().optional(),
            shadows: z
              .object({
                sm: z.string(),
                md: z.string(),
                lg: z.string(),
                xl: z.string(),
              })
              .optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.THEMES_UPDATE)

      const { storeId, id, ...data } = input

      // Verify theme belongs to store
      const theme = await ctx.prisma.theme.findUnique({
        where: { id },
      })

      if (!theme || theme.storeId !== storeId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Theme not found',
        })
      }

      // Create history snapshot before updating
      await ctx.prisma.themeHistory.create({
        data: {
          themeId: id,
          name: theme.name,
          description: theme.description,
          config: theme.config || {},
          version: theme.version,
          changeDescription: 'Manual update via theme editor',
          changedBy: ctx.session?.user?.email || 'Unknown',
        },
      })

      return ctx.prisma.theme.update({
        where: { id },
        data,
        include: {
          components: true,
        },
      })
    }),

  // Delete a theme
  delete: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.THEMES_DELETE)

      const theme = await ctx.prisma.theme.findUnique({
        where: { id: input.id },
      })

      if (!theme || theme.storeId !== input.storeId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Theme not found',
        })
      }

      if (theme.isActive) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete active theme',
        })
      }

      if (theme.isSystem) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot delete system theme',
        })
      }

      return ctx.prisma.theme.delete({
        where: { id: input.id },
      })
    }),

  // Get theme history
  getHistory: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        themeId: z.string(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.THEMES_VIEW)

      // Verify theme belongs to store
      const theme = await ctx.prisma.theme.findUnique({
        where: { id: input.themeId },
      })

      if (!theme || theme.storeId !== input.storeId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Theme not found',
        })
      }

      return ctx.prisma.themeHistory.findMany({
        where: { themeId: input.themeId },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
      })
    }),

  // Restore theme from history
  restoreFromHistory: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        themeId: z.string(),
        historyId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.THEMES_UPDATE)

      // Verify theme belongs to store
      const theme = await ctx.prisma.theme.findUnique({
        where: { id: input.themeId },
      })

      if (!theme || theme.storeId !== input.storeId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Theme not found',
        })
      }

      // Get history record
      const history = await ctx.prisma.themeHistory.findUnique({
        where: { id: input.historyId },
      })

      if (!history || history.themeId !== input.themeId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'History record not found',
        })
      }

      // Create snapshot of current state before restoring
      await ctx.prisma.themeHistory.create({
        data: {
          themeId: input.themeId,
          name: theme.name,
          description: theme.description,
          config: theme.config || {},
          version: theme.version,
          changeDescription: 'Before restore to previous version',
          changedBy: ctx.session?.user?.email || 'Unknown',
        },
      })

      // Restore theme from history
      return ctx.prisma.theme.update({
        where: { id: input.themeId },
        data: {
          name: history.name,
          description: history.description,
          config: history.config || {},
        },
        include: {
          components: true,
        },
      })
    }),

  // Activate a theme
  activate: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.THEMES_ACTIVATE)

      const theme = await ctx.prisma.theme.findUnique({
        where: { id: input.id },
      })

      if (!theme || theme.storeId !== input.storeId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Theme not found',
        })
      }

      // Deactivate all other themes for this store
      await ctx.prisma.theme.updateMany({
        where: {
          storeId: input.storeId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      })

      // Activate the selected theme
      return ctx.prisma.theme.update({
        where: { id: input.id },
        data: {
          isActive: true,
        },
        include: {
          components: true,
        },
      })
    }),

  // Duplicate a theme
  duplicate: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        id: z.string(),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.THEMES_CREATE)

      const originalTheme = await ctx.prisma.theme.findUnique({
        where: { id: input.id },
        include: {
          components: true,
        },
      })

      if (!originalTheme || originalTheme.storeId !== input.storeId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Theme not found',
        })
      }

      const newTheme = await ctx.prisma.theme.create({
        data: {
          storeId: input.storeId,
          name: input.name || `${originalTheme.name} (copie)`,
          description: originalTheme.description,
          config: originalTheme.config as any,
          version: originalTheme.version,
          components: {
            create: originalTheme.components.map((component) => ({
              name: component.name,
              type: component.type,
              html: component.html,
              css: component.css,
              designJson: component.designJson as any,
              props: component.props as any,
              order: component.order,
              isEnabled: component.isEnabled,
            })),
          },
        },
        include: {
          components: true,
        },
      })

      return newTheme
    }),

  // Component operations
  createComponent: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        themeId: z.string(),
        name: z.string().min(1),
        type: z.string(),
        html: z.string().optional(),
        css: z.string().optional(),
        designJson: z.any().optional(),
        props: z.any().optional(),
        order: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.THEMES_UPDATE)

      const { storeId, themeId, ...componentData } = input

      // Verify theme belongs to store
      const theme = await ctx.prisma.theme.findUnique({
        where: { id: themeId },
      })

      if (!theme || theme.storeId !== storeId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Theme not found',
        })
      }

      return ctx.prisma.themeComponent.create({
        data: {
          ...componentData,
          themeId,
        },
      })
    }),

  updateComponent: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        id: z.string(),
        name: z.string().optional(),
        type: z.string().optional(),
        html: z.string().optional(),
        css: z.string().optional(),
        designJson: z.any().optional(),
        props: z.any().optional(),
        order: z.number().optional(),
        isEnabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.THEMES_UPDATE)

      const { storeId, id, ...data } = input

      // Verify component's theme belongs to store
      const component = await ctx.prisma.themeComponent.findUnique({
        where: { id },
        include: { theme: true },
      })

      if (!component || component.theme.storeId !== storeId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Component not found',
        })
      }

      return ctx.prisma.themeComponent.update({
        where: { id },
        data,
      })
    }),

  deleteComponent: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.THEMES_UPDATE)

      const component = await ctx.prisma.themeComponent.findUnique({
        where: { id: input.id },
        include: { theme: true },
      })

      if (!component || component.theme.storeId !== input.storeId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Component not found',
        })
      }

      return ctx.prisma.themeComponent.delete({
        where: { id: input.id },
      })
    }),

  // Seed system themes for a store
  seedSystemThemes: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check permissions
      await checkPermission(ctx, input.storeId, PERMISSIONS.THEMES_CREATE)

      // Check if system themes already exist
      const hasThemes = await hasSystemThemes(input.storeId, ctx.prisma)

      if (hasThemes) {
        return {
          success: true,
          message: 'Les thèmes système existent déjà',
          themes: await ctx.prisma.theme.findMany({
            where: {
              storeId: input.storeId,
              isSystem: true,
            },
            include: {
              components: true,
            },
          }),
        }
      }

      // Seed the themes
      const themes = await seedSystemThemes(input.storeId, ctx.prisma)

      return {
        success: true,
        message: `${themes.length} thèmes système créés avec succès`,
        themes,
      }
    }),

  // ============================================
  // THEME OVERRIDE & MERGE SYSTEM
  // ============================================

  // Check if a theme has updates available from its base theme
  checkForUpdates: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        themeId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.THEMES_VIEW)

      const theme = await ctx.prisma.theme.findUnique({
        where: { id: input.themeId },
        include: { sourcePreset: true },
      })

      if (!theme || theme.storeId !== input.storeId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Theme not found',
        })
      }

      // Check if theme is based on a system theme
      if (!theme.sourcePreset && !theme.isSystem) {
        return {
          hasUpdates: false,
          message: 'Theme is not based on a system theme',
        }
      }

      // Find the current version of the base theme
      const baseTheme = systemThemes.find(
        (t) => t.slug === theme.sourcePreset?.slug || (theme.isSystem && t.name === theme.name)
      )

      if (!baseTheme) {
        return {
          hasUpdates: false,
          message: 'Base theme not found',
        }
      }

      const baseThemeVersion = '1.0.0' // System themes don't have versions
      const hasUpdates = hasThemeUpdates(
        theme.baseThemeVersion || theme.version,
        baseThemeVersion
      )

      return {
        hasUpdates,
        currentVersion: theme.baseThemeVersion || theme.version,
        latestVersion: baseThemeVersion,
        baseThemeName: baseTheme.name,
      }
    }),

  // Merge base theme updates with user overrides
  mergeThemeUpdates: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        themeId: z.string(),
        acceptConflicts: z.enum(['base', 'user']).default('user'), // Which wins in conflicts
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.THEMES_UPDATE)

      const theme = await ctx.prisma.theme.findUnique({
        where: { id: input.themeId },
        include: { sourcePreset: true },
      })

      if (!theme || theme.storeId !== input.storeId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Theme not found',
        })
      }

      // Find the latest base theme
      const baseTheme = systemThemes.find(
        (t) => t.slug === theme.sourcePreset?.slug || (theme.isSystem && t.name === theme.name)
      )

      if (!baseTheme) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Base theme not found',
        })
      }

      const userOverrides = theme.overrides as any || {}
      const newBaseConfig = baseTheme.config

      // Detect conflicts
      const conflicts = detectConflicts(userOverrides, newBaseConfig)

      // Merge based on strategy
      let mergedConfig
      if (input.acceptConflicts === 'user') {
        // User overrides win
        mergedConfig = mergeThemeConfigs(newBaseConfig, userOverrides)
      } else {
        // Base theme wins - discard conflicting user overrides
        const nonConflictingOverrides: any = {}
        Object.entries(userOverrides).forEach(([category, values]) => {
          if (typeof values === 'object' && values !== null) {
            const filteredValues: any = {}
            Object.entries(values).forEach(([key, value]) => {
              if (!conflicts.includes(`${category}.${key}`)) {
                filteredValues[key] = value
              }
            })
            if (Object.keys(filteredValues).length > 0) {
              nonConflictingOverrides[category] = filteredValues
            }
          } else if (!conflicts.includes(category)) {
            nonConflictingOverrides[category] = values
          }
        })
        mergedConfig = mergeThemeConfigs(newBaseConfig, nonConflictingOverrides)
      }

      // Create history snapshot before updating
      await ctx.prisma.themeHistory.create({
        data: {
          themeId: input.themeId,
          name: theme.name,
          description: theme.description,
          config: theme.config || {},
          version: theme.version,
          changeDescription: `Merged updates from ${baseTheme.name} v1.0.0`,
          changedBy: ctx.session?.user?.email || 'System',
        },
      })

      // Update theme with merged config
      return ctx.prisma.theme.update({
        where: { id: input.themeId },
        data: {
          config: mergedConfig as any,
          baseThemeVersion: '1.0.0',
          version: '1.0.0',
        },
        include: {
          components: true,
        },
      })
    }),

  // Convert an existing theme to use the override system
  convertToOverrides: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        themeId: z.string(),
        baseThemeSlug: z.string(), // Which system theme to base it on
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.THEMES_UPDATE)

      const theme = await ctx.prisma.theme.findUnique({
        where: { id: input.themeId },
      })

      if (!theme || theme.storeId !== input.storeId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Theme not found',
        })
      }

      // Find the base theme
      const baseTheme = systemThemes.find((t) => t.slug === input.baseThemeSlug)

      if (!baseTheme) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Base theme not found',
        })
      }

      // Extract only the differences as overrides
      const currentConfig = theme.config as any
      const overrides = extractOverrides(baseTheme.config, currentConfig)

      // Find the preset ID for this base theme
      const preset = await ctx.prisma.themePreset.findUnique({
        where: { slug: input.baseThemeSlug },
      })

      // Update theme to use override system
      return ctx.prisma.theme.update({
        where: { id: input.themeId },
        data: {
          overrides: overrides as any,
          baseThemeVersion: '1.0.0',
          sourcePresetId: preset?.id,
        },
        include: {
          components: true,
          sourcePreset: true,
        },
      })
    }),

  // ============================================
  // MARKETPLACE ENDPOINTS
  // ============================================

  // Get all public theme presets
  getPresets: publicProcedure
    .input(
      z
        .object({
          tags: z.array(z.string()).optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        isPublic: true,
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

      return ctx.prisma.themePreset.findMany({
        where,
        orderBy: [{ installCount: 'desc' }, { rating: 'desc' }],
      })
    }),

  // Get a theme preset by ID or slug
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

      const preset = await ctx.prisma.themePreset.findUnique({
        where: input.id ? { id: input.id } : { slug: input.slug },
      })

      if (!preset) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Theme preset not found',
        })
      }

      return preset
    }),

  // Install a theme from a preset
  installFromPreset: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        presetId: z.string(),
        customName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.THEMES_CREATE)

      const preset = await ctx.prisma.themePreset.findUnique({
        where: { id: input.presetId },
      })

      if (!preset) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Theme preset not found',
        })
      }

      // Check if already installed
      const existingTheme = await ctx.prisma.theme.findFirst({
        where: {
          storeId: input.storeId,
          sourcePresetId: input.presetId,
        },
      })

      if (existingTheme) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Ce thème est déjà installé',
        })
      }

      // Create theme from preset
      const components = preset.components as any

      const theme = await ctx.prisma.theme.create({
        data: {
          storeId: input.storeId,
          name: input.customName || preset.name,
          description: preset.description,
          config: preset.config as any,
          version: preset.version,
          sourcePresetId: preset.id,
          components: {
            create: components.map((comp: any) => ({
              name: comp.name,
              type: comp.type,
              html: comp.html,
              css: comp.css,
              props: comp.props as any,
              order: comp.order,
              isEnabled: comp.isEnabled,
            })),
          },
        },
        include: {
          components: true,
        },
      })

      // Increment install count
      await ctx.prisma.themePreset.update({
        where: { id: preset.id },
        data: {
          installCount: {
            increment: 1,
          },
        },
      })

      return theme
    }),

  // Seed theme presets for marketplace (admin only)
  seedPresets: adminProcedure.mutation(async ({ ctx }) => {
    const hasPresets = await hasThemePresets(ctx.prisma)

    if (hasPresets) {
      return {
        success: true,
        message: 'Les presets existent déjà',
        presets: await ctx.prisma.themePreset.findMany({
          where: { isPublic: true },
        }),
      }
    }

    const presets = await seedThemePresets(ctx.prisma)

    return {
      success: true,
      message: `${presets.length} presets créés avec succès`,
      presets,
    }
  }),
})
