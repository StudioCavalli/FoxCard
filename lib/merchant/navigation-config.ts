import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Settings,
  Percent,
  Truck,
  Palette,
  Mail,
  FileText,
  Send,
  BarChart3,
  TrendingUp,
  Warehouse,
  MapPin,
  Eye,
  Box,
  Receipt,
  Store,
  CreditCard,
  Megaphone,
  TestTube,
  CalendarCheck,
  Building2,
  Utensils,
  Wine,
  Plane,
  Ticket,
  Download,
  Clock,
  Map,
  Users2,
  BedDouble,
  UtensilsCrossed,
  Globe,
  Star,
  Layers,
  Coins,
  type LucideIcon,
} from 'lucide-react'
import { CommerceType } from '@/lib/commerce-types'

export interface NavItem {
  key: string
  href: string
  icon: LucideIcon
  labelKey: string // i18n key
  badge?: string | number
  hidden?: boolean // Hide from navigation (stub/upcoming features)
}

export interface NavGroup {
  key: string
  labelKey: string // i18n key
  icon: LucideIcon
  items: NavItem[]
}

export type NavigationConfig = (NavItem | NavGroup)[]

// Base navigation items shared across commerce types
const baseNavigation: NavigationConfig = [
  {
    key: 'dashboard',
    href: '',
    icon: LayoutDashboard,
    labelKey: 'merchant.navigation.dashboard',
  },
]

// Standard e-commerce navigation
const ecommerceNavigation: NavigationConfig = [
  ...baseNavigation,
  {
    key: 'catalog',
    labelKey: 'merchant.navigation.catalog',
    icon: Package,
    items: [
      { key: 'products', href: '/products', icon: Box, labelKey: 'merchant.navigation.products' },
      { key: 'categories', href: '/categories', icon: FolderTree, labelKey: 'merchant.navigation.categories' },
      { key: 'warehouses', href: '/warehouses', icon: Warehouse, labelKey: 'merchant.navigation.warehouses', hidden: true },
    ],
  },
  {
    key: 'sales',
    labelKey: 'merchant.navigation.sales',
    icon: ShoppingCart,
    items: [
      { key: 'orders', href: '/orders', icon: Package, labelKey: 'merchant.navigation.orders' },
      { key: 'customers', href: '/customers', icon: Users, labelKey: 'merchant.navigation.customers' },
      { key: 'abandoned', href: '/abandoned-carts', icon: ShoppingCart, labelKey: 'merchant.navigation.abandonedCarts', hidden: true },
      { key: 'discounts', href: '/discounts', icon: Percent, labelKey: 'merchant.navigation.discounts' },
    ],
  },
  {
    key: 'shipping',
    labelKey: 'merchant.navigation.shipping',
    icon: Truck,
    items: [
      { key: 'zones', href: '/shipping', icon: MapPin, labelKey: 'merchant.navigation.shippingZones', hidden: true },
      { key: 'taxes', href: '/taxes', icon: Receipt, labelKey: 'merchant.navigation.taxes', hidden: true },
    ],
  },
  {
    key: 'marketing',
    labelKey: 'merchant.navigation.marketing',
    icon: Megaphone,
    items: [
      { key: 'emails', href: '/emails', icon: Mail, labelKey: 'merchant.navigation.emails', hidden: true },
      { key: 'newsletter', href: '/newsletter', icon: Send, labelKey: 'merchant.navigation.newsletter', hidden: true },
      { key: 'ab-testing', href: '/ab-testing', icon: TestTube, labelKey: 'merchant.navigation.abTesting', hidden: true },
    ],
  },
  {
    key: 'analytics',
    labelKey: 'merchant.navigation.analytics',
    icon: BarChart3,
    items: [
      { key: 'overview', href: '/analytics', icon: TrendingUp, labelKey: 'merchant.navigation.overview' },
      { key: 'reports', href: '/reports', icon: FileText, labelKey: 'merchant.navigation.reports' },
    ],
  },
  {
    key: 'payments',
    labelKey: 'merchant.navigation.payments',
    icon: CreditCard,
    items: [
      { key: 'transactions', href: '/payments', icon: CreditCard, labelKey: 'merchant.navigation.transactions', hidden: true },
      { key: 'sunpay', href: '/sunpay', icon: Coins, labelKey: 'merchant.navigation.sunpay' },
    ],
  },
  {
    key: 'settings',
    labelKey: 'merchant.navigation.settings',
    icon: Settings,
    items: [
      { key: 'store', href: '/store', icon: Store, labelKey: 'merchant.navigation.store' },
      { key: 'team', href: '/team', icon: Users, labelKey: 'merchant.navigation.team' },
      { key: 'themes', href: '/themes', icon: Palette, labelKey: 'merchant.navigation.themes' },
      { key: 'general', href: '/settings', icon: Settings, labelKey: 'merchant.navigation.general' },
    ],
  },
]

