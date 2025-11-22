/**
 * Hotel Management System
 * Handles room availability, bookings, rates, and guest management
 */

import { prisma } from '@/lib/prisma'

// Types
export type RoomType = 'STANDARD' | 'SUPERIOR' | 'SUITE' | 'FAMILY' | 'DELUXE' | 'PENTHOUSE'
export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE' | 'BLOCKED'
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW'

export interface RoomInfo {
  id: string
  number: string
  type: RoomType
  floor: number
  capacity: number
  beds: { type: string; count: number }[]
  amenities: string[]
  size?: number // square meters
  view?: string
  basePrice: number
  status: RoomStatus
  images: string[]
  description?: string
}

export interface RoomAvailability {
  roomId: string
  date: string
  available: boolean
  price: number
  minimumStay?: number
  reason?: string
}

export interface HotelBooking {
  id: string
  bookingNumber: string
  guestName: string
  guestEmail: string
  guestPhone?: string
  roomId: string
  roomNumber: string
  checkIn: Date
  checkOut: Date
  nights: number
  adults: number
  children: number
  totalPrice: number
  status: BookingStatus
  specialRequests?: string
  extras?: { name: string; price: number }[]
  createdAt: Date
}

export interface RateRule {
  id: string
  name: string
  type: 'WEEKEND' | 'WEEKDAY' | 'SEASONAL' | 'EVENT' | 'LAST_MINUTE' | 'EARLY_BIRD'
  modifier: number // percentage (1.2 = 20% increase, 0.8 = 20% decrease)
  startDate?: string
  endDate?: string
  daysOfWeek?: number[]
  minimumStay?: number
  priority: number
}

// Amenities list
export const HOTEL_AMENITIES = [
  { id: 'wifi', label: 'WiFi gratuit', icon: '📶' },
  { id: 'parking', label: 'Parking', icon: '🅿️' },
  { id: 'pool', label: 'Piscine', icon: '🏊' },
  { id: 'spa', label: 'Spa', icon: '💆' },
  { id: 'gym', label: 'Salle de sport', icon: '🏋️' },
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { id: 'bar', label: 'Bar', icon: '🍸' },
  { id: 'room_service', label: 'Room service', icon: '🛎️' },
  { id: 'aircon', label: 'Climatisation', icon: '❄️' },
  { id: 'heating', label: 'Chauffage', icon: '🔥' },
  { id: 'tv', label: 'TV', icon: '📺' },
  { id: 'minibar', label: 'Minibar', icon: '🍹' },
  { id: 'safe', label: 'Coffre-fort', icon: '🔐' },
  { id: 'balcony', label: 'Balcon', icon: '🌅' },
  { id: 'sea_view', label: 'Vue mer', icon: '🌊' },
  { id: 'mountain_view', label: 'Vue montagne', icon: '⛰️' },
  { id: 'garden_view', label: 'Vue jardin', icon: '🌳' },
  { id: 'pets', label: 'Animaux acceptés', icon: '🐕' },
  { id: 'accessible', label: 'Accès handicapés', icon: '♿' },
  { id: 'breakfast', label: 'Petit-déjeuner inclus', icon: '🥐' },
]

// Room Management (stored in store.settings.hotel)
export async function getRooms(storeId: string): Promise<RoomInfo[]> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { settings: true },
  })

  const settings = store?.settings as Record<string, unknown> | null
  const hotelConfig = settings?.hotel as { rooms?: RoomInfo[] } | null

  return (hotelConfig?.rooms || []).sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }))
}

export async function getRoom(storeId: string, roomId: string): Promise<RoomInfo | null> {
  const rooms = await getRooms(storeId)
  return rooms.find((r) => r.id === roomId) || null
}

export async function createRoom(storeId: string, room: Omit<RoomInfo, 'id' | 'status'>): Promise<RoomInfo> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { settings: true },
  })

  const settings = (store?.settings as Record<string, unknown>) || {}
  const hotelConfig = (settings.hotel as { rooms?: RoomInfo[] }) || {}
  const rooms = hotelConfig.rooms || []

  const newRoom: RoomInfo = {
    ...room,
    id: `room_${Date.now()}`,
    status: 'AVAILABLE',
  }

  rooms.push(newRoom)

  await prisma.store.update({
    where: { id: storeId },
    data: {
      settings: JSON.parse(JSON.stringify({
        ...settings,
        hotel: { ...hotelConfig, rooms },
      })),
    },
  })

  return newRoom
}

