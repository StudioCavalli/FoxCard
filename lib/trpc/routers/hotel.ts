/**
 * Hotel tRPC Router
 * Handles hotel-specific operations: rooms, availability, bookings, rates
 */

import { z } from 'zod'
import { router, publicProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomAvailability,
  checkAvailability,
  getRateRules,
  createRateRule,
  deleteRateRule,
  getHotelStats,
  calculateStayPrice,
  HOTEL_AMENITIES,
  ROOM_TYPE_LABELS,
} from '@/lib/hotel/hotel-manager'

const RoomTypeEnum = z.enum(['STANDARD', 'SUPERIOR', 'SUITE', 'FAMILY', 'DELUXE', 'PENTHOUSE'])
const RoomStatusEnum = z.enum(['AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE', 'BLOCKED'])
const RateRuleTypeEnum = z.enum(['WEEKEND', 'WEEKDAY', 'SEASONAL', 'EVENT', 'LAST_MINUTE', 'EARLY_BIRD'])

export const hotelRouter = router({
  // ============ PUBLIC PROCEDURES ============

  /**
   * Get all rooms
   */
  getRooms: publicProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input }) => {
      return getRooms(input.storeId)
    }),

  /**
   * Get room details
   */
  getRoom: publicProcedure
    .input(z.object({
      storeId: z.string(),
      roomId: z.string(),
    }))
    .query(async ({ input }) => {
      const room = await getRoom(input.storeId, input.roomId)
      if (!room) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Room not found' })
      }
      return room
    }),

  /**
   * Get room availability for date range
   */
  getAvailability: publicProcedure
    .input(z.object({
      storeId: z.string(),
      roomId: z.string(),
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ input }) => {
      return getRoomAvailability(
        input.storeId,
        input.roomId,
        new Date(input.startDate),
        new Date(input.endDate)
      )
    }),

  /**
   * Check availability for a stay
   */
  checkAvailability: publicProcedure
    .input(z.object({
      storeId: z.string(),
      roomId: z.string(),
      checkIn: z.string(),
      checkOut: z.string(),
    }))
    .query(async ({ input }) => {
      return checkAvailability(
        input.storeId,
        input.roomId,
        new Date(input.checkIn),
        new Date(input.checkOut)
      )
    }),

  /**
   * Calculate stay price
   */
  calculatePrice: publicProcedure
    .input(z.object({
      storeId: z.string(),
      roomId: z.string(),
      checkIn: z.string(),
      checkOut: z.string(),
    }))
    .query(async ({ input }) => {
      const room = await getRoom(input.storeId, input.roomId)
      if (!room) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Room not found' })
      }

      const rules = await getRateRules(input.storeId)
      return calculateStayPrice(
        room.basePrice,
        new Date(input.checkIn),
        new Date(input.checkOut),
        rules
      )
    }),

  /**
   * Get amenities list
   */
  getAmenities: publicProcedure.query(() => {
    return HOTEL_AMENITIES
  }),

  /**
   * Get room type labels
   */
  getRoomTypes: publicProcedure.query(() => {
    return Object.entries(ROOM_TYPE_LABELS).map(([value, label]) => ({
      value,
      label,
    }))
  }),

  // ============ ADMIN PROCEDURES ============

  /**
   * Create a new room
   */
  createRoom: adminProcedure
    .input(z.object({
      storeId: z.string(),
      number: z.string(),
      type: RoomTypeEnum,
      floor: z.number(),
      capacity: z.number().min(1).max(20),
      beds: z.array(z.object({
        type: z.string(),
        count: z.number(),
      })),
      amenities: z.array(z.string()),
      size: z.number().optional(),
      view: z.string().optional(),
      basePrice: z.number().min(0),
      images: z.array(z.string()).default([]),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      return createRoom(input.storeId, input)
    }),

  /**
   * Update room
   */
  updateRoom: adminProcedure
    .input(z.object({
      storeId: z.string(),
      roomId: z.string(),
      updates: z.object({
        number: z.string().optional(),
        type: RoomTypeEnum.optional(),
        floor: z.number().optional(),
        capacity: z.number().min(1).max(20).optional(),
        beds: z.array(z.object({
          type: z.string(),
          count: z.number(),
        })).optional(),
        amenities: z.array(z.string()).optional(),
        size: z.number().optional(),
        view: z.string().optional(),
        basePrice: z.number().min(0).optional(),
        status: RoomStatusEnum.optional(),
        images: z.array(z.string()).optional(),
        description: z.string().optional(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      const room = await updateRoom(input.storeId, input.roomId, input.updates)
      if (!room) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Room not found' })
      }

      return room
    }),

  /**
   * Delete room
   */
  deleteRoom: adminProcedure
    .input(z.object({
      storeId: z.string(),
      roomId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      const success = await deleteRoom(input.storeId, input.roomId)
      if (!success) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Room not found' })
      }

      return { success: true }
    }),

  /**
   * Update room status
   */
  updateRoomStatus: adminProcedure
    .input(z.object({
      storeId: z.string(),
      roomId: z.string(),
      status: RoomStatusEnum,
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      const room = await updateRoom(input.storeId, input.roomId, { status: input.status })
      if (!room) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Room not found' })
      }

      return room
    }),

  /**
   * Get rate rules
   */
  getRateRules: adminProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      return getRateRules(input.storeId)
    }),

  /**
   * Create rate rule
   */
  createRateRule: adminProcedure
    .input(z.object({
      storeId: z.string(),
      name: z.string(),
      type: RateRuleTypeEnum,
      modifier: z.number().min(0.1).max(10),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
      minimumStay: z.number().min(1).optional(),
      priority: z.number().default(0),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      const { storeId, ...ruleData } = input
      return createRateRule(storeId, ruleData)
    }),

  /**
   * Delete rate rule
   */
  deleteRateRule: adminProcedure
    .input(z.object({
      storeId: z.string(),
      ruleId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      const success = await deleteRateRule(input.storeId, input.ruleId)
      if (!success) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Rate rule not found' })
      }

      return { success: true }
    }),

  /**
   * Get hotel statistics
   */
  getStats: adminProcedure
    .input(z.object({
      storeId: z.string(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      const startDate = input.startDate ? new Date(input.startDate) : new Date()
      const endDate = input.endDate
        ? new Date(input.endDate)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

      return getHotelStats(input.storeId, startDate, endDate)
    }),

  /**
   * Block dates for a room
   */
  blockDates: adminProcedure
    .input(z.object({
      storeId: z.string(),
      roomId: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      // Create blocked date entries
      const start = new Date(input.startDate)
      const end = new Date(input.endDate)
      const dates: Date[] = []
      const current = new Date(start)

      while (current <= end) {
        dates.push(new Date(current))
        current.setDate(current.getDate() + 1)
      }

      // Create blocked dates using BlockedDate model
      // Note: We create them one by one to handle potential duplicates
      for (const date of dates) {
        try {
          await ctx.prisma.blockedDate.create({
            data: {
              storeId: input.storeId,
              productId: input.roomId,
              date,
              reason: input.reason || 'Bloqué',
            },
          })
        } catch {
          // Ignore duplicate errors
        }
      }

      return { success: true, datesBlocked: dates.length }
    }),

  /**
   * Unblock dates for a room
   */
  unblockDates: adminProcedure
    .input(z.object({
      storeId: z.string(),
      roomId: z.string(),
      startDate: z.string(),
      endDate: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      await ctx.prisma.blockedDate.deleteMany({
        where: {
          storeId: input.storeId,
          productId: input.roomId,
          date: {
            gte: new Date(input.startDate),
            lte: new Date(input.endDate),
          },
        },
      })

      return { success: true }
    }),
})
