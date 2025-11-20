/**
 * FoxCard Plugin Template
 *
 * Utilisez ce template comme point de départ pour créer votre plugin.
 * Copiez ce fichier et personnalisez-le selon vos besoins.
 *
 * Documentation: https://foxcard.dev/docs/plugins
 */

import type {
  Plugin,
  PluginMetadata,
  PluginConfig,
  HookRegistry,
  OrderCreatedHookData,
  ProductCreatedHookData,
  CustomerCreatedHookData,
} from '../types'

/**
 * Configuration par défaut du plugin
 */
const defaultConfig: PluginConfig = {
  // Ajoutez vos paramètres de configuration ici
  enabled: true,
  apiKey: '',
  webhookUrl: '',
  // ... autres paramètres
}

/**
 * Métadonnées du plugin
 */
const metadata: PluginMetadata = {
  id: 'mon-plugin',           // Identifiant unique (slug)
  name: 'Mon Plugin',         // Nom affiché
  version: '1.0.0',           // Version semver
  description: 'Description de mon plugin personnalisé',
  author: 'Votre Nom',
  homepage: 'https://votre-site.com',
  enabled: true,
}

/**
 * Définition du plugin
 */
const monPlugin: Plugin = {
  metadata,
  config: defaultConfig,

  /**
   * Appelé lors de l'installation du plugin
   */
  onInstall: async () => {
    console.log(`[${metadata.name}] Installation...`)
    // Initialisation, création de tables, etc.
  },

  /**
   * Appelé lors de la désinstallation du plugin
   */
  onUninstall: async () => {
    console.log(`[${metadata.name}] Désinstallation...`)
    // Nettoyage des données, suppression de tables, etc.
  },

  /**
   * Appelé lorsque le plugin est activé
   */
  onEnable: async () => {
    console.log(`[${metadata.name}] Activé`)
  },

  /**
   * Appelé lorsque le plugin est désactivé
   */
  onDisable: async () => {
    console.log(`[${metadata.name}] Désactivé`)
  },

  /**
   * Enregistrement des hooks
   */
  registerHooks: (hooks: HookRegistry) => {
    // Hook: Nouvelle commande créée
    hooks.onOrderCreated(async (data: OrderCreatedHookData) => {
      console.log(`[${metadata.name}] Nouvelle commande:`, data.orderNumber)

      // Exemple: Envoyer une notification
      // await sendNotification({
      //   type: 'order',
      //   orderId: data.orderId,
      //   total: data.total,
      // })
    })

    // Hook: Commande payée
    hooks.onOrderPaid(async (data) => {
      console.log(`[${metadata.name}] Commande payée:`, data.orderNumber)

      // Exemple: Déclencher un webhook
      // await triggerWebhook(config.webhookUrl, {
      //   event: 'order.paid',
      //   data,
      // })
    })

    // Hook: Nouveau produit créé
    hooks.onProductCreated(async (data: ProductCreatedHookData) => {
      console.log(`[${metadata.name}] Nouveau produit:`, data.name)

      // Exemple: Synchroniser avec un service externe
      // await syncProduct(data)
    })

    // Hook: Produit mis à jour
    hooks.onProductUpdated(async (data) => {
      console.log(`[${metadata.name}] Produit mis à jour:`, data.name)
    })

    // Hook: Nouveau client créé
    hooks.onCustomerCreated(async (data: CustomerCreatedHookData) => {
      console.log(`[${metadata.name}] Nouveau client:`, data.email)

      // Exemple: Ajouter à une liste email
      // await addToEmailList(data.email, data.name)
    })

    // Hook: Widget dashboard (retourne du JSX)
    hooks.onDashboardWidget((data) => {
      if (data.position === 'top') {
        // Retourner un composant React pour le dashboard
        return null // Remplacer par votre composant
      }
      return null
    })
  },
}

export default monPlugin

/**
 * ============================================
 * GUIDE DE DÉVELOPPEMENT
 * ============================================
 *
 * 1. HOOKS DISPONIBLES
 * --------------------
 * - onOrderCreated: Nouvelle commande
 * - onOrderStatusChanged: Changement de statut
 * - onOrderPaid: Commande payée
 * - onProductCreated: Nouveau produit
 * - onProductUpdated: Produit modifié
 * - onProductDeleted: Produit supprimé
 * - onCustomerCreated: Nouveau client
 * - onDashboardWidget: Widget dans le dashboard
 * - onProductPageSection: Section sur page produit
 *
 * 2. CONFIGURATION
 * ----------------
 * Les paramètres de configuration sont stockés dans la base de données
 * et peuvent être modifiés via l'interface admin.
 *
 * 3. BONNES PRATIQUES
 * -------------------
 * - Toujours gérer les erreurs avec try/catch
 * - Logger les actions importantes
 * - Ne pas bloquer les hooks avec des opérations longues
 * - Utiliser des queues pour les tâches asynchrones
 * - Valider les entrées utilisateur
 *
 * 4. TESTS
 * --------
 * Créez des tests unitaires pour vos hooks:
 *
 * describe('MonPlugin', () => {
 *   it('should handle order created', async () => {
 *     const data = { orderId: '123', ... }
 *     await monPlugin.registerHooks(mockHooks)
 *     // Vérifier le comportement
 *   })
 * })
 *
 * 5. PUBLICATION
 * --------------
 * Pour publier votre plugin sur le marketplace:
 * 1. Testez en local
 * 2. Créez un fichier manifest.json
 * 3. Soumettez via le formulaire développeur
 */
