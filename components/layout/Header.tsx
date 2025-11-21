'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Menu, X, User, ShoppingBag, Search } from 'lucide-react'
import { useUIStore } from '@/lib/store/ui'
import { Button } from '@/components/ui/Button'
import { CartButton } from './CartButton'
import { SearchBar } from './SearchBar'
import { LanguageSelector } from '../i18n/LanguageSelector'
import { CurrencySelector } from '../currency/CurrencySelector'
import { useEffect, useState } from 'react'

export function Header() {
  const { isMobileMenuOpen, toggleMobileMenu } = useUIStore()
  const { data: session } = useSession()
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          isScrolled
            ? 'bg-theme-surface/80 backdrop-blur-xl shadow-lg shadow-theme-primary/5'
            : 'bg-theme-surface/60 backdrop-blur-md'
        }`}
        style={{ fontFamily: 'var(--theme-font-body)' }}
      >
        {/* Premium container with max-width */}
        <div className="mx-auto px-6 lg:px-8" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
          <div className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled ? 'h-16' : 'h-20'
          }`}>

            {/* Logo with premium animation */}
            <Link
              href="/"
              className="flex items-center gap-3 group relative z-10"
            >
              <div className={`relative transition-all duration-300 ${
                isScrolled ? 'w-9 h-9' : 'w-11 h-11'
              }`}>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-theme-primary to-theme-accent rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Icon */}
                <div className="relative w-full h-full bg-gradient-to-br from-theme-primary to-theme-accent rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                  <ShoppingBag className="w-5 h-5 text-theme-background" strokeWidth={2.5} />
                </div>
              </div>
              <span
                className={`font-bold text-theme-text transition-all duration-300 ${
                  isScrolled ? 'text-xl' : 'text-2xl'
                }`}
                style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
              >
                FoxCard
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {[
                { href: '/products', label: 'Produits' },
                { href: '/stores', label: 'Boutiques' },
                { href: '/categories', label: 'Catégories' },
                { href: '/about', label: 'À propos' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative px-4 py-2 text-sm font-medium text-theme-text-secondary hover:text-theme-primary transition-all duration-200 group"
                >
                  <span className="relative z-10">{item.label}</span>
                  {/* Hover background */}
                  <div className="absolute inset-0 bg-theme-primary/5 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200 origin-center" />
                  {/* Active indicator */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-theme-primary group-hover:w-3/4 transition-all duration-300" />
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Search - Desktop */}
              <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-theme-surface/50 hover:bg-theme-surface border border-theme-border rounded-full text-sm text-theme-text-secondary hover:text-theme-text transition-all duration-200 group">
                <Search className="w-4 h-4 text-theme-text-muted group-hover:text-theme-primary transition-colors" />
                <span className="hidden lg:inline">Rechercher...</span>
                <kbd className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-theme-background/50 border border-theme-border-light rounded">
                  <span className="text-[10px]">⌘</span>K
                </kbd>
              </button>

              {/* Language Selector */}
              <div className="hidden md:block">
                <LanguageSelector />
              </div>

              {/* Currency Selector */}
              <div className="hidden md:block">
                <CurrencySelector />
              </div>

              {/* User */}
              {session ? (
                <Link href="/account" className="hidden md:block">
                  <button className="relative p-2.5 text-theme-text-secondary hover:text-theme-primary bg-theme-surface/50 hover:bg-theme-surface border border-theme-border rounded-full transition-all duration-200 hover:scale-105 active:scale-95">
                    <User className="w-5 h-5" strokeWidth={2} />
                  </button>
                </Link>
              ) : (
                <Link href="/auth/login" className="hidden md:block">
                  <button className="px-4 py-2 text-sm font-medium text-theme-text-secondary hover:text-theme-primary bg-theme-surface/50 hover:bg-theme-surface border border-theme-border rounded-full transition-all duration-200 hover:scale-105 active:scale-95">
                    Connexion
                  </button>
                </Link>
              )}

              {/* Cart */}
              <CartButton />

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2.5 text-theme-text-secondary hover:text-theme-primary bg-theme-surface/50 hover:bg-theme-surface border border-theme-border rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" strokeWidth={2} />
                ) : (
                  <Menu className="w-5 h-5" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-theme-border to-transparent" />
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-theme-primary/20 backdrop-blur-sm"
            onClick={toggleMobileMenu}
          />

          {/* Menu Panel */}
          <div className="absolute top-20 right-0 bottom-0 w-full max-w-sm bg-theme-surface/95 backdrop-blur-xl border-l border-theme-border shadow-2xl animate-slide-in-right">
            <div className="flex flex-col h-full p-6">
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-muted" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="w-full pl-12 pr-4 py-3 bg-theme-background border border-theme-border rounded-xl text-theme-text placeholder:text-theme-text-muted focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all"
                  />
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-1">
                {[
                  { href: '/products', label: 'Produits' },
                  { href: '/stores', label: 'Boutiques' },
                  { href: '/categories', label: 'Catégories' },
                  { href: '/about', label: 'À propos' },
                  session ? { href: '/account', label: 'Mon compte' } : { href: '/auth/login', label: 'Connexion' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={toggleMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 text-theme-text hover:text-theme-primary bg-transparent hover:bg-theme-primary/5 rounded-xl font-medium transition-all duration-200"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Language & Currency Selectors - Mobile */}
              <div className="pb-6 space-y-3">
                <LanguageSelector />
                <CurrencySelector />
              </div>

              {/* Footer */}
              <div className="pt-6 border-t border-theme-border text-sm text-theme-text-muted">
                <p>© 2024 FoxCard</p>
                <p className="mt-1">E-commerce open source</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-20" />
    </>
  )
}
