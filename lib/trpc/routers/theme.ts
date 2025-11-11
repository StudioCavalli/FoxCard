import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { themeManager } from '@/lib/themes/manager'
import { defaultTheme } from '@/lib/themes/default'

export const themeRouter = router({
  // Get all available themes
  getAll: adminProcedure.query(() => {
    return themeManager.getAllThemes()
  }),

  // Get current theme for a store
  getCurrent: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const store = await ctx.prisma.store.findUnique({
        where: { id: input.storeId },
        select: { theme: true },
      })

      if (!store?.theme) {
        return defaultTheme
      }

      const themeSettings = store.theme as any
      const baseTheme = themeManager.getTheme(themeSettings.themeId || 'default')

      if (!baseTheme) {
        return defaultTheme
      }

      return themeManager.applyCustomizations(baseTheme, themeSettings)
    }),

  // Update theme settings for a store
  update: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        themeId: z.string(),
        customColors: z
          .object({
            primary: z.string().optional(),
            secondary: z.string().optional(),
            accent: z.string().optional(),
            background: z.string().optional(),
            foreground: z.string().optional(),
            muted: z.string().optional(),
            border: z.string().optional(),
            input: z.string().optional(),
            ring: z.string().optional(),
            success: z.string().optional(),
            warning: z.string().optional(),
            error: z.string().optional(),
          })
          .optional(),
        customTypography: z
          .object({
            fontFamily: z.string().optional(),
            headingFont: z.string().optional(),
          })
          .optional(),
        customCSS: z.string().optional(),
        darkMode: z.enum(['auto', 'light', 'dark']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { storeId, ...themeSettings } = input

      const store = await ctx.prisma.store.update({
        where: { id: storeId },
        data: {
          theme: themeSettings as any,
        },
      })

      return store
    }),

  // Reset theme to default
  reset: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const store = await ctx.prisma.store.update({
        where: { id: input.storeId },
        data: {
          theme: {
            themeId: 'default',
            darkMode: 'auto',
          } as any,
        },
      })

      return store
    }),

  // Preview theme with custom settings
  preview: adminProcedure
    .input(
      z.object({
        themeId: z.string(),
        customColors: z.record(z.string()).optional(),
      })
    )
    .query(({ input }) => {
      const theme = themeManager.getTheme(input.themeId)

      if (!theme) {
        return null
      }

      const settings = {
        themeId: input.themeId,
        customColors: input.customColors,
        darkMode: 'light' as const,
      }

      return themeManager.applyCustomizations(theme, settings)
    }),
})
