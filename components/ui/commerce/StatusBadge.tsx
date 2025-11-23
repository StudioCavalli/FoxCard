'use client'

import { cn } from '@/lib/utils'

export type StatusType =
  | 'success' | 'warning' | 'error' | 'info' | 'neutral'
  | 'confirmed' | 'pending' | 'cancelled' | 'completed'
  | 'active' | 'inactive' | 'expired' | 'draft'
  | 'paid' | 'unpaid' | 'refunded' | 'partial'
  | 'available' | 'unavailable' | 'limited' | 'soldout'

interface StatusBadgeProps {
  status: StatusType
  label?: string
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
  className?: string
}

const statusConfig: Record<StatusType, { bg: string; text: string; label: string }> = {
  // Generic statuses
  success: { bg: 'bg-green-100', text: 'text-green-800', label: 'Succès' },
  warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Attention' },
  error: { bg: 'bg-red-100', text: 'text-red-800', label: 'Erreur' },
  info: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Info' },
  neutral: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Neutre' },

  // Booking statuses
  confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmé' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulé' },
  completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Terminé' },

  // General states
  active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Actif' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactif' },
  expired: { bg: 'bg-red-100', text: 'text-red-800', label: 'Expiré' },
  draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Brouillon' },

  // Payment statuses
  paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Payé' },
  unpaid: { bg: 'bg-red-100', text: 'text-red-800', label: 'Impayé' },
  refunded: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Remboursé' },
  partial: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Partiel' },

  // Availability statuses
  available: { bg: 'bg-green-100', text: 'text-green-800', label: 'Disponible' },
  unavailable: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Indisponible' },
  limited: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Limité' },
  soldout: { bg: 'bg-red-100', text: 'text-red-800', label: 'Épuisé' },
}

export function StatusBadge({
  status,
  label,
  size = 'md',
  dot = false,
  className
}: StatusBadgeProps) {
  const config = statusConfig[status]

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        config.bg,
        config.text,
        sizeClasses[size],
        className
      )}
    >
      {dot && (
        <span className={cn(
          'rounded-full',
          size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-2.5 h-2.5',
          status === 'success' || status === 'confirmed' || status === 'active' || status === 'paid' || status === 'available'
            ? 'bg-green-500'
            : status === 'warning' || status === 'pending' || status === 'limited' || status === 'partial'
            ? 'bg-yellow-500'
            : status === 'error' || status === 'cancelled' || status === 'expired' || status === 'unpaid' || status === 'soldout'
            ? 'bg-red-500'
            : 'bg-gray-500'
        )} />
      )}
      {label || config.label}
    </span>
  )
}
