import { prisma } from '@/lib/prisma'

/**
 * Platform-level permissions for superadmin users
 * These are different from store-level permissions
 */
export const PLATFORM_PERMISSIONS = {
  // Stores management
  'stores.view': 'Voir les boutiques',
  'stores.create': 'Creer des boutiques',
  'stores.edit': 'Modifier les boutiques',
  'stores.delete': 'Supprimer des boutiques',
  'stores.suspend': 'Suspendre des boutiques',

  // Users management
  'users.view': 'Voir les utilisateurs',
  'users.create': 'Creer des utilisateurs',
  'users.edit': 'Modifier les utilisateurs',
  'users.delete': 'Supprimer des utilisateurs',
  'users.suspend': 'Suspendre des utilisateurs',

  // Orders management
  'orders.view': 'Voir les commandes',
  'orders.manage': 'Gerer les commandes',
  'orders.refund': 'Rembourser',

  // Analytics
  'analytics.view': 'Voir les analytics',
  'analytics.export': 'Exporter les donnees',

  // Settings
  'settings.view': 'Voir les parametres',
  'settings.edit': 'Modifier les parametres',

  // Support
  'support.view': 'Voir le support',
  'support.manage': 'Gerer le support',

  // Appeals
  'appeals.view': 'Voir les appels',
  'appeals.manage': 'Gerer les appels',
} as const

export type PlatformPermission = keyof typeof PLATFORM_PERMISSIONS

// Cache for user permissions (1 minute TTL)
const permissionsCache = new Map<string, { permissions: string[]; timestamp: number }>()
const PERMISSIONS_CACHE_TTL = 60 * 1000 // 1 minute

/**
 * Get platform permissions for a user
 * Super admins have all permissions by default, but can be restricted via roles
 */
export async function getPlatformPermissions(userId: string): Promise<string[]> {
  const now = Date.now()
  const cached = permissionsCache.get(userId)

  if (cached && now - cached.timestamp < PERMISSIONS_CACHE_TTL) {
    return cached.permissions
  }

  try {
    // Get user's platform role assignments
    const assignments = await prisma.platformRoleAssignment.findMany({
      where: { userId },
      include: {
        role: {
          select: { permissions: true, isSystem: true, name: true },
        },
      },
    })

    // If user has no role assignments, check if they're a super admin
    // Super admins without specific roles get all permissions
    if (assignments.length === 0) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      })

      if (user?.role === 'SUPER_ADMIN') {
        // Super admin without specific role gets all permissions
        const allPermissions = Object.keys(PLATFORM_PERMISSIONS)
        permissionsCache.set(userId, { permissions: allPermissions, timestamp: now })
        return allPermissions
      }

      // Not a super admin and no roles = no permissions
      permissionsCache.set(userId, { permissions: [], timestamp: now })
      return []
    }

    // Collect all permissions from assigned roles
    const permissions = new Set<string>()
    for (const assignment of assignments) {
      for (const permission of assignment.role.permissions) {
        permissions.add(permission)
      }
    }

    const permissionsList = Array.from(permissions)
    permissionsCache.set(userId, { permissions: permissionsList, timestamp: now })
    return permissionsList
  } catch (error) {
    console.error('Error fetching platform permissions:', error)
    return []
  }
}

/**
 * Check if user has a specific platform permission
 */
export async function hasPlatformPermission(
  userId: string,
  permission: PlatformPermission
): Promise<boolean> {
  const permissions = await getPlatformPermissions(userId)
  return permissions.includes(permission)
}

/**
 * Check if user has all of the specified permissions
 */
export async function hasAllPlatformPermissions(
  userId: string,
  requiredPermissions: PlatformPermission[]
): Promise<boolean> {
  const permissions = await getPlatformPermissions(userId)
  return requiredPermissions.every((p) => permissions.includes(p))
}

/**
 * Check if user has any of the specified permissions
 */
export async function hasAnyPlatformPermission(
  userId: string,
  requiredPermissions: PlatformPermission[]
): Promise<boolean> {
  const permissions = await getPlatformPermissions(userId)
  return requiredPermissions.some((p) => permissions.includes(p))
}

/**
 * Invalidate permissions cache for a user
 * Call this when user's roles change
 */
export function invalidatePlatformPermissionsCache(userId: string): void {
  permissionsCache.delete(userId)
}

/**
 * Invalidate all permissions cache
 * Call this when roles are modified
 */
export function invalidateAllPlatformPermissionsCache(): void {
  permissionsCache.clear()
}

/**
 * Initialize default platform roles if they don't exist
 */
export async function initializePlatformRoles(): Promise<void> {
  const existingRoles = await prisma.platformRole.count()

  if (existingRoles > 0) {
    return // Roles already exist
  }

  // Create default Super Admin role with all permissions
  await prisma.platformRole.create({
    data: {
      name: 'Super Admin',
      description: 'Acces complet a toutes les fonctionnalites de la plateforme',
      permissions: Object.keys(PLATFORM_PERMISSIONS),
      isSystem: true,
    },
  })

  // Create Moderator role
  await prisma.platformRole.create({
    data: {
      name: 'Moderateur',
      description: 'Gestion des utilisateurs et du contenu',
      permissions: [
        'stores.view',
        'users.view',
        'users.suspend',
        'orders.view',
        'support.view',
        'support.manage',
        'appeals.view',
        'appeals.manage',
      ],
      isSystem: true,
    },
  })

  // Create Support role
  await prisma.platformRole.create({
    data: {
      name: 'Support',
      description: 'Equipe de support client',
      permissions: [
        'stores.view',
        'users.view',
        'orders.view',
        'support.view',
        'support.manage',
      ],
      isSystem: true,
    },
  })

  // Create Analyst role
  await prisma.platformRole.create({
    data: {
      name: 'Analyste',
      description: 'Acces aux donnees et rapports',
      permissions: [
        'stores.view',
        'users.view',
        'orders.view',
        'analytics.view',
        'analytics.export',
      ],
      isSystem: true,
    },
  })

  console.log('Default platform roles initialized')
}
