import { CommerceType } from './index'

// Terminology mappings for each commerce type
// These map generic e-commerce terms to commerce-specific terms
export interface CommerceTerminology {
  // Core entities
  product: string
  products: string
  order: string
  orders: string
  customer: string
  customers: string
  category: string
  categories: string

  // Actions
  addProduct: string
  manageOrders: string
  viewCustomers: string

  // Stats
  totalProducts: string
  totalOrders: string
  totalCustomers: string
  revenue: string

  // Statuses
  pending: string
  processing: string
  completed: string
  cancelled: string
}

const defaultTerminology: CommerceTerminology = {
  product: 'Produit',
  products: 'Produits',
  order: 'Commande',
  orders: 'Commandes',
  customer: 'Client',
  customers: 'Clients',
  category: 'Catégorie',
  categories: 'Catégories',
  addProduct: 'Ajouter un produit',
  manageOrders: 'Gérer les commandes',
  viewCustomers: 'Voir les clients',
  totalProducts: 'Total produits',
  totalOrders: 'Total commandes',
  totalCustomers: 'Total clients',
  revenue: 'Chiffre d\'affaires',
  pending: 'En attente',
  processing: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
}

// Terminology by commerce type
export const terminologyByCommerceType: Record<CommerceType, Partial<CommerceTerminology>> = {
  GENERAL: {},

  FOOD: {
    product: 'Article',
    products: 'Articles',
  },

  ALCOHOL: {
    product: 'Référence',
    products: 'Cave',
    addProduct: 'Ajouter un vin',
    totalProducts: 'Références en cave',
  },

  FASHION: {
    product: 'Article',
    products: 'Collection',
  },

  ELECTRONICS: {
    product: 'Appareil',
    products: 'Catalogue',
  },

  BEAUTY: {
    product: 'Produit',
    products: 'Soins',
  },

  HOME: {
    product: 'Article',
    products: 'Mobilier',
  },

  SPORTS: {
    product: 'Équipement',
    products: 'Équipements',
  },

  TOYS: {
    product: 'Jouet',
    products: 'Jouets',
  },

  AUTOMOTIVE: {
    product: 'Pièce',
    products: 'Pièces',
  },

  BOOKS: {
    product: 'Livre',
    products: 'Livres',
  },

  PETS: {
    product: 'Article',
    products: 'Animalerie',
  },

  DIGITAL: {
    product: 'Téléchargement',
    products: 'Téléchargements',
    order: 'Achat',
    orders: 'Achats',
    addProduct: 'Ajouter un fichier',
    manageOrders: 'Gérer les achats',
    totalProducts: 'Fichiers disponibles',
    totalOrders: 'Total achats',
  },

  SERVICES: {
    product: 'Service',
    products: 'Services',
    order: 'Réservation',
    orders: 'Réservations',
    addProduct: 'Ajouter un service',
    manageOrders: 'Gérer les réservations',
    totalProducts: 'Services actifs',
    totalOrders: 'Total réservations',
  },

  SEASONAL: {
    product: 'Article',
    products: 'Articles saisonniers',
  },

  RESTAURANT: {
    product: 'Plat',
    products: 'Menu',
    order: 'Commande',
    orders: 'Commandes',
    category: 'Catégorie de plat',
    categories: 'Menu',
    addProduct: 'Ajouter un plat',
    totalProducts: 'Plats au menu',
    pending: 'En préparation',
    processing: 'En cuisine',
    completed: 'Servi',
    cancelled: 'Annulé',
  },

  HOTEL: {
    product: 'Chambre',
    products: 'Chambres',
    order: 'Réservation',
    orders: 'Réservations',
    customer: 'Client',
    customers: 'Clients',
    category: 'Type de chambre',
    categories: 'Types de chambres',
    addProduct: 'Ajouter une chambre',
    manageOrders: 'Gérer les réservations',
    viewCustomers: 'Voir les clients',
    totalProducts: 'Chambres disponibles',
    totalOrders: 'Réservations',
    totalCustomers: 'Clients',
    pending: 'En attente',
    processing: 'Check-in',
    completed: 'Check-out',
    cancelled: 'Annulée',
  },

  TRAVEL: {
    product: 'Voyage',
    products: 'Voyages',
    order: 'Réservation',
    orders: 'Réservations',
    customer: 'Voyageur',
    customers: 'Voyageurs',
    category: 'Type de voyage',
    categories: 'Types de voyages',
    addProduct: 'Ajouter un voyage',
    manageOrders: 'Gérer les réservations',
    viewCustomers: 'Voir les voyageurs',
    totalProducts: 'Voyages proposés',
    totalOrders: 'Réservations',
    totalCustomers: 'Voyageurs',
    pending: 'En attente',
    processing: 'Confirmé',
    completed: 'Terminé',
    cancelled: 'Annulé',
  },

  RECREATION: {
    product: 'Activité',
    products: 'Activités',
    order: 'Réservation',
    orders: 'Réservations',
    customer: 'Participant',
    customers: 'Participants',
    category: 'Type d\'activité',
    categories: 'Types d\'activités',
    addProduct: 'Ajouter une activité',
    manageOrders: 'Gérer les réservations',
    viewCustomers: 'Voir les participants',
    totalProducts: 'Activités disponibles',
    totalOrders: 'Réservations',
    totalCustomers: 'Participants',
    pending: 'En attente',
    processing: 'Confirmé',
    completed: 'Terminé',
    cancelled: 'Annulé',
  },
}

// Get terminology for a commerce type with fallback to defaults
export function getTerminology(commerceType: CommerceType): CommerceTerminology {
  const typeTerms = terminologyByCommerceType[commerceType] || {}
  return {
    ...defaultTerminology,
    ...typeTerms,
  }
}

// Get a specific term for a commerce type
export function getTerm(commerceType: CommerceType, key: keyof CommerceTerminology): string {
  const terminology = getTerminology(commerceType)
  return terminology[key]
}
