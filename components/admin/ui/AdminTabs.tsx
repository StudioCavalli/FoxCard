'use client'

import { cn } from '@/lib/utils'

interface AdminTabItem {
  value: string
  label: string
  count?: number
  icon?: React.ReactNode
}

interface AdminTabsProps {
  items: AdminTabItem[]
  value: string
  onChange: (value: string) => void
  variant?: 'default' | 'pills' | 'underline'
  size?: 'sm' | 'md'
  className?: string
}

export function AdminTabs({
  items,
  value,
  onChange,
  variant = 'default',
  size = 'md',
  className,
}: AdminTabsProps) {
  const baseStyles = 'flex items-center gap-1'

  const containerStyles = {
    default: 'bg-slate-100 dark:bg-slate-800 p-1 rounded-xl',
    pills: 'gap-2',
    underline: 'border-b border-slate-200 dark:border-slate-700 gap-0',
  }

  const itemBaseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200'

  const itemVariantStyles = {
    default: {
      active: 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm',
      inactive: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
    },
    pills: {
      active: 'bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300',
      inactive: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
    },
    underline: {
      active: 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 -mb-px',
      inactive: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-b-2 border-transparent -mb-px',
    },
  }

  const sizeStyles = {
    sm: {
      default: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
      pills: 'px-3 py-1.5 text-sm rounded-full gap-1.5',
      underline: 'px-4 py-2 text-sm gap-1.5',
    },
    md: {
      default: 'px-4 py-2 text-sm rounded-lg gap-2',
      pills: 'px-4 py-2 text-sm rounded-full gap-2',
      underline: 'px-4 py-3 text-sm gap-2',
    },
  }

  return (
    <div className={cn(baseStyles, containerStyles[variant], className)}>
      {items.map((item) => {
        const isActive = value === item.value
        return (
          <button
            key={item.value}
            onClick={() => onChange(item.value)}
            className={cn(
              itemBaseStyles,
              sizeStyles[size][variant],
              isActive ? itemVariantStyles[variant].active : itemVariantStyles[variant].inactive
            )}
          >
            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
            {typeof item.count === 'number' && (
              <span
                className={cn(
                  'ml-1 px-1.5 py-0.5 text-xs font-semibold rounded-full',
                  isActive
                    ? variant === 'pills'
                      ? 'bg-primary-200 dark:bg-primary-500/30 text-primary-700 dark:text-primary-300'
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
