import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { PERMISSIONS } from '@/lib/rbac/roles'
import { checkPermission } from '../permissions'
import { TRPCError } from '@trpc/server'

// Generate transfer number
async function generateTransferNumber(prisma: any, storeId: string): Promise<string> {
  const year = new Date().getFullYear()
  const count = await prisma.stockTransfer.count({
    where: {
      storeId,
      transferNumber: { startsWith: `TRF-${year}` },
    },
  })
  return `TRF-${year}-${String(count + 1).padStart(4, '0')}`
}

export const warehouseRouter = router({
  // List all warehouses
  list: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        includeInactive: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_VIEW)

      const warehouses = await ctx.prisma.warehouse.findMany({
        where: {
          storeId: input.storeId,
          ...(!input.includeInactive && { isActive: true }),
        },
        include: {
          _count: {
            select: { stockItems: true },
          },
        },
        orderBy: [{ isPrimary: 'desc' }, { priority: 'asc' }, { name: 'asc' }],
      })

      // Get total stock value per warehouse
      const warehousesWithStats = await Promise.all(
        warehouses.map(async (warehouse) => {
          const stockItems = await ctx.prisma.warehouseStock.findMany({
            where: { warehouseId: warehouse.id },
            include: {
              product: {
                select: { price: true, cost: true },
              },
            },
          })

          const totalQuantity = stockItems.reduce((sum, item) => sum + item.quantity, 0)
          const totalValue = stockItems.reduce(
            (sum, item) => sum + item.quantity * (item.product.cost || item.product.price),
            0
          )

          return {
            ...warehouse,
            productCount: warehouse._count.stockItems,
            totalQuantity,
            totalValue,
          }
        })
      )

      return warehousesWithStats
    }),

  // Get single warehouse
  get: protectedProcedure
    .input(z.object({ warehouseId: z.string(), storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_VIEW)

      const warehouse = await ctx.prisma.warehouse.findUnique({
        where: { id: input.warehouseId },
        include: {
          stockItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  price: true,
                  cost: true,
                  thumbnail: true,
                },
              },
            },
            orderBy: { product: { name: 'asc' } },
          },
        },
      })

      if (!warehouse) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Warehouse not found' })
      }

      return warehouse
    }),

  // Create warehouse
  create: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        name: z.string().min(1),
        code: z.string().min(1),
        description: z.string().optional(),
        address: z.string().min(1),
        city: z.string().min(1),
        postalCode: z.string().min(1),
        country: z.string().default('FR'),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        manager: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        isPrimary: z.boolean().default(false),
        priority: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_CREATE)

      // If this is primary, unset other primary warehouses
      if (input.isPrimary) {
        await ctx.prisma.warehouse.updateMany({
          where: { storeId: input.storeId, isPrimary: true },
          data: { isPrimary: false },
        })
      }

      const warehouse = await ctx.prisma.warehouse.create({
        data: input,
      })

      return warehouse
    }),

  // Update warehouse
  update: protectedProcedure
    .input(
      z.object({
        warehouseId: z.string(),
        storeId: z.string(),
        name: z.string().min(1).optional(),
        code: z.string().min(1).optional(),
        description: z.string().optional(),
        address: z.string().min(1).optional(),
        city: z.string().min(1).optional(),
        postalCode: z.string().min(1).optional(),
        country: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        manager: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        isActive: z.boolean().optional(),
        isPrimary: z.boolean().optional(),
        priority: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_UPDATE)

      const { warehouseId, storeId, ...data } = input

      // If setting as primary, unset other primary warehouses
      if (data.isPrimary) {
        await ctx.prisma.warehouse.updateMany({
          where: { storeId, isPrimary: true, id: { not: warehouseId } },
          data: { isPrimary: false },
        })
      }

      const warehouse = await ctx.prisma.warehouse.update({
        where: { id: warehouseId },
        data,
      })

      return warehouse
    }),

  // Delete warehouse
  delete: protectedProcedure
    .input(z.object({ warehouseId: z.string(), storeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_DELETE)

      // Check if warehouse has stock
      const stockCount = await ctx.prisma.warehouseStock.count({
        where: { warehouseId: input.warehouseId, quantity: { gt: 0 } },
      })

      if (stockCount > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete warehouse with stock. Transfer all stock first.',
        })
      }

      await ctx.prisma.warehouse.delete({
        where: { id: input.warehouseId },
      })

      return { success: true }
    }),

  // Update stock for a product in a warehouse
  updateStock: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        warehouseId: z.string(),
        productId: z.string(),
        quantity: z.number().min(0),
        minStock: z.number().min(0).optional(),
        maxStock: z.number().min(0).optional(),
        location: z.string().optional(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_UPDATE)

      const { storeId, warehouseId, productId, quantity, reason, ...data } = input

      // Get current stock
      const currentStock = await ctx.prisma.warehouseStock.findUnique({
        where: {
          warehouseId_productId: { warehouseId, productId },
        },
      })

      const quantityBefore = currentStock?.quantity || 0

      // Update or create stock
      const stock = await ctx.prisma.warehouseStock.upsert({
        where: {
          warehouseId_productId: { warehouseId, productId },
        },
        update: {
          quantity,
          available: quantity - (currentStock?.reserved || 0),
          ...data,
        },
        create: {
          warehouseId,
          productId,
          quantity,
          available: quantity,
          ...data,
        },
      })

      // Record movement
      if (quantity !== quantityBefore) {
        await ctx.prisma.stockMovement.create({
          data: {
            storeId,
            warehouseId,
            productId,
            type: 'ADJUSTMENT',
            quantity: quantity - quantityBefore,
            quantityBefore,
            quantityAfter: quantity,
            reason,
            userId: ctx.session?.user?.id,
          },
        })
      }

      // Update total product quantity
      await updateProductTotalQuantity(ctx.prisma, productId)

      return stock
    }),

  // Get stock across all warehouses for a product
  getProductStock: protectedProcedure
    .input(z.object({ productId: z.string(), storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_VIEW)

      const stocks = await ctx.prisma.warehouseStock.findMany({
        where: { productId: input.productId },
        include: {
          warehouse: {
            select: {
              id: true,
              name: true,
              code: true,
              city: true,
              isActive: true,
            },
          },
        },
      })

      const totalQuantity = stocks.reduce((sum, s) => sum + s.quantity, 0)
      const totalAvailable = stocks.reduce((sum, s) => sum + s.available, 0)
      const totalReserved = stocks.reduce((sum, s) => sum + s.reserved, 0)

      return {
        stocks,
        summary: {
          totalQuantity,
          totalAvailable,
          totalReserved,
          warehouseCount: stocks.length,
        },
      }
    }),

  // Create stock transfer
  createTransfer: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        fromWarehouseId: z.string(),
        toWarehouseId: z.string(),
        items: z
          .array(
            z.object({
              productId: z.string(),
              productName: z.string(),
              quantity: z.number().min(1),
            })
          )
          .min(1),
        reason: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_UPDATE)

      const { items, ...transferData } = input

      // Validate stock availability
      for (const item of items) {
        const stock = await ctx.prisma.warehouseStock.findUnique({
          where: {
            warehouseId_productId: {
              warehouseId: input.fromWarehouseId,
              productId: item.productId,
            },
          },
        })

        if (!stock || stock.available < item.quantity) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Insufficient stock for product ${item.productName}`,
          })
        }
      }

      // Generate transfer number
      const transferNumber = await generateTransferNumber(ctx.prisma, input.storeId)

      // Create transfer
      const transfer = await ctx.prisma.stockTransfer.create({
        data: {
          ...transferData,
          transferNumber,
          createdBy: ctx.session?.user?.id,
          items: {
            create: items,
          },
        },
        include: {
          items: true,
          fromWarehouse: { select: { name: true, code: true } },
          toWarehouse: { select: { name: true, code: true } },
        },
      })

      return transfer
    }),

  // Get transfers
  listTransfers: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        status: z.enum(['PENDING', 'APPROVED', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED']).optional(),
        warehouseId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_VIEW)

      const transfers = await ctx.prisma.stockTransfer.findMany({
        where: {
          storeId: input.storeId,
          ...(input.status && { status: input.status }),
          ...(input.warehouseId && {
            OR: [
              { fromWarehouseId: input.warehouseId },
              { toWarehouseId: input.warehouseId },
            ],
          }),
        },
        include: {
          items: true,
          fromWarehouse: { select: { id: true, name: true, code: true } },
          toWarehouse: { select: { id: true, name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
      })

      return transfers
    }),

  // Get single transfer
  getTransfer: protectedProcedure
    .input(z.object({ transferId: z.string(), storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_VIEW)

      const transfer = await ctx.prisma.stockTransfer.findUnique({
        where: { id: input.transferId },
        include: {
          items: true,
          fromWarehouse: true,
          toWarehouse: true,
        },
      })

      if (!transfer) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Transfer not found' })
      }

      return transfer
    }),

  // Approve transfer
  approveTransfer: protectedProcedure
    .input(z.object({ transferId: z.string(), storeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_UPDATE)

      const transfer = await ctx.prisma.stockTransfer.update({
        where: { id: input.transferId },
        data: {
          status: 'APPROVED',
          approvedBy: ctx.session?.user?.id,
          approvedAt: new Date(),
        },
      })

      return transfer
    }),

  // Ship transfer (mark as in transit and reserve stock)
  shipTransfer: protectedProcedure
    .input(z.object({ transferId: z.string(), storeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_UPDATE)

      const transfer = await ctx.prisma.stockTransfer.findUnique({
        where: { id: input.transferId },
        include: { items: true },
      })

      if (!transfer) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Transfer not found' })
      }

      // Deduct stock from source warehouse
      for (const item of transfer.items) {
        const stock = await ctx.prisma.warehouseStock.findUnique({
          where: {
            warehouseId_productId: {
              warehouseId: transfer.fromWarehouseId,
              productId: item.productId,
            },
          },
        })

        if (!stock || stock.quantity < item.quantity) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Insufficient stock for ${item.productName}`,
          })
        }

        await ctx.prisma.warehouseStock.update({
          where: {
            warehouseId_productId: {
              warehouseId: transfer.fromWarehouseId,
              productId: item.productId,
            },
          },
          data: {
            quantity: { decrement: item.quantity },
            available: { decrement: item.quantity },
          },
        })

        // Record movement
        await ctx.prisma.stockMovement.create({
          data: {
            storeId: input.storeId,
            warehouseId: transfer.fromWarehouseId,
            productId: item.productId,
            type: 'TRANSFER_OUT',
            quantity: -item.quantity,
            reference: transfer.transferNumber,
            quantityBefore: stock.quantity,
            quantityAfter: stock.quantity - item.quantity,
            userId: ctx.session?.user?.id,
          },
        })

        await updateProductTotalQuantity(ctx.prisma, item.productId)
      }

      const updated = await ctx.prisma.stockTransfer.update({
        where: { id: input.transferId },
        data: {
          status: 'IN_TRANSIT',
          shippedAt: new Date(),
        },
      })

      return updated
    }),

  // Receive transfer
  receiveTransfer: protectedProcedure
    .input(
      z.object({
        transferId: z.string(),
        storeId: z.string(),
        items: z.array(
          z.object({
            productId: z.string(),
            received: z.number().min(0),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_UPDATE)

      const transfer = await ctx.prisma.stockTransfer.findUnique({
        where: { id: input.transferId },
        include: { items: true },
      })

      if (!transfer) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Transfer not found' })
      }

      // Update received quantities and add stock to destination
      for (const receivedItem of input.items) {
        const transferItem = transfer.items.find((i) => i.productId === receivedItem.productId)
        if (!transferItem) continue

        // Update transfer item
        await ctx.prisma.stockTransferItem.update({
          where: { id: transferItem.id },
          data: { received: receivedItem.received },
        })

        // Get or create stock at destination
        const destStock = await ctx.prisma.warehouseStock.findUnique({
          where: {
            warehouseId_productId: {
              warehouseId: transfer.toWarehouseId,
              productId: receivedItem.productId,
            },
          },
        })

        const quantityBefore = destStock?.quantity || 0

        await ctx.prisma.warehouseStock.upsert({
          where: {
            warehouseId_productId: {
              warehouseId: transfer.toWarehouseId,
              productId: receivedItem.productId,
            },
          },
          update: {
            quantity: { increment: receivedItem.received },
            available: { increment: receivedItem.received },
          },
          create: {
            warehouseId: transfer.toWarehouseId,
            productId: receivedItem.productId,
            quantity: receivedItem.received,
            available: receivedItem.received,
          },
        })

        // Record movement
        await ctx.prisma.stockMovement.create({
          data: {
            storeId: input.storeId,
            warehouseId: transfer.toWarehouseId,
            productId: receivedItem.productId,
            type: 'TRANSFER_IN',
            quantity: receivedItem.received,
            reference: transfer.transferNumber,
            quantityBefore,
            quantityAfter: quantityBefore + receivedItem.received,
            userId: ctx.session?.user?.id,
          },
        })

        await updateProductTotalQuantity(ctx.prisma, receivedItem.productId)
      }

      const updated = await ctx.prisma.stockTransfer.update({
        where: { id: input.transferId },
        data: {
          status: 'RECEIVED',
          receivedAt: new Date(),
          completedBy: ctx.session?.user?.id,
        },
      })

      return updated
    }),

  // Cancel transfer
  cancelTransfer: protectedProcedure
    .input(z.object({ transferId: z.string(), storeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_UPDATE)

      const transfer = await ctx.prisma.stockTransfer.findUnique({
        where: { id: input.transferId },
      })

      if (!transfer) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Transfer not found' })
      }

      if (transfer.status === 'RECEIVED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot cancel a received transfer',
        })
      }

      const updated = await ctx.prisma.stockTransfer.update({
        where: { id: input.transferId },
        data: { status: 'CANCELLED' },
      })

      return updated
    }),

  // Get stock movements history
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
        limit: z.number().default(50),
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
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
      })

      return movements
    }),

  // Get dashboard stats
  getDashboard: protectedProcedure
    .input(z.object({ storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.PRODUCTS_VIEW)

      const [
        warehouseCount,
        pendingTransfers,
        lowStockAlerts,
        recentMovements,
      ] = await Promise.all([
        ctx.prisma.warehouse.count({
          where: { storeId: input.storeId, isActive: true },
        }),
        ctx.prisma.stockTransfer.count({
          where: { storeId: input.storeId, status: 'PENDING' },
        }),
        ctx.prisma.warehouseStock.count({
          where: {
            warehouse: { storeId: input.storeId },
            minStock: { not: null },
            quantity: { lte: ctx.prisma.warehouseStock.fields.minStock },
          },
        }),
        ctx.prisma.stockMovement.findMany({
          where: { storeId: input.storeId },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
      ])

      // Total stock value
      const stocks = await ctx.prisma.warehouseStock.findMany({
        where: {
          warehouse: { storeId: input.storeId },
        },
        include: {
          product: { select: { cost: true, price: true } },
        },
      })

      const totalValue = stocks.reduce(
        (sum, s) => sum + s.quantity * (s.product.cost || s.product.price),
        0
      )
      const totalQuantity = stocks.reduce((sum, s) => sum + s.quantity, 0)

      return {
        summary: {
          warehouseCount,
          pendingTransfers,
          lowStockAlerts,
          totalValue,
          totalQuantity,
        },
        recentMovements,
      }
    }),
})

// Helper to update total product quantity across all warehouses
async function updateProductTotalQuantity(prisma: any, productId: string) {
  const stocks = await prisma.warehouseStock.findMany({
    where: { productId },
  })

  const totalQuantity = stocks.reduce((sum: number, s: any) => sum + s.quantity, 0)

  await prisma.product.update({
    where: { id: productId },
    data: { quantity: totalQuantity },
  })
}
