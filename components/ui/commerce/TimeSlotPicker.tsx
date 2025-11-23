'use client'

import { useState } from 'react'
import { Clock, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TimeSlot {
  id: string
  time: string
  label?: string
  available: boolean
  capacity?: number
  booked?: number
  price?: number
}

interface TimeSlotPickerProps {
  slots: TimeSlot[]
  selectedSlot?: string
  onSelect: (slotId: string) => void
  showCapacity?: boolean
  showPrice?: boolean
  columns?: 2 | 3 | 4 | 6
  className?: string
}

export function TimeSlotPicker({
  slots,
  selectedSlot,
  onSelect,
  showCapacity = false,
  showPrice = false,
  columns = 4,
  className,
}: TimeSlotPickerProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    6: 'grid-cols-6',
  }

  return (
    <div className={cn(`grid gap-2 ${gridCols[columns]}`, className)}>
      {slots.map((slot) => {
        const isSelected = selectedSlot === slot.id
        const remainingSpots = slot.capacity && slot.booked !== undefined
          ? slot.capacity - slot.booked
          : undefined

        return (
          <button
            key={slot.id}
            onClick={() => slot.available && onSelect(slot.id)}
            disabled={!slot.available}
            className={cn(
              'relative p-3 rounded-lg border text-center transition-all',
              slot.available
                ? isSelected
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
            )}
          >
            {isSelected && (
              <div className="absolute top-1 right-1">
                <Check className="w-3 h-3 text-blue-600" />
              </div>
            )}

            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className={cn(
                'font-medium text-sm',
                isSelected ? 'text-blue-700' : 'text-gray-900'
              )}>
                {slot.time}
              </span>
            </div>

            {slot.label && (
              <p className="text-xs text-gray-500">{slot.label}</p>
            )}

            {showCapacity && remainingSpots !== undefined && (
              <p className={cn(
                'text-xs mt-1',
                remainingSpots <= 3 ? 'text-orange-600' : 'text-gray-500'
              )}>
                {remainingSpots} place{remainingSpots > 1 ? 's' : ''}
              </p>
            )}

            {showPrice && slot.price !== undefined && (
              <p className="text-xs font-medium text-gray-700 mt-1">
                {slot.price}€
              </p>
            )}
          </button>
        )
      })}
    </div>
  )
}
