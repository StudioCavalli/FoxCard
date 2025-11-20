'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { generateThemeCSS, type ThemeConfig } from '@/lib/themes/presets'

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
 * 1. Fetches the active theme from the database
 * 2. Generates CSS variables from theme config
 * 3. Injects them into :root for global access
 * 4. Loads custom fonts from Google Fonts if needed
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [storeId] = useState(() => {
    if (typeof window === 'undefined') return '000000000000000000000001'
    return localStorage.getItem('storeId') || '000000000000000000000001'
  })

  const { data: theme, isLoading } = trpc.theme.getActive.useQuery(
    { storeId },
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  )

  useEffect(() => {
    if (!theme?.config) return

    const config = theme.config as unknown as ThemeConfig

    // Generate and inject CSS variables
    const css = generateThemeCSS(config)

    // Remove existing theme style tag if present
    const existingStyle = document.getElementById('theme-variables')
    if (existingStyle) {
      existingStyle.remove()
    }

    // Create and inject new style tag
    const styleTag = document.createElement('style')
    styleTag.id = 'theme-variables'
    styleTag.textContent = `:root {\n${css}\n}`
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

    // Cleanup function
    return () => {
      const style = document.getElementById('theme-variables')
      if (style) {
        style.remove()
      }
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, isLoading }}>
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
