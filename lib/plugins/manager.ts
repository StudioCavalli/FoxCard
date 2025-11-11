import {
  Plugin,
  HookHandler,
  UIHookHandler,
  HookRegistry,
  OrderCreatedHookData,
  OrderStatusChangedHookData,
  OrderPaidHookData,
  ProductCreatedHookData,
  ProductUpdatedHookData,
  ProductDeletedHookData,
  CustomerCreatedHookData,
  DashboardWidgetHookData,
  ProductPageSectionHookData,
} from './types'

/**
 * Plugin Manager
 * Centralized system for managing plugins and their hooks
 */
class PluginManager {
  private plugins: Map<string, Plugin> = new Map()
  private hooks: Map<string, HookHandler[]> = new Map()
  private uiHooks: Map<string, UIHookHandler[]> = new Map()

  /**
   * Register a plugin
   */
  registerPlugin(plugin: Plugin): void {
    if (this.plugins.has(plugin.metadata.id)) {
      console.warn(`Plugin ${plugin.metadata.id} is already registered`)
      return
    }

    this.plugins.set(plugin.metadata.id, plugin)

    // Call onInstall hook
    plugin.onInstall?.()

    // Register plugin hooks
    if (plugin.registerHooks) {
      const registry: HookRegistry = {
        onOrderCreated: (handler) => this.addHook('order:created', handler),
        onOrderStatusChanged: (handler) => this.addHook('order:statusChanged', handler),
        onOrderPaid: (handler) => this.addHook('order:paid', handler),
        onProductCreated: (handler) => this.addHook('product:created', handler),
        onProductUpdated: (handler) => this.addHook('product:updated', handler),
        onProductDeleted: (handler) => this.addHook('product:deleted', handler),
        onCustomerCreated: (handler) => this.addHook('customer:created', handler),
        onDashboardWidget: (handler) => this.addUIHook('ui:dashboardWidget', handler),
        onProductPageSection: (handler) => this.addUIHook('ui:productPageSection', handler),
      }

      plugin.registerHooks(registry)
    }

    // Enable plugin by default if enabled in metadata
    if (plugin.metadata.enabled) {
      this.enablePlugin(plugin.metadata.id)
    }

    console.log(`Plugin ${plugin.metadata.name} (${plugin.metadata.id}) registered`)
  }

  /**
   * Unregister a plugin
   */
  unregisterPlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) return

    // Call onUninstall hook
    plugin.onUninstall?.()

    // Remove all hooks from this plugin
    // Note: In a production system, you'd track which hooks belong to which plugin
    this.plugins.delete(pluginId)

    console.log(`Plugin ${plugin.metadata.name} unregistered`)
  }

  /**
   * Enable a plugin
   */
  enablePlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) return

    plugin.metadata.enabled = true
    plugin.onEnable?.()

    console.log(`Plugin ${plugin.metadata.name} enabled`)
  }

  /**
   * Disable a plugin
   */
  disablePlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) return

    plugin.metadata.enabled = false
    plugin.onDisable?.()

    console.log(`Plugin ${plugin.metadata.name} disabled`)
  }

  /**
   * Get all registered plugins
   */
  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * Get a specific plugin
   */
  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId)
  }

  /**
   * Add a hook handler
   */
  private addHook(hookName: string, handler: HookHandler): void {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, [])
    }
    this.hooks.get(hookName)!.push(handler)
  }

  /**
   * Add a UI hook handler
   */
  private addUIHook(hookName: string, handler: UIHookHandler): void {
    if (!this.uiHooks.has(hookName)) {
      this.uiHooks.set(hookName, [])
    }
    this.uiHooks.get(hookName)!.push(handler)
  }

  /**
   * Execute a hook
   */
  async executeHook<T = any>(hookName: string, data: T): Promise<void> {
    const handlers = this.hooks.get(hookName) || []

    for (const handler of handlers) {
      try {
        await handler(data)
      } catch (error) {
        console.error(`Error executing hook ${hookName}:`, error)
      }
    }
  }

  /**
   * Execute a UI hook and collect results
   */
  executeUIHook<T = any>(hookName: string, data: T): any[] {
    const handlers = this.uiHooks.get(hookName) || []
    const results: any[] = []

    for (const handler of handlers) {
      try {
        const result = handler(data)
        if (result) {
          results.push(result)
        }
      } catch (error) {
        console.error(`Error executing UI hook ${hookName}:`, error)
      }
    }

    return results
  }

  // Convenience methods for specific hooks

  async onOrderCreated(data: OrderCreatedHookData): Promise<void> {
    await this.executeHook('order:created', data)
  }

  async onOrderStatusChanged(data: OrderStatusChangedHookData): Promise<void> {
    await this.executeHook('order:statusChanged', data)
  }

  async onOrderPaid(data: OrderPaidHookData): Promise<void> {
    await this.executeHook('order:paid', data)
  }

  async onProductCreated(data: ProductCreatedHookData): Promise<void> {
    await this.executeHook('product:created', data)
  }

  async onProductUpdated(data: ProductUpdatedHookData): Promise<void> {
    await this.executeHook('product:updated', data)
  }

  async onProductDeleted(data: ProductDeletedHookData): Promise<void> {
    await this.executeHook('product:deleted', data)
  }

  async onCustomerCreated(data: CustomerCreatedHookData): Promise<void> {
    await this.executeHook('customer:created', data)
  }

  getDashboardWidgets(position: 'top' | 'middle' | 'bottom'): any[] {
    return this.executeUIHook('ui:dashboardWidget', { position })
  }

  getProductPageSections(productId: string, position: 'before' | 'after'): any[] {
    return this.executeUIHook('ui:productPageSection', { productId, position })
  }
}

// Export singleton instance
export const pluginManager = new PluginManager()
