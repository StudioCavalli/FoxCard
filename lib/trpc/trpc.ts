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

    console.log('requirePermission middleware - input:', input)
    console.log('requirePermission middleware - storeId:', storeId)

    if (!storeId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `storeId is required for permission check. Received input: ${JSON.stringify(input)}`,
      })
    }

    // Get user's permissions for this store
    const userPermissions = await getUserPermissions(
      ctx.session.user.id,
      storeId,
      ctx.prisma
    )

    console.log('User permissions for storeId', storeId, ':', userPermissions)

    // Check if user has the required permission
    if (!userPermissions.includes(permission)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `You do not have permission: ${permission}. Your permissions: ${userPermissions.join(', ')}`,
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
