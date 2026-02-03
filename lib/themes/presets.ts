/**
 * Theme System - CSS Variables + Tailwind
 *
 * Themes define color palettes, typography, and styling that are injected
 * as CSS variables. All components use Tailwind classes (bg-theme-primary,
 * text-theme-text, etc.) which reference these variables.
 */

export interface ThemeColors {
  // Main colors
  primary: string
  secondary: string
  accent: string

  // Backgrounds
  background: string // Page background
  surface: string // Cards, modals, etc.

  // Text
  text: string // Primary text
  textSecondary: string // Secondary text
  textMuted: string // Muted/disabled text

  // Borders
  border: string // Default border
  borderLight: string // Light border
}

export interface ThemeFonts {
  heading: string // Font for headings
  body: string // Font for body text
}

export interface ThemeSpacing {
  containerMaxWidth: string
  sectionPadding: string
}

export interface ThemeShadows {
  sm: string
  md: string
  lg: string
  xl: string
}

export interface ThemeConfig {
  colors: ThemeColors
  fonts: ThemeFonts
  spacing: ThemeSpacing
  borderRadius: string
  shadows: ThemeShadows
}

export interface ThemeDefinition {
  name: string
  slug: string
  description: string
  preview?: string
  config: ThemeConfig
  components: any[] // Empty - kept for backwards compatibility
}

/**
 * MINIMAL THEME
 * Inspired by: Apple, Vercel, Linear
 * Clean, timeless design with generous spacing and subtle animations
 */
export const minimalTheme: ThemeDefinition = {
  name: 'GEM Minimal',
  slug: 'minimal',
  description: 'Design épuré Golden Era Marketplace. Typographie soignée, espacements généreux, couleurs or et noir élégantes.',
  config: {
    colors: {
      primary: '#A69F3C',
      secondary: '#1A1A1A',
      accent: '#C4B84D',
      background: '#FFFFFF',
      surface: '#FAFAF8',
      text: '#1A1A1A',
      textSecondary: '#4A4A4A',
      textMuted: '#8A8A8A',
      border: '#E5E5E0',
      borderLight: '#F5F5F2',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    spacing: {
      containerMaxWidth: '1440px',
      sectionPadding: '8rem',
    },
    borderRadius: '0.5rem',
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
  },
  components: [],
}

/**
 * ELEGANT THEME
 * Inspired by: Hermès, Cartier, Rolex, Chanel
 * Sophisticated elegance with refined accents and classical typography
 */
export const elegantTheme: ThemeDefinition = {
  name: 'GEM Elegant',
  slug: 'elegant',
  description: 'Raffinement Golden Era Marketplace. Palette sophistiquée avec or dominant, typographie classique, élégance intemporelle.',
  config: {
    colors: {
      primary: '#A69F3C',
      secondary: '#2D2D2D',
      accent: '#D4C65A',
      background: '#FEFDFB',
      surface: '#F9F8F4',
      text: '#1A1A1A',
      textSecondary: '#5A5A5A',
      textMuted: '#9A9A9A',
      border: '#E8E6E0',
      borderLight: '#F2F1EC',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Lora',
    },
    spacing: {
      containerMaxWidth: '1400px',
      sectionPadding: '7rem',
    },
    borderRadius: '0.25rem',
    shadows: {
      sm: '0 1px 3px 0 rgba(20, 18, 14, 0.08)',
      md: '0 4px 8px -2px rgba(20, 18, 14, 0.12), 0 2px 4px -1px rgba(20, 18, 14, 0.06)',
      lg: '0 12px 20px -4px rgba(20, 18, 14, 0.15), 0 4px 8px -2px rgba(20, 18, 14, 0.08)',
      xl: '0 24px 32px -8px rgba(20, 18, 14, 0.18), 0 8px 12px -4px rgba(20, 18, 14, 0.10)',
    },
  },
  components: [],
}

/**
 * BOLD THEME
 * Inspired by: Stripe, GitHub, Figma, Spotify
 * Modern, vibrant design with strong contrasts and bold typography
 */
export const boldTheme: ThemeDefinition = {
  name: 'GEM Dark',
  slug: 'bold',
  description: 'Design audacieux Golden Era Marketplace. Mode sombre avec accents dorés lumineux, contrastes marqués.',
  config: {
    colors: {
      primary: '#C4B84D',
      secondary: '#A69F3C',
      accent: '#E8DC6A',
      background: '#1A1A1A',
      surface: '#2D2D2D',
      text: '#F8F8F6',
      textSecondary: '#B8B8B0',
      textMuted: '#7A7A70',
      border: '#404040',
      borderLight: '#505050',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    spacing: {
      containerMaxWidth: '1400px',
      sectionPadding: '8rem',
    },
    borderRadius: '1rem',
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
    },
  },
  components: [],
}

/**
 * All system themes
 */
export const systemThemes: ThemeDefinition[] = [
  minimalTheme,
  elegantTheme,
  boldTheme,
]

/**
 * Get theme by slug
 */
export function getThemeBySlug(slug: string): ThemeDefinition | undefined {
  return systemThemes.find(theme => theme.slug === slug)
}

/**
 * Get theme names
 */
export function getThemeNames(): string[] {
  return systemThemes.map(theme => theme.name)
}

/**
 * Generate CSS variables from theme config
 */
export function generateThemeCSS(config: any): string {
  // Default values for missing properties - GEM brand colors
  const defaults = {
    colors: {
      primary: '#A69F3C',
      secondary: '#1A1A1A',
      accent: '#C4B84D',
      background: '#FFFFFF',
      surface: '#FAFAF8',
      text: '#1A1A1A',
      textSecondary: '#4A4A4A',
      textMuted: '#8A8A8A',
      border: '#E5E5E0',
      borderLight: '#F5F5F2',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    spacing: {
      containerMaxWidth: '1440px',
      sectionPadding: '4rem',
    },
    borderRadius: '0.5rem',
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
  }

  // Merge config with defaults
  const colors = { ...defaults.colors, ...config.colors }
  const fonts = { ...defaults.fonts, ...config.fonts }
  const spacing = { ...defaults.spacing, ...config.spacing }
  const borderRadius = config.borderRadius || defaults.borderRadius
  const shadows = { ...defaults.shadows, ...(config.shadows || {}) }

  return `
    /* Theme Colors */
    --theme-primary: ${colors.primary};
    --theme-secondary: ${colors.secondary};
    --theme-accent: ${colors.accent};
    --theme-background: ${colors.background};
    --theme-surface: ${colors.surface || colors.background};
    --theme-text: ${colors.text};
    --theme-text-secondary: ${colors.textSecondary};
    --theme-text-muted: ${colors.textMuted || colors.textSecondary};
    --theme-border: ${colors.border};
    --theme-border-light: ${colors.borderLight || colors.border};

    /* Theme Fonts */
    --theme-font-heading: ${fonts.heading}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --theme-font-body: ${fonts.body}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

    /* Theme Spacing */
    --theme-container-max-width: ${spacing.containerMaxWidth};
    --theme-section-padding: ${spacing.sectionPadding};

    /* Theme Border Radius */
    --theme-border-radius: ${borderRadius};

    /* Theme Shadows */
    --theme-shadow-sm: ${shadows.sm};
    --theme-shadow-md: ${shadows.md};
    --theme-shadow-lg: ${shadows.lg};
    --theme-shadow-xl: ${shadows.xl};
  `.trim()
}
