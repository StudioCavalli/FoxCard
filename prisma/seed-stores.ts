import { PrismaClient, CommerceType } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

// Category data for each commerce type
const categoryData: Record<CommerceType, { name: string; slug: string; children: { name: string; slug: string }[] }[]> = {
  ELECTRONICS: [
    { name: 'Computers & Accessories', slug: 'computers-accessories', children: [
      { name: 'Laptops', slug: 'laptops' },
      { name: 'Desktops', slug: 'desktops' },
      { name: 'Monitors', slug: 'monitors' },
      { name: 'Keyboards & Mice', slug: 'keyboards-mice' },
      { name: 'External Drives', slug: 'external-drives' },
      { name: 'Networking Equipment', slug: 'networking-equipment' },
    ]},
    { name: 'Mobile Devices', slug: 'mobile-devices', children: [
      { name: 'Smartphones', slug: 'smartphones' },
      { name: 'Tablets', slug: 'tablets' },
      { name: 'Smartwatches', slug: 'smartwatches' },
    ]},
    { name: 'Home Appliances', slug: 'home-appliances', children: [
      { name: 'Refrigerators', slug: 'refrigerators' },
      { name: 'Washing Machines', slug: 'washing-machines' },
      { name: 'Microwave Ovens', slug: 'microwave-ovens' },
      { name: 'Coffee Makers', slug: 'coffee-makers' },
    ]},
    { name: 'Audio & Headphones', slug: 'audio-headphones', children: [
      { name: 'Speakers', slug: 'speakers' },
      { name: 'Headphones', slug: 'headphones' },
      { name: 'Earbuds', slug: 'earbuds' },
      { name: 'Home Theater Systems', slug: 'home-theater-systems' },
    ]},
    { name: 'Cameras & Photography', slug: 'cameras-photography', children: [
      { name: 'Digital Cameras', slug: 'digital-cameras' },
      { name: 'Camcorders', slug: 'camcorders' },
      { name: 'Lenses', slug: 'lenses' },
      { name: 'Tripods & Accessories', slug: 'tripods-accessories' },
    ]},
  ],
  FASHION: [
    { name: "Men's Clothing", slug: 'mens-clothing', children: [
      { name: 'T-Shirts', slug: 'mens-tshirts' },
      { name: 'Pants', slug: 'mens-pants' },
      { name: 'Suits', slug: 'mens-suits' },
      { name: 'Jackets', slug: 'mens-jackets' },
    ]},
    { name: "Women's Clothing", slug: 'womens-clothing', children: [
      { name: 'Dresses', slug: 'womens-dresses' },
      { name: 'Tops', slug: 'womens-tops' },
      { name: 'Skirts', slug: 'womens-skirts' },
      { name: 'Outerwear', slug: 'womens-outerwear' },
    ]},
    { name: 'Footwear', slug: 'footwear', children: [
      { name: 'Sneakers', slug: 'sneakers' },
      { name: 'Boots', slug: 'boots' },
      { name: 'Sandals', slug: 'sandals' },
    ]},
    { name: 'Accessories', slug: 'accessories', children: [
      { name: 'Bags & Purses', slug: 'bags-purses' },
      { name: 'Belts', slug: 'belts' },
      { name: 'Jewelry', slug: 'jewelry' },
    ]},
    { name: 'Watches', slug: 'watches', children: [] },
  ],
  HOME: [
    { name: 'Furniture', slug: 'furniture', children: [
      { name: 'Living Room Furniture', slug: 'living-room-furniture' },
      { name: 'Bedroom Furniture', slug: 'bedroom-furniture' },
      { name: 'Office Furniture', slug: 'office-furniture' },
    ]},
    { name: 'Home Decor', slug: 'home-decor', children: [
      { name: 'Lighting', slug: 'lighting' },
      { name: 'Rugs & Carpets', slug: 'rugs-carpets' },
      { name: 'Wall Art & Mirrors', slug: 'wall-art-mirrors' },
    ]},
    { name: 'Garden Supplies', slug: 'garden-supplies', children: [
      { name: 'Plants & Seeds', slug: 'plants-seeds' },
      { name: 'Garden Tools', slug: 'garden-tools' },
      { name: 'Outdoor Furniture', slug: 'outdoor-furniture' },
    ]},
  ],
  BEAUTY: [
    { name: 'Personal Care', slug: 'personal-care', children: [
      { name: 'Skincare Products', slug: 'skincare-products' },
      { name: 'Hair Care Products', slug: 'hair-care-products' },
      { name: 'Oral Care Products', slug: 'oral-care-products' },
    ]},
    { name: 'Makeup', slug: 'makeup', children: [
      { name: 'Face Makeup', slug: 'face-makeup' },
      { name: 'Eye Makeup', slug: 'eye-makeup' },
      { name: 'Lip Products', slug: 'lip-products' },
    ]},
    { name: 'Health Supplements', slug: 'health-supplements', children: [
      { name: 'Vitamins & Minerals', slug: 'vitamins-minerals' },
      { name: 'Protein Powders', slug: 'protein-powders' },
    ]},
  ],
  SPORTS: [
    { name: 'Fitness Equipment', slug: 'fitness-equipment', children: [
      { name: 'Weights & Resistance Bands', slug: 'weights-resistance-bands' },
      { name: 'Cardio Machines', slug: 'cardio-machines' },
    ]},
    { name: 'Outdoor Gear', slug: 'outdoor-gear', children: [
      { name: 'Camping Equipment', slug: 'camping-equipment' },
      { name: 'Hiking Gear', slug: 'hiking-gear' },
    ]},
    { name: 'Team Sports Equipment', slug: 'team-sports-equipment', children: [
      { name: 'Balls', slug: 'balls' },
      { name: 'Protective Gear', slug: 'protective-gear' },
    ]},
  ],
  TOYS: [
    { name: "Kids' Toys", slug: 'kids-toys', children: [
      { name: 'Action Figures', slug: 'action-figures' },
      { name: 'Dolls & Plush Toys', slug: 'dolls-plush-toys' },
    ]},
    { name: 'Board Games & Puzzles', slug: 'board-games-puzzles', children: [] },
    { name: 'Video Games & Consoles', slug: 'video-games-consoles', children: [] },
  ],
  AUTOMOTIVE: [
    { name: 'Automotive Parts & Accessories', slug: 'automotive-parts-accessories', children: [
      { name: 'Tires & Wheels', slug: 'tires-wheels' },
      { name: 'Car Electronics', slug: 'car-electronics' },
    ]},
    { name: 'Tools & Home Improvement', slug: 'tools-home-improvement', children: [
      { name: 'Power Tools', slug: 'power-tools' },
      { name: 'Hand Tools', slug: 'hand-tools' },
    ]},
  ],
  BOOKS: [
    { name: 'Books', slug: 'books', children: [
      { name: 'Fiction & Non-Fiction', slug: 'fiction-non-fiction' },
      { name: 'Textbooks', slug: 'textbooks' },
    ]},
    { name: 'Stationery Supplies', slug: 'stationery-supplies', children: [
      { name: 'Notebooks', slug: 'notebooks' },
      { name: 'Writing Instruments', slug: 'writing-instruments' },
    ]},
  ],
  PETS: [
    { name: 'Pet Food', slug: 'pet-food', children: [] },
    { name: 'Pet Accessories', slug: 'pet-accessories', children: [] },
    { name: 'Pet Health Products', slug: 'pet-health-products', children: [] },
  ],
  FOOD: [
    { name: 'Snacks', slug: 'snacks', children: [] },
    { name: 'Beverages', slug: 'beverages', children: [] },
    { name: 'Cooking Ingredients', slug: 'cooking-ingredients', children: [] },
  ],
  ALCOHOL: [
    { name: 'Wines', slug: 'wines', children: [
      { name: 'Red Wine', slug: 'red-wine' },
      { name: 'White Wine', slug: 'white-wine' },
      { name: 'Rose Wine', slug: 'rose-wine' },
    ]},
    { name: 'Spirits', slug: 'spirits', children: [
      { name: 'Whisky', slug: 'whisky' },
      { name: 'Vodka', slug: 'vodka' },
      { name: 'Gin', slug: 'gin' },
    ]},
    { name: 'Beers', slug: 'beers', children: [] },
  ],
  DIGITAL: [
    { name: 'E-books', slug: 'ebooks', children: [] },
    { name: 'Software & Applications', slug: 'software-applications', children: [] },
    { name: 'Online Courses', slug: 'online-courses', children: [] },
  ],
  SERVICES: [
    { name: 'Subscription Services', slug: 'subscription-services', children: [] },
    { name: 'Gift Cards', slug: 'gift-cards', children: [] },
  ],
  SEASONAL: [
    { name: 'Holiday Decorations', slug: 'holiday-decorations', children: [] },
    { name: 'Seasonal Clothing', slug: 'seasonal-clothing', children: [] },
  ],
  RESTAURANT: [
    { name: 'Restaurants', slug: 'restaurants', children: [
      { name: 'Fine Dining', slug: 'fine-dining' },
      { name: 'Casual Dining', slug: 'casual-dining' },
      { name: 'Fast Food', slug: 'fast-food' },
      { name: 'Cafes & Bakeries', slug: 'cafes-bakeries' },
    ]},
    { name: 'Cuisines', slug: 'cuisines', children: [
      { name: 'Italian', slug: 'italian' },
      { name: 'Asian', slug: 'asian' },
      { name: 'Mexican', slug: 'mexican' },
      { name: 'Mediterranean', slug: 'mediterranean' },
    ]},
    { name: 'Special Dietary Options', slug: 'special-dietary', children: [
      { name: 'Vegetarian & Vegan', slug: 'vegetarian-vegan' },
      { name: 'Gluten-Free', slug: 'gluten-free' },
      { name: 'Organic', slug: 'organic' },
    ]},
  ],
  HOTEL: [
    { name: 'Types of Accommodations', slug: 'accommodations', children: [
      { name: 'Hotels', slug: 'hotels' },
      { name: 'Motels', slug: 'motels' },
      { name: 'Bed & Breakfasts', slug: 'bed-breakfasts' },
      { name: 'Hostels', slug: 'hostels' },
      { name: 'Vacation Rentals', slug: 'vacation-rentals' },
    ]},
    { name: 'Amenities', slug: 'amenities', children: [
      { name: 'Pool & Spa Facilities', slug: 'pool-spa' },
      { name: 'Conference Rooms', slug: 'conference-rooms' },
      { name: 'Restaurants & Bars', slug: 'restaurants-bars' },
    ]},
  ],
  TRAVEL: [
    { name: 'Transportation', slug: 'transportation', children: [
      { name: 'Flights', slug: 'flights' },
      { name: 'Trains', slug: 'trains' },
      { name: 'Car Rentals', slug: 'car-rentals' },
      { name: 'Buses & Coaches', slug: 'buses-coaches' },
    ]},
    { name: 'Travel Packages', slug: 'travel-packages', children: [
      { name: 'All-Inclusive Resorts', slug: 'all-inclusive-resorts' },
      { name: 'Guided Tours', slug: 'guided-tours' },
      { name: 'Adventure Travel', slug: 'adventure-travel' },
    ]},
    { name: 'Travel Accessories', slug: 'travel-accessories', children: [
      { name: 'Luggage & Bags', slug: 'luggage-bags' },
      { name: 'Travel Gadgets', slug: 'travel-gadgets' },
    ]},
  ],
  RECREATION: [
    { name: 'Outdoor Activities', slug: 'outdoor-activities', children: [
      { name: 'Hiking & Camping', slug: 'hiking-camping' },
      { name: 'Biking & Cycling', slug: 'biking-cycling' },
      { name: 'Water Sports', slug: 'water-sports' },
    ]},
    { name: 'Indoor Activities', slug: 'indoor-activities', children: [
      { name: 'Bowling & Billiards', slug: 'bowling-billiards' },
      { name: 'Escape Rooms', slug: 'escape-rooms' },
      { name: 'Trampoline Parks', slug: 'trampoline-parks' },
    ]},
    { name: 'Cultural Activities', slug: 'cultural-activities', children: [
      { name: 'Museums & Galleries', slug: 'museums-galleries' },
      { name: 'Concerts & Festivals', slug: 'concerts-festivals' },
      { name: 'Theater & Performing Arts', slug: 'theater-performing-arts' },
    ]},
  ],
  GENERAL: [
    { name: 'Products', slug: 'products', children: [] },
    { name: 'Services', slug: 'services', children: [] },
  ],
}

