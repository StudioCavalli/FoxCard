import { ThemeConfig } from './presets'

/**
 * MARKETPLACE THEME
 * Default theme for "All Stores" mode
 * Neutral, professional design that works for multi-merchant marketplace view
 */
export const marketplaceTheme: ThemeConfig = {
  colors: {
    // Neutral primary color - indigo for trustworthy marketplace feel
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#ec4899',

    // Clean backgrounds
    background: '#f9fafb',
    surface: '#ffffff',

    // Professional text colors
    text: '#111827',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',

    // Subtle borders
    border: '#e5e7eb',
    borderLight: '#f3f4f6',
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
