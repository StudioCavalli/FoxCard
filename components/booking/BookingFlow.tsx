'use client'

import { useState } from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { DateRangePicker } from './DateRangePicker'
import { GuestSelector } from './GuestSelector'
import { TimeSlotPicker } from './TimeSlotPicker'
import { BookingSummary } from './BookingSummary'
import { BookingConfirmation } from './BookingConfirmation'

export type BookingType = 'hotel' | 'travel' | 'service' | 'event'

interface BookingFlowProps {
  type: BookingType
  productId: string
  productName: string
  productImage?: string
  location?: string
  basePrice: number
  // Hotel/Travel specific
  priceByDate?: Record<string, number>
  unavailableDates?: string[]
  minNights?: number
  maxNights?: number
  maxGuests?: number
  // Service specific
  duration?: number
  timeSlots?: { time: string; available: boolean }[]
  providers?: { id: string; name: string; image?: string; rating?: number }[]
  // Pricing
  adultPrice?: number
  childPrice?: number
  infantPrice?: number
  taxes?: number
  // Callbacks
  onComplete: (bookingData: any) => Promise<{ success: boolean; bookingNumber?: string; error?: string }>
  className?: string
}

type Step = 'dates' | 'guests' | 'time' | 'summary' | 'confirmation'

export function BookingFlow({
  type,
  productId,
  productName,
  productImage,
  location,
  basePrice,
  priceByDate,
  unavailableDates,
  minNights = 1,
  maxNights,
  maxGuests = 10,
  duration,
  timeSlots = [],
  providers,
  adultPrice,
  childPrice,
  infantPrice,
  taxes,
  onComplete,
  className,
}: BookingFlowProps) {
  const t = useTranslations('booking')

  // State
  const [currentStep, setCurrentStep] = useState<Step>(type === 'service' ? 'time' : 'dates')
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [infants, setInfants] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [bookingNumber, setBookingNumber] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Calculate nights
  const nights = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  // Calculate totals
  const totalGuests = adults + children + infants

  const calculateTotal = () => {
    if (type === 'hotel' || type === 'travel') {
      const nightlyRate = priceByDate && startDate ? priceByDate[startDate] || basePrice : basePrice
      const roomTotal = nightlyRate * nights
      const guestTotal = (adultPrice || 0) * adults + (childPrice || 0) * children + (infantPrice || 0) * infants
      return roomTotal + guestTotal
    } else {
      // Service
      return basePrice * (adultPrice ? adults : 1)
    }
  }

  const subtotal = calculateTotal()
  const taxAmount = taxes ? subtotal * (taxes / 100) : 0
  const total = subtotal + taxAmount

  // Steps configuration based on type
  const getSteps = (): { id: Step; label: string }[] => {
    if (type === 'service') {
      return [
        { id: 'time', label: t('stepTime') },
        { id: 'summary', label: t('stepSummary') },
      ]
    }
    return [
      { id: 'dates', label: t('stepDates') },
      { id: 'guests', label: t('stepGuests') },
      { id: 'summary', label: t('stepSummary') },
    ]
  }

  const steps = getSteps()
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

  const canProceed = () => {
    switch (currentStep) {
      case 'dates':
        return type === 'service' ? !!selectedDate : (!!startDate && !!endDate)
      case 'guests':
        return adults >= 1
      case 'time':
        return !!selectedDate && !!selectedTime
      case 'summary':
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    const nextStepIndex = currentStepIndex + 1
    if (nextStepIndex < steps.length) {
      setCurrentStep(steps[nextStepIndex].id)
    }
  }

  const handleBack = () => {
    const prevStepIndex = currentStepIndex - 1
    if (prevStepIndex >= 0) {
      setCurrentStep(steps[prevStepIndex].id)
    }
  }

  const handleConfirm = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await onComplete({
        productId,
        type,
        startDate: type === 'service' ? selectedDate : startDate,
        endDate,
        time: selectedTime,
        provider: selectedProvider,
        guests: { adults, children, infants },
        nights,
        total,
      })

      if (result.success && result.bookingNumber) {
        setBookingNumber(result.bookingNumber)
        setCurrentStep('confirmation')
      } else {
        setError(result.error || t('bookingError'))
      }
    } catch (err) {
      setError(t('bookingError'))
    } finally {
      setIsLoading(false)
    }
  }

  // Build line items for summary
  const lineItems = []
  if (type === 'hotel' || type === 'travel') {
    if (nights > 0) {
      lineItems.push({
        label: `${basePrice}€ x ${nights} ${t('nights')}`,
        price: basePrice * nights,
      })
    }
    if (adultPrice && adults > 0) {
      lineItems.push({
        label: `${t('adults')} x${adults}`,
        price: adultPrice * adults,
      })
    }
    if (childPrice && children > 0) {
      lineItems.push({
        label: `${t('children')} x${children}`,
        price: childPrice * children,
      })
    }
  } else {
    lineItems.push({
      label: productName,
      price: basePrice,
    })
  }

  if (currentStep === 'confirmation' && bookingNumber) {
    return (
      <BookingConfirmation
        bookingNumber={bookingNumber}
        title={productName}
        date={type === 'service' ? selectedDate || undefined : undefined}
        time={selectedTime || undefined}
        checkIn={type !== 'service' ? startDate || undefined : undefined}
        checkOut={type !== 'service' ? endDate || undefined : undefined}
        location={location}
        guests={{ adults, children, infants }}
        email="user@example.com"
        total={total}
        className={className}
      />
    )
  }

  return (
    <div className={cn('bg-theme-surface border border-theme-border rounded-2xl', className)}>
      {/* Progress Steps */}
      <div className="flex items-center justify-between p-4 border-b border-theme-border">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                'flex items-center gap-2',
                index <= currentStepIndex ? 'text-theme-primary' : 'text-theme-text-muted'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  index < currentStepIndex
                    ? 'bg-theme-primary text-white'
                    : index === currentStepIndex
                    ? 'bg-theme-primary/10 text-theme-primary border-2 border-theme-primary'
                    : 'bg-theme-surface border border-theme-border'
                )}
              >
                {index < currentStepIndex ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <span className="hidden sm:inline text-sm font-medium">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className="w-5 h-5 text-theme-border mx-2" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="p-6">
        {currentStep === 'dates' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-theme-text">{t('selectDates')}</h3>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onDateChange={(start, end) => {
                setStartDate(start)
                setEndDate(end)
              }}
              minNights={minNights}
              maxNights={maxNights}
              unavailableDates={unavailableDates}
              priceByDate={priceByDate}
              showDoubleCalendar
            />
          </div>
        )}

        {currentStep === 'guests' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-theme-text">{t('selectGuests')}</h3>
            <GuestSelector
              adults={adults}
              children={children}
              infants={infants}
              onAdultsChange={setAdults}
              onChildrenChange={setChildren}
              onInfantsChange={setInfants}
              maxGuests={maxGuests}
              adultPrice={adultPrice}
              childPrice={childPrice}
              infantPrice={infantPrice}
              showPrices={!!adultPrice}
            />
          </div>
        )}

        {currentStep === 'time' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-theme-text">{t('selectTime')}</h3>
            <DateRangePicker
              startDate={selectedDate}
              endDate={null}
              onDateChange={(date) => setSelectedDate(date)}
              unavailableDates={unavailableDates}
            />
            {selectedDate && (
              <TimeSlotPicker
                selectedTime={selectedTime}
                onTimeChange={setSelectedTime}
                timeSlots={timeSlots}
                providers={providers}
                selectedProvider={selectedProvider}
                onProviderChange={setSelectedProvider}
                duration={duration}
              />
            )}
          </div>
        )}

        {currentStep === 'summary' && (
          <BookingSummary
            title={productName}
            image={productImage}
            location={location}
            checkIn={type !== 'service' ? startDate || undefined : undefined}
            checkOut={type !== 'service' ? endDate || undefined : undefined}
            date={type === 'service' ? selectedDate || undefined : undefined}
            time={selectedTime || undefined}
            guests={{ adults, children, infants }}
            lineItems={lineItems}
            subtotal={subtotal}
            taxes={taxAmount}
            total={total}
            onConfirm={handleConfirm}
            isLoading={isLoading}
          />
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-200">
            {error}
          </div>
        )}
      </div>

      {/* Navigation */}
      {currentStep !== 'summary' && (
        <div className="flex justify-between p-4 border-t border-theme-border">
          <button
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className="px-6 py-2.5 text-theme-text hover:bg-theme-background rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('back')}
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="px-6 py-2.5 bg-theme-primary hover:bg-theme-primary/90 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('continue')}
          </button>
        </div>
      )}
    </div>
  )
}
