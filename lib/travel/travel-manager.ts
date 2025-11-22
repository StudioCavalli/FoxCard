/**
 * Travel Management System
 * Handles travel packages, itineraries, passengers, and bookings
 */

import { prisma } from '@/lib/prisma'

// Types
export type TravelClass = 'ECONOMY' | 'PREMIUM' | 'BUSINESS' | 'FIRST'
export type PassengerType = 'ADULT' | 'CHILD' | 'INFANT' | 'SENIOR'
export type TravelType = 'CIRCUIT' | 'STAY' | 'CRUISE' | 'FLIGHT' | 'TRANSFER' | 'WEEKEND'

export interface TravelPackage {
  id: string
  name: string
  description: string
  type: TravelType
  destinations: string[]
  departureCity?: string
  duration: number // days
  basePrice: number
  inclusions: string[]
  exclusions: string[]
  itinerary: ItineraryDay[]
  images: string[]
  highlights: string[]
  minParticipants?: number
  maxParticipants?: number
  difficulty?: 'EASY' | 'MODERATE' | 'CHALLENGING' | 'EXPERT'
  departureDates: DepartureDate[]
  passengerPricing: PassengerPricing[]
  classUpgrades: ClassUpgrade[]
  active: boolean
}

export interface ItineraryDay {
  day: number
  title: string
  description: string
  activities: string[]
  meals: ('breakfast' | 'lunch' | 'dinner')[]
  accommodation?: string
  transport?: string
}

export interface DepartureDate {
  id: string
  date: string
  endDate: string
  price: number // May differ from base price
  spotsAvailable: number
  spotsTotal: number
  status: 'AVAILABLE' | 'LIMITED' | 'SOLD_OUT' | 'CANCELLED'
  guaranteedDeparture: boolean
}

export interface PassengerPricing {
  type: PassengerType
  priceModifier: number // 1.0 = base price, 0.5 = 50% off
  minAge?: number
  maxAge?: number
}

export interface ClassUpgrade {
  class: TravelClass
  priceAdditional: number
  description: string
}

export interface TravelBooking {
  id: string
  bookingNumber: string
  packageId: string
  packageName: string
  departureDate: string
  returnDate: string
  passengers: PassengerInfo[]
  travelClass: TravelClass
  totalPrice: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  specialRequests?: string
  createdAt: Date
}

export interface PassengerInfo {
  type: PassengerType
  firstName: string
  lastName: string
  birthDate: string
  passportNumber?: string
  passportExpiry?: string
  nationality?: string
  specialNeeds?: string
}

// Travel type labels
export const TRAVEL_TYPE_LABELS: Record<TravelType, string> = {
  CIRCUIT: 'Circuit',
  STAY: 'Séjour',
  CRUISE: 'Croisière',
  FLIGHT: 'Vol',
  TRANSFER: 'Transfert',
  WEEKEND: 'Week-end',
}

export const TRAVEL_CLASS_LABELS: Record<TravelClass, string> = {
  ECONOMY: 'Économique',
  PREMIUM: 'Premium Économique',
  BUSINESS: 'Business',
  FIRST: 'Première',
}

export const PASSENGER_TYPE_LABELS: Record<PassengerType, string> = {
  ADULT: 'Adulte',
  CHILD: 'Enfant',
  INFANT: 'Bébé',
  SENIOR: 'Senior',
}

// Package Management
export async function getTravelPackages(storeId: string): Promise<TravelPackage[]> {
  const products = await prisma.product.findMany({
    where: {
      storeId,
      status: 'ACTIVE',
    },
    orderBy: { name: 'asc' },
  })

  return products.map((product) => {
    const attributes = (product.attributes as Record<string, unknown>) || {}

    return {
      id: product.id,
      name: product.name,
      description: product.description || '',
      type: (attributes.travelType as TravelType) || 'CIRCUIT',
      destinations: (attributes.destinations as string[]) || [],
      departureCity: attributes.departureCity as string | undefined,
      duration: (attributes.duration as number) || 1,
      basePrice: product.price,
      inclusions: (attributes.inclusions as string[]) || [],
      exclusions: (attributes.exclusions as string[]) || [],
      itinerary: (attributes.itinerary as ItineraryDay[]) || [],
      images: product.images,
      highlights: (attributes.highlights as string[]) || [],
      minParticipants: attributes.minParticipants as number | undefined,
      maxParticipants: attributes.maxParticipants as number | undefined,
      difficulty: attributes.difficulty as 'EASY' | 'MODERATE' | 'CHALLENGING' | 'EXPERT' | undefined,
      departureDates: (attributes.departureDates as DepartureDate[]) || [],
      passengerPricing: (attributes.passengerPricing as PassengerPricing[]) || getDefaultPassengerPricing(),
      classUpgrades: (attributes.classUpgrades as ClassUpgrade[]) || [],
      active: product.status === 'ACTIVE',
    }
  })
}

