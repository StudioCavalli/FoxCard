// Theme configurations by commerce type
import type { CommerceType } from '@/lib/commerce-types'

export interface ThemeConfig {
  // Colors
  colors: {
    primary: string
    primaryLight: string
    primaryDark: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textMuted: string
  }
  // Typography
  fonts: {
    heading: string
    body: string
  }
  // Border radius
  borderRadius: {
    small: string
    medium: string
    large: string
    full: string
  }
  // Shadows
  shadows: {
    small: string
    medium: string
    large: string
  }
  // Specific UI elements
  ui: {
    buttonStyle: 'rounded' | 'pill' | 'sharp'
    cardStyle: 'minimal' | 'elevated' | 'bordered'
    headerStyle: 'classic' | 'modern' | 'minimal'
  }
}

// Theme presets for each commerce type
export const commerceTypeThemes: Record<CommerceType, ThemeConfig> = {
  GENERAL: {
    colors: {
      primary: '#3B82F6',      // Blue
      primaryLight: '#93C5FD',
      primaryDark: '#1D4ED8',
      secondary: '#6B7280',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: '#111827',
      textMuted: '#6B7280'
    },
    fonts: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif'
    },
    borderRadius: {
      small: '0.25rem',
      medium: '0.5rem',
      large: '0.75rem',
      full: '9999px'
    },
    shadows: {
      small: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      medium: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      large: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
    },
    ui: {
      buttonStyle: 'rounded',
      cardStyle: 'minimal',
      headerStyle: 'modern'
    }
  },

  FOOD: {
    colors: {
      primary: '#EF4444',      // Red (appetizing)
      primaryLight: '#FCA5A5',
      primaryDark: '#B91C1C',
      secondary: '#F97316',    // Orange
      accent: '#FBBF24',       // Warm yellow
      background: '#FFFBEB',   // Warm white
      surface: '#FEF3C7',
      text: '#78350F',
      textMuted: '#92400E'
    },
    fonts: {
      heading: 'Playfair Display, serif',
      body: 'Source Sans Pro, sans-serif'
    },
    borderRadius: {
      small: '0.5rem',
      medium: '0.75rem',
      large: '1rem',
      full: '9999px'
    },
    shadows: {
      small: '0 1px 3px 0 rgb(120 53 15 / 0.1)',
      medium: '0 4px 6px -1px rgb(120 53 15 / 0.1)',
      large: '0 10px 15px -3px rgb(120 53 15 / 0.1)'
    },
    ui: {
      buttonStyle: 'rounded',
      cardStyle: 'elevated',
      headerStyle: 'classic'
    }
  },

  ALCOHOL: {
    colors: {
      primary: '#7C3AED',      // Deep purple
      primaryLight: '#C4B5FD',
      primaryDark: '#5B21B6',
      secondary: '#A78BFA',
      accent: '#D4AF37',       // Gold
      background: '#1F1F1F',   // Dark
      surface: '#2D2D2D',
      text: '#F5F5F5',
      textMuted: '#A3A3A3'
    },
    fonts: {
      heading: 'Cormorant Garamond, serif',
      body: 'Lato, sans-serif'
    },
    borderRadius: {
      small: '0.125rem',
      medium: '0.25rem',
      large: '0.375rem',
      full: '9999px'
    },
    shadows: {
      small: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      medium: '0 4px 6px -1px rgb(0 0 0 / 0.4)',
      large: '0 10px 15px -3px rgb(0 0 0 / 0.5)'
    },
    ui: {
      buttonStyle: 'sharp',
      cardStyle: 'bordered',
      headerStyle: 'classic'
    }
  },

  FASHION: {
    colors: {
      primary: '#000000',      // Black
      primaryLight: '#525252',
      primaryDark: '#000000',
      secondary: '#A3A3A3',
      accent: '#F5F5F5',
      background: '#FFFFFF',
      surface: '#FAFAFA',
      text: '#171717',
      textMuted: '#737373'
    },
    fonts: {
      heading: 'Montserrat, sans-serif',
      body: 'Open Sans, sans-serif'
    },
    borderRadius: {
      small: '0',
      medium: '0',
      large: '0.25rem',
      full: '9999px'
    },
    shadows: {
      small: 'none',
      medium: '0 2px 4px 0 rgb(0 0 0 / 0.05)',
      large: '0 4px 8px 0 rgb(0 0 0 / 0.1)'
    },
    ui: {
      buttonStyle: 'sharp',
      cardStyle: 'minimal',
      headerStyle: 'minimal'
    }
  },

  ELECTRONICS: {
    colors: {
      primary: '#06B6D4',      // Cyan
      primaryLight: '#67E8F9',
      primaryDark: '#0891B2',
      secondary: '#8B5CF6',    // Purple accent
      accent: '#22D3EE',
      background: '#0F172A',   // Dark slate
      surface: '#1E293B',
      text: '#F1F5F9',
      textMuted: '#94A3B8'
    },
    fonts: {
      heading: 'Rajdhani, sans-serif',
      body: 'Roboto, sans-serif'
    },
    borderRadius: {
      small: '0.25rem',
      medium: '0.5rem',
      large: '0.75rem',
      full: '9999px'
    },
    shadows: {
      small: '0 0 10px rgb(6 182 212 / 0.1)',
      medium: '0 0 20px rgb(6 182 212 / 0.15)',
      large: '0 0 30px rgb(6 182 212 / 0.2)'
    },
    ui: {
      buttonStyle: 'rounded',
      cardStyle: 'bordered',
      headerStyle: 'modern'
    }
  },

  BEAUTY: {
    colors: {
      primary: '#EC4899',      // Pink
      primaryLight: '#F9A8D4',
      primaryDark: '#BE185D',
      secondary: '#A855F7',    // Purple
      accent: '#FCD34D',       // Gold
      background: '#FDF2F8',   // Light pink
      surface: '#FCE7F3',
      text: '#831843',
      textMuted: '#9D174D'
    },
    fonts: {
      heading: 'Playfair Display, serif',
      body: 'Nunito, sans-serif'
    },
    borderRadius: {
      small: '0.5rem',
      medium: '1rem',
      large: '1.5rem',
      full: '9999px'
    },
    shadows: {
      small: '0 1px 3px 0 rgb(236 72 153 / 0.1)',
      medium: '0 4px 6px -1px rgb(236 72 153 / 0.1)',
      large: '0 10px 15px -3px rgb(236 72 153 / 0.1)'
    },
    ui: {
      buttonStyle: 'pill',
      cardStyle: 'elevated',
      headerStyle: 'modern'
    }
  },

  HOME: {
    colors: {
      primary: '#78716C',      // Stone/Warm gray
      primaryLight: '#A8A29E',
      primaryDark: '#57534E',
      secondary: '#92400E',    // Amber brown
      accent: '#16A34A',       // Green (plants)
      background: '#FAFAF9',   // Warm white
      surface: '#F5F5F4',
      text: '#292524',
      textMuted: '#78716C'
    },
    fonts: {
      heading: 'DM Serif Display, serif',
      body: 'Work Sans, sans-serif'
    },
    borderRadius: {
      small: '0.25rem',
      medium: '0.5rem',
      large: '0.75rem',
      full: '9999px'
    },
    shadows: {
      small: '0 1px 2px 0 rgb(41 37 36 / 0.05)',
      medium: '0 4px 6px -1px rgb(41 37 36 / 0.1)',
      large: '0 10px 15px -3px rgb(41 37 36 / 0.1)'
    },
    ui: {
      buttonStyle: 'rounded',
      cardStyle: 'elevated',
      headerStyle: 'classic'
    }
  },

  SPORTS: {
    colors: {
      primary: '#10B981',      // Emerald green
      primaryLight: '#6EE7B7',
      primaryDark: '#047857',
      secondary: '#F59E0B',    // Amber/Energy
      accent: '#EF4444',       // Red/Action
      background: '#ECFDF5',   // Light green
      surface: '#D1FAE5',
      text: '#064E3B',
      textMuted: '#047857'
    },
    fonts: {
      heading: 'Oswald, sans-serif',
      body: 'Source Sans Pro, sans-serif'
    },
    borderRadius: {
      small: '0.25rem',
      medium: '0.5rem',
      large: '0.75rem',
      full: '9999px'
    },
    shadows: {
      small: '0 1px 3px 0 rgb(6 78 59 / 0.1)',
      medium: '0 4px 6px -1px rgb(6 78 59 / 0.1)',
      large: '0 10px 15px -3px rgb(6 78 59 / 0.15)'
    },
    ui: {
      buttonStyle: 'pill',
      cardStyle: 'bordered',
      headerStyle: 'modern'
    }
  }
}

