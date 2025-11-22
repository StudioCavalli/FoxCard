'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import {
  ArrowLeft, Calendar, Clock, User, MapPin, Star, Check,
  ChevronLeft, ChevronRight, Users
} from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ServiceBookingPageProps {
  product: any
}

interface Provider {
  id: string
  name: string
  image?: string
  rating: number
  reviewCount: number
}

interface TimeSlot {
  time: string
  available: boolean
}

export function ServiceBookingPage({ product }: ServiceBookingPageProps) {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'fr'
  const t = useTranslations()
  const addItem = useCartStore((state) => state.addItem)

  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [participants, setParticipants] = useState(1)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const images = product.images?.length > 0
    ? product.images
    : product.thumbnail
    ? [product.thumbnail]
    : ['/placeholder-service.png']
  const mainImage = images[0] || '/placeholder-service.png'

  // Service metadata
  const duration = product.metadata?.duration || 60 // minutes
  const maxParticipants = product.metadata?.maxParticipants || 10
  const location = product.metadata?.location || product.store?.name
  const isGroupService = product.metadata?.isGroup || false

  // Providers
  const providers: Provider[] = product.metadata?.providers || [
    { id: 'any', name: t('product.service.anyProvider'), rating: 0, reviewCount: 0 },
    { id: 'p1', name: 'Sophie Martin', image: '/providers/sophie.jpg', rating: 4.9, reviewCount: 127 },
    { id: 'p2', name: 'Marc Dubois', image: '/providers/marc.jpg', rating: 4.8, reviewCount: 89 },
  ]

  // Time slots - in production, fetch based on selected date and provider
  const timeSlots: TimeSlot[] = [
    { time: '09:00', available: true },
    { time: '10:00', available: true },
    { time: '11:00', available: false },
    { time: '14:00', available: true },
    { time: '15:00', available: true },
    { time: '16:00', available: true },
    { time: '17:00', available: false },
  ]

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    return { daysInMonth, firstDay, year, month }
  }

  const { daysInMonth, firstDay, year, month } = getDaysInMonth(currentMonth)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const handleDateSelect = (day: number) => {
    const date = new Date(year, month, day)
    setSelectedDate(date.toISOString().split('T')[0])
    setSelectedTime('')
  }

  const isDateSelected = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0]
    return dateStr === selectedDate
  }

  // Calculate total
  const totalPrice = isGroupService
    ? product.price
    : product.price * participants

  const handleBookNow = () => {
    if (!selectedDate || !selectedTime) return

    addItem({
      id: product.id,
      productId: product.id,
      storeId: product.storeId,
      storeName: product.store?.name,
      name: product.name,
      slug: product.slug,
      price: totalPrice,
      image: mainImage,
      quantity: 1,
      maxQuantity: 1,
      commerceType: 'SERVICES',
      attributes: {
        date: selectedDate,
        time: selectedTime,
        provider: selectedProvider,
        participants,
        duration,
      },
    })
    router.push(`/${locale}/cart`)
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }

  return (
    <div style={{ fontFamily: 'var(--theme-font-body)' }}>
      <div className="mx-auto px-6 lg:px-8 py-12" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
        {/* Back Button */}
        <Link
          href={`/${locale}/products`}
          className="group inline-flex items-center text-theme-text-secondary hover:text-theme-primary mb-8 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
          {t('product.backToProducts')}
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left - Service Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <div className="relative aspect-[16/9] bg-theme-surface border border-theme-border rounded-2xl overflow-hidden">
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
              {product.featured && (
                <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" />
                  {t('product.service.popular')}
                </div>
              )}
            </div>

            {/* Service Details */}
            <div className="bg-theme-surface border border-theme-border rounded-2xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  {product.category && (
                    <span className="inline-block px-3 py-1 bg-theme-primary/10 text-theme-primary font-medium rounded-full text-sm mb-3">
                      {product.category.name}
                    </span>
                  )}
                  <h1
                    className="text-3xl font-bold text-theme-text"
                    style={{ fontFamily: 'var(--theme-font-heading)' }}
                  >
                    {product.name}
                  </h1>
                </div>
                <div className="text-right">
                  <div
                    className="text-3xl font-bold text-theme-text"
                    style={{ fontFamily: 'var(--theme-font-heading)' }}
                  >
                    {formatPrice(product.price)}
                  </div>
                  {isGroupService ? (
                    <div className="text-sm text-theme-text-muted">/ {t('product.service.perGroup')}</div>
                  ) : (
                    <div className="text-sm text-theme-text-muted">/ {t('product.service.perPerson')}</div>
                  )}
                </div>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 py-4 border-y border-theme-border">
                <div className="flex items-center gap-2 text-theme-text-secondary">
                  <Clock className="w-5 h-5 text-theme-primary" />
                  <span>{formatDuration(duration)}</span>
                </div>
                <div className="flex items-center gap-2 text-theme-text-secondary">
                  <MapPin className="w-5 h-5 text-theme-primary" />
                  <span>{location}</span>
                </div>
                {maxParticipants > 1 && (
                  <div className="flex items-center gap-2 text-theme-text-secondary">
                    <Users className="w-5 h-5 text-theme-primary" />
                    <span>{t('product.service.maxParticipants', { count: maxParticipants })}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="pt-4">
                  <h3 className="font-semibold text-theme-text mb-3">{t('product.description')}</h3>
                  <p className="text-theme-text-secondary leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            {/* Provider Selection */}
            {providers.length > 1 && (
              <div className="bg-theme-surface border border-theme-border rounded-2xl p-6">
                <h3 className="font-semibold text-theme-text mb-4">{t('product.service.chooseProvider')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {providers.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => setSelectedProvider(provider.id)}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                        selectedProvider === provider.id
                          ? 'border-theme-primary bg-theme-primary/5'
                          : 'border-theme-border hover:border-theme-border-light'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-theme-background border border-theme-border overflow-hidden flex items-center justify-center">
                        {provider.image ? (
                          <Image
                            src={provider.image}
                            alt={provider.name}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-theme-text-muted" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-theme-text">{provider.name}</div>
                        {provider.rating > 0 && (
                          <div className="flex items-center gap-1 text-sm text-theme-text-muted">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span>{provider.rating}</span>
                            <span>({provider.reviewCount} {t('product.service.reviews')})</span>
                          </div>
                        )}
                      </div>
                      {selectedProvider === provider.id && (
                        <Check className="w-5 h-5 text-theme-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right - Booking */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-theme-surface border border-theme-border rounded-2xl p-6 space-y-6">
              <h3 className="font-semibold text-theme-text">{t('product.service.selectDateTime')}</h3>

              {/* Calendar */}
              <div className="border border-theme-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentMonth(new Date(year, month - 1))}
                    className="p-1 hover:bg-theme-primary/10 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="font-semibold text-theme-text">
                    {monthNames[month]} {year}
                  </span>
                  <button
                    onClick={() => setCurrentMonth(new Date(year, month + 1))}
                    className="p-1 hover:bg-theme-primary/10 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {dayNames.map((day) => (
                    <div key={day} className="text-theme-text-muted font-medium py-1">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const date = new Date(year, month, day)
                    const isPast = date < today
                    const isSelected = isDateSelected(day)

                    return (
                      <button
                        key={day}
                        onClick={() => !isPast && handleDateSelect(day)}
                        disabled={isPast}
                        className={`py-2 rounded-lg text-sm transition-all ${
                          isPast
                            ? 'text-theme-text-muted cursor-not-allowed'
                            : isSelected
                            ? 'bg-theme-primary text-white font-semibold'
                            : 'hover:bg-theme-primary/10 text-theme-text'
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <h4 className="font-medium text-theme-text mb-3">{t('product.service.availableSlots')}</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`p-2 rounded-lg text-sm font-medium transition-all ${
                          selectedTime === slot.time
                            ? 'bg-theme-primary text-white'
                            : slot.available
                            ? 'bg-theme-background border border-theme-border hover:border-theme-primary text-theme-text'
                            : 'bg-theme-background/50 text-theme-text-muted cursor-not-allowed line-through'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Participants */}
              {!isGroupService && maxParticipants > 1 && (
                <div>
                  <h4 className="font-medium text-theme-text mb-3">{t('product.service.participants')}</h4>
                  <div className="flex items-center gap-4 bg-theme-background border border-theme-border rounded-xl p-3">
                    <button
                      onClick={() => setParticipants(Math.max(1, participants - 1))}
                      className="w-8 h-8 rounded-lg bg-theme-surface flex items-center justify-center hover:bg-theme-primary/10 transition-colors"
                      disabled={participants <= 1}
                    >
                      -
                    </button>
                    <div className="flex-1 text-center">
                      <Users className="w-5 h-5 mx-auto text-theme-primary mb-1" />
                      <span className="text-theme-text font-semibold">{participants}</span>
                    </div>
                    <button
                      onClick={() => setParticipants(Math.min(maxParticipants, participants + 1))}
                      className="w-8 h-8 rounded-lg bg-theme-surface flex items-center justify-center hover:bg-theme-primary/10 transition-colors"
                      disabled={participants >= maxParticipants}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Summary */}
              {selectedDate && selectedTime && (
                <div className="border-t border-theme-border pt-4 space-y-2">
                  <div className="flex justify-between text-theme-text-secondary">
                    <span>{t('product.service.date')}</span>
                    <span>{new Date(selectedDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-theme-text-secondary">
                    <span>{t('product.service.time')}</span>
                    <span>{selectedTime}</span>
                  </div>
                  <div className="flex justify-between text-theme-text-secondary">
                    <span>{t('product.service.duration')}</span>
                    <span>{formatDuration(duration)}</span>
                  </div>
                  {!isGroupService && participants > 1 && (
                    <div className="flex justify-between text-theme-text-secondary">
                      <span>{formatPrice(product.price)} x {participants}</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-theme-text text-lg pt-2 border-t border-theme-border">
                    <span>{t('product.total')}</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              )}

              {/* Book Button */}
              <button
                onClick={handleBookNow}
                disabled={!selectedDate || !selectedTime}
                className="w-full px-8 py-4 bg-theme-primary hover:bg-theme-primary/90 text-theme-background rounded-xl font-semibold text-lg shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                <Calendar className="w-5 h-5" />
                {t('product.service.bookNow')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
