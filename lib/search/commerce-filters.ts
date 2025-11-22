/**
 * Commerce-Type Specific Search Filters
 * Defines filter configurations for each commerce type
 */

import { CommerceType } from '@/lib/commerce-types'

export type FilterType = 'checkbox' | 'range' | 'select' | 'multiselect' | 'rating' | 'date-range' | 'toggle'

export interface FilterOption {
  value: string
  label: string
  count?: number
}

export interface FilterConfig {
  key: string
  label: string
  type: FilterType
  options?: FilterOption[]
  min?: number
  max?: number
  step?: number
  unit?: string
  icon?: string
  defaultExpanded?: boolean
}

export interface CommerceFilterConfig {
  commerceType: CommerceType
  filters: FilterConfig[]
  sortOptions: { value: string; label: string }[]
  defaultSort: string
}

// Common filters across all commerce types
const commonFilters: FilterConfig[] = [
  {
    key: 'price',
    label: 'Prix',
    type: 'range',
    min: 0,
    max: 10000,
    step: 10,
    unit: '€',
    defaultExpanded: true,
  },
  {
    key: 'availability',
    label: 'Disponibilité',
    type: 'toggle',
    defaultExpanded: true,
  },
]

const commonSortOptions = [
  { value: 'relevance', label: 'Pertinence' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'newest', label: 'Nouveautés' },
  { value: 'rating', label: 'Mieux notés' },
  { value: 'name-asc', label: 'Nom A-Z' },
  { value: 'name-desc', label: 'Nom Z-A' },
]

