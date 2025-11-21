// Commerce type definitions and configurations

export type CommerceType =
  | 'GENERAL'
  | 'FOOD'
  | 'ALCOHOL'
  | 'FASHION'
  | 'ELECTRONICS'
  | 'BEAUTY'
  | 'HOME'
  | 'SPORTS'

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
}

export interface AlcoholAttributes {
  alcoholPercentage: number
  volume: number // in ml
  region?: string
  vintage?: number
  grapeVariety?: string[]
  servingTemp?: string
  tastingNotes?: string
  pairings?: string[]
  wineType?: 'red' | 'white' | 'rose' | 'sparkling' | 'fortified'
  spiritType?: 'whisky' | 'vodka' | 'rum' | 'gin' | 'tequila' | 'cognac' | 'other'
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
}

export interface ElectronicsAttributes {
  specifications: Record<string, string>
  warranty?: number // months
  compatibility?: string[]
  powerConsumption?: number // watts
  dimensions?: { width: number; height: number; depth: number }
  weight?: number // grams
  connectivity?: string[]
  batteryLife?: number // hours
}

export interface BeautyAttributes {
  ingredients: string[]
  skinType?: ('normal' | 'dry' | 'oily' | 'combination' | 'sensitive')[]
  usage?: string
  volume?: number // ml
  certifications?: ('cruelty-free' | 'vegan' | 'organic' | 'dermatologist-tested')[]
  scent?: string
  concerns?: ('aging' | 'acne' | 'hydration' | 'brightening' | 'pores')[]
}

export interface HomeAttributes {
  dimensions: { width: number; height: number; depth: number }
  weight?: number // kg
  material: string[]
  assembly?: 'none' | 'minimal' | 'full'
  roomType?: ('living' | 'bedroom' | 'kitchen' | 'bathroom' | 'office' | 'outdoor')[]
  style?: string
  color?: string
  maxLoad?: number // kg
}

export interface SportsAttributes {
  sport: string[]
  level?: 'beginner' | 'intermediate' | 'advanced' | 'professional'
  material?: string[]
  size?: string
  gender?: 'men' | 'women' | 'unisex' | 'kids'
  weight?: number // grams
  features?: string[]
}

export type ProductAttributes =
  | FoodAttributes
  | AlcoholAttributes
  | FashionAttributes
  | ElectronicsAttributes
  | BeautyAttributes
  | HomeAttributes
  | SportsAttributes
  | Record<string, unknown>

// Commerce type configuration for stores
export interface CommerceTypeConfig {
  // Required fields for product creation
  requiredAttributes: string[]
  // Optional attributes with descriptions
  optionalAttributes: { key: string; label: string; type: string; description?: string }[]
  // Age verification required
  ageVerification?: boolean
  minAge?: number
  // Special regulations
  regulations?: string[]
  // Default categories
  defaultCategories: string[]
  // Display options
  displayOptions: {
    showNutritionalInfo?: boolean
    showAlcoholContent?: boolean
    showSizeChart?: boolean
    showSpecifications?: boolean
    showIngredients?: boolean
  }
}

