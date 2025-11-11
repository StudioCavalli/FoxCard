'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Menu, X, User } from 'lucide-react'
import { useUIStore } from '@/lib/store/ui'
import { Button } from '@/components/ui/Button'
import { CartButton } from './CartButton'
import { SearchBar } from './SearchBar'

export function Header() {
  const { isMobileMenuOpen, toggleMobileMenu } = useUIStore()
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900">FoxCard</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1">
            <SearchBar />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-gray-700 hover:text-primary-600 transition-colors whitespace-nowrap">
              Produits
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-primary-600 transition-colors whitespace-nowrap">
              À propos
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* User */}
            {session ? (
              <Link href="/account">
                <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth/login">
                <Button variant="outline" size="sm" className="hidden md:inline-flex">
                  Connexion
                </Button>
              </Link>
            )}

            {/* Cart */}
            <CartButton />

            {/* Mobile Menu Toggle */}
            <Button variant="ghost" size="sm" onClick={toggleMobileMenu} className="md:hidden">
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-4">
            <SearchBar />
            <nav className="flex flex-col space-y-4">
              <Link href="/products" className="text-gray-700 hover:text-primary-600 transition-colors">
                Produits
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-primary-600 transition-colors">
                À propos
              </Link>
              {session ? (
                <Link href="/account" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Mon compte
                </Link>
              ) : (
                <Link href="/auth/login" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Connexion
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
