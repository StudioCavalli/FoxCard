'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import {
  ArrowLeft, Plane, MapPin, Calendar, Users, Clock, Check, X,
  ChevronDown, Star, Briefcase, Baby, User
} from 'lucide-react'
import { useTranslations } from 'next-intl'

interface TravelPackagePageProps {
  product: any
}

export function TravelPackagePage({ product }: TravelPackagePageProps) {
  const router = useRouter()
  const t = useTranslations()
  const addItem = useCartStore((state) => state.addItem)

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [infants, setInfants] = useState(0)
  const [travelClass, setTravelClass] = useState<'economy' | 'business' | 'first'>('economy')
  const [expandedDay, setExpandedDay] = useState<number | null>(0)

  const images = product.images?.length > 0
    ? product.images
    : product.thumbnail
    ? [product.thumbnail]
    : ['/placeholder-travel.png']
  const currentImage = images[selectedImage] || '/placeholder-travel.png'

  // Mock data - would come from product metadata
  const duration = product.metadata?.duration || '7 days / 6 nights'
  const destination = product.metadata?.destination || product.name
  const departureDates = product.metadata?.departureDates || [
    { date: '2025-06-15', available: 12, price: product.price },
    { date: '2025-06-22', available: 8, price: product.price * 1.1 },
    { date: '2025-07-01', available: 15, price: product.price * 1.15 },
    { date: '2025-07-15', available: 5, price: product.price * 1.2 },
  ]

  const itinerary = product.metadata?.itinerary || [
    { day: 1, title: t('product.travel.day1Title'), description: t('product.travel.day1Desc') },
    { day: 2, title: t('product.travel.day2Title'), description: t('product.travel.day2Desc') },
    { day: 3, title: t('product.travel.day3Title'), description: t('product.travel.day3Desc') },
    { day: 4, title: t('product.travel.day4Title'), description: t('product.travel.day4Desc') },
  ]

  const inclusions = product.metadata?.inclusions || [
    t('product.travel.inclusion1'),
    t('product.travel.inclusion2'),
    t('product.travel.inclusion3'),
    t('product.travel.inclusion4'),
  ]

  const exclusions = product.metadata?.exclusions || [
    t('product.travel.exclusion1'),
    t('product.travel.exclusion2'),
  ]

  // Price calculation
  const basePrice = selectedDate
    ? departureDates.find((d: any) => d.date === selectedDate)?.price || product.price
    : product.price

  const classMultiplier = travelClass === 'business' ? 1.5 : travelClass === 'first' ? 2.5 : 1
  const adultPrice = basePrice * classMultiplier
  const childPrice = adultPrice * 0.7
  const infantPrice = adultPrice * 0.1

  const totalPrice = (adults * adultPrice) + (children * childPrice) + (infants * infantPrice)
  const totalPassengers = adults + children + infants

  const handleBookNow = () => {
    if (!selectedDate) return

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
      commerceType: 'TRAVEL',
      attributes: {
        departureDate: selectedDate,
        adults,
        children,
        infants,
        travelClass,
        destination,
      },
    })
    router.push('/cart')
  }

  return (
    <div style={{ fontFamily: 'var(--theme-font-body)' }}>
      {/* Hero Banner */}
      <div className="relative h-[40vh] min-h-[400px]">
        <Image
          src={currentImage}
          alt={product.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="mx-auto" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
            <Link
              href="/products"
              className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t('product.backToProducts')}
            </Link>
            {product.featured && (
              <div className="inline-flex items-center gap-1 bg-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full mb-4 ml-4">
                <Star className="w-4 h-4 fill-current" />
                {t('product.travel.featured')}
              </div>
            )}
            <h1
              className="text-4xl md:text-5xl font-bold text-white mb-2"
              style={{ fontFamily: 'var(--theme-font-heading)' }}
            >
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {destination}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {duration}
              </span>
              <span className="flex items-center gap-2">
                <Plane className="w-5 h-5" />
                {t('product.travel.roundTrip')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-6 lg:px-8 py-12" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left - Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {product.description && (
              <div className="bg-theme-surface border border-theme-border rounded-2xl p-6">
                <h2 className="text-xl font-bold text-theme-text mb-4" style={{ fontFamily: 'var(--theme-font-heading)' }}>
                  {t('product.travel.overview')}
                </h2>
                <p className="text-theme-text-secondary leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Itinerary */}
            <div className="bg-theme-surface border border-theme-border rounded-2xl p-6">
              <h2 className="text-xl font-bold text-theme-text mb-4" style={{ fontFamily: 'var(--theme-font-heading)' }}>
                {t('product.travel.itinerary')}
              </h2>
              <div className="space-y-3">
                {itinerary.map((day: any, index: number) => (
                  <div
                    key={day.day}
                    className="border border-theme-border rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedDay(expandedDay === index ? null : index)}
                      className="w-full flex items-center justify-between p-4 hover:bg-theme-background transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-theme-primary/10 flex items-center justify-center text-theme-primary font-bold">
                          {day.day}
                        </div>
                        <span className="font-semibold text-theme-text">{day.title}</span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-theme-text-muted transition-transform ${
                          expandedDay === index ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {expandedDay === index && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="pl-14 text-theme-text-secondary">{day.description}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Inclusions & Exclusions */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-theme-surface border border-theme-border rounded-2xl p-6">
                <h3 className="text-lg font-bold text-theme-text mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  {t('product.travel.inclusions')}
                </h3>
                <ul className="space-y-2">
                  {inclusions.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-theme-text-secondary">
                      <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-theme-surface border border-theme-border rounded-2xl p-6">
                <h3 className="text-lg font-bold text-theme-text mb-4 flex items-center gap-2">
                  <X className="w-5 h-5 text-red-600" />
                  {t('product.travel.exclusions')}
                </h3>
                <ul className="space-y-2">
                  {exclusions.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-theme-text-secondary">
                      <X className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Gallery */}
            {images.length > 1 && (
              <div className="bg-theme-surface border border-theme-border rounded-2xl p-6">
                <h2 className="text-xl font-bold text-theme-text mb-4" style={{ fontFamily: 'var(--theme-font-heading)' }}>
                  {t('product.travel.gallery')}
                </h2>
                <div className="grid grid-cols-4 gap-3">
                  {images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === i ? 'border-theme-primary' : 'border-transparent hover:border-theme-border'
                      }`}
                    >
                      <div className="relative w-full h-full">
                        <Image src={img} alt="" fill className="object-cover" sizes="100px" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right - Booking */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-theme-surface border border-theme-border rounded-2xl p-6 space-y-6">
              {/* Price */}
              <div>
                <span className="text-theme-text-muted text-sm">{t('product.travel.startingFrom')}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-theme-text" style={{ fontFamily: 'var(--theme-font-heading)' }}>
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-theme-text-muted">/ {t('product.travel.perPerson')}</span>
                </div>
              </div>

              {/* Departure Dates */}
              <div>
                <label className="text-sm font-medium text-theme-text mb-2 block">
                  {t('product.travel.departureDate')}
                </label>
                <div className="space-y-2">
                  {departureDates.map((departure: any) => (
                    <button
                      key={departure.date}
                      onClick={() => setSelectedDate(departure.date)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                        selectedDate === departure.date
                          ? 'border-theme-primary bg-theme-primary/5'
                          : 'border-theme-border hover:border-theme-border-light'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-theme-primary" />
                        <span className="text-theme-text font-medium">
                          {new Date(departure.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-theme-text font-semibold">{formatPrice(departure.price)}</div>
                        <div className="text-xs text-theme-text-muted">
                          {departure.available} {t('product.travel.placesLeft')}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Passengers */}
              <div>
                <label className="text-sm font-medium text-theme-text mb-2 block">
                  {t('product.travel.passengers')}
                </label>
                <div className="space-y-3">
                  {/* Adults */}
                  <div className="flex items-center justify-between p-3 bg-theme-background border border-theme-border rounded-xl">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-theme-primary" />
                      <div>
                        <div className="text-theme-text font-medium">{t('product.travel.adults')}</div>
                        <div className="text-xs text-theme-text-muted">12+ {t('product.travel.years')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        className="w-8 h-8 rounded-lg bg-theme-surface flex items-center justify-center hover:bg-theme-primary/10"
                        disabled={adults <= 1}
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-semibold">{adults}</span>
                      <button
                        onClick={() => setAdults(adults + 1)}
                        className="w-8 h-8 rounded-lg bg-theme-surface flex items-center justify-center hover:bg-theme-primary/10"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between p-3 bg-theme-background border border-theme-border rounded-xl">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-theme-primary" />
                      <div>
                        <div className="text-theme-text font-medium">{t('product.travel.children')}</div>
                        <div className="text-xs text-theme-text-muted">2-11 {t('product.travel.years')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        className="w-8 h-8 rounded-lg bg-theme-surface flex items-center justify-center hover:bg-theme-primary/10"
                        disabled={children <= 0}
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-semibold">{children}</span>
                      <button
                        onClick={() => setChildren(children + 1)}
                        className="w-8 h-8 rounded-lg bg-theme-surface flex items-center justify-center hover:bg-theme-primary/10"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Infants */}
                  <div className="flex items-center justify-between p-3 bg-theme-background border border-theme-border rounded-xl">
                    <div className="flex items-center gap-2">
                      <Baby className="w-5 h-5 text-theme-primary" />
                      <div>
                        <div className="text-theme-text font-medium">{t('product.travel.infants')}</div>
                        <div className="text-xs text-theme-text-muted">0-2 {t('product.travel.years')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setInfants(Math.max(0, infants - 1))}
                        className="w-8 h-8 rounded-lg bg-theme-surface flex items-center justify-center hover:bg-theme-primary/10"
                        disabled={infants <= 0}
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-semibold">{infants}</span>
                      <button
                        onClick={() => setInfants(infants + 1)}
                        className="w-8 h-8 rounded-lg bg-theme-surface flex items-center justify-center hover:bg-theme-primary/10"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Travel Class */}
              <div>
                <label className="text-sm font-medium text-theme-text mb-2 block">
                  {t('product.travel.class')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['economy', 'business', 'first'] as const).map((cls) => (
                    <button
                      key={cls}
                      onClick={() => setTravelClass(cls)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                        travelClass === cls
                          ? 'border-theme-primary bg-theme-primary text-white'
                          : 'border-theme-border hover:border-theme-border-light text-theme-text'
                      }`}
                    >
                      {t(`product.travel.${cls}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className="border-t border-theme-border pt-4 space-y-2">
                {adults > 0 && (
                  <div className="flex justify-between text-theme-text-secondary text-sm">
                    <span>{adults} {t('product.travel.adults')}</span>
                    <span>{formatPrice(adults * adultPrice)}</span>
                  </div>
                )}
                {children > 0 && (
                  <div className="flex justify-between text-theme-text-secondary text-sm">
                    <span>{children} {t('product.travel.children')} (-30%)</span>
                    <span>{formatPrice(children * childPrice)}</span>
                  </div>
                )}
                {infants > 0 && (
                  <div className="flex justify-between text-theme-text-secondary text-sm">
                    <span>{infants} {t('product.travel.infants')}</span>
                    <span>{formatPrice(infants * infantPrice)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-theme-text text-lg pt-2 border-t border-theme-border">
                  <span>{t('product.total')}</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={handleBookNow}
                disabled={!selectedDate}
                className="w-full px-8 py-4 bg-theme-primary hover:bg-theme-primary/90 text-theme-background rounded-xl font-semibold text-lg shadow-lg shadow-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/40 transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                <Plane className="w-5 h-5" />
                {t('product.travel.bookNow')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
