'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isBefore,
  startOfDay
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export interface BookingSlot {
  date: Date
  available: number
  total: number
  price?: number
  minStay?: number
}

interface BookingCalendarProps {
  slots: BookingSlot[]
  selectedDate?: Date
  onDateSelect: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  showPrices?: boolean
  showAvailability?: boolean
  multiMonth?: boolean
  className?: string
}

export function BookingCalendar({
  slots,
  selectedDate,
  onDateSelect,
  minDate = new Date(),
  maxDate,
  showPrices = false,
  showAvailability = true,
  multiMonth = false,
  className,
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date())

  const getSlotForDate = (date: Date) => {
    return slots.find(slot => isSameDay(slot.date, date))
  }

  const isDateDisabled = (date: Date) => {
    if (isBefore(date, startOfDay(minDate))) return true
    if (maxDate && isBefore(startOfDay(maxDate), date)) return true
    const slot = getSlotForDate(date)
    return !slot || slot.available === 0
  }

  const renderMonth = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfMonth(monthDate)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Add padding for week alignment (Monday start)
    const startPadding = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1
    const paddingDays = Array.from({ length: startPadding }, () => null)

    return (
      <div className="flex-1">
        <div className="text-center font-medium text-gray-900 mb-4">
          {format(monthDate, 'MMMM yyyy', { locale: fr })}
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
            <div key={`pad-${i}`} className="aspect-square" />
          ))}

          {days.map((day) => {
            const slot = getSlotForDate(day)
            const isDisabled = isDateDisabled(day)
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            const isCurrentMonth = isSameMonth(day, monthDate)

            const occupancyRate = slot
              ? ((slot.total - slot.available) / slot.total) * 100
              : 0

            const bgColor = slot
              ? occupancyRate >= 90
                ? 'bg-red-50 border-red-200'
                : occupancyRate >= 70
                ? 'bg-orange-50 border-orange-200'
                : occupancyRate >= 50
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-green-50 border-green-200'
              : 'bg-gray-50 border-gray-200'

            return (
              <button
                key={day.toISOString()}
                onClick={() => !isDisabled && onDateSelect(day)}
                disabled={isDisabled}
                className={cn(
                  'aspect-square p-1 rounded-lg border text-center transition-all flex flex-col items-center justify-center',
                  !isCurrentMonth && 'opacity-30',
                  isDisabled
                    ? 'cursor-not-allowed opacity-50'
                    : 'hover:ring-2 hover:ring-blue-300',
                  isSelected
                    ? 'ring-2 ring-blue-500 bg-blue-100 border-blue-300'
                    : bgColor
                )}
              >
                <span className={cn(
                  'text-sm font-medium',
                  isSelected ? 'text-blue-700' : 'text-gray-900'
                )}>
                  {format(day, 'd')}
                </span>

                {showAvailability && slot && (
                  <span className={cn(
                    'text-[10px]',
                    slot.available <= 2 ? 'text-red-600' : 'text-gray-500'
                  )}>
                    {slot.available}
                  </span>
                )}

                {showPrices && slot?.price && (
                  <span className="text-[10px] font-medium text-gray-700">
                    {slot.price}€
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
    <div className={cn('bg-white rounded-lg', className)}>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {!multiMonth && (
          <span className="font-medium text-gray-900">
            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </span>
        )}

        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {multiMonth ? (
        <div className="flex gap-6">
          {renderMonth(currentMonth)}
          {renderMonth(addMonths(currentMonth, 1))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'].map((day) => (
              <div key={day} className="text-center text-xs text-gray-500 font-medium py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {(() => {
              const monthStart = startOfMonth(currentMonth)
              const monthEnd = endOfMonth(currentMonth)
              const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
              const startPadding = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1
              const paddingDays = Array.from({ length: startPadding }, () => null)

              return (
                <>
                  {paddingDays.map((_, i) => (
                    <div key={`pad-${i}`} className="aspect-square" />
                  ))}

                  {days.map((day) => {
                    const slot = getSlotForDate(day)
                    const isDisabled = isDateDisabled(day)
                    const isSelected = selectedDate && isSameDay(day, selectedDate)

                    const occupancyRate = slot
                      ? ((slot.total - slot.available) / slot.total) * 100
                      : 0

                    const bgColor = slot
                      ? occupancyRate >= 90
                        ? 'bg-red-50 border-red-200'
                        : occupancyRate >= 70
                        ? 'bg-orange-50 border-orange-200'
                        : occupancyRate >= 50
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => !isDisabled && onDateSelect(day)}
                        disabled={isDisabled}
                        className={cn(
                          'aspect-square p-1 rounded-lg border text-center transition-all flex flex-col items-center justify-center',
                          isDisabled
                            ? 'cursor-not-allowed opacity-50'
                            : 'hover:ring-2 hover:ring-blue-300',
                          isSelected
                            ? 'ring-2 ring-blue-500 bg-blue-100 border-blue-300'
                            : bgColor
                        )}
                      >
                        <span className={cn(
                          'text-sm font-medium',
                          isSelected ? 'text-blue-700' : 'text-gray-900'
                        )}>
                          {format(day, 'd')}
                        </span>

                        {showAvailability && slot && (
                          <span className={cn(
                            'text-[10px]',
                            slot.available <= 2 ? 'text-red-600' : 'text-gray-500'
                          )}>
                            {slot.available}
                          </span>
                        )}

                        {showPrices && slot?.price && (
                          <span className="text-[10px] font-medium text-gray-700">
                            {slot.price}€
                          </span>
                        )}
                      </button>
                    )
                  })}
                </>
              )
            })()}
          </div>
        </>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t text-xs">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-50 border border-green-200" />
          <span className="text-gray-600">Disponible</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-yellow-50 border border-yellow-200" />
          <span className="text-gray-600">Limité</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-50 border border-red-200" />
          <span className="text-gray-600">Presque complet</span>
        </div>
      </div>
    </div>
  )
}
