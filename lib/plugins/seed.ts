import { PrismaClient } from '@prisma/client'

/**
 * Plugin presets for the marketplace
 */
const pluginPresets = [
  // SHIPPING PLUGINS
  {
    name: 'Colissimo',
    slug: 'colissimo',
    description: 'Intégration officielle Colissimo pour l\'expédition en France et à l\'international. Calcul automatique des tarifs et génération des étiquettes.',
    type: 'SHIPPING',
    category: 'shipping',
    icon: '📦',
    tags: ['shipping', 'france', 'la-poste', 'colissimo', 'gratuit'],
    config: {
      apiKey: '',
      contractNumber: '',
      password: '',
      senderAddress: {
        name: '',
        street: '',
        city: '',
        postalCode: '',
        country: 'FR',
      },
      defaultWeight: 500,
      defaultPackageType: 'COLD',
    },
    hooks: ['order.created', 'order.shipped'],
    permissions: ['orders.read', 'orders.update'],
    isPremium: false,
  },
  {
    name: 'UPS',
    slug: 'ups',
    description: 'Connectez votre boutique à UPS pour des expéditions internationales rapides. Suivi en temps réel et tarifs négociés.',
    type: 'SHIPPING',
    category: 'shipping',
    icon: '🟤',
    tags: ['shipping', 'international', 'ups', 'express', 'gratuit'],
    config: {
      accessKey: '',
      username: '',
      password: '',
      accountNumber: '',
      shipperNumber: '',
      defaultService: '03', // UPS Ground
    },
    hooks: ['order.created', 'order.shipped'],
    permissions: ['orders.read', 'orders.update'],
    isPremium: false,
  },
  {
    name: 'DHL Express',
    slug: 'dhl',
    description: 'Expéditions express mondiales avec DHL. Livraison rapide, suivi détaillé et dédouanement simplifié.',
    type: 'SHIPPING',
    category: 'shipping',
    icon: '🟡',
    tags: ['shipping', 'international', 'dhl', 'express', 'gratuit'],
    config: {
      siteId: '',
      password: '',
      accountNumber: '',
      defaultService: 'EXPRESS WORLDWIDE',
    },
    hooks: ['order.created', 'order.shipped'],
    permissions: ['orders.read', 'orders.update'],
    isPremium: false,
  },

  // MARKETING PLUGINS
  {
    name: 'Pop-up Marketing',
    slug: 'popup-marketing',
    description: 'Créez des pop-ups personnalisés pour capturer des emails, annoncer des promotions ou afficher des messages importants.',
    type: 'MARKETING',
    category: 'marketing',
    icon: '🎯',
    tags: ['marketing', 'popup', 'conversion', 'email-capture', 'gratuit'],
    config: {
      popups: [],
      defaultDelay: 5000,
      showOnMobile: true,
      respectDoNotTrack: true,
    },
    hooks: ['page.view', 'cart.updated'],
    permissions: ['analytics.read'],
    isPremium: false,
  },
  {
    name: 'Exit Intent',
    slug: 'exit-intent',
    description: 'Détectez quand un visiteur s\'apprête à quitter et affichez une offre de dernière chance pour le retenir.',
    type: 'MARKETING',
    category: 'marketing',
    icon: '🚪',
    tags: ['marketing', 'exit-intent', 'conversion', 'retention', 'gratuit'],
    config: {
      enabled: true,
      message: 'Attendez ! Profitez de 10% de réduction avec le code STAY10',
      discountCode: 'STAY10',
      showOnce: true,
      cookieDays: 7,
    },
    hooks: ['page.exit'],
    permissions: ['analytics.read'],
    isPremium: false,
  },
  {
    name: 'Barre de Livraison Gratuite',
    slug: 'free-shipping-bar',
    description: 'Affichez une barre de progression pour encourager les clients à atteindre le seuil de livraison gratuite.',
    type: 'MARKETING',
    category: 'marketing',
    icon: '🚚',
    tags: ['marketing', 'shipping', 'conversion', 'upsell', 'gratuit'],
    config: {
      threshold: 50,
      currency: 'EUR',
      messageBelow: 'Plus que {remaining}€ pour la livraison gratuite !',
      messageReached: 'Félicitations ! Vous bénéficiez de la livraison gratuite !',
      backgroundColor: '#10B981',
      textColor: '#FFFFFF',
    },
    hooks: ['cart.updated'],
    permissions: ['cart.read'],
    isPremium: false,
  },

  // SEO PLUGINS
  {
    name: 'SEO Avancé',
    slug: 'advanced-seo',
    description: 'Optimisez votre référencement avec des meta tags automatiques, sitemap XML, données structurées et analyse SEO.',
    type: 'SEO',
    category: 'seo',
    icon: '🔍',
    tags: ['seo', 'référencement', 'meta-tags', 'sitemap', 'gratuit'],
    config: {
      autoMetaDescription: true,
      autoOgTags: true,
      generateSitemap: true,
      sitemapFrequency: 'daily',
      structuredData: true,
      robotsTxt: true,
      canonicalUrls: true,
    },
    hooks: ['page.render', 'product.created', 'product.updated'],
    permissions: ['products.read', 'categories.read'],
    isPremium: false,
  },
  {
    name: 'Rich Snippets',
    slug: 'rich-snippets',
    description: 'Ajoutez des données structurées Schema.org pour afficher des rich snippets dans les résultats Google (prix, avis, stock).',
    type: 'SEO',
    category: 'seo',
    icon: '⭐',
    tags: ['seo', 'schema', 'rich-snippets', 'google', 'gratuit'],
    config: {
      productSchema: true,
      reviewSchema: true,
      breadcrumbSchema: true,
      organizationSchema: true,
      faqSchema: true,
    },
    hooks: ['page.render'],
    permissions: ['products.read'],
    isPremium: false,
  },

  // ANALYTICS PLUGINS
  {
    name: 'Google Analytics 4',
    slug: 'google-analytics',
    description: 'Intégration complète Google Analytics 4 avec suivi e-commerce amélioré, événements personnalisés et rapports de conversion.',
    type: 'ANALYTICS',
    category: 'analytics',
    icon: '📊',
    tags: ['analytics', 'google', 'tracking', 'conversion', 'gratuit'],
    config: {
      measurementId: '',
      enableEcommerce: true,
      anonymizeIp: true,
      trackPageViews: true,
      trackEvents: true,
      debugMode: false,
    },
    hooks: ['page.view', 'product.view', 'cart.add', 'cart.remove', 'checkout.start', 'order.completed'],
    permissions: ['analytics.write'],
    isPremium: false,
  },
  {
    name: 'Facebook Pixel',
    slug: 'facebook-pixel',
    description: 'Suivez les conversions, créez des audiences personnalisées et optimisez vos campagnes publicitaires Facebook et Instagram.',
    type: 'ANALYTICS',
    category: 'analytics',
    icon: '📘',
    tags: ['analytics', 'facebook', 'meta', 'pixel', 'ads', 'gratuit'],
    config: {
      pixelId: '',
      enableAdvancedMatching: true,
      trackPageViews: true,
      trackPurchases: true,
      trackAddToCart: true,
      trackInitiateCheckout: true,
    },
    hooks: ['page.view', 'product.view', 'cart.add', 'checkout.start', 'order.completed'],
    permissions: ['analytics.write'],
    isPremium: false,
  },
  {
    name: 'Hotjar',
    slug: 'hotjar',
    description: 'Comprenez le comportement de vos visiteurs avec des heatmaps, enregistrements de sessions et sondages.',
    type: 'ANALYTICS',
    category: 'analytics',
    icon: '🔥',
    tags: ['analytics', 'hotjar', 'heatmap', 'ux', 'gratuit'],
    config: {
      siteId: '',
      enableHeatmaps: true,
      enableRecordings: true,
      enableSurveys: false,
    },
    hooks: ['page.view'],
    permissions: ['analytics.write'],
    isPremium: false,
  },

  // INTEGRATION PLUGINS
  {
    name: 'Mailchimp',
    slug: 'mailchimp',
    description: 'Synchronisez vos clients et commandes avec Mailchimp pour des campagnes email automatisées et segmentées.',
    type: 'INTEGRATION',
    category: 'email',
    icon: '🐵',
    tags: ['integration', 'email', 'mailchimp', 'newsletter', 'automation', 'gratuit'],
    config: {
      apiKey: '',
      listId: '',
      syncCustomers: true,
      syncOrders: true,
      doubleOptIn: true,
      tags: [],
    },
    hooks: ['customer.created', 'order.completed', 'newsletter.subscribe'],
    permissions: ['customers.read', 'orders.read'],
    isPremium: false,
  },
  {
    name: 'Zapier',
    slug: 'zapier',
    description: 'Connectez FoxCard à plus de 5000 applications avec Zapier. Automatisez vos workflows sans code.',
    type: 'INTEGRATION',
    category: 'automation',
    icon: '⚡',
    tags: ['integration', 'zapier', 'automation', 'workflow', 'gratuit'],
    config: {
      webhookUrl: '',
      triggers: ['order.created', 'customer.created', 'product.created'],
    },
    hooks: ['order.created', 'customer.created', 'product.created'],
    permissions: ['webhooks.create'],
    isPremium: false,
  },

  // UTILITY PLUGINS
  {
    name: 'Avis Clients',
    slug: 'customer-reviews',
    description: 'Collectez et affichez les avis clients sur vos produits. Emails de demande d\'avis automatiques après achat.',
    type: 'UTILITY',
    category: 'reviews',
    icon: '⭐',
    tags: ['reviews', 'avis', 'social-proof', 'conversion', 'gratuit'],
    config: {
      autoRequestReview: true,
      requestDelay: 7, // days after delivery
      requirePurchase: true,
      moderateReviews: true,
      allowPhotos: true,
      showVerifiedBadge: true,
    },
    hooks: ['order.delivered', 'review.created'],
    permissions: ['orders.read', 'products.update'],
    isPremium: false,
  },
  {
    name: 'Wishlist',
    slug: 'wishlist',
    description: 'Permettez à vos clients de sauvegarder leurs produits favoris et de les retrouver facilement.',
    type: 'UTILITY',
    category: 'ux',
    icon: '❤️',
    tags: ['wishlist', 'favorites', 'ux', 'conversion', 'gratuit'],
    config: {
      guestWishlist: true,
      maxItems: 50,
      shareEnabled: true,
      notifyPriceDrop: true,
      notifyBackInStock: true,
    },
    hooks: ['wishlist.add', 'wishlist.remove', 'product.priceChanged', 'product.backInStock'],
    permissions: ['customers.read', 'products.read'],
    isPremium: false,
  },
]

