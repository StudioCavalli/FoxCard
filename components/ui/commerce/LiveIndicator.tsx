'use client'

import { cn } from '@/lib/utils'

interface LiveIndicatorProps {
  isLive?: boolean
  label?: string
  pulseColor?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'dot' | 'badge' | 'text'
  className?: string
}

export function LiveIndicator({
  isLive = true,
  label,
  pulseColor = 'bg-red-500',
  size = 'md',
  variant = 'badge',
  className,
}: LiveIndicatorProps) {
  const sizeClasses = {
    sm: { dot: 'w-1.5 h-1.5', text: 'text-xs', padding: 'px-1.5 py-0.5' },
    md: { dot: 'w-2 h-2', text: 'text-xs', padding: 'px-2 py-1' },
    lg: { dot: 'w-2.5 h-2.5', text: 'text-sm', padding: 'px-3 py-1.5' },
  }

  const sizes = sizeClasses[size]

  if (variant === 'dot') {
    return (
      <span className={cn('relative inline-flex', className)}>
        <span className={cn(
          'rounded-full',
          sizes.dot,
          isLive ? pulseColor : 'bg-gray-400'
        )} />
        {isLive && (
          <span className={cn(
            'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
            pulseColor
          )} />
        )}
      </span>
    )
  }

  if (variant === 'text') {
    return (
      <span className={cn(
        'inline-flex items-center gap-1.5',
        sizes.text,
        isLive ? 'text-red-600' : 'text-gray-500',
        className
      )}>
        <span className="relative inline-flex">
          <span className={cn(
            'rounded-full',
            sizes.dot,
            isLive ? pulseColor : 'bg-gray-400'
          )} />
          {isLive && (
            <span className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
              pulseColor
            )} />
          )}
        </span>
        {label || (isLive ? 'En direct' : 'Hors ligne')}
      </span>
    )
  }

  // Badge variant (default)
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full font-medium',
      sizes.padding,
      sizes.text,
      isLive
        ? 'bg-red-100 text-red-800'
        : 'bg-gray-100 text-gray-600',
      className
    )}>
      <span className="relative inline-flex">
        <span className={cn(
          'rounded-full',
          sizes.dot,
          isLive ? pulseColor : 'bg-gray-400'
        )} />
        {isLive && (
          <span className={cn(
            'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
            pulseColor
          )} />
        )}
      </span>
      {label || (isLive ? 'LIVE' : 'OFF')}
    </span>
  )
}
