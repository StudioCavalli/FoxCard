// Commerce type definitions and configurations for all 19 commerce types
import {
  ShoppingBag,
  Utensils,
  Wine,
  Shirt,
  Smartphone,
  Sparkles,
  Home,
  Dumbbell,
  Gamepad2,
  Car,
  BookOpen,
  PawPrint,
  Download,
  CalendarCheck,
  Snowflake,
  ChefHat,
  Building2,
  Plane,
  Ticket,
  type LucideIcon,
} from 'lucide-react'

// All 19 commerce types matching Prisma enum
export type CommerceType =
  | 'GENERAL'
  | 'FOOD'
  | 'ALCOHOL'
  | 'FASHION'
  | 'ELECTRONICS'
  | 'BEAUTY'
  | 'HOME'
  | 'SPORTS'
  | 'TOYS'
  | 'AUTOMOTIVE'
  | 'BOOKS'
  | 'PETS'
  | 'DIGITAL'
  | 'SERVICES'
  | 'SEASONAL'
  | 'RESTAURANT'
  | 'HOTEL'
  | 'TRAVEL'
  | 'RECREATION'

// Commerce type feature flags
export interface CommerceTypeFeatures {
  hasPhysicalProducts: boolean
  hasDigitalProducts: boolean
  hasBookings: boolean
  hasSubscriptions: boolean
  requiresShipping: boolean
  requiresAgeVerification: boolean
  allowsPreorders: boolean
  hasVariants: boolean
  hasTimeslots: boolean
  hasCapacity: boolean
}

// Product attribute schemas by commerce type
export interface FoodAttributes {
  ingredients?: string[]
  allergens?: string[]
  nutritionalInfo?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    fiber?: number
    sodium?: number
  }
  expiryDate?: string
  storageInstructions?: string
  organic?: boolean
  vegan?: boolean
  glutenFree?: boolean
  weight?: number
  pricePerKg?: number
}

export interface AlcoholAttributes {
  alcoholPercentage: number
  volume: number
  region?: string
  vintage?: number
  grapeVariety?: string[]
  servingTemp?: string
  tastingNotes?: string
  pairings?: string[]
  wineType?: 'red' | 'white' | 'rose' | 'sparkling' | 'fortified'
  spiritType?: 'whisky' | 'vodka' | 'rum' | 'gin' | 'tequila' | 'cognac' | 'other'
  rating?: { parker?: number; spectator?: number }
}

export interface FashionAttributes {
  material: string[]
  careInstructions?: string[]
  fit?: 'slim' | 'regular' | 'loose' | 'oversized'
  season?: ('spring' | 'summer' | 'fall' | 'winter')[]
  gender?: 'men' | 'women' | 'unisex' | 'kids'
  sizeChart?: Record<string, { chest?: number; waist?: number; hips?: number; length?: number }>
  color?: string
  pattern?: string
  availableSizes?: string[]
  availableColors?: string[]
}

export interface ElectronicsAttributes {
  specifications: Record<string, string>
  warranty?: number
  compatibility?: string[]
  powerConsumption?: number
  dimensions?: { width: number; height: number; depth: number }
  weight?: number
  connectivity?: string[]
  batteryLife?: number
  repairabilityIndex?: number
  energyClass?: string
}

export interface BeautyAttributes {
  ingredients: string[]
  skinType?: ('normal' | 'dry' | 'oily' | 'combination' | 'sensitive')[]
  usage?: string
  volume?: number
  certifications?: ('cruelty-free' | 'vegan' | 'organic' | 'dermatologist-tested')[]
  scent?: string
  concerns?: ('aging' | 'acne' | 'hydration' | 'brightening' | 'pores')[]
  pao?: number // Period After Opening in months
}

export interface HomeAttributes {
  dimensions: { width: number; height: number; depth: number }
  weight?: number
  material: string[]
  assembly?: 'none' | 'minimal' | 'full'
  roomType?: ('living' | 'bedroom' | 'kitchen' | 'bathroom' | 'office' | 'outdoor')[]
  style?: string
  color?: string
  maxLoad?: number
}

export interface SportsAttributes {
  sport: string[]
  level?: 'beginner' | 'intermediate' | 'advanced' | 'professional'
  material?: string[]
  size?: string
  gender?: 'men' | 'women' | 'unisex' | 'kids'
  weight?: number
  features?: string[]
}

export interface ToysAttributes {
  ageRange: { min: number; max?: number }
  material?: string[]
  batteryRequired?: boolean
  batteryType?: string
  safety?: string[]
  educational?: boolean
  numberOfPlayers?: { min: number; max: number }
  assemblyRequired?: boolean
}

export interface AutomotiveAttributes {
  vehicleType?: string[]
  brand?: string[]
  model?: string[]
  year?: { min?: number; max?: number }
  partNumber?: string
  oem?: boolean
  warranty?: number
  compatibility?: string[]
}

export interface BooksAttributes {
  author: string
  publisher?: string
  isbn?: string
  pages?: number
  language?: string
  format?: 'hardcover' | 'paperback' | 'ebook' | 'audiobook'
  genre?: string[]
  publicationDate?: string
  edition?: string
}

export interface PetsAttributes {
  petType: ('dog' | 'cat' | 'bird' | 'fish' | 'rodent' | 'reptile' | 'other')[]
  breed?: string[]
  ageGroup?: 'puppy' | 'adult' | 'senior'
  size?: 'small' | 'medium' | 'large'
  ingredients?: string[]
  weight?: number
}

