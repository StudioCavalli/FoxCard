import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating Merchant accounts for stores...')

  const hashedPassword = await hash('merchant123', 10)

  // Merchant configurations - one per store
  const merchantsConfig = [
    {
      email: 'grocery@foxcard.com',
      name: 'Marc Dupont',
      storeSlug: 'grocery-store',
      storeName: 'FreshMart Grocery',
    },
    {
      email: 'fashion@foxcard.com',
      name: 'Claire Martin',
      storeSlug: 'fashion-boutique',
      storeName: 'Urban Style Clothing',
    },
    {
      email: 'petshop@foxcard.com',
      name: 'Thomas Bernard',
      storeSlug: 'pet-paradise',
      storeName: 'Pet Paradise',
    },
    {
      email: 'hardware@foxcard.com',
      name: 'Philippe Moreau',
      storeSlug: 'hardware-depot',
      storeName: 'Hardware Depot',
    },
    {
      email: 'electronics@foxcard.com',
      name: 'Sophie Laurent',
      storeSlug: 'tech-zone',
      storeName: 'TechZone Electronics',
    },
  ]

  for (const merchantConfig of merchantsConfig) {
    console.log(`\nCreating merchant: ${merchantConfig.name}`)

    // Create or update the merchant user
    // Using ADMIN role - store ownership is determined by Store.ownerId
    const merchant = await prisma.user.upsert({
      where: { email: merchantConfig.email },
      update: {
        name: merchantConfig.name,
        role: 'ADMIN',
      },
      create: {
        email: merchantConfig.email,
        name: merchantConfig.name,
        password: hashedPassword,
        role: 'ADMIN',
      },
    })

    console.log(`  Email: ${merchantConfig.email}`)
    console.log(`  Role: ADMIN (Store Owner)`)

    // Find the store and update ownership
    const store = await prisma.store.findUnique({
      where: { slug: merchantConfig.storeSlug },
    })

    if (store) {
      await prisma.store.update({
        where: { id: store.id },
        data: { ownerId: merchant.id },
      })
      console.log(`  Store: ${merchantConfig.storeName} (ownership transferred)`)
    } else {
      console.log(`  Warning: Store ${merchantConfig.storeSlug} not found`)
    }
  }

  console.log('\n All merchant accounts created successfully!')
  console.log('\n Summary:')
  console.log('  ┌────────────────────────────┬─────────────────────────┬───────────────────────────┐')
  console.log('  │ Merchant                   │ Email                   │ Store                     │')
  console.log('  ├────────────────────────────┼─────────────────────────┼───────────────────────────┤')
  console.log('  │ Marc Dupont                │ grocery@foxcard.com     │ FreshMart Grocery         │')
  console.log('  │ Claire Martin              │ fashion@foxcard.com     │ Urban Style Clothing      │')
  console.log('  │ Thomas Bernard             │ petshop@foxcard.com     │ Pet Paradise              │')
  console.log('  │ Philippe Moreau            │ hardware@foxcard.com    │ Hardware Depot            │')
  console.log('  │ Sophie Laurent             │ electronics@foxcard.com │ TechZone Electronics      │')
  console.log('  └────────────────────────────┴─────────────────────────┴───────────────────────────┘')
  console.log('\n Password for all merchants: merchant123')
  console.log('\n Login Behavior:')
  console.log('  - Merchants will be redirected to /merchant (their store dashboard)')
  console.log('  - SuperAdmins will be redirected to /superadmin')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
