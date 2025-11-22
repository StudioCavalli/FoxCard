/**
 * Store Theme Presets by Commerce Type
 * Pre-configured themes optimized for each commerce type
 */

import { CommerceType } from '@/lib/commerce-types'

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  muted: string
  border: string
  success: string
  warning: string
  error: string
}

export interface ThemeTypography {
  fontFamily: string
  headingFont: string
  bodySize: string
  headingWeight: string
}

export interface ThemeLayout {
  productGridColumns: number
  heroStyle: 'full' | 'split' | 'minimal' | 'gallery' | 'video'
  headerStyle: 'standard' | 'centered' | 'minimal' | 'mega-menu'
  productCardStyle: 'standard' | 'minimal' | 'detailed' | 'immersive'
  categoryDisplay: 'grid' | 'list' | 'carousel' | 'sidebar'
}

export interface ThemeFeatures {
  showQuickView: boolean
  showWishlist: boolean
  showCompare: boolean
  showReviews: boolean
  showSizeGuide: boolean
  showNutritionInfo: boolean
  showAllergenFilters: boolean
  showAvailabilityCalendar: boolean
  showSpecsTable: boolean
  showColorSwatches: boolean
}

export interface ThemePreset {
  name: string
  description: string
  colors: {
    light: ThemeColors
    dark: ThemeColors
  }
  typography: ThemeTypography
  layout: ThemeLayout
  features: ThemeFeatures
  customCSS?: string
}

