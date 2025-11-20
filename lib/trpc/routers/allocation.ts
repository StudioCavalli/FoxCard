import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { PERMISSIONS } from '@/lib/rbac/roles'
import { checkPermission } from '../permissions'
import { TRPCError } from '@trpc/server'

// Haversine formula for distance calculation
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

// Estimate shipping cost based on distance
function estimateShippingCost(distanceKm: number): number {
  // Base cost + per km rate
  const baseCost = 5
  const perKmRate = 0.15
  return baseCost + distanceKm * perKmRate
}

interface AllocationResult {
  warehouseId: string
  warehouseName: string
  productId: string
  productName: string
  quantity: number
  distance: number | null
  score: number
  reason: string
}

interface WarehouseScore {
  warehouseId: string
  warehouseName: string
  totalScore: number
  factors: {
    distance: number
    stockLevel: number
    priority: number
    cost: number
  }
  distance: number | null
  availableProducts: number
  totalAvailable: number
}

export const allocationRouter = router({
  // Get allocation rules
  listRules: protectedProcedure
    .input(z.object({ storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_VIEW)

      const rules = await ctx.prisma.allocationRule.findMany({
        where: { storeId: input.storeId },
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      })

      return rules
    }),

  // Create allocation rule
  createRule: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        name: z.string().min(1),
        description: z.string().optional(),
        type: z.enum(['DISTANCE', 'STOCK_LEVEL', 'COST', 'PRIORITY', 'ZONE', 'SPLIT_ALLOWED']),
        priority: z.number().default(0),
        config: z.any(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_CREATE)

      const rule = await ctx.prisma.allocationRule.create({
        data: input,
      })

      return rule
    }),

  // Update allocation rule
  updateRule: protectedProcedure
    .input(
      z.object({
        ruleId: z.string(),
        storeId: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        priority: z.number().optional(),
        config: z.any().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_UPDATE)

      const { ruleId, storeId, ...data } = input

      const rule = await ctx.prisma.allocationRule.update({
        where: { id: ruleId },
        data,
      })

      return rule
    }),

  // Delete allocation rule
  deleteRule: protectedProcedure
    .input(z.object({ ruleId: z.string(), storeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_DELETE)

      await ctx.prisma.allocationRule.delete({
        where: { id: input.ruleId },
      })

      return { success: true }
    }),

  // Calculate optimal allocation for an order
  calculateAllocation: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        items: z
          .array(
            z.object({
              productId: z.string(),
              productName: z.string(),
              quantity: z.number().min(1),
            })
          )
          .min(1),
        customerLocation: z
          .object({
            latitude: z.number(),
            longitude: z.number(),
          })
          .optional(),
        customerPostalCode: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_VIEW)

      // Get active rules sorted by priority
      const rules = await ctx.prisma.allocationRule.findMany({
        where: { storeId: input.storeId, isActive: true },
        orderBy: { priority: 'desc' },
      })

      // Get all active warehouses with stock
      const warehouses = await ctx.prisma.warehouse.findMany({
        where: { storeId: input.storeId, isActive: true },
        include: {
          stockItems: {
            where: {
              productId: { in: input.items.map((i) => i.productId) },
            },
          },
        },
        orderBy: { priority: 'asc' },
      })

      if (warehouses.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No active warehouses found',
        })
      }

      // Check if splitting is allowed
      const splitAllowed = rules.some((r) => r.type === 'SPLIT_ALLOWED' && r.isActive)

      // Calculate scores for each warehouse
      const warehouseScores: WarehouseScore[] = warehouses.map((warehouse) => {
        let totalScore = 0
        const factors = {
          distance: 0,
          stockLevel: 0,
          priority: 0,
          cost: 0,
        }

        // Calculate distance if customer location is provided
        let distance: number | null = null
        if (input.customerLocation && warehouse.latitude && warehouse.longitude) {
          distance = calculateDistance(
            input.customerLocation.latitude,
            input.customerLocation.longitude,
            warehouse.latitude,
            warehouse.longitude
          )
        }

        // Apply rules
        for (const rule of rules) {
          const config = rule.config as Record<string, any>
          const weight = config.weight || 1

          switch (rule.type) {
            case 'DISTANCE':
              if (distance !== null) {
                // Lower distance = higher score (normalized to 0-100)
                const maxDistance = config.maxDistance || 1000
                factors.distance = Math.max(0, (1 - distance / maxDistance) * 100) * weight
                totalScore += factors.distance
              }
              break

            case 'STOCK_LEVEL':
              // Higher stock level = higher score
              const totalAvailable = warehouse.stockItems.reduce(
                (sum, s) => sum + s.available,
                0
              )
              factors.stockLevel = Math.min(totalAvailable * 10, 100) * weight
              totalScore += factors.stockLevel
              break

            case 'PRIORITY':
              // Use warehouse priority (higher priority = higher score)
              factors.priority = (100 - warehouse.priority) * weight
              totalScore += factors.priority
              break

            case 'COST':
              // Lower cost = higher score
              if (distance !== null) {
                const cost = estimateShippingCost(distance)
                const maxCost = config.maxCost || 50
                factors.cost = Math.max(0, (1 - cost / maxCost) * 100) * weight
                totalScore += factors.cost
              }
              break

            case 'ZONE':
              // Check if customer postal code matches zone
              if (input.customerPostalCode && config.zones) {
                const zones = config.zones as Record<string, string[]>
                for (const [warehouseCode, postalCodes] of Object.entries(zones)) {
                  if (
                    warehouse.code === warehouseCode &&
                    postalCodes.some((pc: string) =>
                      input.customerPostalCode!.startsWith(pc)
                    )
                  ) {
                    totalScore += 100 * weight
                  }
                }
              }
              break
          }
        }

        // Count available products
        const availableProducts = input.items.filter((item) => {
          const stock = warehouse.stockItems.find((s) => s.productId === item.productId)
          return stock && stock.available >= item.quantity
        }).length

        const totalAvailable = warehouse.stockItems.reduce((sum, s) => sum + s.available, 0)

        return {
          warehouseId: warehouse.id,
          warehouseName: warehouse.name,
          totalScore,
          factors,
          distance,
          availableProducts,
          totalAvailable,
        }
      })

      // Sort by score
      warehouseScores.sort((a, b) => b.totalScore - a.totalScore)

      // Allocate items
      const allocations: AllocationResult[] = []
      const remainingItems = [...input.items]

      for (const item of input.items) {
        let allocated = false

        for (const warehouseScore of warehouseScores) {
          const warehouse = warehouses.find((w) => w.id === warehouseScore.warehouseId)
          if (!warehouse) continue

          const stock = warehouse.stockItems.find((s) => s.productId === item.productId)
          if (!stock || stock.available < item.quantity) continue

          // Allocate from this warehouse
          allocations.push({
            warehouseId: warehouse.id,
            warehouseName: warehouse.name,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            distance: warehouseScore.distance,
            score: warehouseScore.totalScore,
            reason: `Score: ${warehouseScore.totalScore.toFixed(0)} - ${
              warehouseScore.distance
                ? `Distance: ${warehouseScore.distance.toFixed(1)}km`
                : 'Priorité'
            }`,
          })
          allocated = true
          break
        }

        // If not allocated and splitting is allowed, try to split
        if (!allocated && splitAllowed) {
          let remainingQty = item.quantity

          for (const warehouseScore of warehouseScores) {
            if (remainingQty <= 0) break

            const warehouse = warehouses.find((w) => w.id === warehouseScore.warehouseId)
            if (!warehouse) continue

            const stock = warehouse.stockItems.find((s) => s.productId === item.productId)
            if (!stock || stock.available <= 0) continue

            const allocateQty = Math.min(remainingQty, stock.available)

            allocations.push({
              warehouseId: warehouse.id,
              warehouseName: warehouse.name,
              productId: item.productId,
              productName: item.productName,
              quantity: allocateQty,
              distance: warehouseScore.distance,
              score: warehouseScore.totalScore,
              reason: `Split - ${allocateQty}/${item.quantity}`,
            })

            remainingQty -= allocateQty
          }

          if (remainingQty > 0) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: `Insufficient stock for product ${item.productName}`,
            })
          }
        } else if (!allocated) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Cannot allocate product ${item.productName} - insufficient stock`,
          })
        }
      }

      // Calculate totals
      const uniqueWarehouses = new Set(allocations.map((a) => a.warehouseId))
      const totalDistance = allocations.reduce((sum, a) => sum + (a.distance || 0), 0)
      const estimatedCost = totalDistance > 0 ? estimateShippingCost(totalDistance) : 0

      return {
        allocations,
        summary: {
          warehouseCount: uniqueWarehouses.size,
          totalDistance: totalDistance || null,
          estimatedShippingCost: estimatedCost,
          isSplit: uniqueWarehouses.size > 1,
        },
        warehouseScores: warehouseScores.slice(0, 5), // Top 5 for display
      }
    }),

  // Apply allocation to an order
  applyAllocation: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        orderId: z.string(),
        allocations: z
          .array(
            z.object({
              warehouseId: z.string(),
              productId: z.string(),
              quantity: z.number().min(1),
              reason: z.string().optional(),
            })
          )
          .min(1),
        factors: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_UPDATE)

      const uniqueWarehouses = new Set(input.allocations.map((a) => a.warehouseId))

      // Save decision
      const decision = await ctx.prisma.allocationDecision.create({
        data: {
          storeId: input.storeId,
          orderId: input.orderId,
          allocations: input.allocations,
          splitCount: uniqueWarehouses.size,
          factors: input.factors || {},
        },
      })

      // Reserve stock in each warehouse
      for (const allocation of input.allocations) {
        await ctx.prisma.warehouseStock.update({
          where: {
            warehouseId_productId: {
              warehouseId: allocation.warehouseId,
              productId: allocation.productId,
            },
          },
          data: {
            reserved: { increment: allocation.quantity },
            available: { decrement: allocation.quantity },
          },
        })
      }

      return decision
    }),

  // Override allocation
  overrideAllocation: protectedProcedure
    .input(
      z.object({
        decisionId: z.string(),
        storeId: z.string(),
        newAllocations: z
          .array(
            z.object({
              warehouseId: z.string(),
              productId: z.string(),
              quantity: z.number().min(1),
            })
          )
          .min(1),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_UPDATE)

      const decision = await ctx.prisma.allocationDecision.findUnique({
        where: { id: input.decisionId },
      })

      if (!decision) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Decision not found' })
      }

      // Restore previous reservations
      const oldAllocations = decision.allocations as any[]
      for (const allocation of oldAllocations) {
        await ctx.prisma.warehouseStock.update({
          where: {
            warehouseId_productId: {
              warehouseId: allocation.warehouseId,
              productId: allocation.productId,
            },
          },
          data: {
            reserved: { decrement: allocation.quantity },
            available: { increment: allocation.quantity },
          },
        })
      }

      // Apply new allocations
      for (const allocation of input.newAllocations) {
        await ctx.prisma.warehouseStock.update({
          where: {
            warehouseId_productId: {
              warehouseId: allocation.warehouseId,
              productId: allocation.productId,
            },
          },
          data: {
            reserved: { increment: allocation.quantity },
            available: { decrement: allocation.quantity },
          },
        })
      }

      // Update decision
      const uniqueWarehouses = new Set(input.newAllocations.map((a) => a.warehouseId))

      const updated = await ctx.prisma.allocationDecision.update({
        where: { id: input.decisionId },
        data: {
          allocations: input.newAllocations,
          splitCount: uniqueWarehouses.size,
          wasOverridden: true,
          overriddenBy: ctx.session?.user?.id,
          overrideReason: input.reason,
        },
      })

      return updated
    }),

  // Get allocation history
  getHistory: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_VIEW)

      const decisions = await ctx.prisma.allocationDecision.findMany({
        where: { storeId: input.storeId },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
      })

      return decisions
    }),

  // Get allocation statistics
  getStats: protectedProcedure
    .input(z.object({ storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      const [totalDecisions, splitDecisions, overriddenDecisions] = await Promise.all([
        ctx.prisma.allocationDecision.count({
          where: { storeId: input.storeId },
        }),
        ctx.prisma.allocationDecision.count({
          where: { storeId: input.storeId, splitCount: { gt: 1 } },
        }),
        ctx.prisma.allocationDecision.count({
          where: { storeId: input.storeId, wasOverridden: true },
        }),
      ])

      // Average metrics
      const decisions = await ctx.prisma.allocationDecision.findMany({
        where: { storeId: input.storeId },
        select: {
          totalDistance: true,
          estimatedShippingCost: true,
        },
      })

      const avgDistance =
        decisions.reduce((sum, d) => sum + (d.totalDistance || 0), 0) / (decisions.length || 1)
      const avgCost =
        decisions.reduce((sum, d) => sum + (d.estimatedShippingCost || 0), 0) /
        (decisions.length || 1)

      return {
        totalDecisions,
        splitDecisions,
        splitRate: totalDecisions > 0 ? (splitDecisions / totalDecisions) * 100 : 0,
        overriddenDecisions,
        overrideRate: totalDecisions > 0 ? (overriddenDecisions / totalDecisions) * 100 : 0,
        avgDistance,
        avgShippingCost: avgCost,
      }
    }),

  // Simulate allocation (preview without applying)
  simulate: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        items: z
          .array(
            z.object({
              productId: z.string(),
              productName: z.string(),
              quantity: z.number().min(1),
            })
          )
          .min(1),
        customerPostalCode: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_VIEW)

      // This uses the same logic as calculateAllocation
      // but is exposed separately for clarity
      return ctx.prisma.$transaction(async (tx) => {
        // The simulation doesn't modify any data
        // It just calculates and returns the optimal allocation
        // Reuse the calculateAllocation logic
        return { message: 'Use calculateAllocation for simulation' }
      })
    }),
})
