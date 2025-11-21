import { type CommerceType, commerceTypeConfigs } from '@/lib/commerce-types'

export type CheckoutType = 'physical' | 'digital' | 'booking' | 'mixed'

export interface CartItemForCheckout {
  productId: string
  storeId: string
  commerceType?: CommerceType
  productType?: 'SIMPLE' | 'VARIABLE' | 'DIGITAL'
  attributes?: Record<string, unknown>
}

export interface CheckoutFlowConfig {
  type: CheckoutType
  steps: {
    id: string
    name: string
    icon: string
    required: boolean
  }[]
  requiresShipping: boolean
  requiresBooking: boolean
  hasDigitalDelivery: boolean
  requiresAgeVerification: boolean
}

// Determine checkout type based on cart items
export function analyzeCartForCheckout(
  items: CartItemForCheckout[]
): CheckoutFlowConfig {
  let hasPhysical = false
  let hasDigital = false
  let hasBooking = false
  let hasAlcohol = false

  for (const item of items) {
    const commerceType = item.commerceType || 'GENERAL'
    const config = commerceTypeConfigs[commerceType]

    if (!config) continue

    // Check for alcohol products (requires age verification)
    if (commerceType === 'ALCOHOL') {
      hasAlcohol = true
    }

    // Check product type first
    if (item.productType === 'DIGITAL') {
      hasDigital = true
      continue
    }

    // Check commerce type features
    if (config.features.hasBookings || config.features.hasTimeslots) {
      hasBooking = true
    }

    if (config.features.hasDigitalProducts && !config.features.hasPhysicalProducts) {
      hasDigital = true
    }

    if (config.features.hasPhysicalProducts && config.features.requiresShipping) {
      hasPhysical = true
    }
  }

  // Determine checkout type
  let checkoutType: CheckoutType = 'physical'
  if (hasPhysical && hasDigital) {
    checkoutType = 'mixed'
  } else if (hasPhysical && hasBooking) {
    checkoutType = 'mixed'
  } else if (hasDigital && hasBooking) {
    checkoutType = 'mixed'
  } else if (hasDigital && !hasPhysical && !hasBooking) {
    checkoutType = 'digital'
  } else if (hasBooking && !hasPhysical && !hasDigital) {
    checkoutType = 'booking'
  }

  // Build checkout steps based on type
  const steps = getCheckoutSteps(checkoutType, hasPhysical, hasDigital, hasBooking)

  return {
    type: checkoutType,
    steps,
    requiresShipping: hasPhysical,
    requiresBooking: hasBooking,
    hasDigitalDelivery: hasDigital,
    requiresAgeVerification: hasAlcohol,
  }
}

function getCheckoutSteps(
  type: CheckoutType,
  hasPhysical: boolean,
  hasDigital: boolean,
  hasBooking: boolean
): CheckoutFlowConfig['steps'] {
  const steps: CheckoutFlowConfig['steps'] = []

  // Contact step is always first
  steps.push({
    id: 'contact',
    name: 'Contact',
    icon: 'Mail',
    required: true,
  })

  // Booking step for reservations
  if (hasBooking) {
    steps.push({
      id: 'booking',
      name: 'Réservation',
      icon: 'Calendar',
      required: true,
    })
  }

  // Shipping step only for physical products
  if (hasPhysical) {
    steps.push({
      id: 'shipping',
      name: 'Livraison',
      icon: 'MapPin',
      required: true,
    })
  }

  // Payment step is always last
  steps.push({
    id: 'payment',
    name: 'Paiement',
    icon: 'CreditCard',
    required: true,
  })

  return steps
}

// Commerce types that require booking
export const bookingCommerceTypes: CommerceType[] = [
  'HOTEL',
  'TRAVEL',
  'RECREATION',
  'RESTAURANT',
  'SERVICES',
]

// Commerce types that are purely digital
export const digitalCommerceTypes: CommerceType[] = [
  'DIGITAL',
]

// Check if a commerce type requires age verification at checkout
export function requiresAgeVerificationAtCheckout(commerceType: CommerceType): boolean {
  const config = commerceTypeConfigs[commerceType]
  return config?.features.requiresAgeVerification || false
}

// Get specific booking fields for a commerce type
export function getBookingFieldsForType(commerceType: CommerceType): {
  showDates: boolean
  showTimeslots: boolean
  showParticipants: boolean
  showRoomType: boolean
  showCheckinCheckout: boolean
} {
  switch (commerceType) {
    case 'HOTEL':
      return {
        showDates: true,
        showTimeslots: false,
        showParticipants: true,
        showRoomType: true,
        showCheckinCheckout: true,
      }
    case 'TRAVEL':
      return {
        showDates: true,
        showTimeslots: false,
        showParticipants: true,
        showRoomType: false,
        showCheckinCheckout: false,
      }
    case 'RECREATION':
      return {
        showDates: true,
        showTimeslots: true,
        showParticipants: true,
        showRoomType: false,
        showCheckinCheckout: false,
      }
    case 'RESTAURANT':
      return {
        showDates: true,
        showTimeslots: true,
        showParticipants: true,
        showRoomType: false,
        showCheckinCheckout: false,
      }
    case 'SERVICES':
      return {
        showDates: true,
        showTimeslots: true,
        showParticipants: false,
        showRoomType: false,
        showCheckinCheckout: false,
      }
    default:
      return {
        showDates: false,
        showTimeslots: false,
        showParticipants: false,
        showRoomType: false,
        showCheckinCheckout: false,
      }
  }
}
