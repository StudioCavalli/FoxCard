'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { generateThemeCSS, type ThemeConfig } from '@/lib/themes/presets'
import { getDefaultMarketplaceTheme } from '@/lib/themes/marketplace-theme'
import { usePublicStore } from '@/lib/context/public-store-context'

interface ThemeContextValue {
  theme: any | null
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: null,
  isLoading: true,
})

export function useTheme() {
  return useContext(ThemeContext)
}

/**
 * ThemeProvider - Loads active theme and injects CSS variables
 *
 * This provider:
 * 1. Listens to store selection changes via PublicStoreContext
 * 2. Fetches the active theme for the selected store (or uses marketplace theme for "all")
 * 3. Generates CSS variables from theme config
 * 4. Injects them into :root for global access with smooth transitions
 * 5. Loads custom fonts from Google Fonts if needed
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { selectedStore } = usePublicStore()
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Only fetch theme if a specific store is selected (not "all")
  const { data: theme, isLoading } = trpc.theme.getActive.useQuery(
    { storeId: selectedStore === 'all' ? '' : selectedStore },
    {
      enabled: selectedStore !== 'all' && !!selectedStore,
      retry: false,
      refetchOnWindowFocus: false,
    }
  )

  useEffect(() => {
    let config: ThemeConfig

    // Start transition
    setIsTransitioning(true)

    if (selectedStore === 'all') {
      // Load default marketplace theme for "All Stores" view
      config = getDefaultMarketplaceTheme()
    } else if (theme?.config) {
      // Load store-specific theme
      config = theme.config as unknown as ThemeConfig
    } else {
      // Fallback to marketplace theme if store theme not loaded yet
      config = getDefaultMarketplaceTheme()
    }

    // Apply theme with transition
    applyTheme(config)

    // End transition after CSS variables are applied
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 50)

    return () => clearTimeout(timer)
  }, [selectedStore, theme])

  // Apply theme configuration
  const applyTheme = (config: ThemeConfig) => {

    // Generate and inject CSS variables
    const css = generateThemeCSS(config)

    // Remove existing theme style tag if present
    const existingStyle = document.getElementById('theme-variables')
    if (existingStyle) {
      existingStyle.remove()
    }

    // Create and inject new style tag with transitions
    const styleTag = document.createElement('style')
    styleTag.id = 'theme-variables'
    styleTag.textContent = `
      :root {
        ${css}
      }

      /* Smooth theme transitions */
      * {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
      }
    `
    document.head.appendChild(styleTag)

    // Load custom fonts from Google Fonts if not system fonts
    const fontsToLoad = new Set<string>()
    if (config.fonts.heading && !isSystemFont(config.fonts.heading)) {
      fontsToLoad.add(config.fonts.heading)
    }
    if (config.fonts.body && !isSystemFont(config.fonts.body)) {
      fontsToLoad.add(config.fonts.body)
    }

    if (fontsToLoad.size > 0) {
      loadGoogleFonts(Array.from(fontsToLoad))
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, isLoading: isLoading || isTransitioning }}>
      {children}
    </ThemeContext.Provider>
  )
}


/**
 * Check if font is a system font
 */
function isSystemFont(fontName: string): boolean {
  const systemFonts = [
    'Inter',
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Courier New',
    'Verdana',
    'Tahoma',
    'Comic Sans MS',
    'Impact',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
  ]
  return systemFonts.some(sf => fontName.toLowerCase().includes(sf.toLowerCase()))
}

/**
 * Load Google Fonts
 */
function loadGoogleFonts(fonts: string[]) {
  // Remove existing Google Fonts link if present
  const existingLink = document.getElementById('theme-fonts')
  if (existingLink) {
    existingLink.remove()
  }

  // Create Google Fonts URL
  const fontFamilies = fonts.map(font => font.replace(/ /g, '+')).join('&family=')
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamilies}:wght@300;400;500;600;700;800;900&display=swap`

  // Create and inject link tag
  const link = document.createElement('link')
  link.id = 'theme-fonts'
  link.rel = 'stylesheet'
  link.href = fontUrl
  document.head.appendChild(link)
}
