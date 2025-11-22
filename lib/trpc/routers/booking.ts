import { z } from 'zod'
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../trpc'
import { BookingStatus, CancellationPolicy } from '@prisma/client'
import {
  generateBookingNumber,
  generateConfirmationCode,
  getAvailableSlots,
  isSlotAvailable,
  calculateRefundAmount,
  getMonthAvailability,
} from '@/lib/booking/booking-manager'

export const bookingRouter = router({
  // ============================================
  // AVAILABILITY (Public)
  // ============================================

  /**
   * Get available time slots for a specific date
   */
  getAvailableSlots: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
        productId: z.string().optional(),
        date: z.string(), // ISO date string
      })
    )
    .query(async ({ input }) => {
      const date = new Date(input.date)
      return getAvailableSlots(input.storeId, input.productId || null, date)
    }),

  /**
   * Get month availability (which dates have slots)
   */
  getMonthAvailability: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
        productId: z.string().optional(),
        year: z.number(),
        month: z.number().min(1).max(12),
      })
    )
    .query(async ({ input }) => {
      return getMonthAvailability(
        input.storeId,
        input.productId || null,
        input.year,
        input.month
      )
    }),

  /**
   * Check slot availability
   */
  checkAvailability: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
        productId: z.string(),
        date: z.string(),
        startTime: z.string(),
        guestCount: z.number().min(1),
      })
    )
    .query(async ({ input }) => {
      const date = new Date(input.date)
      return isSlotAvailable(
        input.storeId,
        input.productId,
        date,
        input.startTime,
        input.guestCount
      )
    }),

  // ============================================
  // BOOKING CREATION (Public)
  // ============================================

  /**
   * Create a new booking
   */
  create: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
        productId: z.string(),
        date: z.string(),
        startTime: z.string().optional(),
        customerEmail: z.string().email(),
        customerName: z.string().min(1),
        customerPhone: z.string().optional(),
        guestCount: z.number().min(1).default(1),
        guestNames: z.array(z.string()).optional(),
        options: z.record(z.string(), z.any()).optional(),
        specialRequests: z.string().optional(),
        basePrice: z.number(),
        totalPrice: z.number(),
        cancellationPolicy: z.nativeEnum(CancellationPolicy).default(CancellationPolicy.FREE_24H),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const date = new Date(input.date)

      // Check availability if time-based
      if (input.startTime) {
        const availability = await isSlotAvailable(
          input.storeId,
          input.productId,
          date,
          input.startTime,
          input.guestCount
        )

        if (!availability.available) {
          throw new Error(availability.reason || 'Créneau non disponible')
        }
      }

      // Generate booking number and confirmation code
      const bookingNumber = generateBookingNumber()
      const confirmationCode = generateConfirmationCode()

      // Create start time datetime
      let startTime: Date | undefined
      let endTime: Date | undefined

      if (input.startTime) {
        const [hours, minutes] = input.startTime.split(':').map(Number)
        startTime = new Date(date)
        startTime.setHours(hours, minutes, 0, 0)

        // Default 1 hour duration
        endTime = new Date(startTime)
        endTime.setHours(endTime.getHours() + 1)
      }

      const booking = await ctx.prisma.booking.create({
        data: {
          storeId: input.storeId,
          productId: input.productId,
          bookingNumber,
          customerEmail: input.customerEmail,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          date,
          startTime,
          endTime,
          guestCount: input.guestCount,
          guestNames: input.guestNames || [],
          basePrice: input.basePrice,
          totalPrice: input.totalPrice,
          options: input.options || {},
          specialRequests: input.specialRequests,
          cancellationPolicy: input.cancellationPolicy,
          confirmationCode,
          status: BookingStatus.PENDING,
        },
      })

      return {
        booking,
        bookingNumber,
        confirmationCode,
      }
    }),

  /**
   * Get booking by number (for customers to view their booking)
   */
  getByNumber: publicProcedure
    .input(z.object({ bookingNumber: z.string() }))
    .query(async ({ ctx, input }) => {
      const booking = await ctx.prisma.booking.findUnique({
        where: { bookingNumber: input.bookingNumber },
      })

      if (!booking) {
        return null
      }

      return {
        ...booking,
        refundInfo: calculateRefundAmount(
          booking.totalPrice,
          booking.cancellationPolicy,
          booking.date
        ),
      }
    }),

  /**
   * Cancel a booking (by customer)
   */
  cancel: publicProcedure
    .input(
      z.object({
        bookingNumber: z.string(),
        email: z.string().email(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.prisma.booking.findUnique({
        where: { bookingNumber: input.bookingNumber },
      })

      if (!booking) {
        throw new Error('Réservation non trouvée')
      }

      if (booking.customerEmail.toLowerCase() !== input.email.toLowerCase()) {
        throw new Error('Email non autorisé')
      }

      if (booking.status === BookingStatus.CANCELLED) {
        throw new Error('Cette réservation est déjà annulée')
      }

      if (booking.status === BookingStatus.COMPLETED) {
        throw new Error('Impossible d\'annuler une réservation terminée')
      }

      // Calculate refund
      const { refundAmount, refundPercentage } = calculateRefundAmount(
        booking.totalPrice,
        booking.cancellationPolicy,
        booking.date
      )

      const updatedBooking = await ctx.prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.CANCELLED,
          cancelledAt: new Date(),
          cancellationReason: input.reason,
          refundAmount,
        },
      })

      return {
        booking: updatedBooking,
        refundAmount,
        refundPercentage,
      }
    }),

  // ============================================
  // ADMIN MANAGEMENT
  // ============================================

  /**
   * Get all bookings for a store
   */
  getAll: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        status: z.nativeEnum(BookingStatus).optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const bookings = await ctx.prisma.booking.findMany({
        take: input.limit + 1,
        where: {
          storeId: input.storeId,
          ...(input.status && { status: input.status }),
          ...(input.dateFrom && {
            date: {
              gte: new Date(input.dateFrom),
              ...(input.dateTo && { lte: new Date(input.dateTo) }),
            },
          }),
          ...(input.search && {
            OR: [
              { bookingNumber: { contains: input.search, mode: 'insensitive' } },
              { customerName: { contains: input.search, mode: 'insensitive' } },
              { customerEmail: { contains: input.search, mode: 'insensitive' } },
            ],
          }),
        },
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { date: 'asc' },
      })

      let nextCursor: string | undefined
      if (bookings.length > input.limit) {
        const nextItem = bookings.pop()
        nextCursor = nextItem?.id
      }

      return {
        bookings,
        nextCursor,
      }
    }),

  /**
   * Update booking status
   */
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(BookingStatus),
        internalNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const data: Record<string, unknown> = {
        status: input.status,
        ...(input.internalNotes && { internalNotes: input.internalNotes }),
      }

      if (input.status === BookingStatus.CONFIRMED) {
        data.confirmedAt = new Date()
      }

      if (input.status === BookingStatus.CHECKED_IN) {
        data.checkedInAt = new Date()
      }

      const booking = await ctx.prisma.booking.update({
        where: { id: input.id },
        data,
      })

      return booking
    }),

  /**
   * Check-in a booking
   */
  checkIn: adminProcedure
    .input(
      z.object({
        id: z.string(),
        checkedInBy: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.prisma.booking.update({
        where: { id: input.id },
        data: {
          status: BookingStatus.CHECKED_IN,
          checkedInAt: new Date(),
          checkedInBy: input.checkedInBy,
        },
      })

      return booking
    }),

  /**
   * Check-in by QR code
   */
  checkInByCode: adminProcedure
    .input(
      z.object({
        confirmationCode: z.string(),
        checkedInBy: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.prisma.booking.findFirst({
        where: { confirmationCode: input.confirmationCode },
      })

      if (!booking) {
        throw new Error('Code de confirmation invalide')
      }

      if (booking.status === BookingStatus.CHECKED_IN) {
        throw new Error('Cette réservation a déjà été enregistrée')
      }

      if (booking.status === BookingStatus.CANCELLED) {
        throw new Error('Cette réservation a été annulée')
      }

      const updatedBooking = await ctx.prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.CHECKED_IN,
          checkedInAt: new Date(),
          checkedInBy: input.checkedInBy,
        },
      })

      return updatedBooking
    }),

  // ============================================
  // TIME SLOTS MANAGEMENT
  // ============================================

  /**
   * Get all time slots for a store
   */
  getTimeSlots: adminProcedure
    .input(z.object({ storeId: z.string(), productId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const slots = await ctx.prisma.timeSlot.findMany({
        where: {
          storeId: input.storeId,
          ...(input.productId && { productId: input.productId }),
        },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      })

      return slots
    }),

  /**
   * Create a time slot
   */
  createTimeSlot: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        productId: z.string().optional(),
        dayOfWeek: z.number().min(0).max(6).optional(),
        specificDate: z.string().optional(),
        startTime: z.string(),
        endTime: z.string(),
        duration: z.number().min(15),
        capacity: z.number().min(1),
        overbookingAllowed: z.boolean().default(false),
        overbookingLimit: z.number().optional(),
        priceModifier: z.number().optional(),
        validFrom: z.string().optional(),
        validUntil: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const slot = await ctx.prisma.timeSlot.create({
        data: {
          storeId: input.storeId,
          productId: input.productId,
          dayOfWeek: input.dayOfWeek,
          specificDate: input.specificDate ? new Date(input.specificDate) : undefined,
          startTime: input.startTime,
          endTime: input.endTime,
          duration: input.duration,
          capacity: input.capacity,
          overbookingAllowed: input.overbookingAllowed,
          overbookingLimit: input.overbookingLimit,
          priceModifier: input.priceModifier,
          validFrom: input.validFrom ? new Date(input.validFrom) : undefined,
          validUntil: input.validUntil ? new Date(input.validUntil) : undefined,
        },
      })

      return slot
    }),

  /**
   * Update a time slot
   */
  updateTimeSlot: adminProcedure
    .input(
      z.object({
        id: z.string(),
        dayOfWeek: z.number().min(0).max(6).optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        duration: z.number().min(15).optional(),
        capacity: z.number().min(1).optional(),
        overbookingAllowed: z.boolean().optional(),
        overbookingLimit: z.number().nullable().optional(),
        priceModifier: z.number().nullable().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      const slot = await ctx.prisma.timeSlot.update({
        where: { id },
        data,
      })

      return slot
    }),

  /**
   * Delete a time slot
   */
  deleteTimeSlot: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.timeSlot.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // ============================================
  // BLOCKED DATES MANAGEMENT
  // ============================================

  /**
   * Get blocked dates
   */
  getBlockedDates: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        productId: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const dates = await ctx.prisma.blockedDate.findMany({
        where: {
          storeId: input.storeId,
          ...(input.productId && { productId: input.productId }),
          ...(input.from && {
            date: {
              gte: new Date(input.from),
              ...(input.to && { lte: new Date(input.to) }),
            },
          }),
        },
        orderBy: { date: 'asc' },
      })

      return dates
    }),

  /**
   * Block a date
   */
  blockDate: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        productId: z.string().optional(),
        date: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const blockedDate = await ctx.prisma.blockedDate.create({
        data: {
          storeId: input.storeId,
          productId: input.productId,
          date: new Date(input.date),
          reason: input.reason,
        },
      })

      return blockedDate
    }),

  /**
   * Unblock a date
   */
  unblockDate: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.blockedDate.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // ============================================
  // STATISTICS
  // ============================================

  /**
   * Get booking statistics
   */
  getStats: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        dateFrom: z.string(),
        dateTo: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const dateFrom = new Date(input.dateFrom)
      const dateTo = new Date(input.dateTo)

      const bookings = await ctx.prisma.booking.findMany({
        where: {
          storeId: input.storeId,
          createdAt: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
      })

      const stats = {
        total: bookings.length,
        pending: bookings.filter((b) => b.status === BookingStatus.PENDING).length,
        confirmed: bookings.filter((b) => b.status === BookingStatus.CONFIRMED).length,
        checkedIn: bookings.filter((b) => b.status === BookingStatus.CHECKED_IN).length,
        completed: bookings.filter((b) => b.status === BookingStatus.COMPLETED).length,
        cancelled: bookings.filter((b) => b.status === BookingStatus.CANCELLED).length,
        noShow: bookings.filter((b) => b.status === BookingStatus.NO_SHOW).length,
        totalRevenue: bookings
          .filter((b) => b.status !== BookingStatus.CANCELLED)
          .reduce((sum, b) => sum + b.totalPrice, 0),
        averageGuestCount:
          bookings.length > 0
            ? bookings.reduce((sum, b) => sum + b.guestCount, 0) / bookings.length
            : 0,
      }

      return stats
    }),
})
