/**
 * Exemple de Plugin Shipping - Colissimo
 *
 * Cet exemple montre comment créer un plugin d'expédition complet
 * qui s'intègre avec l'API Colissimo.
 */

import type {
  Plugin,
  PluginMetadata,
  PluginConfig,
  HookRegistry,
  OrderCreatedHookData,
} from '../types'

// Types spécifiques au plugin
interface ColissimoConfig extends PluginConfig {
  apiKey: string
  contractNumber: string
  password: string
  senderAddress: {
    name: string
    street: string
    city: string
    postalCode: string
    country: string
    phone?: string
  }
  defaultWeight: number // en grammes
  defaultPackageType: 'COLD' | 'DOS' | 'COL'
  autoGenerateLabel: boolean
  notifyCustomer: boolean
}

interface ShippingLabel {
  trackingNumber: string
  labelUrl: string
  estimatedDelivery: string
}

// Configuration par défaut
const defaultConfig: ColissimoConfig = {
  apiKey: '',
  contractNumber: '',
  password: '',
  senderAddress: {
    name: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'FR',
  },
  defaultWeight: 500,
  defaultPackageType: 'COLD',
  autoGenerateLabel: true,
  notifyCustomer: true,
}

// Métadonnées
const metadata: PluginMetadata = {
  id: 'colissimo',
  name: 'Colissimo',
  version: '1.0.0',
  description: 'Intégration officielle Colissimo pour l\'expédition en France et à l\'international',
  author: 'FoxCard',
  homepage: 'https://www.colissimo.fr/',
  enabled: true,
}

/**
 * Service API Colissimo (simulé pour l'exemple)
 */
class ColissimoService {
  private config: ColissimoConfig

  constructor(config: ColissimoConfig) {
    this.config = config
  }

  /**
   * Générer une étiquette d'expédition
   */
  async generateLabel(order: {
    orderId: string
    recipient: {
      name: string
      street: string
      city: string
      postalCode: string
      country: string
      email: string
      phone?: string
    }
    weight: number
  }): Promise<ShippingLabel> {
    // Ici vous appelleriez l'API Colissimo réelle
    // https://www.colissimo.fr/entreprise/la-solution-affranchissement-en-ligne

    console.log(`[Colissimo] Génération étiquette pour commande ${order.orderId}`)

    // Simulation de l'appel API
    const trackingNumber = `${this.config.contractNumber}${Date.now()}`

    return {
      trackingNumber,
      labelUrl: `https://api.colissimo.fr/labels/${trackingNumber}.pdf`,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    }
  }

  /**
   * Suivre un colis
   */
  async trackPackage(trackingNumber: string): Promise<{
    status: string
    lastUpdate: string
    history: Array<{ date: string; status: string; location: string }>
  }> {
    console.log(`[Colissimo] Suivi colis ${trackingNumber}`)

    // Simulation
    return {
      status: 'En transit',
      lastUpdate: new Date().toISOString(),
      history: [
        { date: new Date().toISOString(), status: 'Pris en charge', location: 'Paris' },
      ],
    }
  }

  /**
   * Calculer les tarifs
   */
  async calculateRates(params: {
    weight: number
    destination: string
    service: string
  }): Promise<{ price: number; currency: string; deliveryDays: number }> {
    console.log(`[Colissimo] Calcul tarif: ${params.weight}g vers ${params.destination}`)

    // Logique de calcul des tarifs (simplifiée)
    let basePrice = 4.95
    if (params.weight > 250) basePrice = 6.55
    if (params.weight > 500) basePrice = 7.45
    if (params.weight > 750) basePrice = 8.1
    if (params.weight > 1000) basePrice = 9.35

    // Majoration international
    if (params.destination !== 'FR') {
      basePrice *= 2.5
    }

    return {
      price: basePrice,
      currency: 'EUR',
      deliveryDays: params.destination === 'FR' ? 2 : 5,
    }
  }
}

/**
 * Plugin Colissimo
 */
