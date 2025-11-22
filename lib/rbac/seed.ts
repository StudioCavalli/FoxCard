import { PrismaClient } from '@prisma/client'
import { SYSTEM_ROLES } from './roles'

/**
 * Seeds system roles for a store
 * Should be called when a new store is created
 */
export async function seedSystemRoles(storeId: string, prisma: PrismaClient) {
  const roles = Object.values(SYSTEM_ROLES)

  const createdRoles = await Promise.all(
    roles.map(async (roleDefinition) => {
      // Check if role already exists
      const existingRole = await prisma.role.findUnique({
        where: {
          storeId_name: {
            storeId,
            name: roleDefinition.name,
          },
        },
      })

      if (existingRole) {
        return existingRole
      }

      // Create the role
      return prisma.role.create({
        data: {
          storeId,
          name: roleDefinition.name,
          description: roleDefinition.description,
          permissions: roleDefinition.permissions,
          isSystem: roleDefinition.isSystem,
        },
      })
    })
  )

  return createdRoles
}

/**
 * Assigns the Owner role to a user for a store
 * Should be called when a store is created to assign the creator as Owner
 */
export async function assignOwnerRole(
  userId: string,
  storeId: string,
  prisma: PrismaClient
) {
  // Find or create the Owner role
  let ownerRole = await prisma.role.findUnique({
    where: {
      storeId_name: {
        storeId,
        name: 'Owner',
      },
    },
  })

  if (!ownerRole) {
    // If Owner role doesn't exist, seed all system roles
    const roles = await seedSystemRoles(storeId, prisma)
    ownerRole = roles.find(r => r.name === 'Owner')!
  }

  // Check if user is already assigned to this store
  const existingStoreUser = await prisma.storeUser.findUnique({
    where: {
      userId_storeId: {
        userId,
        storeId,
      },
    },
  })

  if (existingStoreUser) {
    // Update to Owner role if different
    if (existingStoreUser.roleId !== ownerRole.id) {
      return prisma.storeUser.update({
        where: { id: existingStoreUser.id },
        data: {
          roleId: ownerRole.id,
          status: 'ACTIVE',
          acceptedAt: new Date(),
        },
      })
    }
    return existingStoreUser
  }

  // Create new StoreUser with Owner role
  return prisma.storeUser.create({
    data: {
      userId,
      storeId,
      roleId: ownerRole.id,
      status: 'ACTIVE',
      acceptedAt: new Date(),
    },
  })
}

/**
 * Get user's permissions for a specific store
 */
export async function getUserPermissions(
  userId: string,
  storeId: string,
  prisma: PrismaClient
): Promise<string[]> {
  // First check if user is SUPER_ADMIN - they have all permissions
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (user?.role === 'SUPER_ADMIN') {
    // SUPER_ADMIN has all permissions
    const { ALL_PERMISSIONS } = await import('./roles')
    return ALL_PERMISSIONS
  }

  // Check if user is the store owner
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { ownerId: true },
  })

  if (store?.ownerId === userId) {
    // Store owner has all permissions
    const { ALL_PERMISSIONS } = await import('./roles')
    return ALL_PERMISSIONS
  }

  // Check StoreUser for assigned role permissions
  const storeUser = await prisma.storeUser.findUnique({
    where: {
      userId_storeId: {
        userId,
        storeId,
      },
    },
    include: {
      role: true,
    },
  })

  if (!storeUser || storeUser.status !== 'ACTIVE') {
    return []
  }

  return storeUser.role.permissions
}

/**
 * Check if user has a specific permission in a store
 */
export async function userHasPermission(
  userId: string,
  storeId: string,
  permission: string,
  prisma: PrismaClient
): Promise<boolean> {
  const permissions = await getUserPermissions(userId, storeId, prisma)
  return permissions.includes(permission)
}

/**
 * Check if user has ANY of the required permissions
 */
export async function userHasAnyPermission(
  userId: string,
  storeId: string,
  requiredPermissions: string[],
  prisma: PrismaClient
): Promise<boolean> {
  const permissions = await getUserPermissions(userId, storeId, prisma)
  return requiredPermissions.some(permission => permissions.includes(permission))
}

/**
 * Check if user has ALL required permissions
 */
export async function userHasAllPermissions(
  userId: string,
  storeId: string,
  requiredPermissions: string[],
  prisma: PrismaClient
): Promise<boolean> {
  const permissions = await getUserPermissions(userId, storeId, prisma)
  return requiredPermissions.every(permission => permissions.includes(permission))
}
