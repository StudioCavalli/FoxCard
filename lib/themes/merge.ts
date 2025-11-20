/**
 * Theme Merge Utilities
 * Handles intelligent merging of base themes with custom overrides
 */

interface ThemeConfig {
  colors?: {
    primary?: string
    secondary?: string
    accent?: string
    background?: string
    surface?: string
    text?: string
    textSecondary?: string
    textMuted?: string
    border?: string
    borderLight?: string
  }
  fonts?: {
    heading?: string
    body?: string
  }
  spacing?: {
    containerMaxWidth?: string
    sectionPadding?: string
  }
  borderRadius?: string
  shadows?: {
    sm?: string
    md?: string
    lg?: string
    xl?: string
  }
}

/**
 * Deep merge two theme configs
 * Overrides take precedence over base
 */
export function mergeThemeConfigs(
  baseConfig: ThemeConfig,
  overrides: ThemeConfig
): ThemeConfig {
  return {
    colors: {
      ...baseConfig.colors,
      ...overrides.colors,
    },
    fonts: {
      ...baseConfig.fonts,
      ...overrides.fonts,
    },
    spacing: {
      ...baseConfig.spacing,
      ...overrides.spacing,
    },
    borderRadius: overrides.borderRadius ?? baseConfig.borderRadius,
    shadows: {
      ...baseConfig.shadows,
      ...overrides.shadows,
    },
  }
}

/**
 * Extract only the differences between two configs
 * Returns a minimal override object
 */
export function extractOverrides(
  baseConfig: ThemeConfig,
  customConfig: ThemeConfig
): ThemeConfig {
  const overrides: ThemeConfig = {}

  // Compare colors
  if (customConfig.colors) {
    const colorOverrides: any = {}
    Object.entries(customConfig.colors).forEach(([key, value]) => {
      if (baseConfig.colors?.[key as keyof typeof baseConfig.colors] !== value) {
        colorOverrides[key] = value
      }
    })
    if (Object.keys(colorOverrides).length > 0) {
      overrides.colors = colorOverrides
    }
  }

  // Compare fonts
  if (customConfig.fonts) {
    const fontOverrides: any = {}
    Object.entries(customConfig.fonts).forEach(([key, value]) => {
      if (baseConfig.fonts?.[key as keyof typeof baseConfig.fonts] !== value) {
        fontOverrides[key] = value
      }
    })
    if (Object.keys(fontOverrides).length > 0) {
      overrides.fonts = fontOverrides
    }
  }

  // Compare spacing
  if (customConfig.spacing) {
    const spacingOverrides: any = {}
    Object.entries(customConfig.spacing).forEach(([key, value]) => {
      if (baseConfig.spacing?.[key as keyof typeof baseConfig.spacing] !== value) {
        spacingOverrides[key] = value
      }
    })
    if (Object.keys(spacingOverrides).length > 0) {
      overrides.spacing = spacingOverrides
    }
  }

  // Compare borderRadius
  if (customConfig.borderRadius !== baseConfig.borderRadius) {
    overrides.borderRadius = customConfig.borderRadius
  }

  // Compare shadows
  if (customConfig.shadows) {
    const shadowOverrides: any = {}
    Object.entries(customConfig.shadows).forEach(([key, value]) => {
      if (baseConfig.shadows?.[key as keyof typeof baseConfig.shadows] !== value) {
        shadowOverrides[key] = value
      }
    })
    if (Object.keys(shadowOverrides).length > 0) {
      overrides.shadows = shadowOverrides
    }
  }

  return overrides
}

/**
 * Check if a theme has updates available
 * Compares theme version with base theme version
 */
export function hasThemeUpdates(
  currentBaseVersion: string,
  latestBaseVersion: string
): boolean {
  return currentBaseVersion !== latestBaseVersion
}

/**
 * Detect conflicts between user overrides and base theme updates
 * Returns list of conflicting keys
 */
export function detectConflicts(
  userOverrides: ThemeConfig,
  baseUpdates: ThemeConfig
): string[] {
  const conflicts: string[] = []

  // Check color conflicts
  if (userOverrides.colors && baseUpdates.colors) {
    Object.keys(userOverrides.colors).forEach((key) => {
      if (key in baseUpdates.colors!) {
        conflicts.push(`colors.${key}`)
      }
    })
  }

  // Check font conflicts
  if (userOverrides.fonts && baseUpdates.fonts) {
    Object.keys(userOverrides.fonts).forEach((key) => {
      if (key in baseUpdates.fonts!) {
        conflicts.push(`fonts.${key}`)
      }
    })
  }

  // Check spacing conflicts
  if (userOverrides.spacing && baseUpdates.spacing) {
    Object.keys(userOverrides.spacing).forEach((key) => {
      if (key in baseUpdates.spacing!) {
        conflicts.push(`spacing.${key}`)
      }
    })
  }

  // Check borderRadius conflict
  if (
    userOverrides.borderRadius !== undefined &&
    baseUpdates.borderRadius !== undefined
  ) {
    conflicts.push('borderRadius')
  }

  // Check shadow conflicts
  if (userOverrides.shadows && baseUpdates.shadows) {
    Object.keys(userOverrides.shadows).forEach((key) => {
      if (key in baseUpdates.shadows!) {
        conflicts.push(`shadows.${key}`)
      }
    })
  }

  return conflicts
}

/**
 * Merge base theme updates while preserving user overrides
 * Strategy: Base updates + User overrides (overrides win in conflicts)
 */
export function mergeWithUpdates(
  oldBaseConfig: ThemeConfig,
  newBaseConfig: ThemeConfig,
  userOverrides: ThemeConfig
): ThemeConfig {
  // First apply new base config
  // Then apply user overrides on top (user choices always win)
  return mergeThemeConfigs(newBaseConfig, userOverrides)
}
