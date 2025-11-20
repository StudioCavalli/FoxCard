import { PrismaClient } from '@prisma/client'
import type {
  OrderCreatedHookData,
  OrderStatusChangedHookData,
  OrderPaidHookData,
  ProductCreatedHookData,
  ProductUpdatedHookData,
  ProductDeletedHookData,
  CustomerCreatedHookData,
} from './types'

/**
 * Plugin Hook Executor
 *
 * Executes hooks for plugins stored in the database.
 * Each plugin's behavior is determined by its type and configuration.
 */
export class HookExecutor {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  /**
   * Get enabled plugins for a store that handle a specific hook
   */
  private async getPluginsForHook(storeId: string, hookName: string) {
    return this.prisma.plugin.findMany({
      where: {
        storeId,
        isEnabled: true,
      },
    })
  }

  /**
   * Execute hook handlers for a specific event
   */
  private async executePluginHook(
    plugin: any,
    hookName: string,
    data: any
  ): Promise<void> {
    const config = plugin.config as Record<string, any>

    try {
      console.log(`[Plugin:${plugin.slug}] Executing ${hookName}`)

      // Execute logic based on plugin type and hook
      switch (plugin.type) {
        case 'SHIPPING':
          await this.executeShippingHook(plugin, hookName, data, config)
          break
        case 'MARKETING':
          await this.executeMarketingHook(plugin, hookName, data, config)
          break
        case 'SEO':
          await this.executeSEOHook(plugin, hookName, data, config)
          break
        case 'ANALYTICS':
          await this.executeAnalyticsHook(plugin, hookName, data, config)
          break
        case 'INTEGRATION':
          await this.executeIntegrationHook(plugin, hookName, data, config)
          break
        case 'UTILITY':
          await this.executeUtilityHook(plugin, hookName, data, config)
          break
        default:
          console.log(`[Plugin:${plugin.slug}] Unknown plugin type: ${plugin.type}`)
      }
    } catch (error) {
      console.error(`[Plugin:${plugin.slug}] Error executing ${hookName}:`, error)
    }
  }

  // ============================================
  // SHIPPING PLUGIN HOOKS
  // ============================================

  private async executeShippingHook(
    plugin: any,
    hookName: string,
    data: any,
    config: Record<string, any>
  ): Promise<void> {
    switch (hookName) {
      case 'order:created':
        // Auto-generate shipping label if configured
        if (config.autoGenerateLabel !== false) {
          console.log(`[${plugin.name}] Generating shipping label for order ${data.orderNumber}`)
          // In production: call shipping API
          // await this.generateShippingLabel(plugin.slug, data, config)
        }
        break

      case 'order:statusChanged':
        if (data.newStatus === 'shipped') {
          console.log(`[${plugin.name}] Order ${data.orderNumber} shipped - sending tracking notification`)
          // In production: send tracking notification
        }
        break

      default:
        console.log(`[${plugin.name}] Unhandled hook: ${hookName}`)
    }
  }

  // ============================================
  // MARKETING PLUGIN HOOKS
  // ============================================

  private async executeMarketingHook(
    plugin: any,
    hookName: string,
    data: any,
    config: Record<string, any>
  ): Promise<void> {
    switch (plugin.slug) {
      case 'free-shipping-bar':
        if (hookName === 'cart:updated') {
          const threshold = config.threshold || 50
          console.log(`[${plugin.name}] Cart updated - checking against ${threshold}€ threshold`)
        }
        break

      case 'exit-intent':
        if (hookName === 'page:exit' && config.enabled) {
          console.log(`[${plugin.name}] Exit intent triggered - discount code: ${config.discountCode}`)
        }
        break

      case 'popup-marketing':
        if (hookName === 'page:view') {
          console.log(`[${plugin.name}] Page view - evaluating popup triggers`)
        }
        break

      default:
        console.log(`[${plugin.name}] Hook ${hookName} executed`)
    }
  }

  // ============================================
  // SEO PLUGIN HOOKS
  // ============================================

  private async executeSEOHook(
    plugin: any,
    hookName: string,
    data: any,
    config: Record<string, any>
  ): Promise<void> {
    switch (hookName) {
      case 'product:created':
      case 'product:updated':
        if (config.autoMetaDescription) {
          console.log(`[${plugin.name}] Generating meta description for product ${data.name}`)
        }
        if (config.structuredData) {
          console.log(`[${plugin.name}] Generating structured data for product ${data.name}`)
        }
        if (config.generateSitemap) {
          console.log(`[${plugin.name}] Queuing sitemap regeneration`)
        }
        break

      case 'product:deleted':
        if (config.generateSitemap) {
          console.log(`[${plugin.name}] Product deleted - regenerating sitemap`)
        }
        break

      default:
        console.log(`[${plugin.name}] Hook ${hookName} executed`)
    }
  }

  // ============================================
  // ANALYTICS PLUGIN HOOKS
  // ============================================

