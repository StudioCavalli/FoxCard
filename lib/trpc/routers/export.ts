import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { Parser } from 'json2csv'
import { TRPCError } from '@trpc/server'

export const exportRouter = router({
  // Export products to CSV
  exportProductsCSV: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        filters: z.object({
          categoryId: z.string().optional(),
          status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).optional(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const products = await ctx.prisma.product.findMany({
        where: {
          storeId: input.storeId,
          ...(input.filters?.categoryId && { categoryId: input.filters.categoryId }),
          ...(input.filters?.status && { status: input.filters.status }),
        },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      // Transform data for CSV
      const data = products.map((p) => ({
        ID: p.id,
        SKU: p.sku,
        Nom: p.name,
        Description: p.description,
        Prix: p.price,
        'Prix Comparatif': p.compareAtPrice || '',
        Stock: p.quantity,
        Catégorie: p.category?.name || '',
        Statut: p.status,
        'Date de Création': p.createdAt.toISOString(),
      }))

      // Convert to CSV
      const parser = new Parser()
      const csv = parser.parse(data)

      return {
        data: csv,
        filename: `products-${Date.now()}.csv`,
        mimeType: 'text/csv',
      }
    }),

  // Export products to JSON
  exportProductsJSON: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        filters: z.object({
          categoryId: z.string().optional(),
          status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).optional(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const products = await ctx.prisma.product.findMany({
        where: {
          storeId: input.storeId,
          ...(input.filters?.categoryId && { categoryId: input.filters.categoryId }),
          ...(input.filters?.status && { status: input.filters.status }),
        },
        include: {
          category: true,
          variants: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return {
        data: JSON.stringify(products, null, 2),
        filename: `products-${Date.now()}.json`,
        mimeType: 'application/json',
      }
    }),

  // Export orders to CSV
  exportOrdersCSV: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        filters: z.object({
          status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED']).optional(),
          dateFrom: z.date().optional(),
          dateTo: z.date().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const orders = await ctx.prisma.order.findMany({
        where: {
          storeId: input.storeId,
          ...(input.filters?.status && { status: input.filters.status }),
          ...(input.filters?.dateFrom && {
            createdAt: { gte: input.filters.dateFrom },
          }),
          ...(input.filters?.dateTo && {
            createdAt: { lte: input.filters.dateTo },
          }),
        },
        include: {
          items: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      // Transform data for CSV
      const data = orders.map((o) => ({
        'Numéro de Commande': o.orderNumber,
        Client: o.customerName || o.customerEmail,
        Email: o.customerEmail,
        'Nombre d\'Articles': o.items.length,
        'Sous-total': o.subtotal,
        Total: o.total,
        Statut: o.status,
        'Statut Paiement': o.paymentStatus,
        'Date de Création': o.createdAt.toISOString(),
      }))

      // Convert to CSV
      const parser = new Parser()
      const csv = parser.parse(data)

      return {
        data: csv,
        filename: `orders-${Date.now()}.csv`,
        mimeType: 'text/csv',
      }
    }),

  // Export orders to JSON
  exportOrdersJSON: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
        filters: z.object({
          status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED']).optional(),
          dateFrom: z.date().optional(),
          dateTo: z.date().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const orders = await ctx.prisma.order.findMany({
        where: {
          storeId: input.storeId,
          ...(input.filters?.status && { status: input.filters.status }),
          ...(input.filters?.dateFrom && {
            createdAt: { gte: input.filters.dateFrom },
          }),
          ...(input.filters?.dateTo && {
            createdAt: { lte: input.filters.dateTo },
          }),
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return {
        data: JSON.stringify(orders, null, 2),
        filename: `orders-${Date.now()}.json`,
        mimeType: 'application/json',
      }
    }),

  // Export customers to CSV
  exportCustomersCSV: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const customers = await ctx.prisma.customer.findMany({
        where: {
          storeId: input.storeId,
        },
        include: {
          _count: {
            select: {
              orders: true,
            },
          },
          orders: {
            where: {
              storeId: input.storeId,
            },
            select: {
              total: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      // Transform data for CSV
      const data = customers.map((c) => {
        const totalSpent = c.orders.reduce((sum, order) => sum + order.total, 0)
        const fullName = [c.firstName, c.lastName].filter(Boolean).join(' ')
        return {
          ID: c.id,
          Nom: fullName || '',
          Email: c.email,
          Téléphone: c.phone || '',
          'Nombre de Commandes': c._count.orders,
          'Total Dépensé': totalSpent.toFixed(2),
          'Date d\'Inscription': c.createdAt.toISOString(),
        }
      })

      // Convert to CSV
      const parser = new Parser()
      const csv = parser.parse(data)

      return {
        data: csv,
        filename: `customers-${Date.now()}.csv`,
        mimeType: 'text/csv',
      }
    }),

  // Export customers to JSON
  exportCustomersJSON: adminProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const customers = await ctx.prisma.customer.findMany({
        where: {
          storeId: input.storeId,
        },
        include: {
          orders: {
            where: {
              storeId: input.storeId,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return {
        data: JSON.stringify(customers, null, 2),
        filename: `customers-${Date.now()}.json`,
        mimeType: 'application/json',
      }
    }),
})
