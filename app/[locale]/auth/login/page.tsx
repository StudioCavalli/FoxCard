'use client'

import { useState, Suspense, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, ArrowLeft, AlertCircle, AlertTriangle } from 'lucide-react'
import { usePlatformName, usePlatformSettings } from '@/lib/platform/PlatformSettingsProvider'
import { useTranslations } from 'next-intl'

function LoginForm() {
  const t = useTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()
  const platformName = usePlatformName()
  const { settings } = usePlatformSettings()
  const from = searchParams.get('from') || '/account'
  const registered = searchParams.get('registered') === 'true'

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false)

  // Check maintenance mode
  useEffect(() => {
    setIsMaintenanceMode(settings.maintenanceMode)
  }, [settings.maintenanceMode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError(t('auth.invalidCredentials'))
      } else {
        router.push(from)
        router.refresh()
      }
    } catch (error) {
      setError(t('auth.genericError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-background via-theme-surface/30 to-theme-background flex items-center justify-center px-4 py-16" style={{ fontFamily: 'var(--theme-font-body)' }}>
      {/* Background Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-theme-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-theme-accent/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <Link
          href="/"
          className="group inline-flex items-center text-theme-text-secondary hover:text-theme-primary mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
          {t('auth.backToHome')}
        </Link>

        <div className="p-8 bg-theme-surface/80 backdrop-blur-xl border border-theme-border rounded-2xl shadow-2xl shadow-theme-primary/10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-theme-primary to-theme-accent rounded-2xl blur-xl opacity-30" />
              <div className="relative w-16 h-16 bg-gradient-to-br from-theme-primary to-theme-accent rounded-2xl flex items-center justify-center">
                <Lock className="w-8 h-8 text-theme-background" />
              </div>
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold text-theme-text mb-2"
              style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
            >
              {t('auth.connection')}
            </h1>
            <p className="text-theme-text-secondary text-lg">{t('auth.accessAccount', { platform: platformName })}</p>
          </div>

          {/* Maintenance Mode Warning */}
          {isMaintenanceMode && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-semibold mb-1">{t('auth.maintenanceTitle')}</p>
                <p>{t('auth.maintenanceDesc')}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {registered && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-green-600 font-medium">
                {t('auth.accountCreated')}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-sm font-semibold text-theme-text mb-2"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                {t('auth.email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-theme-text-muted" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-theme-background border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-semibold text-theme-text mb-2"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                {t('auth.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-theme-text-muted" />
                </div>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-theme-background border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center group cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-theme-border text-theme-primary focus:ring-theme-primary/20 cursor-pointer"
                />
                <span className="ml-2 text-sm text-theme-text-secondary group-hover:text-theme-text transition-colors">
                  {t('auth.rememberMe')}
                </span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-theme-primary hover:text-theme-primary/80 font-medium transition-colors"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-8 py-4 bg-theme-primary hover:bg-theme-primary/90 disabled:bg-theme-primary/50 text-theme-background rounded-xl font-semibold text-lg shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              style={{ fontFamily: 'var(--theme-font-heading)' }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('auth.loggingIn')}
                </>
              ) : (
                t('auth.loginButton')
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-theme-border"></div>
            <span className="px-4 text-sm text-theme-text-muted">{t('auth.or')}</span>
            <div className="flex-1 border-t border-theme-border"></div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-theme-text-secondary">
              {t('auth.noAccount')}{' '}
              <Link
                href="/auth/register"
                className="text-theme-primary hover:text-theme-primary/80 font-semibold transition-colors"
              >
                {t('auth.createAccount')}
              </Link>
            </p>
          </div>

          {/* Demo Account */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-sm text-blue-600 font-semibold mb-2" style={{ fontFamily: 'var(--theme-font-heading)' }}>
              {t('auth.demoAccount')}
            </p>
            <p className="text-xs text-blue-600 font-mono">
              Email: admin@foxcard.com<br />
              {t('auth.password')}: admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-theme-background" style={{ fontFamily: 'var(--theme-font-body)' }}>
          <div className="text-center">
            <div className="w-16 h-16 bg-theme-surface border border-theme-border rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Lock className="w-8 h-8 text-theme-text-muted" />
            </div>
            <p className="text-theme-text-secondary"></p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