  private async executeAnalyticsHook(
    plugin: any,
    hookName: string,
    data: any,
    config: Record<string, any>
  ): Promise<void> {
    switch (plugin.slug) {
      case 'google-analytics':
        if (hookName === 'order:paid') {
          console.log(`[${plugin.name}] Sending purchase event to GA4 - Order ${data.orderNumber}`)
          // In production: send to GA4 Measurement Protocol
          // await this.sendToGA4(config.measurementId, config.apiSecret, {
          //   name: 'purchase',
          //   params: { transaction_id: data.orderId, value: data.total }
          // })
        }
        break

      case 'facebook-pixel':
        if (hookName === 'order:paid') {
          console.log(`[${plugin.name}] Sending Purchase event to Facebook - Order ${data.orderNumber}`)
          // In production: send Conversions API event
        }
        break

      case 'hotjar':
        console.log(`[${plugin.name}] Event tracked: ${hookName}`)
        break

      default:
        console.log(`[${plugin.name}] Hook ${hookName} executed`)
    }
  }

  // ============================================
  // INTEGRATION PLUGIN HOOKS
  // ============================================

  private async executeIntegrationHook(
    plugin: any,
    hookName: string,
    data: any,
    config: Record<string, any>
  ): Promise<void> {
    switch (plugin.slug) {
      case 'mailchimp':
        if (hookName === 'customer:created' && config.addToList) {
          console.log(`[${plugin.name}] Adding ${data.email} to list ${config.listId}`)
          // In production: call Mailchimp API
        }
        break

      case 'zapier':
        console.log(`[${plugin.name}] Triggering webhook for ${hookName}`)
        // In production: call Zapier webhook
        // if (config.webhookUrl) {
        //   await fetch(config.webhookUrl, {
        //     method: 'POST',
        //     body: JSON.stringify({ event: hookName, data })
        //   })
        // }
        break

      default:
        console.log(`[${plugin.name}] Hook ${hookName} executed`)
    }
  }

  // ============================================
  // UTILITY PLUGIN HOOKS
  // ============================================

  private async executeUtilityHook(
    plugin: any,
    hookName: string,
    data: any,
    config: Record<string, any>
  ): Promise<void> {
    switch (plugin.slug) {
      case 'customer-reviews':
        if (hookName === 'order:paid') {
          const delay = config.emailDelay || 7
          console.log(`[${plugin.name}] Scheduling review request in ${delay} days for order ${data.orderNumber}`)
        }
        break

      case 'wishlist':
        if (hookName === 'product:updated') {
          console.log(`[${plugin.name}] Product updated - notifying wishlist subscribers`)
        }
        break

      default:
        console.log(`[${plugin.name}] Hook ${hookName} executed`)
    }
  }

  // ============================================
  // PUBLIC HOOK METHODS
  // ============================================

  async onOrderCreated(storeId: string, data: OrderCreatedHookData): Promise<void> {
    const plugins = await this.getPluginsForHook(storeId, 'order:created')
    for (const plugin of plugins) {
      await this.executePluginHook(plugin, 'order:created', data)
    }
  }

  async onOrderStatusChanged(storeId: string, data: OrderStatusChangedHookData): Promise<void> {
    const plugins = await this.getPluginsForHook(storeId, 'order:statusChanged')
    for (const plugin of plugins) {
      await this.executePluginHook(plugin, 'order:statusChanged', data)
    }
  }

  async onOrderPaid(storeId: string, data: OrderPaidHookData): Promise<void> {
    const plugins = await this.getPluginsForHook(storeId, 'order:paid')
    for (const plugin of plugins) {
      await this.executePluginHook(plugin, 'order:paid', data)
    }
  }

  async onProductCreated(storeId: string, data: ProductCreatedHookData): Promise<void> {
    const plugins = await this.getPluginsForHook(storeId, 'product:created')
    for (const plugin of plugins) {
      await this.executePluginHook(plugin, 'product:created', data)
    }
  }

  async onProductUpdated(storeId: string, data: ProductUpdatedHookData): Promise<void> {
    const plugins = await this.getPluginsForHook(storeId, 'product:updated')
    for (const plugin of plugins) {
      await this.executePluginHook(plugin, 'product:updated', data)
    }
  }

  async onProductDeleted(storeId: string, data: ProductDeletedHookData): Promise<void> {
    const plugins = await this.getPluginsForHook(storeId, 'product:deleted')
    for (const plugin of plugins) {
      await this.executePluginHook(plugin, 'product:deleted', data)
    }
  }

  async onCustomerCreated(storeId: string, data: CustomerCreatedHookData): Promise<void> {
    const plugins = await this.getPluginsForHook(storeId, 'customer:created')
    for (const plugin of plugins) {
      await this.executePluginHook(plugin, 'customer:created', data)
    }
  }
}

/**
 * Create a hook executor instance
 */
export function createHookExecutor(prisma: PrismaClient): HookExecutor {
  return new HookExecutor(prisma)
}