export interface DigitalAttributes {
  fileFormat?: string[]
  fileSize?: number
  downloadLimit?: number
  licenseType?: 'personal' | 'commercial' | 'enterprise'
  platform?: string[]
  requirements?: string[]
  version?: string
  updatePolicy?: string
}

export interface ServicesAttributes {
  duration?: number
  frequency?: 'one-time' | 'weekly' | 'monthly' | 'yearly'
  deliveryMethod?: 'online' | 'in-person' | 'both'
  cancellationPolicy?: string
  validity?: number
  giftable?: boolean
}

export interface RestaurantAttributes {
  category: 'starter' | 'main' | 'dessert' | 'drink' | 'formula' | 'side'
  allergens: string[]
  prepTime?: number
  spicyLevel?: 0 | 1 | 2 | 3
  vegetarian?: boolean
  vegan?: boolean
  glutenFree?: boolean
  options?: { name: string; choices: { label: string; price: number }[] }[]
}

export interface HotelAttributes {
  roomType: string
  capacity: number
  beds: { type: string; count: number }[]
  amenities: string[]
  size?: number
  view?: string
  floor?: number
  smokingAllowed?: boolean
  petFriendly?: boolean
}

export interface TravelAttributes {
  destinations: string[]
  departureCity?: string
  duration: number
  inclusions: string[]
  exclusions?: string[]
  itinerary?: { day: number; title: string; description: string }[]
  travelClass?: 'economy' | 'business' | 'first'
  passengerTypes?: { type: string; minAge?: number; maxAge?: number; priceModifier: number }[]
}

export interface RecreationAttributes {
  activityType: string
  duration: number
  difficulty?: 'easy' | 'moderate' | 'hard' | 'expert'
  minAge?: number
  maxParticipants?: number
  equipment?: string[]
  location?: string
  indoor?: boolean
}

export type ProductAttributes =
  | FoodAttributes
  | AlcoholAttributes
  | FashionAttributes
  | ElectronicsAttributes
  | BeautyAttributes
  | HomeAttributes
  | SportsAttributes
  | ToysAttributes
  | AutomotiveAttributes
  | BooksAttributes
  | PetsAttributes
  | DigitalAttributes
  | ServicesAttributes
  | RestaurantAttributes
  | HotelAttributes
  | TravelAttributes
  | RecreationAttributes
  | Record<string, unknown>

// Commerce type configuration for stores
export interface CommerceTypeConfig {
  type: CommerceType
  name: string
  description: string
  icon: LucideIcon
  emoji: string
  features: CommerceTypeFeatures
  requiredAttributes: string[]
  optionalAttributes: { key: string; label: string; type: string; description?: string }[]
  variantTypes?: { key: string; label: string; options?: string[] }[]
  ageVerification?: boolean
  minAge?: number
  regulations?: string[]
  defaultCategories: string[]
  displayOptions: {
    showNutritionalInfo?: boolean
    showAlcoholContent?: boolean
    showSizeChart?: boolean
    showSpecifications?: boolean
    showIngredients?: boolean
    showCalendar?: boolean
    showMap?: boolean
    showRating?: boolean
  }
  checkoutSteps: string[]
  paymentMethods?: string[]
}