// Hotel-specific navigation
const hotelNavigation: NavigationConfig = [
  ...baseNavigation,
  {
    key: 'rooms',
    labelKey: 'merchant.navigation.rooms',
    icon: BedDouble,
    items: [
      { key: 'room-list', href: '/rooms', icon: BedDouble, labelKey: 'merchant.navigation.roomList' },
      { key: 'room-types', href: '/room-types', icon: Layers, labelKey: 'merchant.navigation.roomTypes' },
      { key: 'amenities', href: '/amenities', icon: Star, labelKey: 'merchant.navigation.amenities' },
    ],
  },
  {
    key: 'reservations',
    labelKey: 'merchant.navigation.reservations',
    icon: CalendarCheck,
    items: [
      { key: 'calendar', href: '/reservations', icon: CalendarCheck, labelKey: 'merchant.navigation.calendar' },
      { key: 'guests', href: '/guests', icon: Users, labelKey: 'merchant.navigation.guests' },
      { key: 'check-in', href: '/check-in', icon: Building2, labelKey: 'merchant.navigation.checkIn' },
    ],
  },
  {
    key: 'pricing',
    labelKey: 'merchant.navigation.pricing',
    icon: Receipt,
    items: [
      { key: 'rates', href: '/rates', icon: Receipt, labelKey: 'merchant.navigation.rates' },
      { key: 'seasons', href: '/seasons', icon: Clock, labelKey: 'merchant.navigation.seasons' },
      { key: 'promotions', href: '/promotions', icon: Percent, labelKey: 'merchant.navigation.promotions' },
    ],
  },
  {
    key: 'analytics',
    labelKey: 'merchant.navigation.analytics',
    icon: BarChart3,
    items: [
      { key: 'occupancy', href: '/analytics/occupancy', icon: TrendingUp, labelKey: 'merchant.navigation.occupancy' },
      { key: 'revenue', href: '/analytics/revenue', icon: BarChart3, labelKey: 'merchant.navigation.revenue' },
    ],
  },
  {
    key: 'settings',
    labelKey: 'merchant.navigation.settings',
    icon: Settings,
    items: [
      { key: 'property', href: '/store', icon: Building2, labelKey: 'merchant.navigation.property' },
      { key: 'team', href: '/team', icon: Users, labelKey: 'merchant.navigation.team' },
      { key: 'themes', href: '/themes', icon: Palette, labelKey: 'merchant.navigation.themes' },
      { key: 'general', href: '/settings', icon: Settings, labelKey: 'merchant.navigation.general' },
    ],
  },
]