// Commerce-type specific filter configurations
export const commerceFilterConfigs: Record<CommerceType, CommerceFilterConfig> = {
  GENERAL: {
    commerceType: 'GENERAL',
    filters: [...commonFilters],
    sortOptions: commonSortOptions,
    defaultSort: 'relevance',
  },

  FASHION: {
    commerceType: 'FASHION',
    filters: [
      ...commonFilters,
      {
        key: 'size',
        label: 'Taille',
        type: 'multiselect',
        options: [
          { value: 'XS', label: 'XS' },
          { value: 'S', label: 'S' },
          { value: 'M', label: 'M' },
          { value: 'L', label: 'L' },
          { value: 'XL', label: 'XL' },
          { value: 'XXL', label: 'XXL' },
        ],
        defaultExpanded: true,
      },
      {
        key: 'color',
        label: 'Couleur',
        type: 'multiselect',
        options: [
          { value: 'black', label: 'Noir' },
          { value: 'white', label: 'Blanc' },
          { value: 'blue', label: 'Bleu' },
          { value: 'red', label: 'Rouge' },
          { value: 'green', label: 'Vert' },
          { value: 'beige', label: 'Beige' },
          { value: 'grey', label: 'Gris' },
          { value: 'navy', label: 'Marine' },
          { value: 'pink', label: 'Rose' },
          { value: 'brown', label: 'Marron' },
        ],
        defaultExpanded: true,
      },
      {
        key: 'gender',
        label: 'Genre',
        type: 'multiselect',
        options: [
          { value: 'men', label: 'Homme' },
          { value: 'women', label: 'Femme' },
          { value: 'unisex', label: 'Unisexe' },
          { value: 'kids', label: 'Enfant' },
        ],
      },
      {
        key: 'material',
        label: 'Matière',
        type: 'multiselect',
        options: [
          { value: 'cotton', label: 'Coton' },
          { value: 'wool', label: 'Laine' },
          { value: 'silk', label: 'Soie' },
          { value: 'polyester', label: 'Polyester' },
          { value: 'leather', label: 'Cuir' },
          { value: 'linen', label: 'Lin' },
          { value: 'cashmere', label: 'Cachemire' },
        ],
      },
      {
        key: 'fit',
        label: 'Coupe',
        type: 'multiselect',
        options: [
          { value: 'slim', label: 'Slim' },
          { value: 'regular', label: 'Regular' },
          { value: 'loose', label: 'Loose' },
          { value: 'oversized', label: 'Oversized' },
        ],
      },
    ],
    sortOptions: [
      ...commonSortOptions,
      { value: 'bestseller', label: 'Meilleures ventes' },
    ],
    defaultSort: 'newest',
  },

  ELECTRONICS: {
    commerceType: 'ELECTRONICS',
    filters: [
      ...commonFilters,
      {
        key: 'brand',
        label: 'Marque',
        type: 'multiselect',
        options: [], // Dynamically populated
        defaultExpanded: true,
      },
      {
        key: 'storage',
        label: 'Stockage',
        type: 'multiselect',
        options: [
          { value: '64', label: '64 GB' },
          { value: '128', label: '128 GB' },
          { value: '256', label: '256 GB' },
          { value: '512', label: '512 GB' },
          { value: '1024', label: '1 TB' },
        ],
      },
      {
        key: 'ram',
        label: 'RAM',
        type: 'multiselect',
        options: [
          { value: '4', label: '4 GB' },
          { value: '8', label: '8 GB' },
          { value: '16', label: '16 GB' },
          { value: '32', label: '32 GB' },
          { value: '64', label: '64 GB' },
        ],
      },
      {
        key: 'screenSize',
        label: 'Taille écran',
        type: 'range',
        min: 5,
        max: 100,
        step: 1,
        unit: '"',
      },
      {
        key: 'warranty',
        label: 'Garantie',
        type: 'multiselect',
        options: [
          { value: '12', label: '1 an' },
          { value: '24', label: '2 ans' },
          { value: '36', label: '3 ans' },
          { value: '60', label: '5 ans' },
        ],
      },
      {
        key: 'repairabilityIndex',
        label: 'Indice de réparabilité',
        type: 'range',
        min: 0,
        max: 10,
        step: 0.1,
      },
      {
        key: 'energyClass',
        label: 'Classe énergétique',
        type: 'multiselect',
        options: [
          { value: 'A+++', label: 'A+++' },
          { value: 'A++', label: 'A++' },
          { value: 'A+', label: 'A+' },
          { value: 'A', label: 'A' },
          { value: 'B', label: 'B' },
          { value: 'C', label: 'C' },
        ],
      },
    ],
    sortOptions: [
      ...commonSortOptions,
      { value: 'storage-asc', label: 'Stockage croissant' },
      { value: 'specs', label: 'Meilleures specs' },
    ],
    defaultSort: 'relevance',
  },

  FOOD: {
    commerceType: 'FOOD',
    filters: [
      ...commonFilters,
      {
        key: 'organic',
        label: 'Bio',
        type: 'toggle',
        defaultExpanded: true,
      },
      {
        key: 'vegan',
        label: 'Vegan',
        type: 'toggle',
      },
      {
        key: 'glutenFree',
        label: 'Sans gluten',
        type: 'toggle',
      },
      {
        key: 'allergens',
        label: 'Sans allergènes',
        type: 'multiselect',
        options: [
          { value: 'gluten', label: 'Sans gluten' },
          { value: 'lactose', label: 'Sans lactose' },
          { value: 'nuts', label: 'Sans fruits à coque' },
          { value: 'soy', label: 'Sans soja' },
          { value: 'eggs', label: 'Sans œufs' },
        ],
      },
      {
        key: 'origin',
        label: 'Origine',
        type: 'multiselect',
        options: [
          { value: 'france', label: 'France' },
          { value: 'local', label: 'Local' },
          { value: 'europe', label: 'Europe' },
          { value: 'import', label: 'Import' },
        ],
      },
      {
        key: 'pricePerKg',
        label: 'Prix au kg',
        type: 'range',
        min: 0,
        max: 100,
        step: 1,
        unit: '€/kg',
      },
    ],
    sortOptions: [
      ...commonSortOptions,
      { value: 'expiry', label: 'DLC la plus proche' },
      { value: 'pricePerKg', label: 'Prix au kg' },
    ],
    defaultSort: 'relevance',
  },

  ALCOHOL: {
    commerceType: 'ALCOHOL',
    filters: [
      ...commonFilters,
      {
        key: 'wineType',
        label: 'Type de vin',
        type: 'multiselect',
        options: [
          { value: 'red', label: 'Rouge' },
          { value: 'white', label: 'Blanc' },
          { value: 'rose', label: 'Rosé' },
          { value: 'sparkling', label: 'Pétillant' },
          { value: 'champagne', label: 'Champagne' },
        ],
        defaultExpanded: true,
      },
      {
        key: 'spiritType',
        label: 'Type de spiritueux',
        type: 'multiselect',
        options: [
          { value: 'whisky', label: 'Whisky' },
          { value: 'vodka', label: 'Vodka' },
          { value: 'rum', label: 'Rhum' },
          { value: 'gin', label: 'Gin' },
          { value: 'tequila', label: 'Tequila' },
          { value: 'cognac', label: 'Cognac' },
        ],
      },
      {
        key: 'region',
        label: 'Région',
        type: 'multiselect',
        options: [], // Dynamically populated
      },
      {
        key: 'vintage',
        label: 'Millésime',
        type: 'range',
        min: 1990,
        max: new Date().getFullYear(),
        step: 1,
      },
      {
        key: 'alcoholPercentage',
        label: 'Degré d\'alcool',
        type: 'range',
        min: 0,
        max: 60,
        step: 0.5,
        unit: '%',
      },
      {
        key: 'rating',
        label: 'Note Parker/Spectator',
        type: 'range',
        min: 70,
        max: 100,
        step: 1,
      },
    ],
    sortOptions: [
      ...commonSortOptions,
      { value: 'vintage-asc', label: 'Millésime ancien' },
      { value: 'vintage-desc', label: 'Millésime récent' },
      { value: 'rating-desc', label: 'Meilleure note' },
    ],
    defaultSort: 'rating-desc',
  },

  BEAUTY: {
    commerceType: 'BEAUTY',
    filters: [
      ...commonFilters,
      {
        key: 'skinType',
        label: 'Type de peau',
        type: 'multiselect',
        options: [
          { value: 'normal', label: 'Normale' },
          { value: 'dry', label: 'Sèche' },
          { value: 'oily', label: 'Grasse' },
          { value: 'combination', label: 'Mixte' },
          { value: 'sensitive', label: 'Sensible' },
        ],
        defaultExpanded: true,
      },
      {
        key: 'concerns',
        label: 'Problématiques',
        type: 'multiselect',
        options: [
          { value: 'aging', label: 'Anti-âge' },
          { value: 'acne', label: 'Anti-acné' },
          { value: 'hydration', label: 'Hydratation' },
          { value: 'brightening', label: 'Éclat' },
          { value: 'pores', label: 'Pores' },
        ],
      },
      {
        key: 'certifications',
        label: 'Certifications',
        type: 'multiselect',
        options: [
          { value: 'cruelty-free', label: 'Cruelty-free' },
          { value: 'vegan', label: 'Vegan' },
          { value: 'organic', label: 'Bio' },
          { value: 'dermatologist-tested', label: 'Testé dermato' },
        ],
      },
      {
        key: 'brand',
        label: 'Marque',
        type: 'multiselect',
        options: [], // Dynamically populated
      },
    ],
    sortOptions: [
      ...commonSortOptions,
      { value: 'bestseller', label: 'Meilleures ventes' },
    ],
    defaultSort: 'bestseller',
  },

  HOME: {
    commerceType: 'HOME',
    filters: [
      ...commonFilters,
      {
        key: 'roomType',
        label: 'Pièce',
        type: 'multiselect',
        options: [
          { value: 'living', label: 'Salon' },
          { value: 'bedroom', label: 'Chambre' },
          { value: 'kitchen', label: 'Cuisine' },
          { value: 'bathroom', label: 'Salle de bain' },
          { value: 'office', label: 'Bureau' },
          { value: 'outdoor', label: 'Extérieur' },
        ],
        defaultExpanded: true,
      },
      {
        key: 'style',
        label: 'Style',
        type: 'multiselect',
        options: [
          { value: 'modern', label: 'Moderne' },
          { value: 'scandinavian', label: 'Scandinave' },
          { value: 'industrial', label: 'Industriel' },
          { value: 'classic', label: 'Classique' },
          { value: 'bohemian', label: 'Bohème' },
        ],
      },
      {
        key: 'material',
        label: 'Matériau',
        type: 'multiselect',
        options: [
          { value: 'wood', label: 'Bois' },
          { value: 'metal', label: 'Métal' },
          { value: 'fabric', label: 'Tissu' },
          { value: 'leather', label: 'Cuir' },
          { value: 'glass', label: 'Verre' },
        ],
      },
      {
        key: 'assembly',
        label: 'Montage',
        type: 'multiselect',
        options: [
          { value: 'none', label: 'Aucun montage' },
          { value: 'minimal', label: 'Montage simple' },
          { value: 'full', label: 'Montage complet' },
        ],
      },
    ],
    sortOptions: commonSortOptions,
    defaultSort: 'relevance',
  },

  SPORTS: {
    commerceType: 'SPORTS',
    filters: [
      ...commonFilters,
      {
        key: 'sport',
        label: 'Sport',
        type: 'multiselect',
        options: [
          { value: 'running', label: 'Running' },
          { value: 'fitness', label: 'Fitness' },
          { value: 'football', label: 'Football' },
          { value: 'swimming', label: 'Natation' },
          { value: 'hiking', label: 'Randonnée' },
          { value: 'cycling', label: 'Cyclisme' },
          { value: 'yoga', label: 'Yoga' },
        ],
        defaultExpanded: true,
      },
      {
        key: 'level',
        label: 'Niveau',
        type: 'multiselect',
        options: [
          { value: 'beginner', label: 'Débutant' },
          { value: 'intermediate', label: 'Intermédiaire' },
          { value: 'advanced', label: 'Avancé' },
          { value: 'professional', label: 'Professionnel' },
        ],
      },
      {
        key: 'gender',
        label: 'Genre',
        type: 'multiselect',
        options: [
          { value: 'men', label: 'Homme' },
          { value: 'women', label: 'Femme' },
          { value: 'unisex', label: 'Unisexe' },
          { value: 'kids', label: 'Enfant' },
        ],
      },
    ],
    sortOptions: commonSortOptions,
    defaultSort: 'relevance',
  },

  TOYS: {
    commerceType: 'TOYS',
    filters: [
      ...commonFilters,
      {
        key: 'ageMin',
        label: 'Âge minimum',
        type: 'range',
        min: 0,
        max: 18,
        step: 1,
        unit: 'ans',
        defaultExpanded: true,
      },
      {
        key: 'category',
        label: 'Catégorie',
        type: 'multiselect',
        options: [
          { value: 'board-games', label: 'Jeux de société' },
          { value: 'building', label: 'Construction' },
          { value: 'dolls', label: 'Poupées' },
          { value: 'vehicles', label: 'Véhicules' },
          { value: 'creative', label: 'Loisirs créatifs' },
          { value: 'outdoor', label: 'Plein air' },
        ],
      },
      {
        key: 'educational',
        label: 'Éducatif',
        type: 'toggle',
      },
      {
        key: 'batteryRequired',
        label: 'Piles requises',
        type: 'toggle',
      },
    ],
    sortOptions: [
      ...commonSortOptions,
      { value: 'age-asc', label: 'Âge croissant' },
    ],
    defaultSort: 'relevance',
  },

  AUTOMOTIVE: {
    commerceType: 'AUTOMOTIVE',
    filters: [
      ...commonFilters,
      {
        key: 'vehicleBrand',
        label: 'Marque véhicule',
        type: 'multiselect',
        options: [], // Dynamically populated
        defaultExpanded: true,
      },
      {
        key: 'vehicleModel',
        label: 'Modèle',
        type: 'multiselect',
        options: [], // Dynamically populated
      },
      {
        key: 'year',
        label: 'Année',
        type: 'range',
        min: 1990,
        max: new Date().getFullYear() + 1,
        step: 1,
      },
      {
        key: 'oem',
        label: 'Pièce d\'origine',
        type: 'toggle',
      },
      {
        key: 'category',
        label: 'Catégorie',
        type: 'multiselect',
        options: [
          { value: 'engine', label: 'Moteur' },
          { value: 'brakes', label: 'Freins' },
          { value: 'suspension', label: 'Suspension' },
          { value: 'electrical', label: 'Électricité' },
          { value: 'body', label: 'Carrosserie' },
          { value: 'interior', label: 'Intérieur' },
        ],
      },
    ],
    sortOptions: [
      ...commonSortOptions,
      { value: 'compatibility', label: 'Compatibilité' },
    ],
    defaultSort: 'relevance',
  },

  BOOKS: {
    commerceType: 'BOOKS',
    filters: [
      ...commonFilters,
      {
        key: 'genre',
        label: 'Genre',
        type: 'multiselect',
        options: [
          { value: 'fiction', label: 'Fiction' },
          { value: 'romance', label: 'Romance' },
          { value: 'thriller', label: 'Thriller' },
          { value: 'scifi', label: 'Science-fiction' },
          { value: 'fantasy', label: 'Fantasy' },
          { value: 'biography', label: 'Biographie' },
          { value: 'history', label: 'Histoire' },
          { value: 'children', label: 'Jeunesse' },
        ],
        defaultExpanded: true,
      },
      {
        key: 'format',
        label: 'Format',
        type: 'multiselect',
        options: [
          { value: 'hardcover', label: 'Relié' },
          { value: 'paperback', label: 'Broché' },
          { value: 'pocket', label: 'Poche' },
          { value: 'ebook', label: 'E-book' },
          { value: 'audiobook', label: 'Audio' },
        ],
      },
      {
        key: 'language',
        label: 'Langue',
        type: 'multiselect',
        options: [
          { value: 'fr', label: 'Français' },
          { value: 'en', label: 'Anglais' },
          { value: 'es', label: 'Espagnol' },
          { value: 'de', label: 'Allemand' },
        ],
      },
      {
        key: 'author',
        label: 'Auteur',
        type: 'multiselect',
        options: [], // Dynamically populated
      },
    ],
    sortOptions: [
      ...commonSortOptions,
      { value: 'publication-desc', label: 'Plus récent' },
      { value: 'bestseller', label: 'Meilleures ventes' },
    ],
    defaultSort: 'bestseller',
  },

  PETS: {
    commerceType: 'PETS',
    filters: [
      ...commonFilters,
      {
        key: 'petType',
        label: 'Animal',
        type: 'multiselect',
        options: [
          { value: 'dog', label: 'Chien' },
          { value: 'cat', label: 'Chat' },
          { value: 'bird', label: 'Oiseau' },
          { value: 'fish', label: 'Poisson' },
          { value: 'rodent', label: 'Rongeur' },
          { value: 'reptile', label: 'Reptile' },
        ],
        defaultExpanded: true,
      },
      {
        key: 'ageGroup',
        label: 'Âge',
        type: 'multiselect',
        options: [
          { value: 'puppy', label: 'Jeune' },
          { value: 'adult', label: 'Adulte' },
          { value: 'senior', label: 'Senior' },
        ],
      },
      {
        key: 'size',
        label: 'Taille',
        type: 'multiselect',
        options: [
          { value: 'small', label: 'Petit' },
          { value: 'medium', label: 'Moyen' },
          { value: 'large', label: 'Grand' },
        ],
      },
    ],
    sortOptions: commonSortOptions,
    defaultSort: 'relevance',
  },

  DIGITAL: {
    commerceType: 'DIGITAL',
    filters: [
      ...commonFilters,
      {
        key: 'category',
        label: 'Catégorie',
        type: 'multiselect',
        options: [
          { value: 'ebook', label: 'E-books' },
          { value: 'software', label: 'Logiciels' },
          { value: 'course', label: 'Formations' },
          { value: 'template', label: 'Templates' },
          { value: 'music', label: 'Musique' },
          { value: 'graphics', label: 'Graphisme' },
        ],
        defaultExpanded: true,
      },
      {
        key: 'licenseType',
        label: 'Licence',
        type: 'multiselect',
        options: [
          { value: 'personal', label: 'Personnelle' },
          { value: 'commercial', label: 'Commerciale' },
          { value: 'enterprise', label: 'Enterprise' },
        ],
      },
      {
        key: 'platform',
        label: 'Plateforme',
        type: 'multiselect',
        options: [
          { value: 'windows', label: 'Windows' },
          { value: 'mac', label: 'Mac' },
          { value: 'linux', label: 'Linux' },
          { value: 'web', label: 'Web' },
          { value: 'mobile', label: 'Mobile' },
        ],
      },
    ],
    sortOptions: [
      ...commonSortOptions,
      { value: 'downloads', label: 'Plus téléchargés' },
    ],
    defaultSort: 'downloads',
  },

  SERVICES: {
    commerceType: 'SERVICES',
    filters: [
      ...commonFilters,
      {
        key: 'deliveryMethod',
        label: 'Mode',
        type: 'multiselect',
        options: [
          { value: 'online', label: 'En ligne' },
          { value: 'in-person', label: 'En présentiel' },
          { value: 'both', label: 'Les deux' },
        ],
        defaultExpanded: true,
      },
      {
        key: 'duration',
        label: 'Durée',
        type: 'range',
        min: 15,
        max: 480,
        step: 15,
        unit: 'min',
      },
      {
        key: 'frequency',
        label: 'Fréquence',
        type: 'multiselect',
        options: [
          { value: 'one-time', label: 'Ponctuel' },
          { value: 'weekly', label: 'Hebdomadaire' },
          { value: 'monthly', label: 'Mensuel' },
          { value: 'yearly', label: 'Annuel' },
        ],
      },
      {
        key: 'giftable',
        label: 'Offrable en cadeau',
        type: 'toggle',
      },
    ],
    sortOptions: commonSortOptions,
    defaultSort: 'relevance',
  },

  SEASONAL: {
    commerceType: 'SEASONAL',
    filters: [
      ...commonFilters,
      {
        key: 'season',
        label: 'Saison',
        type: 'multiselect',
        options: [
          { value: 'christmas', label: 'Noël' },
          { value: 'halloween', label: 'Halloween' },
          { value: 'easter', label: 'Pâques' },
          { value: 'valentine', label: 'Saint-Valentin' },
          { value: 'summer', label: 'Été' },
          { value: 'back-to-school', label: 'Rentrée' },
        ],
        defaultExpanded: true,
      },
    ],
    sortOptions: commonSortOptions,
    defaultSort: 'relevance',
  },

  RESTAURANT: {
    commerceType: 'RESTAURANT',
    filters: [
      ...commonFilters,
      {
        key: 'category',
        label: 'Catégorie',
        type: 'multiselect',
        options: [
          { value: 'starter', label: 'Entrées' },
          { value: 'main', label: 'Plats' },
          { value: 'dessert', label: 'Desserts' },
          { value: 'drink', label: 'Boissons' },
          { value: 'formula', label: 'Formules' },
          { value: 'side', label: 'Accompagnements' },
        ],
        defaultExpanded: true,
      },
      {
        key: 'vegetarian',
        label: 'Végétarien',
        type: 'toggle',
      },
      {
        key: 'vegan',
        label: 'Vegan',
        type: 'toggle',
      },
      {
        key: 'glutenFree',
        label: 'Sans gluten',
        type: 'toggle',
      },
      {
        key: 'spicyLevel',
        label: 'Niveau épicé',
        type: 'range',
        min: 0,
        max: 3,
        step: 1,
      },
      {
        key: 'prepTime',
        label: 'Temps de préparation',
        type: 'range',
        min: 5,
        max: 60,
        step: 5,
        unit: 'min',
      },
    ],
    sortOptions: [
      ...commonSortOptions,
      { value: 'prep-asc', label: 'Préparation rapide' },
      { value: 'popular', label: 'Populaire' },
    ],
    defaultSort: 'popular',
  },

  HOTEL: {
    commerceType: 'HOTEL',
    filters: [
      {
        key: 'dates',
        label: 'Dates',
        type: 'date-range',
        defaultExpanded: true,
      },
      {
        key: 'guests',
        label: 'Voyageurs',
        type: 'range',
        min: 1,
        max: 10,
        step: 1,
      },
      ...commonFilters,
      {
        key: 'roomType',
        label: 'Type de chambre',
        type: 'multiselect',
        options: [
          { value: 'standard', label: 'Standard' },
          { value: 'superior', label: 'Supérieure' },
          { value: 'suite', label: 'Suite' },
          { value: 'family', label: 'Familiale' },
        ],
        defaultExpanded: true,
      },
      {
        key: 'amenities',
        label: 'Équipements',
        type: 'multiselect',
        options: [
          { value: 'wifi', label: 'WiFi' },
          { value: 'parking', label: 'Parking' },
          { value: 'pool', label: 'Piscine' },
          { value: 'spa', label: 'Spa' },
          { value: 'gym', label: 'Salle de sport' },
          { value: 'restaurant', label: 'Restaurant' },
          { value: 'aircon', label: 'Climatisation' },
        ],
      },
      {
        key: 'view',
        label: 'Vue',
        type: 'multiselect',
        options: [
          { value: 'city', label: 'Ville' },
          { value: 'sea', label: 'Mer' },
          { value: 'garden', label: 'Jardin' },
          { value: 'pool', label: 'Piscine' },
        ],
      },
      {
        key: 'petFriendly',
        label: 'Animaux acceptés',
        type: 'toggle',
      },
      {
        key: 'stars',
        label: 'Étoiles',
        type: 'rating',
        min: 1,
        max: 5,
      },
    ],
    sortOptions: [
      { value: 'price-asc', label: 'Prix croissant' },
      { value: 'price-desc', label: 'Prix décroissant' },
      { value: 'rating', label: 'Mieux notés' },
      { value: 'distance', label: 'Distance' },
    ],
    defaultSort: 'rating',
  },

  TRAVEL: {
    commerceType: 'TRAVEL',
    filters: [
      {
        key: 'dates',
        label: 'Dates',
        type: 'date-range',
        defaultExpanded: true,
      },
      {
        key: 'passengers',
        label: 'Voyageurs',
        type: 'range',
        min: 1,
        max: 10,
        step: 1,
      },
      ...commonFilters,
      {
        key: 'destination',
        label: 'Destination',
        type: 'multiselect',
        options: [], // Dynamically populated
        defaultExpanded: true,
      },
      {
        key: 'duration',
        label: 'Durée',
        type: 'range',
        min: 1,
        max: 30,
        step: 1,
        unit: 'jours',
      },
      {
        key: 'travelClass',
        label: 'Classe',
        type: 'multiselect',
        options: [
          { value: 'economy', label: 'Économique' },
          { value: 'premium', label: 'Premium' },
          { value: 'business', label: 'Business' },
          { value: 'first', label: 'Première' },
        ],
      },
      {
        key: 'inclusions',
        label: 'Inclus',
        type: 'multiselect',
        options: [
          { value: 'flight', label: 'Vol' },
          { value: 'hotel', label: 'Hôtel' },
          { value: 'meals', label: 'Repas' },
          { value: 'transfers', label: 'Transferts' },
          { value: 'guide', label: 'Guide' },
          { value: 'insurance', label: 'Assurance' },
        ],
      },
    ],
    sortOptions: [
      { value: 'price-asc', label: 'Prix croissant' },
      { value: 'price-desc', label: 'Prix décroissant' },
      { value: 'duration-asc', label: 'Durée courte' },
      { value: 'duration-desc', label: 'Durée longue' },
      { value: 'departure', label: 'Départ proche' },
      { value: 'rating', label: 'Mieux notés' },
    ],
    defaultSort: 'price-asc',
  },

  RECREATION: {
    commerceType: 'RECREATION',
    filters: [
      {
        key: 'date',
        label: 'Date',
        type: 'date-range',
        defaultExpanded: true,
      },
      {
        key: 'participants',
        label: 'Participants',
        type: 'range',
        min: 1,
        max: 20,
        step: 1,
      },
      ...commonFilters,
      {
        key: 'activityType',
        label: 'Type d\'activité',
        type: 'multiselect',
        options: [
          { value: 'show', label: 'Spectacle' },
          { value: 'park', label: 'Parc' },
          { value: 'workshop', label: 'Atelier' },
          { value: 'tour', label: 'Visite' },
          { value: 'sport', label: 'Sport' },
          { value: 'wellness', label: 'Bien-être' },
        ],
        defaultExpanded: true,
      },
      {
        key: 'duration',
        label: 'Durée',
        type: 'range',
        min: 30,
        max: 480,
        step: 30,
        unit: 'min',
      },
      {
        key: 'difficulty',
        label: 'Difficulté',
        type: 'multiselect',
        options: [
          { value: 'easy', label: 'Facile' },
          { value: 'moderate', label: 'Modéré' },
          { value: 'hard', label: 'Difficile' },
          { value: 'expert', label: 'Expert' },
        ],
      },
      {
        key: 'minAge',
        label: 'Âge minimum',
        type: 'range',
        min: 0,
        max: 18,
        step: 1,
        unit: 'ans',
      },
      {
        key: 'indoor',
        label: 'En intérieur',
        type: 'toggle',
      },
    ],
    sortOptions: [
      ...commonSortOptions,
      { value: 'date-asc', label: 'Date proche' },
      { value: 'duration-asc', label: 'Durée courte' },
      { value: 'popular', label: 'Populaire' },
    ],
    defaultSort: 'popular',
  },
}

