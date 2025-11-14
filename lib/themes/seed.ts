import { PrismaClient } from '@prisma/client'
import { systemThemes } from './presets'

/**
 * Seed system themes for a store
 */
export async function seedSystemThemes(storeId: string, prisma: PrismaClient) {
  const createdThemes = []

  for (const themeDefinition of systemThemes) {
    // Check if theme already exists
    const existingTheme = await prisma.theme.findFirst({
      where: {
        storeId,
        name: themeDefinition.name,
        isSystem: true,
      },
    })

    if (existingTheme) {
      console.log(`Theme ${themeDefinition.name} already exists for store ${storeId}`)
      createdThemes.push(existingTheme)
      continue
    }

    // Create theme with components
    const theme = await prisma.theme.create({
      data: {
        storeId,
        name: themeDefinition.name,
        description: themeDefinition.description,
        config: themeDefinition.config as any,
        isSystem: true,
        isActive: false,
        components: {
          create: themeDefinition.components.map((component) => ({
            name: component.name,
            type: component.type,
            html: component.html,
            css: component.css,
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

    console.log(`✓ Created theme: ${theme.name} with ${theme.components.length} components`)
    createdThemes.push(theme)
  }

  return createdThemes
}

/**
 * Check if system themes exist for a store
 */
export async function hasSystemThemes(storeId: string, prisma: PrismaClient): Promise<boolean> {
  const count = await prisma.theme.count({
    where: {
      storeId,
      isSystem: true,
    },
  })

  return count >= systemThemes.length
}

/**
 * Seed theme presets for marketplace
 */
export async function seedThemePresets(prisma: PrismaClient) {
  const createdPresets = []

  for (const themeDefinition of systemThemes) {
    // Check if preset already exists
    const existingPreset = await prisma.themePreset.findUnique({
      where: { slug: themeDefinition.slug },
    })

    if (existingPreset) {
      console.log(`Preset ${themeDefinition.name} already exists`)
      createdPresets.push(existingPreset)
      continue
    }

    // Create preset
    const preset = await prisma.themePreset.create({
      data: {
        name: themeDefinition.name,
        slug: themeDefinition.slug,
        description: themeDefinition.description,
        config: themeDefinition.config as any,
        components: themeDefinition.components as any,
        isPublic: true,
        isPremium: false,
        tags: [themeDefinition.slug, 'ecommerce', 'responsive'],
        author: 'FoxCard',
        version: '1.0.0',
      },
    })

    console.log(`✓ Created preset: ${preset.name}`)
    createdPresets.push(preset)
  }

  return createdPresets
}

/**
 * Check if theme presets exist
 */
export async function hasThemePresets(prisma: PrismaClient): Promise<boolean> {
  const count = await prisma.themePreset.count()
  return count >= systemThemes.length
}
