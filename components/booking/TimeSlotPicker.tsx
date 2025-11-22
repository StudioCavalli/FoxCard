'use client'

import { Clock, User, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

interface TimeSlot {
  time: string
  available: boolean
  providerId?: string
}

interface Provider {
  id: string
  name: string
  image?: string
  rating?: number
}

interface TimeSlotPickerProps {
  selectedTime: string | null
  onTimeChange: (time: string | null) => void
  timeSlots: TimeSlot[]
  providers?: Provider[]
  selectedProvider?: string | null
  onProviderChange?: (providerId: string | null) => void
  duration?: number // minutes
  className?: string
}

export function TimeSlotPicker({
  selectedTime,
  onTimeChange,
  timeSlots,
  providers,
  selectedProvider,
  onProviderChange,
  duration,
  className,
}: TimeSlotPickerProps) {
  const t = useTranslations('booking')

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }

  // Filter time slots by selected provider if applicable
  const filteredSlots = selectedProvider
    ? timeSlots.filter((slot) => !slot.providerId || slot.providerId === selectedProvider)
    : timeSlots

  const morningSlots = filteredSlots.filter((slot) => {
    const hour = parseInt(slot.time.split(':')[0])
    return hour < 12
  })

  const afternoonSlots = filteredSlots.filter((slot) => {
    const hour = parseInt(slot.time.split(':')[0])
    return hour >= 12 && hour < 17
  })

  const eveningSlots = filteredSlots.filter((slot) => {
    const hour = parseInt(slot.time.split(':')[0])
    return hour >= 17
  })

  const SlotGroup = ({ slots, label }: { slots: TimeSlot[]; label: string }) => (
    slots.length > 0 && (
      <div>
        <div className="text-xs font-medium text-theme-text-muted mb-2">{label}</div>
        <div className="grid grid-cols-3 gap-2">
          {slots.map((slot) => (
            <button
              key={slot.time}
              onClick={() => slot.available && onTimeChange(slot.time)}
              disabled={!slot.available}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                selectedTime === slot.time
                  ? 'bg-theme-primary text-white'
                  : slot.available
                  ? 'bg-theme-background border border-theme-border hover:border-theme-primary text-theme-text'
                  : 'bg-theme-surface text-theme-text-muted cursor-not-allowed line-through'
              )}
            >
              {slot.time}
            </button>
          ))}
        </div>
      </div>
    )
  )

  return (
    <div className={cn('space-y-4', className)}>
      {/* Duration Info */}
      {duration && (
        <div className="flex items-center gap-2 p-3 bg-theme-primary/5 border border-theme-primary/20 rounded-xl">
          <Clock className="w-5 h-5 text-theme-primary" />
          <span className="text-sm text-theme-text">
            {t('serviceDuration')}: <strong>{formatDuration(duration)}</strong>
          </span>
        </div>
      )}

      {/* Provider Selection */}
      {providers && providers.length > 0 && onProviderChange && (
        <div>
          <label className="text-sm font-medium text-theme-text mb-2 block">
            {t('selectProvider')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onProviderChange(null)}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                !selectedProvider
                  ? 'border-theme-primary bg-theme-primary/5'
                  : 'border-theme-border hover:border-theme-border-light'
              )}
            >
              <div className="w-10 h-10 rounded-full bg-theme-surface flex items-center justify-center">
                <User className="w-5 h-5 text-theme-text-muted" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-theme-text text-sm">{t('anyProvider')}</div>
              </div>
              {!selectedProvider && <Check className="w-4 h-4 text-theme-primary" />}
            </button>

            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => onProviderChange(provider.id)}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                  selectedProvider === provider.id
                    ? 'border-theme-primary bg-theme-primary/5'
                    : 'border-theme-border hover:border-theme-border-light'
                )}
              >
                <div className="w-10 h-10 rounded-full bg-theme-surface overflow-hidden">
                  {provider.image ? (
                    <Image
                      src={provider.image}
                      alt={provider.name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-5 h-5 text-theme-text-muted" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-theme-text text-sm truncate">
                    {provider.name}
                  </div>
                  {provider.rating && (
                    <div className="text-xs text-theme-text-muted">★ {provider.rating}</div>
                  )}
                </div>
                {selectedProvider === provider.id && (
                  <Check className="w-4 h-4 text-theme-primary flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Time Slots */}
      <div>
        <label className="text-sm font-medium text-theme-text mb-3 block">
          {t('availableSlots')}
        </label>
        <div className="space-y-4">
          <SlotGroup slots={morningSlots} label={t('morning')} />
          <SlotGroup slots={afternoonSlots} label={t('afternoon')} />
          <SlotGroup slots={eveningSlots} label={t('evening')} />
        </div>
      </div>

      {filteredSlots.length === 0 && (
        <div className="text-center py-8 text-theme-text-muted">
          {t('noSlotsAvailable')}
        </div>
      )}
    </div>
  )
}