// Commerce type configurations
export const commerceTypeConfigs: Record<CommerceType, CommerceTypeConfig> = {
  GENERAL: {
    requiredAttributes: [],
    optionalAttributes: [],
    defaultCategories: ['Produits', 'Nouveautés', 'Promotions'],
    displayOptions: {}
  },

  FOOD: {
    requiredAttributes: [],
    optionalAttributes: [
      { key: 'ingredients', label: 'Ingrédients', type: 'array', description: 'Liste des ingrédients' },
      { key: 'allergens', label: 'Allergènes', type: 'array', description: 'Liste des allergènes (gluten, lactose, etc.)' },
      { key: 'nutritionalInfo', label: 'Info nutritionnelle', type: 'object', description: 'Valeurs nutritionnelles pour 100g' },
      { key: 'expiryDate', label: 'Date de péremption', type: 'date' },
      { key: 'storageInstructions', label: 'Conservation', type: 'string' },
      { key: 'organic', label: 'Bio', type: 'boolean' },
      { key: 'vegan', label: 'Vegan', type: 'boolean' },
      { key: 'glutenFree', label: 'Sans gluten', type: 'boolean' }
    ],
    defaultCategories: ['Entrées', 'Plats', 'Desserts', 'Boissons', 'Épicerie'],
    displayOptions: {
      showNutritionalInfo: true,
      showIngredients: true
    }
  },

  ALCOHOL: {
    requiredAttributes: ['alcoholPercentage', 'volume'],
    optionalAttributes: [
      { key: 'alcoholPercentage', label: 'Degré d\'alcool', type: 'number', description: 'Pourcentage d\'alcool' },
      { key: 'volume', label: 'Volume (ml)', type: 'number' },
      { key: 'region', label: 'Région', type: 'string', description: 'Région de production' },
      { key: 'vintage', label: 'Millésime', type: 'number' },
      { key: 'grapeVariety', label: 'Cépage', type: 'array' },
      { key: 'servingTemp', label: 'Température de service', type: 'string' },
      { key: 'tastingNotes', label: 'Notes de dégustation', type: 'string' },
      { key: 'pairings', label: 'Accords mets', type: 'array' }
    ],
    ageVerification: true,
    minAge: 18,
    regulations: ['Vente interdite aux mineurs', 'L\'abus d\'alcool est dangereux pour la santé'],
    defaultCategories: ['Vins rouges', 'Vins blancs', 'Champagnes', 'Spiritueux', 'Bières'],
    displayOptions: {
      showAlcoholContent: true
    }
  },

  FASHION: {
    requiredAttributes: ['material'],
    optionalAttributes: [
      { key: 'material', label: 'Matière', type: 'array', description: 'Composition du produit' },
      { key: 'careInstructions', label: 'Entretien', type: 'array' },
      { key: 'fit', label: 'Coupe', type: 'select', description: 'slim, regular, loose, oversized' },
      { key: 'season', label: 'Saison', type: 'multiselect' },
      { key: 'gender', label: 'Genre', type: 'select' },
      { key: 'sizeChart', label: 'Guide des tailles', type: 'object' },
      { key: 'color', label: 'Couleur', type: 'string' },
      { key: 'pattern', label: 'Motif', type: 'string' }
    ],
    defaultCategories: ['Homme', 'Femme', 'Enfant', 'Accessoires', 'Chaussures'],
    displayOptions: {
      showSizeChart: true
    }
  },

  ELECTRONICS: {
    requiredAttributes: ['specifications'],
    optionalAttributes: [
      { key: 'specifications', label: 'Caractéristiques', type: 'object', description: 'Spécifications techniques' },
      { key: 'warranty', label: 'Garantie (mois)', type: 'number' },
      { key: 'compatibility', label: 'Compatibilité', type: 'array' },
      { key: 'powerConsumption', label: 'Consommation (W)', type: 'number' },
      { key: 'dimensions', label: 'Dimensions', type: 'object' },
      { key: 'weight', label: 'Poids (g)', type: 'number' },
      { key: 'connectivity', label: 'Connectivité', type: 'array' },
      { key: 'batteryLife', label: 'Autonomie (h)', type: 'number' }
    ],
    defaultCategories: ['Smartphones', 'Ordinateurs', 'Audio', 'Photo/Vidéo', 'Accessoires'],
    displayOptions: {
      showSpecifications: true
    }
  },

  BEAUTY: {
    requiredAttributes: ['ingredients'],
    optionalAttributes: [
      { key: 'ingredients', label: 'Ingrédients', type: 'array', description: 'Liste INCI' },
      { key: 'skinType', label: 'Type de peau', type: 'multiselect' },
      { key: 'usage', label: 'Utilisation', type: 'string' },
      { key: 'volume', label: 'Contenance (ml)', type: 'number' },
      { key: 'certifications', label: 'Certifications', type: 'multiselect' },
      { key: 'scent', label: 'Parfum', type: 'string' },
      { key: 'concerns', label: 'Problématiques', type: 'multiselect' }
    ],
    defaultCategories: ['Visage', 'Corps', 'Cheveux', 'Maquillage', 'Parfums'],
    displayOptions: {
      showIngredients: true
    }
  },

  HOME: {
    requiredAttributes: ['dimensions', 'material'],
    optionalAttributes: [
      { key: 'dimensions', label: 'Dimensions', type: 'object', description: 'L x l x H en cm' },
      { key: 'weight', label: 'Poids (kg)', type: 'number' },
      { key: 'material', label: 'Matériaux', type: 'array' },
      { key: 'assembly', label: 'Montage', type: 'select' },
      { key: 'roomType', label: 'Pièce', type: 'multiselect' },
      { key: 'style', label: 'Style', type: 'string' },
      { key: 'color', label: 'Couleur', type: 'string' },
      { key: 'maxLoad', label: 'Charge max (kg)', type: 'number' }
    ],
    defaultCategories: ['Salon', 'Chambre', 'Cuisine', 'Salle de bain', 'Décoration'],
    displayOptions: {
      showSpecifications: true
    }
  },

  SPORTS: {
    requiredAttributes: ['sport'],
    optionalAttributes: [
      { key: 'sport', label: 'Sport', type: 'array' },
      { key: 'level', label: 'Niveau', type: 'select' },
      { key: 'material', label: 'Matière', type: 'array' },
      { key: 'size', label: 'Taille', type: 'string' },
      { key: 'gender', label: 'Genre', type: 'select' },
      { key: 'weight', label: 'Poids (g)', type: 'number' },
      { key: 'features', label: 'Caractéristiques', type: 'array' }
    ],
    defaultCategories: ['Running', 'Fitness', 'Sports collectifs', 'Natation', 'Randonnée'],
    displayOptions: {
      showSpecifications: true
    }
  }
}

