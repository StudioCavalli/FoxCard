'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { MerchantCard } from './MerchantCard'

interface StatWidgetProps {
  title: string
  value: string | number
  change?: {
    value: number
    period: string
  }
  icon?: LucideIcon
  iconColor?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  sparkline?: number[]
  prefix?: string
  suffix?: string
  loading?: boolean
  className?: string
}

export function StatWidget({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'primary',
  sparkline,
  prefix,
  suffix,
  loading = false,
  className,
}: StatWidgetProps) {
  const iconColorClasses = {
    primary: 'bg-primary-500/20 text-primary-400',
    success: 'bg-emerald-500/20 text-emerald-400',
    warning: 'bg-amber-500/20 text-amber-400',
    danger: 'bg-red-500/20 text-red-400',
    info: 'bg-cyan-500/20 text-cyan-400',
  }

  const getTrendIcon = () => {
    if (!change) return null
    if (change.value > 0) return <TrendingUp className="w-4 h-4" />
    if (change.value < 0) return <TrendingDown className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }

  const getTrendColor = () => {
    if (!change) return ''
    if (change.value > 0) return 'text-emerald-400'
    if (change.value < 0) return 'text-red-400'
    return 'text-slate-400'
  }

  if (loading) {
    return (
      <MerchantCard variant="stat" className={className}>
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-1/2 mb-3" />
          <div className="h-8 bg-slate-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-700 rounded w-1/3" />
        </div>
      </MerchantCard>
    )
  }

  return (
    <MerchantCard variant="stat" className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">
            {prefix}
            {typeof value === 'number' ? value.toLocaleString() : value}
            {suffix}
          </p>
          {change && (
            <div className={cn('flex items-center gap-1 mt-2 text-sm', getTrendColor())}>
              {getTrendIcon()}
              <span className="font-medium">
                {change.value > 0 ? '+' : ''}
                {change.value}%
              </span>
              <span className="text-slate-500">{change.period}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn('p-3 rounded-xl', iconColorClasses[iconColor])}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {sparkline && sparkline.length > 0 && (
        <div className="mt-4 h-12">
          <Sparkline data={sparkline} />
        </div>
      )}
    </MerchantCard>
  )
}

interface SparklineProps {
  data: number[]
  color?: string
  className?: string
}

function Sparkline({ data, color = '#6366f1', className }: SparklineProps) {
  if (!data.length) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const width = 100
  const height = 48
  const padding = 2

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - padding * 2) + padding
    const y = height - padding - ((value - min) / range) * (height - padding * 2)
    return `${x},${y}`
  })

  const pathD = `M ${points.join(' L ')}`

  // Create gradient area
  const areaD = `${pathD} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('w-full h-full', className)}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="sparkline-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#sparkline-gradient)" />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface StatGridProps {
  children: ReactNode
  columns?: 2 | 3 | 4
  className?: string
}

export function StatGrid({ children, columns = 4, className }: StatGridProps) {
  const gridClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={cn('grid gap-4', gridClasses[columns], className)}>
      {children}
    </div>
  )
}
