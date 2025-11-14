/**
 * RBAC System - Predefined Roles and Permissions
 *
 * Permission format: "resource.action"
 * Examples: "products.create", "orders.view", "users.delete"
 */

// ============================================
// PERMISSION DEFINITIONS
// ============================================

export const PERMISSIONS = {
  // Products
  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_UPDATE: 'products.update',
  PRODUCTS_DELETE: 'products.delete',
  PRODUCTS_EXPORT: 'products.export',

  // Categories
  CATEGORIES_VIEW: 'categories.view',
  CATEGORIES_CREATE: 'categories.create',
  CATEGORIES_UPDATE: 'categories.update',
  CATEGORIES_DELETE: 'categories.delete',

  // Orders
  ORDERS_VIEW: 'orders.view',
  ORDERS_CREATE: 'orders.create',
  ORDERS_UPDATE: 'orders.update',
  ORDERS_DELETE: 'orders.delete',
  ORDERS_EXPORT: 'orders.export',
  ORDERS_REFUND: 'orders.refund',

  // Customers
  CUSTOMERS_VIEW: 'customers.view',
  CUSTOMERS_CREATE: 'customers.create',
  CUSTOMERS_UPDATE: 'customers.update',
  CUSTOMERS_DELETE: 'customers.delete',
  CUSTOMERS_EXPORT: 'customers.export',

  // Discounts
  DISCOUNTS_VIEW: 'discounts.view',
  DISCOUNTS_CREATE: 'discounts.create',
  DISCOUNTS_UPDATE: 'discounts.update',
  DISCOUNTS_DELETE: 'discounts.delete',

  // Shipping
  SHIPPING_VIEW: 'shipping.view',
  SHIPPING_CREATE: 'shipping.create',
  SHIPPING_UPDATE: 'shipping.update',
  SHIPPING_DELETE: 'shipping.delete',

  // Users & Roles
  USERS_VIEW: 'users.view',
  USERS_INVITE: 'users.invite',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  ROLES_VIEW: 'roles.view',
  ROLES_CREATE: 'roles.create',
  ROLES_UPDATE: 'roles.update',
  ROLES_DELETE: 'roles.delete',

  // Store Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_UPDATE: 'settings.update',

  // Email & Templates
  EMAILS_VIEW: 'emails.view',
  EMAILS_SEND: 'emails.send',
  TEMPLATES_VIEW: 'templates.view',
  TEMPLATES_CREATE: 'templates.create',
  TEMPLATES_UPDATE: 'templates.update',
  TEMPLATES_DELETE: 'templates.delete',

  // Newsletter
  NEWSLETTER_VIEW: 'newsletter.view',
  NEWSLETTER_SEND: 'newsletter.send',
  NEWSLETTER_EXPORT: 'newsletter.export',

  // Webhooks
  WEBHOOKS_VIEW: 'webhooks.view',
  WEBHOOKS_CREATE: 'webhooks.create',
  WEBHOOKS_UPDATE: 'webhooks.update',
  WEBHOOKS_DELETE: 'webhooks.delete',

  // API Keys
  API_KEYS_VIEW: 'api_keys.view',
  API_KEYS_CREATE: 'api_keys.create',
  API_KEYS_UPDATE: 'api_keys.update',
  API_KEYS_DELETE: 'api_keys.delete',

  // Environment Variables
  ENV_VIEW: 'env.view',
  ENV_UPDATE: 'env.update',

  // Audit Logs
  AUDIT_VIEW: 'audit.view',

  // Themes
  THEMES_VIEW: 'themes.view',
  THEMES_CREATE: 'themes.create',
  THEMES_UPDATE: 'themes.update',
  THEMES_DELETE: 'themes.delete',
  THEMES_ACTIVATE: 'themes.activate',
} as const

// All permissions as array for easy iteration
export const ALL_PERMISSIONS = Object.values(PERMISSIONS)

// ============================================
// PREDEFINED ROLES
// ============================================

export interface RoleDefinition {
  name: string
  description: string
  permissions: string[]
  isSystem: boolean
}

