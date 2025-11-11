import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withApiAuth, apiSuccess, apiError, ApiContext } from '@/lib/api/auth'

/**
 * GET /api/v1/orders/:id
 * Get a single order by ID
 */
export const GET = withApiAuth(
  async (request: NextRequest, context: ApiContext) => {
    const id = request.url.split('/').pop()

    if (!id) {
      return apiError('Order ID is required', 400)
    }

    const order = await prisma.order.findFirst({
      where: {
        id,
        storeId: context.storeId,
      },
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
            phone: true,
          },
        },
      },
    })

    if (!order) {
      return apiError('Order not found', 404)
    }

    return apiSuccess({ data: order })
  },
  'orders:read'
)
