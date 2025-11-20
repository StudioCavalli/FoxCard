import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { PERMISSIONS } from '@/lib/rbac/roles'
import { checkPermission } from '../permissions'

export const inventoryReportRouter = router({
  // Stock value report by warehouse and category
  getStockValue: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        warehouseId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      // Get all stocks with product and warehouse info
      const stocks = await ctx.prisma.warehouseStock.findMany({
        where: {
          warehouse: {
            storeId: input.storeId,
            isActive: true,
            ...(input.warehouseId && { id: input.warehouseId }),
          },
        },
        include: {
          warehouse: {
            select: { id: true, name: true, code: true },
          },
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              cost: true,
              categoryId: true,
            },
          },
        },
      })

      // Get categories
      const categories = await ctx.prisma.category.findMany({
        where: { storeId: input.storeId },
        select: { id: true, name: true },
      })
      const categoryMap = new Map(categories.map((c) => [c.id, c.name]))

      // Group by warehouse
      const byWarehouse: Record<string, {
        warehouseId: string
        warehouseName: string
        totalQuantity: number
        totalCost: number
        totalRetail: number
        productCount: number
      }> = {}

      // Group by category
      const byCategory: Record<string, {
        categoryId: string
        categoryName: string
        totalQuantity: number
        totalCost: number
        totalRetail: number
        productCount: number
      }> = {}

      let totalQuantity = 0
      let totalCost = 0
      let totalRetail = 0

      for (const stock of stocks) {
        const cost = stock.product.cost || stock.product.price
        const stockCost = stock.quantity * cost
        const stockRetail = stock.quantity * stock.product.price

        totalQuantity += stock.quantity
        totalCost += stockCost
        totalRetail += stockRetail

        // By warehouse
        if (!byWarehouse[stock.warehouse.id]) {
          byWarehouse[stock.warehouse.id] = {
            warehouseId: stock.warehouse.id,
            warehouseName: stock.warehouse.name,
            totalQuantity: 0,
            totalCost: 0,
            totalRetail: 0,
            productCount: 0,
          }
        }
        byWarehouse[stock.warehouse.id].totalQuantity += stock.quantity
        byWarehouse[stock.warehouse.id].totalCost += stockCost
        byWarehouse[stock.warehouse.id].totalRetail += stockRetail
        byWarehouse[stock.warehouse.id].productCount += 1

        // By category
        const catId = stock.product.categoryId || 'uncategorized'
        const catName = categoryMap.get(stock.product.categoryId || '') || 'Non catégorisé'
        if (!byCategory[catId]) {
          byCategory[catId] = {
            categoryId: catId,
            categoryName: catName,
            totalQuantity: 0,
            totalCost: 0,
            totalRetail: 0,
            productCount: 0,
          }
        }
        byCategory[catId].totalQuantity += stock.quantity
        byCategory[catId].totalCost += stockCost
        byCategory[catId].totalRetail += stockRetail
        byCategory[catId].productCount += 1
      }

      return {
        summary: {
          totalQuantity,
          totalCost,
          totalRetail,
          potentialProfit: totalRetail - totalCost,
          margin: totalRetail > 0 ? ((totalRetail - totalCost) / totalRetail) * 100 : 0,
        },
        byWarehouse: Object.values(byWarehouse).sort((a, b) => b.totalCost - a.totalCost),
        byCategory: Object.values(byCategory).sort((a, b) => b.totalCost - a.totalCost),
      }
    }),

  // Product turnover rate
  getTurnoverRate: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        days: z.number().default(90),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - input.days)

      // Get sales per product
      const sales = await ctx.prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            storeId: input.storeId,
            createdAt: { gte: startDate },
            status: { in: ['PROCESSING', 'COMPLETED'] },
          },
        },
        _sum: { quantity: true },
      })

      const salesMap = new Map(sales.map((s) => [s.productId, s._sum.quantity || 0]))

      // Get current stock per product
      const stocks = await ctx.prisma.warehouseStock.groupBy({
        by: ['productId'],
        where: {
          warehouse: { storeId: input.storeId },
        },
        _sum: { quantity: true },
      })

      // Get product info
      const productIds = [...new Set([...salesMap.keys(), ...stocks.map((s) => s.productId)])]
      const products = await ctx.prisma.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          cost: true,
          categoryId: true,
        },
      })

      const turnoverData = products.map((product) => {
        const stockQty = stocks.find((s) => s.productId === product.id)?._sum.quantity || 0
        const salesQty = salesMap.get(product.id) || 0
        const avgInventory = stockQty // Simplified: using current stock as average

        // Turnover rate = Sales / Average Inventory
        const turnoverRate = avgInventory > 0 ? salesQty / avgInventory : 0

        // Days of inventory = Average Inventory / (Sales / Days)
        const dailySales = salesQty / input.days
        const daysOfInventory = dailySales > 0 ? stockQty / dailySales : Infinity

        return {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          currentStock: stockQty,
          salesQty,
          turnoverRate: Math.round(turnoverRate * 100) / 100,
          daysOfInventory: daysOfInventory === Infinity ? null : Math.round(daysOfInventory),
          stockValue: stockQty * (product.cost || product.price),
          status:
            turnoverRate > 2
              ? 'fast'
              : turnoverRate > 0.5
              ? 'normal'
              : turnoverRate > 0
              ? 'slow'
              : 'dead',
        }
      })

      // Sort by turnover rate
      turnoverData.sort((a, b) => b.turnoverRate - a.turnoverRate)

      // Summary
      const avgTurnover =
        turnoverData.reduce((sum, p) => sum + p.turnoverRate, 0) / (turnoverData.length || 1)
      const fastMoving = turnoverData.filter((p) => p.status === 'fast').length
      const slowMoving = turnoverData.filter((p) => p.status === 'slow').length
      const deadStock = turnoverData.filter((p) => p.status === 'dead').length

      return {
        products: turnoverData,
        summary: {
          avgTurnover: Math.round(avgTurnover * 100) / 100,
          fastMoving,
          normalMoving: turnoverData.length - fastMoving - slowMoving - deadStock,
          slowMoving,
          deadStock,
          period: input.days,
        },
      }
    }),

  // Obsolete products (no sales in X days)
  getObsoleteProducts: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        days: z.number().default(90),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - input.days)

      // Get products with stock
      const stocks = await ctx.prisma.warehouseStock.findMany({
        where: {
          warehouse: { storeId: input.storeId },
          quantity: { gt: 0 },
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
              cost: true,
              createdAt: true,
            },
          },
          warehouse: {
            select: { name: true },
          },
        },
      })

      // Get last sale date for each product
      const productIds = [...new Set(stocks.map((s) => s.product.id))]

      const lastSales = await ctx.prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          productId: { in: productIds },
          order: {
            status: { in: ['PROCESSING', 'COMPLETED'] },
          },
        },
        _max: { createdAt: true },
      })

      const lastSaleMap = new Map(
        lastSales.map((s) => [s.productId, s._max.createdAt])
      )

      // Filter obsolete products
      const obsolete = stocks
        .filter((stock) => {
          const lastSale = lastSaleMap.get(stock.product.id)
          return !lastSale || lastSale < cutoffDate
        })
        .map((stock) => {
          const lastSale = lastSaleMap.get(stock.product.id)
          const daysSinceLastSale = lastSale
            ? Math.floor((Date.now() - new Date(lastSale).getTime()) / (1000 * 60 * 60 * 24))
            : null

          return {
            productId: stock.product.id,
            productName: stock.product.name,
            sku: stock.product.sku,
            warehouseName: stock.warehouse.name,
            quantity: stock.quantity,
            stockValue: stock.quantity * (stock.product.cost || stock.product.price),
            lastSaleDate: lastSale,
            daysSinceLastSale,
            productAge: Math.floor(
              (Date.now() - new Date(stock.product.createdAt).getTime()) / (1000 * 60 * 60 * 24)
            ),
          }
        })
        .sort((a, b) => b.stockValue - a.stockValue)

      const totalValue = obsolete.reduce((sum, p) => sum + p.stockValue, 0)
      const totalQuantity = obsolete.reduce((sum, p) => sum + p.quantity, 0)

      return {
        products: obsolete,
        summary: {
          productCount: obsolete.length,
          totalQuantity,
          totalValue,
          threshold: input.days,
        },
        recommendations: [
          obsolete.length > 0 && totalValue > 1000
            ? {
                type: 'liquidation',
                message: `Envisagez une liquidation pour ${formatPrice(totalValue)} de stock obsolète`,
                priority: 'high',
              }
            : null,
          obsolete.some((p) => p.productAge < 30)
            ? {
                type: 'new_product',
                message: 'Certains produits récents ne se vendent pas - vérifiez le prix/description',
                priority: 'medium',
              }
            : null,
        ].filter(Boolean),
      }
    }),

  // ABC Analysis (Pareto: 80/20 rule)
  getABCAnalysis: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        days: z.number().default(90),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - input.days)

      // Get revenue per product
      const sales = await ctx.prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            storeId: input.storeId,
            createdAt: { gte: startDate },
            status: { in: ['PROCESSING', 'COMPLETED'] },
          },
        },
        _sum: { total: true, quantity: true },
      })

      if (sales.length === 0) {
        return {
          products: [],
          summary: { aCount: 0, bCount: 0, cCount: 0, aRevenue: 0, bRevenue: 0, cRevenue: 0 },
        }
      }

      // Get product info
      const productIds = sales.map((s) => s.productId)
      const products = await ctx.prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, sku: true },
      })
      const productMap = new Map(products.map((p) => [p.id, p]))

      // Calculate total revenue
      const totalRevenue = sales.reduce((sum, s) => sum + (s._sum.total || 0), 0)

      // Sort by revenue and calculate cumulative
      const sortedSales = sales
        .map((s) => ({
          productId: s.productId,
          productName: productMap.get(s.productId)?.name || 'Unknown',
          sku: productMap.get(s.productId)?.sku || '',
          revenue: s._sum.total || 0,
          quantity: s._sum.quantity || 0,
        }))
        .sort((a, b) => b.revenue - a.revenue)

      let cumulative = 0
      const analyzed = sortedSales.map((item) => {
        cumulative += item.revenue
        const cumulativePercent = (cumulative / totalRevenue) * 100
        const revenuePercent = (item.revenue / totalRevenue) * 100

        // ABC classification
        let category: 'A' | 'B' | 'C'
        if (cumulativePercent <= 80) {
          category = 'A'
        } else if (cumulativePercent <= 95) {
          category = 'B'
        } else {
          category = 'C'
        }

        return {
          ...item,
          revenuePercent: Math.round(revenuePercent * 100) / 100,
          cumulativePercent: Math.round(cumulativePercent * 100) / 100,
          category,
        }
      })

      // Summary
      const aProducts = analyzed.filter((p) => p.category === 'A')
      const bProducts = analyzed.filter((p) => p.category === 'B')
      const cProducts = analyzed.filter((p) => p.category === 'C')

      return {
        products: analyzed,
        summary: {
          aCount: aProducts.length,
          bCount: bProducts.length,
          cCount: cProducts.length,
          aRevenue: aProducts.reduce((sum, p) => sum + p.revenue, 0),
          bRevenue: bProducts.reduce((sum, p) => sum + p.revenue, 0),
          cRevenue: cProducts.reduce((sum, p) => sum + p.revenue, 0),
          aPercentOfProducts: Math.round((aProducts.length / analyzed.length) * 100),
          period: input.days,
        },
        recommendations: [
          {
            type: 'focus_a',
            message: `Priorisez le réapprovisionnement des ${aProducts.length} produits A (${Math.round((aProducts.length / analyzed.length) * 100)}% des produits, ~80% du CA)`,
            priority: 'high',
          },
          cProducts.length > analyzed.length * 0.5
            ? {
                type: 'review_c',
                message: `Évaluez les ${cProducts.length} produits C - envisagez de réduire le stock ou d'arrêter`,
                priority: 'medium',
              }
            : null,
        ].filter(Boolean),
      }
    }),

  // Get inventory recommendations
  getRecommendations: protectedProcedure
    .input(z.object({ storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      const recommendations: Array<{
        type: string
        title: string
        message: string
        priority: 'critical' | 'high' | 'medium' | 'low'
        action?: string
      }> = []

      // Check for out of stock
      const outOfStock = await ctx.prisma.warehouseStock.count({
        where: {
          warehouse: { storeId: input.storeId },
          quantity: 0,
        },
      })

      if (outOfStock > 0) {
        recommendations.push({
          type: 'out_of_stock',
          title: 'Ruptures de stock',
          message: `${outOfStock} produit(s) en rupture de stock`,
          priority: 'critical',
          action: 'Réapprovisionner immédiatement',
        })
      }

      // Check for low stock
      const lowStock = await ctx.prisma.warehouseStock.findMany({
        where: {
          warehouse: { storeId: input.storeId },
          quantity: { gt: 0 },
          minStock: { not: null },
        },
      })

      const lowStockCount = lowStock.filter((s) => s.quantity <= (s.minStock || 0)).length
      if (lowStockCount > 5) {
        recommendations.push({
          type: 'low_stock',
          title: 'Stock bas',
          message: `${lowStockCount} produit(s) sous le seuil d'alerte`,
          priority: 'high',
          action: 'Planifier réapprovisionnement',
        })
      }

      // Check for overstock
      const overstock = lowStock.filter(
        (s) => s.maxStock && s.quantity > s.maxStock
      ).length
      if (overstock > 0) {
        recommendations.push({
          type: 'overstock',
          title: 'Surstock',
          message: `${overstock} produit(s) dépassent la capacité maximale`,
          priority: 'medium',
          action: 'Envisager transfert ou promotion',
        })
      }

      // Check for pending transfers
      const pendingTransfers = await ctx.prisma.stockTransfer.count({
        where: {
          storeId: input.storeId,
          status: 'PENDING',
        },
      })

      if (pendingTransfers > 0) {
        recommendations.push({
          type: 'pending_transfers',
          title: 'Transferts en attente',
          message: `${pendingTransfers} transfert(s) à approuver`,
          priority: 'medium',
          action: 'Valider les transferts',
        })
      }

      return recommendations.sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2, low: 3 }
        return order[a.priority] - order[b.priority]
      })
    }),
})

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}
