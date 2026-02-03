'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface AdminToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
}

export const AdminToggle = forwardRef<HTMLInputElement, AdminToggleProps>(
  ({ className, label, description, id, checked, disabled, onChange, ...props }, ref) => {
    const toggleId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <label
        htmlFor={toggleId}
        className={cn(
          'flex items-center justify-between cursor-pointer select-none',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {(label || description) && (
          <div className="flex-1 mr-4">
            {label && (
              <span className="font-medium text-slate-900 dark:text-white">
                {label}
              </span>
            )}
            {description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="relative flex-shrink-0">
          <input
            ref={ref}
            type="checkbox"
            id={toggleId}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'w-11 h-6 rounded-full transition-colors duration-200',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/20 peer-focus-visible:ring-offset-2',
              checked
                ? 'bg-primary-500 dark:bg-primary-600'
                : 'bg-slate-200 dark:bg-slate-700'
            )}
          />
          <div
            className={cn(
              'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200',
              checked && 'translate-x-5'
            )}
          />
        </div>
      </label>
    )
  }
)

AdminToggle.displayName = 'AdminToggle'
