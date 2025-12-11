'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface AdminTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const AdminTextarea = forwardRef<HTMLTextAreaElement, AdminTextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500',
            'transition-all duration-200 resize-none',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-900',
            error
              ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-slate-200 dark:border-slate-600',
            'px-4 py-2.5',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
        {hint && !error && <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
    )
  }
)

AdminTextarea.displayName = 'AdminTextarea'
