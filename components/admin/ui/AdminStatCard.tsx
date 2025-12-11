'use client'

import { cn } from '@/lib/utils'
import { LucideIcon, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import Link from 'next/link'

type StatVariant = 'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'slate'

interface AdminStatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  variant?: StatVariant
  trend?: {
    value: number
    label?: string
  }
  href?: string
  subtitle?: string
  className?: string
  onClick?: () => void
}

const variantStyles: Record<StatVariant, { bg: string; icon: string; trend: string }> = {
  violet: {
    bg: 'bg-gradient-to-br from-primary-500/10 to-primary-500/10 dark:from-primary-500/20 dark:to-primary-500/20',
    icon: 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30',
    trend: 'text-primary-600 dark:text-primary-400',
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20',
    icon: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30',
    trend: 'text-blue-600 dark:text-blue-400',
  },
  emerald: {
    bg: 'bg-gradient-to-br from-emerald-500/10 to-green-500/10 dark:from-emerald-500/20 dark:to-green-500/20',
    icon: 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30',
    trend: 'text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20',
    icon: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30',
    trend: 'text-amber-600 dark:text-amber-400',
  },
  rose: {
    bg: 'bg-gradient-to-br from-rose-500/10 to-primary-400/10 dark:from-rose-500/20 dark:to-primary-400/20',
    icon: 'bg-gradient-to-br from-rose-500 to-primary-500 text-white shadow-lg shadow-rose-500/30',
    trend: 'text-rose-600 dark:text-rose-400',
  },
  slate: {
    bg: 'bg-slate-50 dark:bg-slate-800/50',
    icon: 'bg-slate-600 dark:bg-slate-500 text-white shadow-lg shadow-slate-500/30',
    trend: 'text-slate-600 dark:text-slate-400',
  },
}

export function AdminStatCard({
  title,
  value,
  icon: Icon,
  variant = 'violet',
  trend,
  href,
  subtitle,
  className,
  onClick,
}: AdminStatCardProps) {
  const styles = variantStyles[variant]

  const content = (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl p-5 transition-all duration-300',
        styles.bg,
        (href || onClick) && 'hover:scale-[1.02] cursor-pointer group',
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/5 dark:bg-white/10" />
      <div className="absolute -right-2 -top-2 w-16 h-16 rounded-full bg-white/5 dark:bg-white/10" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', styles.icon)}>
            <Icon className="w-6 h-6" />
          </div>
          {href && (
            <ArrowRight className="w-5 h-5 text-slate-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
          </p>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>

        {trend && (
          <div className="flex items-center gap-1.5 mt-3">
            {trend.value >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span
              className={cn(
                'text-sm font-medium',
                trend.value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              )}
            >
              {trend.value >= 0 ? '+' : ''}
              {trend.value.toFixed(1)}%
            </span>
            {trend.label && (
              <span className="text-sm text-slate-500 dark:text-slate-400">{trend.label}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
