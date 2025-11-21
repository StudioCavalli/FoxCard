'use client'

import { useEffect, useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { generateCSSVariables, getCommerceTypeTheme } from '@/lib/themes/commerce-type-themes'
import type { CommerceType } from '@/lib/commerce-types'

interface ThemeProviderProps {
  storeId: string
  children: React.ReactNode
}

export default function ThemeProvider({ storeId, children }: ThemeProviderProps) {
  const [cssVariables, setCssVariables] = useState<string>('')

  const { data: storeType } = trpc.commerceType.getStoreType.useQuery(
    { storeId },
    { enabled: !!storeId }
  )

  useEffect(() => {
    if (storeType?.type) {
      const theme = getCommerceTypeTheme(storeType.type as CommerceType)
      const css = generateCSSVariables(theme)
      setCssVariables(css)

      // Also set data attributes for conditional styling
      document.documentElement.setAttribute('data-commerce-type', storeType.type)
      document.documentElement.setAttribute('data-button-style', theme.ui.buttonStyle)
      document.documentElement.setAttribute('data-card-style', theme.ui.cardStyle)
      document.documentElement.setAttribute('data-header-style', theme.ui.headerStyle)
    }
  }, [storeType])

  return (
    <>
      {cssVariables && (
        <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      )}
      {children}
    </>
  )
}

// Hook to access current theme
export function useCommerceTheme(storeId: string) {
  const { data: storeType } = trpc.commerceType.getStoreType.useQuery(
    { storeId },
    { enabled: !!storeId }
  )

  if (!storeType?.type) {
    return getCommerceTypeTheme('GENERAL')
  }

  return getCommerceTypeTheme(storeType.type as CommerceType)
}