// Helper to get commerce type config
export function getCommerceTypeConfig(type: CommerceType): CommerceTypeConfig {
  return commerceTypeConfigs[type] || commerceTypeConfigs.GENERAL
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
    const power = attributes.powerConsumption as number | undefined
    if (power !== undefined && power < 0) {
      errors.push('La consommation ne peut pas être négative')
    }
  }

  if (type === 'HOME') {
    const dimensions = attributes.dimensions as { width?: number; height?: number; depth?: number } | undefined
    if (dimensions) {
      if (dimensions.width !== undefined && dimensions.width <= 0) {
        errors.push('La largeur doit être positive')
      }
      if (dimensions.height !== undefined && dimensions.height <= 0) {
        errors.push('La hauteur doit être positive')
      }
      if (dimensions.depth !== undefined && dimensions.depth <= 0) {
        errors.push('La profondeur doit être positive')
      }
    }
  }

  if (type === 'FOOD') {
    const nutritionalInfo = attributes.nutritionalInfo as {
      calories?: number
      protein?: number
      carbs?: number
      fat?: number
    } | undefined
    if (nutritionalInfo) {
      if (nutritionalInfo.calories !== undefined && nutritionalInfo.calories < 0) {
        errors.push('Les calories ne peuvent pas être négatives')
      }
      if (nutritionalInfo.protein !== undefined && nutritionalInfo.protein < 0) {
        errors.push('Les protéines ne peuvent pas être négatives')
      }
      if (nutritionalInfo.carbs !== undefined && nutritionalInfo.carbs < 0) {
        errors.push('Les glucides ne peuvent pas être négatifs')
      }
      if (nutritionalInfo.fat !== undefined && nutritionalInfo.fat < 0) {
        errors.push('Les lipides ne peuvent pas être négatifs')
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
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

// Commerce type display labels
export const commerceTypeLabels: Record<CommerceType, string> = {
  GENERAL: 'Général',
  FOOD: 'Alimentation',
  ALCOHOL: 'Vins & Spiritueux',
  FASHION: 'Mode',
  ELECTRONICS: 'Électronique',
  BEAUTY: 'Beauté',
  HOME: 'Maison',
  SPORTS: 'Sports'
}

// Commerce type icons (for UI)
export const commerceTypeIcons: Record<CommerceType, string> = {
  GENERAL: '🛒',
  FOOD: '🍽️',
  ALCOHOL: '🍷',
  FASHION: '👗',
  ELECTRONICS: '📱',
  BEAUTY: '💄',
  HOME: '🏠',
  SPORTS: '⚽'
}
