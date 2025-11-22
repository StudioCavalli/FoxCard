/**
 * Booking & Reservation Manager
 * Handles availability, booking creation, and cancellation logic
 */

import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { BookingStatus, CancellationPolicy } from '@prisma/client'

/**
 * Generate a unique booking number
 */
export function generateBookingNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = randomBytes(3).toString('hex').toUpperCase()
  return `BK-${timestamp}-${random}`
}

/**
 * Generate a QR code confirmation code
 */
export function generateConfirmationCode(): string {
  return randomBytes(16).toString('hex').toUpperCase()
}

/**
 * Get available time slots for a date
 */
export async function getAvailableSlots(
  storeId: string,
  productId: string | null,
  date: Date
): Promise<{
  slots: Array<{
    startTime: string
    endTime: string
    available: number
    priceModifier: number | null
  }>
}> {
  const dayOfWeek = date.getDay()

  // Check if date is blocked
  const blockedDate = await prisma.blockedDate.findFirst({
    where: {
      storeId,
      ...(productId && { productId }),
      date: {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999)),
      },
    },
  })

  if (blockedDate) {
    return { slots: [] }
  }

  // Get time slots for this day
  const timeSlots = await prisma.timeSlot.findMany({
    where: {
      storeId,
      isActive: true,
      AND: [
        // Product filter
        {
          OR: [
            { productId: productId },
            { productId: null }, // Store-wide slots
          ],
        },
        // Day of week filter
        {
          OR: [
            { dayOfWeek },
            { dayOfWeek: null }, // Applies to all days
          ],
        },
        // Validity date filter
        {
          OR: [
            {
              AND: [
                { validFrom: { lte: date } },
                { validUntil: { gte: date } },
              ],
            },
            {
              AND: [
                { validFrom: null },
                { validUntil: null },
              ],
            },
          ],
        },
      ],
    },
    orderBy: { startTime: 'asc' },
  })

  // Get existing bookings for this date
  const existingBookings = await prisma.booking.findMany({
    where: {
      storeId,
      ...(productId && { productId }),
      date: {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999)),
      },
      status: {
        notIn: [BookingStatus.CANCELLED],
      },
    },
  })

  // Calculate availability for each slot
  const slots = timeSlots.map((slot) => {
    const bookedCount = existingBookings.filter((booking) => {
      if (!booking.startTime) return false
      const bookingTime = new Date(booking.startTime).toTimeString().slice(0, 5)
      return bookingTime === slot.startTime
    }).length

    const maxCapacity = slot.overbookingAllowed
      ? slot.capacity + (slot.overbookingLimit || 0)
      : slot.capacity

    return {
      startTime: slot.startTime,
      endTime: slot.endTime,
      available: Math.max(0, maxCapacity - bookedCount),
      priceModifier: slot.priceModifier,
    }
  })

  return { slots: slots.filter((s) => s.available > 0) }
}

/**
 * Check if a specific slot is available
 */
export async function isSlotAvailable(
  storeId: string,
  productId: string,
  date: Date,
  startTime: string,
  guestCount: number
): Promise<{ available: boolean; reason?: string }> {
  // Check blocked dates
  const blockedDate = await prisma.blockedDate.findFirst({
    where: {
      storeId,
      OR: [{ productId }, { productId: null }],
      date: {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999)),
      },
    },
  })

  if (blockedDate) {
    return { available: false, reason: 'Cette date n\'est pas disponible' }
  }

  // Check time slot configuration
  const dayOfWeek = date.getDay()
  const timeSlot = await prisma.timeSlot.findFirst({
    where: {
      storeId,
      isActive: true,
      startTime,
      AND: [
        { OR: [{ productId }, { productId: null }] },
        { OR: [{ dayOfWeek }, { dayOfWeek: null }] },
      ],
    },
  })

  if (!timeSlot) {
    return { available: false, reason: 'Ce créneau n\'existe pas' }
  }

  // Count existing bookings
  const existingBookings = await prisma.booking.count({
    where: {
      storeId,
      productId,
      date: {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999)),
      },
      startTime: {
        gte: new Date(`${date.toISOString().split('T')[0]}T${startTime}:00`),
        lt: new Date(`${date.toISOString().split('T')[0]}T${startTime}:00`),
      },
      status: { notIn: [BookingStatus.CANCELLED] },
    },
  })

  const maxCapacity = timeSlot.overbookingAllowed
    ? timeSlot.capacity + (timeSlot.overbookingLimit || 0)
    : timeSlot.capacity

  if (existingBookings + guestCount > maxCapacity) {
    return { available: false, reason: 'Ce créneau est complet' }
  }

  return { available: true }
}

