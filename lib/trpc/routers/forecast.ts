import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { PERMISSIONS } from '@/lib/rbac/roles'
import { checkPermission } from '../permissions'

// Simple forecasting algorithms
function calculateMovingAverage(data: number[], period: number): number {
  if (data.length < period) return data.reduce((a, b) => a + b, 0) / data.length || 0
  const recent = data.slice(-period)
  return recent.reduce((a, b) => a + b, 0) / period
}

function calculateTrend(data: number[]): { slope: number; direction: 'up' | 'down' | 'stable' } {
  if (data.length < 2) return { slope: 0, direction: 'stable' }

  const n = data.length
  const xSum = (n * (n - 1)) / 2
  const xSquaredSum = (n * (n - 1) * (2 * n - 1)) / 6
  const ySum = data.reduce((a, b) => a + b, 0)
  const xySum = data.reduce((sum, y, i) => sum + i * y, 0)

  const slope = (n * xySum - xSum * ySum) / (n * xSquaredSum - xSum * xSum)

  const direction = slope > 0.05 ? 'up' : slope < -0.05 ? 'down' : 'stable'
  return { slope, direction }
}

function linearRegression(data: number[], futureDays: number): number[] {
  if (data.length < 2) return Array(futureDays).fill(data[0] || 0)

  const n = data.length
  const xMean = (n - 1) / 2
  const yMean = data.reduce((a, b) => a + b, 0) / n

  let numerator = 0
  let denominator = 0
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (data[i] - yMean)
    denominator += (i - xMean) * (i - xMean)
  }

  const slope = denominator !== 0 ? numerator / denominator : 0
  const intercept = yMean - slope * xMean

  const predictions: number[] = []
  for (let i = 0; i < futureDays; i++) {
    const predictedValue = Math.max(0, intercept + slope * (n + i))
    predictions.push(predictedValue)
  }

  return predictions
}

function calculateSeasonality(dailyData: { date: string; value: number }[]): Record<number, number> {
  // Group by day of week (0-6)
  const dayTotals: Record<number, number[]> = {}

  dailyData.forEach(({ date, value }) => {
    const day = new Date(date).getDay()
    if (!dayTotals[day]) dayTotals[day] = []
    dayTotals[day].push(value)
  })

  const dayAverages: Record<number, number> = {}
  const overallAvg = dailyData.reduce((sum, d) => sum + d.value, 0) / dailyData.length || 1

  Object.entries(dayTotals).forEach(([day, values]) => {
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    dayAverages[Number(day)] = avg / overallAvg // Seasonal factor
  })

  return dayAverages
}