// Generate CSS variables from theme config
export function generateCSSVariables(theme: ThemeConfig): string {
  return `
    :root {
      /* Colors */
      --color-primary: ${theme.colors.primary};
      --color-primary-light: ${theme.colors.primaryLight};
      --color-primary-dark: ${theme.colors.primaryDark};
      --color-secondary: ${theme.colors.secondary};
      --color-accent: ${theme.colors.accent};
      --color-background: ${theme.colors.background};
      --color-surface: ${theme.colors.surface};
      --color-text: ${theme.colors.text};
      --color-text-muted: ${theme.colors.textMuted};

      /* Fonts */
      --font-heading: ${theme.fonts.heading};
      --font-body: ${theme.fonts.body};

      /* Border Radius */
      --radius-small: ${theme.borderRadius.small};
      --radius-medium: ${theme.borderRadius.medium};
      --radius-large: ${theme.borderRadius.large};
      --radius-full: ${theme.borderRadius.full};

      /* Shadows */
      --shadow-small: ${theme.shadows.small};
      --shadow-medium: ${theme.shadows.medium};
      --shadow-large: ${theme.shadows.large};
    }
  `
}

// Get theme for a commerce type
export function getCommerceTypeTheme(type: CommerceType): ThemeConfig {
  return commerceTypeThemes[type] || commerceTypeThemes.GENERAL
}

// Generate Tailwind-compatible utility classes
export function generateTailwindConfig(theme: ThemeConfig) {
  return {
    colors: {
      primary: {
        DEFAULT: theme.colors.primary,
        light: theme.colors.primaryLight,
        dark: theme.colors.primaryDark
      },
      secondary: theme.colors.secondary,
      accent: theme.colors.accent
    },
    fontFamily: {
      heading: [theme.fonts.heading],
      body: [theme.fonts.body]
    },
    borderRadius: {
      sm: theme.borderRadius.small,
      md: theme.borderRadius.medium,
      lg: theme.borderRadius.large,
      full: theme.borderRadius.full
    },
    boxShadow: {
      sm: theme.shadows.small,
      md: theme.shadows.medium,
      lg: theme.shadows.large
    }
  }
}
