import { Theme } from './types'

export const defaultTheme: Theme = {
  id: 'default',
  name: 'Thème par défaut',
  description: 'Thème moderne et minimaliste de GoldenEra',
  version: '1.0.0',
  author: 'Foxcase',
  colors: {
    light: {
      primary: '#14b8a6', // Teal-500
      secondary: '#ec4899', // Pink-500
      accent: '#f59e0b', // Amber-500
      background: '#ffffff',
      foreground: '#0f172a', // Slate-900
      muted: '#f1f5f9', // Slate-100
      border: '#e2e8f0', // Slate-200
      input: '#ffffff',
      ring: '#14b8a6',
      success: '#10b981', // Green-500
      warning: '#f59e0b', // Amber-500
      error: '#ef4444', // Red-500
    },
    dark: {
      primary: '#14b8a6',
      secondary: '#ec4899',
      accent: '#f59e0b',
      background: '#0f172a', // Slate-900
      foreground: '#f8fafc', // Slate-50
      muted: '#1e293b', // Slate-800
      border: '#334155', // Slate-700
      input: '#1e293b',
      ring: '#14b8a6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
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