export const SYSTEM_ROLES: Record<string, RoleDefinition> = {
  OWNER: {
    name: 'Owner',
    description: 'Propriétaire du magasin avec tous les droits',
    permissions: ALL_PERMISSIONS,
    isSystem: true,
  },

  ADMIN: {
    name: 'Admin',
    description: 'Administrateur avec la plupart des droits (sauf suppression du magasin)',
    permissions: [
      // Products
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.PRODUCTS_CREATE,
      PERMISSIONS.PRODUCTS_UPDATE,
      PERMISSIONS.PRODUCTS_DELETE,
      PERMISSIONS.PRODUCTS_EXPORT,

      // Categories
      PERMISSIONS.CATEGORIES_VIEW,
      PERMISSIONS.CATEGORIES_CREATE,
      PERMISSIONS.CATEGORIES_UPDATE,
      PERMISSIONS.CATEGORIES_DELETE,

      // Orders
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.ORDERS_CREATE,
      PERMISSIONS.ORDERS_UPDATE,
      PERMISSIONS.ORDERS_DELETE,
      PERMISSIONS.ORDERS_EXPORT,
      PERMISSIONS.ORDERS_REFUND,

      // Customers
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.CUSTOMERS_CREATE,
      PERMISSIONS.CUSTOMERS_UPDATE,
      PERMISSIONS.CUSTOMERS_DELETE,
      PERMISSIONS.CUSTOMERS_EXPORT,

      // Discounts
      PERMISSIONS.DISCOUNTS_VIEW,
      PERMISSIONS.DISCOUNTS_CREATE,
      PERMISSIONS.DISCOUNTS_UPDATE,
      PERMISSIONS.DISCOUNTS_DELETE,

      // Shipping
      PERMISSIONS.SHIPPING_VIEW,
      PERMISSIONS.SHIPPING_CREATE,
      PERMISSIONS.SHIPPING_UPDATE,
      PERMISSIONS.SHIPPING_DELETE,

      // Users (limited)
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.USERS_INVITE,
      PERMISSIONS.USERS_UPDATE,
      PERMISSIONS.ROLES_VIEW,

      // Settings
      PERMISSIONS.SETTINGS_VIEW,
      PERMISSIONS.SETTINGS_UPDATE,

      // Email & Templates
      PERMISSIONS.EMAILS_VIEW,
      PERMISSIONS.EMAILS_SEND,
      PERMISSIONS.TEMPLATES_VIEW,
      PERMISSIONS.TEMPLATES_CREATE,
      PERMISSIONS.TEMPLATES_UPDATE,
      PERMISSIONS.TEMPLATES_DELETE,

      // Newsletter
      PERMISSIONS.NEWSLETTER_VIEW,
      PERMISSIONS.NEWSLETTER_SEND,
      PERMISSIONS.NEWSLETTER_EXPORT,

      // Webhooks
      PERMISSIONS.WEBHOOKS_VIEW,
      PERMISSIONS.WEBHOOKS_CREATE,
      PERMISSIONS.WEBHOOKS_UPDATE,
      PERMISSIONS.WEBHOOKS_DELETE,

      // Audit
      PERMISSIONS.AUDIT_VIEW,

      // Themes
      PERMISSIONS.THEMES_VIEW,
      PERMISSIONS.THEMES_CREATE,
      PERMISSIONS.THEMES_UPDATE,
      PERMISSIONS.THEMES_DELETE,
      PERMISSIONS.THEMES_ACTIVATE,
    ],
    isSystem: true,
  },

  MANAGER: {
    name: 'Manager',
    description: 'Gestionnaire avec droits sur les produits, commandes et clients',
    permissions: [
      // Products
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.PRODUCTS_CREATE,
      PERMISSIONS.PRODUCTS_UPDATE,
      PERMISSIONS.PRODUCTS_EXPORT,

      // Categories
      PERMISSIONS.CATEGORIES_VIEW,
      PERMISSIONS.CATEGORIES_CREATE,
      PERMISSIONS.CATEGORIES_UPDATE,

      // Orders
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.ORDERS_UPDATE,
      PERMISSIONS.ORDERS_EXPORT,
      PERMISSIONS.ORDERS_REFUND,

      // Customers
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.CUSTOMERS_UPDATE,
      PERMISSIONS.CUSTOMERS_EXPORT,

      // Discounts
      PERMISSIONS.DISCOUNTS_VIEW,
      PERMISSIONS.DISCOUNTS_CREATE,
      PERMISSIONS.DISCOUNTS_UPDATE,

      // Shipping
      PERMISSIONS.SHIPPING_VIEW,

      // Email
      PERMISSIONS.EMAILS_VIEW,
      PERMISSIONS.EMAILS_SEND,

      // Newsletter
      PERMISSIONS.NEWSLETTER_VIEW,
      PERMISSIONS.NEWSLETTER_SEND,
    ],
    isSystem: true,
  },

  STAFF: {
    name: 'Staff',
    description: 'Employé avec droits de base (visualisation et gestion des commandes)',
    permissions: [
      // Products
      PERMISSIONS.PRODUCTS_VIEW,

      // Categories
      PERMISSIONS.CATEGORIES_VIEW,

      // Orders
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.ORDERS_UPDATE,

      // Customers
      PERMISSIONS.CUSTOMERS_VIEW,

      // Discounts
      PERMISSIONS.DISCOUNTS_VIEW,

      // Shipping
      PERMISSIONS.SHIPPING_VIEW,
    ],
    isSystem: true,
  },
} as const