export async function updateRoom(storeId: string, roomId: string, updates: Partial<RoomInfo>): Promise<RoomInfo | null> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { settings: true },
  })

  const settings = (store?.settings as Record<string, unknown>) || {}
  const hotelConfig = (settings.hotel as { rooms?: RoomInfo[] }) || {}
  const rooms = hotelConfig.rooms || []

  const roomIndex = rooms.findIndex((r) => r.id === roomId)
  if (roomIndex === -1) return null

  rooms[roomIndex] = { ...rooms[roomIndex], ...updates }

  await prisma.store.update({
    where: { id: storeId },
    data: {
      settings: JSON.parse(JSON.stringify({
        ...settings,
        hotel: { ...hotelConfig, rooms },
      })),
    },
  })

  return rooms[roomIndex]
}

export async function deleteRoom(storeId: string, roomId: string): Promise<boolean> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { settings: true },
  })

  const settings = (store?.settings as Record<string, unknown>) || {}
  const hotelConfig = (settings.hotel as { rooms?: RoomInfo[] }) || {}
  const rooms = hotelConfig.rooms || []

  const filteredRooms = rooms.filter((r) => r.id !== roomId)
  if (filteredRooms.length === rooms.length) return false

  await prisma.store.update({
    where: { id: storeId },
    data: {
      settings: JSON.parse(JSON.stringify({
        ...settings,
        hotel: { ...hotelConfig, rooms: filteredRooms },
      })),
    },
  })

  return true
}

// Availability Management
export async function getRoomAvailability(
  storeId: string,
  roomId: string,
  startDate: Date,
  endDate: Date
): Promise<RoomAvailability[]> {
  const room = await getRoom(storeId, roomId)
  if (!room) return []

  // Get existing bookings for this room
  const bookings = await prisma.booking.findMany({
    where: {
      storeId,
      productId: roomId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        notIn: ['CANCELLED'],
      },
    },
  })

  const bookedDates = new Set(
    bookings.map((b) => b.date.toISOString().split('T')[0])
  )

  // Get rate rules
  const rateRules = await getRateRules(storeId)

  // Generate availability for each day
  const availability: RoomAvailability[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const isBooked = bookedDates.has(dateStr)
    const price = calculateDayPrice(room.basePrice, currentDate, rateRules)

    availability.push({
      roomId,
      date: dateStr,
      available: !isBooked && room.status === 'AVAILABLE',
      price,
      reason: isBooked ? 'Réservé' : room.status !== 'AVAILABLE' ? room.status : undefined,
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return availability
}

export async function checkAvailability(
  storeId: string,
  roomId: string,
  checkIn: Date,
  checkOut: Date
): Promise<{ available: boolean; totalPrice: number; nights: number; blockedDates?: string[] }> {
  const room = await getRoom(storeId, roomId)
  if (!room) {
    return { available: false, totalPrice: 0, nights: 0, blockedDates: [] }
  }

  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  const availability = await getRoomAvailability(storeId, roomId, checkIn, checkOut)

  const blockedDates = availability
    .filter((a) => !a.available)
    .map((a) => a.date)

  const totalPrice = availability
    .filter((a) => a.available)
    .reduce((sum, a) => sum + a.price, 0)

  return {
    available: blockedDates.length === 0,
    totalPrice,
    nights,
    blockedDates: blockedDates.length > 0 ? blockedDates : undefined,
  }
}

// Rate Rules Management
export async function getRateRules(storeId: string): Promise<RateRule[]> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { settings: true },
  })

  const settings = store?.settings as Record<string, unknown> | null
  const hotelConfig = settings?.hotel as { rateRules?: RateRule[] } | null

  return (hotelConfig?.rateRules || []).sort((a, b) => b.priority - a.priority)
}

export async function createRateRule(storeId: string, rule: Omit<RateRule, 'id'>): Promise<RateRule> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { settings: true },
  })

  const settings = (store?.settings as Record<string, unknown>) || {}
  const hotelConfig = (settings.hotel as { rateRules?: RateRule[] }) || {}
  const rateRules = hotelConfig.rateRules || []

  const newRule: RateRule = {
    ...rule,
    id: `rule_${Date.now()}`,
  }

  rateRules.push(newRule)

  await prisma.store.update({
    where: { id: storeId },
    data: {
      settings: JSON.parse(JSON.stringify({
        ...settings,
        hotel: { ...hotelConfig, rateRules },
      })),
    },
  })

  return newRule
}

export async function deleteRateRule(storeId: string, ruleId: string): Promise<boolean> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { settings: true },
  })

  const settings = (store?.settings as Record<string, unknown>) || {}
  const hotelConfig = (settings.hotel as { rateRules?: RateRule[] }) || {}
  const rateRules = hotelConfig.rateRules || []

  const filteredRules = rateRules.filter((r) => r.id !== ruleId)
  if (filteredRules.length === rateRules.length) return false

  await prisma.store.update({
    where: { id: storeId },
    data: {
      settings: JSON.parse(JSON.stringify({
        ...settings,
        hotel: { ...hotelConfig, rateRules: filteredRules },
      })),
    },
  })

  return true
}

