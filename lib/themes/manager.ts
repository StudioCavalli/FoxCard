import { Theme, ThemeColors, StoreThemeSettings } from './types'
import { defaultTheme } from './default'

/**
 * Theme Manager
 * Manages theme loading, customization, and CSS generation
 */
class ThemeManager {
  private themes: Map<string, Theme> = new Map()

  constructor() {
    // Register default theme
    this.registerTheme(defaultTheme)
  }

  /**
   * Register a theme
   */
  registerTheme(theme: Theme): void {
    this.themes.set(theme.id, theme)
  }

  /**
   * Get a theme by ID
   */
  getTheme(themeId: string): Theme | undefined {
    return this.themes.get(themeId)
  }

  /**
   * Get all available themes
   */
  getAllThemes(): Theme[] {
    return Array.from(this.themes.values())
  }

  /**
   * Apply theme customizations
   */
  applyCustomizations(
    theme: Theme,
    settings: StoreThemeSettings
  ): Theme {
    return {
      ...theme,
      colors: {
        light: {
          ...theme.colors.light,
          ...settings.customColors,
        },
        dark: theme.colors.dark
          ? {
              ...theme.colors.dark,
              ...settings.customColors,
            }
          : undefined,
      },
      typography: {
        ...theme.typography,
        ...settings.customTypography,
      },
      customCSS: settings.customCSS || theme.customCSS,
    }
  }

  /**
   * Generate CSS variables from theme
   */
  generateCSSVariables(colors: ThemeColors): string {
    return `
      --color-primary: ${colors.primary};
      --color-secondary: ${colors.secondary};
      --color-accent: ${colors.accent};
      --color-background: ${colors.background};
      --color-foreground: ${colors.foreground};
      --color-muted: ${colors.muted};
      --color-border: ${colors.border};
      --color-input: ${colors.input};
      --color-ring: ${colors.ring};
      --color-success: ${colors.success};
      --color-warning: ${colors.warning};
      --color-error: ${colors.error};
    `
  }

  /**
   * Generate full theme CSS
   */
  generateThemeCSS(theme: Theme, mode: 'light' | 'dark' = 'light'): string {
    const colors = mode === 'dark' && theme.colors.dark
      ? theme.colors.dark
      : theme.colors.light

    const cssVariables = this.generateCSSVariables(colors)

    const typographyCSS = `
      --font-family: ${theme.typography.fontFamily};
      --font-heading: ${theme.typography.headingFont || theme.typography.fontFamily};
      --font-size-xs: ${theme.typography.fontSize.xs};
      --font-size-sm: ${theme.typography.fontSize.sm};
      --font-size-base: ${theme.typography.fontSize.base};
      --font-size-lg: ${theme.typography.fontSize.lg};
      --font-size-xl: ${theme.typography.fontSize.xl};
      --font-size-2xl: ${theme.typography.fontSize['2xl']};
      --font-size-3xl: ${theme.typography.fontSize['3xl']};
      --font-size-4xl: ${theme.typography.fontSize['4xl']};
      --font-weight-normal: ${theme.typography.fontWeight.normal};
      --font-weight-medium: ${theme.typography.fontWeight.medium};
      --font-weight-semibold: ${theme.typography.fontWeight.semibold};
      --font-weight-bold: ${theme.typography.fontWeight.bold};
    `

    const spacingCSS = `
      --radius-sm: ${theme.spacing.borderRadius.sm};
      --radius-md: ${theme.spacing.borderRadius.md};
      --radius-lg: ${theme.spacing.borderRadius.lg};
      --radius-xl: ${theme.spacing.borderRadius.xl};
      --radius-2xl: ${theme.spacing.borderRadius['2xl']};
      --radius-full: ${theme.spacing.borderRadius.full};
      --padding-container: ${theme.spacing.padding.container};
      --padding-section: ${theme.spacing.padding.section};
    `

    const layoutCSS = `
      --max-width: ${theme.layout.maxWidth};
      --header-height: ${theme.layout.headerHeight};
      --footer-height: ${theme.layout.footerHeight};
    `

    return `
      :root {
        ${cssVariables}
        ${typographyCSS}
        ${spacingCSS}
        ${layoutCSS}
      }

      ${theme.customCSS || ''}
    `
  }
}

export const themeManager = new ThemeManager()
