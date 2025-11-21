'use client'

import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface EnhancedStatCardProps {
  title: string
  value: string | number
  change?: number
  period?: string
  icon: LucideIcon
  color?: 'indigo' | 'green' | 'amber' | 'red' | 'purple' | 'blue'
  href?: string
  loading?: boolean
}

const colorStyles = {
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'text-indigo-600',
    trend: 'text-indigo-600',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    trend: 'text-green-600',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    trend: 'text-amber-600',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    trend: 'text-red-600',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    trend: 'text-purple-600',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    trend: 'text-blue-600',
  },
}

export function EnhancedStatCard({
  title,
  value,
  change,
  period = 'vs mois dernier',
  icon: Icon,
  color = 'indigo',
  href,
  loading = false,
}: EnhancedStatCardProps) {
  const styles = colorStyles[color]

  const content = (
    <div className={cn(
      'bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200',
      href && 'hover:shadow-lg hover:border-gray-300 cursor-pointer'
    )}>
      {loading ? (
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-24 h-4 bg-gray-200 rounded" />
            <div className="w-10 h-10 bg-gray-200 rounded-lg" />
          </div>
          <div className="w-32 h-8 bg-gray-200 rounded mb-2" />
          <div className="w-20 h-4 bg-gray-200 rounded" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">{title}</span>
            <div className={cn('p-2 rounded-lg', styles.bg)}>
              <Icon className={cn('w-5 h-5', styles.icon)} />
            </div>
          </div>

          <div className="mb-2">
            <span className="text-3xl font-bold text-gray-900">{value}</span>
          </div>

          {change !== undefined && (
            <div className="flex items-center gap-2">
              {change > 0 ? (
                <div className="flex items-center text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">+{change.toFixed(1)}%</span>
                </div>
              ) : change < 0 ? (
                <div className="flex items-center text-red-600">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">{change.toFixed(1)}%</span>
                </div>
              ) : (
                <div className="flex items-center text-gray-500">
                  <Minus className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">0%</span>
                </div>
              )}
              <span className="text-sm text-gray-500">{period}</span>
            </div>
          )}
        </>
      )}
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