// Demo stores configuration
const demoStores = [
  {
    name: 'TechZone Electronics',
    slug: 'techzone',
    domain: 'techzone.foxcard.demo',
    description: 'Your one-stop shop for the latest electronics and gadgets',
    commerceType: 'ELECTRONICS' as CommerceType,
    merchantEmail: 'merchant.tech@foxcard.demo',
    merchantName: 'Alex Tech',
    country: 'FR',
    currency: 'EUR',
  },
  {
    name: 'Urban Style Fashion',
    slug: 'urban-style',
    domain: 'urbanstyle.foxcard.demo',
    description: 'Trendy fashion for modern lifestyles',
    commerceType: 'FASHION' as CommerceType,
    merchantEmail: 'merchant.fashion@foxcard.demo',
    merchantName: 'Sophie Mode',
    country: 'FR',
    currency: 'EUR',
  },
  {
    name: 'Casa & Garden',
    slug: 'casa-garden',
    domain: 'casagarden.foxcard.demo',
    description: 'Beautiful furniture and garden supplies for your home',
    commerceType: 'HOME' as CommerceType,
    merchantEmail: 'merchant.home@foxcard.demo',
    merchantName: 'Marc Maison',
    country: 'ES',
    currency: 'EUR',
  },
  {
    name: 'Glow Beauty',
    slug: 'glow-beauty',
    domain: 'glowbeauty.foxcard.demo',
    description: 'Premium skincare, makeup and wellness products',
    commerceType: 'BEAUTY' as CommerceType,
    merchantEmail: 'merchant.beauty@foxcard.demo',
    merchantName: 'Emma Beaute',
    country: 'FR',
    currency: 'EUR',
  },
  {
    name: 'SportMax Outdoor',
    slug: 'sportmax',
    domain: 'sportmax.foxcard.demo',
    description: 'Equipment for athletes and outdoor enthusiasts',
    commerceType: 'SPORTS' as CommerceType,
    merchantEmail: 'merchant.sports@foxcard.demo',
    merchantName: 'Lucas Sport',
    country: 'DE',
    currency: 'EUR',
  },
  {
    name: 'ToyWorld Kids',
    slug: 'toyworld',
    domain: 'toyworld.foxcard.demo',
    description: 'Toys, games and fun for all ages',
    commerceType: 'TOYS' as CommerceType,
    merchantEmail: 'merchant.toys@foxcard.demo',
    merchantName: 'Marie Jouets',
    country: 'FR',
    currency: 'EUR',
  },
  {
    name: 'AutoParts Plus',
    slug: 'autoparts-plus',
    domain: 'autoparts.foxcard.demo',
    description: 'Quality automotive parts and tools',
    commerceType: 'AUTOMOTIVE' as CommerceType,
    merchantEmail: 'merchant.auto@foxcard.demo',
    merchantName: 'Pierre Auto',
    country: 'FR',
    currency: 'EUR',
  },
  {
    name: 'BookHaven',
    slug: 'bookhaven',
    domain: 'bookhaven.foxcard.demo',
    description: 'Books and stationery for curious minds',
    commerceType: 'BOOKS' as CommerceType,
    merchantEmail: 'merchant.books@foxcard.demo',
    merchantName: 'Claire Livres',
    country: 'GB',
    currency: 'GBP',
  },
  {
    name: 'PetPals Store',
    slug: 'petpals',
    domain: 'petpals.foxcard.demo',
    description: 'Everything your furry friends need',
    commerceType: 'PETS' as CommerceType,
    merchantEmail: 'merchant.pets@foxcard.demo',
    merchantName: 'Thomas Animaux',
    country: 'FR',
    currency: 'EUR',
  },
  {
    name: 'FreshMart Grocery',
    slug: 'freshmart',
    domain: 'freshmart.foxcard.demo',
    description: 'Fresh groceries and gourmet food delivered',
    commerceType: 'FOOD' as CommerceType,
    merchantEmail: 'merchant.food@foxcard.demo',
    merchantName: 'Julie Fresh',
    country: 'FR',
    currency: 'EUR',
  },
  {
    name: 'Cave des Vignerons',
    slug: 'cave-vignerons',
    domain: 'cavevignerons.foxcard.demo',
    description: 'Fine wines and spirits from around the world',
    commerceType: 'ALCOHOL' as CommerceType,
    merchantEmail: 'merchant.wine@foxcard.demo',
    merchantName: 'Antoine Vins',
    country: 'FR',
    currency: 'EUR',
  },
  {
    name: 'DigiStore',
    slug: 'digistore',
    domain: 'digistore.foxcard.demo',
    description: 'Digital products, software and online courses',
    commerceType: 'DIGITAL' as CommerceType,
    merchantEmail: 'merchant.digital@foxcard.demo',
    merchantName: 'Nicolas Digital',
    country: 'US',
    currency: 'USD',
  },
  {
    name: 'Fetes & Saisons',
    slug: 'fetes-saisons',
    domain: 'fetes-saisons.foxcard.demo',
    description: 'Decorations and seasonal products for all occasions',
    commerceType: 'SEASONAL' as CommerceType,
    merchantEmail: 'merchant.seasonal@foxcard.demo',
    merchantName: 'Noel Saisons',
    country: 'FR',
    currency: 'EUR',
  },
  {
    name: 'Saveurs du Monde',
    slug: 'saveurs-monde',
    domain: 'saveurs-monde.foxcard.demo',
    description: 'Restaurant delivery and gourmet food experiences',
    commerceType: 'RESTAURANT' as CommerceType,
    merchantEmail: 'merchant.restaurant@foxcard.demo',
    merchantName: 'Chef Martin',
    country: 'FR',
    currency: 'EUR',
  },
  {
    name: 'StayEasy Hotels',
    slug: 'stayeasy',
    domain: 'stayeasy.foxcard.demo',
    description: 'Hotels and accommodations booking platform',
    commerceType: 'HOTEL' as CommerceType,
    merchantEmail: 'merchant.hotel@foxcard.demo',
    merchantName: 'Henri Hotelier',
    country: 'FR',
    currency: 'EUR',
  },
  {
    name: 'Voyage Express',
    slug: 'voyage-express',
    domain: 'voyage-express.foxcard.demo',
    description: 'Book flights, trains, car rentals and travel packages',
    commerceType: 'TRAVEL' as CommerceType,
    merchantEmail: 'merchant.travel@foxcard.demo',
    merchantName: 'Paul Voyageur',
    country: 'FR',
    currency: 'EUR',
  },
  {
    name: 'FunZone Activities',
    slug: 'funzone',
    domain: 'funzone.foxcard.demo',
    description: 'Book outdoor, indoor and cultural activities',
    commerceType: 'RECREATION' as CommerceType,
    merchantEmail: 'merchant.recreation@foxcard.demo',
    merchantName: 'Laura Loisirs',
    country: 'FR',
    currency: 'EUR',
  },
]

