import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getPlatformSettings } from '@/lib/platform/settings'
import {
  Shield,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle2,
  Coins,
  Wallet,
  BarChart3,
  Lock,
  Clock,
  ExternalLink,
  Gem,
  Search,
  ArrowLeftRight,
  MessageCircle,
} from 'lucide-react'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'goldenera' })
  const settings = await getPlatformSettings()
  const platformName = settings.platformName || 'GoldenEra Marketplace'

  return {
    title: `GoldenEra Blockchain - ${platformName}`,
    description: t('meta.description'),
    openGraph: {
      title: `GoldenEra Blockchain - ${platformName}`,
      description: t('meta.description'),
    },
  }
}

export default async function GoldenEraPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'goldenera' })

  const roadmapItems = [
    { key: 'architecture', status: 'done' as const },
    { key: 'dashboard', status: 'done' as const },
    { key: 'checkout', status: 'done' as const },
    { key: 'api', status: 'progress' as const },
    { key: 'mainnet', status: 'soon' as const },
  ]

  const statusConfig = {
    done: {
      label: t('roadmap.done'),
      className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      dotClassName: 'bg-emerald-500',
    },
    progress: {
      label: t('roadmap.inProgress'),
      className: 'bg-amber-100 text-amber-700 border-amber-200',
      dotClassName: 'bg-amber-500 animate-pulse',
    },
    soon: {
      label: t('roadmap.comingSoon'),
      className: 'bg-slate-100 text-slate-600 border-slate-200',
      dotClassName: 'bg-slate-400',
    },
  }

  return (
    <div style={{ fontFamily: 'var(--theme-font-body)' }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-yellow-50/50 to-orange-50/30" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-amber-200/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-yellow-200/20 to-transparent rounded-full blur-3xl" />

        <div
          className="relative mx-auto px-6 lg:px-8 py-24 lg:py-32"
          style={{ maxWidth: 'var(--theme-container-max-width)' }}
        >
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200/60 mb-8">
              <Gem className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">
                {t('hero.badge')}
              </span>
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 tracking-tight"
              style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.03em' }}
            >
              <span className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
                GoldenEra
              </span>{' '}
              Blockchain
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 mb-4 font-medium">
              {t('hero.subtitle')}
            </p>

            <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              {t('hero.description')}
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <a
                href="#sunpay"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 active:scale-[0.98]"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                {t('hero.discoverSunPay')}
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="https://goldenera.global"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-700 font-semibold rounded-xl border-2 border-slate-200 hover:border-amber-300 hover:text-amber-700 transition-all duration-200"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                {t('hero.visitWebsite')}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* What is GoldenEra Blockchain */}
      <section className="relative bg-white border-t border-slate-100">
        <div
          className="mx-auto px-6 lg:px-8 py-20 lg:py-28"
          style={{ maxWidth: 'var(--theme-container-max-width)' }}
        >
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
              style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
            >
              {t('about.title')}
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              {t('about.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group relative p-8 bg-gradient-to-b from-amber-50/80 to-white border border-amber-100 rounded-2xl hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3
                className="text-xl font-bold text-slate-900 mb-3"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                {t('about.goldBacked.title')}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {t('about.goldBacked.description')}
              </p>
            </div>

            <div className="group relative p-8 bg-gradient-to-b from-amber-50/80 to-white border border-amber-100 rounded-2xl hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h3
                className="text-xl font-bold text-slate-900 mb-3"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                {t('about.permissioned.title')}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {t('about.permissioned.description')}
              </p>
            </div>

            <div className="group relative p-8 bg-gradient-to-b from-amber-50/80 to-white border border-amber-100 rounded-2xl hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3
                className="text-xl font-bold text-slate-900 mb-3"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                {t('about.decentralized.title')}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {t('about.decentralized.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SunPay Integration */}
      <section id="sunpay" className="relative bg-gradient-to-b from-slate-50 to-white border-t border-slate-100">
        <div
          className="mx-auto px-6 lg:px-8 py-20 lg:py-28"
          style={{ maxWidth: 'var(--theme-container-max-width)' }}
        >
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200/60 mb-6">
              <Coins className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">SunPay</span>
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
              style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
            >
              {t('sunpay.title')}
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              {t('sunpay.description')}
            </p>
          </div>

          {/* 3-Step Flow */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="relative text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/20">
                <Wallet className="w-10 h-10 text-white" />
              </div>
              <div className="absolute top-10 left-[60%] right-0 hidden md:block">
                <div className="border-t-2 border-dashed border-amber-300 w-full" />
              </div>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold text-sm mb-4">
                1
              </span>
              <h3
                className="text-lg font-bold text-slate-900 mb-2"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                {t('sunpay.step1.title')}
              </h3>
              <p className="text-slate-600 text-sm">
                {t('sunpay.step1.description')}
              </p>
            </div>

            <div className="relative text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/20">
                <Coins className="w-10 h-10 text-white" />
              </div>
              <div className="absolute top-10 left-[60%] right-0 hidden md:block">
                <div className="border-t-2 border-dashed border-amber-300 w-full" />
              </div>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold text-sm mb-4">
                2
              </span>
              <h3
                className="text-lg font-bold text-slate-900 mb-2"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                {t('sunpay.step2.title')}
              </h3>
              <p className="text-slate-600 text-sm">
                {t('sunpay.step2.description')}
              </p>
            </div>

            <div className="relative text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/20">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold text-sm mb-4">
                3
              </span>
              <h3
                className="text-lg font-bold text-slate-900 mb-2"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                {t('sunpay.step3.title')}
              </h3>
              <p className="text-slate-600 text-sm">
                {t('sunpay.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="relative bg-white border-t border-slate-100">
        <div
          className="mx-auto px-6 lg:px-8 py-20 lg:py-28"
          style={{ maxWidth: 'var(--theme-container-max-width)' }}
        >
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
              style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
            >
              {t('benefits.title')}
            </h2>
            <p className="text-lg text-slate-600">
              {t('benefits.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* For Merchants */}
            <div className="p-8 bg-gradient-to-br from-amber-50 to-yellow-50/50 border border-amber-100 rounded-2xl">
              <h3
                className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                <BarChart3 className="w-6 h-6 text-amber-600" />
                {t('benefits.merchants.title')}
              </h3>
              <ul className="space-y-4">
                {['zeroChargebacks', 'lowFees', 'crossBorder', 'instantSettlement'].map((key) => (
                  <li key={key} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{t(`benefits.merchants.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Customers */}
            <div className="p-8 bg-gradient-to-br from-amber-50 to-yellow-50/50 border border-amber-100 rounded-2xl">
              <h3
                className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                <Wallet className="w-6 h-6 text-amber-600" />
                {t('benefits.customers.title')}
              </h3>
              <ul className="space-y-4">
                {['assetBacked', 'transparent', 'privacy', 'fast'].map((key) => (
                  <li key={key} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{t(`benefits.customers.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white border-t border-slate-100">
        <div
          className="mx-auto px-6 lg:px-8 py-20 lg:py-28"
          style={{ maxWidth: 'var(--theme-container-max-width)' }}
        >
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
              style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
            >
              {t('ecosystem.title')}
            </h2>
            <p className="text-lg text-slate-600">
              {t('ecosystem.description')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { key: 'wallet', icon: Wallet, code: 'GEW' },
              { key: 'scan', icon: Search, code: 'GES' },
              { key: 'exchange', icon: ArrowLeftRight, code: 'GEX' },
              { key: 'sunchat', icon: MessageCircle, code: 'SCH' },
            ].map(({ key, icon: Icon, code }) => (
              <div
                key={key}
                className="group p-6 bg-white border border-slate-200 rounded-2xl hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-200 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl flex items-center justify-center mb-4 group-hover:from-amber-500 group-hover:to-yellow-500 transition-all duration-300">
                  <Icon className="w-6 h-6 text-amber-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-xs font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded mb-2 inline-block">
                  {code}
                </span>
                <h3
                  className="text-lg font-bold text-slate-900 mb-1"
                  style={{ fontFamily: 'var(--theme-font-heading)' }}
                >
                  {t(`ecosystem.${key}.title`)}
                </h3>
                <p className="text-sm text-slate-600">
                  {t(`ecosystem.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="relative bg-white border-t border-slate-100">
        <div
          className="mx-auto px-6 lg:px-8 py-20 lg:py-28"
          style={{ maxWidth: 'var(--theme-container-max-width)' }}
        >
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
              style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
            >
              {t('roadmap.title')}
            </h2>
            <p className="text-lg text-slate-600">
              {t('roadmap.subtitle')}
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-amber-300 via-amber-200 to-slate-200" />

              <div className="space-y-8">
                {roadmapItems.map(({ key, status }) => {
                  const config = statusConfig[status]
                  return (
                    <div key={key} className="relative flex items-start gap-6 pl-0">
                      <div className="relative z-10 flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full border-4 border-white shadow-md flex items-center justify-center ${
                          status === 'done'
                            ? 'bg-emerald-500'
                            : status === 'progress'
                            ? 'bg-amber-500'
                            : 'bg-slate-300'
                        }`}>
                          {status === 'done' ? (
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          ) : status === 'progress' ? (
                            <Zap className="w-6 h-6 text-white" />
                          ) : (
                            <Clock className="w-6 h-6 text-white" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 pt-1.5">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {t(`roadmap.items.${key}`)}
                          </h3>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.className}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${config.dotClassName}`} />
                            {config.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div
          className="relative mx-auto px-6 lg:px-8 py-20 lg:py-28 text-center"
          style={{ maxWidth: 'var(--theme-container-max-width)' }}
        >
          <h2
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
          >
            {t('cta.title')}
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            {t('cta.description')}
          </p>
          <a
            href="https://goldenera.global"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-amber-700 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
            style={{ fontFamily: 'var(--theme-font-heading)' }}
          >
            {t('cta.button')}
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </section>
    </div>
  )
}
