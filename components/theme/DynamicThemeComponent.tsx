'use client'

import { useEffect, useRef } from 'react'

type DynamicThemeComponentProps = {
  html: string
  type?: string
  className?: string
}

export function DynamicThemeComponent({ html, type, className }: DynamicThemeComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current && html) {
      // Safely render HTML
      containerRef.current.innerHTML = html
    }
  }, [html])

  return <div ref={containerRef} className={className} data-theme-component={type} />
}