export const forecastRouter = router({
  // Get sales forecast
  getSalesForecast: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        forecastDays: z.number().min(7).max(90).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      const { storeId, forecastDays } = input

      // Get historical data (last 90 days)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 90)

      const orders = await ctx.prisma.order.findMany({
        where: {
          storeId,
          createdAt: { gte: startDate },
          status: { in: ['PROCESSING', 'COMPLETED'] },
        },
        select: {
          total: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      })

      // Group by date
      const dailyRevenue: Record<string, number> = {}
      const dailyOrders: Record<string, number> = {}

      orders.forEach((order) => {
        const date = new Date(order.createdAt).toISOString().split('T')[0]
        dailyRevenue[date] = (dailyRevenue[date] || 0) + order.total
        dailyOrders[date] = (dailyOrders[date] || 0) + 1
      })

      // Fill in missing dates with 0
      const allDates: string[] = []
      const currentDate = new Date(startDate)
      const today = new Date()
      while (currentDate <= today) {
        const dateStr = currentDate.toISOString().split('T')[0]
        allDates.push(dateStr)
        if (!dailyRevenue[dateStr]) dailyRevenue[dateStr] = 0
        if (!dailyOrders[dateStr]) dailyOrders[dateStr] = 0
        currentDate.setDate(currentDate.getDate() + 1)
      }

      // Prepare arrays for forecasting
      const revenueData = allDates.map((d) => dailyRevenue[d])
      const ordersData = allDates.map((d) => dailyOrders[d])

      // Calculate forecasts
      const revenueForecast = linearRegression(revenueData, forecastDays)
      const ordersForecast = linearRegression(ordersData, forecastDays)

      // Calculate seasonality
      const seasonalFactors = calculateSeasonality(
        allDates.map((date) => ({ date, value: dailyRevenue[date] }))
      )

      // Apply seasonality to forecasts
      const forecastDates: string[] = []
      const forecastDate = new Date()
      for (let i = 0; i < forecastDays; i++) {
        forecastDate.setDate(forecastDate.getDate() + 1)
        forecastDates.push(forecastDate.toISOString().split('T')[0])

        const dayOfWeek = forecastDate.getDay()
        const seasonalFactor = seasonalFactors[dayOfWeek] || 1
        revenueForecast[i] *= seasonalFactor
        ordersForecast[i] *= seasonalFactor
      }

      // Calculate totals
      const totalForecastRevenue = revenueForecast.reduce((a, b) => a + b, 0)
      const totalForecastOrders = Math.round(ordersForecast.reduce((a, b) => a + b, 0))
      const avgDailyRevenue = totalForecastRevenue / forecastDays
      const avgDailyOrders = totalForecastOrders / forecastDays

      // Calculate trend
      const revenueTrend = calculateTrend(revenueData.slice(-30))
      const ordersTrend = calculateTrend(ordersData.slice(-30))

      // Historical comparison
      const last30Revenue = revenueData.slice(-30).reduce((a, b) => a + b, 0)
      const last30Orders = ordersData.slice(-30).reduce((a, b) => a + b, 0)

      return {
        forecast: forecastDates.map((date, i) => ({
          date,
          revenue: Math.round(revenueForecast[i] * 100) / 100,
          orders: Math.round(ordersForecast[i]),
        })),
        summary: {
          totalRevenue: totalForecastRevenue,
          totalOrders: totalForecastOrders,
          avgDailyRevenue,
          avgDailyOrders,
          forecastDays,
        },
        trends: {
          revenue: revenueTrend.direction,
          orders: ordersTrend.direction,
        },
        comparison: {
          last30Revenue,
          forecastRevenue: totalForecastRevenue,
          revenueChange: last30Revenue > 0
            ? ((totalForecastRevenue - last30Revenue) / last30Revenue) * 100
            : 0,
        },
        historical: allDates.slice(-30).map((date) => ({
          date,
          revenue: dailyRevenue[date],
          orders: dailyOrders[date],
        })),
      }
    }),

  // Get stock forecast
  getStockForecast: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        forecastDays: z.number().min(7).max(90).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      const { storeId, forecastDays } = input

      // Get products with sales history
      const products = await ctx.prisma.product.findMany({
        where: {
          storeId,
          trackInventory: true,
          status: 'ACTIVE',
        },
        select: {
          id: true,
          name: true,
          quantity: true,
          lowStockThreshold: true,
        },
      })

      // Get order items from last 90 days
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 90)

      const orderItems = await ctx.prisma.orderItem.findMany({
        where: {
          order: {
            storeId,
            createdAt: { gte: startDate },
            status: { in: ['PROCESSING', 'COMPLETED'] },
          },
        },
        select: {
          productId: true,
          quantity: true,
          order: {
            select: { createdAt: true },
          },
        },
      })

      // Calculate daily sales per product
      const productSales: Record<string, number[]> = {}

      products.forEach((product) => {
        productSales[product.id] = []
      })

      // Group by product and date
      const productDailySales: Record<string, Record<string, number>> = {}
      orderItems.forEach((item) => {
        if (!productDailySales[item.productId]) {
          productDailySales[item.productId] = {}
        }
        const date = new Date(item.order.createdAt).toISOString().split('T')[0]
        productDailySales[item.productId][date] =
          (productDailySales[item.productId][date] || 0) + item.quantity
      })

      // Calculate forecasts for each product
      const stockForecasts = products.map((product) => {
        const dailySales = productDailySales[product.id] || {}
        const salesArray: number[] = []

        // Get last 90 days of sales
        const date = new Date(startDate)
        while (date <= new Date()) {
          const dateStr = date.toISOString().split('T')[0]
          salesArray.push(dailySales[dateStr] || 0)
          date.setDate(date.getDate() + 1)
        }

        // Calculate average daily sales
        const avgDailySales = calculateMovingAverage(salesArray, 30)

        // Forecast when stock will run out
        const daysUntilStockout = avgDailySales > 0
          ? Math.floor(product.quantity / avgDailySales)
          : Infinity

        // Calculate recommended reorder
        const leadTime = 7 // Assume 7 days lead time
        const safetyStock = avgDailySales * 14 // 2 weeks safety stock
        const reorderPoint = avgDailySales * leadTime + safetyStock

        const trend = calculateTrend(salesArray.slice(-30))

        return {
          productId: product.id,
          name: product.name,
          currentStock: product.quantity,
          avgDailySales,
          daysUntilStockout: daysUntilStockout === Infinity ? null : daysUntilStockout,
          trend: trend.direction,
          reorderPoint: Math.ceil(reorderPoint),
          needsReorder: product.quantity <= reorderPoint,
          forecastedSales: Math.round(avgDailySales * forecastDays),
        }
      })

      // Sort by urgency (days until stockout)
      const sortedForecasts = stockForecasts.sort((a, b) => {
        const aUrgency = a.daysUntilStockout ?? Infinity
        const bUrgency = b.daysUntilStockout ?? Infinity
        return aUrgency - bUrgency
      })

      // Categorize
      const critical = sortedForecasts.filter(
        (p) => p.daysUntilStockout !== null && p.daysUntilStockout <= 7
      )
      const warning = sortedForecasts.filter(
        (p) => p.daysUntilStockout !== null && p.daysUntilStockout > 7 && p.daysUntilStockout <= 30
      )
      const healthy = sortedForecasts.filter(
        (p) => p.daysUntilStockout === null || p.daysUntilStockout > 30
      )

      return {
        products: sortedForecasts,
        summary: {
          totalProducts: products.length,
          critical: critical.length,
          warning: warning.length,
          healthy: healthy.length,
        },
        alerts: {
          critical,
          warning,
        },
      }
    }),

  // Get product trends
  getProductTrends: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        limit: z.number().min(5).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      const { storeId, limit } = input

      // Get products
      const products = await ctx.prisma.product.findMany({
        where: { storeId, status: 'ACTIVE' },
        select: { id: true, name: true },
      })

      // Get sales from last 60 days
      const sixtyDaysAgo = new Date()
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const orderItems = await ctx.prisma.orderItem.findMany({
        where: {
          order: {
            storeId,
            createdAt: { gte: sixtyDaysAgo },
            status: { in: ['PROCESSING', 'COMPLETED'] },
          },
        },
        select: {
          productId: true,
          quantity: true,
          total: true,
          order: { select: { createdAt: true } },
        },
      })

      // Calculate trends for each product
      const productTrends = products.map((product) => {
        const items = orderItems.filter((item) => item.productId === product.id)

        // Split into periods
        const last30 = items.filter((i) => new Date(i.order.createdAt) >= thirtyDaysAgo)
        const previous30 = items.filter((i) => new Date(i.order.createdAt) < thirtyDaysAgo)

        const last30Revenue = last30.reduce((sum, i) => sum + i.total, 0)
        const previous30Revenue = previous30.reduce((sum, i) => sum + i.total, 0)
        const last30Quantity = last30.reduce((sum, i) => sum + i.quantity, 0)
        const previous30Quantity = previous30.reduce((sum, i) => sum + i.quantity, 0)

        const revenueChange = previous30Revenue > 0
          ? ((last30Revenue - previous30Revenue) / previous30Revenue) * 100
          : last30Revenue > 0 ? 100 : 0

        const quantityChange = previous30Quantity > 0
          ? ((last30Quantity - previous30Quantity) / previous30Quantity) * 100
          : last30Quantity > 0 ? 100 : 0

        return {
          productId: product.id,
          name: product.name,
          last30Revenue,
          previous30Revenue,
          revenueChange,
          last30Quantity,
          quantityChange,
          trend: revenueChange > 10 ? 'rising' as const :
                 revenueChange < -10 ? 'falling' as const : 'stable' as const,
        }
      })

      // Sort by absolute change
      const rising = productTrends
        .filter((p) => p.trend === 'rising')
        .sort((a, b) => b.revenueChange - a.revenueChange)
        .slice(0, limit)

      const falling = productTrends
        .filter((p) => p.trend === 'falling')
        .sort((a, b) => a.revenueChange - b.revenueChange)
        .slice(0, limit)

      return {
        rising,
        falling,
        summary: {
          totalRising: productTrends.filter((p) => p.trend === 'rising').length,
          totalFalling: productTrends.filter((p) => p.trend === 'falling').length,
          totalStable: productTrends.filter((p) => p.trend === 'stable').length,
        },
      }
    }),

  // Get recommendations
  getRecommendations: protectedProcedure
    .input(z.object({ storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      const { storeId } = input

      const recommendations: {
        type: 'stock' | 'sales' | 'marketing' | 'pricing'
        priority: 'high' | 'medium' | 'low'
        title: string
        description: string
        action: string
      }[] = []

      // Check for low stock products
      const lowStockProducts = await ctx.prisma.product.findMany({
        where: {
          storeId,
          status: 'ACTIVE',
          trackInventory: true,
          quantity: { lte: 10 },
        },
        select: { id: true, name: true, quantity: true },
      })

      if (lowStockProducts.length > 0) {
        recommendations.push({
          type: 'stock',
          priority: 'high',
          title: `${lowStockProducts.length} produits en stock faible`,
          description: `Les produits suivants ont un stock ≤ 10: ${lowStockProducts.slice(0, 3).map(p => p.name).join(', ')}${lowStockProducts.length > 3 ? '...' : ''}`,
          action: 'Réapprovisionner ces produits',
        })
      }

      // Check for products with no sales in 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const activeProducts = await ctx.prisma.product.findMany({
        where: { storeId, status: 'ACTIVE' },
        select: { id: true, name: true },
      })

      const productsWithSales = await ctx.prisma.orderItem.findMany({
        where: {
          order: {
            storeId,
            createdAt: { gte: thirtyDaysAgo },
            status: { in: ['PROCESSING', 'COMPLETED'] },
          },
        },
        select: { productId: true },
        distinct: ['productId'],
      })

      const productsWithSalesIds = new Set(productsWithSales.map(p => p.productId))
      const noSalesProducts = activeProducts.filter(p => !productsWithSalesIds.has(p.id))

      if (noSalesProducts.length > 0) {
        recommendations.push({
          type: 'sales',
          priority: noSalesProducts.length > 5 ? 'high' : 'medium',
          title: `${noSalesProducts.length} produits sans ventes`,
          description: `Ces produits n'ont eu aucune vente depuis 30 jours`,
          action: 'Envisager une promotion ou revoir le positionnement',
        })
      }

      // Check overall sales trend
      const sixtyDaysAgo = new Date()
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

      const recentOrders = await ctx.prisma.order.findMany({
        where: {
          storeId,
          createdAt: { gte: sixtyDaysAgo },
          status: { in: ['PROCESSING', 'COMPLETED'] },
        },
        select: { total: true, createdAt: true },
      })

      const last30Orders = recentOrders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo)
      const previous30Orders = recentOrders.filter(o => new Date(o.createdAt) < thirtyDaysAgo)

      const last30Revenue = last30Orders.reduce((sum, o) => sum + o.total, 0)
      const previous30Revenue = previous30Orders.reduce((sum, o) => sum + o.total, 0)

      if (previous30Revenue > 0) {
        const change = ((last30Revenue - previous30Revenue) / previous30Revenue) * 100

        if (change < -20) {
          recommendations.push({
            type: 'sales',
            priority: 'high',
            title: 'Baisse significative des ventes',
            description: `Les ventes ont diminué de ${Math.abs(change).toFixed(0)}% par rapport au mois précédent`,
            action: 'Analyser les causes et lancer une campagne marketing',
          })
        } else if (change > 20) {
          recommendations.push({
            type: 'sales',
            priority: 'low',
            title: 'Excellente croissance des ventes',
            description: `Les ventes ont augmenté de ${change.toFixed(0)}% par rapport au mois précédent`,
            action: 'Maintenir la stratégie actuelle et optimiser les stocks',
          })
        }
      }

      return {
        recommendations: recommendations.sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 }
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        }),
        summary: {
          high: recommendations.filter(r => r.priority === 'high').length,
          medium: recommendations.filter(r => r.priority === 'medium').length,
          low: recommendations.filter(r => r.priority === 'low').length,
        },
      }
    }),
})