// Helper to get role by name
export function getRoleDefinition(roleName: string): RoleDefinition | undefined {
  return Object.values(SYSTEM_ROLES).find(role => role.name === roleName)
}

// Helper to check if a permission exists in a list
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes(requiredPermission)
}

// Helper to check if user has ANY of the required permissions
export function hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.some(permission => userPermissions.includes(permission))
}

// Helper to check if user has ALL required permissions
export function hasAllPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.every(permission => userPermissions.includes(permission))
}

// Group permissions by resource for UI display
export const PERMISSION_GROUPS = {
  'Produits & Catalogue': [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.PRODUCTS_DELETE,
    PERMISSIONS.PRODUCTS_EXPORT,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_CREATE,
    PERMISSIONS.CATEGORIES_UPDATE,
    PERMISSIONS.CATEGORIES_DELETE,
  ],
  'Commandes': [
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.ORDERS_DELETE,
    PERMISSIONS.ORDERS_EXPORT,
    PERMISSIONS.ORDERS_REFUND,
  ],
  'Clients': [
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_UPDATE,
    PERMISSIONS.CUSTOMERS_DELETE,
    PERMISSIONS.CUSTOMERS_EXPORT,
  ],
  'Promotions & Expédition': [
    PERMISSIONS.DISCOUNTS_VIEW,
    PERMISSIONS.DISCOUNTS_CREATE,
    PERMISSIONS.DISCOUNTS_UPDATE,
    PERMISSIONS.DISCOUNTS_DELETE,
    PERMISSIONS.SHIPPING_VIEW,
    PERMISSIONS.SHIPPING_CREATE,
    PERMISSIONS.SHIPPING_UPDATE,
    PERMISSIONS.SHIPPING_DELETE,
  ],
  'Utilisateurs & Rôles': [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_INVITE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.ROLES_VIEW,
    PERMISSIONS.ROLES_CREATE,
    PERMISSIONS.ROLES_UPDATE,
    PERMISSIONS.ROLES_DELETE,
  ],
  'Email & Newsletter': [
    PERMISSIONS.EMAILS_VIEW,
    PERMISSIONS.EMAILS_SEND,
    PERMISSIONS.TEMPLATES_VIEW,
    PERMISSIONS.TEMPLATES_CREATE,
    PERMISSIONS.TEMPLATES_UPDATE,
    PERMISSIONS.TEMPLATES_DELETE,
    PERMISSIONS.NEWSLETTER_VIEW,
    PERMISSIONS.NEWSLETTER_SEND,
    PERMISSIONS.NEWSLETTER_EXPORT,
  ],
  'Paramètres & Système': [
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.WEBHOOKS_VIEW,
    PERMISSIONS.WEBHOOKS_CREATE,
    PERMISSIONS.WEBHOOKS_UPDATE,
    PERMISSIONS.WEBHOOKS_DELETE,
    PERMISSIONS.API_KEYS_VIEW,
    PERMISSIONS.API_KEYS_CREATE,
    PERMISSIONS.API_KEYS_UPDATE,
    PERMISSIONS.API_KEYS_DELETE,
    PERMISSIONS.ENV_VIEW,
    PERMISSIONS.ENV_UPDATE,
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.THEMES_VIEW,
    PERMISSIONS.THEMES_CREATE,
    PERMISSIONS.THEMES_UPDATE,
    PERMISSIONS.THEMES_DELETE,
    PERMISSIONS.THEMES_ACTIVATE,
  ],
} as const