// All 19 commerce type configurations
export const commerceTypeConfigs: Record<CommerceType, CommerceTypeConfig> = {
  GENERAL: {
    type: 'GENERAL',
    name: 'Général',
    description: 'Boutique e-commerce standard multi-produits',
    icon: ShoppingBag,
    emoji: '🛒',
    features: {
      hasPhysicalProducts: true,
      hasDigitalProducts: false,
      hasBookings: false,
      hasSubscriptions: false,
      requiresShipping: true,
      requiresAgeVerification: false,
      allowsPreorders: true,
      hasVariants: true,
      hasTimeslots: false,
      hasCapacity: false,
    },
    requiredAttributes: [],
    optionalAttributes: [],
    defaultCategories: ['Produits', 'Nouveautés', 'Promotions'],
    displayOptions: {},
    checkoutSteps: ['cart', 'shipping', 'payment', 'confirmation'],
  },

  FOOD: {
    type: 'FOOD',
    name: 'Alimentation',
    description: 'Épicerie, produits frais et alimentaires',
    icon: Utensils,
    emoji: '🍽️',
    features: {
      hasPhysicalProducts: true,
      hasDigitalProducts: false,
      hasBookings: false,
      hasSubscriptions: true,
      requiresShipping: true,
      requiresAgeVerification: false,
      allowsPreorders: true,
      hasVariants: true,
      hasTimeslots: false,
      hasCapacity: false,
    },
    requiredAttributes: [],
    optionalAttributes: [
      { key: 'ingredients', label: 'Ingrédients', type: 'array', description: 'Liste des ingrédients' },
      { key: 'allergens', label: 'Allergènes', type: 'array', description: 'Liste des allergènes (gluten, lactose, etc.)' },
      { key: 'nutritionalInfo', label: 'Info nutritionnelle', type: 'object', description: 'Valeurs nutritionnelles pour 100g' },
      { key: 'expiryDate', label: 'DLC', type: 'date' },
      { key: 'storageInstructions', label: 'Conservation', type: 'string' },
      { key: 'organic', label: 'Bio', type: 'boolean' },
      { key: 'vegan', label: 'Vegan', type: 'boolean' },
      { key: 'glutenFree', label: 'Sans gluten', type: 'boolean' },
      { key: 'weight', label: 'Poids (g)', type: 'number' },
      { key: 'pricePerKg', label: 'Prix au kg', type: 'number' },
    ],
    variantTypes: [
      { key: 'weight', label: 'Poids', options: ['250g', '500g', '1kg', '2kg'] },
      { key: 'format', label: 'Format', options: ['Sachet', 'Boîte', 'Bocal', 'Vrac'] },
    ],
    defaultCategories: ['Épicerie', 'Produits frais', 'Boissons', 'Surgelés', 'Bio'],
    displayOptions: {
      showNutritionalInfo: true,
      showIngredients: true,
    },
    checkoutSteps: ['cart', 'shipping', 'payment', 'confirmation'],
  },

  ALCOHOL: {
    type: 'ALCOHOL',
    name: 'Vins & Spiritueux',
    description: 'Cave à vins, bières et spiritueux',
    icon: Wine,
    emoji: '🍷',
    features: {
      hasPhysicalProducts: true,
      hasDigitalProducts: false,
      hasBookings: false,
      hasSubscriptions: true,
      requiresShipping: true,
      requiresAgeVerification: true,
      allowsPreorders: true,
      hasVariants: false,
      hasTimeslots: false,
      hasCapacity: false,
    },
    requiredAttributes: ['alcoholPercentage', 'volume'],
    optionalAttributes: [
      { key: 'alcoholPercentage', label: 'Degré d\'alcool', type: 'number', description: 'Pourcentage d\'alcool' },
      { key: 'volume', label: 'Volume (ml)', type: 'number' },
      { key: 'region', label: 'Région', type: 'string', description: 'Région de production' },
      { key: 'vintage', label: 'Millésime', type: 'number' },
      { key: 'grapeVariety', label: 'Cépage', type: 'array' },
      { key: 'servingTemp', label: 'Température de service', type: 'string' },
      { key: 'tastingNotes', label: 'Notes de dégustation', type: 'string' },
      { key: 'pairings', label: 'Accords mets', type: 'array' },
      { key: 'rating', label: 'Notation', type: 'object' },
    ],
    ageVerification: true,
    minAge: 18,
    regulations: [
      'L\'abus d\'alcool est dangereux pour la santé',
      'À consommer avec modération',
      'La vente d\'alcool est interdite aux mineurs',
    ],
    defaultCategories: ['Vins rouges', 'Vins blancs', 'Rosés', 'Champagnes', 'Spiritueux', 'Bières'],
    displayOptions: {
      showAlcoholContent: true,
      showRating: true,
    },
    checkoutSteps: ['cart', 'age-verification', 'shipping', 'payment', 'confirmation'],
  },

  FASHION: {
    type: 'FASHION',
    name: 'Mode',
    description: 'Vêtements, chaussures et accessoires',
    icon: Shirt,
    emoji: '👗',
    features: {
      hasPhysicalProducts: true,
      hasDigitalProducts: false,
      hasBookings: false,
      hasSubscriptions: false,
      requiresShipping: true,
      requiresAgeVerification: false,
      allowsPreorders: true,
      hasVariants: true,
      hasTimeslots: false,
      hasCapacity: false,
    },
    requiredAttributes: [],
    optionalAttributes: [
      { key: 'material', label: 'Matière', type: 'array', description: 'Composition du produit' },
      { key: 'careInstructions', label: 'Entretien', type: 'array' },
      { key: 'fit', label: 'Coupe', type: 'select', description: 'slim, regular, loose, oversized' },
      { key: 'season', label: 'Saison', type: 'multiselect' },
      { key: 'gender', label: 'Genre', type: 'select' },
      { key: 'sizeChart', label: 'Guide des tailles', type: 'object' },
      { key: 'color', label: 'Couleur', type: 'string' },
      { key: 'pattern', label: 'Motif', type: 'string' },
    ],
    variantTypes: [
      { key: 'size', label: 'Taille', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
      { key: 'color', label: 'Couleur' },
    ],
    defaultCategories: ['Homme', 'Femme', 'Enfant', 'Accessoires', 'Chaussures'],
    displayOptions: {
      showSizeChart: true,
    },
    checkoutSteps: ['cart', 'shipping', 'payment', 'confirmation'],
  },

  ELECTRONICS: {
    type: 'ELECTRONICS',
    name: 'Électronique',
    description: 'High-tech, informatique et gadgets',
    icon: Smartphone,
    emoji: '📱',
    features: {
      hasPhysicalProducts: true,
      hasDigitalProducts: false,
      hasBookings: false,
      hasSubscriptions: false,
      requiresShipping: true,
      requiresAgeVerification: false,
      allowsPreorders: true,
      hasVariants: true,
      hasTimeslots: false,
      hasCapacity: false,
    },
    requiredAttributes: [],
    optionalAttributes: [
      { key: 'specifications', label: 'Caractéristiques', type: 'object', description: 'Spécifications techniques' },
      { key: 'warranty', label: 'Garantie (mois)', type: 'number' },
      { key: 'compatibility', label: 'Compatibilité', type: 'array' },
      { key: 'powerConsumption', label: 'Consommation (W)', type: 'number' },
      { key: 'dimensions', label: 'Dimensions', type: 'object' },
      { key: 'weight', label: 'Poids (g)', type: 'number' },
      { key: 'connectivity', label: 'Connectivité', type: 'array' },
      { key: 'batteryLife', label: 'Autonomie (h)', type: 'number' },
      { key: 'repairabilityIndex', label: 'Indice de réparabilité', type: 'number' },
      { key: 'energyClass', label: 'Classe énergétique', type: 'string' },
    ],
    variantTypes: [
      { key: 'storage', label: 'Stockage', options: ['64GB', '128GB', '256GB', '512GB', '1TB'] },
      { key: 'color', label: 'Couleur' },
      { key: 'ram', label: 'RAM', options: ['4GB', '8GB', '16GB', '32GB', '64GB'] },
    ],
    defaultCategories: ['Smartphones', 'Ordinateurs', 'Audio', 'Photo/Vidéo', 'Accessoires', 'Gaming'],
    displayOptions: {
      showSpecifications: true,
      showRating: true,
    },
    checkoutSteps: ['cart', 'shipping', 'payment', 'confirmation'],
  },

  BEAUTY: {
    type: 'BEAUTY',
    name: 'Beauté & Santé',
    description: 'Cosmétiques, soins et bien-être',
    icon: Sparkles,
    emoji: '💄',
    features: {
      hasPhysicalProducts: true,
      hasDigitalProducts: false,
      hasBookings: false,
      hasSubscriptions: true,
      requiresShipping: true,
      requiresAgeVerification: false,
      allowsPreorders: true,
      hasVariants: true,
      hasTimeslots: false,
      hasCapacity: false,
    },
    requiredAttributes: [],
    optionalAttributes: [
      { key: 'ingredients', label: 'Ingrédients INCI', type: 'array', description: 'Liste INCI' },
      { key: 'skinType', label: 'Type de peau', type: 'multiselect' },
      { key: 'usage', label: 'Utilisation', type: 'string' },
      { key: 'volume', label: 'Contenance (ml)', type: 'number' },
      { key: 'certifications', label: 'Certifications', type: 'multiselect' },
      { key: 'scent', label: 'Parfum', type: 'string' },
      { key: 'concerns', label: 'Problématiques', type: 'multiselect' },
      { key: 'pao', label: 'PAO (mois)', type: 'number', description: 'Durée après ouverture' },
    ],
    variantTypes: [
      { key: 'shade', label: 'Teinte' },
      { key: 'size', label: 'Format', options: ['Mini', 'Standard', 'Grand format'] },
    ],
    defaultCategories: ['Visage', 'Corps', 'Cheveux', 'Maquillage', 'Parfums', 'Bio'],
    displayOptions: {
      showIngredients: true,
    },
    checkoutSteps: ['cart', 'shipping', 'payment', 'confirmation'],
  },

  HOME: {
    type: 'HOME',
    name: 'Maison & Jardin',
    description: 'Mobilier, décoration et jardinage',
    icon: Home,
    emoji: '🏠',
    features: {
      hasPhysicalProducts: true,
      hasDigitalProducts: false,
      hasBookings: false,
      hasSubscriptions: false,
      requiresShipping: true,
      requiresAgeVerification: false,
      allowsPreorders: true,
      hasVariants: true,
      hasTimeslots: false,
      hasCapacity: false,
    },
    requiredAttributes: [],
    optionalAttributes: [
      { key: 'dimensions', label: 'Dimensions (cm)', type: 'object', description: 'L x l x H' },
      { key: 'weight', label: 'Poids (kg)', type: 'number' },
      { key: 'material', label: 'Matériaux', type: 'array' },
      { key: 'assembly', label: 'Montage', type: 'select' },
      { key: 'roomType', label: 'Pièce', type: 'multiselect' },
      { key: 'style', label: 'Style', type: 'string' },
      { key: 'color', label: 'Couleur', type: 'string' },
      { key: 'maxLoad', label: 'Charge max (kg)', type: 'number' },
    ],
    variantTypes: [
      { key: 'color', label: 'Couleur' },
      { key: 'size', label: 'Dimension' },
    ],
    defaultCategories: ['Salon', 'Chambre', 'Cuisine', 'Salle de bain', 'Jardin', 'Décoration'],
    displayOptions: {
      showSpecifications: true,
    },
    checkoutSteps: ['cart', 'shipping', 'payment', 'confirmation'],
  },

  SPORTS: {
    type: 'SPORTS',
    name: 'Sports & Outdoor',
    description: 'Équipements sportifs et plein air',
    icon: Dumbbell,
    emoji: '⚽',
    features: {
      hasPhysicalProducts: true,
      hasDigitalProducts: false,
      hasBookings: false,
      hasSubscriptions: false,
      requiresShipping: true,
      requiresAgeVerification: false,
      allowsPreorders: true,
      hasVariants: true,
      hasTimeslots: false,
      hasCapacity: false,
    },
    requiredAttributes: [],
    optionalAttributes: [
      { key: 'sport', label: 'Sport', type: 'array' },
      { key: 'level', label: 'Niveau', type: 'select' },
      { key: 'material', label: 'Matière', type: 'array' },
      { key: 'size', label: 'Taille', type: 'string' },
      { key: 'gender', label: 'Genre', type: 'select' },
      { key: 'weight', label: 'Poids (g)', type: 'number' },
      { key: 'features', label: 'Caractéristiques', type: 'array' },
    ],
    variantTypes: [
      { key: 'size', label: 'Taille', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
      { key: 'color', label: 'Couleur' },
    ],
    defaultCategories: ['Running', 'Fitness', 'Sports collectifs', 'Natation', 'Randonnée', 'Cyclisme'],
    displayOptions: {
      showSpecifications: true,
    },
    checkoutSteps: ['cart', 'shipping', 'payment', 'confirmation'],
  },

  TOYS: {
    type: 'TOYS',
    name: 'Jouets & Jeux',
    description: 'Jouets, jeux de société et loisirs créatifs',
    icon: Gamepad2,
    emoji: '🎮',
    features: {
      hasPhysicalProducts: true,
      hasDigitalProducts: false,
      hasBookings: false,
      hasSubscriptions: false,
      requiresShipping: true,
      requiresAgeVerification: false,
      allowsPreorders: true,
      hasVariants: false,
      hasTimeslots: false,
      hasCapacity: false,
    },
    requiredAttributes: [],
    optionalAttributes: [
      { key: 'ageRange', label: 'Tranche d\'âge', type: 'object', description: 'Âge minimum et maximum' },
      { key: 'material', label: 'Matériaux', type: 'array' },
      { key: 'batteryRequired', label: 'Piles requises', type: 'boolean' },
      { key: 'batteryType', label: 'Type de piles', type: 'string' },
      { key: 'safety', label: 'Normes de sécurité', type: 'array' },
      { key: 'educational', label: 'Éducatif', type: 'boolean' },
      { key: 'numberOfPlayers', label: 'Nombre de joueurs', type: 'object' },
      { key: 'assemblyRequired', label: 'Montage requis', type: 'boolean' },
    ],
    defaultCategories: ['Jouets 0-3 ans', 'Jouets 3-6 ans', 'Jouets 6-12 ans', 'Jeux de société', 'Loisirs créatifs', 'Jeux vidéo'],
    displayOptions: {
      showSpecifications: true,
    },
    checkoutSteps: ['cart', 'shipping', 'payment', 'confirmation'],
  },

  AUTOMOTIVE: {
    type: 'AUTOMOTIVE',
    name: 'Auto & Outils',
    description: 'Pièces auto, moto et outillage',
    icon: Car,
    emoji: '🚗',
    features: {
      hasPhysicalProducts: true,
      hasDigitalProducts: false,
      hasBookings: false,
      hasSubscriptions: false,
      requiresShipping: true,
      requiresAgeVerification: false,
      allowsPreorders: true,
      hasVariants: true,
      hasTimeslots: false,
      hasCapacity: false,
    },
    requiredAttributes: [],
    optionalAttributes: [
      { key: 'vehicleType', label: 'Type de véhicule', type: 'array' },
      { key: 'brand', label: 'Marque véhicule', type: 'array' },
      { key: 'model', label: 'Modèle', type: 'array' },
      { key: 'year', label: 'Année', type: 'object' },
      { key: 'partNumber', label: 'Référence', type: 'string' },
      { key: 'oem', label: 'Pièce d\'origine', type: 'boolean' },
      { key: 'warranty', label: 'Garantie (mois)', type: 'number' },
      { key: 'compatibility', label: 'Compatibilité', type: 'array' },
    ],
    defaultCategories: ['Pièces auto', 'Pièces moto', 'Accessoires', 'Entretien', 'Outillage', 'Équipement'],
    displayOptions: {
      showSpecifications: true,
    },
    checkoutSteps: ['cart', 'shipping', 'payment', 'confirmation'],
  },

  BOOKS: {
    type: 'BOOKS',
    name: 'Livres & Papeterie',
    description: 'Livres, magazines et fournitures',
    icon: BookOpen,
    emoji: '📚',
    features: {
      hasPhysicalProducts: true,
      hasDigitalProducts: true,
      hasBookings: false,
      hasSubscriptions: true,
      requiresShipping: true,
      requiresAgeVerification: false,
      allowsPreorders: true,
      hasVariants: false,
      hasTimeslots: false,
      hasCapacity: false,
    },
    requiredAttributes: [],
    optionalAttributes: [
      { key: 'author', label: 'Auteur', type: 'string' },
      { key: 'publisher', label: 'Éditeur', type: 'string' },
      { key: 'isbn', label: 'ISBN', type: 'string' },
      { key: 'pages', label: 'Nombre de pages', type: 'number' },
      { key: 'language', label: 'Langue', type: 'string' },
      { key: 'format', label: 'Format', type: 'select' },
      { key: 'genre', label: 'Genre', type: 'array' },
      { key: 'publicationDate', label: 'Date de parution', type: 'date' },
      { key: 'edition', label: 'Édition', type: 'string' },
    ],
    variantTypes: [
      { key: 'format', label: 'Format', options: ['Broché', 'Relié', 'Poche', 'E-book', 'Audio'] },
    ],
    defaultCategories: ['Romans', 'BD & Manga', 'Jeunesse', 'Sciences', 'Art de vivre', 'Papeterie'],
    displayOptions: {
      showSpecifications: true,
    },
    checkoutSteps: ['cart', 'shipping', 'payment', 'confirmation'],
  },

  PETS: {
    type: 'PETS',
    name: 'Animalerie',
    description: 'Alimentation et accessoires pour animaux',
    icon: PawPrint,
    emoji: '🐾',
    features: {
      hasPhysicalProducts: true,
      hasDigitalProducts: false,
      hasBookings: false,
      hasSubscriptions: true,
      requiresShipping: true,
      requiresAgeVerification: false,
      allowsPreorders: true,
      hasVariants: true,
      hasTimeslots: false,
      hasCapacity: false,
    },
    requiredAttributes: [],
    optionalAttributes: [
      { key: 'petType', label: 'Type d\'animal', type: 'multiselect' },
      { key: 'breed', label: 'Race', type: 'array' },
      { key: 'ageGroup', label: 'Âge', type: 'select' },
      { key: 'size', label: 'Taille', type: 'select' },
      { key: 'ingredients', label: 'Ingrédients', type: 'array' },
      { key: 'weight', label: 'Poids (kg)', type: 'number' },
    ],
    variantTypes: [
      { key: 'weight', label: 'Poids', options: ['1kg', '3kg', '7kg', '12kg', '20kg'] },
      { key: 'flavor', label: 'Saveur' },
    ],
    defaultCategories: ['Chiens', 'Chats', 'Oiseaux', 'Rongeurs', 'Poissons', 'Accessoires'],
    displayOptions: {
      showIngredients: true,
    },
    checkoutSteps: ['cart', 'shipping', 'payment', 'confirmation'],
  },

  DIGITAL: {
    type: 'DIGITAL',
    name: 'Produits numériques',
    description: 'E-books, logiciels, cours en ligne',
    icon: Download,
    emoji: '💾',
    features: {
      hasPhysicalProducts: false,
      hasDigitalProducts: true,
      hasBookings: false,
      hasSubscriptions: true,
      requiresShipping: false,
      requiresAgeVerification: false,
      allowsPreorders: true,
      hasVariants: false,
      hasTimeslots: false,
      hasCapacity: false,
    },
    requiredAttributes: [],
    optionalAttributes: [
      { key: 'fileFormat', label: 'Format de fichier', type: 'array' },
      { key: 'fileSize', label: 'Taille (MB)', type: 'number' },
      { key: 'downloadLimit', label: 'Limite de téléchargements', type: 'number' },
      { key: 'licenseType', label: 'Type de licence', type: 'select' },
      { key: 'platform', label: 'Plateforme', type: 'array' },
      { key: 'requirements', label: 'Configuration requise', type: 'array' },
      { key: 'version', label: 'Version', type: 'string' },
      { key: 'updatePolicy', label: 'Politique de mise à jour', type: 'string' },
    ],
    defaultCategories: ['E-books', 'Logiciels', 'Formations', 'Templates', 'Musique', 'Graphisme'],
    displayOptions: {
      showSpecifications: true,
    },
    checkoutSteps: ['cart', 'email', 'payment', 'download'],
  },

  SERVICES: {
    type: 'SERVICES',
    name: 'Services & Abonnements',
    description: 'Cartes cadeaux, abonnements et services',
    icon: CalendarCheck,
    emoji: '🎫',
    features: {
      hasPhysicalProducts: false,
      hasDigitalProducts: true,
      hasBookings: true,
      hasSubscriptions: true,
      requiresShipping: false,
      requiresAgeVerification: false,
      allowsPreorders: false,
      hasVariants: true,
      hasTimeslots: true,
      hasCapacity: false,
    },
    requiredAttributes: [],
    optionalAttributes: [
      { key: 'duration', label: 'Durée (min)', type: 'number' },
      { key: 'frequency', label: 'Fréquence', type: 'select' },
      { key: 'deliveryMethod', label: 'Mode de délivrance', type: 'select' },
      { key: 'cancellationPolicy', label: 'Politique d\'annulation', type: 'string' },
      { key: 'validity', label: 'Validité (jours)', type: 'number' },
      { key: 'giftable', label: 'Offrable', type: 'boolean' },
    ],
    variantTypes: [
      { key: 'duration', label: 'Durée', options: ['1 mois', '3 mois', '6 mois', '1 an'] },
      { key: 'value', label: 'Valeur' },
    ],
    defaultCategories: ['Cartes cadeaux', 'Abonnements', 'Consultations', 'Formations', 'Maintenance'],
    displayOptions: {
      showCalendar: true,
    },
    checkoutSteps: ['cart', 'details', 'payment', 'confirmation'],
  },

  SEASONAL: {
    type: 'SEASONAL',
    name: 'Produits saisonniers',
    description: 'Noël, Halloween, rentrée et événements',
    icon: Snowflake,
    emoji: '🎄',
    features: {
      hasPhysicalProducts: true,
      hasDigitalProducts: false,
      hasBookings: false,
      hasSubscriptions: false,
      requiresShipping: true,
      requiresAgeVerification: false,
      allowsPreorders: true,
      hasVariants: true,
      hasTimeslots: false,
      hasCapacity: false,
    },
    requiredAttributes: [],
    optionalAttributes: [],
    defaultCategories: ['Noël', 'Halloween', 'Pâques', 'Saint-Valentin', 'Rentrée', 'Été'],
    displayOptions: {},
    checkoutSteps: ['cart', 'shipping', 'payment', 'confirmation'],
  },

  RESTAURANT: {
    type: 'RESTAURANT',
    name: 'Restauration',
    description: 'Restaurant, click & collect, livraison',
    icon: ChefHat,
    emoji: '🍽️',
    features: {
      hasPhysicalProducts: true,
      hasDigitalProducts: false,
      hasBookings: true,
      hasSubscriptions: false,
      requiresShipping: true,
      requiresAgeVerification: false,
      allowsPreorders: true,
      hasVariants: true,
      hasTimeslots: true,
      hasCapacity: true,
    },
    requiredAttributes: ['category', 'allergens'],
    optionalAttributes: [
      { key: 'category', label: 'Catégorie', type: 'select', description: 'Type de plat' },
      { key: 'allergens', label: 'Allergènes', type: 'array' },
      { key: 'prepTime', label: 'Temps de préparation (min)', type: 'number' },
      { key: 'spicyLevel', label: 'Niveau épicé', type: 'number' },
      { key: 'vegetarian', label: 'Végétarien', type: 'boolean' },
      { key: 'vegan', label: 'Vegan', type: 'boolean' },
      { key: 'glutenFree', label: 'Sans gluten', type: 'boolean' },
      { key: 'options', label: 'Options/Suppléments', type: 'array' },
    ],
    defaultCategories: ['Entrées', 'Plats', 'Desserts', 'Boissons', 'Formules', 'Enfants'],
    displayOptions: {
      showIngredients: true,
    },
    checkoutSteps: ['cart', 'delivery-time', 'address', 'payment', 'confirmation'],
  },

  HOTEL: {
    type: 'HOTEL',
    name: 'Hébergements',
    description: 'Hôtels, chambres d\'hôtes, locations',
    icon: Building2,
    emoji: '🏨',
    features: {
      hasPhysicalProducts: false,
      hasDigitalProducts: false,
      hasBookings: true,
      hasSubscriptions: false,
      requiresShipping: false,
      requiresAgeVerification: false,
      allowsPreorders: false,
      hasVariants: true,
      hasTimeslots: false,
      hasCapacity: true,
    },
    requiredAttributes: ['roomType', 'capacity'],
    optionalAttributes: [
      { key: 'roomType', label: 'Type de chambre', type: 'string' },
      { key: 'capacity', label: 'Capacité', type: 'number' },
      { key: 'beds', label: 'Lits', type: 'array' },
      { key: 'amenities', label: 'Équipements', type: 'array' },
      { key: 'size', label: 'Surface (m²)', type: 'number' },
      { key: 'view', label: 'Vue', type: 'string' },
      { key: 'floor', label: 'Étage', type: 'number' },
      { key: 'smokingAllowed', label: 'Fumeur autorisé', type: 'boolean' },
      { key: 'petFriendly', label: 'Animaux acceptés', type: 'boolean' },
    ],
    variantTypes: [
      { key: 'roomType', label: 'Type', options: ['Standard', 'Supérieure', 'Suite', 'Familiale'] },
      { key: 'view', label: 'Vue', options: ['Ville', 'Mer', 'Jardin', 'Piscine'] },
    ],
    defaultCategories: ['Chambres', 'Suites', 'Appartements', 'Services', 'Extras'],
    displayOptions: {
      showCalendar: true,
      showMap: true,
      showSpecifications: true,
    },
    checkoutSteps: ['dates', 'room-selection', 'guests', 'extras', 'payment', 'confirmation'],
  },

  TRAVEL: {
    type: 'TRAVEL',
    name: 'Voyages',
    description: 'Séjours, circuits et transports',
    icon: Plane,
    emoji: '✈️',
    features: {
      hasPhysicalProducts: false,
      hasDigitalProducts: false,
      hasBookings: true,
      hasSubscriptions: false,
      requiresShipping: false,
      requiresAgeVerification: false,
      allowsPreorders: false,
      hasVariants: true,
      hasTimeslots: false,
      hasCapacity: true,
    },
    requiredAttributes: ['destinations', 'duration'],
    optionalAttributes: [
      { key: 'destinations', label: 'Destinations', type: 'array' },
      { key: 'departureCity', label: 'Ville de départ', type: 'string' },
      { key: 'duration', label: 'Durée (jours)', type: 'number' },
      { key: 'inclusions', label: 'Inclus', type: 'array' },
      { key: 'exclusions', label: 'Non inclus', type: 'array' },
      { key: 'itinerary', label: 'Itinéraire', type: 'array' },
      { key: 'travelClass', label: 'Classe', type: 'select' },
      { key: 'passengerTypes', label: 'Types de passagers', type: 'array' },
    ],
    variantTypes: [
      { key: 'class', label: 'Classe', options: ['Économique', 'Premium', 'Business', 'Première'] },
      { key: 'dates', label: 'Dates de départ' },
    ],
    defaultCategories: ['Circuits', 'Séjours', 'Croisières', 'Week-ends', 'Vols', 'Transferts'],
    displayOptions: {
      showCalendar: true,
      showMap: true,
    },
    checkoutSteps: ['dates', 'passengers', 'options', 'payment', 'confirmation'],
  },

  RECREATION: {
    type: 'RECREATION',
    name: 'Loisirs & Activités',
    description: 'Spectacles, parcs, activités et expériences',
    icon: Ticket,
    emoji: '🎟️',
    features: {
      hasPhysicalProducts: false,
      hasDigitalProducts: true,
      hasBookings: true,
      hasSubscriptions: false,
      requiresShipping: false,
      requiresAgeVerification: false,
      allowsPreorders: true,
      hasVariants: true,
      hasTimeslots: true,
      hasCapacity: true,
    },
    requiredAttributes: ['activityType', 'duration'],
    optionalAttributes: [
      { key: 'activityType', label: 'Type d\'activité', type: 'string' },
      { key: 'duration', label: 'Durée (min)', type: 'number' },
      { key: 'difficulty', label: 'Difficulté', type: 'select' },
      { key: 'minAge', label: 'Âge minimum', type: 'number' },
      { key: 'maxParticipants', label: 'Participants max', type: 'number' },
      { key: 'equipment', label: 'Équipement fourni', type: 'array' },
      { key: 'location', label: 'Lieu', type: 'string' },
      { key: 'indoor', label: 'En intérieur', type: 'boolean' },
    ],
    variantTypes: [
      { key: 'date', label: 'Date' },
      { key: 'timeslot', label: 'Créneau horaire' },
      { key: 'ticketType', label: 'Type de billet', options: ['Adulte', 'Enfant', 'Senior', 'Famille'] },
    ],
    defaultCategories: ['Spectacles', 'Parcs', 'Ateliers', 'Visites', 'Sport', 'Bien-être'],
    displayOptions: {
      showCalendar: true,
      showMap: true,
    },
    checkoutSteps: ['date-time', 'participants', 'payment', 'confirmation'],
  },
}

// Helper to get commerce type config
export function getCommerceTypeConfig(type: CommerceType): CommerceTypeConfig {
  return commerceTypeConfigs[type] || commerceTypeConfigs.GENERAL
}

// Commerce type display labels
export const commerceTypeLabels: Record<CommerceType, string> = Object.fromEntries(
  Object.entries(commerceTypeConfigs).map(([key, config]) => [key, config.name])
) as Record<CommerceType, string>

// Commerce type icons (for UI)
export const commerceTypeIcons: Record<CommerceType, string> = Object.fromEntries(
  Object.entries(commerceTypeConfigs).map(([key, config]) => [key, config.emoji])
) as Record<CommerceType, string>

// Get all commerce types
export function getAllCommerceTypes(): CommerceType[] {
  return Object.keys(commerceTypeConfigs) as CommerceType[]
}

// Get commerce types by category
export function getCommerceTypesByCategory() {
  return {
    physical: ['GENERAL', 'FOOD', 'ALCOHOL', 'FASHION', 'ELECTRONICS', 'BEAUTY', 'HOME', 'SPORTS', 'TOYS', 'AUTOMOTIVE', 'BOOKS', 'PETS', 'SEASONAL'] as CommerceType[],
    digital: ['DIGITAL', 'BOOKS'] as CommerceType[],
    services: ['SERVICES', 'RESTAURANT', 'HOTEL', 'TRAVEL', 'RECREATION'] as CommerceType[],
  }
}

// Check if commerce type requires age verification
export function requiresAgeVerification(type: CommerceType): boolean {
  return commerceTypeConfigs[type]?.features.requiresAgeVerification || false
}

// Check if commerce type has booking functionality
export function hasBookingFeature(type: CommerceType): boolean {
  return commerceTypeConfigs[type]?.features.hasBookings || false
}

// Check if commerce type has digital products
export function hasDigitalProducts(type: CommerceType): boolean {
  return commerceTypeConfigs[type]?.features.hasDigitalProducts || false
}

// Check if commerce type requires shipping
export function requiresShipping(type: CommerceType): boolean {
  return commerceTypeConfigs[type]?.features.requiresShipping || false
}

// Helper to validate product attributes for a commerce type
export function validateProductAttributes(
  type: CommerceType,
  attributes: Record<string, unknown>
): { valid: boolean; errors: string[]; warnings: string[] } {
  const config = getCommerceTypeConfig(type)
  const errors: string[] = []
  const warnings: string[] = []

  // Check required attributes
  for (const required of config.requiredAttributes) {
    if (!attributes[required]) {
      errors.push(`Le champ "${required}" est requis pour ce type de commerce`)
    }
  }

  // Validate attribute types
  for (const attrDef of config.optionalAttributes) {
    const value = attributes[attrDef.key]
    if (value !== undefined && value !== null) {
      const typeError = validateAttributeType(attrDef.key, value, attrDef.type)
      if (typeError) {
        errors.push(typeError)
      }
    }
  }

  // Commerce-specific validations
  if (type === 'ALCOHOL') {
    const alcoholPercent = attributes.alcoholPercentage as number | undefined
    if (alcoholPercent !== undefined) {
      if (alcoholPercent < 0 || alcoholPercent > 100) {
        errors.push('Le degré d\'alcool doit être entre 0 et 100%')
      }
    }
    const volume = attributes.volume as number | undefined
    if (volume !== undefined && volume <= 0) {
      errors.push('Le volume doit être positif')
    }
  }

  if (type === 'ELECTRONICS') {
    const warranty = attributes.warranty as number | undefined
    if (warranty !== undefined && warranty < 0) {
      errors.push('La garantie ne peut pas être négative')
    }
    const repairIndex = attributes.repairabilityIndex as number | undefined
    if (repairIndex !== undefined && (repairIndex < 0 || repairIndex > 10)) {
      errors.push('L\'indice de réparabilité doit être entre 0 et 10')
    }
  }

  if (type === 'HOTEL' || type === 'TRAVEL' || type === 'RECREATION') {
    const capacity = attributes.capacity as number | undefined
    if (capacity !== undefined && capacity <= 0) {
      errors.push('La capacité doit être positive')
    }
  }

  if (type === 'RESTAURANT') {
    const prepTime = attributes.prepTime as number | undefined
    if (prepTime !== undefined && prepTime < 0) {
      errors.push('Le temps de préparation ne peut pas être négatif')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

// Helper to validate attribute type
function validateAttributeType(key: string, value: unknown, expectedType: string): string | null {
  switch (expectedType) {
    case 'string':
      if (typeof value !== 'string') {
        return `Le champ "${key}" doit être une chaîne de caractères`
      }
      break
    case 'number':
      if (typeof value !== 'number' || Number.isNaN(value)) {
        return `Le champ "${key}" doit être un nombre`
      }
      break
    case 'boolean':
      if (typeof value !== 'boolean') {
        return `Le champ "${key}" doit être un booléen`
      }
      break
    case 'array':
    case 'multiselect':
      if (!Array.isArray(value)) {
        return `Le champ "${key}" doit être un tableau`
      }
      break
    case 'object':
      if (typeof value !== 'object' || Array.isArray(value)) {
        return `Le champ "${key}" doit être un objet`
      }
      break
    case 'date':
      if (typeof value === 'string') {
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) {
          return `Le champ "${key}" doit être une date valide`
        }
      }
      break
    case 'select':
      if (typeof value !== 'string') {
        return `Le champ "${key}" doit être une chaîne de caractères`
      }
      break
  }
  return null
}
