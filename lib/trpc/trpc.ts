import { initTRPC, TRPCError } from '@trpc/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import superjson from 'superjson'
import type { Session } from 'next-auth'
import type { PrismaClient } from '@prisma/client'
import { getUserPermissions } from '@/lib/rbac/seed'

export type TRPCContext = {
  session: Session | null
  prisma: PrismaClient
}

export const createTRPCContext = async (): Promise<TRPCContext> => {
  const session = await getServerSession(authOptions)

  return {
    session,
    prisma,
  }
}

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  if (ctx.session.user.role !== 'ADMIN' && ctx.session.user.role !== 'SUPER_ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

export const superAdminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' })
  }
  if (ctx.session.user.role !== 'SUPER_ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Super admin access required' })
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

/**
 * Permission-based middleware
 * Usage:
 * - requirePermission('products.create') - requires a single permission
 * - requirePermissions(['products.create', 'products.update']) - requires ALL permissions
 * - requireAnyPermission(['products.create', 'products.update']) - requires ANY permission
 *
 * The input must contain a storeId field for permission checking
 */
export const requirePermission = (permission: string) =>
  protectedProcedure.use(async ({ ctx, next, input }) => {
    const storeId = (input as any)?.storeId

    if (!storeId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'storeId is required for permission check',
      })
    }

    // Get user's permissions for this store
    const userPermissions = await getUserPermissions(
      ctx.session.user.id,
      storeId,
      ctx.prisma
    )

    // Check if user has the required permission
    if (!userPermissions.includes(permission)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `You do not have permission: ${permission}`,
      })
    }

    return next({
      ctx: {
        ...ctx,
        storeId,
        permissions: userPermissions,
      },
    })
  })

export const requirePermissions = (permissions: string[]) =>
  protectedProcedure.use(async ({ ctx, next, input }) => {
    const storeId = (input as any)?.storeId

    if (!storeId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'storeId is required for permission check',
      })
    }

    // Get user's permissions for this store
    const userPermissions = await getUserPermissions(
      ctx.session.user.id,
      storeId,
      ctx.prisma
    )

    // Check if user has ALL required permissions
    const missingPermissions = permissions.filter(
      permission => !userPermissions.includes(permission)
    )

    if (missingPermissions.length > 0) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Missing permissions: ${missingPermissions.join(', ')}`,
      })
    }

    return next({
      ctx: {
        ...ctx,
        storeId,
        permissions: userPermissions,
      },
    })
  })

export const requireAnyPermission = (permissions: string[]) =>
  protectedProcedure.use(async ({ ctx, next, input }) => {
    const storeId = (input as any)?.storeId

    if (!storeId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'storeId is required for permission check',
      })
    }

    // Get user's permissions for this store
    const userPermissions = await getUserPermissions(
      ctx.session.user.id,
      storeId,
      ctx.prisma
    )

    // Check if user has ANY of the required permissions
    const hasPermission = permissions.some(permission =>
      userPermissions.includes(permission)
    )

    if (!hasPermission) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `You need at least one of these permissions: ${permissions.join(', ')}`,
      })
    }

    return next({
      ctx: {
        ...ctx,
        storeId,
        permissions: userPermissions,
      },
    })
  })

/**
 * Store access middleware
 * Verifies that the user has access to the specified store either as:
 * 1. The store owner (ownerId)
 * 2. A store member with ACTIVE status (via StoreUser)
 *
 * The input must contain a storeId field for verification
 */
export const requireStoreAccess = protectedProcedure.use(async ({ ctx, next, input }) => {
  const storeId = (input as any)?.storeId

  if (!storeId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'storeId is required for store access check',
    })
  }

  // Check if store exists
  const store = await ctx.prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true, ownerId: true },
  })

  if (!store) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Store not found',
    })
  }

  // Check if user is the store owner
  if (store.ownerId === ctx.session.user.id) {
    return next({
      ctx: {
        ...ctx,
        storeId,
        isStoreOwner: true,
      },
    })
  }

  // Check if user has access via StoreUser with ACTIVE status
  const storeUser = await ctx.prisma.storeUser.findUnique({
    where: {
      userId_storeId: {
        userId: ctx.session.user.id,
        storeId: storeId,
      },
    },
    select: { status: true },
  })

  if (!storeUser || storeUser.status !== 'ACTIVE') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have access to this store',
    })
  }

  return next({
    ctx: {
      ...ctx,
      storeId,
      isStoreOwner: false,
    },
  })
})
