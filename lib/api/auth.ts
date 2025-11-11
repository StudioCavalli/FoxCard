import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export interface ApiContext {
  storeId: string
  apiKey: {
    id: string
    scopes: string[]
  }
}

/**
 * Verify API key and return store context
 */
export async function verifyApiKey(request: NextRequest): Promise<ApiContext | null> {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const apiKey = authHeader.substring(7) // Remove 'Bearer ' prefix

  // Hash the API key to compare with stored hash
  const hashedKey = crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex')

  const apiKeyRecord = await prisma.apiKey.findUnique({
    where: {
      key: hashedKey,
    },
    include: {
      store: true,
    },
  })

  if (!apiKeyRecord || !apiKeyRecord.isActive) {
    return null
  }

  // Check expiration
  if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
    return null
  }

  // Update last used timestamp
  await prisma.apiKey.update({
    where: { id: apiKeyRecord.id },
    data: { lastUsedAt: new Date() },
  })

  return {
    storeId: apiKeyRecord.storeId,
    apiKey: {
      id: apiKeyRecord.id,
      scopes: apiKeyRecord.scopes,
    },
  }
}

/**
 * Check if API key has required scope
 */
export function hasScope(context: ApiContext, requiredScope: string): boolean {
  return context.apiKey.scopes.includes(requiredScope) || context.apiKey.scopes.includes('*')
}

/**
 * Create API error response
 */
export function apiError(message: string, status: number = 400) {
  return NextResponse.json(
    {
      error: {
        message,
        status,
      },
    },
    { status }
  )
}

/**
 * Create API success response
 */
export function apiSuccess(data: any, status: number = 200) {
  return NextResponse.json(data, { status })
}

/**
 * Middleware wrapper for API routes with authentication
 */
export function withApiAuth(
  handler: (request: NextRequest, context: ApiContext) => Promise<NextResponse>,
  requiredScope?: string
) {
  return async (request: NextRequest) => {
    // Verify API key
    const context = await verifyApiKey(request)

    if (!context) {
      return apiError('Invalid or missing API key', 401)
    }

    // Check scope if required
    if (requiredScope && !hasScope(context, requiredScope)) {
      return apiError('Insufficient permissions', 403)
    }

    try {
      return await handler(request, context)
    } catch (error) {
      console.error('API Error:', error)
      return apiError(
        'Internal server error',
        500
      )
    }
  }
}
