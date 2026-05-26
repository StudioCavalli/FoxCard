import { z } from 'zod'
import { router, publicProcedure, protectedProcedure, requireStoreAccess } from '../trpc'
import { TRPCError } from '@trpc/server'
import { getMaxStoresPerUser } from '@/lib/platform/settings'

export const storeRouter = router({
  // Get store directory with pagination and filters
  getDirectory: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        countries: z.array(z.string()).optional(),
        sortBy: z.enum(['name', 'newest', 'rating', 'products']).default('name'),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        showOnDirectory: true, // Only show stores that opted in
        status: 'ACTIVE', // Only show active stores (not suspended, pending, or closed)
      }

      // Search by name or description
      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { description: { contains: input.search, mode: 'insensitive' } },
        ]
      }

      // Filter by countries
      if (input.countries && input.countries.length > 0) {
        where.countries = { hasSome: input.countries }
      }

      // Determine sort order
      let orderBy: any = { name: 'asc' }
      switch (input.sortBy) {
        case 'newest':
          orderBy = { createdAt: 'desc' }
          break
        case 'rating':
          orderBy = { rating: 'desc' }
          break
        case 'products':
          // For products count, we'll sort in memory after fetching
          orderBy = { name: 'asc' }
          break
      }

      const [stores, total] = await Promise.all([
        ctx.prisma.store.findMany({
          where,
          include: {
            _count: {
              select: {
                products: { where: { status: 'ACTIVE' } },
              },
            },
          },
          orderBy,
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.store.count({ where }),
      ])

      // Sort by products count if requested
      let sortedStores = stores
      if (input.sortBy === 'products') {
        sortedStores = stores.sort((a, b) => b._count.products - a._count.products)
      }

      return {
        stores: sortedStores.map((store) => ({
          id: store.id,
          name: store.name,
          slug: store.slug,
          description: store.description,
          logo: store.logo,
          tagline: store.tagline,
          countries: store.countries,
          rating: store.rating,
          reviewsCount: store.reviewsCount,
          productsCount: store._count.products,
        })),
        total,
        hasMore: input.offset + input.limit < total,
      }
    }),

  // Get store by slug with full details for public storefront
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const store = await ctx.prisma.store.findUnique({
        where: { slug: input.slug },
        include: {
          owner: {
            select: {
              name: true,
            },
          },
          categories: {
            where: {
              products: {
                some: {
                  status: 'ACTIVE',
                },
              },
            },
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              image: true,
              _count: {
                select: {
                  products: { where: { status: 'ACTIVE' } },
                },
              },
            },
          },
          _count: {
            select: {
              products: { where: { status: 'ACTIVE' } },
              orders: { where: { status: 'COMPLETED' } },
            },
          },
        },
      })

      if (!store) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' })
      }

      return store
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.store.findUnique({
        where: { id: input.id },
      })
    }),

  getUserStores: protectedProcedure.query(async ({ ctx }) => {
    // Get stores owned by the user
    const ownedStores = await ctx.prisma.store.findMany({
      where: {
        ownerId: ctx.session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Get stores where user is a member with ACTIVE status
    const memberStores = await ctx.prisma.storeUser.findMany({
      where: {
        userId: ctx.session.user.id,
        status: 'ACTIVE',
      },
      include: {
        store: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Combine and deduplicate stores
    const allStores = [
      ...ownedStores,
      ...memberStores.map(su => su.store),
    ]

    // Remove duplicates based on store ID
    const uniqueStores = allStores.filter((store, index, self) =>
      index === self.findIndex(s => s.id === store.id)
    )

    return uniqueStores.sort((a, b) =>
      b.createdAt.getTime() - a.createdAt.getTime()
    )
  }),

  getPublicStores: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.store.findMany({
      where: {
        status: 'ACTIVE',
        showOnDirectory: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        description: true,
      },
      orderBy: { name: 'asc' },
    })
  }),

  // Get stores for explore page with map support
  exploreStores: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(24),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        countries: z.array(z.string()).optional(),
        commerceType: z.string().optional(),
        sortBy: z.enum(['name', 'newest', 'rating', 'popular']).default('name'),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        showOnDirectory: true,
        status: 'ACTIVE',
      }

      // Search by name or description
      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { description: { contains: input.search, mode: 'insensitive' } },
          { tagline: { contains: input.search, mode: 'insensitive' } },
        ]
      }

      // Filter by countries
      if (input.countries && input.countries.length > 0) {
        where.countries = { hasSome: input.countries }
      }

      // Filter by commerce type
      if (input.commerceType && input.commerceType !== 'ALL') {
        where.commerceType = input.commerceType
      }

      // Determine sort order
      let orderBy: any = { name: 'asc' }
      switch (input.sortBy) {
        case 'newest':
          orderBy = { createdAt: 'desc' }
          break
        case 'rating':
          orderBy = [{ rating: 'desc' }, { reviewsCount: 'desc' }]
          break
        case 'popular':
          orderBy = { reviewsCount: 'desc' }
          break
      }

      const [stores, total, allCountries] = await Promise.all([
        ctx.prisma.store.findMany({
          where,
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            logo: true,
            tagline: true,
            bannerImage: true,
            countries: true,
            commerceType: true,
            rating: true,
            reviewsCount: true,
            createdAt: true,
            _count: {
              select: {
                products: { where: { status: 'ACTIVE' } },
              },
            },
          },
          orderBy,
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.store.count({ where }),
        // Get all unique countries for filter options
        ctx.prisma.store.findMany({
          where: { showOnDirectory: true, status: 'ACTIVE' },
          select: { countries: true },
        }),
      ])

      // Extract unique countries
      const countriesSet = new Set<string>()
      allCountries.forEach((store) => {
        if (store.countries) {
          store.countries.forEach((country) => {
            countriesSet.add(country)
          })
        }
      })

      return {
        stores: stores.map((store) => ({
          id: store.id,
          name: store.name,
          slug: store.slug,
          description: store.description,
          logo: store.logo,
          tagline: store.tagline,
          bannerImage: store.bannerImage,
          countries: store.countries,
          commerceType: store.commerceType,
          rating: store.rating,
          reviewsCount: store.reviewsCount,
          productsCount: store._count.products,
          createdAt: store.createdAt,
        })),
        total,
        hasMore: input.offset + input.limit < total,
        availableCountries: Array.from(countriesSet).sort(),
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        logo: z.string().optional(),
        domain: z.string().optional(),
        commerceType: z.enum([
          'GENERAL', 'FOOD', 'ALCOHOL', 'FASHION', 'ELECTRONICS', 'BEAUTY',
          'HOME', 'SPORTS', 'TOYS', 'AUTOMOTIVE', 'BOOKS', 'PETS', 'DIGITAL',
          'SERVICES', 'SEASONAL', 'RESTAURANT', 'HOTEL', 'TRAVEL', 'RECREATION'
        ]).optional(),
        commerceConfig: z.record(z.string(), z.unknown()).optional(),
        publicEmail: z.string().email().optional().or(z.literal('')),
        publicPhone: z.string().optional(),
        countries: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check max stores per user limit from platform settings
      const maxStores = await getMaxStoresPerUser()
      const userStoreCount = await ctx.prisma.store.count({
        where: { ownerId: ctx.session.user.id },
      })

      if (userStoreCount >= maxStores) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Vous avez atteint la limite de ${maxStores} boutique(s) par utilisateur.`,
        })
      }

      // Create store, owner role, and StoreUser in a transaction
      const store = await ctx.prisma.$transaction(async (tx) => {
        // 1. Create the store
        const newStore = await tx.store.create({
          data: {
            name: input.name,
            slug: input.slug,
            description: input.description,
            logo: input.logo,
            domain: input.domain,
            commerceType: input.commerceType,
            commerceConfig: input.commerceConfig as any,
            publicEmail: input.publicEmail || null,
            publicPhone: input.publicPhone,
            countries: input.countries || [],
            ownerId: ctx.session.user.id,
          },
        })

        // 2. Create the Owner role with all permissions
        const ownerRole = await tx.role.create({
          data: {
            storeId: newStore.id,
            name: 'Owner',
            isSystem: true,
            permissions: [
              'store:manage',
              'products:create',
              'products:read',
              'products:update',
              'products:delete',
              'orders:read',
              'orders:update',
              'orders:refund',
              'customers:read',
              'customers:update',
              'analytics:read',
              'team:manage',
              'settings:manage',
            ],
          },
        })

        // 3. Create StoreUser linking the owner to the store
        await tx.storeUser.create({
          data: {
            userId: ctx.session.user.id,
            storeId: newStore.id,
            roleId: ownerRole.id,
            status: 'ACTIVE',
          },
        })

        return newStore
      })

      return store
    }),

  update: requireStoreAccess
    .input(
      z.object({
        storeId: z.string(),
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        logo: z.string().optional(),
        domain: z.string().optional(),
        settings: z.any().optional(),
        theme: z.any().optional(),
        countries: z.array(z.string()).optional(),
        // Restaurant/Business hours
        openingHours: z.any().optional(),
        specialDates: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { storeId, ...data } = input
      return ctx.prisma.store.update({
        where: { id: storeId },
        data,
      })
    }),

  delete: requireStoreAccess
    .input(z.object({ storeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Only store owner can delete the store
      if (!(ctx as any).isStoreOwner) {
        throw new Error('Only the store owner can delete the store')
      }

      return ctx.prisma.store.delete({
        where: { id: input.storeId },
      })
    }),

  // Get featured products for a store
  getFeaturedProducts: publicProcedure
    .input(z.object({ storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      const store = await ctx.prisma.store.findUnique({
        where: { id: input.storeId },
        select: { featuredProductIds: true },
      })

      if (!store || !store.featuredProductIds || store.featuredProductIds.length === 0) {
        return []
      }

      // Get featured products in the order specified
      const products = await ctx.prisma.product.findMany({
        where: {
          id: { in: store.featuredProductIds },
          status: 'ACTIVE',
        },
        include: {
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      })

      // Sort by featured order
      return store.featuredProductIds
        .map(id => products.find(p => p.id === id))
        .filter(Boolean)
    }),

  // Get public stats for a store
  getStats: publicProcedure
    .input(z.object({ storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [productsCount, completedOrdersCount] = await Promise.all([
        ctx.prisma.product.count({
          where: {
            storeId: input.storeId,
            status: 'ACTIVE',
          },
        }),
        ctx.prisma.order.count({
          where: {
            storeId: input.storeId,
            status: 'COMPLETED',
          },
        }),
      ])

      const store = await ctx.prisma.store.findUnique({
        where: { id: input.storeId },
        select: {
          rating: true,
          reviewsCount: true,
        },
      })

      return {
        productsCount,
        ordersCount: completedOrdersCount,
        rating: store?.rating || 0,
        reviewsCount: store?.reviewsCount || 0,
      }
    }),

  // Send contact message to merchant
  sendContactMessage: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
        name: z.string().min(1),
        email: z.string().email(),
        subject: z.string().min(1),
        message: z.string().min(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const store = await ctx.prisma.store.findUnique({
        where: { id: input.storeId },
        include: {
          owner: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      })

      if (!store) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' })
      }

      // HTML escape function to prevent XSS
      const escapeHtml = (str: string) => {
        return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;')
      }

      // Create email log for contact form
      await ctx.prisma.emailLog.create({
        data: {
          storeId: input.storeId,
          templateName: 'contact_form',
          to: store.publicEmail || store.owner.email,
          from: input.email,
          subject: `Contact Form: ${escapeHtml(input.subject)}`,
          htmlBody: `
            <h2>New Contact Form Message</h2>
            <p><strong>From:</strong> ${escapeHtml(input.name)} (${escapeHtml(input.email)})</p>
            <p><strong>Subject:</strong> ${escapeHtml(input.subject)}</p>
            <p><strong>Message:</strong></p>
            <p>${escapeHtml(input.message).replace(/\n/g, '<br>')}</p>
          `,
          textBody: `
            New Contact Form Message
            From: ${input.name} (${input.email})
            Subject: ${input.subject}
            Message: ${input.message}
          `,
          status: 'PENDING',
        },
      })

      return {
        success: true,
        message: 'Your message has been sent successfully. The merchant will contact you soon.',
      }
    }),

  // Update storefront content (admin only)
  updateStorefront: requireStoreAccess
    .input(
      z.object({
        storeId: z.string(),
        tagline: z.string().optional(),
        bannerImage: z.string().optional(),
        story: z.string().optional(),
        foundedAt: z.date().optional(),
        socialLinks: z
          .object({
            facebook: z.string().optional(),
            instagram: z.string().optional(),
            twitter: z.string().optional(),
            linkedin: z.string().optional(),
            youtube: z.string().optional(),
          })
          .optional(),
        publicEmail: z.string().email().optional(),
        publicPhone: z.string().optional(),
        publicAddress: z
          .object({
            street: z.string().optional(),
            city: z.string().optional(),
            postalCode: z.string().optional(),
            country: z.string().optional(),
          })
          .optional(),
        featuredProductIds: z.array(z.string()).max(6).optional(),
        showOnDirectory: z.boolean().optional(),
        countries: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { storeId, ...data } = input

      return ctx.prisma.store.update({
        where: { id: storeId },
        data,
      })
    }),

  // Get store status for merchant (includes suspension info)
  getStoreStatus: protectedProcedure
    .input(z.object({ storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      const store = await ctx.prisma.store.findUnique({
        where: { id: input.storeId },
        select: {
          id: true,
          name: true,
          status: true,
          suspendedAt: true,
          suspendedReason: true,
          ownerId: true,
        },
      })

      if (!store) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' })
      }

      // Verify user has access to this store
      const isOwner = store.ownerId === ctx.session.user.id
      const isStoreUser = await ctx.prisma.storeUser.findUnique({
        where: {
          userId_storeId: {
            userId: ctx.session.user.id,
            storeId: input.storeId,
          },
        },
      })

      if (!isOwner && !isStoreUser) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      // Get pending appeals for this store
      const pendingAppeal = await ctx.prisma.suspensionAppeal.findFirst({
        where: {
          storeId: input.storeId,
          status: { in: ['PENDING', 'REVIEWING'] },
        },
        orderBy: { createdAt: 'desc' },
      })

      // Get last appeal (if any)
      const lastAppeal = await ctx.prisma.suspensionAppeal.findFirst({
        where: { storeId: input.storeId },
        orderBy: { createdAt: 'desc' },
      })

      return {
        ...store,
        hasPendingAppeal: !!pendingAppeal,
        lastAppeal: lastAppeal
          ? {
              status: lastAppeal.status,
              message: lastAppeal.message,
              adminResponse: lastAppeal.adminResponse,
              createdAt: lastAppeal.createdAt,
              reviewedAt: lastAppeal.reviewedAt,
            }
          : null,
      }
    }),

  // Submit a suspension appeal
  submitAppeal: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
        message: z.string().min(50, 'Le message doit contenir au moins 50 caractères'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the store exists and is suspended
      const store = await ctx.prisma.store.findUnique({
        where: { id: input.storeId },
        select: { id: true, status: true, ownerId: true },
      })

      if (!store) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' })
      }

      // Verify user has access to this store
      const isOwner = store.ownerId === ctx.session.user.id
      const isStoreUser = await ctx.prisma.storeUser.findUnique({
        where: {
          userId_storeId: {
            userId: ctx.session.user.id,
            storeId: input.storeId,
          },
        },
      })

      if (!isOwner && !isStoreUser) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' })
      }

      // Only allow appeals for suspended stores
      if (store.status !== 'SUSPENDED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Vous ne pouvez faire appel que pour une boutique suspendue',
        })
      }

      // Check if there's already a pending appeal
      const existingAppeal = await ctx.prisma.suspensionAppeal.findFirst({
        where: {
          storeId: input.storeId,
          status: { in: ['PENDING', 'REVIEWING'] },
        },
      })

      if (existingAppeal) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Un appel est déjà en cours de traitement pour cette boutique',
        })
      }

      // Create the appeal
      const appeal = await ctx.prisma.suspensionAppeal.create({
        data: {
          storeId: input.storeId,
          userId: ctx.session.user.id,
          message: input.message,
          status: 'PENDING',
        },
      })

      return {
        success: true,
        message: 'Votre appel a été soumis avec succès. Un administrateur l\'examinera sous peu.',
        appeal,
      }
    }),
})
