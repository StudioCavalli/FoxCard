'use client'

import { useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, isBefore, startOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface DateRangePickerProps {
  startDate?: Date
  endDate?: Date
  onRangeChange: (start: Date | undefined, end: Date | undefined) => void
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  showPresets?: boolean
  className?: string
}

export function DateRangePicker({
  startDate,
  endDate,
  onRangeChange,
  minDate,
  maxDate,
  disabledDates = [],
  showPresets = true,
  className,
}: DateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(startDate || new Date())
  const [isOpen, setIsOpen] = useState(false)
  const [selectingEnd, setSelectingEnd] = useState(false)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Add padding days for week alignment
  const startPadding = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1
  const paddingDays = Array.from({ length: startPadding }, (_, i) => null)

  const isDateDisabled = (date: Date) => {
    if (minDate && isBefore(date, startOfDay(minDate))) return true
    if (maxDate && isBefore(startOfDay(maxDate), date)) return true
    return disabledDates.some(d => isSameDay(d, date))
  }

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return

    if (!selectingEnd || !startDate) {
      onRangeChange(date, undefined)
      setSelectingEnd(true)
    } else {
      if (isBefore(date, startDate)) {
        onRangeChange(date, startDate)
      } else {
        onRangeChange(startDate, date)
      }
      setSelectingEnd(false)
      setIsOpen(false)
    }
  }

  const presets = [
    { label: 'Aujourd\'hui', getValue: () => [new Date(), new Date()] },
    { label: '7 jours', getValue: () => [new Date(), addMonths(new Date(), 0)] },
    { label: '30 jours', getValue: () => [new Date(), addMonths(new Date(), 1)] },
    { label: '90 jours', getValue: () => [new Date(), addMonths(new Date(), 3)] },
  ]

  const formatDisplay = () => {
    if (startDate && endDate) {
      return `${format(startDate, 'dd MMM', { locale: fr })} - ${format(endDate, 'dd MMM yyyy', { locale: fr })}`
    }
    if (startDate) {
      return format(startDate, 'dd MMM yyyy', { locale: fr })
    }
    return 'Sélectionner les dates'
  }

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 w-full text-left"
      >
        <Calendar className="w-4 h-4 text-gray-400" />
        <span className="text-sm">{formatDisplay()}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg z-50 p-4">
          {showPresets && (
            <div className="flex gap-2 mb-4 pb-4 border-b">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    const [start, end] = preset.getValue()
                    onRangeChange(start, end)
                    setIsOpen(false)
                  }}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium">
              {format(currentMonth, 'MMMM yyyy', { locale: fr })}
            </span>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'].map((day) => (
              <div key={day} className="text-center text-xs text-gray-500 font-medium py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {paddingDays.map((_, i) => (
              <div key={`pad-${i}`} className="p-2" />
            ))}
            {days.map((day) => {
              const isDisabled = isDateDisabled(day)
              const isStart = startDate && isSameDay(day, startDate)
              const isEnd = endDate && isSameDay(day, endDate)
              const isInRange = startDate && endDate && isWithinInterval(day, { start: startDate, end: endDate })

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDateClick(day)}
                  disabled={isDisabled}
                  className={cn(
                    'p-2 text-sm rounded transition-colors',
                    isDisabled && 'text-gray-300 cursor-not-allowed',
                    !isDisabled && !isStart && !isEnd && !isInRange && 'hover:bg-gray-100',
                    isInRange && !isStart && !isEnd && 'bg-blue-50',
                    (isStart || isEnd) && 'bg-blue-600 text-white',
                    !isSameMonth(day, currentMonth) && 'text-gray-400'
                  )}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <button
              onClick={() => {
                onRangeChange(undefined, undefined)
                setSelectingEnd(false)
              }}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              Effacer
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Appliquer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
