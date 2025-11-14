/**
 * Script to initialize RBAC roles and assign Owner role to user
 *
 * Usage:
 * npx ts-node scripts/init-rbac.ts <userId> <storeId>
 *
 * Example:
 * npx ts-node scripts/init-rbac.ts 673c4d0f4d4d7d5b8f9b8c1a 000000000000000000000001
 */

import { PrismaClient } from '@prisma/client'
import { seedSystemRoles, assignOwnerRole } from '../lib/rbac/seed.js'

const prisma = new PrismaClient()

async function main() {
  const userId = process.argv[2]
  const storeId = process.argv[3]

  if (!userId || !storeId) {
    console.error('Usage: npx ts-node scripts/init-rbac.ts <userId> <storeId>')
    console.error('Example: npx ts-node scripts/init-rbac.ts 673c4d0f4d4d7d5b8f9b8c1a 000000000000000000000001')
    process.exit(1)
  }

  console.log('🔧 Initializing RBAC...')
  console.log(`User ID: ${userId}`)
  console.log(`Store ID: ${storeId}`)

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  })

  if (!user) {
    console.error(`❌ User with ID ${userId} not found`)
    process.exit(1)
  }

  console.log(`✅ Found user: ${user.name || user.email}`)

  // Check if store exists
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true, name: true },
  })

  if (!store) {
    console.error(`❌ Store with ID ${storeId} not found`)
    process.exit(1)
  }

  console.log(`✅ Found store: ${store.name}`)

  // Seed system roles
  console.log('\n📦 Seeding system roles...')
  const roles = await seedSystemRoles(storeId, prisma)
  console.log(`✅ Created ${roles.length} system roles:`)
  roles.forEach((role) => {
    console.log(`   - ${role.name} (${role.permissions.length} permissions)`)
  })

  // Assign Owner role to user
  console.log('\n👤 Assigning Owner role to user...')
  const storeUser = await assignOwnerRole(userId, storeId, prisma)
  console.log(`✅ User ${user.email} is now Owner of store ${store.name}`)

  // Display user's permissions
  const ownerRole = roles.find((r) => r.name === 'Owner')
  if (ownerRole) {
    console.log(`\n🔑 Owner permissions (${ownerRole.permissions.length}):`)
    ownerRole.permissions.forEach((perm) => {
      console.log(`   - ${perm}`)
    })
  }

  console.log('\n✨ RBAC initialization complete!')
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
