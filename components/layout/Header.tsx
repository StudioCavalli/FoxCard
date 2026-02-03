'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Menu, X, User, ShoppingBag, Search } from 'lucide-react'
import { useUIStore } from '@/lib/store/ui'
import { CartButton } from './CartButton'
import { SearchBar } from './SearchBar'
import { PublicStoreSelector } from './PublicStoreSelector'
import { usePlatformName } from '@/lib/platform/PlatformSettingsProvider'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

export function Header() {
  const { isMobileMenuOpen, toggleMobileMenu } = useUIStore()
  const { data: session } = useSession()
  const platformName = usePlatformName()
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const t = useTranslations()
  const params = useParams()
  const locale = (params?.locale as string) || 'fr'

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

            {/* Logo GEM */}
            <Link
              href={`/${locale}`}
              className="flex items-center group relative z-10"
            >
              <div className={`relative transition-all duration-300 ${
                isScrolled ? 'h-10' : 'h-12'
              }`}>
                <Image
                  src="/images/logo.png"
                  alt="GEM - Golden Era Marketplace"
                  width={isScrolled ? 140 : 160}
                  height={isScrolled ? 40 : 48}
                  className="h-full w-auto object-contain transform group-hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation - Simplified */}
            <nav className="hidden lg:flex items-center gap-1">
              {[
                { href: `/${locale}`, label: t('common.home') },
                { href: `/${locale}/stores`, label: t('store.title') },
                { href: `/${locale}/categories`, label: t('common.categories') },
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

            {/* Actions - Simplified */}
            <div className="flex items-center gap-2">
              {/* Search - Desktop */}
              <div className="hidden md:block">
                <SearchBar />
              </div>

              {/* Store Selector */}
              <div className="hidden md:block">
                <PublicStoreSelector />
              </div>

              {/* User */}
              {session ? (
                <Link href={`/${locale}/account`} className="hidden md:block">
                  <button className="relative p-2.5 text-theme-text-secondary hover:text-theme-primary bg-theme-surface/50 hover:bg-theme-surface border border-theme-border rounded-full transition-all duration-200 hover:scale-105 active:scale-95">
                    <User className="w-5 h-5" strokeWidth={2} />
                  </button>
                </Link>
              ) : (
                <Link href={`/${locale}/auth/login`} className="hidden md:block">
                  <button className="px-4 py-2 text-sm font-medium text-theme-text-secondary hover:text-theme-primary bg-theme-surface/50 hover:bg-theme-surface border border-theme-border rounded-full transition-all duration-200 hover:scale-105 active:scale-95">
                    {t('common.login')}
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
                    placeholder={t('common.searchPlaceholder')}
                    className="w-full pl-12 pr-4 py-3 bg-theme-background border border-theme-border rounded-xl text-theme-text placeholder:text-theme-text-muted focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-all"
                  />
                </div>
              </div>

              {/* Navigation - Mobile Simplified */}
              <nav className="flex-1 space-y-1">
                {[
                  { href: `/${locale}`, label: t('common.home') },
                  { href: `/${locale}/stores`, label: t('store.title') },
                  { href: `/${locale}/categories`, label: t('common.categories') },
                  session ? { href: `/${locale}/account`, label: t('common.account') } : { href: `/${locale}/auth/login`, label: t('common.login') },
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

              {/* Store Selector - Mobile */}
              <div className="pb-6 space-y-3">
                <PublicStoreSelector />
              </div>

              {/* Footer */}
              <div className="pt-6 border-t border-theme-border text-sm text-theme-text-muted">
                <p>© {new Date().getFullYear()} {platformName}</p>
                <p className="mt-1">{t('footer.description')}</p>
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