/**
 * Get filter configuration for a commerce type
 */
export function getFiltersForCommerceType(commerceType: CommerceType): CommerceFilterConfig {
  return commerceFilterConfigs[commerceType] || commerceFilterConfigs.GENERAL
}

/**
 * Build search query from filters
 */
export function buildSearchQuery(
  filters: Record<string, unknown>,
  commerceType: CommerceType
): Record<string, unknown> {
  const config = getFiltersForCommerceType(commerceType)
  const query: Record<string, unknown> = {}

  for (const filterConfig of config.filters) {
    const value = filters[filterConfig.key]
    if (value === undefined || value === null) continue

    switch (filterConfig.type) {
      case 'range':
        if (typeof value === 'object' && value !== null) {
          const range = value as { min?: number; max?: number }
          if (range.min !== undefined) {
            query[`${filterConfig.key}_gte`] = range.min
          }
          if (range.max !== undefined) {
            query[`${filterConfig.key}_lte`] = range.max
          }
        }
        break

      case 'multiselect':
      case 'checkbox':
        if (Array.isArray(value) && value.length > 0) {
          query[`${filterConfig.key}_in`] = value
        }
        break

      case 'toggle':
        if (value === true) {
          query[filterConfig.key] = true
        }
        break

      case 'date-range':
        if (typeof value === 'object' && value !== null) {
          const dateRange = value as { start?: string; end?: string }
          if (dateRange.start) {
            query[`${filterConfig.key}_gte`] = dateRange.start
          }
          if (dateRange.end) {
            query[`${filterConfig.key}_lte`] = dateRange.end
          }
        }
        break

      case 'rating':
        if (typeof value === 'number') {
          query[`${filterConfig.key}_gte`] = value
        }
        break

      default:
        query[filterConfig.key] = value
    }
  }

  return query
}

/**
 * Get active filter count
 */
export function getActiveFilterCount(
  filters: Record<string, unknown>,
  commerceType: CommerceType
): number {
  const config = getFiltersForCommerceType(commerceType)
  let count = 0

  for (const filterConfig of config.filters) {
    const value = filters[filterConfig.key]
    if (value === undefined || value === null) continue

    if (filterConfig.type === 'range' || filterConfig.type === 'date-range') {
      if (typeof value === 'object' && value !== null) {
        const range = value as { min?: unknown; max?: unknown; start?: unknown; end?: unknown }
        if (range.min !== undefined || range.max !== undefined || range.start || range.end) {
          count++
        }
      }
    } else if (Array.isArray(value)) {
      if (value.length > 0) count++
    } else if (value === true) {
      count++
    } else if (value !== '') {
      count++
    }
  }

  return count
}
