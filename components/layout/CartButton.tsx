'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/lib/store/cart'

export function CartButton() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const totalItems = useCartStore((state) => state.getTotalItems())

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleClick = () => {
    router.push('/cart')
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} className="relative">
      <ShoppingCart className="w-5 h-5" />
      {mounted && totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-gradient-to-br from-secondary-500 to-secondary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
          {totalItems}
        </span>
      )}
    </Button>
  )
}
