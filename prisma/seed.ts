import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const hashedPassword = await hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@goldenera.com' },
    update: {},
    create: {
      email: 'admin@goldenera.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  })

  console.log('✅ Admin user created:', adminUser.email)

  // Create demo store
  const store = await prisma.store.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      id: '000000000000000000000001',
      name: 'GoldenEra Marketplace Demo Store',
      slug: 'demo',
      description: 'Boutique de démonstration GoldenEra Marketplace',
      ownerId: adminUser.id,
    },
  })

  console.log('✅ Store created:', store.name)

  // Create categories
  const electronics = await prisma.category.upsert({
    where: { storeId_slug: { storeId: store.id, slug: 'electronics' } },
    update: {},
    create: {
      storeId: store.id,
      name: 'Électronique',
      slug: 'electronics',
      description: 'Appareils et accessoires électroniques',
    },
  })

  const fashion = await prisma.category.upsert({
    where: { storeId_slug: { storeId: store.id, slug: 'fashion' } },
    update: {},
    create: {
      storeId: store.id,
      name: 'Mode',
      slug: 'fashion',
      description: 'Vêtements et accessoires de mode',
    },
  })

  const home = await prisma.category.upsert({
    where: { storeId_slug: { storeId: store.id, slug: 'home' } },
    update: {},
    create: {
      storeId: store.id,
      name: 'Maison',
      slug: 'home',
      description: 'Articles pour la maison',
    },
  })

  const beauty = await prisma.category.upsert({
    where: { storeId_slug: { storeId: store.id, slug: 'beauty' } },
    update: {},
    create: {
      storeId: store.id,
      name: 'Beauté',
      slug: 'beauty',
      description: 'Produits de beauté et cosmétiques',
    },
  })

  console.log('✅ Categories created')

  // Create demo products
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
      where: { storeId_slug: { storeId: store.id, slug: product.slug } },
      update: {},
      create: {
        ...product,
        storeId: store.id,
      },
    })
  }

  console.log(`✅ ${products.length} products created`)

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