// Restaurant-specific navigation
const restaurantNavigation: NavigationConfig = [
  ...baseNavigation,
  {
    key: 'menu',
    labelKey: 'merchant.navigation.menu',
    icon: UtensilsCrossed,
    items: [
      { key: 'items', href: '/products', icon: Utensils, labelKey: 'merchant.navigation.menuItems' },
      { key: 'categories', href: '/categories', icon: FolderTree, labelKey: 'merchant.navigation.menuCategories' },
      { key: 'modifiers', href: '/modifiers', icon: Layers, labelKey: 'merchant.navigation.modifiers' },
    ],
  },
  {
    key: 'orders',
    labelKey: 'merchant.navigation.orders',
    icon: ShoppingCart,
    items: [
      { key: 'live', href: '/orders/live', icon: Clock, labelKey: 'merchant.navigation.liveOrders' },
      { key: 'history', href: '/orders', icon: Package, labelKey: 'merchant.navigation.orderHistory' },
      { key: 'delivery', href: '/delivery', icon: Truck, labelKey: 'merchant.navigation.delivery' },
    ],
  },
  {
    key: 'tables',
    labelKey: 'merchant.navigation.tables',
    icon: Map,
    items: [
      { key: 'floor-plan', href: '/tables', icon: Map, labelKey: 'merchant.navigation.floorPlan' },
      { key: 'reservations', href: '/reservations', icon: CalendarCheck, labelKey: 'merchant.navigation.tableReservations' },
    ],
  },
  {
    key: 'customers',
    labelKey: 'merchant.navigation.customers',
    icon: Users,
    items: [
      { key: 'list', href: '/customers', icon: Users, labelKey: 'merchant.navigation.customerList' },
      { key: 'loyalty', href: '/loyalty', icon: Star, labelKey: 'merchant.navigation.loyalty' },
    ],
  },
  {
    key: 'analytics',
    labelKey: 'merchant.navigation.analytics',
    icon: BarChart3,
    items: [
      { key: 'sales', href: '/analytics', icon: TrendingUp, labelKey: 'merchant.navigation.salesAnalytics' },
      { key: 'reports', href: '/reports', icon: FileText, labelKey: 'merchant.navigation.reports' },
    ],
  },
  {
    key: 'settings',
    labelKey: 'merchant.navigation.settings',
    icon: Settings,
    items: [
      { key: 'restaurant', href: '/store', icon: Store, labelKey: 'merchant.navigation.restaurantSettings' },
      { key: 'team', href: '/team', icon: Users, labelKey: 'merchant.navigation.team' },
      { key: 'hours', href: '/hours', icon: Clock, labelKey: 'merchant.navigation.openingHours' },
      { key: 'themes', href: '/themes', icon: Palette, labelKey: 'merchant.navigation.themes' },
    ],
  },
]

// Travel agency-specific navigation
const travelNavigation: NavigationConfig = [
  ...baseNavigation,
  {
    key: 'packages',
    labelKey: 'merchant.navigation.packages',
    icon: Globe,
    items: [
      { key: 'trips', href: '/products', icon: Plane, labelKey: 'merchant.navigation.trips' },
      { key: 'destinations', href: '/destinations', icon: Map, labelKey: 'merchant.navigation.destinations' },
      { key: 'itineraries', href: '/itineraries', icon: FileText, labelKey: 'merchant.navigation.itineraries' },
    ],
  },
  {
    key: 'bookings',
    labelKey: 'merchant.navigation.bookings',
    icon: CalendarCheck,
    items: [
      { key: 'reservations', href: '/orders', icon: CalendarCheck, labelKey: 'merchant.navigation.reservations' },
      { key: 'departures', href: '/departures', icon: Plane, labelKey: 'merchant.navigation.departures' },
      { key: 'passengers', href: '/customers', icon: Users2, labelKey: 'merchant.navigation.passengers' },
    ],
  },
  {
    key: 'documents',
    labelKey: 'merchant.navigation.documents',
    icon: FileText,
    items: [
      { key: 'vouchers', href: '/vouchers', icon: Ticket, labelKey: 'merchant.navigation.vouchers' },
      { key: 'contracts', href: '/contracts', icon: FileText, labelKey: 'merchant.navigation.contracts' },
    ],
  },
  {
    key: 'analytics',
    labelKey: 'merchant.navigation.analytics',
    icon: BarChart3,
    items: [
      { key: 'sales', href: '/analytics', icon: TrendingUp, labelKey: 'merchant.navigation.sales' },
      { key: 'reports', href: '/reports', icon: FileText, labelKey: 'merchant.navigation.reports' },
    ],
  },
  {
    key: 'settings',
    labelKey: 'merchant.navigation.settings',
    icon: Settings,
    items: [
      { key: 'agency', href: '/store', icon: Globe, labelKey: 'merchant.navigation.agencySettings' },
      { key: 'team', href: '/team', icon: Users, labelKey: 'merchant.navigation.team' },
      { key: 'themes', href: '/themes', icon: Palette, labelKey: 'merchant.navigation.themes' },
    ],
  },
]

