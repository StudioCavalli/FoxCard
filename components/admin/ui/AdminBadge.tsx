'use client'

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'

interface AdminBadgeProps {
  variant?: BadgeVariant
  icon?: LucideIcon
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md'
  dot?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  danger: 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  purple: 'bg-violet-50 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400',
}

const dotStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  purple: 'bg-violet-500',
}

export function AdminBadge({
  variant = 'default',
  icon: Icon,
  children,
  className,
  size = 'md',
  dot = false,
}: AdminBadgeProps) {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  }

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotStyles[variant])} />}
      {Icon && !dot && <Icon className={cn(iconSize[size], 'flex-shrink-0')} />}
      {children}
    </span>
  )
}
