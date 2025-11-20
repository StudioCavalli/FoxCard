import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { PERMISSIONS } from '@/lib/rbac/roles'
import { checkPermission } from '../permissions'
import { TRPCError } from '@trpc/server'

// Generate inventory count number
async function generateCountNumber(prisma: any, storeId: string): Promise<string> {
  const year = new Date().getFullYear()
  const count = await prisma.inventoryCount.count({
    where: {
      storeId,
      countNumber: { startsWith: `INV-${year}` },
    },
  })
  return `INV-${year}-${String(count + 1).padStart(4, '0')}`
}

export const inventoryRouter = router({
  // Get stock alerts (low stock, out of stock)
  getAlerts: protectedProcedure
    .input(z.object({ storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_VIEW)

      // Get all warehouse stocks with thresholds
      const stocks = await ctx.prisma.warehouseStock.findMany({
        where: {
          warehouse: { storeId: input.storeId },
        },
        include: {
          warehouse: {
            select: { id: true, name: true, code: true },
          },
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              thumbnail: true,
              lowStockThreshold: true,
            },
          },
        },
      })

      const alerts = {
        outOfStock: [] as any[],
        lowStock: [] as any[],
        overstock: [] as any[],
      }

      for (const stock of stocks) {
        const threshold = stock.minStock || stock.product.lowStockThreshold || 10

        if (stock.quantity === 0) {
          alerts.outOfStock.push({
            ...stock,
            alertType: 'OUT_OF_STOCK',
            severity: 'critical',
          })
        } else if (stock.quantity <= threshold) {
          alerts.lowStock.push({
            ...stock,
            alertType: 'LOW_STOCK',
            severity: 'warning',
            threshold,
          })
        } else if (stock.maxStock && stock.quantity > stock.maxStock) {
          alerts.overstock.push({
            ...stock,
            alertType: 'OVERSTOCK',
            severity: 'info',
            maxStock: stock.maxStock,
          })
        }
      }

      return {
        alerts,
        summary: {
          outOfStock: alerts.outOfStock.length,
          lowStock: alerts.lowStock.length,
          overstock: alerts.overstock.length,
          total: alerts.outOfStock.length + alerts.lowStock.length + alerts.overstock.length,
        },
      }
    }),

  // Get replenishment suggestions
  getReplenishmentSuggestions: protectedProcedure
    .input(z.object({ storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_VIEW)

      // Get products with low stock
      const stocks = await ctx.prisma.warehouseStock.findMany({
        where: {
          warehouse: { storeId: input.storeId, isActive: true },
        },
        include: {
          warehouse: {
            select: { id: true, name: true, code: true },
          },
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              cost: true,
              lowStockThreshold: true,
            },
          },
        },
      })

      // Get recent sales data (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const recentSales = await ctx.prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            storeId: input.storeId,
            createdAt: { gte: thirtyDaysAgo },
            status: { in: ['PROCESSING', 'COMPLETED'] },
          },
        },
        _sum: { quantity: true },
      })

      const salesMap = new Map(recentSales.map((s) => [s.productId, s._sum.quantity || 0]))

      const suggestions = stocks
        .map((stock) => {
          const threshold = stock.minStock || stock.product.lowStockThreshold || 10
          const monthlySales = salesMap.get(stock.product.id) || 0
          const dailySales = monthlySales / 30
          const daysOfStock = dailySales > 0 ? stock.quantity / dailySales : Infinity

          // Calculate suggested order quantity
          const targetStock = Math.max(threshold * 3, Math.ceil(monthlySales * 1.5))
          const suggestedQty = Math.max(0, targetStock - stock.quantity)

          if (suggestedQty === 0) return null

          return {
            warehouseId: stock.warehouse.id,
            warehouseName: stock.warehouse.name,
            productId: stock.product.id,
            productName: stock.product.name,
            sku: stock.product.sku,
            currentStock: stock.quantity,
            threshold,
            monthlySales,
            dailySales: Math.round(dailySales * 10) / 10,
            daysOfStock: daysOfStock === Infinity ? null : Math.round(daysOfStock),
            suggestedQty,
            estimatedCost: suggestedQty * (stock.product.cost || 0),
            urgency:
              stock.quantity === 0
                ? 'critical'
                : stock.quantity <= threshold
                ? 'high'
                : daysOfStock < 14
                ? 'medium'
                : 'low',
          }
        })
        .filter(Boolean)
        .sort((a, b) => {
          const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 }
          return urgencyOrder[a!.urgency as keyof typeof urgencyOrder] - urgencyOrder[b!.urgency as keyof typeof urgencyOrder]
        })

      return suggestions
    }),

  // Create inventory count
  createCount: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        warehouseId: z.string(),
        name: z.string().min(1),
        description: z.string().optional(),
        productIds: z.array(z.string()).optional(), // If empty, include all products
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_CREATE)

      const countNumber = await generateCountNumber(ctx.prisma, input.storeId)

      // Get products to count
      let stocks
      if (input.productIds && input.productIds.length > 0) {
        stocks = await ctx.prisma.warehouseStock.findMany({
          where: {
            warehouseId: input.warehouseId,
            productId: { in: input.productIds },
          },
          include: {
            product: { select: { name: true } },
          },
        })
      } else {
        stocks = await ctx.prisma.warehouseStock.findMany({
          where: { warehouseId: input.warehouseId },
          include: {
            product: { select: { name: true } },
          },
        })
      }

      const count = await ctx.prisma.inventoryCount.create({
        data: {
          storeId: input.storeId,
          warehouseId: input.warehouseId,
          countNumber,
          name: input.name,
          description: input.description,
          items: {
            create: stocks.map((stock) => ({
              productId: stock.productId,
              productName: stock.product.name,
              expectedQty: stock.quantity,
              location: stock.location,
            })),
          },
        },
        include: {
          items: true,
        },
      })

      return count
    }),

  // List inventory counts
  listCounts: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        warehouseId: z.string().optional(),
        status: z
          .enum(['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'APPLIED', 'CANCELLED'])
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_VIEW)

      const counts = await ctx.prisma.inventoryCount.findMany({
        where: {
          storeId: input.storeId,
          ...(input.warehouseId && { warehouseId: input.warehouseId }),
          ...(input.status && { status: input.status }),
        },
        include: {
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
      })

      return counts
    }),

  // Get inventory count details
  getCount: protectedProcedure
    .input(z.object({ countId: z.string(), storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_VIEW)

      const count = await ctx.prisma.inventoryCount.findUnique({
        where: { id: input.countId },
        include: {
          items: {
            orderBy: { productName: 'asc' },
          },
        },
      })

      if (!count) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Count not found' })
      }

      return count
    }),

  // Start counting
  startCount: protectedProcedure
    .input(z.object({ countId: z.string(), storeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_UPDATE)

      const count = await ctx.prisma.inventoryCount.update({
        where: { id: input.countId },
        data: {
          status: 'IN_PROGRESS',
          startedBy: ctx.session?.user?.id,
          startedAt: new Date(),
        },
      })

      return count
    }),

  // Record count for an item
  recordItemCount: protectedProcedure
    .input(
      z.object({
        itemId: z.string(),
        storeId: z.string(),
        countedQty: z.number().min(0),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_UPDATE)

      const item = await ctx.prisma.inventoryCountItem.findUnique({
        where: { id: input.itemId },
      })

      if (!item) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Item not found' })
      }

      const variance = input.countedQty - item.expectedQty

      const updated = await ctx.prisma.inventoryCountItem.update({
        where: { id: input.itemId },
        data: {
          countedQty: input.countedQty,
          variance,
          notes: input.notes,
          countedAt: new Date(),
          countedBy: ctx.session?.user?.id,
        },
      })

      return updated
    }),

  // Complete count
  completeCount: protectedProcedure
    .input(z.object({ countId: z.string(), storeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_UPDATE)

      const count = await ctx.prisma.inventoryCount.findUnique({
        where: { id: input.countId },
        include: { items: true },
      })

      if (!count) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Count not found' })
      }

      // Check all items are counted
      const uncounted = count.items.filter((i) => i.countedQty === null)
      if (uncounted.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `${uncounted.length} items not yet counted`,
        })
      }

      // Calculate summary
      const totalCounted = count.items.reduce((sum, i) => sum + (i.countedQty || 0), 0)
      const totalVariance = count.items.reduce((sum, i) => sum + Math.abs(i.variance || 0), 0)

      const updated = await ctx.prisma.inventoryCount.update({
        where: { id: input.countId },
        data: {
          status: 'COMPLETED',
          completedBy: ctx.session?.user?.id,
          completedAt: new Date(),
          totalCounted,
          totalVariance,
        },
      })

      return updated
    }),

  // Apply count adjustments to stock
  applyCount: protectedProcedure
    .input(z.object({ countId: z.string(), storeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_UPDATE)

      const count = await ctx.prisma.inventoryCount.findUnique({
        where: { id: input.countId },
        include: { items: true },
      })

      if (!count) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Count not found' })
      }

      if (count.status !== 'COMPLETED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Count must be completed before applying',
        })
      }

      // Apply adjustments
      for (const item of count.items) {
        if (item.variance === 0 || item.countedQty === null) continue

        const stock = await ctx.prisma.warehouseStock.findUnique({
          where: {
            warehouseId_productId: {
              warehouseId: count.warehouseId,
              productId: item.productId,
            },
          },
        })

        if (!stock) continue

        // Update stock
        await ctx.prisma.warehouseStock.update({
          where: {
            warehouseId_productId: {
              warehouseId: count.warehouseId,
              productId: item.productId,
            },
          },
          data: {
            quantity: item.countedQty,
            available: item.countedQty - stock.reserved,
          },
        })

        // Record movement
        await ctx.prisma.stockMovement.create({
          data: {
            storeId: input.storeId,
            warehouseId: count.warehouseId,
            productId: item.productId,
            type: 'ADJUSTMENT',
            quantity: item.variance!,
            reference: count.countNumber,
            quantityBefore: stock.quantity,
            quantityAfter: item.countedQty,
            reason: `Inventory count: ${count.name}`,
            userId: ctx.session?.user?.id,
          },
        })

        // Update product total
        const allStocks = await ctx.prisma.warehouseStock.findMany({
          where: { productId: item.productId },
        })
        const totalQty = allStocks.reduce((sum, s) => sum + s.quantity, 0)
        await ctx.prisma.product.update({
          where: { id: item.productId },
          data: { quantity: totalQty },
        })
      }

      const updated = await ctx.prisma.inventoryCount.update({
        where: { id: input.countId },
        data: { status: 'APPLIED' },
      })

      return updated
    }),

  // Cancel count
  cancelCount: protectedProcedure
    .input(z.object({ countId: z.string(), storeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_UPDATE)

      const count = await ctx.prisma.inventoryCount.update({
        where: { id: input.countId },
        data: { status: 'CANCELLED' },
      })

      return count
    }),

  // Get stock movements with filters
  getMovements: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        warehouseId: z.string().optional(),
        productId: z.string().optional(),
        type: z
          .enum([
            'PURCHASE',
            'SALE',
            'TRANSFER_IN',
            'TRANSFER_OUT',
            'ADJUSTMENT',
            'RETURN',
            'DAMAGED',
          ])
          .optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().default(100),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_VIEW)

      const movements = await ctx.prisma.stockMovement.findMany({
        where: {
          storeId: input.storeId,
          ...(input.warehouseId && { warehouseId: input.warehouseId }),
          ...(input.productId && { productId: input.productId }),
          ...(input.type && { type: input.type }),
          ...(input.startDate && {
            createdAt: { gte: new Date(input.startDate) },
          }),
          ...(input.endDate && {
            createdAt: { lte: new Date(input.endDate) },
          }),
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
      })

      return movements
    }),

  // Export movements for audit
  exportMovements: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        warehouseId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      const movements = await ctx.prisma.stockMovement.findMany({
        where: {
          storeId: input.storeId,
          createdAt: {
            gte: new Date(input.startDate),
            lte: new Date(input.endDate),
          },
          ...(input.warehouseId && { warehouseId: input.warehouseId }),
        },
        orderBy: { createdAt: 'asc' },
      })

      // Get product and warehouse names
      const productIds = [...new Set(movements.map((m) => m.productId))]
      const warehouseIds = [...new Set(movements.map((m) => m.warehouseId))]

      const products = await ctx.prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, sku: true },
      })

      const warehouses = await ctx.prisma.warehouse.findMany({
        where: { id: { in: warehouseIds } },
        select: { id: true, name: true, code: true },
      })

      const productMap = new Map(products.map((p) => [p.id, p]))
      const warehouseMap = new Map(warehouses.map((w) => [w.id, w]))

      return movements.map((m) => ({
        ...m,
        productName: productMap.get(m.productId)?.name || 'Unknown',
        productSku: productMap.get(m.productId)?.sku || '',
        warehouseName: warehouseMap.get(m.warehouseId)?.name || 'Unknown',
        warehouseCode: warehouseMap.get(m.warehouseId)?.code || '',
      }))
    }),
})