// Digital products navigation
const digitalNavigation: NavigationConfig = [
  ...baseNavigation,
  {
    key: 'products',
    labelKey: 'merchant.navigation.products',
    icon: Download,
    items: [
      { key: 'downloads', href: '/products', icon: Download, labelKey: 'merchant.navigation.downloads' },
      { key: 'categories', href: '/categories', icon: FolderTree, labelKey: 'merchant.navigation.categories' },
      { key: 'licenses', href: '/licenses', icon: FileText, labelKey: 'merchant.navigation.licenses' },
    ],
  },
  {
    key: 'sales',
    labelKey: 'merchant.navigation.sales',
    icon: ShoppingCart,
    items: [
      { key: 'orders', href: '/orders', icon: Package, labelKey: 'merchant.navigation.orders' },
      { key: 'customers', href: '/customers', icon: Users, labelKey: 'merchant.navigation.customers' },
      { key: 'discounts', href: '/discounts', icon: Percent, labelKey: 'merchant.navigation.discounts' },
    ],
  },
  {
    key: 'marketing',
    labelKey: 'merchant.navigation.marketing',
    icon: Megaphone,
    items: [
      { key: 'emails', href: '/emails', icon: Mail, labelKey: 'merchant.navigation.emails', hidden: true },
      { key: 'newsletter', href: '/newsletter', icon: Send, labelKey: 'merchant.navigation.newsletter', hidden: true },
    ],
  },
  {
    key: 'analytics',
    labelKey: 'merchant.navigation.analytics',
    icon: BarChart3,
    items: [
      { key: 'downloads', href: '/analytics/downloads', icon: Download, labelKey: 'merchant.navigation.downloadStats' },
      { key: 'revenue', href: '/analytics', icon: TrendingUp, labelKey: 'merchant.navigation.revenue' },
    ],
  },
  {
    key: 'settings',
    labelKey: 'merchant.navigation.settings',
    icon: Settings,
    items: [
      { key: 'store', href: '/store', icon: Store, labelKey: 'merchant.navigation.store' },
      { key: 'team', href: '/team', icon: Users, labelKey: 'merchant.navigation.team' },
      { key: 'themes', href: '/themes', icon: Palette, labelKey: 'merchant.navigation.themes' },
    ],
  },
]

// Recreation/Activities navigation
const recreationNavigation: NavigationConfig = [
  ...baseNavigation,
  {
    key: 'activities',
    labelKey: 'merchant.navigation.activities',
    icon: Ticket,
    items: [
      { key: 'events', href: '/products', icon: Ticket, labelKey: 'merchant.navigation.events' },
      { key: 'categories', href: '/categories', icon: FolderTree, labelKey: 'merchant.navigation.categories' },
      { key: 'schedules', href: '/schedules', icon: CalendarCheck, labelKey: 'merchant.navigation.schedules' },
    ],
  },
  {
    key: 'bookings',
    labelKey: 'merchant.navigation.bookings',
    icon: CalendarCheck,
    items: [
      { key: 'reservations', href: '/orders', icon: CalendarCheck, labelKey: 'merchant.navigation.reservations' },
      { key: 'participants', href: '/customers', icon: Users2, labelKey: 'merchant.navigation.participants' },
      { key: 'calendar', href: '/calendar', icon: CalendarCheck, labelKey: 'merchant.navigation.calendar' },
    ],
  },
  {
    key: 'analytics',
    labelKey: 'merchant.navigation.analytics',
    icon: BarChart3,
    items: [
      { key: 'attendance', href: '/analytics/attendance', icon: Users, labelKey: 'merchant.navigation.attendance' },
      { key: 'revenue', href: '/analytics', icon: TrendingUp, labelKey: 'merchant.navigation.revenue' },
    ],
  },
  {
    key: 'settings',
    labelKey: 'merchant.navigation.settings',
    icon: Settings,
    items: [
      { key: 'venue', href: '/store', icon: Building2, labelKey: 'merchant.navigation.venueSettings' },
      { key: 'team', href: '/team', icon: Users, labelKey: 'merchant.navigation.team' },
      { key: 'themes', href: '/themes', icon: Palette, labelKey: 'merchant.navigation.themes' },
    ],
  },
]

