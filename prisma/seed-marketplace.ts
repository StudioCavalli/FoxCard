import { PrismaClient, CommerceType, ProductStatus, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Helper to generate slug
const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// Helper to hash password
const hashPassword = async (password: string) => bcrypt.hash(password, 10)

// Unsplash image URLs by commerce type
const unsplashImages: Record<string, string[]> = {
  ELECTRONICS: [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
    'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
  ],
  FASHION: [
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800',
    'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800',
  ],
  HOME: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800',
    'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=800',
  ],
  BEAUTY: [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
    'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800',
  ],
  SPORTS: [
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800',
    'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=800',
  ],
  TOYS: [
    'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800',
    'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800',
    'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800',
    'https://images.unsplash.com/photo-1559715745-e1b33a271c8f?w=800',
  ],
  AUTOMOTIVE: [
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800',
  ],
  BOOKS: [
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800',
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
  ],
  PETS: [
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800',
    'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800',
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800',
  ],
  FOOD: [
    'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
  ],
  ALCOHOL: [
    'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800',
    'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800',
    'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=800',
    'https://images.unsplash.com/photo-1569924694044-e6f7c8d19fec?w=800',
  ],
  DIGITAL: [
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
  ],
  SERVICES: [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800',
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800',
  ],
  RESTAURANT: [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
  ],
  HOTEL: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
  ],
  TRAVEL: [
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
    'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800',
  ],
  RECREATION: [
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800',
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
    'https://images.unsplash.com/photo-1445307806294-bff7f67ff225?w=800',
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
  ],
  SEASONAL: [
    'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800',
    'https://images.unsplash.com/photo-1481355142855-3a3b6e3c35bb?w=800',
    'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?w=800',
    'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=800',
  ],
}

// Get random image for commerce type
const getProductImage = (commerceType: string, index: number): string[] => {
  const images = unsplashImages[commerceType] || unsplashImages.ELECTRONICS
  return [images[index % images.length]]
}

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
            images: getProductImage(storeData.commerceType, i),
            thumbnail: getProductImage(storeData.commerceType, i)[0],
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
