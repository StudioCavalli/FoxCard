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
  },

  TOYS: {
    colors: {
      primary: '#F59E0B',      // Amber/Yellow
      primaryLight: '#FCD34D',
      primaryDark: '#D97706',
      secondary: '#EC4899',    // Pink
      accent: '#8B5CF6',       // Purple
      background: '#FFFBEB',
      surface: '#FEF3C7',
      text: '#78350F',
      textMuted: '#92400E'
    },
    fonts: {
      heading: 'Fredoka One, cursive',
      body: 'Nunito, sans-serif'
    },
    borderRadius: {
      small: '0.5rem',
      medium: '1rem',
      large: '1.5rem',
      full: '9999px'
    },
    shadows: {
      small: '0 2px 4px 0 rgb(245 158 11 / 0.1)',
      medium: '0 4px 8px -1px rgb(245 158 11 / 0.15)',
      large: '0 8px 16px -2px rgb(245 158 11 / 0.2)'
    },
    ui: {
      buttonStyle: 'pill',
      cardStyle: 'elevated',
      headerStyle: 'modern'
    }
  },

  AUTOMOTIVE: {
    colors: {
      primary: '#475569',      // Slate
      primaryLight: '#94A3B8',
      primaryDark: '#334155',
      secondary: '#EF4444',    // Red accent
      accent: '#F59E0B',       // Warning yellow
      background: '#F8FAFC',
      surface: '#F1F5F9',
      text: '#0F172A',
      textMuted: '#64748B'
    },
    fonts: {
      heading: 'Barlow Condensed, sans-serif',
      body: 'Roboto, sans-serif'
    },
    borderRadius: {
      small: '0.25rem',
      medium: '0.375rem',
      large: '0.5rem',
      full: '9999px'
    },
    shadows: {
      small: '0 1px 2px 0 rgb(15 23 42 / 0.05)',
      medium: '0 4px 6px -1px rgb(15 23 42 / 0.1)',
      large: '0 10px 15px -3px rgb(15 23 42 / 0.1)'
    },
    ui: {
      buttonStyle: 'rounded',
      cardStyle: 'bordered',
      headerStyle: 'modern'
    }
  },

  BOOKS: {
    colors: {
      primary: '#92400E',      // Amber/Brown
      primaryLight: '#D97706',
      primaryDark: '#78350F',
      secondary: '#065F46',    // Emerald dark
      accent: '#DC2626',       // Red accent
      background: '#FFFBF0',   // Cream
      surface: '#FEF3E2',
      text: '#422006',
      textMuted: '#78350F'
    },
    fonts: {
      heading: 'Playfair Display, serif',
      body: 'Merriweather, serif'
    },
    borderRadius: {
      small: '0.125rem',
      medium: '0.25rem',
      large: '0.375rem',
      full: '9999px'
    },
    shadows: {
      small: '0 1px 2px 0 rgb(66 32 6 / 0.05)',
      medium: '0 2px 4px 0 rgb(66 32 6 / 0.1)',
      large: '0 4px 8px 0 rgb(66 32 6 / 0.15)'
    },
    ui: {
      buttonStyle: 'rounded',
      cardStyle: 'minimal',
      headerStyle: 'classic'
    }
  },

  PETS: {
    colors: {
      primary: '#F97316',      // Orange
      primaryLight: '#FDBA74',
      primaryDark: '#EA580C',
      secondary: '#22C55E',    // Green
      accent: '#EAB308',       // Yellow
      background: '#FFF7ED',
      surface: '#FFEDD5',
      text: '#7C2D12',
      textMuted: '#C2410C'
    },
    fonts: {
      heading: 'Baloo 2, cursive',
      body: 'Poppins, sans-serif'
    },
    borderRadius: {
      small: '0.5rem',
      medium: '0.75rem',
      large: '1rem',
      full: '9999px'
    },
    shadows: {
      small: '0 1px 3px 0 rgb(249 115 22 / 0.1)',
      medium: '0 4px 6px -1px rgb(249 115 22 / 0.1)',
      large: '0 10px 15px -3px rgb(249 115 22 / 0.1)'
    },
    ui: {
      buttonStyle: 'pill',
      cardStyle: 'elevated',
      headerStyle: 'modern'
    }
  },

  DIGITAL: {
    colors: {
      primary: '#8B5CF6',      // Violet
      primaryLight: '#C4B5FD',
      primaryDark: '#7C3AED',
      secondary: '#06B6D4',    // Cyan
      accent: '#F472B6',       // Pink
      background: '#0F0F1A',   // Dark blue
      surface: '#1A1A2E',
      text: '#F5F5F5',
      textMuted: '#A3A3A3'
    },
    fonts: {
      heading: 'Space Grotesk, sans-serif',
      body: 'Inter, sans-serif'
    },
    borderRadius: {
      small: '0.25rem',
      medium: '0.5rem',
      large: '0.75rem',
      full: '9999px'
    },
    shadows: {
      small: '0 0 10px rgb(139 92 246 / 0.1)',
      medium: '0 0 20px rgb(139 92 246 / 0.15)',
      large: '0 0 30px rgb(139 92 246 / 0.2)'
    },
    ui: {
      buttonStyle: 'rounded',
      cardStyle: 'bordered',
      headerStyle: 'modern'
    }
  },

  SERVICES: {
    colors: {
      primary: '#0EA5E9',      // Sky blue
      primaryLight: '#7DD3FC',
      primaryDark: '#0284C7',
      secondary: '#6366F1',    // Indigo
      accent: '#22C55E',       // Green (success)
      background: '#F0F9FF',
      surface: '#E0F2FE',
      text: '#0C4A6E',
      textMuted: '#0369A1'
    },
    fonts: {
      heading: 'Poppins, sans-serif',
      body: 'Open Sans, sans-serif'
    },
    borderRadius: {
      small: '0.375rem',
      medium: '0.5rem',
      large: '0.75rem',
      full: '9999px'
    },
    shadows: {
      small: '0 1px 2px 0 rgb(14 165 233 / 0.05)',
      medium: '0 4px 6px -1px rgb(14 165 233 / 0.1)',
      large: '0 10px 15px -3px rgb(14 165 233 / 0.1)'
    },
    ui: {
      buttonStyle: 'rounded',
      cardStyle: 'elevated',
      headerStyle: 'modern'
    }
  },

  SEASONAL: {
    colors: {
      primary: '#DC2626',      // Red (festive)
      primaryLight: '#FCA5A5',
      primaryDark: '#B91C1C',
      secondary: '#16A34A',    // Green
      accent: '#FBBF24',       // Gold
      background: '#FEF2F2',
      surface: '#FEE2E2',
      text: '#7F1D1D',
      textMuted: '#991B1B'
    },
    fonts: {
      heading: 'Lobster, cursive',
      body: 'Nunito Sans, sans-serif'
    },
    borderRadius: {
      small: '0.5rem',
      medium: '0.75rem',
      large: '1rem',
      full: '9999px'
    },
    shadows: {
      small: '0 1px 3px 0 rgb(220 38 38 / 0.1)',
      medium: '0 4px 6px -1px rgb(220 38 38 / 0.1)',
      large: '0 10px 15px -3px rgb(220 38 38 / 0.15)'
    },
    ui: {
      buttonStyle: 'pill',
      cardStyle: 'elevated',
      headerStyle: 'classic'
    }
  },

  RESTAURANT: {
    colors: {
      primary: '#B91C1C',      // Deep red
      primaryLight: '#EF4444',
      primaryDark: '#991B1B',
      secondary: '#F59E0B',    // Warm amber
      accent: '#22C55E',       // Fresh green
      background: '#1C1917',   // Dark warm
      surface: '#292524',
      text: '#FAFAF9',
      textMuted: '#A8A29E'
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
      small: '0 1px 2px 0 rgb(0 0 0 / 0.2)',
      medium: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
      large: '0 10px 15px -3px rgb(0 0 0 / 0.4)'
    },
    ui: {
      buttonStyle: 'sharp',
      cardStyle: 'minimal',
      headerStyle: 'classic'
    }
  },

  HOTEL: {
    colors: {
      primary: '#0F766E',      // Teal
      primaryLight: '#2DD4BF',
      primaryDark: '#115E59',
      secondary: '#D4AF37',    // Gold
      accent: '#0EA5E9',       // Sky blue
      background: '#F0FDFA',
      surface: '#CCFBF1',
      text: '#134E4A',
      textMuted: '#0F766E'
    },
    fonts: {
      heading: 'Libre Baskerville, serif',
      body: 'Source Sans Pro, sans-serif'
    },
    borderRadius: {
      small: '0.125rem',
      medium: '0.25rem',
      large: '0.5rem',
      full: '9999px'
    },
    shadows: {
      small: '0 1px 2px 0 rgb(15 118 110 / 0.05)',
      medium: '0 4px 6px -1px rgb(15 118 110 / 0.1)',
      large: '0 10px 15px -3px rgb(15 118 110 / 0.1)'
    },
    ui: {
      buttonStyle: 'rounded',
      cardStyle: 'elevated',
      headerStyle: 'classic'
    }
  },

  TRAVEL: {
    colors: {
      primary: '#2563EB',      // Blue
      primaryLight: '#60A5FA',
      primaryDark: '#1D4ED8',
      secondary: '#F97316',    // Orange (sunset)
      accent: '#10B981',       // Emerald
      background: '#EFF6FF',
      surface: '#DBEAFE',
      text: '#1E3A8A',
      textMuted: '#3B82F6'
    },
    fonts: {
      heading: 'Rubik, sans-serif',
      body: 'Nunito, sans-serif'
    },
    borderRadius: {
      small: '0.375rem',
      medium: '0.5rem',
      large: '0.75rem',
      full: '9999px'
    },
    shadows: {
      small: '0 1px 3px 0 rgb(37 99 235 / 0.1)',
      medium: '0 4px 6px -1px rgb(37 99 235 / 0.1)',
      large: '0 10px 15px -3px rgb(37 99 235 / 0.15)'
    },
    ui: {
      buttonStyle: 'pill',
      cardStyle: 'elevated',
      headerStyle: 'modern'
    }
  },

  RECREATION: {
    colors: {
      primary: '#7C3AED',      // Violet
      primaryLight: '#A78BFA',
      primaryDark: '#6D28D9',
      secondary: '#EC4899',    // Pink
      accent: '#FBBF24',       // Yellow
      background: '#FAF5FF',
      surface: '#F3E8FF',
      text: '#4C1D95',
      textMuted: '#7C3AED'
    },
    fonts: {
      heading: 'Righteous, cursive',
      body: 'Quicksand, sans-serif'
    },
    borderRadius: {
      small: '0.5rem',
      medium: '0.75rem',
      large: '1rem',
      full: '9999px'
    },
    shadows: {
      small: '0 1px 3px 0 rgb(124 58 237 / 0.1)',
      medium: '0 4px 6px -1px rgb(124 58 237 / 0.15)',
      large: '0 10px 15px -3px rgb(124 58 237 / 0.2)'
    },
    ui: {
      buttonStyle: 'pill',
      cardStyle: 'elevated',
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
