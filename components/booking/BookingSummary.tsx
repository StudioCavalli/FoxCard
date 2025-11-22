'use client'

import { Calendar, Users, Clock, MapPin, CreditCard, AlertCircle } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface BookingLineItem {
  label: string
  value?: string
  price?: number
  quantity?: number
}

interface BookingSummaryProps {
  title: string
  image?: string
  location?: string
  checkIn?: string
  checkOut?: string
  date?: string
  time?: string
  guests?: {
    adults: number
    children?: number
    infants?: number
  }
  duration?: string
  lineItems: BookingLineItem[]
  subtotal: number
  taxes?: number
  discount?: number
  discountCode?: string
  total: number
  cancellationPolicy?: string
  onConfirm: () => void
  isLoading?: boolean
  className?: string
}

export function BookingSummary({
  title,
  image,
  location,
  checkIn,
  checkOut,
  date,
  time,
  guests,
  duration,
  lineItems,
  subtotal,
  taxes,
  discount,
  discountCode,
  total,
  cancellationPolicy,
  onConfirm,
  isLoading,
  className,
}: BookingSummaryProps) {
  const t = useTranslations('booking')

  const totalGuests = guests
    ? guests.adults + (guests.children || 0) + (guests.infants || 0)
    : 0

  return (
    <div className={cn('bg-theme-surface border border-theme-border rounded-2xl overflow-hidden', className)}>
      {/* Header with image */}
      {image && (
        <div className="relative h-32 bg-theme-background">
          <img src={image} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="font-semibold text-white text-lg truncate">{title}</h3>
            {location && (
              <div className="flex items-center gap-1 text-white/80 text-sm">
                <MapPin className="w-3.5 h-3.5" />
                <span>{location}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Booking Details */}
        <div className="space-y-3">
          {(checkIn || checkOut) && (
            <div className="flex items-center gap-3 text-theme-text">
              <Calendar className="w-5 h-5 text-theme-primary" />
              <div className="flex-1">
                {checkIn && checkOut ? (
                  <div className="flex items-center gap-2">
                    <span>{new Date(checkIn).toLocaleDateString()}</span>
                    <span className="text-theme-text-muted">→</span>
                    <span>{new Date(checkOut).toLocaleDateString()}</span>
                  </div>
                ) : (
                  <span>{checkIn && new Date(checkIn).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          )}

          {date && (
            <div className="flex items-center gap-3 text-theme-text">
              <Calendar className="w-5 h-5 text-theme-primary" />
              <span>{new Date(date).toLocaleDateString()}</span>
            </div>
          )}

          {time && (
            <div className="flex items-center gap-3 text-theme-text">
              <Clock className="w-5 h-5 text-theme-primary" />
              <span>{time}</span>
              {duration && <span className="text-theme-text-muted">({duration})</span>}
            </div>
          )}

          {guests && totalGuests > 0 && (
            <div className="flex items-center gap-3 text-theme-text">
              <Users className="w-5 h-5 text-theme-primary" />
              <span>
                {guests.adults} {t(guests.adults === 1 ? 'adult' : 'adults')}
                {guests.children ? `, ${guests.children} ${t(guests.children === 1 ? 'child' : 'children')}` : ''}
                {guests.infants ? `, ${guests.infants} ${t(guests.infants === 1 ? 'infant' : 'infants')}` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Line Items */}
        <div className="border-t border-theme-border pt-4 space-y-2">
          {lineItems.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-theme-text-secondary">
                {item.label}
                {item.quantity && item.quantity > 1 && ` x${item.quantity}`}
              </span>
              {item.price !== undefined ? (
                <span className="text-theme-text">{formatPrice(item.price)}</span>
              ) : (
                <span className="text-theme-text">{item.value}</span>
              )}
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-theme-border pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-theme-text-secondary">{t('subtotal')}</span>
            <span className="text-theme-text">{formatPrice(subtotal)}</span>
          </div>

          {taxes !== undefined && taxes > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-theme-text-secondary">{t('taxes')}</span>
              <span className="text-theme-text">{formatPrice(taxes)}</span>
            </div>
          )}

          {discount !== undefined && discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>
                {t('discount')}
                {discountCode && ` (${discountCode})`}
              </span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold pt-2 border-t border-theme-border">
            <span className="text-theme-text">{t('total')}</span>
            <span className="text-theme-text">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Cancellation Policy */}
        {cancellationPolicy && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-800 dark:text-amber-200">
              <div className="font-medium mb-1">{t('cancellationPolicy')}</div>
              <div>{cancellationPolicy}</div>
            </div>
          </div>
        )}

        {/* Confirm Button */}
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="w-full px-6 py-3.5 bg-theme-primary hover:bg-theme-primary/90 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t('processing')}
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              {t('confirmBooking')}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
