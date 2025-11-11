import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withApiAuth, apiSuccess, apiError, ApiContext } from '@/lib/api/auth'

/**
 * GET /api/v1/customers/:id
 * Get a single customer by ID
 */
export const GET = withApiAuth(
  async (request: NextRequest, context: ApiContext) => {
    const id = request.url.split('/').pop()

    if (!id) {
      return apiError('Customer ID is required', 400)
    }

    const customer = await prisma.customer.findFirst({
      where: {
        id,
        storeId: context.storeId,
      },
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    })

    if (!customer) {
      return apiError('Customer not found', 404)
    }

    return apiSuccess({ data: customer })
  },
  'customers:read'
)
