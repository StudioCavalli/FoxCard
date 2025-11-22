/**
 * Recreation tRPC Router
 * Handles activity/event-specific operations: schedules, sessions, attendees
 */

import { z } from 'zod'
import { router, publicProcedure, requireStoreAccess, requirePermission } from '../trpc'
import { TRPCError } from '@trpc/server'

const ScheduleTypeEnum = z.enum(['ONE_TIME', 'WEEKLY', 'DAILY', 'CUSTOM'])
const SessionStatusEnum = z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED'])
const AttendeeStatusEnum = z.enum(['REGISTERED', 'WAITLIST', 'CHECKED_IN', 'NO_SHOW', 'CANCELLED'])

// Input schemas
const createScheduleInput = z.object({
  storeId: z.string(),
  productId: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  scheduleType: ScheduleTypeEnum.default('WEEKLY'),
  dayOfWeek: z.number().min(0).max(6).optional(),
  specificDate: z.string().optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  duration: z.number().min(1),
  capacity: z.number().min(1).default(10),
  minParticipants: z.number().min(0).default(1),
  pricePerPerson: z.number().optional(),
  pricePerGroup: z.number().optional(),
  location: z.string().optional(),
  locationAddress: z.string().optional(),
  instructorName: z.string().optional(),
  instructorId: z.string().optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
})

const createSessionInput = z.object({
  storeId: z.string(),
  scheduleId: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  capacity: z.number().min(1),
  instructorName: z.string().optional(),
  notes: z.string().optional(),
})

