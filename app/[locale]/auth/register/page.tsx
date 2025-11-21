'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Mail, Lock, User, ArrowLeft, AlertCircle, XCircle, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [registrationDisabled, setRegistrationDisabled] = useState(false)
  const [platformName, setPlatformName] = useState('FoxCard')
  const [checkingSettings, setCheckingSettings] = useState(true)

  // Check if registration is allowed
  useEffect(() => {
    async function checkSettings() {
      try {
        const response = await fetch('/api/platform/settings')
        if (response.ok) {
          const settings = await response.json()
          setRegistrationDisabled(!settings.allowRegistration)
          if (settings.platformName) {
            setPlatformName(settings.platformName)
          }
        }
      } catch (error) {
        console.error('Error fetching platform settings:', error)
      } finally {
        setCheckingSettings(false)
      }
    }
    checkSettings()
  }, [])

  const registerMutation = trpc.user.register.useMutation({
    onSuccess: () => {
      setSuccess(true)
      setTimeout(() => {
        router.push('/auth/login?registered=true')
      }, 1500)
    },
    onError: (error) => {
      setError(error.message)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres')
      return
    }

    if (formData.name.length < 2) {
      setError('Le nom doit contenir au moins 2 caracteres')
      return
    }

    registerMutation.mutate({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    })
  }

  // Loading state
  if (checkingSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theme-background via-theme-surface/30 to-theme-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-theme-primary" />
      </div>
    )
  }

  // Registration disabled
  if (registrationDisabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theme-background via-theme-surface/30 to-theme-background flex items-center justify-center px-4 py-16">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-theme-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-theme-accent/10 rounded-full blur-3xl" />

        <div className="relative w-full max-w-md">
          <Link
            href="/"
            className="group inline-flex items-center text-theme-text-secondary hover:text-theme-primary mb-6 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
            Retour a l'accueil
          </Link>

          <div className="p-8 bg-theme-surface/80 backdrop-blur-xl border border-theme-border rounded-2xl shadow-2xl shadow-theme-primary/10 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>

            <h1 className="text-2xl font-bold text-theme-text mb-4">
              Inscriptions desactivees
            </h1>

            <p className="text-theme-text-secondary mb-6">
              Les inscriptions sont temporairement desactivees sur {platformName}.
              Veuillez reessayer plus tard ou contacter le support.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href="/auth/login"
                className="w-full px-6 py-3 bg-theme-primary hover:bg-theme-primary/90 text-theme-background rounded-xl font-semibold transition-colors"
              >
                Se connecter
              </Link>
              <Link
                href="/"
                className="w-full px-6 py-3 border border-theme-border hover:bg-theme-surface text-theme-text rounded-xl font-semibold transition-colors"
              >
                Retour a l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
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
          Retour a l'accueil
        </Link>

        <div className="p-8 bg-theme-surface/80 backdrop-blur-xl border border-theme-border rounded-2xl shadow-2xl shadow-theme-primary/10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-theme-primary to-theme-accent rounded-2xl blur-xl opacity-30" />
              <div className="relative w-16 h-16 bg-gradient-to-br from-theme-primary to-theme-accent rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8 text-theme-background" />
              </div>
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold text-theme-text mb-2"
              style={{ fontFamily: 'var(--theme-font-heading)', letterSpacing: '-0.02em' }}
            >
              Creer un compte
            </h1>
            <p className="text-theme-text-secondary text-lg">Rejoignez {platformName} gratuitement</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-green-600 font-medium">
                Compte cree avec succes ! Redirection vers la page de connexion...
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
                Nom complet
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-theme-text-muted" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-theme-background border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
                  placeholder="Jean Dupont"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-semibold text-theme-text mb-2"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                Email
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
                Mot de passe
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
              <p className="text-xs text-theme-text-muted mt-1.5">
                Minimum 6 caracteres
              </p>
            </div>

            <div>
              <label
                className="block text-sm font-semibold text-theme-text mb-2"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-theme-text-muted" />
                </div>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-theme-background border border-theme-border text-theme-text placeholder:text-theme-text-muted focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                required
                className="w-4 h-4 rounded border-theme-border text-theme-primary focus:ring-theme-primary/20 cursor-pointer mt-1 mr-3"
              />
              <label className="text-sm text-theme-text-secondary">
                J'accepte les{' '}
                <Link href="/terms" className="text-theme-primary hover:text-theme-primary/80 font-medium transition-colors">
                  conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link href="/privacy" className="text-theme-primary hover:text-theme-primary/80 font-medium transition-colors">
                  politique de confidentialite
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending || success}
              className="w-full px-8 py-4 bg-theme-primary hover:bg-theme-primary/90 disabled:bg-theme-primary/50 text-theme-background rounded-xl font-semibold text-lg shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              style={{ fontFamily: 'var(--theme-font-heading)' }}
            >
              {registerMutation.isPending ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creation en cours...
                </>
              ) : success ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Compte cree !
                </>
              ) : (
                'Creer mon compte'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-theme-border"></div>
            <span className="px-4 text-sm text-theme-text-muted">ou</span>
            <div className="flex-1 border-t border-theme-border"></div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-theme-text-secondary">
              Vous avez deja un compte ?{' '}
              <Link
                href="/auth/login"
                className="text-theme-primary hover:text-theme-primary/80 font-semibold transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
