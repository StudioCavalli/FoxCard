'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Wine, X, ShieldCheck, Lock } from 'lucide-react'
import {
  ALCOHOL_LEGAL_MENTIONS,
  ALCOHOL_MINIMUM_AGE,
  getAgeVerificationStatus,
  setAgeVerificationStatus,
} from '@/lib/alcohol/age-verification'

interface AgeVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onVerified: () => void
  storeName?: string
}

export function AgeVerificationModal({
  isOpen,
  onClose,
  onVerified,
  storeName,
}: AgeVerificationModalProps) {
  const [isChecked, setIsChecked] = useState(false)

  // Check if already verified
  useEffect(() => {
    const { verified } = getAgeVerificationStatus()
    if (verified) {
      onVerified()
    }
  }, [onVerified])

  if (!isOpen) return null

  const handleVerify = () => {
    if (isChecked) {
      setAgeVerificationStatus(true)
      onVerified()
    }
  }

  const handleDecline = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleDecline}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-theme-surface border border-theme-border rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={handleDecline}
          className="absolute top-4 right-4 p-2 text-theme-text-muted hover:text-theme-text rounded-lg hover:bg-theme-background transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-red-500/30">
              <Wine className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-theme-text mb-2">
              Vérification de l'âge
            </h2>
            {storeName && (
              <p className="text-theme-text-muted text-sm">
                Pour accéder à <strong>{storeName}</strong>
              </p>
            )}
          </div>

          {/* Warning Box */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-amber-900 mb-1">
                  {ALCOHOL_LEGAL_MENTIONS.abuse_warning}
                </p>
                <p className="text-amber-700">
                  {ALCOHOL_LEGAL_MENTIONS.moderation}
                </p>
              </div>
            </div>
          </div>

          {/* Age requirement */}
          <div className="p-4 bg-theme-background border border-theme-border rounded-xl mb-6">
            <p className="text-center text-theme-text">
              Ce site contient des produits réservés aux personnes de{' '}
              <span className="font-bold text-red-600">
                {ALCOHOL_MINIMUM_AGE} ans et plus
              </span>
            </p>
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-3 p-4 bg-theme-background border border-theme-border rounded-xl mb-6 cursor-pointer hover:border-theme-primary/50 transition-colors">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded border-theme-border text-theme-primary focus:ring-theme-primary"
            />
            <span className="text-sm text-theme-text">
              Je certifie avoir{' '}
              <strong className="text-red-600">{ALCOHOL_MINIMUM_AGE} ans ou plus</strong>{' '}
              et je comprends que{' '}
              <strong>{ALCOHOL_LEGAL_MENTIONS.minors_sale.toLowerCase()}</strong>.
            </span>
          </label>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDecline}
              className="flex-1 px-4 py-3 bg-theme-background hover:bg-theme-surface border border-theme-border text-theme-text rounded-xl font-semibold transition-all"
            >
              Non, j'ai moins de {ALCOHOL_MINIMUM_AGE} ans
            </button>
            <button
              onClick={handleVerify}
              disabled={!isChecked}
              className="flex-1 px-4 py-3 bg-theme-primary hover:bg-theme-primary/90 disabled:bg-theme-border disabled:cursor-not-allowed text-theme-background rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              Confirmer
            </button>
          </div>

          {/* Legal footer */}
          <div className="mt-6 pt-4 border-t border-theme-border">
            <div className="flex items-center justify-center gap-2 text-xs text-theme-text-muted">
              <Lock className="w-3.5 h-3.5" />
              <span>Votre choix sera mémorisé pendant 24 heures</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
