import { Theme } from './types'

export const defaultTheme: Theme = {
  id: 'default',
  name: 'GEM Default',
  description: 'Thème officiel Golden Era Marketplace',
  version: '1.0.0',
  author: 'GEM',
  colors: {
    light: {
      primary: '#A69F3C', // GEM Gold
      secondary: '#1A1A1A', // GEM Black
      accent: '#C4B84D', // GEM Gold Light
      background: '#ffffff',
      foreground: '#1A1A1A', // GEM Black
      muted: '#FAFAF8', // Warm white
      border: '#E5E5E0', // Warm gray
      input: '#ffffff',
      ring: '#A69F3C',
      success: '#22C55E', // Green-500
      warning: '#F59E0B', // Amber-500
      error: '#EF4444', // Red-500
    },
    dark: {
      primary: '#C4B84D', // GEM Gold Light
      secondary: '#A69F3C', // GEM Gold
      accent: '#E8DC6A', // GEM Gold Bright
      background: '#1A1A1A', // GEM Black
      foreground: '#F8F8F6', // Warm white
      muted: '#2D2D2D', // Dark gray
      border: '#404040', // Medium gray
      input: '#2D2D2D',
      ring: '#C4B84D',
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    headingFont: 'Inter, system-ui, -apple-system, sans-serif',
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    borderRadius: {
      sm: '0.375rem',   // 6px
      md: '0.5rem',     // 8px
      lg: '0.75rem',    // 12px
      xl: '1rem',       // 16px
      '2xl': '1.5rem',  // 24px
      full: '9999px',
    },
    padding: {
      container: '1rem',  // 16px on mobile, can be increased on larger screens
      section: '3rem',    // 48px
    },
  },
  layout: {
    maxWidth: '1280px',
    headerHeight: '4rem',   // 64px
    footerHeight: 'auto',
  },
}
