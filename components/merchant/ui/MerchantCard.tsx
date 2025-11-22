'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface MerchantCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'stat' | 'info' | 'action'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function MerchantCard({
  children,
  className,
  variant = 'default',
  padding = 'md',
}: MerchantCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const variantClasses = {
    default: 'bg-slate-800/50 border-slate-700',
    stat: 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700',
    info: 'bg-blue-900/20 border-blue-800/50',
    action: 'bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer',
  }

  return (
    <div
      className={cn(
        'rounded-xl border backdrop-blur-sm',
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  )
}

interface MerchantCardHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: ReactNode
  className?: string
}

export function MerchantCardHeader({
  title,
  description,
  icon: Icon,
  action,
  className,
}: MerchantCardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-4', className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="p-2 bg-slate-700/50 rounded-lg">
            <Icon className="w-5 h-5 text-slate-300" />
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description && (
            <p className="text-sm text-slate-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

interface MerchantCardContentProps {
  children: ReactNode
  className?: string
}

export function MerchantCardContent({ children, className }: MerchantCardContentProps) {
  return <div className={cn('', className)}>{children}</div>
}

interface MerchantCardFooterProps {
  children: ReactNode
  className?: string
}

export function MerchantCardFooter({ children, className }: MerchantCardFooterProps) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-slate-700/50', className)}>
      {children}
    </div>
  )
}
