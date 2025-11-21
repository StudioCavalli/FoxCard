'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AdminSearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  containerClassName?: string
}

const AdminSearchInput = forwardRef<HTMLInputElement, AdminSearchInputProps>(
  ({ className, containerClassName, ...props }, ref) => {
    return (
      <div className={cn('relative', containerClassName)}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          className={cn(
            'w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white',
            'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20',
            'outline-none transition-all text-sm',
            'placeholder:text-gray-400',
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)

AdminSearchInput.displayName = 'AdminSearchInput'

export { AdminSearchInput }
