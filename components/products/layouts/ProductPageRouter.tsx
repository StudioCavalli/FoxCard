'use client'

import { useStoreCommerceType } from '@/lib/commerce-types/hooks'
import { StandardProductPage } from './StandardProductPage'
import { HotelRoomPage } from './HotelRoomPage'
import { TravelPackagePage } from './TravelPackagePage'
import { RestaurantMenuPage } from './RestaurantMenuPage'
import { DigitalProductPage } from './DigitalProductPage'
import { ServiceBookingPage } from './ServiceBookingPage'
import { AlcoholProductPage } from './AlcoholProductPage'

interface ProductPageRouterProps {
  product: any
  storeId: string
}

export function ProductPageRouter({ product, storeId }: ProductPageRouterProps) {
  const { type: commerceType, isLoading } = useStoreCommerceType(storeId)

  if (isLoading) {
    return <ProductPageSkeleton />
  }

  // Route to appropriate layout based on commerce type
  switch (commerceType) {
    case 'HOTEL':
      return <HotelRoomPage product={product} />
    case 'TRAVEL':
      return <TravelPackagePage product={product} />
    case 'RESTAURANT':
      return <RestaurantMenuPage product={product} />
    case 'DIGITAL':
      return <DigitalProductPage product={product} />
    case 'SERVICES':
    case 'RECREATION':
      return <ServiceBookingPage product={product} />
    case 'ALCOHOL':
      return <AlcoholProductPage product={product} />
    default:
      // Standard e-commerce layout for GENERAL, FASHION, ELECTRONICS, etc.
      return <StandardProductPage product={product} />
  }
}

function ProductPageSkeleton() {
  return (
    <div style={{ fontFamily: 'var(--theme-font-body)' }}>
      <div className="mx-auto px-6 lg:px-8 py-16" style={{ maxWidth: 'var(--theme-container-max-width)' }}>
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-32 bg-theme-surface border border-theme-border rounded-xl" />
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-theme-surface border border-theme-border aspect-square rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-theme-surface border border-theme-border rounded-xl" />
              <div className="h-6 w-1/2 bg-theme-surface border border-theme-border rounded-xl" />
              <div className="h-24 bg-theme-surface border border-theme-border rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
