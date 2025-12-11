import { ThemeConfig } from './presets'

/**
 * MARKETPLACE THEME
 * Default theme for "All Stores" mode
 * GEM (Golden Era Marketplace) brand colors
 */
export const marketplaceTheme: ThemeConfig = {
  colors: {
    // GEM brand colors - Gold/Olive primary
    primary: '#A69F3C',
    secondary: '#1A1A1A',
    accent: '#C4B84D',

    // Clean backgrounds
    background: '#FFFFFF',
    surface: '#FAFAF8',

    // Professional text colors
    text: '#1A1A1A',
    textSecondary: '#4A4A4A',
    textMuted: '#8A8A8A',

    // Subtle borders
    border: '#E5E5E0',
    borderLight: '#F5F5F2',
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
  },
  spacing: {
    containerMaxWidth: '1440px',
    sectionPadding: '6rem',
  },
  borderRadius: '0.75rem',
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
}

/**
 * Get the default marketplace theme
 * Used when viewing products from all stores
 */
export function getDefaultMarketplaceTheme(): ThemeConfig {
  return marketplaceTheme
}