export async function getTravelPackage(storeId: string, packageId: string): Promise<TravelPackage | null> {
  const product = await prisma.product.findFirst({
    where: {
      id: packageId,
      storeId,
    },
  })

  if (!product) return null

  const attributes = (product.attributes as Record<string, unknown>) || {}

  return {
    id: product.id,
    name: product.name,
    description: product.description || '',
    type: (attributes.travelType as TravelType) || 'CIRCUIT',
    destinations: (attributes.destinations as string[]) || [],
    departureCity: attributes.departureCity as string | undefined,
    duration: (attributes.duration as number) || 1,
    basePrice: product.price,
    inclusions: (attributes.inclusions as string[]) || [],
    exclusions: (attributes.exclusions as string[]) || [],
    itinerary: (attributes.itinerary as ItineraryDay[]) || [],
    images: product.images,
    highlights: (attributes.highlights as string[]) || [],
    minParticipants: attributes.minParticipants as number | undefined,
    maxParticipants: attributes.maxParticipants as number | undefined,
    difficulty: attributes.difficulty as 'EASY' | 'MODERATE' | 'CHALLENGING' | 'EXPERT' | undefined,
    departureDates: (attributes.departureDates as DepartureDate[]) || [],
    passengerPricing: (attributes.passengerPricing as PassengerPricing[]) || getDefaultPassengerPricing(),
    classUpgrades: (attributes.classUpgrades as ClassUpgrade[]) || [],
    active: product.status === 'ACTIVE',
  }
}

function getDefaultPassengerPricing(): PassengerPricing[] {
  return [
    { type: 'ADULT', priceModifier: 1.0, minAge: 18 },
    { type: 'CHILD', priceModifier: 0.7, minAge: 2, maxAge: 11 },
    { type: 'INFANT', priceModifier: 0.1, maxAge: 2 },
    { type: 'SENIOR', priceModifier: 0.9, minAge: 65 },
  ]
}

// Departure Date Management
export async function getAvailableDepartures(
  storeId: string,
  packageId: string,
  startDate?: Date,
  endDate?: Date
): Promise<DepartureDate[]> {
  const pkg = await getTravelPackage(storeId, packageId)
  if (!pkg) return []

  const now = new Date()
  const start = startDate || now
  const end = endDate || new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)

  return pkg.departureDates.filter((d) => {
    const date = new Date(d.date)
    return date >= start && date <= end && d.status !== 'CANCELLED'
  })
}

export async function addDepartureDate(
  storeId: string,
  packageId: string,
  departure: Omit<DepartureDate, 'id'>
): Promise<DepartureDate | null> {
  const product = await prisma.product.findFirst({
    where: { id: packageId, storeId },
  })

  if (!product) return null

  const attributes = (product.attributes as Record<string, unknown>) || {}
  const departureDates = (attributes.departureDates as DepartureDate[]) || []

  const newDeparture: DepartureDate = {
    ...departure,
    id: `dep_${Date.now()}`,
  }

  departureDates.push(newDeparture)

  await prisma.product.update({
    where: { id: packageId },
    data: {
      attributes: JSON.parse(JSON.stringify({
        ...attributes,
        departureDates,
      })),
    },
  })

  return newDeparture
}

export async function updateDepartureDate(
  storeId: string,
  packageId: string,
  departureId: string,
  updates: Partial<DepartureDate>
): Promise<DepartureDate | null> {
  const product = await prisma.product.findFirst({
    where: { id: packageId, storeId },
  })

  if (!product) return null

  const attributes = (product.attributes as Record<string, unknown>) || {}
  const departureDates = (attributes.departureDates as DepartureDate[]) || []

  const index = departureDates.findIndex((d) => d.id === departureId)
  if (index === -1) return null

  departureDates[index] = { ...departureDates[index], ...updates }

  await prisma.product.update({
    where: { id: packageId },
    data: {
      attributes: JSON.parse(JSON.stringify({
        ...attributes,
        departureDates,
      })),
    },
  })

  return departureDates[index]
}

