export { pluginManager } from './manager'
export { HookExecutor, createHookExecutor } from './hook-executor'
export type {
  Plugin,
  PluginMetadata,
  PluginConfig,
  HookRegistry,
  HookHandler,
  UIHookHandler,
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