// Permission labels for UI display
export const PERMISSION_LABELS: Record<string, string> = {
  // Products
  'products.view': 'Voir les produits',
  'products.create': 'Créer des produits',
  'products.update': 'Modifier les produits',
  'products.delete': 'Supprimer des produits',
  'products.export': 'Exporter les produits',

  // Categories
  'categories.view': 'Voir les catégories',
  'categories.create': 'Créer des catégories',
  'categories.update': 'Modifier les catégories',
  'categories.delete': 'Supprimer des catégories',

  // Orders
  'orders.view': 'Voir les commandes',
  'orders.create': 'Créer des commandes',
  'orders.update': 'Modifier les commandes',
  'orders.delete': 'Supprimer des commandes',
  'orders.export': 'Exporter les commandes',
  'orders.refund': 'Rembourser des commandes',

  // Customers
  'customers.view': 'Voir les clients',
  'customers.create': 'Créer des clients',
  'customers.update': 'Modifier les clients',
  'customers.delete': 'Supprimer des clients',
  'customers.export': 'Exporter les clients',

  // Discounts
  'discounts.view': 'Voir les remises',
  'discounts.create': 'Créer des remises',
  'discounts.update': 'Modifier les remises',
  'discounts.delete': 'Supprimer des remises',

  // Shipping
  'shipping.view': 'Voir les zones d\'expédition',
  'shipping.create': 'Créer des zones d\'expédition',
  'shipping.update': 'Modifier les zones d\'expédition',
  'shipping.delete': 'Supprimer des zones d\'expédition',

  // Users & Roles
  'users.view': 'Voir les utilisateurs',
  'users.invite': 'Inviter des utilisateurs',
  'users.update': 'Modifier les utilisateurs',
  'users.delete': 'Supprimer des utilisateurs',
  'roles.view': 'Voir les rôles',
  'roles.create': 'Créer des rôles',
  'roles.update': 'Modifier les rôles',
  'roles.delete': 'Supprimer des rôles',

  // Settings
  'settings.view': 'Voir les paramètres',
  'settings.update': 'Modifier les paramètres',

  // Email & Templates
  'emails.view': 'Voir les emails',
  'emails.send': 'Envoyer des emails',
  'templates.view': 'Voir les templates',
  'templates.create': 'Créer des templates',
  'templates.update': 'Modifier les templates',
  'templates.delete': 'Supprimer des templates',

  // Newsletter
  'newsletter.view': 'Voir la newsletter',
  'newsletter.send': 'Envoyer la newsletter',
  'newsletter.export': 'Exporter les abonnés',

  // Webhooks
  'webhooks.view': 'Voir les webhooks',
  'webhooks.create': 'Créer des webhooks',
  'webhooks.update': 'Modifier les webhooks',
  'webhooks.delete': 'Supprimer des webhooks',

  // API Keys
  'api_keys.view': 'Voir les clés API',
  'api_keys.create': 'Créer des clés API',
  'api_keys.update': 'Modifier les clés API',
  'api_keys.delete': 'Supprimer des clés API',

  // Environment Variables
  'env.view': 'Voir les variables d\'environnement',
  'env.update': 'Modifier les variables d\'environnement',

  // Audit
  'audit.view': 'Voir les logs d\'audit',

  // Themes
  'themes.view': 'Voir les thèmes',
  'themes.create': 'Créer des thèmes',
  'themes.update': 'Modifier les thèmes',
  'themes.delete': 'Supprimer des thèmes',
  'themes.activate': 'Activer un thème',
}
