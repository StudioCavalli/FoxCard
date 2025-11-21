import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🏪 Creating test stores...')

  // Get or create admin user
  const hashedPassword = await hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@foxcard.com' },
    update: {},
    create: {
      email: 'admin@foxcard.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  })

  // Store configurations
  const storesConfig = [
    {
      slug: 'grocery-store',
      domain: 'freshmart.foxcard.local',
      name: 'FreshMart Grocery',
      tagline: 'Fresh products delivered to your door',
      description: 'Your neighborhood online grocery store with fresh produce, dairy, meats, and pantry essentials. We source locally whenever possible.',
      logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop',
      bannerImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&h=400&fit=crop',
      categories: [
        { name: 'Fruits & Légumes', slug: 'fruits-legumes' },
        { name: 'Produits Laitiers', slug: 'produits-laitiers' },
        { name: 'Viandes & Poissons', slug: 'viandes-poissons' },
        { name: 'Épicerie', slug: 'epicerie' },
        { name: 'Boissons', slug: 'boissons' },
      ],
      products: [
        { name: 'Pommes Bio', slug: 'pommes-bio', price: 399, category: 'fruits-legumes', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500' },
        { name: 'Lait Frais', slug: 'lait-frais', price: 189, category: 'produits-laitiers', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500' },
        { name: 'Poulet Fermier', slug: 'poulet-fermier', price: 1299, category: 'viandes-poissons', image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500' },
        { name: 'Pâtes Italiennes', slug: 'pates-italiennes', price: 249, category: 'epicerie', image: 'https://images.unsplash.com/photo-1551462147-37885acc36f1?w=500' },
        { name: 'Jus d\'Orange Pressé', slug: 'jus-orange-presse', price: 349, category: 'boissons', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500' },
      ],
    },
    {
      slug: 'fashion-boutique',
      domain: 'urbanstyle.foxcard.local',
      name: 'Urban Style Clothing',
      tagline: 'Your style, your way',
      description: 'Contemporary fashion for the modern individual. Discover our curated collection of clothing and accessories.',
      logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop',
      bannerImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=400&fit=crop',
      categories: [
        { name: 'Homme', slug: 'homme' },
        { name: 'Femme', slug: 'femme' },
        { name: 'Chaussures', slug: 'chaussures' },
        { name: 'Accessoires', slug: 'accessoires' },
      ],
      products: [
        { name: 'T-Shirt Classique', slug: 't-shirt-classique', price: 2999, category: 'homme', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500' },
        { name: 'Robe d\'Été', slug: 'robe-ete', price: 5999, category: 'femme', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500' },
        { name: 'Sneakers Urban', slug: 'sneakers-urban', price: 8999, category: 'chaussures', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500' },
        { name: 'Sac à Main Cuir', slug: 'sac-main-cuir', price: 12999, category: 'accessoires', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500' },
      ],
    },
    {
      slug: 'pet-paradise',
      domain: 'petparadise.foxcard.local',
      name: 'Pet Paradise',
      tagline: 'Everything for your furry friends',
      description: 'Premium pet supplies, food, and accessories. Because your pets deserve the best!',
      logo: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop',
      bannerImage: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1920&h=400&fit=crop',
      categories: [
        { name: 'Chiens', slug: 'chiens' },
        { name: 'Chats', slug: 'chats' },
        { name: 'Alimentation', slug: 'alimentation' },
        { name: 'Accessoires', slug: 'accessoires-animaux' },
      ],
      products: [
        { name: 'Croquettes Premium Chien', slug: 'croquettes-premium-chien', price: 4999, category: 'chiens', image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=500' },
        { name: 'Arbre à Chat Deluxe', slug: 'arbre-chat-deluxe', price: 8999, category: 'chats', image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=500' },
        { name: 'Laisse Rétractable', slug: 'laisse-retractable', price: 2499, category: 'accessoires-animaux', image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500' },
        { name: 'Jouet Interactif Chat', slug: 'jouet-interactif-chat', price: 1999, category: 'chats', image: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=500' },
      ],
    },
    {
      slug: 'hardware-depot',
      domain: 'hardwaredepot.foxcard.local',
      name: 'Hardware Depot',
      tagline: 'Build it right, build it with us',
      description: 'Professional-grade tools, building materials, and hardware supplies for contractors and DIY enthusiasts.',
      logo: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=200&h=200&fit=crop',
      bannerImage: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1920&h=400&fit=crop',
      categories: [
        { name: 'Outillage', slug: 'outillage' },
        { name: 'Quincaillerie', slug: 'quincaillerie' },
        { name: 'Peinture', slug: 'peinture' },
        { name: 'Plomberie', slug: 'plomberie' },
        { name: 'Électricité', slug: 'electricite' },
      ],
      products: [
        { name: 'Perceuse Sans Fil Pro', slug: 'perceuse-sans-fil-pro', price: 14999, category: 'outillage', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500' },
        { name: 'Kit Visserie 500pcs', slug: 'kit-visserie-500', price: 2999, category: 'quincaillerie', image: 'https://images.unsplash.com/photo-1586864387789-628af9feed72?w=500' },
        { name: 'Peinture Blanche 10L', slug: 'peinture-blanche-10l', price: 4999, category: 'peinture', image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=500' },
        { name: 'Robinet Mitigeur', slug: 'robinet-mitigeur', price: 7999, category: 'plomberie', image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500' },
      ],
    },
    {
      slug: 'tech-zone',
      domain: 'techzone.foxcard.local',
      name: 'TechZone Electronics',
      tagline: 'Your gateway to the digital world',
      description: 'The latest in consumer electronics, computers, smartphones, and smart home devices.',
      logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop',
      bannerImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&h=400&fit=crop',
      categories: [
        { name: 'Smartphones', slug: 'smartphones' },
        { name: 'Ordinateurs', slug: 'ordinateurs' },
        { name: 'Audio', slug: 'audio' },
        { name: 'Gaming', slug: 'gaming' },
        { name: 'Smart Home', slug: 'smart-home' },
      ],
      products: [
        { name: 'Smartphone Pro Max', slug: 'smartphone-pro-max', price: 99999, category: 'smartphones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500' },
        { name: 'Laptop Ultrabook 15"', slug: 'laptop-ultrabook-15', price: 129999, category: 'ordinateurs', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500' },
        { name: 'Casque Bluetooth ANC', slug: 'casque-bluetooth-anc', price: 24999, category: 'audio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' },
        { name: 'Manette Gaming Pro', slug: 'manette-gaming-pro', price: 6999, category: 'gaming', image: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=500' },
        { name: 'Ampoule Connectée', slug: 'ampoule-connectee', price: 1999, category: 'smart-home', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500' },
      ],
    },
  ]

  for (const storeConfig of storesConfig) {
    console.log(`\n🏪 Creating store: ${storeConfig.name}`)

    // Create store
    const store = await prisma.store.upsert({
      where: { slug: storeConfig.slug },
      update: {
        name: storeConfig.name,
        tagline: storeConfig.tagline,
        description: storeConfig.description,
        logo: storeConfig.logo,
        bannerImage: storeConfig.bannerImage,
        domain: storeConfig.domain,
      },
      create: {
        name: storeConfig.name,
        slug: storeConfig.slug,
        domain: storeConfig.domain,
        tagline: storeConfig.tagline,
        description: storeConfig.description,
        logo: storeConfig.logo,
        bannerImage: storeConfig.bannerImage,
        ownerId: adminUser.id,
      },
    })

    console.log(`  ✅ Store created: ${store.name} (${store.slug})`)

    // Create categories
    const categoryMap: Record<string, string> = {}
    for (const cat of storeConfig.categories) {
      const category = await prisma.category.upsert({
        where: { storeId_slug: { storeId: store.id, slug: cat.slug } },
        update: { name: cat.name },
        create: {
          storeId: store.id,
          name: cat.name,
          slug: cat.slug,
        },
      })
      categoryMap[cat.slug] = category.id
    }
    console.log(`  ✅ ${storeConfig.categories.length} categories created`)

    // Create products
    for (const prod of storeConfig.products) {
      await prisma.product.upsert({
        where: { storeId_slug: { storeId: store.id, slug: prod.slug } },
        update: {
          name: prod.name,
          price: prod.price,
          images: [prod.image],
          thumbnail: prod.image,
        },
        create: {
          storeId: store.id,
          name: prod.name,
          slug: prod.slug,
          description: `${prod.name} - Produit de qualité disponible chez ${storeConfig.name}`,
          price: prod.price,
          quantity: Math.floor(Math.random() * 100) + 10,
          images: [prod.image],
          thumbnail: prod.image,
          status: 'ACTIVE',
          featured: Math.random() > 0.5,
          sku: `${storeConfig.slug.substring(0, 3).toUpperCase()}-${prod.slug.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
          categoryId: categoryMap[prod.category],
        },
      })
    }
    console.log(`  ✅ ${storeConfig.products.length} products created`)
  }

  console.log('\n🎉 All test stores created successfully!')
  console.log('\n📋 Summary:')
  console.log('  - FreshMart Grocery (grocery-store)')
  console.log('  - Urban Style Clothing (fashion-boutique)')
  console.log('  - Pet Paradise (pet-paradise)')
  console.log('  - Hardware Depot (hardware-depot)')
  console.log('  - TechZone Electronics (tech-zone)')
  console.log('\n🔐 Login: admin@foxcard.com / admin123')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
