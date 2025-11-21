/**
 * Script to fix store status for existing stores
 * Stores created before the suspension system have null status
 * This script sets them to ACTIVE
 *
 * Run with: npx tsx scripts/fix-store-status.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Checking store status...\n')

  // Get all stores
  const allStores = await prisma.store.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
    },
  })

  console.log(`Total stores: ${allStores.length}\n`)

  // Group by status
  const byStatus: Record<string, any[]> = {}
  allStores.forEach((store) => {
    const status = store.status || 'NULL'
    if (!byStatus[status]) byStatus[status] = []
    byStatus[status].push(store)
  })

  console.log('Stores by status:')
  Object.entries(byStatus).forEach(([status, stores]) => {
    console.log(`  ${status}: ${stores.length}`)
    stores.forEach((store) => {
      console.log(`    - ${store.name} (${store.slug})`)
    })
  })

  // If there are stores with null/undefined status, use raw MongoDB to update them
  const storesNeedingUpdate = allStores.filter(s => !s.status)

  if (storesNeedingUpdate.length > 0) {
    console.log(`\n⚠️  Found ${storesNeedingUpdate.length} stores without status. Updating via raw query...`)

    // Use raw MongoDB command to update stores missing status field
    // @ts-ignore - MongoDB specific
    const db = prisma.$runCommandRaw

    // Update all stores that don't have a status field
    await prisma.$runCommandRaw({
      update: 'Store',
      updates: [
        {
          q: { status: { $exists: false } },
          u: { $set: { status: 'ACTIVE' } },
          multi: true,
        },
        {
          q: { status: null },
          u: { $set: { status: 'ACTIVE' } },
          multi: true,
        },
      ],
    })

    console.log('✅ Updated stores to ACTIVE status')
  } else {
    console.log('\n✅ All stores already have a valid status!')
  }

  // Verify final state
  const finalStores = await prisma.store.findMany({
    select: { status: true },
  })

  const finalByStatus: Record<string, number> = {}
  finalStores.forEach((store) => {
    const status = store.status || 'NULL'
    finalByStatus[status] = (finalByStatus[status] || 0) + 1
  })

  console.log('\n📊 Final Summary:')
  Object.entries(finalByStatus).forEach(([status, count]) => {
    console.log(`   ${status}: ${count}`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