// Price Calculation
export function calculateTravelPrice(
  basePrice: number,
  passengers: { type: PassengerType; count: number }[],
  passengerPricing: PassengerPricing[],
  travelClass: TravelClass,
  classUpgrades: ClassUpgrade[],
  departureDate?: DepartureDate
): {
  total: number
  breakdown: { label: string; amount: number }[]
} {
  const breakdown: { label: string; amount: number }[] = []
  let total = 0

  // Use departure date price if available
  const pricePerPerson = departureDate?.price || basePrice

  // Calculate per passenger type
  for (const passenger of passengers) {
    const pricing = passengerPricing.find((p) => p.type === passenger.type)
    const modifier = pricing?.priceModifier || 1.0
    const amount = pricePerPerson * modifier * passenger.count

    if (passenger.count > 0) {
      breakdown.push({
        label: `${PASSENGER_TYPE_LABELS[passenger.type]} x${passenger.count}`,
        amount,
      })
      total += amount
    }
  }

  // Add class upgrade if not economy
  if (travelClass !== 'ECONOMY') {
    const upgrade = classUpgrades.find((u) => u.class === travelClass)
    if (upgrade) {
      const totalPassengers = passengers.reduce((sum, p) => sum + p.count, 0)
      const upgradeAmount = upgrade.priceAdditional * totalPassengers
      breakdown.push({
        label: `Supplément ${TRAVEL_CLASS_LABELS[travelClass]}`,
        amount: upgradeAmount,
      })
      total += upgradeAmount
    }
  }

  return {
    total: Math.round(total * 100) / 100,
    breakdown,
  }
}

// Travel Statistics
export async function getTravelStats(
  storeId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  totalBookings: number
  revenue: number
  popularDestinations: { destination: string; count: number }[]
  bookingsByType: Record<TravelType, number>
  averageGroupSize: number
  upcomingDepartures: number
}> {
  const orders = await prisma.order.findMany({
    where: {
      storeId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        in: ['COMPLETED', 'PROCESSING'],
      },
    },
    select: {
      total: true,
      notes: true,
    },
  })

  const packages = await getTravelPackages(storeId)
  const now = new Date()

  // Count upcoming departures
  const upcomingDepartures = packages.reduce((count, pkg) => {
    return count + pkg.departureDates.filter(
      (d) => new Date(d.date) > now && d.status === 'AVAILABLE'
    ).length
  }, 0)

  // Group destinations
  const destinationCounts: Record<string, number> = {}
  const typeCounts: Record<TravelType, number> = {
    CIRCUIT: 0,
    STAY: 0,
    CRUISE: 0,
    FLIGHT: 0,
    TRANSFER: 0,
    WEEKEND: 0,
  }

  for (const pkg of packages) {
    typeCounts[pkg.type] = (typeCounts[pkg.type] || 0) + 1
    for (const dest of pkg.destinations) {
      destinationCounts[dest] = (destinationCounts[dest] || 0) + 1
    }
  }

  const popularDestinations = Object.entries(destinationCounts)
    .map(([destination, count]) => ({ destination, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const revenue = orders.reduce((sum, o) => sum + o.total, 0)

  return {
    totalBookings: orders.length,
    revenue,
    popularDestinations,
    bookingsByType: typeCounts,
    averageGroupSize: orders.length > 0 ? 2.5 : 0, // Simplified
    upcomingDepartures,
  }
}

// Itinerary Formatting
export function formatItinerary(itinerary: ItineraryDay[]): string {
  return itinerary
    .map((day) => {
      const meals = day.meals.length > 0
        ? ` [${day.meals.map((m) => m[0].toUpperCase()).join('')}]`
        : ''
      return `Jour ${day.day}: ${day.title}${meals}`
    })
    .join('\n')
}

export function formatDuration(days: number): string {
  if (days === 1) return '1 jour'
  const nights = days - 1
  return `${days} jours / ${nights} nuit${nights > 1 ? 's' : ''}`
}

// Common inclusions/exclusions
export const COMMON_INCLUSIONS = [
  'Vols internationaux',
  'Vols intérieurs',
  'Hébergement en hôtels',
  'Petit-déjeuner',
  'Demi-pension',
  'Pension complète',
  'Transferts aéroport',
  'Transferts terrestres',
  'Guide accompagnateur',
  'Visites mentionnées',
  'Entrées aux sites',
  'Assurance voyage',
  'Assistance 24h/24',
]

export const COMMON_EXCLUSIONS = [
  'Assurance annulation',
  'Pourboires',
  'Dépenses personnelles',
  'Boissons aux repas',
  'Repas non mentionnés',
  'Excursions optionnelles',
  'Visa',
  'Tests PCR',
  'Supplément chambre individuelle',
]