async function cleanDatabase() {
  console.log('🧹 Cleaning database...')

  // Delete in order to respect foreign key constraints
  try { await prisma.orderItem.deleteMany({}) } catch {}
  try { await prisma.order.deleteMany({}) } catch {}
  try { await prisma.productVariant.deleteMany({}) } catch {}
  try { await prisma.product.deleteMany({}) } catch {}
  // Delete child categories first (those with parentId)
  try { await prisma.category.deleteMany({ where: { parentId: { not: null } } }) } catch {}
  try { await prisma.category.deleteMany({}) } catch {}
  try { await prisma.customer.deleteMany({}) } catch {}
  try { await prisma.discountCode.deleteMany({}) } catch {}
  try { await prisma.shippingZone.deleteMany({}) } catch {}
  try { await prisma.storeUser.deleteMany({}) } catch {}
  try { await prisma.suspensionAppeal.deleteMany({}) } catch {}
  try { await prisma.auditLog.deleteMany({}) } catch {}
  try { await prisma.store.deleteMany({}) } catch {}

  // Delete merchant users (not SUPER_ADMIN)
  await prisma.user.deleteMany({
    where: { role: { not: 'SUPER_ADMIN' } }
  })

  console.log('✅ Database cleaned')
}

async function createCategoriesForStore(storeId: string, commerceType: CommerceType) {
  const categories = categoryData[commerceType] || categoryData.GENERAL

  for (const cat of categories) {
    const parentCategory = await prisma.category.create({
      data: {
        storeId,
        name: cat.name,
        slug: cat.slug,
        description: `${cat.name} category`,
      }
    })

    // Create child categories
    for (const child of cat.children) {
      await prisma.category.create({
        data: {
          storeId,
          name: child.name,
          slug: child.slug,
          parentId: parentCategory.id,
          description: `${child.name} subcategory`,
        }
      })
    }
  }
}

