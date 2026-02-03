'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Search, X } from 'lucide-react'

interface AdminSearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void
  shortcut?: string
}

export const AdminSearchInput = forwardRef<HTMLInputElement, AdminSearchInputProps>(
  ({ className, value, onClear, shortcut, ...props }, ref) => {
    return (
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          ref={ref}
          type="text"
          value={value}
          className={cn(
            'w-full rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white',
            'placeholder:text-slate-400 dark:placeholder:text-slate-500',
            'border-slate-200 dark:border-slate-600',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
            'transition-all duration-200',
            'pl-11 pr-20 py-2.5',
            className
          )}
          {...props}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {value && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {shortcut && (
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 rounded">
              {shortcut}
            </kbd>
          )}
        </div>
      </div>
    )
  }
)

AdminSearchInput.displayName = 'AdminSearchInput'
