'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface AdminCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
  error?: string
}

export const AdminCheckbox = forwardRef<HTMLInputElement, AdminCheckboxProps>(
  ({ className, label, description, error, id, checked, disabled, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="relative">
        <label
          htmlFor={checkboxId}
          className={cn(
            'flex items-start cursor-pointer select-none',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="flex items-center h-6">
            <div className="relative">
              <input
                ref={ref}
                type="checkbox"
                id={checkboxId}
                checked={checked}
                disabled={disabled}
                className={cn(
                  'peer sr-only',
                  className
                )}
                {...props}
              />
              <div
                className={cn(
                  'w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center',
                  'peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/20 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-slate-900',
                  checked
                    ? 'bg-primary-500 border-primary-500 dark:bg-primary-600 dark:border-primary-600'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500',
                  error && 'border-red-500 dark:border-red-500'
                )}
              >
                {checked && (
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                )}
              </div>
            </div>
          </div>
          {(label || description) && (
            <div className="ml-3">
              {label && (
                <span
                  className={cn(
                    'text-sm font-medium',
                    error
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-slate-700 dark:text-slate-300'
                  )}
                >
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
        </label>
        {error && (
          <p className="text-sm text-red-500 dark:text-red-400 mt-1 ml-8">{error}</p>
        )}
      </div>
    )
  }
)

AdminCheckbox.displayName = 'AdminCheckbox'
