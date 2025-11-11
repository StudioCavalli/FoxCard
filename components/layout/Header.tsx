'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, X, User } from 'lucide-react'
import { useUIStore } from '@/lib/store/ui'
import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/Button'

export function Header() {
  const { isCartOpen, toggleCart, isMobileMenuOpen, toggleMobileMenu } = useUIStore()
  const totalItems = useCartStore((state) => state.getTotalItems())

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900">FoxCard</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-gray-700 hover:text-primary-600 transition-colors">
              Produits
            </Link>
            <Link href="/categories" className="text-gray-700 hover:text-primary-600 transition-colors">
              Catégories
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-primary-600 transition-colors">
              À propos
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* User */}
            <Button variant="ghost" size="sm" className="hidden md:inline-flex">
              <User className="w-5 h-5" />
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="sm" onClick={toggleCart} className="relative">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>

            {/* Mobile Menu Toggle */}
            <Button variant="ghost" size="sm" onClick={toggleMobileMenu} className="md:hidden">
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/products" className="text-gray-700 hover:text-primary-600 transition-colors">
                Produits
              </Link>
              <Link href="/categories" className="text-gray-700 hover:text-primary-600 transition-colors">
                Catégories
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-primary-600 transition-colors">
                À propos
              </Link>
              <Link href="/account" className="text-gray-700 hover:text-primary-600 transition-colors">
                Mon compte
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
