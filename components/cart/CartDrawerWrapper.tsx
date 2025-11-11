'use client'

import { useEffect, useState } from 'react'
import { CartDrawer } from './CartDrawer'

export function CartDrawerWrapper() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return <CartDrawer />
}
