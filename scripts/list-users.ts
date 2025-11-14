/**
 * Script to list all users in the database
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📋 Listing all users...\n')

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  if (users.length === 0) {
    console.log('❌ No users found in database')
    return
  }

  console.log(`Found ${users.length} user(s):\n`)

  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name || 'No name'} (${user.email})`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Created: ${user.createdAt.toISOString()}`)
    console.log('')
  })

  // Also list stores
  console.log('\n📦 Listing all stores...\n')

  const stores = await prisma.store.findMany({
    select: {
      id: true,
      name: true,
      ownerId: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  if (stores.length === 0) {
    console.log('❌ No stores found in database')
    return
  }

  console.log(`Found ${stores.length} store(s):\n`)

  stores.forEach((store, index) => {
    console.log(`${index + 1}. ${store.name}`)
    console.log(`   ID: ${store.id}`)
    console.log(`   Owner ID: ${store.ownerId || 'None'}`)
    console.log(`   Created: ${store.createdAt.toISOString()}`)
    console.log('')
  })

  console.log('\n💡 To initialize RBAC, run:')
  console.log('npx ts-node scripts/init-rbac.ts <userId> <storeId>')
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
