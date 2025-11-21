import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating SuperAdmin users...')

  const hashedPassword = await hash('superadmin123', 10)

  // SuperAdmin configurations with different specializations
  const superAdminsConfig = [
    {
      email: 'platform-owner@foxcard.com',
      name: 'Pierre Dupont',
      role: 'SUPER_ADMIN' as const,
      description: 'Platform Owner - Full access to all features',
      permissions: {
        stores: ['read', 'write', 'delete', 'suspend'],
        users: ['read', 'write', 'delete', 'impersonate'],
        orders: ['read', 'write', 'refund'],
        settings: ['read', 'write'],
        analytics: ['read', 'export'],
        support: ['read', 'write', 'assign'],
        finance: ['read', 'write', 'payout'],
        roles: ['read', 'write', 'assign'],
      },
    },
    {
      email: 'tech-admin@foxcard.com',
      name: 'Marie Laurent',
      role: 'SUPER_ADMIN' as const,
      description: 'Technical Admin - System configuration and monitoring',
      permissions: {
        stores: ['read', 'write'],
        users: ['read', 'write'],
        orders: ['read'],
        settings: ['read', 'write'],
        analytics: ['read', 'export'],
        support: ['read', 'write'],
        finance: ['read'],
        roles: ['read'],
      },
    },
    {
      email: 'support-lead@foxcard.com',
      name: 'Jean Martin',
      role: 'SUPER_ADMIN' as const,
      description: 'Support Lead - Customer support and ticket management',
      permissions: {
        stores: ['read'],
        users: ['read'],
        orders: ['read', 'write'],
        settings: ['read'],
        analytics: ['read'],
        support: ['read', 'write', 'assign', 'escalate'],
        finance: ['read'],
        roles: ['read'],
      },
    },
    {
      email: 'finance-admin@foxcard.com',
      name: 'Sophie Bernard',
      role: 'SUPER_ADMIN' as const,
      description: 'Finance Admin - Revenue, payouts, and financial reports',
      permissions: {
        stores: ['read'],
        users: ['read'],
        orders: ['read', 'refund'],
        settings: ['read'],
        analytics: ['read', 'export'],
        support: ['read'],
        finance: ['read', 'write', 'payout', 'report'],
        roles: ['read'],
      },
    },
    {
      email: 'content-moderator@foxcard.com',
      name: 'Lucas Petit',
      role: 'SUPER_ADMIN' as const,
      description: 'Content Moderator - Store and product review',
      permissions: {
        stores: ['read', 'write', 'suspend'],
        users: ['read'],
        orders: ['read'],
        settings: ['read'],
        analytics: ['read'],
        support: ['read', 'write'],
        finance: ['read'],
        roles: ['read'],
      },
    },
  ]

  for (const adminConfig of superAdminsConfig) {
    console.log(`\nCreating SuperAdmin: ${adminConfig.name}`)

    const user = await prisma.user.upsert({
      where: { email: adminConfig.email },
      update: {
        name: adminConfig.name,
        role: adminConfig.role,
      },
      create: {
        email: adminConfig.email,
        name: adminConfig.name,
        password: hashedPassword,
        role: adminConfig.role,
      },
    })

    console.log(`  Email: ${adminConfig.email}`)
    console.log(`  Role: ${adminConfig.description}`)
    console.log(`  Permissions: ${Object.keys(adminConfig.permissions).join(', ')}`)
  }

  console.log('\n All SuperAdmin users created successfully!')
  console.log('\n Summary:')
  console.log('  1. Pierre Dupont (platform-owner@foxcard.com) - Platform Owner')
  console.log('  2. Marie Laurent (tech-admin@foxcard.com) - Technical Admin')
  console.log('  3. Jean Martin (support-lead@foxcard.com) - Support Lead')
  console.log('  4. Sophie Bernard (finance-admin@foxcard.com) - Finance Admin')
  console.log('  5. Lucas Petit (content-moderator@foxcard.com) - Content Moderator')
  console.log('\n Password for all: superadmin123')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