/**
 * Calculate refund amount based on cancellation policy
 */
export function calculateRefundAmount(
  totalPrice: number,
  policy: CancellationPolicy,
  bookingDate: Date
): { refundAmount: number; refundPercentage: number } {
  const now = new Date()
  const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60)

  switch (policy) {
    case CancellationPolicy.FREE_24H:
      if (hoursUntilBooking >= 24) {
        return { refundAmount: totalPrice, refundPercentage: 100 }
      }
      return { refundAmount: 0, refundPercentage: 0 }

    case CancellationPolicy.FREE_48H:
      if (hoursUntilBooking >= 48) {
        return { refundAmount: totalPrice, refundPercentage: 100 }
      }
      return { refundAmount: 0, refundPercentage: 0 }

    case CancellationPolicy.FREE_72H:
      if (hoursUntilBooking >= 72) {
        return { refundAmount: totalPrice, refundPercentage: 100 }
      }
      return { refundAmount: 0, refundPercentage: 0 }

    case CancellationPolicy.PARTIAL_50:
      return { refundAmount: totalPrice * 0.5, refundPercentage: 50 }

    case CancellationPolicy.PARTIAL_75:
      return { refundAmount: totalPrice * 0.75, refundPercentage: 75 }

    case CancellationPolicy.NON_REFUNDABLE:
    default:
      return { refundAmount: 0, refundPercentage: 0 }
  }
}

/**
 * Get cancellation policy description
 */
export function getCancellationPolicyDescription(policy: CancellationPolicy): string {
  const descriptions: Record<CancellationPolicy, string> = {
    FREE_24H: 'Annulation gratuite jusqu\'à 24h avant',
    FREE_48H: 'Annulation gratuite jusqu\'à 48h avant',
    FREE_72H: 'Annulation gratuite jusqu\'à 72h avant',
    NON_REFUNDABLE: 'Non remboursable',
    PARTIAL_50: 'Remboursement de 50% en cas d\'annulation',
    PARTIAL_75: 'Remboursement de 75% en cas d\'annulation',
  }
  return descriptions[policy]
}

/**
 * Get days with availability for a month
 */
export async function getMonthAvailability(
  storeId: string,
  productId: string | null,
  year: number,
  month: number
): Promise<{
  availableDates: string[]
  blockedDates: string[]
}> {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0)

  // Get blocked dates
  const blocked = await prisma.blockedDate.findMany({
    where: {
      storeId,
      OR: [{ productId }, { productId: null }],
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  })

  const blockedSet = new Set(blocked.map((b) => b.date.toISOString().split('T')[0]))

  // Get time slots to know which days have slots
  const timeSlots = await prisma.timeSlot.findMany({
    where: {
      storeId,
      isActive: true,
      OR: [{ productId }, { productId: null }],
    },
  })

  // Days of week that have slots
  const daysWithSlots = new Set(
    timeSlots.map((s) => s.dayOfWeek).filter((d) => d !== null)
  )
  const hasAllDays = timeSlots.some((s) => s.dayOfWeek === null)

  // Generate available dates
  const availableDates: string[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const dayOfWeek = currentDate.getDay()

    if (
      !blockedSet.has(dateStr) &&
      currentDate >= new Date() && // Not in the past
      (hasAllDays || daysWithSlots.has(dayOfWeek))
    ) {
      availableDates.push(dateStr)
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return {
    availableDates,
    blockedDates: Array.from(blockedSet),
  }
}

/**
 * Format booking for display
 */
export function formatBookingDate(date: Date, startTime?: Date | null): string {
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }

  let formatted = date.toLocaleDateString('fr-FR', dateOptions)

  if (startTime) {
    formatted += ` à ${startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
  }

  return formatted
}
