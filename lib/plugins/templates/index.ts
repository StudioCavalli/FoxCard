/**
 * Plugin Templates
 *
 * Ces templates servent de point de départ pour créer des plugins FoxCard.
 *
 * Usage:
 * 1. Copiez le template qui correspond à votre cas d'usage
 * 2. Renommez le fichier avec le nom de votre plugin
 * 3. Personnalisez les métadonnées et la configuration
 * 4. Implémentez vos hooks
 * 5. Testez en local
 * 6. Publiez sur le marketplace
 */

export { default as pluginTemplate } from './plugin-template'
export { default as shippingPluginExample, configSchema as shippingConfigSchema } from './shipping-plugin-example'

/**
 * Guide rapide pour créer un plugin
 * =================================
 *
 * 1. STRUCTURE MINIMALE
 * ---------------------
 *
 * import { Plugin } from '@foxcard/plugin-sdk'
 *
 * const myPlugin: Plugin = {
 *   metadata: {
 *     id: 'my-plugin',
 *     name: 'My Plugin',
 *     version: '1.0.0',
 *     description: 'Description',
 *     author: 'Author',
 *     enabled: true,
 *   },
 *   registerHooks: (hooks) => {
 *     hooks.onOrderCreated((data) => {
 *       // Votre logique ici
 *     })
 *   },
 * }
 *
 * export default myPlugin
 *
 *
 * 2. TYPES DE PLUGINS
 * -------------------
 *
 * - PAYMENT: Passerelles de paiement (Stripe, PayPal, etc.)
 * - SHIPPING: Transporteurs (Colissimo, UPS, DHL)
 * - MARKETING: Pop-ups, exit intent, upsells
 * - SEO: Meta tags, sitemap, schema.org
 * - ANALYTICS: Tracking (GA4, Pixel, Hotjar)
 * - INTEGRATION: Services tiers (Mailchimp, Zapier)
 * - UTILITY: Fonctionnalités diverses (avis, wishlist)
 *
 *
 * 3. HOOKS DISPONIBLES
 * --------------------
 *
 * Événements commandes:
 * - onOrderCreated
 * - onOrderStatusChanged
 * - onOrderPaid
 *
 * Événements produits:
 * - onProductCreated
 * - onProductUpdated
 * - onProductDeleted
 *
 * Événements clients:
 * - onCustomerCreated
 *
 * Événements UI:
 * - onDashboardWidget
 * - onProductPageSection
 *
 *
 * 4. CONFIGURATION
 * ----------------
 *
 * Définissez un schéma de configuration pour l'interface admin:
 *
 * export const configSchema = [
 *   {
 *     key: 'apiKey',
 *     label: 'API Key',
 *     type: 'password',
 *     required: true,
 *   },
 *   {
 *     key: 'enabled',
 *     label: 'Activer',
 *     type: 'boolean',
 *     default: true,
 *   },
 * ]
 *
 *
 * 5. PUBLICATION
 * --------------
 *
 * Pour publier votre plugin:
 *
 * 1. Créez un repo GitHub avec votre plugin
 * 2. Ajoutez un fichier manifest.json:
 *    {
 *      "name": "my-plugin",
 *      "version": "1.0.0",
 *      "main": "dist/index.js",
 *      "foxcard": {
 *        "minVersion": "1.0.0",
 *        "type": "UTILITY",
 *        "category": "ux"
 *      }
 *    }
 * 3. Soumettez via https://foxcard.dev/developers/submit
 *
 *
 * 6. BONNES PRATIQUES
 * -------------------
 *
 * ✅ DO:
 * - Gérer les erreurs avec try/catch
 * - Logger les actions importantes
 * - Valider les entrées utilisateur
 * - Documenter votre code
 * - Écrire des tests unitaires
 *
 * ❌ DON'T:
 * - Bloquer les hooks avec des opérations longues
 * - Stocker des secrets en clair
 * - Ignorer les erreurs silencieusement
 * - Modifier les données sans permission
 */
