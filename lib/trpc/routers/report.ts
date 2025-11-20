import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { PERMISSIONS } from '@/lib/rbac/roles'
import { checkPermission } from '../permissions'

export const reportRouter = router({
  // Generate sales report data
  getSalesReport: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        groupBy: z.enum(['day', 'week', 'month']).default('day'),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      const { storeId, startDate, endDate } = input

      // Get orders in date range
      const orders = await ctx.prisma.order.findMany({
        where: {
          storeId,
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
          status: {
            in: ['PROCESSING', 'COMPLETED'],
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  categoryId: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      })

      // Calculate totals
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
      const totalOrders = orders.length
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Group by date
      const salesByDate: Record<string, { date: string; revenue: number; orders: number }> = {}
      orders.forEach((order) => {
        const dateKey = new Date(order.createdAt).toISOString().split('T')[0]
        if (!salesByDate[dateKey]) {
          salesByDate[dateKey] = { date: dateKey, revenue: 0, orders: 0 }
        }
        salesByDate[dateKey].revenue += order.total
        salesByDate[dateKey].orders += 1
      })

      // Group by product
      const salesByProduct: Record<string, { productId: string; name: string; revenue: number; quantity: number }> = {}
      orders.forEach((order) => {
        order.items.forEach((item) => {
          if (!item.product) return
          const productId = item.product.id
          if (!salesByProduct[productId]) {
            salesByProduct[productId] = {
              productId,
              name: item.product.name,
              revenue: 0,
              quantity: 0,
            }
          }
          salesByProduct[productId].revenue += item.total
          salesByProduct[productId].quantity += item.quantity
        })
      })

      // Get categories
      const categories = await ctx.prisma.category.findMany({
        where: { storeId },
        select: { id: true, name: true },
      })

      // Group by category
      const salesByCategory: Record<string, { categoryId: string; name: string; revenue: number; quantity: number }> = {}
      orders.forEach((order) => {
        order.items.forEach((item) => {
          if (!item.product?.categoryId) return
          const categoryId = item.product.categoryId
          const category = categories.find((c) => c.id === categoryId)
          if (!salesByCategory[categoryId]) {
            salesByCategory[categoryId] = {
              categoryId,
              name: category?.name || 'Non catégorisé',
              revenue: 0,
              quantity: 0,
            }
          }
          salesByCategory[categoryId].revenue += item.total
          salesByCategory[categoryId].quantity += item.quantity
        })
      })

      return {
        summary: {
          totalRevenue,
          totalOrders,
          averageOrderValue,
          startDate,
          endDate,
        },
        byDate: Object.values(salesByDate).sort((a, b) => a.date.localeCompare(b.date)),
        byProduct: Object.values(salesByProduct).sort((a, b) => b.revenue - a.revenue),
        byCategory: Object.values(salesByCategory).sort((a, b) => b.revenue - a.revenue),
        orders: orders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          date: order.createdAt,
          total: order.total,
          status: order.status,
          itemCount: order.items.length,
        })),
      }
    }),

  // Generate customer report data
  getCustomerReport: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      const { storeId, startDate, endDate } = input

      // Get all customers
      const customers = await ctx.prisma.customer.findMany({
        where: { storeId },
        include: {
          orders: {
            where: {
              status: {
                in: ['PROCESSING', 'COMPLETED'],
              },
            },
            select: {
              id: true,
              total: true,
              createdAt: true,
            },
          },
        },
      })

      // New customers in period
      const newCustomers = customers.filter(
        (c) => new Date(c.createdAt) >= new Date(startDate) && new Date(c.createdAt) <= new Date(endDate)
      )

      // Calculate LTV and segments
      const customerData = customers.map((customer) => {
        const totalSpent = customer.orders.reduce((sum, order) => sum + order.total, 0)
        const orderCount = customer.orders.length
        const avgOrderValue = orderCount > 0 ? totalSpent / orderCount : 0
        const lastOrder = customer.orders.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0]

        return {
          id: customer.id,
          email: customer.email,
          name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email,
          createdAt: customer.createdAt,
          totalSpent,
          orderCount,
          avgOrderValue,
          lastOrderDate: lastOrder?.createdAt || null,
        }
      })

      // Segment customers
      const segments = {
        vip: customerData.filter((c) => c.totalSpent >= 500).length,
        regular: customerData.filter((c) => c.totalSpent >= 100 && c.totalSpent < 500).length,
        occasional: customerData.filter((c) => c.totalSpent > 0 && c.totalSpent < 100).length,
        inactive: customerData.filter((c) => c.totalSpent === 0).length,
      }

      // Retention analysis
      const customersWithMultipleOrders = customerData.filter((c) => c.orderCount > 1).length
      const retentionRate = customerData.length > 0
        ? (customersWithMultipleOrders / customerData.length) * 100
        : 0

      // Average LTV
      const totalLTV = customerData.reduce((sum, c) => sum + c.totalSpent, 0)
      const avgLTV = customerData.length > 0 ? totalLTV / customerData.length : 0

      return {
        summary: {
          totalCustomers: customers.length,
          newCustomers: newCustomers.length,
          retentionRate,
          avgLTV,
          startDate,
          endDate,
        },
        segments,
        topCustomers: customerData
          .sort((a, b) => b.totalSpent - a.totalSpent)
          .slice(0, 20),
        newCustomersList: newCustomers.map((c) => ({
          id: c.id,
          email: c.email,
          name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email,
          createdAt: c.createdAt,
        })),
      }
    }),

  // Generate product performance report
  getProductReport: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      const { storeId, startDate, endDate } = input

      // Get all products
      const products = await ctx.prisma.product.findMany({
        where: { storeId },
        include: {
          category: {
            select: { name: true },
          },
        },
      })

      // Get order items in period
      const orderItems = await ctx.prisma.orderItem.findMany({
        where: {
          order: {
            storeId,
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
            status: {
              in: ['PROCESSING', 'COMPLETED'],
            },
          },
        },
        include: {
          order: {
            select: { createdAt: true },
          },
        },
      })

      // Calculate product performance
      const productPerformance = products.map((product) => {
        const items = orderItems.filter((item) => item.productId === product.id)
        const revenue = items.reduce((sum, item) => sum + item.total, 0)
        const quantity = items.reduce((sum, item) => sum + item.quantity, 0)
        const margin = product.cost
          ? ((product.price - product.cost) / product.price) * 100
          : null

        return {
          id: product.id,
          name: product.name,
          sku: product.sku || '',
          category: product.category?.name || 'Non catégorisé',
          price: product.price,
          cost: product.cost,
          revenue,
          quantity,
          margin,
          stock: product.quantity,
          status: product.status,
        }
      })

      // Low stock products
      const lowStock = productPerformance.filter(
        (p) => p.stock <= 10 && p.status === 'ACTIVE'
      )

      // Top performers
      const topByRevenue = [...productPerformance]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)

      const topByQuantity = [...productPerformance]
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10)

      // Zero sales
      const zeroSales = productPerformance.filter(
        (p) => p.quantity === 0 && p.status === 'ACTIVE'
      )

      return {
        summary: {
          totalProducts: products.length,
          activeProducts: products.filter((p) => p.status === 'ACTIVE').length,
          totalRevenue: productPerformance.reduce((sum, p) => sum + p.revenue, 0),
          totalQuantitySold: productPerformance.reduce((sum, p) => sum + p.quantity, 0),
          startDate,
          endDate,
        },
        products: productPerformance.sort((a, b) => b.revenue - a.revenue),
        topByRevenue,
        topByQuantity,
        lowStock,
        zeroSales,
      }
    }),

  // Get available report types
  getReportTypes: protectedProcedure
    .input(z.object({ storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      await checkPermission(ctx, input.storeId, PERMISSIONS.ANALYTICS_VIEW)

      return [
        {
          id: 'sales',
          name: 'Rapport de ventes',
          description: 'Ventes détaillées par date, produit et catégorie',
        },
        {
          id: 'customers',
          name: 'Rapport clients',
          description: 'Acquisition, rétention et valeur client',
        },
        {
          id: 'products',
          name: 'Rapport produits',
          description: 'Performances, stock et marges',
        },
      ]
    }),
})
