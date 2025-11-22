'use client'

import { Check, Calendar, Mail, Download, MapPin, Clock, Users, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

interface BookingConfirmationProps {
  bookingNumber: string
  title: string
  date?: string
  time?: string
  checkIn?: string
  checkOut?: string
  location?: string
  guests?: {
    adults: number
    children?: number
    infants?: number
  }
  email: string
  total: number
  icsUrl?: string
  pdfUrl?: string
  requiredDocuments?: string[]
  onClose?: () => void
  className?: string
}

export function BookingConfirmation({
  bookingNumber,
  title,
  date,
  time,
  checkIn,
  checkOut,
  location,
  guests,
  email,
  total,
  icsUrl,
  pdfUrl,
  requiredDocuments,
  onClose,
  className,
}: BookingConfirmationProps) {
  const t = useTranslations('booking')

  const totalGuests = guests
    ? guests.adults + (guests.children || 0) + (guests.infants || 0)
    : 0

  return (
    <div className={cn('bg-theme-surface border border-theme-border rounded-2xl overflow-hidden', className)}>
      {/* Success Header */}
      <div className="bg-green-500 px-6 py-8 text-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{t('bookingConfirmed')}</h2>
        <p className="text-green-100">{t('thankYou')}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Booking Number */}
        <div className="text-center p-4 bg-theme-background border border-theme-border rounded-xl">
          <div className="text-sm text-theme-text-muted mb-1">{t('bookingNumber')}</div>
          <div className="text-2xl font-mono font-bold text-theme-primary">{bookingNumber}</div>
        </div>

        {/* Booking Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-theme-text">{title}</h3>

          <div className="space-y-3">
            {(checkIn || checkOut) && (
              <div className="flex items-center gap-3 text-theme-text">
                <Calendar className="w-5 h-5 text-theme-primary" />
                <div>
                  <div className="text-sm text-theme-text-muted">{t('dates')}</div>
                  <div className="flex items-center gap-2">
                    <span>{checkIn && new Date(checkIn).toLocaleDateString()}</span>
                    {checkOut && (
                      <>
                        <span className="text-theme-text-muted">→</span>
                        <span>{new Date(checkOut).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {date && (
              <div className="flex items-center gap-3 text-theme-text">
                <Calendar className="w-5 h-5 text-theme-primary" />
                <div>
                  <div className="text-sm text-theme-text-muted">{t('date')}</div>
                  <div>{new Date(date).toLocaleDateString()}</div>
                </div>
              </div>
            )}

            {time && (
              <div className="flex items-center gap-3 text-theme-text">
                <Clock className="w-5 h-5 text-theme-primary" />
                <div>
                  <div className="text-sm text-theme-text-muted">{t('time')}</div>
                  <div>{time}</div>
                </div>
              </div>
            )}

            {location && (
              <div className="flex items-center gap-3 text-theme-text">
                <MapPin className="w-5 h-5 text-theme-primary" />
                <div>
                  <div className="text-sm text-theme-text-muted">{t('location')}</div>
                  <div>{location}</div>
                </div>
              </div>
            )}

            {guests && totalGuests > 0 && (
              <div className="flex items-center gap-3 text-theme-text">
                <Users className="w-5 h-5 text-theme-primary" />
                <div>
                  <div className="text-sm text-theme-text-muted">{t('guests')}</div>
                  <div>
                    {guests.adults} {t(guests.adults === 1 ? 'adult' : 'adults')}
                    {guests.children ? `, ${guests.children} ${t(guests.children === 1 ? 'child' : 'children')}` : ''}
                    {guests.infants ? `, ${guests.infants} ${t(guests.infants === 1 ? 'infant' : 'infants')}` : ''}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Email Confirmation */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <div className="font-medium text-blue-800 dark:text-blue-200">{t('confirmationSent')}</div>
            <div className="text-sm text-blue-700 dark:text-blue-300">{email}</div>
          </div>
        </div>

        {/* Required Documents */}
        {requiredDocuments && requiredDocuments.length > 0 && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex items-center gap-2 font-medium text-amber-800 dark:text-amber-200 mb-2">
              <FileText className="w-5 h-5" />
              {t('requiredDocuments')}
            </div>
            <ul className="list-disc list-inside text-sm text-amber-700 dark:text-amber-300 space-y-1">
              {requiredDocuments.map((doc, index) => (
                <li key={index}>{doc}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {icsUrl && (
            <a
              href={icsUrl}
              download
              className="flex items-center justify-center gap-2 px-4 py-3 bg-theme-background border border-theme-border rounded-xl text-theme-text hover:bg-theme-surface transition-colors"
            >
              <Calendar className="w-5 h-5" />
              <span className="text-sm font-medium">{t('addToCalendar')}</span>
            </a>
          )}
          {pdfUrl && (
            <a
              href={pdfUrl}
              download
              className="flex items-center justify-center gap-2 px-4 py-3 bg-theme-background border border-theme-border rounded-xl text-theme-text hover:bg-theme-surface transition-colors"
            >
              <Download className="w-5 h-5" />
              <span className="text-sm font-medium">{t('downloadPdf')}</span>
            </a>
          )}
        </div>

        {/* Close/Continue Button */}
        <div className="flex gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-theme-background border border-theme-border rounded-xl font-medium text-theme-text hover:bg-theme-surface transition-colors"
            >
              {t('close')}
            </button>
          )}
          <Link
            href="/account"
            className="flex-1 px-6 py-3 bg-theme-primary hover:bg-theme-primary/90 text-white rounded-xl font-medium text-center transition-colors"
          >
            {t('viewBookings')}
          </Link>
        </div>
      </div>
    </div>
  )
}
