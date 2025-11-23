'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Clock, ChevronUp, ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface AdminTimePickerProps {
  value?: string // Format: "HH:MM"
  onChange?: (value: string) => void
  label?: string
  error?: string
  hint?: string
  disabled?: boolean
  className?: string
  minuteStep?: number // Default 15
}

export function AdminTimePicker({
  value = '09:00',
  onChange,
  label,
  error,
  hint,
  disabled,
  className,
  minuteStep = 15
}: AdminTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('common.timePicker')

  // Parse current value
  const [hours, minutes] = value.split(':').map(Number)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const updateTime = (newHours: number, newMinutes: number) => {
    const h = newHours.toString().padStart(2, '0')
    const m = newMinutes.toString().padStart(2, '0')
    onChange?.(`${h}:${m}`)
  }

  const incrementHours = () => {
    const newHours = hours >= 23 ? 0 : hours + 1
    updateTime(newHours, minutes)
  }

  const decrementHours = () => {
    const newHours = hours <= 0 ? 23 : hours - 1
    updateTime(newHours, minutes)
  }

  const incrementMinutes = () => {
    const newMinutes = minutes >= 60 - minuteStep ? 0 : minutes + minuteStep
    const newHours = minutes >= 60 - minuteStep ? (hours >= 23 ? 0 : hours + 1) : hours
    updateTime(newHours, newMinutes)
  }

  const decrementMinutes = () => {
    const newMinutes = minutes < minuteStep ? 60 - minuteStep : minutes - minuteStep
    const newHours = minutes < minuteStep ? (hours <= 0 ? 23 : hours - 1) : hours
    updateTime(newHours, newMinutes)
  }

  const selectHour = (h: number) => {
    updateTime(h, minutes)
  }

  const selectMinute = (m: number) => {
    updateTime(hours, m)
    setIsOpen(false)
  }

  // Generate hours and minutes options
  const hourOptions = Array.from({ length: 24 }, (_, i) => i)
  const minuteOptions = Array.from({ length: 60 / minuteStep }, (_, i) => i * minuteStep)

  return (
    <div className="space-y-2" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Display Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-900',
            error
              ? 'border-red-300 dark:border-red-500'
              : isOpen
                ? 'border-violet-500 ring-2 ring-violet-500/20'
                : 'border-slate-200 dark:border-slate-600',
            className
          )}
        >
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="flex-1 text-left font-medium text-slate-900 dark:text-white">
            {value}
          </span>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 shadow-xl overflow-hidden">
            <div className="p-4">
              {/* Spinner Controls */}
              <div className="flex items-center justify-center gap-4">
                {/* Hours */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={incrementHours}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <ChevronUp className="w-5 h-5 text-slate-500" />
                  </button>
                  <div className="w-16 h-14 flex items-center justify-center bg-violet-100 dark:bg-violet-500/20 rounded-xl">
                    <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                      {hours.toString().padStart(2, '0')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={decrementHours}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                {/* Separator */}
                <span className="text-2xl font-bold text-slate-400">:</span>

                {/* Minutes */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={incrementMinutes}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <ChevronUp className="w-5 h-5 text-slate-500" />
                  </button>
                  <div className="w-16 h-14 flex items-center justify-center bg-violet-100 dark:bg-violet-500/20 rounded-xl">
                    <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                      {minutes.toString().padStart(2, '0')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={decrementMinutes}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Quick Select Grid */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  {t('commonTimes')}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {['06:00', '08:00', '09:00', '10:00', '12:00', '14:00', '18:00', '22:00'].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => {
                        onChange?.(time)
                        setIsOpen(false)
                      }}
                      className={cn(
                        'px-2 py-1.5 text-sm font-medium rounded-lg transition-colors',
                        value === time
                          ? 'bg-violet-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Close button */}
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
      {hint && !error && <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  )
}