// Alcohol/Wine navigation (with age verification features)
const alcoholNavigation: NavigationConfig = [
  ...baseNavigation,
  {
    key: 'cellar',
    labelKey: 'merchant.navigation.cellar',
    icon: Wine,
    items: [
      { key: 'wines', href: '/products', icon: Wine, labelKey: 'merchant.navigation.wines' },
      { key: 'categories', href: '/categories', icon: FolderTree, labelKey: 'merchant.navigation.categories' },
      { key: 'vintages', href: '/vintages', icon: Star, labelKey: 'merchant.navigation.vintages' },
    ],
  },
  {
    key: 'sales',
    labelKey: 'merchant.navigation.sales',
    icon: ShoppingCart,
    items: [
      { key: 'orders', href: '/orders', icon: Package, labelKey: 'merchant.navigation.orders' },
      { key: 'customers', href: '/customers', icon: Users, labelKey: 'merchant.navigation.customers' },
      { key: 'discounts', href: '/discounts', icon: Percent, labelKey: 'merchant.navigation.discounts' },
    ],
  },
  {
    key: 'shipping',
    labelKey: 'merchant.navigation.shipping',
    icon: Truck,
    items: [
      { key: 'zones', href: '/shipping', icon: MapPin, labelKey: 'merchant.navigation.shippingZones', hidden: true },
      { key: 'taxes', href: '/taxes', icon: Receipt, labelKey: 'merchant.navigation.taxes', hidden: true },
    ],
  },
  {
    key: 'analytics',
    labelKey: 'merchant.navigation.analytics',
    icon: BarChart3,
    items: [
      { key: 'sales', href: '/analytics', icon: TrendingUp, labelKey: 'merchant.navigation.sales' },
      { key: 'inventory', href: '/analytics/inventory', icon: Warehouse, labelKey: 'merchant.navigation.inventory' },
    ],
  },
  {
    key: 'settings',
    labelKey: 'merchant.navigation.settings',
    icon: Settings,
    items: [
      { key: 'store', href: '/store', icon: Store, labelKey: 'merchant.navigation.store' },
      { key: 'team', href: '/team', icon: Users, labelKey: 'merchant.navigation.team' },
      { key: 'compliance', href: '/compliance', icon: FileText, labelKey: 'merchant.navigation.compliance' },
      { key: 'themes', href: '/themes', icon: Palette, labelKey: 'merchant.navigation.themes' },
    ],
  },
]

// Map commerce types to their navigation configurations
const navigationByCommerceType: Record<CommerceType, NavigationConfig> = {
  GENERAL: ecommerceNavigation,
  FOOD: ecommerceNavigation,
  ALCOHOL: alcoholNavigation,
  FASHION: ecommerceNavigation,
  ELECTRONICS: ecommerceNavigation,
  BEAUTY: ecommerceNavigation,
  HOME: ecommerceNavigation,
  SPORTS: ecommerceNavigation,
  TOYS: ecommerceNavigation,
  AUTOMOTIVE: ecommerceNavigation,
  BOOKS: ecommerceNavigation,
  PETS: ecommerceNavigation,
  DIGITAL: digitalNavigation,
  SERVICES: recreationNavigation,
  SEASONAL: ecommerceNavigation,
  RESTAURANT: restaurantNavigation,
  HOTEL: hotelNavigation,
  TRAVEL: travelNavigation,
  RECREATION: recreationNavigation,
}

export function getNavigationForCommerceType(type: CommerceType): NavigationConfig {
  return navigationByCommerceType[type] || ecommerceNavigation
}

export function isNavGroup(item: NavItem | NavGroup): item is NavGroup {
  return 'items' in item
}
