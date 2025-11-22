'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface DateRangePickerProps {
  startDate: string | null
  endDate: string | null
  onDateChange: (start: string | null, end: string | null) => void
  minDate?: Date
  maxDate?: Date
  minNights?: number
  maxNights?: number
  unavailableDates?: string[]
  priceByDate?: Record<string, number>
  showDoubleCalendar?: boolean
  className?: string
}

export function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
  minDate = new Date(),
  maxDate,
  minNights = 1,
  maxNights,
  unavailableDates = [],
  priceByDate = {},
  showDoubleCalendar = false,
  className,
}: DateRangePickerProps) {
  const t = useTranslations('booking')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    return { daysInMonth, firstDay, year, month }
  }

  const isDateUnavailable = (dateStr: string) => unavailableDates.includes(dateStr)

  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < (minDate || today)) return true
    if (maxDate && date > maxDate) return true
    return isDateUnavailable(date.toISOString().split('T')[0])
  }

  const handleDateClick = (day: number, monthOffset: number = 0) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, day)
    const dateStr = date.toISOString().split('T')[0]

    if (isDateDisabled(date)) return

    if (!startDate || (startDate && endDate)) {
      onDateChange(dateStr, null)
    } else {
      if (date > new Date(startDate)) {
        // Check min/max nights
        const nights = Math.ceil((date.getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
        if (minNights && nights < minNights) return
        if (maxNights && nights > maxNights) return
        onDateChange(startDate, dateStr)
      } else {
        onDateChange(dateStr, null)
      }
    }
  }

  const isDateSelected = (dateStr: string) => dateStr === startDate || dateStr === endDate

  const isInRange = (date: Date) => {
    if (!startDate || !endDate) return false
    return date > new Date(startDate) && date < new Date(endDate)
  }

  const renderCalendar = (monthOffset: number = 0) => {
    const displayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset)
    const { daysInMonth, firstDay, year, month } = getDaysInMonth(displayDate)

    return (
      <div className="p-4">
        <div className="text-center font-semibold text-theme-text mb-4">
          {monthNames[month]} {year}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {dayNames.map((day) => (
            <div key={day} className="text-theme-text-muted font-medium py-1 text-xs">
              {day}
            </div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const date = new Date(year, month, day)
            const dateStr = date.toISOString().split('T')[0]
            const disabled = isDateDisabled(date)
            const selected = isDateSelected(dateStr)
            const inRange = isInRange(date)
            const price = priceByDate[dateStr]

            return (
              <button
                key={day}
                onClick={() => !disabled && handleDateClick(day, monthOffset)}
                disabled={disabled}
                className={cn(
                  'relative py-2 rounded-lg text-sm transition-all',
                  disabled && 'text-theme-text-muted cursor-not-allowed opacity-50',
                  selected && 'bg-theme-primary text-white font-semibold',
                  inRange && !selected && 'bg-theme-primary/20 text-theme-primary',
                  !disabled && !selected && !inRange && 'hover:bg-theme-primary/10 text-theme-text'
                )}
              >
                {day}
                {price && !disabled && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-theme-text-muted">
                    {price}€
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-theme-surface border border-theme-border rounded-xl', className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-theme-border">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-1.5 hover:bg-theme-primary/10 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          {startDate && (
            <span className="text-sm text-theme-text">
              {new Date(startDate).toLocaleDateString()}
            </span>
          )}
          {startDate && endDate && <span className="text-theme-text-muted">→</span>}
          {endDate && (
            <span className="text-sm text-theme-text">
              {new Date(endDate).toLocaleDateString()}
            </span>
          )}
          {!startDate && !endDate && (
            <span className="text-sm text-theme-text-muted">{t('selectDates')}</span>
          )}
        </div>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-1.5 hover:bg-theme-primary/10 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className={cn('flex', showDoubleCalendar && 'divide-x divide-theme-border')}>
        {renderCalendar(0)}
        {showDoubleCalendar && renderCalendar(1)}
      </div>

      {minNights > 1 && (
        <div className="px-4 py-2 border-t border-theme-border text-xs text-theme-text-muted text-center">
          {t('minNights', { count: minNights })}
        </div>
      )}
    </div>
  )
}
