import { PrismaClient, CommerceType, ProductStatus, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Helper to generate slug
const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// Helper to hash password
const hashPassword = async (password: string) => bcrypt.hash(password, 10)

// Marketplace structure based on commerce types
const marketplaceData = [
  {
    storeName: 'TechZone Electronics',
    storeSlug: 'techzone',
    commerceType: 'ELECTRONICS' as CommerceType,
    email: 'admin@techzone.com',
    categories: [
      { name: 'Computers & Accessories', products: ['MacBook Pro 16"', 'Dell XPS 15', 'Gaming Mouse RGB', 'Mechanical Keyboard', 'USB-C Hub'] },
      { name: 'Mobile Devices', products: ['iPhone 15 Pro', 'Samsung Galaxy S24', 'iPad Air', 'Apple Watch Series 9'] },
      { name: 'Audio & Headphones', products: ['Sony WH-1000XM5', 'AirPods Pro 2', 'JBL Flip 6', 'Bose SoundLink'] },
      { name: 'Cameras', products: ['Canon EOS R6', 'Sony A7 IV', 'GoPro Hero 12', 'DJI Mini 4 Pro'] },
    ],
  },
  {
    storeName: 'Fashion Hub',
    storeSlug: 'fashionhub',
    commerceType: 'FASHION' as CommerceType,
    email: 'admin@fashionhub.com',
    categories: [
      { name: "Men's Clothing", products: ['Classic White T-Shirt', 'Slim Fit Jeans', 'Navy Blazer', 'Leather Jacket'] },
      { name: "Women's Clothing", products: ['Summer Dress', 'Silk Blouse', 'High-Waist Skirt', 'Trench Coat'] },
      { name: 'Footwear', products: ['Nike Air Max', 'Chelsea Boots', 'Adidas Ultraboost', 'Leather Sandals'] },
      { name: 'Accessories', products: ['Designer Handbag', 'Leather Belt', 'Gold Necklace', 'Luxury Watch'] },
    ],
  },
  {
    storeName: 'Home & Garden Paradise',
    storeSlug: 'homegarden',
    commerceType: 'HOME' as CommerceType,
    email: 'admin@homegarden.com',
    categories: [
      { name: 'Furniture', products: ['Modern Sofa Set', 'King Size Bed Frame', 'Office Desk', 'Dining Table Set'] },
      { name: 'Home Decor', products: ['Crystal Chandelier', 'Persian Rug', 'Wall Mirror Set', 'Decorative Vase'] },
      { name: 'Garden Supplies', products: ['Rose Plant Collection', 'Garden Tool Kit', 'Patio Furniture Set', 'Solar Garden Lights'] },
    ],
  },
  {
    storeName: 'Beauty & Wellness',
    storeSlug: 'beautywellness',
    commerceType: 'BEAUTY' as CommerceType,
    email: 'admin@beautywellness.com',
    categories: [
      { name: 'Skincare', products: ['Anti-Aging Serum', 'Moisturizing Cream', 'Vitamin C Toner', 'Eye Cream'] },
      { name: 'Makeup', products: ['Foundation Set', 'Eyeshadow Palette', 'Lipstick Collection', 'Mascara Bundle'] },
      { name: 'Hair Care', products: ['Keratin Shampoo', 'Deep Conditioner', 'Hair Styling Kit', 'Hair Dryer Pro'] },
    ],
  },
  {
    storeName: 'SportsPro',
    storeSlug: 'sportspro',
    commerceType: 'SPORTS' as CommerceType,
    email: 'admin@sportspro.com',
    categories: [
      { name: 'Fitness Equipment', products: ['Adjustable Dumbbells', 'Resistance Bands Set', 'Yoga Mat Premium', 'Treadmill Pro'] },
      { name: 'Outdoor Gear', products: ['Camping Tent 4P', 'Hiking Backpack 50L', 'Sleeping Bag -10°C', 'Trekking Poles'] },
      { name: 'Team Sports', products: ['Soccer Ball Pro', 'Basketball Official', 'Tennis Racket Set', 'Protective Gear Kit'] },
    ],
  },
  {
    storeName: 'Kids World',
    storeSlug: 'kidsworld',
    commerceType: 'TOYS' as CommerceType,
    email: 'admin@kidsworld.com',
    categories: [
      { name: "Kids' Toys", products: ['LEGO Star Wars Set', 'Barbie Dream House', 'Hot Wheels Track', 'Plush Teddy Bear XL'] },
      { name: 'Board Games', products: ['Monopoly Classic', 'Scrabble Deluxe', 'Chess Set Wooden', 'Puzzle 1000 Pieces'] },
      { name: 'Video Games', products: ['Nintendo Switch OLED', 'PlayStation 5', 'Xbox Series X', 'Gaming Headset'] },
    ],
  },
  {
    storeName: 'AutoParts Plus',
    storeSlug: 'autoparts',
    commerceType: 'AUTOMOTIVE' as CommerceType,
    email: 'admin@autoparts.com',
    categories: [
      { name: 'Car Accessories', products: ['All-Season Tires Set', 'Dash Cam 4K', 'GPS Navigator', 'Car Cover Premium'] },
      { name: 'Tools', products: ['Power Drill Set', 'Socket Wrench Kit', 'Impact Driver', 'Tool Box Complete'] },
    ],
  },
  {
    storeName: 'Book Haven',
    storeSlug: 'bookhaven',
    commerceType: 'BOOKS' as CommerceType,
    email: 'admin@bookhaven.com',
    categories: [
      { name: 'Fiction', products: ['Bestseller Novel Collection', 'Mystery Thriller Pack', 'Fantasy Series Box Set', 'Romance Classics'] },
      { name: 'Non-Fiction', products: ['Business Strategy Guide', 'Self-Help Collection', 'Biography Bundle', 'Science Encyclopedia'] },
      { name: 'Stationery', products: ['Premium Notebook Set', 'Fountain Pen Collection', 'Art Supplies Kit', 'Planner 2024'] },
    ],
  },
  {
    storeName: 'Pet Paradise',
    storeSlug: 'petparadise',
    commerceType: 'PETS' as CommerceType,
    email: 'admin@petparadise.com',
    categories: [
      { name: 'Pet Food', products: ['Premium Dog Food 15kg', 'Cat Food Variety Pack', 'Bird Seed Mix', 'Fish Food Flakes'] },
      { name: 'Pet Accessories', products: ['Dog Bed Orthopedic', 'Cat Tree Tower', 'Aquarium Starter Kit', 'Pet Carrier Bag'] },
      { name: 'Pet Health', products: ['Flea Treatment Kit', 'Pet Vitamins', 'Dental Care Set', 'Grooming Kit Pro'] },
    ],
  },
  {
    storeName: 'Fresh Market',
    storeSlug: 'freshmarket',
    commerceType: 'FOOD' as CommerceType,
    email: 'admin@freshmarket.com',
    categories: [
      { name: 'Fresh Produce', products: ['Organic Fruit Basket', 'Vegetable Box Weekly', 'Mixed Nuts Premium', 'Fresh Herbs Bundle'] },
      { name: 'Dairy & Meat', products: ['Artisan Cheese Selection', 'Premium Steak Pack', 'Free-Range Eggs 30', 'Fresh Salmon Fillet'] },
      { name: 'Pantry', products: ['Olive Oil Extra Virgin', 'Spice Collection Set', 'Pasta Variety Pack', 'Organic Honey'] },
    ],
  },
  {
    storeName: 'Wine & Spirits Gallery',
    storeSlug: 'winespirits',
    commerceType: 'ALCOHOL' as CommerceType,
    email: 'admin@winespirits.com',
    categories: [
      { name: 'Wine', products: ['Bordeaux Grand Cru 2018', 'Champagne Brut Premium', 'Chianti Classico', 'Prosecco DOC'] },
      { name: 'Spirits', products: ['Single Malt Whisky 18Y', 'Premium Vodka', 'Aged Rum Collection', 'Craft Gin Set'] },
      { name: 'Beer & Cider', products: ['Craft Beer Selection', 'Belgian Abbey Pack', 'Apple Cider Premium', 'IPA Collection'] },
    ],
  },
  {
    storeName: 'Digital Downloads',
    storeSlug: 'digitaldownloads',
    commerceType: 'DIGITAL' as CommerceType,
    email: 'admin@digitaldownloads.com',
    categories: [
      { name: 'E-books', products: ['Programming Bundle PDF', 'Business E-book Collection', 'Language Learning Pack', 'Cookbook Digital Set'] },
      { name: 'Software', products: ['Office Suite License', 'Antivirus Premium 1Y', 'Photo Editor Pro', 'VPN Subscription'] },
      { name: 'Online Courses', products: ['Web Development Bootcamp', 'Digital Marketing Course', 'Photography Masterclass', 'Music Production Course'] },
    ],
  },
  {
    storeName: 'Service Hub',
    storeSlug: 'servicehub',
    commerceType: 'SERVICES' as CommerceType,
    email: 'admin@servicehub.com',
    categories: [
      { name: 'Subscriptions', products: ['Streaming Service 1Y', 'Cloud Storage 1TB', 'Music Premium Annual', 'News Subscription'] },
      { name: 'Gift Cards', products: ['Amazon Gift Card €50', 'iTunes Gift Card €25', 'Steam Wallet €100', 'Restaurant Gift Card'] },
      { name: 'Wellness Services', products: ['Yoga Class Package', 'Personal Training 10 Sessions', 'Nutrition Consultation', 'Massage Therapy 5x'] },
    ],
  },
  {
    storeName: 'La Belle Table',
    storeSlug: 'labelletable',
    commerceType: 'RESTAURANT' as CommerceType,
    email: 'admin@labelletable.com',
    categories: [
      { name: 'Fine Dining', products: ['Tasting Menu 7 Courses', 'Wine Pairing Experience', 'Chef\'s Table Dinner', 'Anniversary Special'] },
      { name: 'Italian Cuisine', products: ['Pasta Carbonara', 'Margherita Pizza', 'Tiramisu Dessert', 'Risotto ai Funghi'] },
      { name: 'Asian Fusion', products: ['Sushi Platter Premium', 'Ramen Bowl Special', 'Pad Thai Classic', 'Dim Sum Selection'] },
    ],
  },
  {
    storeName: 'Grand Hotel Palace',
    storeSlug: 'grandhotel',
    commerceType: 'HOTEL' as CommerceType,
    email: 'admin@grandhotel.com',
    categories: [
      { name: 'Luxury Rooms', products: ['Presidential Suite', 'Deluxe Ocean View', 'Executive Suite', 'Penthouse Apartment'] },
      { name: 'Standard Rooms', products: ['Classic Double Room', 'Twin Room', 'Single Business Room', 'Family Room'] },
      { name: 'Packages', products: ['Romantic Getaway 2N', 'Spa Weekend Package', 'Business Package', 'Family Holiday 5N'] },
    ],
  },
  {
    storeName: 'World Traveler',
    storeSlug: 'worldtraveler',
    commerceType: 'TRAVEL' as CommerceType,
    email: 'admin@worldtraveler.com',
    categories: [
      { name: 'Flight Packages', products: ['Paris Weekend Escape', 'New York City Break', 'Tokyo Adventure 7D', 'Bali Paradise 10D'] },
      { name: 'Tours', products: ['European Grand Tour 14D', 'Safari Adventure Kenya', 'Caribbean Cruise 7N', 'Nordic Lights Experience'] },
      { name: 'Travel Accessories', products: ['Premium Luggage Set', 'Travel Adapter Universal', 'Neck Pillow Deluxe', 'Packing Cubes Set'] },
    ],
  },
  {
    storeName: 'Adventure Zone',
    storeSlug: 'adventurezone',
    commerceType: 'RECREATION' as CommerceType,
    email: 'admin@adventurezone.com',
    categories: [
      { name: 'Outdoor Activities', products: ['Kayak Rental Full Day', 'Rock Climbing Session', 'Mountain Biking Tour', 'Zip Line Experience'] },
      { name: 'Indoor Fun', products: ['Escape Room Group', 'Bowling Party Package', 'Trampoline Park Pass', 'VR Gaming Session'] },
      { name: 'Cultural Events', products: ['Museum Pass Annual', 'Concert VIP Tickets', 'Theater Season Pass', 'Art Gallery Tour'] },
    ],
  },
  {
    storeName: 'Holiday Shop',
    storeSlug: 'holidayshop',
    commerceType: 'SEASONAL' as CommerceType,
    email: 'admin@holidayshop.com',
    categories: [
      { name: 'Christmas', products: ['Christmas Tree 7ft', 'LED Lights Set', 'Ornament Collection', 'Advent Calendar Deluxe'] },
      { name: 'Halloween', products: ['Costume Adult Premium', 'Decoration Kit', 'Pumpkin Carving Set', 'Candy Variety Pack'] },
      { name: 'Summer', products: ['Beach Umbrella Set', 'Pool Float Collection', 'BBQ Grill Pro', 'Outdoor Games Kit'] },
    ],
  },
]

async function clearDatabase() {
  console.log('🗑️  Clearing existing data...')

  // Delete in correct order due to foreign keys
  await prisma.orderItem.deleteMany({})
  await prisma.order.deleteMany({})
  await prisma.abandonedCart.deleteMany({})
  await prisma.productVariant.deleteMany({})
  await prisma.product.deleteMany({})

  // Handle self-referential category hierarchy - set parentId to null first
  await prisma.category.updateMany({
    where: { parentId: { not: null } },
    data: { parentId: null }
  })
  await prisma.category.deleteMany({})

  await prisma.storeUser.deleteMany({})
  await prisma.role.deleteMany({})
  await prisma.store.deleteMany({})
  // Don't delete superadmins
  await prisma.user.deleteMany({
    where: { role: { not: 'SUPER_ADMIN' } }
  })

  console.log('✅ Database cleared')
}

async function seedMarketplace() {
  console.log('🌱 Seeding marketplace...')

  for (const storeData of marketplaceData) {
    console.log(`\n📦 Creating store: ${storeData.storeName}`)

    // Create merchant user
    const user = await prisma.user.create({
      data: {
        email: storeData.email,
        name: `${storeData.storeName} Admin`,
        password: await hashPassword('merchant123'),
        role: 'ADMIN' as UserRole,
        emailVerified: new Date(),
      },
    })

    // Create store with owner
    const store = await prisma.store.create({
      data: {
        name: storeData.storeName,
        slug: storeData.storeSlug,
        domain: `${storeData.storeSlug}.foxcard.local`,
        commerceType: storeData.commerceType,
        status: 'ACTIVE',
        ownerId: user.id,
        description: `Welcome to ${storeData.storeName} - Your destination for ${storeData.commerceType.toLowerCase()} products`,
      },
    })

    // Create owner role for store
    const ownerRole = await prisma.role.create({
      data: {
        storeId: store.id,
        name: 'Owner',
        description: 'Store owner with full access',
        permissions: ['*'],
        isSystem: true,
      },
    })

    // Link user to store with role
    await prisma.storeUser.create({
      data: {
        userId: user.id,
        storeId: store.id,
        roleId: ownerRole.id,
        status: 'ACTIVE',
        acceptedAt: new Date(),
      },
    })

    // Create categories and products
    for (const catData of storeData.categories) {
      const category = await prisma.category.create({
        data: {
          name: catData.name,
          slug: slugify(catData.name),
          storeId: store.id,
        },
      })

      // Create products
      for (let i = 0; i < catData.products.length; i++) {
        const productName = catData.products[i]
        const basePrice = Math.floor(Math.random() * 200 + 20) // Random price 20-220€

        await prisma.product.create({
          data: {
            name: productName,
            slug: slugify(productName) + '-' + store.id.slice(0, 6),
            description: `High-quality ${productName} from ${storeData.storeName}. Perfect for your needs.`,
            price: basePrice,
            compareAtPrice: Math.random() > 0.5 ? Math.floor(basePrice * 1.2) : null,
            quantity: Math.floor(Math.random() * 100 + 10),
            status: 'ACTIVE' as ProductStatus,
            featured: Math.random() > 0.8,
            storeId: store.id,
            categoryId: category.id,
            images: [],
            tags: [storeData.commerceType.toLowerCase(), catData.name.toLowerCase()],
          },
        })
      }

      console.log(`  ✓ Category: ${catData.name} (${catData.products.length} products)`)
    }
  }

  console.log('\n✅ Marketplace seeded successfully!')
}

async function main() {
  try {
    await clearDatabase()
    await seedMarketplace()

    // Summary
    const storeCount = await prisma.store.count()
    const productCount = await prisma.product.count()
    const categoryCount = await prisma.category.count()
    const userCount = await prisma.user.count({ where: { role: 'ADMIN' } })

    console.log('\n📊 Summary:')
    console.log(`   Stores: ${storeCount}`)
    console.log(`   Categories: ${categoryCount}`)
    console.log(`   Products: ${productCount}`)
    console.log(`   Merchants: ${userCount}`)

  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
