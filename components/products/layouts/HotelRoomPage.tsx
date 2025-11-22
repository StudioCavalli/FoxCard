'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import {
  ArrowLeft, BedDouble, Users, Calendar, Coffee, Car, Wifi,
  Tv, Bath, Wind, MapPin, Star, Check, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useTranslations } from 'next-intl'

interface HotelRoomPageProps {
  product: any
}

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  breakfast: Coffee,
  parking: Car,
  tv: Tv,
  bathroom: Bath,
  aircon: Wind,
}

export function HotelRoomPage({ product }: HotelRoomPageProps) {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'fr'
  const t = useTranslations()
  const addItem = useCartStore((state) => state.addItem)

  const [selectedImage, setSelectedImage] = useState(0)
  const [checkIn, setCheckIn] = useState<string>('')
  const [checkOut, setCheckOut] = useState<string>('')
  const [guests, setGuests] = useState(2)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const images = product.images?.length > 0
    ? product.images
    : product.thumbnail
    ? [product.thumbnail]
    : ['/placeholder-hotel.png']
  const currentImage = images[selectedImage] || '/placeholder-hotel.png'

  // Get product attributes (stored hotel-specific data)
  const attributes = (product.attributes as Record<string, unknown>) || {}

  // Real amenities from product attributes
  const amenities = (attributes.amenities as string[]) || []
  const roomType = (attributes.roomType as string) || 'double'
  const maxGuests = (attributes.capacity as number) || 4
  const checkInTime = (attributes.checkInTime as string) || '15:00'
  const checkOutTime = (attributes.checkOutTime as string) || '11:00'
  const cancellationPolicy = (attributes.cancellationPolicy as string) || ''
  const basePrice = product.price

  // Calculate number of nights
  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  // Calculate total with options
  const optionsPrice = selectedOptions.reduce((sum, opt) => {
    const option = (product.metadata?.options || []).find((o: any) => o.id === opt)
    return sum + (option?.price || 0)
  }, 0)
  const totalPrice = nights > 0 ? (basePrice * nights) + (optionsPrice * nights) : 0

  // Generate calendar days
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

  const handleDateSelect = (day: number) => {
    const date = new Date(year, month, day)
    const dateStr = date.toISOString().split('T')[0]

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr)
      setCheckOut('')
    } else if (date > new Date(checkIn)) {
      setCheckOut(dateStr)
    } else {
      setCheckIn(dateStr)
      setCheckOut('')
    }
  }

  const isDateSelected = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0]
    return dateStr === checkIn || dateStr === checkOut
  }

  const isInRange = (day: number) => {
    if (!checkIn || !checkOut) return false
    const date = new Date(year, month, day)
    return date > new Date(checkIn) && date < new Date(checkOut)
  }

  const handleBookNow = () => {
    if (!checkIn || !checkOut) return

    addItem({
      id: product.id,
      productId: product.id,
      storeId: product.storeId,
      storeName: product.store?.name,
      name: product.name,
      slug: product.slug,
      price: totalPrice,
      image: currentImage,
      quantity: 1,
      maxQuantity: 1,
      commerceType: 'HOTEL',
      attributes: {
        checkIn,
        checkOut,
        nights,
        guests,
        options: selectedOptions,
      },
    })
    router.push(`/${locale}/cart`)
  }

  const toggleOption = (optionId: string) => {
    setSelectedOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(o => o !== optionId)
        : [...prev, optionId]
    )
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Mock options
  const options = product.metadata?.options || [
    { id: 'breakfast', name: t('product.hotel.breakfast'), price: 15 },
    { id: 'parking', name: t('product.hotel.parking'), price: 10 },
    { id: 'late_checkout', name: t('product.hotel.lateCheckout'), price: 25 },
  ]

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
          {/* Left Column - Images & Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <div className="relative aspect-[16/9] bg-theme-surface border border-theme-border rounded-2xl overflow-hidden">
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
              {product.featured && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" />
                  {t('product.hotel.recommended')}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-theme-primary shadow-lg'
                        : 'border-transparent hover:border-theme-border'
                    }`}
                  >
                    <div className="relative w-full h-full">
                      <Image src={image} alt="" fill className="object-cover" sizes="100px" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Room Info */}
            <div className="bg-theme-surface border border-theme-border rounded-2xl p-6">
              <h1
                className="text-3xl font-bold text-theme-text mb-2"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                {product.name}
              </h1>

              {product.store && (
                <div className="flex items-center gap-2 text-theme-text-secondary mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{product.store.name}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-theme-text">
                  <BedDouble className="w-5 h-5 text-theme-primary" />
                  <span>{t(`product.hotel.roomType.${roomType}`)}</span>
                </div>
                <div className="flex items-center gap-2 text-theme-text">
                  <Users className="w-5 h-5 text-theme-primary" />
                  <span>{t('product.hotel.maxGuests', { count: maxGuests })}</span>
                </div>
                <div className="flex items-center gap-2 text-theme-text">
                  <Calendar className="w-5 h-5 text-theme-primary" />
                  <span>{t('product.hotel.checkInTime')}: {checkInTime}</span>
                </div>
                <div className="flex items-center gap-2 text-theme-text">
                  <Calendar className="w-5 h-5 text-theme-primary" />
                  <span>{t('product.hotel.checkOutTime')}: {checkOutTime}</span>
                </div>
              </div>

              {/* Amenities */}
              {amenities.length > 0 && (
                <div className="border-t border-theme-border pt-4">
                  <h3 className="font-semibold text-theme-text mb-3">{t('product.hotel.amenities')}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {amenities.map((amenity) => {
                      // Try to match known amenity icons, otherwise use Check icon
                      const amenityKey = amenity.toLowerCase().replace(/\s+/g, '')
                      const Icon = amenityIcons[amenityKey] || Check
                      return (
                        <div key={amenity} className="flex items-center gap-2 text-theme-text-secondary">
                          <Icon className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm">{amenity}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Cancellation Policy */}
              {cancellationPolicy && (
                <div className="border-t border-theme-border pt-4 mt-4">
                  <h3 className="font-semibold text-theme-text mb-3">{t('product.hotel.cancellationPolicy')}</h3>
                  <p className="text-theme-text-secondary text-sm leading-relaxed">{cancellationPolicy}</p>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div className="border-t border-theme-border pt-4 mt-4">
                  <h3 className="font-semibold text-theme-text mb-3">{t('product.description')}</h3>
                  <p className="text-theme-text-secondary leading-relaxed">{product.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-theme-surface border border-theme-border rounded-2xl p-6 space-y-6">
              {/* Price */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-3xl font-bold text-theme-text"
                    style={{ fontFamily: 'var(--theme-font-heading)' }}
                  >
                    {formatPrice(basePrice)}
                  </span>
                  <span className="text-theme-text-secondary">/ {t('product.hotel.perNight')}</span>
                </div>
              </div>

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
                    const inRange = isInRange(day)

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
                            : inRange
                            ? 'bg-theme-primary/20 text-theme-primary'
                            : 'hover:bg-theme-primary/10 text-theme-text'
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>

                {/* Date Display */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-theme-border">
                  <div>
                    <label className="text-xs text-theme-text-muted">{t('product.hotel.checkIn')}</label>
                    <div className="font-semibold text-theme-text">
                      {checkIn || '--/--/----'}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-theme-text-muted">{t('product.hotel.checkOut')}</label>
                    <div className="font-semibold text-theme-text">
                      {checkOut || '--/--/----'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Guests */}
              <div>
                <label className="text-sm font-medium text-theme-text mb-2 block">
                  {t('product.hotel.guests')}
                </label>
                <div className="flex items-center gap-4 bg-theme-background border border-theme-border rounded-xl p-3">
                  <button
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="w-8 h-8 rounded-lg bg-theme-surface flex items-center justify-center hover:bg-theme-primary/10 transition-colors"
                    disabled={guests <= 1}
                  >
                    -
                  </button>
                  <div className="flex-1 text-center">
                    <Users className="w-5 h-5 mx-auto text-theme-primary mb-1" />
                    <span className="text-theme-text font-semibold">{guests}</span>
                  </div>
                  <button
                    onClick={() => setGuests(Math.min(maxGuests, guests + 1))}
                    className="w-8 h-8 rounded-lg bg-theme-surface flex items-center justify-center hover:bg-theme-primary/10 transition-colors"
                    disabled={guests >= maxGuests}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Options */}
              <div>
                <label className="text-sm font-medium text-theme-text mb-2 block">
                  {t('product.hotel.extras')}
                </label>
                <div className="space-y-2">
                  {options.map((option: any) => (
                    <button
                      key={option.id}
                      onClick={() => toggleOption(option.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                        selectedOptions.includes(option.id)
                          ? 'border-theme-primary bg-theme-primary/5'
                          : 'border-theme-border hover:border-theme-border-light'
                      }`}
                    >
                      <span className="text-theme-text">{option.name}</span>
                      <span className="text-theme-text-secondary">+{formatPrice(option.price)}/night</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              {nights > 0 && (
                <div className="border-t border-theme-border pt-4 space-y-2">
                  <div className="flex justify-between text-theme-text-secondary">
                    <span>{formatPrice(basePrice)} x {nights} {t('product.hotel.nights')}</span>
                    <span>{formatPrice(basePrice * nights)}</span>
                  </div>
                  {optionsPrice > 0 && (
                    <div className="flex justify-between text-theme-text-secondary">
                      <span>{t('product.hotel.extras')}</span>
                      <span>{formatPrice(optionsPrice * nights)}</span>
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
                disabled={!checkIn || !checkOut}
                className="w-full px-8 py-4 bg-theme-primary hover:bg-theme-primary/90 text-theme-background rounded-xl font-semibold text-lg shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                <Calendar className="w-5 h-5 inline-block mr-2" />
                {t('product.hotel.bookNow')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
