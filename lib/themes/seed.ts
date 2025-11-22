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
 * Additional marketplace presets with more variety
 */
const marketplacePresets = [
  {
    name: 'Minimal',
    slug: 'minimal',
    description: 'Design épuré et intemporel. Typographie soignée, espacements généreux, focus absolu sur le produit.',
    config: systemThemes[0].config,
    tags: ['minimal', 'moderne', 'épuré', 'responsive', 'gratuit'],
    isPremium: false,
  },
  {
    name: 'Elegant',
    slug: 'elegant',
    description: 'Raffinement absolu et élégance intemporelle. Palette sophistiquée, détails dorés subtils, typographie classique.',
    config: systemThemes[1].config,
    tags: ['elegant', 'premium', 'élégant', 'bijouterie', 'mode', 'gratuit'],
    isPremium: false,
  },
  {
    name: 'Bold',
    slug: 'bold',
    description: 'Design audacieux et énergique. Couleurs vibrantes, contrastes marqués, typographie puissante.',
    config: systemThemes[2].config,
    tags: ['bold', 'moderne', 'sombre', 'startup', 'saas', 'gratuit'],
    isPremium: false,
  },
  {
    name: 'Nature',
    slug: 'nature',
    description: 'Thème inspiré de la nature avec des tons verts apaisants et organiques. Parfait pour les produits bio et écologiques.',
    config: {
      colors: {
        primary: '#2D5016',
        secondary: '#8BC34A',
        accent: '#FFC107',
        background: '#FAFFF5',
        surface: '#F1F8E9',
        text: '#1B3409',
        textSecondary: '#558B2F',
        textMuted: '#7CB342',
        border: '#C5E1A5',
        borderLight: '#DCEDC8',
      },
      fonts: {
        heading: 'Nunito',
        body: 'Open Sans',
      },
      spacing: {
        containerMaxWidth: '1280px',
        sectionPadding: '5rem',
      },
      borderRadius: '1rem',
      shadows: {
        sm: '0 1px 2px 0 rgba(45, 80, 22, 0.05)',
        md: '0 4px 6px -1px rgba(45, 80, 22, 0.1)',
        lg: '0 10px 15px -3px rgba(45, 80, 22, 0.1)',
        xl: '0 20px 25px -5px rgba(45, 80, 22, 0.1)',
      },
    },
    tags: ['nature', 'bio', 'écologique', 'vert', 'organique', 'gratuit'],
    isPremium: false,
  },
  {
    name: 'Océan',
    slug: 'ocean',
    description: 'Palette de bleus profonds évoquant l\'océan. Idéal pour les boutiques nautiques, voyages ou bien-être.',
    config: {
      colors: {
        primary: '#0277BD',
        secondary: '#4FC3F7',
        accent: '#FFB300',
        background: '#F5FCFF',
        surface: '#E1F5FE',
        text: '#01579B',
        textSecondary: '#0288D1',
        textMuted: '#4FC3F7',
        border: '#B3E5FC',
        borderLight: '#E1F5FE',
      },
      fonts: {
        heading: 'Montserrat',
        body: 'Open Sans',
      },
      spacing: {
        containerMaxWidth: '1360px',
        sectionPadding: '6rem',
      },
      borderRadius: '0.75rem',
      shadows: {
        sm: '0 1px 2px 0 rgba(2, 119, 189, 0.05)',
        md: '0 4px 6px -1px rgba(2, 119, 189, 0.1)',
        lg: '0 10px 15px -3px rgba(2, 119, 189, 0.1)',
        xl: '0 20px 25px -5px rgba(2, 119, 189, 0.1)',
      },
    },
    tags: ['océan', 'bleu', 'voyage', 'nautique', 'bien-être', 'gratuit'],
    isPremium: false,
  },
  {
    name: 'Vintage',
    slug: 'vintage',
    description: 'Style rétro avec des tons chauds sépia. Parfait pour les antiquités, livres anciens ou produits artisanaux.',
    config: {
      colors: {
        primary: '#5D4037',
        secondary: '#D7CCC8',
        accent: '#FF8F00',
        background: '#FFF8E1',
        surface: '#EFEBE9',
        text: '#3E2723',
        textSecondary: '#6D4C41',
        textMuted: '#8D6E63',
        border: '#BCAAA4',
        borderLight: '#D7CCC8',
      },
      fonts: {
        heading: 'Playfair Display',
        body: 'Lora',
      },
      spacing: {
        containerMaxWidth: '1200px',
        sectionPadding: '5rem',
      },
      borderRadius: '0.25rem',
      shadows: {
        sm: '0 1px 2px 0 rgba(93, 64, 55, 0.08)',
        md: '0 4px 6px -1px rgba(93, 64, 55, 0.12)',
        lg: '0 10px 15px -3px rgba(93, 64, 55, 0.15)',
        xl: '0 20px 25px -5px rgba(93, 64, 55, 0.18)',
      },
    },
    tags: ['vintage', 'rétro', 'classique', 'artisanal', 'antique', 'gratuit'],
    isPremium: false,
  },
  {
    name: 'Neon',
    slug: 'neon',
    description: 'Design audacieux avec des couleurs néon vibrantes sur fond sombre. Idéal pour les boutiques gaming ou streetwear.',
    config: {
      colors: {
        primary: '#E91E63',
        secondary: '#00E5FF',
        accent: '#FFEA00',
        background: '#121212',
        surface: '#1E1E1E',
        text: '#FFFFFF',
        textSecondary: '#B0BEC5',
        textMuted: '#78909C',
        border: '#424242',
        borderLight: '#616161',
      },
      fonts: {
        heading: 'Montserrat',
        body: 'Roboto',
      },
      spacing: {
        containerMaxWidth: '1440px',
        sectionPadding: '7rem',
      },
      borderRadius: '0.5rem',
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        md: '0 4px 6px -1px rgba(233, 30, 99, 0.2)',
        lg: '0 10px 15px -3px rgba(233, 30, 99, 0.25)',
        xl: '0 20px 25px -5px rgba(233, 30, 99, 0.3)',
      },
    },
    tags: ['neon', 'gaming', 'streetwear', 'sombre', 'audacieux', 'gratuit'],
    isPremium: false,
  },
  {
    name: 'Rose Gold',
    slug: 'rose-gold',
    description: 'Élégance féminine avec des tons rose et or. Parfait pour cosmétiques, bijoux et mode féminine.',
    config: {
      colors: {
        primary: '#B76E79',
        secondary: '#F8BBD9',
        accent: '#D4AF37',
        background: '#FFF9FA',
        surface: '#FCE4EC',
        text: '#880E4F',
        textSecondary: '#AD1457',
        textMuted: '#C2185B',
        border: '#F48FB1',
        borderLight: '#F8BBD9',
      },
      fonts: {
        heading: 'Playfair Display',
        body: 'Nunito',
      },
      spacing: {
        containerMaxWidth: '1320px',
        sectionPadding: '6rem',
      },
      borderRadius: '1rem',
      shadows: {
        sm: '0 1px 2px 0 rgba(183, 110, 121, 0.08)',
        md: '0 4px 6px -1px rgba(183, 110, 121, 0.12)',
        lg: '0 10px 15px -3px rgba(183, 110, 121, 0.15)',
        xl: '0 20px 25px -5px rgba(183, 110, 121, 0.18)',
      },
    },
    tags: ['rose-gold', 'féminin', 'cosmétique', 'bijoux', 'élégant', 'gratuit'],
    isPremium: false,
  },
]

/**
 * Seed theme presets for marketplace
 */
export async function seedThemePresets(prisma: PrismaClient) {
  const createdPresets = []

  for (const presetData of marketplacePresets) {
    // Check if preset already exists
    const existingPreset = await prisma.themePreset.findUnique({
      where: { slug: presetData.slug },
    })

    if (existingPreset) {
      console.log(`Preset ${presetData.name} already exists`)
      createdPresets.push(existingPreset)
      continue
    }

    // Create preset
    const preset = await prisma.themePreset.create({
      data: {
        name: presetData.name,
        slug: presetData.slug,
        description: presetData.description,
        config: presetData.config as any,
        components: [],
        isPublic: true,
        isPremium: presetData.isPremium,
        tags: presetData.tags,
        author: 'GoldenEra',
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
  return count >= marketplacePresets.length
}