async function main() {
  console.log('🌱 Starting FoxCard seed...')

  // Clean existing data
  await cleanDatabase()

  // Ensure admin user exists
  const hashedPassword = await hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@foxcard.com' },
    update: {},
    create: {
      email: 'admin@foxcard.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  })
  console.log('✅ Admin user ready:', adminUser.email)

  // Create demo stores
  for (const storeConfig of demoStores) {
    // Create merchant user (ADMIN role for store owners)
    const merchant = await prisma.user.create({
      data: {
        email: storeConfig.merchantEmail,
        name: storeConfig.merchantName,
        password: hashedPassword,
        role: 'ADMIN',
      }
    })

    // Create store
    const store = await prisma.store.create({
      data: {
        name: storeConfig.name,
        slug: storeConfig.slug,
        domain: storeConfig.domain,
        description: storeConfig.description,
        commerceType: storeConfig.commerceType,
        ownerId: merchant.id,
        status: 'ACTIVE',
        showOnDirectory: true,
        settings: {
          locale: storeConfig.country === 'GB' ? 'en' : storeConfig.country === 'US' ? 'en' : storeConfig.country === 'ES' ? 'es' : storeConfig.country === 'DE' ? 'de' : 'fr',
          country: storeConfig.country,
          currency: storeConfig.currency,
        },
      }
    })

    // Create categories for the store
    await createCategoriesForStore(store.id, storeConfig.commerceType)

    console.log(`✅ Store created: ${store.name} (${storeConfig.commerceType})`)
  }

  console.log('\n🎉 Seed completed successfully!')
  console.log(`📊 Created ${demoStores.length} demo stores with categories`)
  console.log('\n🔐 Admin login: admin@foxcard.com / admin123')
  console.log('🔐 Store owner login: merchant.tech@foxcard.demo / admin123 (and others)')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
