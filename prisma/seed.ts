import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  const adminPassword = await hash('admin123', 10)
  const merchantPassword = await hash('merchant123', 10)

  // ============================================
  // SUPER ADMIN
  // ============================================
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@foxcard.com' },
    update: { password: adminPassword, role: 'SUPER_ADMIN' },
    create: {
      email: 'admin@foxcard.com',
      name: 'Super Admin',
      password: adminPassword,
      role: 'SUPER_ADMIN',
    },
  })
  console.log('✅ Super Admin created:', superAdmin.email)

  // ============================================
  // MERCHANT ACCOUNTS + STORES
  // ============================================
  const merchants = [
    {
      email: 'admin@techzone.com',
      name: 'TechZone Admin',
      store: {
        name: 'TechZone',
        slug: 'techzone',
        domain: 'techzone.foxcard.local',
        description: 'Your premium electronics destination',
        commerceType: 'ELECTRONICS' as const,
      },
    },
    {
      email: 'admin@fashionhub.com',
      name: 'FashionHub Admin',
      store: {
        name: 'FashionHub',
        slug: 'fashionhub',
        domain: 'fashionhub.foxcard.local',
        description: 'Trendy fashion for everyone',
        commerceType: 'FASHION' as const,
      },
    },
    {
      email: 'admin@grandhotel.com',
      name: 'Grand Hotel Admin',
      store: {
        name: 'Grand Hotel',
        slug: 'grand-hotel',
        domain: 'grandhotel.foxcard.local',
        description: 'Luxury hotel & accommodations',
        commerceType: 'HOTEL' as const,
      },
    },
    {
      email: 'admin@labelletable.com',
      name: 'La Belle Table Admin',
      store: {
        name: 'La Belle Table',
        slug: 'la-belle-table',
        domain: 'labelletable.foxcard.local',
        description: 'Fine dining restaurant',
        commerceType: 'RESTAURANT' as const,
      },
    },
    {
      email: 'admin@worldtraveler.com',
      name: 'World Traveler Admin',
      store: {
        name: 'World Traveler',
        slug: 'world-traveler',
        domain: 'worldtraveler.foxcard.local',
        description: 'Travel agency & tour operator',
        commerceType: 'TRAVEL' as const,
      },
    },
  ]

  for (const m of merchants) {
    const user = await prisma.user.upsert({
      where: { email: m.email },
      update: { password: merchantPassword },
      create: {
        email: m.email,
        name: m.name,
        password: merchantPassword,
        role: 'ADMIN',
      },
    })

    await prisma.store.upsert({
      where: { slug: m.store.slug },
      update: {},
      create: {
        name: m.store.name,
        slug: m.store.slug,
        domain: m.store.domain,
        description: m.store.description,
        commerceType: m.store.commerceType,
        ownerId: user.id,
      },
    })

    console.log(`✅ Merchant ${m.email} + store "${m.store.name}" (${m.store.commerceType})`)
  }

  // ============================================
  // DEMO STORE (General) owned by Super Admin
  // ============================================
  const demoStore = await prisma.store.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'FoxCard Demo Store',
      slug: 'demo',
      domain: 'demo.foxcard.local',
      description: 'Boutique de démonstration FoxCard',
      ownerId: superAdmin.id,
      commerceType: 'GENERAL',
    },
  })
  console.log('✅ Demo store created:', demoStore.name)

  // ============================================
  // CATEGORIES for demo store
  // ============================================
  const electronics = await prisma.category.upsert({
    where: { storeId_slug: { storeId: demoStore.id, slug: 'electronics' } },
    update: {},
    create: {
      storeId: demoStore.id,
      name: 'Électronique',
      slug: 'electronics',
      description: 'Appareils et accessoires électroniques',
    },
  })

  const fashion = await prisma.category.upsert({
    where: { storeId_slug: { storeId: demoStore.id, slug: 'fashion' } },
    update: {},
    create: {
      storeId: demoStore.id,
      name: 'Mode',
      slug: 'fashion',
      description: 'Vêtements et accessoires de mode',
    },
  })

  const beauty = await prisma.category.upsert({
    where: { storeId_slug: { storeId: demoStore.id, slug: 'beauty' } },
    update: {},
    create: {
      storeId: demoStore.id,
      name: 'Beauté',
      slug: 'beauty',
      description: 'Produits de beauté et cosmétiques',
    },
  })

  await prisma.category.upsert({
    where: { storeId_slug: { storeId: demoStore.id, slug: 'home' } },
    update: {},
    create: {
      storeId: demoStore.id,
      name: 'Maison',
      slug: 'home',
      description: 'Articles pour la maison',
    },
  })

  console.log('✅ Categories created')

  // ============================================
  // PRODUCTS for demo store
  // ============================================
  const products = [
    {
      name: 'Écouteurs Sans Fil Premium',
      slug: 'ecouteurs-sans-fil-premium',
      description: 'Écouteurs bluetooth de haute qualité avec réduction de bruit active',
      price: 149.99,
      compareAtPrice: 199.99,
      categoryId: electronics.id,
      quantity: 50,
      images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df'],
      status: 'ACTIVE' as const,
      featured: true,
      sku: 'EAR-001',
    },
    {
      name: 'Sac à Main Élégant',
      slug: 'sac-a-main-elegant',
      description: 'Sac à main en cuir véritable, design moderne et intemporel',
      price: 89.99,
      compareAtPrice: 129.99,
      categoryId: fashion.id,
      quantity: 30,
      images: ['https://images.unsplash.com/photo-1591561954557-26941169b49e'],
      status: 'ACTIVE' as const,
      featured: true,
      sku: 'BAG-001',
    },
    {
      name: 'Chaussures à Talon Rouge',
      slug: 'chaussures-talon-rouge',
      description: 'Talons hauts rouges, parfaits pour toute occasion spéciale',
      price: 79.99,
      categoryId: fashion.id,
      quantity: 25,
      images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2'],
      status: 'ACTIVE' as const,
      featured: true,
      sku: 'SHOE-001',
    },
    {
      name: 'Lunettes de Soleil',
      slug: 'lunettes-de-soleil',
      description: 'Lunettes de soleil tendance avec protection UV',
      price: 59.99,
      compareAtPrice: 89.99,
      categoryId: fashion.id,
      quantity: 40,
      images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f'],
      status: 'ACTIVE' as const,
      sku: 'SUN-001',
    },
    {
      name: 'Sweat à Capuche Confort',
      slug: 'sweat-capuche-confort',
      description: 'Sweat à capuche ultra confortable en coton bio',
      price: 45.99,
      categoryId: fashion.id,
      quantity: 60,
      images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7'],
      status: 'ACTIVE' as const,
      sku: 'HOOD-001',
    },
    {
      name: 'T-Shirt Basique',
      slug: 't-shirt-basique',
      description: 'T-shirt essentiel pour toute garde-robe',
      price: 19.99,
      categoryId: fashion.id,
      quantity: 100,
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab'],
      status: 'ACTIVE' as const,
      featured: true,
      sku: 'TEE-001',
    },
    {
      name: 'Sérum Visage Anti-Âge',
      slug: 'serum-visage-anti-age',
      description: 'Sérum hydratant anti-âge pour une peau éclatante',
      price: 34.99,
      categoryId: beauty.id,
      quantity: 45,
      images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be'],
      status: 'ACTIVE' as const,
      sku: 'SER-001',
    },
    {
      name: 'Kit Soins Beauté',
      slug: 'kit-soins-beaute',
      description: 'Kit complet de soins pour le visage',
      price: 69.99,
      compareAtPrice: 99.99,
      categoryId: beauty.id,
      quantity: 20,
      images: ['https://images.unsplash.com/photo-1596755389378-c31d21fd1273'],
      status: 'ACTIVE' as const,
      featured: true,
      sku: 'KIT-001',
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { storeId_slug: { storeId: demoStore.id, slug: product.slug } },
      update: {},
      create: {
        ...product,
        storeId: demoStore.id,
      },
    })
  }

  console.log(`✅ ${products.length} products created`)

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📋 Login credentials:')
  console.log('  Super Admin:  admin@foxcard.com / admin123')
  console.log('  Merchants:    admin@techzone.com / merchant123')
  console.log('                admin@fashionhub.com / merchant123')
  console.log('                admin@grandhotel.com / merchant123')
  console.log('                admin@labelletable.com / merchant123')
  console.log('                admin@worldtraveler.com / merchant123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
