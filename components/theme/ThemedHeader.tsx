'use client'

import { useTheme } from './ThemeProvider'
import { DynamicThemeComponent } from './DynamicThemeComponent'
import { Header } from '@/components/layout/Header'

export function ThemedHeader() {
  const { theme, isLoading } = useTheme()

  // Show default header while loading or if no theme
  if (isLoading || !theme) {
    return <Header />
  }

  // Find header component in theme
  const headerComponent = theme.components?.find(
    (c: any) => c.type === 'header' && c.isEnabled
  )

  // If no custom header, use default
  if (!headerComponent) {
    return <Header />
  }

  // Render custom header from theme
  return <DynamicThemeComponent html={headerComponent.html} type="header" />
}
