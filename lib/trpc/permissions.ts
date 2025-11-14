import { TRPCError } from '@trpc/server'
import type { Session } from 'next-auth'
import type { PrismaClient } from '@prisma/client'
import { getUserPermissions } from '@/lib/rbac/seed'

export type PermissionContext = {
  session: Session
  prisma: PrismaClient
}

/**
 * Helper function to check if a user has a specific permission for a store
 * Must be called inside a procedure after input is parsed
 */
export async function checkPermission(
  ctx: PermissionContext,
  storeId: string,
  permission: string
): Promise<void> {
  const userPermissions = await getUserPermissions(
    ctx.session.user.id,
    storeId,
    ctx.prisma
  )

  if (!userPermissions.includes(permission)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `You do not have permission: ${permission}`,
    })
  }
}

/**
 * Helper function to check if a user has ALL specified permissions
 */
export async function checkPermissions(
  ctx: PermissionContext,
  storeId: string,
  permissions: string[]
): Promise<void> {
  const userPermissions = await getUserPermissions(
    ctx.session.user.id,
    storeId,
    ctx.prisma
  )

  const missingPermissions = permissions.filter(
    (permission) => !userPermissions.includes(permission)
  )

  if (missingPermissions.length > 0) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `Missing permissions: ${missingPermissions.join(', ')}`,
    })
  }
}

/**
 * Helper function to check if a user has ANY of the specified permissions
 */
export async function checkAnyPermission(
  ctx: PermissionContext,
  storeId: string,
  permissions: string[]
): Promise<void> {
  const userPermissions = await getUserPermissions(
    ctx.session.user.id,
    storeId,
    ctx.prisma
  )

  const hasPermission = permissions.some((permission) =>
    userPermissions.includes(permission)
  )

  if (!hasPermission) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `You need at least one of these permissions: ${permissions.join(', ')}`,
    })
  }
}
