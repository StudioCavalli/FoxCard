'use client'

import { AlertTriangle, Wine } from 'lucide-react'
import { ALCOHOL_LEGAL_MENTIONS, ALCOHOL_MINIMUM_AGE } from '@/lib/alcohol/age-verification'

interface AlcoholLegalBadgeProps {
  variant?: 'compact' | 'full' | 'inline'
  className?: string
}

/**
 * Legal badge for alcohol products
 * Required on all product pages/cards for alcohol commerce type
 */
export function AlcoholLegalBadge({ variant = 'compact', className = '' }: AlcoholLegalBadgeProps) {
  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-md text-xs text-red-600 font-medium ${className}`}>
        <Wine className="w-3 h-3" />
        <span>{ALCOHOL_MINIMUM_AGE}+</span>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg ${className}`}>
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-xs text-amber-700 font-medium">
          {ALCOHOL_LEGAL_MENTIONS.minors_sale}
        </p>
      </div>
    )
  }

  // Full variant
  return (
    <div className={`p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-amber-900">
            {ALCOHOL_LEGAL_MENTIONS.abuse_warning}
          </p>
          <p className="text-xs text-amber-700">
            {ALCOHOL_LEGAL_MENTIONS.moderation}
          </p>
          <p className="text-xs text-amber-700 font-semibold">
            {ALCOHOL_LEGAL_MENTIONS.minors_sale}
          </p>
        </div>
      </div>
    </div>
  )
}
