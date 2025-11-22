'use client'

import { Heart, Package, Shield, Users } from 'lucide-react'
import { usePlatformSettings } from '@/lib/platform/PlatformSettingsProvider'
import { useTranslations } from 'next-intl'

export default function AboutPage() {
  const { settings } = usePlatformSettings()
  const t = useTranslations('about')
  return (
    <div style={{ fontFamily: 'var(--theme-font-body)' }}>
      <div className="mx-auto px-6 lg:px-8 py-16" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1
            className="text-5xl md:text-6xl font-bold text-theme-text mb-6"
            style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.03em' }}
          >
            {t('title')}{' '}
            <span className="relative inline-block">
              <span className="absolute inset-0 bg-gradient-to-r from-theme-primary to-theme-accent blur-xl opacity-30" />
              <span className="relative bg-gradient-to-r from-theme-primary to-theme-accent bg-clip-text text-transparent">
                {settings.platformName}
              </span>
            </span>
          </h1>
          <p className="text-xl text-theme-text-secondary leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        {/* Mission */}
        <div className="p-12 bg-theme-surface border border-theme-border rounded-2xl mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-theme-primary/5 rounded-full blur-3xl" />
          <div className="relative max-w-3xl mx-auto text-center">
            <h2
              className="text-3xl md:text-4xl font-bold text-theme-text mb-4"
              style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
            >
              {t('mission.title')}
            </h2>
            <p className="text-lg text-theme-text-secondary leading-relaxed">
              {t('mission.description')}
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="group p-6 bg-theme-surface border border-theme-border rounded-2xl text-center hover:shadow-xl hover:shadow-theme-primary/10 transition-all duration-300 hover:-translate-y-1">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-red-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3
              className="font-bold text-theme-text mb-2"
              style={{ fontFamily: 'var(--theme-font-heading)' }}
            >
              {t('values.openSource.title')}
            </h3>
            <p className="text-sm text-theme-text-secondary">
              {t('values.openSource.description')}
            </p>
          </div>

          <div className="group p-6 bg-theme-surface border border-theme-border rounded-2xl text-center hover:shadow-xl hover:shadow-theme-primary/10 transition-all duration-300 hover:-translate-y-1">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-theme-accent/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-theme-primary to-theme-accent rounded-xl flex items-center justify-center mx-auto">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3
              className="font-bold text-theme-text mb-2"
              style={{ fontFamily: 'var(--theme-font-heading)' }}
            >
              {t('values.free.title')}
            </h3>
            <p className="text-sm text-theme-text-secondary">
              {t('values.free.description')}
            </p>
          </div>

          <div className="group p-6 bg-theme-surface border border-theme-border rounded-2xl text-center hover:shadow-xl hover:shadow-theme-primary/10 transition-all duration-300 hover:-translate-y-1">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-yellow-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3
              className="font-bold text-theme-text mb-2"
              style={{ fontFamily: 'var(--theme-font-heading)' }}
            >
              {t('values.secure.title')}
            </h3>
            <p className="text-sm text-theme-text-secondary">
              {t('values.secure.description')}
            </p>
          </div>

          <div className="group p-6 bg-theme-surface border border-theme-border rounded-2xl text-center hover:shadow-xl hover:shadow-theme-primary/10 transition-all duration-300 hover:-translate-y-1">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3
              className="font-bold text-theme-text mb-2"
              style={{ fontFamily: 'var(--theme-font-heading)' }}
            >
              {t('values.community.title')}
            </h3>
            <p className="text-sm text-theme-text-secondary">
              {t('values.community.description')}
            </p>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold text-theme-text mb-8 text-center"
            style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
          >
            {t('tech.title')}
          </h2>
          <div className="p-8 bg-theme-surface border border-theme-border rounded-2xl">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3
                  className="font-bold text-theme-text text-xl mb-4"
                  style={{ fontFamily: 'var(--theme-font-heading)' }}
                >
                  Frontend
                </h3>
                <ul className="space-y-2 text-theme-text-secondary">
                  <li>• Next.js 14+ {t('tech.withAppRouter')}</li>
                  <li>• React 18+ {t('tech.withTypeScript')}</li>
                  <li>• Tailwind CSS {t('tech.forDesign')}</li>
                  <li>• Zustand {t('tech.forState')}</li>
                </ul>
              </div>
              <div>
                <h3
                  className="font-bold text-theme-text text-xl mb-4"
                  style={{ fontFamily: 'var(--theme-font-heading)' }}
                >
                  Backend
                </h3>
                <ul className="space-y-2 text-theme-text-secondary">
                  <li>• tRPC {t('tech.forAPIs')}</li>
                  <li>• Prisma ORM {t('tech.withMongoDB')}</li>
                  <li>• NextAuth.js {t('tech.forAuth')}</li>
                  <li>• {t('tech.multiTenant')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="relative p-12 bg-gradient-to-r from-theme-primary to-theme-accent rounded-3xl text-center text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="relative">
            <h2
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
            >
              {t('cta.title')}
            </h2>
            <p className="text-xl mb-8 opacity-90">
              {t('cta.subtitle')}
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="https://github.com/Foxcase/GoldenEra"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                {t('cta.viewOnGithub')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
