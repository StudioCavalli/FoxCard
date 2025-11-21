'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface AdminCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'ghost'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export const AdminCard = forwardRef<HTMLDivElement, AdminCardProps>(
  ({ className, variant = 'default', padding = 'md', hover = false, children, ...props }, ref) => {
    const baseStyles = 'rounded-2xl transition-all duration-200'

    const variantStyles = {
      default: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50',
      elevated: 'bg-white dark:bg-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700/30',
      bordered: 'bg-transparent border-2 border-slate-200 dark:border-slate-700',
      ghost: 'bg-slate-50/50 dark:bg-slate-800/50',
    }

    const hoverStyles = hover
      ? 'hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer hover:-translate-y-0.5'
      : ''

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], paddingMap[padding], hoverStyles, className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

AdminCard.displayName = 'AdminCard'

// Card Header Component
interface AdminCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  action?: React.ReactNode
}

export const AdminCardHeader = ({ title, description, action, className, ...props }: AdminCardHeaderProps) => (
  <div className={cn('flex items-start justify-between mb-6', className)} {...props}>
    <div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
)