/**
 * Seed plugin presets for marketplace
 */
export async function seedPluginPresets(prisma: PrismaClient) {
  const createdPresets = []

  for (const presetData of pluginPresets) {
    // Check if preset already exists
    const existingPreset = await prisma.pluginPreset.findUnique({
      where: { slug: presetData.slug },
    })

    if (existingPreset) {
      console.log(`Plugin preset ${presetData.name} already exists`)
      createdPresets.push(existingPreset)
      continue
    }

    // Create preset
    const preset = await prisma.pluginPreset.create({
      data: {
        name: presetData.name,
        slug: presetData.slug,
        description: presetData.description,
        type: presetData.type as any,
        category: presetData.category,
        icon: presetData.icon,
        config: presetData.config,
        hooks: presetData.hooks,
        permissions: presetData.permissions,
        tags: presetData.tags,
        isPublic: true,
        isPremium: presetData.isPremium,
        author: 'FoxCard',
        version: '1.0.0',
      },
    })

    console.log(`✓ Created plugin preset: ${preset.name}`)
    createdPresets.push(preset)
  }

  return createdPresets
}

/**
 * Check if plugin presets exist
 */
export async function hasPluginPresets(prisma: PrismaClient): Promise<boolean> {
  const count = await prisma.pluginPreset.count()
  return count >= pluginPresets.length
}