// Price Calculation
export function calculateDayPrice(basePrice: number, date: Date, rules: RateRule[]): number {
  let price = basePrice
  const dayOfWeek = date.getDay()
  const dateStr = date.toISOString().split('T')[0]

  for (const rule of rules) {
    let applies = false

    switch (rule.type) {
      case 'WEEKEND':
        applies = dayOfWeek === 0 || dayOfWeek === 6
        break
      case 'WEEKDAY':
        applies = dayOfWeek >= 1 && dayOfWeek <= 5
        break
      case 'SEASONAL':
        if (rule.startDate && rule.endDate) {
          applies = dateStr >= rule.startDate && dateStr <= rule.endDate
        }
        break
      case 'EVENT':
        if (rule.startDate && rule.endDate) {
          applies = dateStr >= rule.startDate && dateStr <= rule.endDate
        }
        break
      default:
        if (rule.daysOfWeek) {
          applies = rule.daysOfWeek.includes(dayOfWeek)
        }
    }

    if (applies) {
      price = price * rule.modifier
    }
  }

  return Math.round(price * 100) / 100
}

export function calculateStayPrice(
  basePrice: number,
  checkIn: Date,
  checkOut: Date,
  rules: RateRule[]
): { total: number; nights: number; breakdown: { date: string; price: number }[] } {
  const breakdown: { date: string; price: number }[] = []
  let total = 0
  const currentDate = new Date(checkIn)

  while (currentDate < checkOut) {
    const price = calculateDayPrice(basePrice, currentDate, rules)
    breakdown.push({
      date: currentDate.toISOString().split('T')[0],
      price,
    })
    total += price
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return {
    total: Math.round(total * 100) / 100,
    nights: breakdown.length,
    breakdown,
  }
}

// Hotel Statistics
export async function getHotelStats(
  storeId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  occupancyRate: number
  revenue: number
  averageDailyRate: number
  totalBookings: number
  roomsAvailable: number
  roomsOccupied: number
  upcomingCheckIns: number
  upcomingCheckOuts: number
}> {
  const rooms = await getRooms(storeId)
  const totalRooms = rooms.length

  // Get bookings in date range
  const bookings = await prisma.booking.findMany({
    where: {
      storeId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        in: ['CONFIRMED', 'PENDING'],
      },
    },
  })

  const totalNights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const totalRoomNights = totalRooms * totalNights
  const occupiedNights = bookings.length

  // Calculate revenue from orders (bookings are linked through productId)
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
    select: { total: true },
  })

  const revenue = orders.reduce((sum, o) => sum + o.total, 0)

  // Today's check-ins and check-outs
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const todayBookings = await prisma.booking.findMany({
    where: {
      storeId,
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
  })

  // Current occupancy
  const currentlyOccupied = rooms.filter((r) => r.status === 'OCCUPIED').length

  return {
    occupancyRate: totalRoomNights > 0 ? (occupiedNights / totalRoomNights) * 100 : 0,
    revenue,
    averageDailyRate: occupiedNights > 0 ? revenue / occupiedNights : 0,
    totalBookings: bookings.length,
    roomsAvailable: totalRooms - currentlyOccupied,
    roomsOccupied: currentlyOccupied,
    upcomingCheckIns: todayBookings.filter((b) => b.status === 'CONFIRMED').length,
    upcomingCheckOuts: todayBookings.filter((b) => b.status === 'PENDING').length,
  }
}

// Room type labels
export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  STANDARD: 'Standard',
  SUPERIOR: 'Supérieure',
  SUITE: 'Suite',
  FAMILY: 'Familiale',
  DELUXE: 'Deluxe',
  PENTHOUSE: 'Penthouse',
}

// Format functions
export function formatStayDates(checkIn: Date, checkOut: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }

  const checkInStr = checkIn.toLocaleDateString('fr-FR', options)
  const checkOutStr = checkOut.toLocaleDateString('fr-FR', options)

  return `${checkInStr} → ${checkOutStr}`
}

export function formatGuestCount(adults: number, children: number): string {
  const parts: string[] = []
  if (adults > 0) {
    parts.push(`${adults} adulte${adults > 1 ? 's' : ''}`)
  }
  if (children > 0) {
    parts.push(`${children} enfant${children > 1 ? 's' : ''}`)
  }
  return parts.join(', ')
}
