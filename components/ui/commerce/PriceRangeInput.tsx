'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface PriceRangeInputProps {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  currency?: string
  step?: number
  showInputs?: boolean
  className?: string
}

export function PriceRangeInput({
  min,
  max,
  value,
  onChange,
  currency = '€',
  step = 1,
  showInputs = true,
  className,
}: PriceRangeInputProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const getPercentage = (val: number) => {
    return ((val - min) / (max - min)) * 100
  }

  const handleMinChange = (newMin: number) => {
    const validMin = Math.max(min, Math.min(newMin, localValue[1] - step))
    setLocalValue([validMin, localValue[1]])
    onChange([validMin, localValue[1]])
  }

  const handleMaxChange = (newMax: number) => {
    const validMax = Math.min(max, Math.max(newMax, localValue[0] + step))
    setLocalValue([localValue[0], validMax])
    onChange([localValue[0], validMax])
  }

  return (
    <div className={cn('space-y-4', className)}>
      {showInputs && (
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Min</label>
            <div className="relative">
              <input
                type="number"
                value={localValue[0]}
                onChange={(e) => handleMinChange(Number(e.target.value))}
                min={min}
                max={localValue[1] - step}
                step={step}
                className="w-full px-3 py-2 pr-8 border rounded-lg text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                {currency}
              </span>
            </div>
          </div>
          <div className="pt-5 text-gray-400">—</div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Max</label>
            <div className="relative">
              <input
                type="number"
                value={localValue[1]}
                onChange={(e) => handleMaxChange(Number(e.target.value))}
                min={localValue[0] + step}
                max={max}
                step={step}
                className="w-full px-3 py-2 pr-8 border rounded-lg text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                {currency}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="relative h-2 bg-gray-200 rounded-full">
        <div
          className="absolute h-full bg-blue-500 rounded-full"
          style={{
            left: `${getPercentage(localValue[0])}%`,
            right: `${100 - getPercentage(localValue[1])}%`,
          }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[0]}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          className="absolute w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[1]}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          className="absolute w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>{min}{currency}</span>
        <span>{max}{currency}</span>
      </div>
    </div>
  )
}
