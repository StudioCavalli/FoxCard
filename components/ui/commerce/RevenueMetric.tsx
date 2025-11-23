'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RevenueMetricProps {
  value: number
  label: string
  previousValue?: number
  currency?: string
  format?: 'currency' | 'number' | 'percentage'
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: number
  icon?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function RevenueMetric({
  value,
  label,
  previousValue,
  currency = '€',
  format = 'currency',
  trend,
  trendValue,
  icon,
  size = 'md',
  className,
}: RevenueMetricProps) {
  // Calculate trend if not provided but previousValue exists
  const calculatedTrend = trend || (
    previousValue !== undefined
      ? value > previousValue
        ? 'up'
        : value < previousValue
        ? 'down'
        : 'neutral'
      : undefined
  )

  const calculatedTrendValue = trendValue ?? (
    previousValue && previousValue !== 0
      ? Math.round(((value - previousValue) / previousValue) * 100)
      : undefined
  )

  const formatValue = (val: number) => {
    if (format === 'currency') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M${currency}`
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}k${currency}`
      }
      return `${val.toLocaleString()}${currency}`
    }
    if (format === 'percentage') {
      return `${val}%`
    }
    return val.toLocaleString()
  }

  const sizeClasses = {
    sm: {
      value: 'text-lg',
      label: 'text-xs',
      trend: 'text-xs',
      icon: 'w-4 h-4',
    },
    md: {
      value: 'text-2xl',
      label: 'text-sm',
      trend: 'text-sm',
      icon: 'w-5 h-5',
    },
    lg: {
      value: 'text-3xl',
      label: 'text-base',
      trend: 'text-base',
      icon: 'w-6 h-6',
    },
  }

  const sizes = sizeClasses[size]

  const TrendIcon = calculatedTrend === 'up'
    ? TrendingUp
    : calculatedTrend === 'down'
    ? TrendingDown
    : Minus

  return (
    <div className={cn('', className)}>
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-gray-400">{icon}</span>}
        <span className={cn('text-gray-500', sizes.label)}>{label}</span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className={cn('font-bold text-gray-900', sizes.value)}>
          {formatValue(value)}
        </span>

        {calculatedTrend && calculatedTrendValue !== undefined && (
          <span className={cn(
            'flex items-center gap-0.5 font-medium',
            sizes.trend,
            calculatedTrend === 'up' && 'text-green-600',
            calculatedTrend === 'down' && 'text-red-600',
            calculatedTrend === 'neutral' && 'text-gray-500'
          )}>
            <TrendIcon className={cn(sizes.icon, 'flex-shrink-0')} />
            {Math.abs(calculatedTrendValue)}%
          </span>
        )}
      </div>

      {previousValue !== undefined && (
        <p className={cn('text-gray-400 mt-0.5', sizes.label)}>
          vs {formatValue(previousValue)} précédent
        </p>
      )}
    </div>
  )
}
