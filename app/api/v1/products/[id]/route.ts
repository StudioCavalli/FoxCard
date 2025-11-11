import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withApiAuth, apiSuccess, apiError, ApiContext } from '@/lib/api/auth'

/**
 * GET /api/v1/products/:id
 * Get a single product by ID
 */
export const GET = withApiAuth(
  async (request: NextRequest, context: ApiContext) => {
    const id = request.url.split('/').pop()

    if (!id) {
      return apiError('Product ID is required', 400)
    }

    const product = await prisma.product.findFirst({
      where: {
        id,
        storeId: context.storeId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: true,
      },
    })

    if (!product) {
      return apiError('Product not found', 404)
    }

    return apiSuccess({ data: product })
  },
  'products:read'
)