const registerAttendeeInput = z.object({
  storeId: z.string(),
  sessionId: z.string(),
  bookingId: z.string().optional(),
  customerId: z.string().optional(),
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

export const recreationRouter = router({
  // ============ PUBLIC PROCEDURES ============

  /**
   * Get all schedules for a store
   */
  getSchedules: publicProcedure
    .input(z.object({
      storeId: z.string(),
      productId: z.string().optional(),
      dayOfWeek: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .query(async ({ input, ctx }) => {
      return ctx.prisma.activitySchedule.findMany({
        where: {
          storeId: input.storeId,
          productId: input.productId,
          dayOfWeek: input.dayOfWeek,
          isActive: input.isActive ?? true,
        },
        include: {
          sessions: {
            where: {
              date: { gte: new Date() },
              status: { not: 'CANCELLED' },
            },
            take: 5,
            orderBy: { date: 'asc' },
          },
        },
        orderBy: [
          { dayOfWeek: 'asc' },
          { startTime: 'asc' },
        ],
      })
    }),

  /**
   * Get upcoming sessions
   */
  getUpcomingSessions: publicProcedure
    .input(z.object({
      storeId: z.string(),
      scheduleId: z.string().optional(),
      from: z.string().optional(),
      to: z.string().optional(),
      limit: z.number().default(20),
    }))
    .query(async ({ input, ctx }) => {
      const fromDate = input.from ? new Date(input.from) : new Date()
      const toDate = input.to ? new Date(input.to) : undefined

      return ctx.prisma.activitySession.findMany({
        where: {
          storeId: input.storeId,
          scheduleId: input.scheduleId,
          date: {
            gte: fromDate,
            ...(toDate && { lte: toDate }),
          },
          status: { notIn: ['CANCELLED'] },
        },
        include: {
          schedule: true,
          _count: {
            select: { attendees: true },
          },
        },
        orderBy: { date: 'asc' },
        take: input.limit,
      })
    }),

  /**
   * Get session details with availability
   */
  getSession: publicProcedure
    .input(z.object({
      sessionId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const session = await ctx.prisma.activitySession.findUnique({
        where: { id: input.sessionId },
        include: {
          schedule: true,
          attendees: {
            where: { status: { notIn: ['CANCELLED'] } },
          },
        },
      })

      if (!session) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' })
      }

      const availableSpots = session.capacity - session.bookedCount
      const hasWaitlist = session.waitlistCount > 0

      return {
        ...session,
        availableSpots,
        hasWaitlist,
        isFull: availableSpots <= 0,
      }
    }),

  // ============ ADMIN PROCEDURES ============

  /**
   * Create a new schedule
   */
  createSchedule: requireStoreAccess
    .input(createScheduleInput)
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.activitySchedule.create({
        data: {
          storeId: input.storeId,
          productId: input.productId,
          name: input.name,
          description: input.description,
          scheduleType: input.scheduleType,
          dayOfWeek: input.dayOfWeek,
          specificDate: input.specificDate ? new Date(input.specificDate) : undefined,
          startTime: input.startTime,
          endTime: input.endTime,
          duration: input.duration,
          capacity: input.capacity,
          minParticipants: input.minParticipants,
          pricePerPerson: input.pricePerPerson,
          pricePerGroup: input.pricePerGroup,
          location: input.location,
          locationAddress: input.locationAddress,
          instructorName: input.instructorName,
          instructorId: input.instructorId,
          validFrom: input.validFrom ? new Date(input.validFrom) : undefined,
          validUntil: input.validUntil ? new Date(input.validUntil) : undefined,
        },
      })
    }),

  /**
   * Update a schedule
   */
  updateSchedule: requireStoreAccess
    .input(z.object({
      storeId: z.string(),
      scheduleId: z.string(),
      data: createScheduleInput.partial().omit({ storeId: true }),
    }))
    .mutation(async ({ input, ctx }) => {
      const schedule = await ctx.prisma.activitySchedule.findFirst({
        where: { id: input.scheduleId, storeId: input.storeId },
      })

      if (!schedule) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Schedule not found' })
      }

      return ctx.prisma.activitySchedule.update({
        where: { id: input.scheduleId },
        data: {
          ...input.data,
          specificDate: input.data.specificDate ? new Date(input.data.specificDate) : undefined,
          validFrom: input.data.validFrom ? new Date(input.data.validFrom) : undefined,
          validUntil: input.data.validUntil ? new Date(input.data.validUntil) : undefined,
        },
      })
    }),

  /**
   * Delete a schedule
   */
  deleteSchedule: requireStoreAccess
    .input(z.object({
      storeId: z.string(),
      scheduleId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Check for future sessions with attendees
      const futureSessions = await ctx.prisma.activitySession.count({
        where: {
          scheduleId: input.scheduleId,
          date: { gte: new Date() },
          bookedCount: { gt: 0 },
        },
      })

      if (futureSessions > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot delete schedule with ${futureSessions} upcoming sessions that have attendees`,
        })
      }

      return ctx.prisma.activitySchedule.delete({
        where: { id: input.scheduleId },
      })
    }),

  /**
   * Create a session instance
   */
  createSession: requireStoreAccess
    .input(createSessionInput)
    .mutation(async ({ input, ctx }) => {
      const schedule = await ctx.prisma.activitySchedule.findFirst({
        where: { id: input.scheduleId, storeId: input.storeId },
      })

      if (!schedule) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Schedule not found' })
      }

      return ctx.prisma.activitySession.create({
        data: {
          storeId: input.storeId,
          scheduleId: input.scheduleId,
          date: new Date(input.date),
          startTime: new Date(input.startTime),
          endTime: new Date(input.endTime),
          capacity: input.capacity,
          instructorName: input.instructorName,
          notes: input.notes,
        },
      })
    }),

  /**
   * Update session status
   */
  updateSessionStatus: requireStoreAccess
    .input(z.object({
      storeId: z.string(),
      sessionId: z.string(),
      status: SessionStatusEnum,
      cancellationReason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const session = await ctx.prisma.activitySession.findFirst({
        where: { id: input.sessionId, storeId: input.storeId },
      })

      if (!session) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' })
      }

      return ctx.prisma.activitySession.update({
        where: { id: input.sessionId },
        data: {
          status: input.status,
          ...(input.status === 'CANCELLED' && {
            cancelledAt: new Date(),
            cancellationReason: input.cancellationReason,
          }),
        },
      })
    }),

  /**
   * Register an attendee
   */
  registerAttendee: requireStoreAccess
    .input(registerAttendeeInput)
    .mutation(async ({ input, ctx }) => {
      const session = await ctx.prisma.activitySession.findUnique({
        where: { id: input.sessionId },
        include: { _count: { select: { attendees: true } } },
      })

      if (!session) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' })
      }

      const availableSpots = session.capacity - session.bookedCount
      const isWaitlist = availableSpots <= 0

      // Get waitlist position if needed
      let waitlistPosition: number | undefined
      if (isWaitlist) {
        const maxPosition = await ctx.prisma.sessionAttendee.aggregate({
          where: { sessionId: input.sessionId, status: 'WAITLIST' },
          _max: { waitlistPosition: true },
        })
        waitlistPosition = (maxPosition._max.waitlistPosition || 0) + 1
      }

      // Create attendee
      const attendee = await ctx.prisma.sessionAttendee.create({
        data: {
          sessionId: input.sessionId,
          bookingId: input.bookingId,
          customerId: input.customerId,
          name: input.name,
          email: input.email,
          phone: input.phone,
          notes: input.notes,
          status: isWaitlist ? 'WAITLIST' : 'REGISTERED',
          waitlistPosition,
        },
      })

      // Update session counts
      await ctx.prisma.activitySession.update({
        where: { id: input.sessionId },
        data: isWaitlist
          ? { waitlistCount: { increment: 1 } }
          : { bookedCount: { increment: 1 } },
      })

      return { attendee, isWaitlist, waitlistPosition }
    }),

  /**
   * Check in an attendee
   */
  checkInAttendee: requireStoreAccess
    .input(z.object({
      storeId: z.string(),
      attendeeId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.sessionAttendee.update({
        where: { id: input.attendeeId },
        data: {
          status: 'CHECKED_IN',
          checkedInAt: new Date(),
          checkedInBy: ctx.session.user.id,
        },
      })
    }),

  /**
   * Cancel an attendee registration
   */
  cancelAttendee: requireStoreAccess
    .input(z.object({
      storeId: z.string(),
      attendeeId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const attendee = await ctx.prisma.sessionAttendee.findUnique({
        where: { id: input.attendeeId },
        include: { session: true },
      })

      if (!attendee) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Attendee not found' })
      }

      // Update attendee status
      await ctx.prisma.sessionAttendee.update({
        where: { id: input.attendeeId },
        data: { status: 'CANCELLED' },
      })

      // Update session counts
      if (attendee.status === 'WAITLIST') {
        await ctx.prisma.activitySession.update({
          where: { id: attendee.sessionId },
          data: { waitlistCount: { decrement: 1 } },
        })
      } else if (attendee.status === 'REGISTERED') {
        await ctx.prisma.activitySession.update({
          where: { id: attendee.sessionId },
          data: { bookedCount: { decrement: 1 } },
        })

        // Promote first waitlisted attendee
        const firstWaitlist = await ctx.prisma.sessionAttendee.findFirst({
          where: { sessionId: attendee.sessionId, status: 'WAITLIST' },
          orderBy: { waitlistPosition: 'asc' },
        })

        if (firstWaitlist) {
          await ctx.prisma.sessionAttendee.update({
            where: { id: firstWaitlist.id },
            data: { status: 'REGISTERED', waitlistPosition: null },
          })
          await ctx.prisma.activitySession.update({
            where: { id: attendee.sessionId },
            data: {
              bookedCount: { increment: 1 },
              waitlistCount: { decrement: 1 },
            },
          })
        }
      }

      return { success: true }
    }),

  /**
   * Get attendance report
   */
  getAttendanceReport: requireStoreAccess
    .input(z.object({
      storeId: z.string(),
      from: z.string(),
      to: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const sessions = await ctx.prisma.activitySession.findMany({
        where: {
          storeId: input.storeId,
          date: {
            gte: new Date(input.from),
            lte: new Date(input.to),
          },
          status: 'COMPLETED',
        },
        include: {
          schedule: true,
          attendees: true,
        },
      })

      // Calculate statistics
      const totalSessions = sessions.length
      const totalAttendees = sessions.reduce((sum, s) =>
        sum + s.attendees.filter(a => a.status === 'CHECKED_IN').length, 0)
      const totalCapacity = sessions.reduce((sum, s) => sum + s.capacity, 0)
      const noShows = sessions.reduce((sum, s) =>
        sum + s.attendees.filter(a => a.status === 'NO_SHOW').length, 0)

      const attendanceRate = totalCapacity > 0
        ? Math.round((totalAttendees / totalCapacity) * 100)
        : 0

      const noShowRate = (totalAttendees + noShows) > 0
        ? Math.round((noShows / (totalAttendees + noShows)) * 100)
        : 0

      return {
        totalSessions,
        totalAttendees,
        totalCapacity,
        attendanceRate,
        noShows,
        noShowRate,
        sessions: sessions.map(s => ({
          id: s.id,
          scheduleName: s.schedule.name,
          date: s.date,
          capacity: s.capacity,
          attended: s.attendees.filter(a => a.status === 'CHECKED_IN').length,
          noShows: s.attendees.filter(a => a.status === 'NO_SHOW').length,
        })),
      }
    }),
})
