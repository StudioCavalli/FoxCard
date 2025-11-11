import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withApiAuth, apiSuccess, apiError, ApiContext } from '@/lib/api/auth'

/**
 * GET /api/v1/orders
 * List all orders
 */
export const GET = withApiAuth(
  async (request: NextRequest, context: ApiContext) => {
    const { searchParams } = new URL(request.url)

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const skip = (page - 1) * limit

    // Filters
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('payment_status')
    const fulfillmentStatus = searchParams.get('fulfillment_status')
    const customerEmail = searchParams.get('customer_email')

    const where: any = {
      storeId: context.storeId,
    }

    if (status) {
      where.status = status
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus
    }

    if (fulfillmentStatus) {
      where.fulfillmentStatus = fulfillmentStatus
    }

    if (customerEmail) {
      where.customerEmail = customerEmail
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  images: true,
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.order.count({ where }),
    ])

    return apiSuccess({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  },
  'orders:read'
)
