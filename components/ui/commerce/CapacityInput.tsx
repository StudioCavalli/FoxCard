'use client'

import { Minus, Plus, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CapacityInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  label?: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CapacityInput({
  value,
  onChange,
  min = 0,
  max = 999,
  label,
  showIcon = true,
  size = 'md',
  className,
}: CapacityInputProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0
    if (newValue >= min && newValue <= max) {
      onChange(newValue)
    }
  }

  const sizeClasses = {
    sm: {
      button: 'p-1',
      icon: 'w-3 h-3',
      input: 'w-10 text-sm',
      label: 'text-xs',
    },
    md: {
      button: 'p-1.5',
      icon: 'w-4 h-4',
      input: 'w-12 text-sm',
      label: 'text-sm',
    },
    lg: {
      button: 'p-2',
      icon: 'w-5 h-5',
      input: 'w-14 text-base',
      label: 'text-base',
    },
  }

  const sizes = sizeClasses[size]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showIcon && <Users className={cn('text-gray-400', sizes.icon)} />}

      {label && (
        <span className={cn('text-gray-700', sizes.label)}>{label}</span>
      )}

      <div className="flex items-center border rounded-lg">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className={cn(
            'rounded-l-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed',
            sizes.button
          )}
        >
          <Minus className={sizes.icon} />
        </button>

        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          className={cn(
            'text-center border-x focus:outline-none',
            sizes.input
          )}
        />

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className={cn(
            'rounded-r-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed',
            sizes.button
          )}
        >
          <Plus className={sizes.icon} />
        </button>
      </div>
    </div>
  )
}
