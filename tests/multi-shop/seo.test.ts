import { describe, it, expect } from 'vitest'
import {
  generateStoreMetadata,
  generateProductMetadata,
  generateStoreJsonLd,
  generateProductJsonLd,
  generateBreadcrumbJsonLd,
} from '@/lib/seo/store-seo'

describe('Store SEO Generation', () => {
  const mockStore = {
    name: 'Test Store',
    description: 'A test store description',
    tagline: 'Best products online',
    logo: '/logo.png',
    bannerImage: '/banner.jpg',
    slug: 'test-store',
    publicEmail: 'contact@test.com',
    publicPhone: '+33123456789',
    publicAddress: {
      street: '123 Test Street',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
    },
    socialLinks: {
      facebook: 'https://facebook.com/test',
      instagram: 'https://instagram.com/test',
    },
  }

  describe('generateStoreMetadata', () => {
    it('should generate correct title with tagline', () => {
      const metadata = generateStoreMetadata(mockStore, 'fr')
      expect(metadata.title).toBe('Test Store - Best products online')
    })

    it('should generate correct title without tagline', () => {
      const storeWithoutTagline = { ...mockStore, tagline: null }
      const metadata = generateStoreMetadata(storeWithoutTagline, 'fr')
      expect(metadata.title).toBe('Test Store - Boutique en ligne')
    })

    it('should include description', () => {
      const metadata = generateStoreMetadata(mockStore, 'fr')
      expect(metadata.description).toBe('A test store description')
    })

    it('should include OpenGraph data', () => {
      const metadata = generateStoreMetadata(mockStore, 'fr')
      expect(metadata.openGraph?.siteName).toBe('Test Store')
      expect((metadata.openGraph as any)?.type).toBe('website')
    })

    it('should include Twitter card data', () => {
      const metadata = generateStoreMetadata(mockStore, 'fr')
      expect((metadata.twitter as any)?.card).toBe('summary_large_image')
    })

    it('should include language alternates', () => {
      const metadata = generateStoreMetadata(mockStore, 'fr')
      expect(metadata.alternates?.languages).toBeDefined()
      expect(metadata.alternates?.languages?.fr).toContain('/fr/stores/test-store')
      expect(metadata.alternates?.languages?.en).toContain('/en/stores/test-store')
    })
  })

  describe('generateStoreJsonLd', () => {
    it('should generate valid Store schema', () => {
      const jsonLd = generateStoreJsonLd(mockStore, 'fr')
      expect(jsonLd['@context']).toBe('https://schema.org')
      expect(jsonLd['@type']).toBe('Store')
      expect(jsonLd.name).toBe('Test Store')
    })

    it('should include contact information', () => {
      const jsonLd = generateStoreJsonLd(mockStore, 'fr')
      expect(jsonLd.email).toBe('contact@test.com')
      expect(jsonLd.telephone).toBe('+33123456789')
    })

    it('should include address', () => {
      const jsonLd = generateStoreJsonLd(mockStore, 'fr')
      expect(jsonLd.address?.['@type']).toBe('PostalAddress')
      expect(jsonLd.address?.streetAddress).toBe('123 Test Street')
      expect(jsonLd.address?.addressLocality).toBe('Paris')
    })

    it('should include social links', () => {
      const jsonLd = generateStoreJsonLd(mockStore, 'fr')
      expect(jsonLd.sameAs).toContain('https://facebook.com/test')
      expect(jsonLd.sameAs).toContain('https://instagram.com/test')
    })
  })
})

describe('Product SEO Generation', () => {
  const mockProduct = {
    name: 'Test Product',
    description: 'A great product',
    slug: 'test-product',
    images: [{ url: '/product1.jpg' }, { url: '/product2.jpg' }],
    price: 2999, // In cents
    compareAtPrice: 3999,
    currency: 'EUR',
    storeSlug: 'test-store',
    storeName: 'Test Store',
    category: 'Electronics',
    inStock: true,
  }

  describe('generateProductMetadata', () => {
    it('should generate correct title', () => {
      const metadata = generateProductMetadata(mockProduct, 'fr')
      expect(metadata.title).toBe('Test Product | Test Store')
    })

    it('should include description', () => {
      const metadata = generateProductMetadata(mockProduct, 'fr')
      expect(metadata.description).toBe('A great product')
    })

    it('should include OpenGraph data', () => {
      const metadata = generateProductMetadata(mockProduct, 'fr')
      expect(metadata.openGraph?.siteName).toBe('Test Store')
    })
  })

  describe('generateProductJsonLd', () => {
    it('should generate valid Product schema', () => {
      const jsonLd = generateProductJsonLd(mockProduct, 'fr')
      expect(jsonLd['@context']).toBe('https://schema.org')
      expect(jsonLd['@type']).toBe('Product')
      expect(jsonLd.name).toBe('Test Product')
    })

    it('should include brand', () => {
      const jsonLd = generateProductJsonLd(mockProduct, 'fr')
      expect(jsonLd.brand?.['@type']).toBe('Brand')
      expect(jsonLd.brand?.name).toBe('Test Store')
    })

    it('should include offers', () => {
      const jsonLd = generateProductJsonLd(mockProduct, 'fr')
      expect(jsonLd.offers?.['@type']).toBe('Offer')
      expect(jsonLd.offers?.price).toBe('29.99') // Converted from cents
      expect(jsonLd.offers?.priceCurrency).toBe('EUR')
    })

    it('should indicate in stock availability', () => {
      const jsonLd = generateProductJsonLd(mockProduct, 'fr')
      expect(jsonLd.offers?.availability).toBe('https://schema.org/InStock')
    })

    it('should indicate out of stock availability', () => {
      const outOfStockProduct = { ...mockProduct, inStock: false }
      const jsonLd = generateProductJsonLd(outOfStockProduct, 'fr')
      expect(jsonLd.offers?.availability).toBe('https://schema.org/OutOfStock')
    })

    it('should include images', () => {
      const jsonLd = generateProductJsonLd(mockProduct, 'fr')
      expect(jsonLd.image).toHaveLength(2)
    })
  })
})

describe('Breadcrumb SEO Generation', () => {
  it('should generate valid BreadcrumbList schema', () => {
    const items = [
      { name: 'Home', url: 'https://example.com/' },
      { name: 'Stores', url: 'https://example.com/stores' },
      { name: 'Test Store', url: 'https://example.com/stores/test' },
    ]
    const jsonLd = generateBreadcrumbJsonLd(items)

    expect(jsonLd['@context']).toBe('https://schema.org')
    expect(jsonLd['@type']).toBe('BreadcrumbList')
    expect(jsonLd.itemListElement).toHaveLength(3)
  })

  it('should include position for each item', () => {
    const items = [
      { name: 'Home', url: 'https://example.com/' },
      { name: 'Products', url: 'https://example.com/products' },
    ]
    const jsonLd = generateBreadcrumbJsonLd(items)

    expect(jsonLd.itemListElement[0].position).toBe(1)
    expect(jsonLd.itemListElement[1].position).toBe(2)
  })

  it('should include name and item for each entry', () => {
    const items = [{ name: 'Home', url: 'https://example.com/' }]
    const jsonLd = generateBreadcrumbJsonLd(items)

    expect(jsonLd.itemListElement[0].name).toBe('Home')
    expect(jsonLd.itemListElement[0].item).toBe('https://example.com/')
  })
})