const colissimoPlugin: Plugin = {
  metadata,
  config: defaultConfig,

  onInstall: async () => {
    console.log('[Colissimo] Plugin installé')
    // Vérifier la configuration API
  },

  onUninstall: async () => {
    console.log('[Colissimo] Plugin désinstallé')
  },

  onEnable: async () => {
    console.log('[Colissimo] Plugin activé - Vérification des identifiants...')
    // Tester la connexion API
  },

  onDisable: async () => {
    console.log('[Colissimo] Plugin désactivé')
  },

  registerHooks: (hooks: HookRegistry) => {
    const config = colissimoPlugin.config as ColissimoConfig
    const colissimo = new ColissimoService(config)

    // Quand une commande est créée
    hooks.onOrderCreated(async (data: OrderCreatedHookData) => {
      if (!config.autoGenerateLabel) return

      console.log(`[Colissimo] Nouvelle commande ${data.orderNumber}`)

      try {
        // Récupérer les détails de la commande (via API FoxCard)
        // const order = await foxcardApi.orders.get(data.orderId)

        // Générer l'étiquette
        const label = await colissimo.generateLabel({
          orderId: data.orderId,
          recipient: {
            name: 'Client',
            street: '1 rue Example',
            city: 'Paris',
            postalCode: '75001',
            country: 'FR',
            email: data.customerEmail,
          },
          weight: config.defaultWeight,
        })

        console.log(`[Colissimo] Étiquette générée: ${label.trackingNumber}`)

        // Mettre à jour la commande avec le numéro de suivi
        // await foxcardApi.orders.update(data.orderId, {
        //   trackingNumber: label.trackingNumber,
        //   trackingUrl: `https://www.laposte.fr/outils/suivre-vos-envois?code=${label.trackingNumber}`,
        //   shippingLabelUrl: label.labelUrl,
        // })

        // Notifier le client
        if (config.notifyCustomer) {
          // await foxcardApi.notifications.send({
          //   type: 'shipping_label_created',
          //   email: data.customerEmail,
          //   data: { trackingNumber: label.trackingNumber },
          // })
        }
      } catch (error) {
        console.error('[Colissimo] Erreur génération étiquette:', error)
      }
    })

    // Quand une commande est expédiée
    hooks.onOrderStatusChanged(async (data) => {
      if (data.newStatus === 'shipped') {
        console.log(`[Colissimo] Commande ${data.orderNumber} expédiée`)
        // Logique post-expédition
      }
    })
  },
}

export default colissimoPlugin

/**
 * ============================================
 * SCHÉMA DE CONFIGURATION UI
 * ============================================
 *
 * Pour l'interface de configuration dans l'admin:
 */
export const configSchema = [
  {
    key: 'apiKey',
    label: 'Clé API',
    type: 'password',
    required: true,
    description: 'Votre clé API Colissimo',
  },
  {
    key: 'contractNumber',
    label: 'Numéro de contrat',
    type: 'string',
    required: true,
  },
  {
    key: 'password',
    label: 'Mot de passe',
    type: 'password',
    required: true,
  },
  {
    key: 'senderAddress.name',
    label: 'Nom expéditeur',
    type: 'string',
    required: true,
  },
  {
    key: 'senderAddress.street',
    label: 'Adresse',
    type: 'string',
    required: true,
  },
  {
    key: 'senderAddress.city',
    label: 'Ville',
    type: 'string',
    required: true,
  },
  {
    key: 'senderAddress.postalCode',
    label: 'Code postal',
    type: 'string',
    required: true,
  },
  {
    key: 'defaultWeight',
    label: 'Poids par défaut (g)',
    type: 'number',
    default: 500,
  },
  {
    key: 'defaultPackageType',
    label: 'Type de colis',
    type: 'select',
    options: [
      { value: 'COLD', label: 'Colissimo Domicile' },
      { value: 'DOS', label: 'Colissimo Point Retrait' },
      { value: 'COL', label: 'Colissimo International' },
    ],
    default: 'COLD',
  },
  {
    key: 'autoGenerateLabel',
    label: 'Générer automatiquement les étiquettes',
    type: 'boolean',
    default: true,
  },
  {
    key: 'notifyCustomer',
    label: 'Notifier le client',
    type: 'boolean',
    default: true,
  },
]
