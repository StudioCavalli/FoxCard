'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Wine, ShieldCheck, Ban } from 'lucide-react'
import {
  ALCOHOL_LEGAL_MENTIONS,
  ALCOHOL_MINIMUM_AGE,
  ALCOHOL_RESTRICTED_COUNTRIES,
  isCountryAlcoholRestricted,
} from '@/lib/alcohol/age-verification'

interface AlcoholCheckoutVerificationProps {
  country: string
  isVerified: boolean
  onVerificationChange: (verified: boolean) => void
  className?: string
}

/**
 * Checkout step verification for alcohol products
 * - Shows country restriction warning if applicable
 * - Requires checkbox confirmation for age
 */
export function AlcoholCheckoutVerification({
  country,
  isVerified,
  onVerificationChange,
  className = '',
}: AlcoholCheckoutVerificationProps) {
  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(() => {
    // Check if country is blocked
    const countryCode = getCountryCode(country)
    setIsBlocked(isCountryAlcoholRestricted(countryCode))
  }, [country])

  // If country is blocked, show warning
  if (isBlocked) {
    return (
      <div className={`p-6 bg-red-500/10 border border-red-500/20 rounded-2xl ${className}`}>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Ban className="w-7 h-7 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-900 mb-2">
              Livraison impossible dans ce pays
            </h3>
            <p className="text-sm text-red-700 mb-3">
              La vente et la livraison de produits alcoolisés sont interdites dans le pays de
              destination sélectionné (<strong>{country}</strong>).
            </p>
            <p className="text-xs text-red-600">
              Veuillez retirer les produits alcoolisés de votre panier pour continuer.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-6 bg-theme-surface border border-theme-border rounded-2xl ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
          <Wine className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-theme-text">
            Vérification d'âge
          </h2>
          <p className="text-sm text-theme-text-muted">
            Votre commande contient des produits alcoolisés
          </p>
        </div>
      </div>

      {/* Warning Box */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-amber-900">
              {ALCOHOL_LEGAL_MENTIONS.abuse_warning}
            </p>
            <p className="text-sm text-amber-700">
              {ALCOHOL_LEGAL_MENTIONS.moderation}
            </p>
          </div>
        </div>
      </div>

      {/* Age verification checkbox */}
      <label className="flex items-start gap-4 p-4 bg-theme-background border-2 border-theme-border rounded-xl cursor-pointer hover:border-theme-primary/50 transition-all">
        <div className="relative mt-0.5">
          <input
            type="checkbox"
            checked={isVerified}
            onChange={(e) => onVerificationChange(e.target.checked)}
            className="peer w-6 h-6 rounded-md border-2 border-theme-border text-theme-primary focus:ring-theme-primary focus:ring-2 focus:ring-offset-2"
          />
          {isVerified && (
            <ShieldCheck className="absolute -top-1 -right-1 w-4 h-4 text-green-500" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-theme-text mb-1">
            Je certifie avoir {ALCOHOL_MINIMUM_AGE} ans ou plus *
          </p>
          <p className="text-xs text-theme-text-muted">
            En cochant cette case, je certifie sur l'honneur avoir au moins{' '}
            <strong>{ALCOHOL_MINIMUM_AGE} ans</strong> et je reconnais que{' '}
            <strong>{ALCOHOL_LEGAL_MENTIONS.minors_sale.toLowerCase()}</strong>.
            Une pièce d'identité pourra être demandée à la livraison.
          </p>
        </div>
      </label>

      {/* Legal mentions */}
      <div className="mt-4 pt-4 border-t border-theme-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-theme-text-muted">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>{ALCOHOL_LEGAL_MENTIONS.minors_sale}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
            <span>Contrôle d'âge à la livraison possible</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Helper to extract country code from country name
 * In a real app, this would use a proper country/locale library
 */
function getCountryCode(country: string): string {
  const countryMap: Record<string, string> = {
    'france': 'FR',
    'belgique': 'BE',
    'suisse': 'CH',
    'canada': 'CA',
    'saudi arabia': 'SA',
    'arabie saoudite': 'SA',
    'kuwait': 'KW',
    'koweït': 'KW',
    'iran': 'IR',
    'afghanistan': 'AF',
    'libya': 'LY',
    'libye': 'LY',
    'sudan': 'SD',
    'soudan': 'SD',
    'yemen': 'YE',
    'yémen': 'YE',
    'brunei': 'BN',
    'pakistan': 'PK',
    'bangladesh': 'BD',
    'maldives': 'MV',
    'somalia': 'SO',
    'somalie': 'SO',
  }

  return countryMap[country.toLowerCase()] || ''
}
