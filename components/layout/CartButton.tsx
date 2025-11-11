'use client'

import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/lib/store/ui'
import { useCartStore } from '@/lib/store/cart'

export function CartButton() {
  const [mounted, setMounted] = useState(false)
  const toggleCart = useUIStore((state) => state.toggleCart)
  const totalItems = useCartStore((state) => state.getTotalItems())

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Button variant="ghost" size="sm" onClick={toggleCart} className="relative">
      <ShoppingCart className="w-5 h-5" />
      {mounted && totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-secondary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </Button>
  )
}
