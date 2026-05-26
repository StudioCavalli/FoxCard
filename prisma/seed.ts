import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  const adminPassword = await hash('admin123', 10)
  const merchantPassword = await hash('merchant123', 10)

  // ============================================
  // SECTION 1: SUPER ADMIN
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
  // SECTION 2: MERCHANT ACCOUNTS + STORES
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
        tagline: 'Innovation at your fingertips',
        bannerImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80',
        story: 'TechZone was founded with the vision of making cutting-edge technology accessible to everyone. We curate the finest electronics from top brands worldwide, offering everything from smartphones to gaming peripherals. Our expert team tests every product to ensure quality and performance.',
        publicEmail: 'contact@techzone.com',
        publicPhone: '+421 2 1234 5678',
        countries: ['SK', 'CZ', 'AT', 'DE', 'PL'],
        rating: 4.6,
        reviewsCount: 87,
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
        tagline: 'Style that speaks for you',
        bannerImage: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80',
        story: 'FashionHub is a Parisian fashion house bringing you the latest trends from the runways of Europe. We believe that fashion is a form of self-expression, and everyone deserves access to high-quality, stylish clothing. Each piece in our collection is carefully selected for its craftsmanship and design.',
        publicEmail: 'bonjour@fashionhub.com',
        publicPhone: '+33 1 42 86 55 00',
        countries: ['FR', 'BE', 'LU', 'CH', 'DE'],
        rating: 4.8,
        reviewsCount: 142,
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
        tagline: 'Where elegance meets comfort',
        bannerImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
        story: 'The Grand Hotel Vienna is a historic luxury hotel nestled in the heart of the Austrian capital. With over a century of hospitality excellence, we offer an unforgettable experience combining classic Viennese charm with modern comforts. Our rooms overlook the city\'s iconic architecture and our concierge team ensures every stay is perfect.',
        publicEmail: 'reservations@grandhotel.com',
        publicPhone: '+43 1 515 800',
        countries: ['AT', 'DE', 'CH'],
        rating: 4.7,
        reviewsCount: 63,
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
        tagline: 'Gastronomie lyonnaise raffinee',
        bannerImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
        story: 'La Belle Table is a Michelin-recommended restaurant located in the gastronomic capital of France, Lyon. Our chef combines traditional Lyonnaise cuisine with modern techniques, sourcing ingredients from local producers. Every dish tells a story of the region\'s rich culinary heritage.',
        publicEmail: 'reservation@labelletable.com',
        publicPhone: '+33 4 78 00 00 00',
        countries: ['FR'],
        rating: 4.9,
        reviewsCount: 118,
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
        tagline: 'Your journey starts here',
        bannerImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80',
        story: 'World Traveler is a boutique travel agency based in Barcelona, specializing in curated European travel experiences. From weekend city breaks to extended island-hopping cruises, we design every itinerary with passion and local expertise. Our team of seasoned travelers ensures authentic, unforgettable adventures.',
        publicEmail: 'info@worldtraveler.com',
        publicPhone: '+34 93 123 45 67',
        countries: ['ES', 'FR', 'IT', 'GR', 'AT', 'CH', 'DE'],
        rating: 4.5,
        reviewsCount: 54,
      },
    },
  ]

  const storeMap: Record<string, string> = {}

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

    const store = await prisma.store.upsert({
      where: { slug: m.store.slug },
      update: {
        tagline: m.store.tagline,
        bannerImage: m.store.bannerImage,
        story: m.store.story,
        publicEmail: m.store.publicEmail,
        publicPhone: m.store.publicPhone,
        countries: m.store.countries,
        rating: m.store.rating,
        reviewsCount: m.store.reviewsCount,
      },
      create: {
        name: m.store.name,
        slug: m.store.slug,
        domain: m.store.domain,
        description: m.store.description,
        commerceType: m.store.commerceType,
        ownerId: user.id,
        tagline: m.store.tagline,
        bannerImage: m.store.bannerImage,
        story: m.store.story,
        publicEmail: m.store.publicEmail,
        publicPhone: m.store.publicPhone,
        countries: m.store.countries,
        rating: m.store.rating,
        reviewsCount: m.store.reviewsCount,
      },
    })

    storeMap[m.store.slug] = store.id
    console.log(`✅ Merchant ${m.email} + store "${m.store.name}" (${m.store.commerceType})`)
  }

  // ============================================
  // SECTION 3: DEMO STORE (General) owned by Super Admin
  // ============================================
  const demoStore = await prisma.store.upsert({
    where: { slug: 'demo' },
    update: {
      tagline: 'Discover the power of FoxCard',
      bannerImage: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&q=80',
      story: 'The FoxCard Demo Store showcases everything our platform can do. Browse through a variety of products across different categories and experience the seamless shopping experience that FoxCard delivers. This is your playground to explore all features.',
      publicEmail: 'demo@foxcard.com',
      publicPhone: '+420 2 1234 5678',
      countries: ['CZ', 'SK', 'DE', 'AT', 'PL'],
      rating: 4.4,
      reviewsCount: 35,
    },
    create: {
      name: 'FoxCard Demo Store',
      slug: 'demo',
      domain: 'demo.foxcard.local',
      description: 'Boutique de demonstration FoxCard',
      ownerId: superAdmin.id,
      commerceType: 'GENERAL',
      tagline: 'Discover the power of FoxCard',
      bannerImage: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&q=80',
      story: 'The FoxCard Demo Store showcases everything our platform can do. Browse through a variety of products across different categories and experience the seamless shopping experience that FoxCard delivers. This is your playground to explore all features.',
      publicEmail: 'demo@foxcard.com',
      publicPhone: '+420 2 1234 5678',
      countries: ['CZ', 'SK', 'DE', 'AT', 'PL'],
      rating: 4.4,
      reviewsCount: 35,
    },
  })
  storeMap['demo'] = demoStore.id
  console.log('✅ Demo store created:', demoStore.name)

  // ============================================
  // SECTION 4: STORE LOCATIONS (for /explore map)
  // ============================================
  console.log('\n📍 Creating store locations...')

  const storeLocations = [
    {
      storeSlug: 'techzone',
      type: 'PHYSICAL_STORE' as const,
      name: 'TechZone Bratislava',
      description: 'Our flagship electronics store in the heart of Bratislava',
      street: 'Obchodna 64',
      city: 'Bratislava',
      postalCode: '811 06',
      country: 'SK',
      latitude: 48.1486,
      longitude: 17.1077,
      phone: '+421 2 1234 5678',
      email: 'bratislava@techzone.com',
      isPrimary: true,
      isPublic: true,
    },
    {
      storeSlug: 'fashionhub',
      type: 'PHYSICAL_STORE' as const,
      name: 'FashionHub Paris',
      description: 'Our boutique on the famous Rue du Faubourg Saint-Honore',
      street: '55 Rue du Faubourg Saint-Honore',
      city: 'Paris',
      postalCode: '75008',
      country: 'FR',
      latitude: 48.8566,
      longitude: 2.3522,
      phone: '+33 1 42 86 55 00',
      email: 'paris@fashionhub.com',
      isPrimary: true,
      isPublic: true,
    },
    {
      storeSlug: 'grand-hotel',
      type: 'PHYSICAL_STORE' as const,
      name: 'Grand Hotel Vienna',
      description: 'Historic luxury hotel on the Ringstrasse',
      street: 'Karntner Ring 9',
      city: 'Vienna',
      postalCode: '1010',
      country: 'AT',
      latitude: 48.2082,
      longitude: 16.3738,
      phone: '+43 1 515 800',
      email: 'front.desk@grandhotel.com',
      isPrimary: true,
      isPublic: true,
    },
    {
      storeSlug: 'la-belle-table',
      type: 'PHYSICAL_STORE' as const,
      name: 'La Belle Table Lyon',
      description: 'Restaurant gastronomique au coeur du Vieux Lyon',
      street: '14 Rue du Boeuf',
      city: 'Lyon',
      postalCode: '69005',
      country: 'FR',
      latitude: 45.7640,
      longitude: 4.8357,
      phone: '+33 4 78 00 00 00',
      email: 'contact@labelletable.com',
      isPrimary: true,
      isPublic: true,
    },
    {
      storeSlug: 'world-traveler',
      type: 'PHYSICAL_STORE' as const,
      name: 'World Traveler Barcelona',
      description: 'Our travel agency on Las Ramblas',
      street: 'La Rambla 78',
      city: 'Barcelona',
      postalCode: '08002',
      country: 'ES',
      latitude: 41.3851,
      longitude: 2.1734,
      phone: '+34 93 123 45 67',
      email: 'barcelona@worldtraveler.com',
      isPrimary: true,
      isPublic: true,
    },
    {
      storeSlug: 'demo',
      type: 'PHYSICAL_STORE' as const,
      name: 'FoxCard Demo Prague',
      description: 'Our demo showroom in the historic center of Prague',
      street: 'Vaclavske namesti 1',
      city: 'Prague',
      postalCode: '110 00',
      country: 'CZ',
      latitude: 50.0755,
      longitude: 14.4378,
      phone: '+420 2 1234 5678',
      email: 'demo@foxcard.com',
      isPrimary: true,
      isPublic: true,
    },
  ]

  for (const loc of storeLocations) {
    const storeId = storeMap[loc.storeSlug]
    // Delete existing locations for this store, then create fresh
    await prisma.storeLocation.deleteMany({ where: { storeId } })
    await prisma.storeLocation.create({
      data: {
        storeId,
        type: loc.type,
        name: loc.name,
        description: loc.description,
        street: loc.street,
        city: loc.city,
        postalCode: loc.postalCode,
        country: loc.country,
        latitude: loc.latitude,
        longitude: loc.longitude,
        phone: loc.phone,
        email: loc.email,
        isPrimary: loc.isPrimary,
        isPublic: loc.isPublic,
      },
    })
    console.log(`  📍 ${loc.name} (${loc.city}, ${loc.country})`)
  }
  console.log('✅ Store locations created')

  // ============================================
  // SECTION 5: CATEGORIES FOR ALL STORES
  // ============================================
  console.log('\n📂 Creating categories...')

  // --- Demo Store Categories (existing) ---
  const demoElectronics = await prisma.category.upsert({
    where: { storeId_slug: { storeId: demoStore.id, slug: 'electronics' } },
    update: {},
    create: {
      storeId: demoStore.id,
      name: 'Electronique',
      slug: 'electronics',
      description: 'Appareils et accessoires electroniques',
    },
  })

  const demoFashion = await prisma.category.upsert({
    where: { storeId_slug: { storeId: demoStore.id, slug: 'fashion' } },
    update: {},
    create: {
      storeId: demoStore.id,
      name: 'Mode',
      slug: 'fashion',
      description: 'Vetements et accessoires de mode',
    },
  })

  const demoBeauty = await prisma.category.upsert({
    where: { storeId_slug: { storeId: demoStore.id, slug: 'beauty' } },
    update: {},
    create: {
      storeId: demoStore.id,
      name: 'Beaute',
      slug: 'beauty',
      description: 'Produits de beaute et cosmetiques',
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

  // --- TechZone Categories ---
  const tzStoreId = storeMap['techzone']
  const tzComputers = await prisma.category.upsert({
    where: { storeId_slug: { storeId: tzStoreId, slug: 'computers' } },
    update: {},
    create: { storeId: tzStoreId, name: 'Computers & Laptops', slug: 'computers', description: 'Laptops, desktops and accessories' },
  })
  const tzMobile = await prisma.category.upsert({
    where: { storeId_slug: { storeId: tzStoreId, slug: 'mobile' } },
    update: {},
    create: { storeId: tzStoreId, name: 'Mobile & Wearables', slug: 'mobile', description: 'Smartphones, smartwatches and tablets' },
  })
  const tzAudio = await prisma.category.upsert({
    where: { storeId_slug: { storeId: tzStoreId, slug: 'audio' } },
    update: {},
    create: { storeId: tzStoreId, name: 'Audio', slug: 'audio', description: 'Headphones, speakers and audio equipment' },
  })
  const tzGaming = await prisma.category.upsert({
    where: { storeId_slug: { storeId: tzStoreId, slug: 'gaming' } },
    update: {},
    create: { storeId: tzStoreId, name: 'Gaming', slug: 'gaming', description: 'Monitors, keyboards and gaming gear' },
  })

  // --- FashionHub Categories ---
  const fhStoreId = storeMap['fashionhub']
  const fhOuterwear = await prisma.category.upsert({
    where: { storeId_slug: { storeId: fhStoreId, slug: 'outerwear' } },
    update: {},
    create: { storeId: fhStoreId, name: 'Outerwear', slug: 'outerwear', description: 'Jackets, coats and overcoats' },
  })
  const fhDresses = await prisma.category.upsert({
    where: { storeId_slug: { storeId: fhStoreId, slug: 'dresses' } },
    update: {},
    create: { storeId: fhStoreId, name: 'Dresses', slug: 'dresses', description: 'Elegant dresses for every occasion' },
  })
  const fhShoes = await prisma.category.upsert({
    where: { storeId_slug: { storeId: fhStoreId, slug: 'shoes' } },
    update: {},
    create: { storeId: fhStoreId, name: 'Shoes & Sneakers', slug: 'shoes', description: 'Designer footwear and sneakers' },
  })
  const fhAccessories = await prisma.category.upsert({
    where: { storeId_slug: { storeId: fhStoreId, slug: 'accessories' } },
    update: {},
    create: { storeId: fhStoreId, name: 'Accessories', slug: 'accessories', description: 'Scarves, bags and fashion accessories' },
  })

  // --- Grand Hotel Categories ---
  const ghStoreId = storeMap['grand-hotel']
  const ghStandard = await prisma.category.upsert({
    where: { storeId_slug: { storeId: ghStoreId, slug: 'standard-rooms' } },
    update: {},
    create: { storeId: ghStoreId, name: 'Standard Rooms', slug: 'standard-rooms', description: 'Comfortable rooms for a pleasant stay' },
  })
  const ghDeluxe = await prisma.category.upsert({
    where: { storeId_slug: { storeId: ghStoreId, slug: 'deluxe-rooms' } },
    update: {},
    create: { storeId: ghStoreId, name: 'Deluxe Rooms', slug: 'deluxe-rooms', description: 'Spacious rooms with premium amenities' },
  })
  const ghSuites = await prisma.category.upsert({
    where: { storeId_slug: { storeId: ghStoreId, slug: 'suites' } },
    update: {},
    create: { storeId: ghStoreId, name: 'Suites', slug: 'suites', description: 'Luxurious suites for the discerning guest' },
  })

  // --- La Belle Table Categories ---
  const lbtStoreId = storeMap['la-belle-table']
  const lbtEntrees = await prisma.category.upsert({
    where: { storeId_slug: { storeId: lbtStoreId, slug: 'entrees' } },
    update: {},
    create: { storeId: lbtStoreId, name: 'Entrees & Soupes', slug: 'entrees', description: 'Starters and soups' },
  })
  const lbtPlats = await prisma.category.upsert({
    where: { storeId_slug: { storeId: lbtStoreId, slug: 'plats' } },
    update: {},
    create: { storeId: lbtStoreId, name: 'Plats Principaux', slug: 'plats', description: 'Main courses' },
  })
  const lbtFromages = await prisma.category.upsert({
    where: { storeId_slug: { storeId: lbtStoreId, slug: 'fromages' } },
    update: {},
    create: { storeId: lbtStoreId, name: 'Fromages', slug: 'fromages', description: 'Cheese selection' },
  })
  const lbtDesserts = await prisma.category.upsert({
    where: { storeId_slug: { storeId: lbtStoreId, slug: 'desserts' } },
    update: {},
    create: { storeId: lbtStoreId, name: 'Desserts', slug: 'desserts', description: 'Sweet endings' },
  })

  // --- World Traveler Categories ---
  const wtStoreId = storeMap['world-traveler']
  const wtCityBreaks = await prisma.category.upsert({
    where: { storeId_slug: { storeId: wtStoreId, slug: 'city-breaks' } },
    update: {},
    create: { storeId: wtStoreId, name: 'City Breaks', slug: 'city-breaks', description: 'Short getaways to iconic cities' },
  })
  const wtCruises = await prisma.category.upsert({
    where: { storeId_slug: { storeId: wtStoreId, slug: 'cruises' } },
    update: {},
    create: { storeId: wtStoreId, name: 'Cruises', slug: 'cruises', description: 'Island-hopping and sea adventures' },
  })
  const wtRetreats = await prisma.category.upsert({
    where: { storeId_slug: { storeId: wtStoreId, slug: 'retreats' } },
    update: {},
    create: { storeId: wtStoreId, name: 'Mountain Retreats', slug: 'retreats', description: 'Alpine getaways and nature escapes' },
  })

  console.log('✅ Categories created for all stores')

  // ============================================
  // SECTION 6: PRODUCTS FOR DEMO STORE (existing)
  // ============================================
  console.log('\n🛍️ Creating products...')

  const demoProducts = [
    {
      name: 'Ecouteurs Sans Fil Premium',
      slug: 'ecouteurs-sans-fil-premium',
      description: 'Ecouteurs bluetooth de haute qualite avec reduction de bruit active',
      price: 149.99,
      compareAtPrice: 199.99,
      categoryId: demoElectronics.id,
      quantity: 50,
      images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: true,
      sku: 'EAR-001',
    },
    {
      name: 'Sac a Main Elegant',
      slug: 'sac-a-main-elegant',
      description: 'Sac a main en cuir veritable, design moderne et intemporel',
      price: 89.99,
      compareAtPrice: 129.99,
      categoryId: demoFashion.id,
      quantity: 30,
      images: ['https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: true,
      sku: 'BAG-001',
    },
    {
      name: 'Chaussures a Talon Rouge',
      slug: 'chaussures-talon-rouge',
      description: 'Talons hauts rouges, parfaits pour toute occasion speciale',
      price: 79.99,
      categoryId: demoFashion.id,
      quantity: 25,
      images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80'],
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
      categoryId: demoFashion.id,
      quantity: 40,
      images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80'],
      status: 'ACTIVE' as const,
      sku: 'SUN-001',
    },
    {
      name: 'Sweat a Capuche Confort',
      slug: 'sweat-capuche-confort',
      description: 'Sweat a capuche ultra confortable en coton bio',
      price: 45.99,
      categoryId: demoFashion.id,
      quantity: 60,
      images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80'],
      status: 'ACTIVE' as const,
      sku: 'HOOD-001',
    },
    {
      name: 'T-Shirt Basique',
      slug: 't-shirt-basique',
      description: 'T-shirt essentiel pour toute garde-robe',
      price: 19.99,
      categoryId: demoFashion.id,
      quantity: 100,
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: true,
      sku: 'TEE-001',
    },
    {
      name: 'Serum Visage Anti-Age',
      slug: 'serum-visage-anti-age',
      description: 'Serum hydratant anti-age pour une peau eclatante',
      price: 34.99,
      categoryId: demoBeauty.id,
      quantity: 45,
      images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80'],
      status: 'ACTIVE' as const,
      sku: 'SER-001',
    },
    {
      name: 'Kit Soins Beaute',
      slug: 'kit-soins-beaute',
      description: 'Kit complet de soins pour le visage',
      price: 69.99,
      compareAtPrice: 99.99,
      categoryId: demoBeauty.id,
      quantity: 20,
      images: ['https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: true,
      sku: 'KIT-001',
    },
  ]

  for (const product of demoProducts) {
    await prisma.product.upsert({
      where: { storeId_slug: { storeId: demoStore.id, slug: product.slug } },
      update: {},
      create: { ...product, storeId: demoStore.id },
    })
  }
  console.log(`  ✅ Demo Store: ${demoProducts.length} products`)

  // ============================================
  // SECTION 7: TECHZONE PRODUCTS
  // ============================================
  const techzoneProducts = [
    {
      name: 'Smartphone Pro Max',
      slug: 'smartphone-pro-max',
      description: 'Flagship smartphone with 6.7" OLED display, 108MP camera, and all-day battery life. The ultimate mobile experience with 5G connectivity and AI-powered features.',
      price: 999,
      compareAtPrice: 1099,
      categoryId: tzMobile.id,
      quantity: 35,
      images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: true,
      sku: 'TZ-PHONE-001',
    },
    {
      name: 'Laptop Ultra 15"',
      slug: 'laptop-ultra-15',
      description: 'Powerful 15-inch laptop with M-series processor, 16GB RAM, and 512GB SSD. Perfect for professionals and creatives who demand performance.',
      price: 1299,
      compareAtPrice: 1499,
      categoryId: tzComputers.id,
      quantity: 20,
      images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: true,
      sku: 'TZ-LAPTOP-001',
    },
    {
      name: 'Wireless Earbuds',
      slug: 'wireless-earbuds',
      description: 'Premium true wireless earbuds with active noise cancellation, spatial audio, and 30-hour battery life with charging case.',
      price: 149,
      categoryId: tzAudio.id,
      quantity: 80,
      images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: false,
      sku: 'TZ-EARBUDS-001',
    },
    {
      name: 'Smart Watch Series 5',
      slug: 'smart-watch-series-5',
      description: 'Advanced smartwatch with health monitoring, GPS, always-on retina display, and water resistance up to 50m.',
      price: 349,
      compareAtPrice: 399,
      categoryId: tzMobile.id,
      quantity: 45,
      images: ['https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: true,
      sku: 'TZ-WATCH-001',
    },
    {
      name: '4K Gaming Monitor',
      slug: '4k-gaming-monitor',
      description: '27-inch 4K 144Hz gaming monitor with 1ms response time, HDR600, and FreeSync Premium Pro. Immerse yourself in every game.',
      price: 599,
      categoryId: tzGaming.id,
      quantity: 15,
      images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: false,
      sku: 'TZ-MONITOR-001',
    },
    {
      name: 'Mechanical Keyboard',
      slug: 'mechanical-keyboard',
      description: 'Hot-swappable mechanical keyboard with RGB backlighting, PBT keycaps, and customizable macros. Cherry MX Brown switches.',
      price: 129,
      categoryId: tzGaming.id,
      quantity: 60,
      images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: false,
      sku: 'TZ-KB-001',
    },
  ]

  for (const product of techzoneProducts) {
    await prisma.product.upsert({
      where: { storeId_slug: { storeId: tzStoreId, slug: product.slug } },
      update: {},
      create: { ...product, storeId: tzStoreId },
    })
  }
  console.log(`  ✅ TechZone: ${techzoneProducts.length} products`)

  // ============================================
  // SECTION 8: FASHIONHUB PRODUCTS
  // ============================================
  const fashionhubProducts = [
    {
      name: 'Leather Jacket',
      slug: 'leather-jacket',
      description: 'Classic leather biker jacket in supple lambskin. Timeless design with satin lining and multiple zippered pockets.',
      price: 189,
      compareAtPrice: 249,
      categoryId: fhOuterwear.id,
      quantity: 25,
      images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: true,
      sku: 'FH-JACKET-001',
    },
    {
      name: 'Summer Dress',
      slug: 'summer-dress',
      description: 'Flowing summer dress in lightweight cotton with delicate floral print. Perfect for warm-weather days and evening events.',
      price: 79,
      categoryId: fhDresses.id,
      quantity: 40,
      images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: true,
      sku: 'FH-DRESS-001',
    },
    {
      name: 'Designer Sneakers',
      slug: 'designer-sneakers',
      description: 'Premium designer sneakers combining Italian craftsmanship with modern streetwear aesthetics. Cushioned sole for all-day comfort.',
      price: 159,
      categoryId: fhShoes.id,
      quantity: 35,
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: true,
      sku: 'FH-SNEAK-001',
    },
    {
      name: 'Silk Scarf',
      slug: 'silk-scarf',
      description: 'Hand-rolled pure silk scarf with an original artistic print. Made in France, 90x90cm, a versatile accessory for any outfit.',
      price: 49,
      categoryId: fhAccessories.id,
      quantity: 50,
      images: ['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: false,
      sku: 'FH-SCARF-001',
    },
    {
      name: 'Wool Overcoat',
      slug: 'wool-overcoat',
      description: 'Elegant double-breasted wool overcoat in charcoal grey. Italian fabric, tailored fit, perfect for the colder months.',
      price: 249,
      compareAtPrice: 329,
      categoryId: fhOuterwear.id,
      quantity: 15,
      images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: false,
      sku: 'FH-COAT-001',
    },
    {
      name: 'Cashmere Sweater',
      slug: 'cashmere-sweater',
      description: 'Ultra-soft 100% cashmere crew neck sweater. Available in timeless neutral tones, this is a wardrobe essential.',
      price: 139,
      categoryId: fhOuterwear.id,
      quantity: 30,
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: true,
      sku: 'FH-SWEATER-001',
    },
  ]

  for (const product of fashionhubProducts) {
    await prisma.product.upsert({
      where: { storeId_slug: { storeId: fhStoreId, slug: product.slug } },
      update: {},
      create: { ...product, storeId: fhStoreId },
    })
  }
  console.log(`  ✅ FashionHub: ${fashionhubProducts.length} products`)

  // ============================================
  // SECTION 9: GRAND HOTEL PRODUCTS (Room types as products)
  // ============================================
  const grandHotelProducts = [
    {
      name: 'Standard Room',
      slug: 'standard-room',
      description: 'Comfortable 25m2 room with queen bed, city view, complimentary WiFi, minibar, and marble bathroom. Perfect for business travelers and couples.',
      price: 120,
      categoryId: ghStandard.id,
      quantity: 20,
      images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: false,
      sku: 'GH-STANDARD-001',
    },
    {
      name: 'Deluxe Room',
      slug: 'deluxe-room',
      description: 'Spacious 35m2 room with king bed, panoramic city view, premium bedding, Nespresso machine, and rain shower. An elevated experience.',
      price: 180,
      categoryId: ghDeluxe.id,
      quantity: 15,
      images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: true,
      sku: 'GH-DELUXE-001',
    },
    {
      name: 'Junior Suite',
      slug: 'junior-suite',
      description: 'Elegant 50m2 suite with separate living area, king bed, walk-in closet, soaking tub, and butler service. For guests who appreciate the finer things.',
      price: 260,
      categoryId: ghSuites.id,
      quantity: 8,
      images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: true,
      sku: 'GH-JUNIOR-001',
    },
    {
      name: 'Presidential Suite',
      slug: 'presidential-suite',
      description: 'Our finest 120m2 suite featuring a grand living room, private dining area, master bedroom with king bed, dressing room, and jacuzzi with Ringstrasse views.',
      price: 450,
      categoryId: ghSuites.id,
      quantity: 2,
      images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: true,
      sku: 'GH-PRESIDENTIAL-001',
    },
    {
      name: 'Family Room',
      slug: 'family-room',
      description: 'Thoughtfully designed 40m2 room with one king bed and two twin beds, family-friendly amenities, and connecting room option available.',
      price: 200,
      categoryId: ghStandard.id,
      quantity: 10,
      images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: false,
      sku: 'GH-FAMILY-001',
    },
  ]

  for (const product of grandHotelProducts) {
    await prisma.product.upsert({
      where: { storeId_slug: { storeId: ghStoreId, slug: product.slug } },
      update: {},
      create: { ...product, storeId: ghStoreId },
    })
  }
  console.log(`  ✅ Grand Hotel: ${grandHotelProducts.length} products`)

  // ============================================
  // SECTION 10: LA BELLE TABLE PRODUCTS (Menu items)
  // ============================================
  const laBelleTableProducts = [
    {
      name: 'Filet de Boeuf',
      slug: 'filet-de-boeuf',
      description: 'Filet de boeuf Charolais grille, sauce au poivre de Sarawak, gratin dauphinois et legumes de saison. Viande d\'origine francaise.',
      price: 34,
      categoryId: lbtPlats.id,
      quantity: 100,
      images: ['https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: true,
      sku: 'LBT-BOEUF-001',
    },
    {
      name: 'Risotto aux Truffes',
      slug: 'risotto-aux-truffes',
      description: 'Risotto cremeux au parmesan Reggiano 24 mois, copeaux de truffe noire du Perigord et huile de truffe. Un classique revisité.',
      price: 28,
      categoryId: lbtPlats.id,
      quantity: 100,
      images: ['https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: true,
      sku: 'LBT-RISOTTO-001',
    },
    {
      name: 'Plateau de Fromages',
      slug: 'plateau-de-fromages',
      description: 'Selection de 5 fromages affines par notre maitre fromager: Saint-Marcellin, Beaufort, Comté, Roquefort et Reblochon. Servis avec pain aux noix.',
      price: 16,
      categoryId: lbtFromages.id,
      quantity: 100,
      images: ['https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: false,
      sku: 'LBT-FROMAGE-001',
    },
    {
      name: 'Tiramisu Maison',
      slug: 'tiramisu-maison',
      description: 'Notre tiramisu signature prepare chaque jour avec du mascarpone frais, des biscuits imbibes de cafe espresso et du cacao amer.',
      price: 12,
      categoryId: lbtDesserts.id,
      quantity: 100,
      images: ['https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: true,
      sku: 'LBT-TIRAMISU-001',
    },
    {
      name: 'Salade Nicoise',
      slug: 'salade-nicoise',
      description: 'Salade composee a la nicoise: thon rouge mi-cuit, haricots verts, olives de Nice, oeufs de caille et tomates anciennes.',
      price: 18,
      categoryId: lbtEntrees.id,
      quantity: 100,
      images: ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: false,
      sku: 'LBT-SALADE-001',
    },
    {
      name: 'Soupe a l\'Oignon',
      slug: 'soupe-a-loignon',
      description: 'Soupe a l\'oignon gratinee au Gruyere, recette traditionnelle lyonnaise. Servie bouillante dans son bol en ceramique.',
      price: 10,
      categoryId: lbtEntrees.id,
      quantity: 100,
      images: ['https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: false,
      sku: 'LBT-SOUPE-001',
    },
  ]

  for (const product of laBelleTableProducts) {
    await prisma.product.upsert({
      where: { storeId_slug: { storeId: lbtStoreId, slug: product.slug } },
      update: {},
      create: { ...product, storeId: lbtStoreId },
    })
  }
  console.log(`  ✅ La Belle Table: ${laBelleTableProducts.length} products`)

  // ============================================
  // SECTION 11: WORLD TRAVELER PRODUCTS (Travel packages)
  // ============================================
  const worldTravelerProducts = [
    {
      name: 'Paris Weekend',
      slug: 'paris-weekend',
      description: '3-day/2-night Paris getaway including hotel, Eiffel Tower skip-the-line tickets, Seine river cruise, and a guided walking tour of Montmartre.',
      price: 399,
      categoryId: wtCityBreaks.id,
      quantity: 50,
      images: ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: true,
      sku: 'WT-PARIS-001',
    },
    {
      name: 'Barcelona Adventure',
      slug: 'barcelona-adventure',
      description: '4-day/3-night Barcelona experience including boutique hotel, Sagrada Familia & Park Guell tours, tapas crawl, and a day trip to Montserrat.',
      price: 549,
      categoryId: wtCityBreaks.id,
      quantity: 40,
      images: ['https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: true,
      sku: 'WT-BARCELONA-001',
    },
    {
      name: 'Vienna Classical',
      slug: 'vienna-classical',
      description: '4-day/3-night Vienna cultural package with historic hotel, Vienna State Opera tickets, Schonbrunn Palace tour, and traditional Viennese coffee house experience.',
      price: 479,
      categoryId: wtCityBreaks.id,
      quantity: 30,
      images: ['https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: false,
      sku: 'WT-VIENNA-001',
    },
    {
      name: 'Greek Islands Cruise',
      slug: 'greek-islands-cruise',
      description: '7-day cruise through the Cyclades visiting Santorini, Mykonos, Naxos, and Paros. All-inclusive with shore excursions and traditional Greek dining.',
      price: 899,
      compareAtPrice: 1099,
      categoryId: wtCruises.id,
      quantity: 20,
      images: ['https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: true,
      sku: 'WT-GREEK-001',
    },
    {
      name: 'Swiss Alps Retreat',
      slug: 'swiss-alps-retreat',
      description: '5-day/4-night Alpine retreat in Interlaken with mountain chalet accommodation, Jungfraujoch excursion, paragliding, and Swiss fondue dinner.',
      price: 699,
      categoryId: wtRetreats.id,
      quantity: 25,
      images: ['https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80'],
      status: 'ACTIVE' as const,
      featured: false,
      sku: 'WT-SWISS-001',
    },
  ]

  for (const product of worldTravelerProducts) {
    await prisma.product.upsert({
      where: { storeId_slug: { storeId: wtStoreId, slug: product.slug } },
      update: {},
      create: { ...product, storeId: wtStoreId },
    })
  }
  console.log(`  ✅ World Traveler: ${worldTravelerProducts.length} products`)

  // ============================================
  // SECTION 12: SHIPPING ZONES (physical product stores)
  // ============================================
  console.log('\n🚚 Creating shipping zones...')

  const shippingStores = [
    { slug: 'techzone', name: 'TechZone' },
    { slug: 'fashionhub', name: 'FashionHub' },
    { slug: 'demo', name: 'Demo Store' },
  ]

  for (const s of shippingStores) {
    const sId = storeMap[s.slug]
    // Delete existing shipping data for idempotency
    const existingZones = await prisma.shippingZone.findMany({ where: { storeId: sId } })
    for (const zone of existingZones) {
      await prisma.shippingRate.deleteMany({ where: { shippingZoneId: zone.id } })
    }
    await prisma.shippingZone.deleteMany({ where: { storeId: sId } })

    // Create Europe zone
    const europeZone = await prisma.shippingZone.create({
      data: {
        storeId: sId,
        name: 'Europe',
        countries: ['FR', 'DE', 'SK', 'AT', 'ES', 'CZ', 'BE', 'NL', 'IT', 'PL'],
        isActive: true,
      },
    })

    await prisma.shippingRate.create({
      data: {
        shippingZoneId: europeZone.id,
        name: 'Standard Delivery',
        price: 5.99,
        minOrderAmount: 50,
        estimatedDays: '3-5 business days',
      },
    })

    await prisma.shippingRate.create({
      data: {
        shippingZoneId: europeZone.id,
        name: 'Express Delivery',
        price: 12.99,
        estimatedDays: '1-2 business days',
      },
    })

    // Create domestic/local zone
    const domesticCountry = s.slug === 'techzone' ? ['SK'] : s.slug === 'fashionhub' ? ['FR'] : ['CZ']
    const domesticZone = await prisma.shippingZone.create({
      data: {
        storeId: sId,
        name: 'Domestic',
        countries: domesticCountry,
        isActive: true,
      },
    })

    await prisma.shippingRate.create({
      data: {
        shippingZoneId: domesticZone.id,
        name: 'Free Domestic Shipping',
        price: 0,
        minOrderAmount: 30,
        estimatedDays: '1-3 business days',
      },
    })

    console.log(`  🚚 ${s.name}: 2 zones, 3 rates`)
  }
  console.log('✅ Shipping zones created')

  // ============================================
  // SECTION 13: DISCOUNT CODES (one per store)
  // ============================================
  console.log('\n🏷️ Creating discount codes...')

  const allStoreSlugs = ['techzone', 'fashionhub', 'grand-hotel', 'la-belle-table', 'world-traveler', 'demo']

  for (const slug of allStoreSlugs) {
    const sId = storeMap[slug]
    await prisma.discountCode.upsert({
      where: { storeId_code: { storeId: sId, code: 'WELCOME10' } },
      update: {},
      create: {
        storeId: sId,
        code: 'WELCOME10',
        description: 'Welcome discount - 10% off your first order',
        type: 'PERCENTAGE',
        value: 10,
        usageLimit: 500,
        usageCount: 0,
        isActive: true,
        startsAt: new Date('2025-01-01'),
        expiresAt: new Date('2027-12-31'),
      },
    })
  }
  console.log('✅ Discount codes created (WELCOME10 for all stores)')

  // ============================================
  // SECTION 14: TAX RATES (20% EU VAT for each store)
  // ============================================
  console.log('\n💰 Creating tax rates...')

  const taxConfigs: { slug: string; countryCode: string; name: string }[] = [
    { slug: 'techzone', countryCode: 'SK', name: 'TVA Slovaquie' },
    { slug: 'fashionhub', countryCode: 'FR', name: 'TVA France' },
    { slug: 'grand-hotel', countryCode: 'AT', name: 'USt Osterreich' },
    { slug: 'la-belle-table', countryCode: 'FR', name: 'TVA France' },
    { slug: 'world-traveler', countryCode: 'ES', name: 'IVA Espana' },
    { slug: 'demo', countryCode: 'CZ', name: 'DPH Cesko' },
  ]

  for (const tc of taxConfigs) {
    const sId = storeMap[tc.slug]
    // Use deleteMany + create pattern since stateCode is nullable in compound unique
    const existingTax = await prisma.taxRate.findFirst({
      where: { storeId: sId, countryCode: tc.countryCode, stateCode: null },
    })
    if (!existingTax) {
      await prisma.taxRate.create({
        data: {
          storeId: sId,
          name: tc.name,
          countryCode: tc.countryCode,
          rate: 20,
          includedInPrice: true,
          isActive: true,
          isDefault: true,
        },
      })
    }
  }
  console.log('✅ Tax rates created (20% VAT for all stores)')

  // ============================================
  // SECTION 15: GRAND HOTEL - Room Types & Hotel Rooms
  // ============================================
  console.log('\n🏨 Creating hotel-specific data...')

  const roomTypeData = [
    {
      slug: 'standard',
      name: 'Standard Room',
      description: 'Comfortable 25m2 room with queen bed and city view',
      maxOccupancy: 2,
      maxAdults: 2,
      maxChildren: 0,
      bedConfiguration: '1 Queen',
      sizeSqm: 25,
      basePrice: 120,
      images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80'],
      rooms: ['101', '102', '103', '104', '105', '201', '202', '203'],
    },
    {
      slug: 'deluxe',
      name: 'Deluxe Room',
      description: 'Spacious 35m2 room with king bed and panoramic views',
      maxOccupancy: 2,
      maxAdults: 2,
      maxChildren: 1,
      bedConfiguration: '1 King',
      sizeSqm: 35,
      basePrice: 180,
      images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80'],
      rooms: ['301', '302', '303', '304', '305'],
    },
    {
      slug: 'junior-suite',
      name: 'Junior Suite',
      description: 'Elegant 50m2 suite with separate living area',
      maxOccupancy: 3,
      maxAdults: 2,
      maxChildren: 1,
      bedConfiguration: '1 King + 1 Sofa Bed',
      sizeSqm: 50,
      basePrice: 260,
      images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80'],
      rooms: ['401', '402', '403'],
    },
    {
      slug: 'presidential-suite',
      name: 'Presidential Suite',
      description: 'Our finest 120m2 suite with grand living room and jacuzzi',
      maxOccupancy: 4,
      maxAdults: 2,
      maxChildren: 2,
      bedConfiguration: '1 King + Living Area',
      sizeSqm: 120,
      basePrice: 450,
      images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80'],
      rooms: ['501'],
    },
    {
      slug: 'family-room',
      name: 'Family Room',
      description: 'Spacious 40m2 room designed for families',
      maxOccupancy: 4,
      maxAdults: 2,
      maxChildren: 2,
      bedConfiguration: '1 King + 2 Twin',
      sizeSqm: 40,
      basePrice: 200,
      images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80'],
      rooms: ['204', '205', '306'],
    },
  ]

  for (const rt of roomTypeData) {
    const roomType = await prisma.roomType.upsert({
      where: { storeId_slug: { storeId: ghStoreId, slug: rt.slug } },
      update: {},
      create: {
        storeId: ghStoreId,
        name: rt.name,
        slug: rt.slug,
        description: rt.description,
        maxOccupancy: rt.maxOccupancy,
        maxAdults: rt.maxAdults,
        maxChildren: rt.maxChildren,
        bedConfiguration: rt.bedConfiguration,
        sizeSqm: rt.sizeSqm,
        basePrice: rt.basePrice,
        images: rt.images,
        isActive: true,
      },
    })

    // Create hotel rooms for this room type
    for (const roomNumber of rt.rooms) {
      const floor = parseInt(roomNumber.charAt(0))
      await prisma.hotelRoom.upsert({
        where: { storeId_roomNumber: { storeId: ghStoreId, roomNumber } },
        update: {},
        create: {
          storeId: ghStoreId,
          roomTypeId: roomType.id,
          roomNumber,
          floor,
          status: 'AVAILABLE',
          isActive: true,
        },
      })
    }
    console.log(`  🏨 Room type "${rt.name}": ${rt.rooms.length} rooms`)
  }

  // Grand Hotel Opening Hours (check-in 14:00, check-out 11:00, open 24/7)
  for (let day = 0; day <= 6; day++) {
    await prisma.openingHours.upsert({
      where: { storeId_dayOfWeek: { storeId: ghStoreId, dayOfWeek: day } },
      update: {},
      create: {
        storeId: ghStoreId,
        dayOfWeek: day,
        isOpen: true,
        openTime: '00:00',
        closeTime: '23:59',
      },
    })
  }
  console.log('  🏨 Grand Hotel: Opening hours set (24/7, check-in 14:00)')
  console.log('✅ Hotel-specific data created')

  // ============================================
  // SECTION 16: LA BELLE TABLE - Restaurant-specific data
  // ============================================
  console.log('\n🍽️ Creating restaurant-specific data...')

  // Opening hours: closed Monday, lunch 12-14, dinner 19-22
  const restaurantHours = [
    { day: 0, isOpen: true, openTime: '12:00', closeTime: '14:00', secondOpenTime: '19:00', secondCloseTime: '22:00' },   // Sunday
    { day: 1, isOpen: false, openTime: null, closeTime: null, secondOpenTime: null, secondCloseTime: null },                 // Monday (closed)
    { day: 2, isOpen: true, openTime: '12:00', closeTime: '14:00', secondOpenTime: '19:00', secondCloseTime: '22:00' },   // Tuesday
    { day: 3, isOpen: true, openTime: '12:00', closeTime: '14:00', secondOpenTime: '19:00', secondCloseTime: '22:00' },   // Wednesday
    { day: 4, isOpen: true, openTime: '12:00', closeTime: '14:00', secondOpenTime: '19:00', secondCloseTime: '22:00' },   // Thursday
    { day: 5, isOpen: true, openTime: '12:00', closeTime: '14:00', secondOpenTime: '19:00', secondCloseTime: '22:30' },   // Friday
    { day: 6, isOpen: true, openTime: '12:00', closeTime: '14:30', secondOpenTime: '19:00', secondCloseTime: '22:30' },   // Saturday
  ]

  for (const h of restaurantHours) {
    await prisma.openingHours.upsert({
      where: { storeId_dayOfWeek: { storeId: lbtStoreId, dayOfWeek: h.day } },
      update: {
        isOpen: h.isOpen,
        openTime: h.openTime,
        closeTime: h.closeTime,
        secondOpenTime: h.secondOpenTime,
        secondCloseTime: h.secondCloseTime,
        lastOrderOffset: h.isOpen ? 30 : undefined,
      },
      create: {
        storeId: lbtStoreId,
        dayOfWeek: h.day,
        isOpen: h.isOpen,
        openTime: h.openTime,
        closeTime: h.closeTime,
        secondOpenTime: h.secondOpenTime,
        secondCloseTime: h.secondCloseTime,
        lastOrderOffset: h.isOpen ? 30 : undefined,
      },
    })
  }
  console.log('  🍽️ Opening hours: Tue-Sun, lunch 12-14, dinner 19-22 (closed Monday)')

  // Restaurant Tables
  const tables = [
    { tableNumber: '1', name: 'Window Table', minCapacity: 2, maxCapacity: 4, isOutdoor: false, isVIP: false },
    { tableNumber: '2', name: 'Corner Booth', minCapacity: 2, maxCapacity: 6, isOutdoor: false, isVIP: true },
    { tableNumber: '3', name: 'Garden Table', minCapacity: 2, maxCapacity: 4, isOutdoor: true, isVIP: false },
    { tableNumber: '4', name: 'Bar Seating', minCapacity: 1, maxCapacity: 2, isOutdoor: false, isVIP: false },
    { tableNumber: '5', name: 'Round Table', minCapacity: 4, maxCapacity: 8, isOutdoor: false, isVIP: false },
    { tableNumber: '6', name: 'Terrace', minCapacity: 2, maxCapacity: 4, isOutdoor: true, isVIP: false },
  ]

  for (const t of tables) {
    await prisma.restaurantTable.upsert({
      where: { storeId_tableNumber: { storeId: lbtStoreId, tableNumber: t.tableNumber } },
      update: {},
      create: {
        storeId: lbtStoreId,
        tableNumber: t.tableNumber,
        name: t.name,
        minCapacity: t.minCapacity,
        maxCapacity: t.maxCapacity,
        isOutdoor: t.isOutdoor,
        isVIP: t.isVIP,
        isAccessible: t.tableNumber === '1',
        shape: t.tableNumber === '5' ? 'ROUND' : 'RECTANGLE',
        status: 'AVAILABLE',
        isActive: true,
        acceptsReservations: true,
      },
    })
  }
  console.log(`  🍽️ ${tables.length} restaurant tables created`)

  // Modifier Group: Cuisson (for meat dishes)
  const cuissonGroup = await prisma.modifierGroup.upsert({
    where: { storeId_slug: { storeId: lbtStoreId, slug: 'cuisson' } },
    update: {},
    create: {
      storeId: lbtStoreId,
      name: 'Cuisson',
      slug: 'cuisson',
      description: 'Choisissez la cuisson de votre viande',
      selectionType: 'SINGLE',
      minSelections: 1,
      maxSelections: 1,
      isRequired: true,
      isActive: true,
      productIds: [],  // Will be associated with meat product IDs
    },
  })

  // Modifiers for Cuisson
  const cuissonModifiers = [
    { name: 'Saignant', description: 'Rare', sortOrder: 0 },
    { name: 'A point', description: 'Medium', sortOrder: 1, isDefault: true },
    { name: 'Bien cuit', description: 'Well done', sortOrder: 2 },
  ]

  // Delete existing modifiers in this group to avoid duplicates
  await prisma.modifier.deleteMany({ where: { groupId: cuissonGroup.id } })

  for (const mod of cuissonModifiers) {
    await prisma.modifier.create({
      data: {
        storeId: lbtStoreId,
        groupId: cuissonGroup.id,
        name: mod.name,
        description: mod.description,
        priceAdjustment: 0,
        isDefault: mod.isDefault || false,
        isAvailable: true,
        sortOrder: mod.sortOrder,
      },
    })
  }

  // Modifier Group: Accompagnements
  const accompGroup = await prisma.modifierGroup.upsert({
    where: { storeId_slug: { storeId: lbtStoreId, slug: 'accompagnements' } },
    update: {},
    create: {
      storeId: lbtStoreId,
      name: 'Accompagnements',
      slug: 'accompagnements',
      description: 'Choisissez votre accompagnement',
      selectionType: 'SINGLE',
      minSelections: 0,
      maxSelections: 2,
      isRequired: false,
      isActive: true,
      productIds: [],
    },
  })

  await prisma.modifier.deleteMany({ where: { groupId: accompGroup.id } })

  const accompModifiers = [
    { name: 'Gratin Dauphinois', description: 'Classic potato gratin', priceAdjustment: 0, sortOrder: 0, isDefault: true },
    { name: 'Frites Maison', description: 'Homemade fries', priceAdjustment: 0, sortOrder: 1 },
    { name: 'Legumes de Saison', description: 'Seasonal vegetables', priceAdjustment: 0, sortOrder: 2 },
    { name: 'Salade Verte', description: 'Green salad', priceAdjustment: 0, sortOrder: 3 },
    { name: 'Supplement Truffe', description: 'Extra truffle shavings', priceAdjustment: 8, sortOrder: 4 },
  ]

  for (const mod of accompModifiers) {
    await prisma.modifier.create({
      data: {
        storeId: lbtStoreId,
        groupId: accompGroup.id,
        name: mod.name,
        description: mod.description,
        priceAdjustment: mod.priceAdjustment,
        isDefault: mod.isDefault || false,
        isAvailable: true,
        sortOrder: mod.sortOrder,
      },
    })
  }

  console.log('  🍽️ Modifier groups created (Cuisson + Accompagnements)')
  console.log('✅ Restaurant-specific data created')

  // ============================================
  // SECTION 17: DONE
  // ============================================
  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📋 Login credentials:')
  console.log('  Super Admin:  admin@foxcard.com / admin123')
  console.log('  Merchants:    admin@techzone.com / merchant123')
  console.log('                admin@fashionhub.com / merchant123')
  console.log('                admin@grandhotel.com / merchant123')
  console.log('                admin@labelletable.com / merchant123')
  console.log('                admin@worldtraveler.com / merchant123')
  console.log('\n📊 Data summary:')
  console.log('  6 stores with locations, categories, products')
  console.log('  Discount code WELCOME10 on all stores')
  console.log('  20% VAT tax rates on all stores')
  console.log('  Shipping zones for TechZone, FashionHub, Demo')
  console.log('  Hotel rooms & room types for Grand Hotel')
  console.log('  Restaurant tables, opening hours & modifiers for La Belle Table')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
