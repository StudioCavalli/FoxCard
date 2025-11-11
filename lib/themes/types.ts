export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  border: string
  input: string
  ring: string
  success: string
  warning: string
  error: string
}

export interface ThemeTypography {
  fontFamily: string
  headingFont?: string
  fontSize: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
  }
  fontWeight: {
    normal: number
    medium: number
    semibold: number
    bold: number
  }
}

export interface ThemeSpacing {
  borderRadius: {
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
    full: string
  }
  padding: {
    container: string
    section: string
  }
}

export interface ThemeLayout {
  maxWidth: string
  headerHeight: string
  footerHeight: string
}

export interface Theme {
  id: string
  name: string
  description?: string
  version: string
  author: string
  colors: {
    light: ThemeColors
    dark?: ThemeColors
  }
  typography: ThemeTypography
  spacing: ThemeSpacing
  layout: ThemeLayout
  customCSS?: string
}

export interface StoreThemeSettings {
  themeId: string
  customColors?: Partial<ThemeColors>
  customTypography?: Partial<ThemeTypography>
  customCSS?: string
  darkMode: 'auto' | 'light' | 'dark'
}
