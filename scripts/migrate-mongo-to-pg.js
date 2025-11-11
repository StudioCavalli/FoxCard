/**
 * Script de migration MongoDB → PostgreSQL
 * Migre toutes les données de MongoDB vers PostgreSQL
 */

const { PrismaClient: MongoClient } = require('@prisma/client')
const { PrismaClient: PostgresClient } = require('@prisma/client')

async function migrate() {
  console.log('🔄 Début de la migration MongoDB → PostgreSQL\n')

  // Connexion aux deux bases de données
  const mongoUrl = process.env.MONGODB_URL
  const pgUrl = process.env.POSTGRESQL_URL

  if (!mongoUrl || !pgUrl) {
    console.error('❌ Variables d\'environnement manquantes')
    console.log('ℹ️  Définissez MONGODB_URL et POSTGRESQL_URL dans votre .env')
    process.exit(1)
  }

  const mongo = new MongoClient({
    datasources: { db: { url: mongoUrl } }
  })

  const postgres = new PostgresClient({
    datasources: { db: { url: pgUrl } }
  })

  try {
    await mongo.$connect()
    await postgres.$connect()
    console.log('✅ Connexion aux bases de données établie\n')

    // Migrer les utilisateurs
    console.log('👤 Migration des utilisateurs...')
    const users = await mongo.user.findMany()
    for (const user of users) {
      await postgres.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          password: user.password,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      })
    }
    console.log(`   ✓ ${users.length} utilisateurs migrés`)

    // Migrer les stores
    console.log('🏪 Migration des boutiques...')
    const stores = await mongo.store.findMany()
    for (const store of stores) {
      await postgres.store.create({
        data: {
          id: store.id,
          name: store.name,
          slug: store.slug,
          description: store.description,
          logo: store.logo,
          domain: store.domain,
          ownerId: store.ownerId,
          settings: store.settings,
          theme: store.theme,
          createdAt: store.createdAt,
          updatedAt: store.updatedAt
        }
      })
    }
    console.log(`   ✓ ${stores.length} boutiques migrées`)

    // Migrer les catégories
    console.log('📂 Migration des catégories...')
    const categories = await mongo.category.findMany()
    for (const category of categories) {
      await postgres.category.create({
        data: {
          id: category.id,
          storeId: category.storeId,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          parentId: category.parentId,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt
        }
      })
    }
    console.log(`   ✓ ${categories.length} catégories migrées`)

    // Migrer les produits
    console.log('📦 Migration des produits...')
    const products = await mongo.product.findMany()
    for (const product of products) {
      await postgres.product.create({
        data: {
          id: product.id,
          storeId: product.storeId,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          cost: product.cost,
          type: product.type,
          sku: product.sku,
          barcode: product.barcode,
          trackInventory: product.trackInventory,
          quantity: product.quantity,
          lowStockThreshold: product.lowStockThreshold,
          images: product.images,
          thumbnail: product.thumbnail,
          metaTitle: product.metaTitle,
          metaDescription: product.metaDescription,
          status: product.status,
          featured: product.featured,
          categoryId: product.categoryId,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }
      })
    }
    console.log(`   ✓ ${products.length} produits migrés`)

    // Migrer les variantes de produits
    console.log('🎨 Migration des variantes de produits...')
    const variants = await mongo.productVariant.findMany()
    for (const variant of variants) {
      await postgres.productVariant.create({
        data: {
          id: variant.id,
          productId: variant.productId,
          name: variant.name,
          sku: variant.sku,
          price: variant.price,
          quantity: variant.quantity,
          image: variant.image,
          options: variant.options,
          createdAt: variant.createdAt,
          updatedAt: variant.updatedAt
        }
      })
    }
    console.log(`   ✓ ${variants.length} variantes migrées`)

    // Migrer les clients
    console.log('👥 Migration des clients...')
    const customers = await mongo.customer.findMany()
    for (const customer of customers) {
      await postgres.customer.create({
        data: {
          id: customer.id,
          storeId: customer.storeId,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
          address: customer.address,
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt
        }
      })
    }
    console.log(`   ✓ ${customers.length} clients migrés`)

    // Migrer les commandes
    console.log('🛒 Migration des commandes...')
    const orders = await mongo.order.findMany({ include: { items: true } })
    for (const order of orders) {
      await postgres.order.create({
        data: {
          id: order.id,
          storeId: order.storeId,
          orderNumber: order.orderNumber,
          customerId: order.customerId,
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          subtotal: order.subtotal,
          tax: order.tax,
          shipping: order.shipping,
          discount: order.discount,
          total: order.total,
          status: order.status,
          paymentStatus: order.paymentStatus,
          fulfillmentStatus: order.fulfillmentStatus,
          paymentMethod: order.paymentMethod,
          paymentIntentId: order.paymentIntentId,
          shippingAddress: order.shippingAddress,
          billingAddress: order.billingAddress,
          notes: order.notes,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          items: {
            create: order.items.map(item => ({
              id: item.id,
              productId: item.productId,
              name: item.name,
              sku: item.sku,
              quantity: item.quantity,
              price: item.price,
              total: item.total,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt
            }))
          }
        }
      })
    }
    console.log(`   ✓ ${orders.length} commandes migrées`)

    // Migrer les codes de réduction
    console.log('💸 Migration des codes de réduction...')
    const discounts = await mongo.discountCode.findMany()
    for (const discount of discounts) {
      await postgres.discountCode.create({
        data: {
          id: discount.id,
          storeId: discount.storeId,
          code: discount.code,
          type: discount.type,
          value: discount.value,
          minAmount: discount.minAmount,
          maxUses: discount.maxUses,
          usedCount: discount.usedCount,
          active: discount.active,
          expiresAt: discount.expiresAt,
          createdAt: discount.createdAt,
          updatedAt: discount.updatedAt
        }
      })
    }
    console.log(`   ✓ ${discounts.length} codes de réduction migrés`)

    console.log('\n✅ Migration terminée avec succès!')
    console.log('\n⚠️  N\'oubliez pas de:')
    console.log('   1. Sauvegarder votre ancienne base MongoDB')
    console.log('   2. Mettre à jour DATABASE_URL dans votre .env')
    console.log('   3. Redémarrer votre application')

  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error)
    process.exit(1)
  } finally {
    await mongo.$disconnect()
    await postgres.$disconnect()
  }
}

// Exécuter la migration
migrate()
