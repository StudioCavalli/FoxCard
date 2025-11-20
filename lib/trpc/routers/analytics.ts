import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { PERMISSIONS } from '@/lib/rbac/roles'
import { checkPermission } from '../permissions'

// Types for analytics data
interface SalesDataPoint {
  date: string
  revenue: number
  orders: number
  averageOrderValue: number
}

interface ProductStats {
  productId: string
  name: string
  revenue: number
  quantity: number
  views: number
}

interface TrafficSource {
  source: string
  visitors: number
  percentage: number
}

interface FunnelStage {
  stage: string
  count: number
  conversionRate: number
}

export const analyticsRouter = router({
  // Get sales overview with time series data
  getSalesOverview: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        period: z.enum(['day', 'week', 'month', 'year']).default('month'),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      const { storeId, period } = input

      // Calculate date range based on period
      const now = new Date()
      let startDate: Date
      let groupByFormat: string

      switch (period) {
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          groupByFormat = 'hour'
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          groupByFormat = 'day'
          break
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          groupByFormat = 'day'
          break
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          groupByFormat = 'month'
          break
      }

      // Get orders within the period
      const orders = await ctx.prisma.order.findMany({
        where: {
          storeId,
          createdAt: {
            gte: startDate,
          },
          status: {
            in: ['PROCESSING', 'COMPLETED'],
          },
        },
        select: {
          id: true,
          total: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      })

      // Group orders by date
      const salesByDate: Record<string, { revenue: number; orders: number }> = {}

      orders.forEach((order) => {
        let dateKey: string
        const date = new Date(order.createdAt)

        if (groupByFormat === 'hour') {
          dateKey = `${date.getHours()}:00`
        } else if (groupByFormat === 'day') {
          dateKey = date.toISOString().split('T')[0]
        } else {
          dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        }

        if (!salesByDate[dateKey]) {
          salesByDate[dateKey] = { revenue: 0, orders: 0 }
        }
        salesByDate[dateKey].revenue += order.total
        salesByDate[dateKey].orders += 1
      })

      // Convert to array format for charts
      const salesData: SalesDataPoint[] = Object.entries(salesByDate).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
        averageOrderValue: data.orders > 0 ? data.revenue / data.orders : 0,
      }))

      // Calculate totals
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
      const totalOrders = orders.length
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Get previous period for comparison
      const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))
      const previousOrders = await ctx.prisma.order.findMany({
        where: {
          storeId,
          createdAt: {
            gte: previousPeriodStart,
            lt: startDate,
          },
          status: {
            in: ['PROCESSING', 'COMPLETED'],
          },
        },
        select: {
          total: true,
        },
      })

      const previousRevenue = previousOrders.reduce((sum, order) => sum + order.total, 0)
      const previousOrderCount = previousOrders.length

      const revenueChange = previousRevenue > 0
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
        : 0
      const ordersChange = previousOrderCount > 0
        ? ((totalOrders - previousOrderCount) / previousOrderCount) * 100
        : 0

      return {
        salesData,
        totals: {
          revenue: totalRevenue,
          orders: totalOrders,
          averageOrderValue,
        },
        changes: {
          revenue: revenueChange,
          orders: ordersChange,
        },
      }
    }),

  // Get top products by various metrics
  getTopProducts: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        limit: z.number().min(1).max(50).default(10),
        sortBy: z.enum(['revenue', 'quantity', 'views']).default('revenue'),
        period: z.enum(['week', 'month', 'year', 'all']).default('month'),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      const { storeId, limit, sortBy, period } = input

      // Calculate date range
      let startDate: Date | undefined
      const now = new Date()

      if (period !== 'all') {
        const days = period === 'week' ? 7 : period === 'month' ? 30 : 365
        startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      }

      // Get order items with product info
      const orderItems = await ctx.prisma.orderItem.findMany({
        where: {
          product: {
            storeId,
          },
          order: {
            status: {
              in: ['PROCESSING', 'COMPLETED'],
            },
            ...(startDate && {
              createdAt: {
                gte: startDate,
              },
            }),
          },
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      // Aggregate by product
      const productStats: Record<string, ProductStats> = {}

      orderItems.forEach((item) => {
        if (!item.product) return

        const productId = item.product.id
        if (!productStats[productId]) {
          productStats[productId] = {
            productId,
            name: item.product.name,
            revenue: 0,
            quantity: 0,
            views: 0, // Would come from page view tracking
          }
        }

        productStats[productId].revenue += item.total
        productStats[productId].quantity += item.quantity
      })

      // Sort and limit
      const sortedProducts = Object.values(productStats)
        .sort((a, b) => b[sortBy] - a[sortBy])
        .slice(0, limit)

      return sortedProducts
    }),

  // Get conversion funnel
  getConversionFunnel: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        period: z.enum(['week', 'month', 'year']).default('month'),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      const { storeId, period } = input

      // Calculate date range
      const now = new Date()
      const days = period === 'week' ? 7 : period === 'month' ? 30 : 365
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

      // Get orders by status to calculate funnel
      const orders = await ctx.prisma.order.findMany({
        where: {
          storeId,
          createdAt: {
            gte: startDate,
          },
        },
        select: {
          status: true,
          paymentStatus: true,
        },
      })

      // Calculate funnel stages
      // Note: In a real app, you'd have page view and cart tracking
      const totalOrders = orders.length
      const paidOrders = orders.filter((o) => o.paymentStatus === 'PAID').length
      const completedOrders = orders.filter((o) => o.status === 'COMPLETED').length

      // Simulated funnel data (in production, use real tracking)
      const estimatedPageViews = totalOrders * 50 // Rough estimate
      const estimatedAddToCarts = totalOrders * 3

      const funnel: FunnelStage[] = [
        {
          stage: 'Visites',
          count: estimatedPageViews,
          conversionRate: 100,
        },
        {
          stage: 'Ajout au panier',
          count: estimatedAddToCarts,
          conversionRate: estimatedPageViews > 0
            ? (estimatedAddToCarts / estimatedPageViews) * 100
            : 0,
        },
        {
          stage: 'Commandes',
          count: totalOrders,
          conversionRate: estimatedAddToCarts > 0
            ? (totalOrders / estimatedAddToCarts) * 100
            : 0,
        },
        {
          stage: 'Paiements',
          count: paidOrders,
          conversionRate: totalOrders > 0
            ? (paidOrders / totalOrders) * 100
            : 0,
        },
        {
          stage: 'Complétées',
          count: completedOrders,
          conversionRate: paidOrders > 0
            ? (completedOrders / paidOrders) * 100
            : 0,
        },
      ]

      return funnel
    }),

  // Get real-time stats (simplified - would use WebSocket in production)
  getRealTimeStats: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      const { storeId } = input

      // Get orders from the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      const recentOrders = await ctx.prisma.order.findMany({
        where: {
          storeId,
          createdAt: {
            gte: oneHourAgo,
          },
        },
        select: {
          total: true,
          createdAt: true,
        },
      })

      // Get orders from today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayOrders = await ctx.prisma.order.findMany({
        where: {
          storeId,
          createdAt: {
            gte: today,
          },
          status: {
            in: ['PROCESSING', 'COMPLETED'],
          },
        },
        select: {
          total: true,
        },
      })

      const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0)

      // Simulated real-time data
      return {
        activeVisitors: Math.floor(Math.random() * 50) + 10, // Would come from real tracking
        ordersLastHour: recentOrders.length,
        revenueLastHour: recentOrders.reduce((sum, order) => sum + order.total, 0),
        todayRevenue,
        todayOrders: todayOrders.length,
      }
    }),

  // Get customer acquisition data
  getCustomerStats: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        period: z.enum(['week', 'month', 'year']).default('month'),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      const { storeId, period } = input

      // Calculate date range
      const now = new Date()
      const days = period === 'week' ? 7 : period === 'month' ? 30 : 365
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

      // Get new customers
      const newCustomers = await ctx.prisma.customer.count({
        where: {
          storeId,
          createdAt: {
            gte: startDate,
          },
        },
      })

      // Get returning customers (orders > 1)
      const customersWithMultipleOrders = await ctx.prisma.customer.findMany({
        where: {
          storeId,
        },
        include: {
          _count: {
            select: { orders: true },
          },
        },
      })

      const returningCustomers = customersWithMultipleOrders.filter(
        (c) => c._count.orders > 1
      ).length

      const totalCustomers = customersWithMultipleOrders.length

      // Calculate customer lifetime value
      const orders = await ctx.prisma.order.findMany({
        where: {
          storeId,
          status: {
            in: ['PROCESSING', 'COMPLETED'],
          },
        },
        select: {
          total: true,
        },
      })

      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
      const averageLifetimeValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0

      return {
        newCustomers,
        returningCustomers,
        totalCustomers,
        retentionRate: totalCustomers > 0
          ? (returningCustomers / totalCustomers) * 100
          : 0,
        averageLifetimeValue,
      }
    }),

  // Compare two periods
  comparePeriods: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        currentStart: z.string(),
        currentEnd: z.string(),
        previousStart: z.string(),
        previousEnd: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      const { storeId, currentStart, currentEnd, previousStart, previousEnd } = input

      // Get current period orders
      const currentOrders = await ctx.prisma.order.findMany({
        where: {
          storeId,
          createdAt: {
            gte: new Date(currentStart),
            lte: new Date(currentEnd),
          },
          status: {
            in: ['PROCESSING', 'COMPLETED'],
          },
        },
        select: {
          total: true,
        },
      })

      // Get previous period orders
      const previousOrders = await ctx.prisma.order.findMany({
        where: {
          storeId,
          createdAt: {
            gte: new Date(previousStart),
            lte: new Date(previousEnd),
          },
          status: {
            in: ['PROCESSING', 'COMPLETED'],
          },
        },
        select: {
          total: true,
        },
      })

      const currentRevenue = currentOrders.reduce((sum, order) => sum + order.total, 0)
      const previousRevenue = previousOrders.reduce((sum, order) => sum + order.total, 0)

      const currentOrderCount = currentOrders.length
      const previousOrderCount = previousOrders.length

      return {
        current: {
          revenue: currentRevenue,
          orders: currentOrderCount,
          averageOrderValue: currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0,
        },
        previous: {
          revenue: previousRevenue,
          orders: previousOrderCount,
          averageOrderValue: previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0,
        },
        changes: {
          revenue: previousRevenue > 0
            ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
            : 0,
          orders: previousOrderCount > 0
            ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100
            : 0,
        },
      }
    }),
})