// Fashion Theme - Clean, minimal with large images
const fashionTheme: ThemePreset = {
  name: 'Fashion Elegance',
  description: 'Thème épuré et élégant pour la mode et les vêtements',
  colors: {
    light: {
      primary: '#1A1A1A',
      secondary: '#F5F5F5',
      accent: '#D4AF37',
      background: '#FFFFFF',
      text: '#1A1A1A',
      muted: '#6B7280',
      border: '#E5E5E5',
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    dark: {
      primary: '#FFFFFF',
      secondary: '#2D2D2D',
      accent: '#D4AF37',
      background: '#1A1A1A',
      text: '#FFFFFF',
      muted: '#9CA3AF',
      border: '#3D3D3D',
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    headingFont: 'Playfair Display, serif',
    bodySize: '16px',
    headingWeight: '500',
  },
  layout: {
    productGridColumns: 3,
    heroStyle: 'full',
    headerStyle: 'minimal',
    productCardStyle: 'minimal',
    categoryDisplay: 'grid',
  },
  features: {
    showQuickView: true,
    showWishlist: true,
    showCompare: false,
    showReviews: true,
    showSizeGuide: true,
    showNutritionInfo: false,
    showAllergenFilters: false,
    showAvailabilityCalendar: false,
    showSpecsTable: false,
    showColorSwatches: true,
  },
}

// Electronics Theme - Tech, modern with specs
const electronicsTheme: ThemePreset = {
  name: 'Tech Modern',
  description: 'Thème moderne et technique pour l\'électronique',
  colors: {
    light: {
      primary: '#0066CC',
      secondary: '#F3F4F6',
      accent: '#00D4FF',
      background: '#FFFFFF',
      text: '#111827',
      muted: '#6B7280',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    dark: {
      primary: '#3B82F6',
      secondary: '#1F2937',
      accent: '#00D4FF',
      background: '#111827',
      text: '#F9FAFB',
      muted: '#9CA3AF',
      border: '#374151',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    headingFont: 'Inter, system-ui, sans-serif',
    bodySize: '15px',
    headingWeight: '600',
  },
  layout: {
    productGridColumns: 4,
    heroStyle: 'split',
    headerStyle: 'mega-menu',
    productCardStyle: 'detailed',
    categoryDisplay: 'sidebar',
  },
  features: {
    showQuickView: true,
    showWishlist: true,
    showCompare: true,
    showReviews: true,
    showSizeGuide: false,
    showNutritionInfo: false,
    showAllergenFilters: false,
    showAvailabilityCalendar: false,
    showSpecsTable: true,
    showColorSwatches: true,
  },
}

// Food Theme - Warm, appetizing
const foodTheme: ThemePreset = {
  name: 'Fresh & Tasty',
  description: 'Thème chaleureux et appétissant pour l\'alimentation',
  colors: {
    light: {
      primary: '#EA580C',
      secondary: '#FEF3C7',
      accent: '#16A34A',
      background: '#FFFBEB',
      text: '#1C1917',
      muted: '#78716C',
      border: '#E7E5E4',
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#DC2626',
    },
    dark: {
      primary: '#FB923C',
      secondary: '#292524',
      accent: '#22C55E',
      background: '#1C1917',
      text: '#FAFAF9',
      muted: '#A8A29E',
      border: '#44403C',
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
    },
  },
  typography: {
    fontFamily: 'Nunito, sans-serif',
    headingFont: 'Merriweather, serif',
    bodySize: '16px',
    headingWeight: '700',
  },
  layout: {
    productGridColumns: 3,
    heroStyle: 'gallery',
    headerStyle: 'standard',
    productCardStyle: 'standard',
    categoryDisplay: 'carousel',
  },
  features: {
    showQuickView: true,
    showWishlist: false,
    showCompare: false,
    showReviews: true,
    showSizeGuide: false,
    showNutritionInfo: true,
    showAllergenFilters: true,
    showAvailabilityCalendar: false,
    showSpecsTable: false,
    showColorSwatches: false,
  },
}

// Beauty Theme - Elegant, soft
const beautyTheme: ThemePreset = {
  name: 'Beauty Glow',
  description: 'Thème élégant et doux pour les cosmétiques',
  colors: {
    light: {
      primary: '#DB2777',
      secondary: '#FDF2F8',
      accent: '#D4AF37',
      background: '#FFFFFF',
      text: '#1F2937',
      muted: '#6B7280',
      border: '#F3E8FF',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    dark: {
      primary: '#F472B6',
      secondary: '#1F1F1F',
      accent: '#D4AF37',
      background: '#0F0F0F',
      text: '#F9FAFB',
      muted: '#9CA3AF',
      border: '#2D2D2D',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
  },
  typography: {
    fontFamily: 'Lato, sans-serif',
    headingFont: 'Cormorant Garamond, serif',
    bodySize: '15px',
    headingWeight: '400',
  },
  layout: {
    productGridColumns: 3,
    heroStyle: 'full',
    headerStyle: 'centered',
    productCardStyle: 'immersive',
    categoryDisplay: 'grid',
  },
  features: {
    showQuickView: true,
    showWishlist: true,
    showCompare: false,
    showReviews: true,
    showSizeGuide: false,
    showNutritionInfo: false,
    showAllergenFilters: false,
    showAvailabilityCalendar: false,
    showSpecsTable: false,
    showColorSwatches: true,
  },
}

// Hotel Theme - Immersive, gallery-focused
const hotelTheme: ThemePreset = {
  name: 'Luxury Stay',
  description: 'Thème immersif avec galerie pour l\'hôtellerie',
  colors: {
    light: {
      primary: '#1E3A5F',
      secondary: '#F0F4F8',
      accent: '#D4AF37',
      background: '#FFFFFF',
      text: '#1E293B',
      muted: '#64748B',
      border: '#E2E8F0',
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
    },
    dark: {
      primary: '#60A5FA',
      secondary: '#1E293B',
      accent: '#D4AF37',
      background: '#0F172A',
      text: '#F8FAFC',
      muted: '#94A3B8',
      border: '#334155',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
  },
  typography: {
    fontFamily: 'Source Sans Pro, sans-serif',
    headingFont: 'Playfair Display, serif',
    bodySize: '16px',
    headingWeight: '600',
  },
  layout: {
    productGridColumns: 2,
    heroStyle: 'gallery',
    headerStyle: 'standard',
    productCardStyle: 'immersive',
    categoryDisplay: 'list',
  },
  features: {
    showQuickView: false,
    showWishlist: true,
    showCompare: false,
    showReviews: true,
    showSizeGuide: false,
    showNutritionInfo: false,
    showAllergenFilters: false,
    showAvailabilityCalendar: true,
    showSpecsTable: false,
    showColorSwatches: false,
  },
}

// Restaurant Theme - Menu style
const restaurantTheme: ThemePreset = {
  name: 'Gastro Menu',
  description: 'Thème style menu pour la restauration',
  colors: {
    light: {
      primary: '#991B1B',
      secondary: '#FEF2F2',
      accent: '#166534',
      background: '#FFFBF0',
      text: '#1C1917',
      muted: '#78716C',
      border: '#D6D3D1',
      success: '#16A34A',
      warning: '#CA8A04',
      error: '#DC2626',
    },
    dark: {
      primary: '#F87171',
      secondary: '#292524',
      accent: '#4ADE80',
      background: '#1C1917',
      text: '#FAFAF9',
      muted: '#A8A29E',
      border: '#44403C',
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
    },
  },
  typography: {
    fontFamily: 'Lora, serif',
    headingFont: 'Cormorant Garamond, serif',
    bodySize: '16px',
    headingWeight: '600',
  },
  layout: {
    productGridColumns: 2,
    heroStyle: 'minimal',
    headerStyle: 'centered',
    productCardStyle: 'standard',
    categoryDisplay: 'list',
  },
  features: {
    showQuickView: false,
    showWishlist: false,
    showCompare: false,
    showReviews: true,
    showSizeGuide: false,
    showNutritionInfo: true,
    showAllergenFilters: true,
    showAvailabilityCalendar: false,
    showSpecsTable: false,
    showColorSwatches: false,
  },
}

// Travel Theme - Adventure
const travelTheme: ThemePreset = {
  name: 'Voyage Adventure',
  description: 'Thème inspirant pour le voyage et les expériences',
  colors: {
    light: {
      primary: '#0891B2',
      secondary: '#ECFEFF',
      accent: '#F97316',
      background: '#FFFFFF',
      text: '#0F172A',
      muted: '#64748B',
      border: '#E2E8F0',
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
    },
    dark: {
      primary: '#22D3EE',
      secondary: '#164E63',
      accent: '#FB923C',
      background: '#0C4A6E',
      text: '#F0F9FF',
      muted: '#7DD3FC',
      border: '#0E7490',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
    headingFont: 'Montserrat, sans-serif',
    bodySize: '15px',
    headingWeight: '600',
  },
  layout: {
    productGridColumns: 3,
    heroStyle: 'video',
    headerStyle: 'standard',
    productCardStyle: 'immersive',
    categoryDisplay: 'carousel',
  },
  features: {
    showQuickView: false,
    showWishlist: true,
    showCompare: false,
    showReviews: true,
    showSizeGuide: false,
    showNutritionInfo: false,
    showAllergenFilters: false,
    showAvailabilityCalendar: true,
    showSpecsTable: false,
    showColorSwatches: false,
  },
}

// Recreation Theme - Fun, active
const recreationTheme: ThemePreset = {
  name: 'Active Fun',
  description: 'Thème dynamique pour les activités et loisirs',
  colors: {
    light: {
      primary: '#7C3AED',
      secondary: '#F5F3FF',
      accent: '#F59E0B',
      background: '#FFFFFF',
      text: '#1F2937',
      muted: '#6B7280',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    dark: {
      primary: '#A78BFA',
      secondary: '#1E1B4B',
      accent: '#FBBF24',
      background: '#0F0F23',
      text: '#F9FAFB',
      muted: '#9CA3AF',
      border: '#312E81',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
  },
  typography: {
    fontFamily: 'Rubik, sans-serif',
    headingFont: 'Rubik, sans-serif',
    bodySize: '16px',
    headingWeight: '700',
  },
  layout: {
    productGridColumns: 3,
    heroStyle: 'split',
    headerStyle: 'standard',
    productCardStyle: 'detailed',
    categoryDisplay: 'carousel',
  },
  features: {
    showQuickView: true,
    showWishlist: true,
    showCompare: false,
    showReviews: true,
    showSizeGuide: false,
    showNutritionInfo: false,
    showAllergenFilters: false,
    showAvailabilityCalendar: true,
    showSpecsTable: false,
    showColorSwatches: false,
  },
}

// Alcohol Theme - Sophisticated
const alcoholTheme: ThemePreset = {
  name: 'Wine Cellar',
  description: 'Thème sophistiqué pour les vins et spiritueux',
  colors: {
    light: {
      primary: '#7F1D1D',
      secondary: '#FEF2F2',
      accent: '#D4AF37',
      background: '#FFFBEB',
      text: '#1C1917',
      muted: '#78716C',
      border: '#E7E5E4',
      success: '#166534',
      warning: '#A16207',
      error: '#B91C1C',
    },
    dark: {
      primary: '#FCA5A5',
      secondary: '#292524',
      accent: '#D4AF37',
      background: '#1C1917',
      text: '#FAFAF9',
      muted: '#A8A29E',
      border: '#44403C',
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
    },
  },
  typography: {
    fontFamily: 'Crimson Text, serif',
    headingFont: 'Playfair Display, serif',
    bodySize: '16px',
    headingWeight: '600',
  },
  layout: {
    productGridColumns: 3,
    heroStyle: 'full',
    headerStyle: 'standard',
    productCardStyle: 'standard',
    categoryDisplay: 'grid',
  },
  features: {
    showQuickView: true,
    showWishlist: true,
    showCompare: false,
    showReviews: true,
    showSizeGuide: false,
    showNutritionInfo: false,
    showAllergenFilters: false,
    showAvailabilityCalendar: false,
    showSpecsTable: false,
    showColorSwatches: false,
  },
}

// General Theme - Default modern
const generalTheme: ThemePreset = {
  name: 'Modern Store',
  description: 'Thème moderne et polyvalent',
  colors: {
    light: {
      primary: '#4F46E5',
      secondary: '#F3F4F6',
      accent: '#10B981',
      background: '#FFFFFF',
      text: '#111827',
      muted: '#6B7280',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    dark: {
      primary: '#818CF8',
      secondary: '#1F2937',
      accent: '#34D399',
      background: '#111827',
      text: '#F9FAFB',
      muted: '#9CA3AF',
      border: '#374151',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    headingFont: 'Inter, system-ui, sans-serif',
    bodySize: '16px',
    headingWeight: '600',
  },
  layout: {
    productGridColumns: 4,
    heroStyle: 'split',
    headerStyle: 'standard',
    productCardStyle: 'standard',
    categoryDisplay: 'grid',
  },
  features: {
    showQuickView: true,
    showWishlist: true,
    showCompare: false,
    showReviews: true,
    showSizeGuide: false,
    showNutritionInfo: false,
    showAllergenFilters: false,
    showAvailabilityCalendar: false,
    showSpecsTable: false,
    showColorSwatches: true,
  },
}

/**
 * Theme presets mapping by commerce type
 */
export const COMMERCE_THEME_PRESETS: Record<CommerceType, ThemePreset> = {
  GENERAL: generalTheme,
  FASHION: fashionTheme,
  ELECTRONICS: electronicsTheme,
  FOOD: foodTheme,
  ALCOHOL: alcoholTheme,
  DIGITAL: generalTheme,
  SERVICES: generalTheme,
  HOTEL: hotelTheme,
  TRAVEL: travelTheme,
  RESTAURANT: restaurantTheme,
  RECREATION: recreationTheme,
  BEAUTY: beautyTheme,
  HOME: generalTheme,
  SPORTS: recreationTheme,
  TOYS: generalTheme,
  AUTOMOTIVE: electronicsTheme,
  BOOKS: generalTheme,
  PETS: foodTheme,
  SEASONAL: generalTheme,
}

/**
 * Get theme preset for a commerce type
 */
export function getThemePresetForCommerceType(commerceType: CommerceType): ThemePreset {
  return COMMERCE_THEME_PRESETS[commerceType] || generalTheme
}

/**
 * Get all available theme presets
 */
export function getAllThemePresets(): Array<{
  commerceType: CommerceType
  preset: ThemePreset
}> {
  return Object.entries(COMMERCE_THEME_PRESETS).map(([type, preset]) => ({
    commerceType: type as CommerceType,
    preset,
  }))
}

/**
 * Convert theme preset to store settings format
 */
export function themePresetToStoreSettings(preset: ThemePreset): {
  theme: Record<string, unknown>
  settings: Record<string, unknown>
} {
  return {
    theme: {
      name: preset.name,
      colors: preset.colors,
      typography: preset.typography,
      layout: preset.layout,
      customCSS: preset.customCSS || '',
    },
    settings: {
      features: preset.features,
    },
  }
}
