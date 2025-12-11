'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { Facebook, Twitter, Instagram, Github, Mail, Phone, MapPin, ArrowUpRight, Heart } from 'lucide-react'
import { usePlatformName } from '@/lib/platform/PlatformSettingsProvider'
import { useTranslations } from 'next-intl'
import { LanguageSelector } from '../i18n/LanguageSelector'
import { CurrencySelector } from '../currency/CurrencySelector'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const platformName = usePlatformName()
  const t = useTranslations()
  const params = useParams()
  const locale = (params?.locale as string) || 'fr'

  return (
    <footer className="relative bg-gradient-to-b from-theme-background to-theme-surface border-t border-theme-border" style={{ fontFamily: 'var(--theme-font-body)' }}>
      {/* Top Border Gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-theme-primary/30 to-transparent" />

      <div className="mx-auto px-6 lg:px-8 py-16 lg:py-20" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-12">

          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href={`/${locale}`} className="inline-flex items-center group mb-6">
              <Image
                src="/images/logo.png"
                alt="GEM - Golden Era Marketplace"
                width={140}
                height={45}
                className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <p className="text-theme-text-secondary leading-relaxed mb-6 max-w-sm">
              {t('footer.description')}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {[
                { icon: Github, href: 'https://github.com/StudioCavalli/FoxCard', label: 'GitHub' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Facebook, href: '#', label: 'Facebook' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-2.5 text-theme-text-muted hover:text-theme-primary bg-theme-surface/50 hover:bg-theme-surface border border-theme-border-light hover:border-theme-border rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" strokeWidth={2} />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-theme-text mb-4 uppercase tracking-wider" style={{ fontFamily: 'var(--theme-font-heading)' }}>
              {t('common.products')}
            </h3>
            <ul className="space-y-3">
              {[
                { label: t('common.viewAll'), href: `/${locale}/products` },
                { label: t('header.newArrivals'), href: `/${locale}/products?sort=newest` },
                { label: t('header.bestSellers'), href: `/${locale}/products?sort=popular` },
                { label: t('header.deals'), href: `/${locale}/products?filter=sale` },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-sm text-theme-text-secondary hover:text-theme-primary transition-colors duration-200"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-theme-text mb-4 uppercase tracking-wider" style={{ fontFamily: 'var(--theme-font-heading)' }}>
              {t('footer.company')}
            </h3>
            <ul className="space-y-3">
              {[
                { label: t('footer.about'), href: `/${locale}/about` },
                { label: t('footer.blog'), href: `/${locale}/blog` },
                { label: t('footer.careers'), href: `/${locale}/careers` },
                { label: t('footer.contact'), href: `/${locale}/contact` },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-sm text-theme-text-secondary hover:text-theme-primary transition-colors duration-200"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-semibold text-theme-text mb-4 uppercase tracking-wider" style={{ fontFamily: 'var(--theme-font-heading)' }}>
              {t('footer.support')}
            </h3>
            <ul className="space-y-3">
              {[
                { label: t('footer.helpCenter'), href: `/${locale}/help` },
                { label: t('footer.documentation'), href: `/${locale}/docs` },
                { label: t('footer.myAccount'), href: `/${locale}/account` },
                { label: t('footer.orderTracking'), href: `/${locale}/orders` },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-sm text-theme-text-secondary hover:text-theme-primary transition-colors duration-200"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-theme-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-sm text-theme-text-muted">
              <span>© {currentYear} {platformName}.</span>
              <span className="hidden sm:inline">{t('footer.allRightsReserved')}.</span>
              <span className="inline-flex items-center gap-1">
                {t('footer.madeWith')} <Heart className="w-3 h-3 text-red-500 fill-red-500" /> {t('footer.by')} Foxcase
              </span>
            </div>

            {/* Language & Currency Selectors */}
            <div className="flex items-center gap-2">
              <LanguageSelector position="top" variant="compact" />
              <CurrencySelector position="top" variant="compact" />
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-6">
              {[
                { label: t('footer.privacyPolicy'), href: `/${locale}/privacy` },
                { label: t('footer.termsOfService'), href: `/${locale}/terms` },
                { label: t('footer.legal'), href: `/${locale}/legal` },
              ].map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-theme-text-muted hover:text-theme-primary transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-theme-primary/20 to-transparent" />
    </footer>
  )
}
