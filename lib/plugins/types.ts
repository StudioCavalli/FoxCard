import { ReactNode } from 'react'

/**
 * Plugin Hook Types
 * Defines all available hooks in the FoxCard plugin system
 */

// Order hooks
export interface OrderCreatedHookData {
  orderId: string
  orderNumber: string
  total: number
  customerEmail: string
}

export interface OrderStatusChangedHookData {
  orderId: string
  orderNumber: string
  oldStatus: string
  newStatus: string
}

export interface OrderPaidHookData {
  orderId: string
  orderNumber: string
  total: number
  paymentMethod: string
}

// Product hooks
export interface ProductCreatedHookData {
  productId: string
  name: string
  price: number
  sku: string
}

export interface ProductUpdatedHookData {
  productId: string
  name: string
  changes: Record<string, any>
}

export interface ProductDeletedHookData {
  productId: string
  name: string
}

// Customer hooks
export interface CustomerCreatedHookData {
  customerId: string
  email: string
  name?: string
}

// UI hooks
export interface DashboardWidgetHookData {
  position: 'top' | 'middle' | 'bottom'
}

export interface ProductPageSectionHookData {
  productId: string
  position: 'before' | 'after'
}

/**
 * Hook Handler Type
 */
export type HookHandler<T = any> = (data: T) => void | Promise<void>

/**
 * UI Hook Handler Type (returns ReactNode)
 */
export type UIHookHandler<T = any> = (data: T) => ReactNode

/**
 * Plugin Metadata
 */
export interface PluginMetadata {
  id: string
  name: string
  version: string
  description: string
  author: string
  homepage?: string
  enabled: boolean
}

/**
 * Plugin Configuration
 */
export interface PluginConfig {
  [key: string]: any
}

/**
 * Main Plugin Interface
 */
export interface Plugin {
  metadata: PluginMetadata
  config?: PluginConfig

  // Lifecycle hooks
  onInstall?: () => void | Promise<void>
  onUninstall?: () => void | Promise<void>
  onEnable?: () => void | Promise<void>
  onDisable?: () => void | Promise<void>

  // Register hooks
  registerHooks?: (hooks: HookRegistry) => void
}

/**
 * Hook Registry
 */
export interface HookRegistry {
  // Order hooks
  onOrderCreated: (handler: HookHandler<OrderCreatedHookData>) => void
  onOrderStatusChanged: (handler: HookHandler<OrderStatusChangedHookData>) => void
  onOrderPaid: (handler: HookHandler<OrderPaidHookData>) => void

  // Product hooks
  onProductCreated: (handler: HookHandler<ProductCreatedHookData>) => void
  onProductUpdated: (handler: HookHandler<ProductUpdatedHookData>) => void
  onProductDeleted: (handler: HookHandler<ProductDeletedHookData>) => void

  // Customer hooks
  onCustomerCreated: (handler: HookHandler<CustomerCreatedHookData>) => void

  // UI hooks
  onDashboardWidget: (handler: UIHookHandler<DashboardWidgetHookData>) => void
  onProductPageSection: (handler: UIHookHandler<ProductPageSectionHookData>) => void
}
