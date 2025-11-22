/**
 * Travel tRPC Router
 * Handles travel-specific operations: packages, departures, pricing
 */

import { z } from 'zod'
import { router, publicProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import {
  getTravelPackages,
  getTravelPackage,
  getAvailableDepartures,
  addDepartureDate,
  updateDepartureDate,
  calculateTravelPrice,
  getTravelStats,
  TRAVEL_TYPE_LABELS,
  TRAVEL_CLASS_LABELS,
  PASSENGER_TYPE_LABELS,
  COMMON_INCLUSIONS,
  COMMON_EXCLUSIONS,
} from '@/lib/travel/travel-manager'

const TravelClassEnum = z.enum(['ECONOMY', 'PREMIUM', 'BUSINESS', 'FIRST'])
const PassengerTypeEnum = z.enum(['ADULT', 'CHILD', 'INFANT', 'SENIOR'])
const TravelTypeEnum = z.enum(['CIRCUIT', 'STAY', 'CRUISE', 'FLIGHT', 'TRANSFER', 'WEEKEND'])
const DepartureStatusEnum = z.enum(['AVAILABLE', 'LIMITED', 'SOLD_OUT', 'CANCELLED'])

export const travelRouter = router({
  // ============ PUBLIC PROCEDURES ============

  /**
   * Get all travel packages
   */
  getPackages: publicProcedure
    .input(z.object({
      storeId: z.string(),
    }))
    .query(async ({ input }) => {
      return getTravelPackages(input.storeId)
    }),

  /**
   * Get package details
   */
  getPackage: publicProcedure
    .input(z.object({
      storeId: z.string(),
      packageId: z.string(),
    }))
    .query(async ({ input }) => {
      const pkg = await getTravelPackage(input.storeId, input.packageId)
      if (!pkg) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Package not found' })
      }
      return pkg
    }),

  /**
   * Get available departure dates
   */
  getDepartures: publicProcedure
    .input(z.object({
      storeId: z.string(),
      packageId: z.string(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return getAvailableDepartures(
        input.storeId,
        input.packageId,
        input.startDate ? new Date(input.startDate) : undefined,
        input.endDate ? new Date(input.endDate) : undefined
      )
    }),

  /**
   * Calculate trip price
   */
  calculatePrice: publicProcedure
    .input(z.object({
      storeId: z.string(),
      packageId: z.string(),
      departureId: z.string().optional(),
      passengers: z.array(z.object({
        type: PassengerTypeEnum,
        count: z.number().min(0),
      })),
      travelClass: TravelClassEnum.default('ECONOMY'),
    }))
    .query(async ({ input }) => {
      const pkg = await getTravelPackage(input.storeId, input.packageId)
      if (!pkg) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Package not found' })
      }

      const departure = input.departureId
        ? pkg.departureDates.find((d) => d.id === input.departureId)
        : undefined

      return calculateTravelPrice(
        pkg.basePrice,
        input.passengers,
        pkg.passengerPricing,
        input.travelClass,
        pkg.classUpgrades,
        departure
      )
    }),

  /**
   * Get labels and options
   */
  getOptions: publicProcedure.query(() => {
    return {
      travelTypes: Object.entries(TRAVEL_TYPE_LABELS).map(([value, label]) => ({ value, label })),
      travelClasses: Object.entries(TRAVEL_CLASS_LABELS).map(([value, label]) => ({ value, label })),
      passengerTypes: Object.entries(PASSENGER_TYPE_LABELS).map(([value, label]) => ({ value, label })),
      commonInclusions: COMMON_INCLUSIONS,
      commonExclusions: COMMON_EXCLUSIONS,
    }
  }),

  // ============ ADMIN PROCEDURES ============

  /**
   * Add departure date
   */
  addDeparture: adminProcedure
    .input(z.object({
      storeId: z.string(),
      packageId: z.string(),
      date: z.string(),
      endDate: z.string(),
      price: z.number().min(0),
      spotsTotal: z.number().min(1),
      guaranteedDeparture: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      const departure = await addDepartureDate(input.storeId, input.packageId, {
        date: input.date,
        endDate: input.endDate,
        price: input.price,
        spotsAvailable: input.spotsTotal,
        spotsTotal: input.spotsTotal,
        status: 'AVAILABLE',
        guaranteedDeparture: input.guaranteedDeparture,
      })

      if (!departure) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Package not found' })
      }

      return departure
    }),

  /**
   * Update departure date
   */
  updateDeparture: adminProcedure
    .input(z.object({
      storeId: z.string(),
      packageId: z.string(),
      departureId: z.string(),
      updates: z.object({
        price: z.number().min(0).optional(),
        spotsAvailable: z.number().min(0).optional(),
        status: DepartureStatusEnum.optional(),
        guaranteedDeparture: z.boolean().optional(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      const store = await ctx.prisma.store.findFirst({
        where: { id: input.storeId, ownerId: ctx.session.user.id },
      })

      if (!store) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Store not found' })
      }

      const departure = await updateDepartureDate(
        input.storeId,
        input.packageId,
        input.departureId,
        input.updates
      )

      if (!departure) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Departure not found' })
      }

      return departure
    }),

  /**
   * Get travel statistics
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

      const startDate = input.startDate ? new Date(input.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const endDate = input.endDate ? new Date(input.endDate) : new Date()

      return getTravelStats(input.storeId, startDate, endDate)
    }),
})
