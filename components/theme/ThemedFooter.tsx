'use client'

import { useTheme } from './ThemeProvider'
import { DynamicThemeComponent } from './DynamicThemeComponent'
import { Footer } from '@/components/layout/Footer'

export function ThemedFooter() {
  const { theme, isLoading } = useTheme()

  // Show default footer while loading or if no theme
  if (isLoading || !theme) {
    return <Footer />
  }

  // Find footer component in theme
  const footerComponent = theme.components?.find(
    (c: any) => c.type === 'footer' && c.isEnabled
  )

  // If no custom footer, use default
  if (!footerComponent) {
    return <Footer />
  }

  // Render custom footer from theme
  return <DynamicThemeComponent html={footerComponent.html} type="footer" />
}
