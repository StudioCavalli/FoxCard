/**
 * Product Variant Configuration System
 * Defines variant types and options for each commerce type
 */

import { CommerceType } from '@/lib/commerce-types'

export interface VariantOption {
  value: string
  label: string
  priceModifier?: number
  stockOverride?: number
  color?: string // For color swatches
  image?: string // For visual options
}

export interface VariantTypeConfig {
  type: string
  name: string
  inputType: 'select' | 'color' | 'size' | 'custom'
  options: VariantOption[]
  allowCustom?: boolean
  required?: boolean
}

export interface CommerceVariantConfig {
  commerceType: CommerceType
  variantTypes: VariantTypeConfig[]
  maxVariantCombinations?: number
}

// Fashion variants
const fashionVariants: VariantTypeConfig[] = [
  {
    type: 'size',
    name: 'Taille',
    inputType: 'size',
    options: [
      { value: 'XS', label: 'XS' },
      { value: 'S', label: 'S' },
      { value: 'M', label: 'M' },
      { value: 'L', label: 'L' },
      { value: 'XL', label: 'XL' },
      { value: 'XXL', label: 'XXL' },
    ],
    allowCustom: true,
  },
  {
    type: 'color',
    name: 'Couleur',
    inputType: 'color',
    options: [
      { value: 'black', label: 'Noir', color: '#000000' },
      { value: 'white', label: 'Blanc', color: '#FFFFFF' },
      { value: 'gray', label: 'Gris', color: '#808080' },
      { value: 'navy', label: 'Marine', color: '#000080' },
      { value: 'red', label: 'Rouge', color: '#FF0000' },
      { value: 'blue', label: 'Bleu', color: '#0000FF' },
      { value: 'green', label: 'Vert', color: '#008000' },
      { value: 'beige', label: 'Beige', color: '#F5F5DC' },
      { value: 'pink', label: 'Rose', color: '#FFC0CB' },
      { value: 'brown', label: 'Marron', color: '#8B4513' },
    ],
    allowCustom: true,
  },
  {
    type: 'material',
    name: 'Matière',
    inputType: 'select',
    options: [
      { value: 'cotton', label: 'Coton' },
      { value: 'polyester', label: 'Polyester' },
      { value: 'wool', label: 'Laine' },
      { value: 'silk', label: 'Soie' },
      { value: 'linen', label: 'Lin' },
      { value: 'leather', label: 'Cuir' },
      { value: 'denim', label: 'Denim' },
    ],
    allowCustom: true,
  },
]

// Electronics variants
const electronicsVariants: VariantTypeConfig[] = [
  {
    type: 'storage',
    name: 'Capacité',
    inputType: 'select',
    options: [
      { value: '64GB', label: '64 GB', priceModifier: 0 },
      { value: '128GB', label: '128 GB', priceModifier: 100 },
      { value: '256GB', label: '256 GB', priceModifier: 200 },
      { value: '512GB', label: '512 GB', priceModifier: 400 },
      { value: '1TB', label: '1 TB', priceModifier: 600 },
    ],
    allowCustom: true,
  },
  {
    type: 'color',
    name: 'Couleur',
    inputType: 'color',
    options: [
      { value: 'black', label: 'Noir', color: '#1A1A1A' },
      { value: 'white', label: 'Blanc', color: '#FAFAFA' },
      { value: 'silver', label: 'Argent', color: '#C0C0C0' },
      { value: 'gold', label: 'Or', color: '#FFD700' },
      { value: 'blue', label: 'Bleu', color: '#0066CC' },
      { value: 'red', label: 'Rouge', color: '#CC0000' },
    ],
    allowCustom: true,
  },
  {
    type: 'version',
    name: 'Version',
    inputType: 'select',
    options: [
      { value: 'wifi', label: 'WiFi', priceModifier: 0 },
      { value: 'cellular', label: 'WiFi + Cellular', priceModifier: 150 },
    ],
    allowCustom: true,
  },
  {
    type: 'ram',
    name: 'RAM',
    inputType: 'select',
    options: [
      { value: '8GB', label: '8 GB', priceModifier: 0 },
      { value: '16GB', label: '16 GB', priceModifier: 200 },
      { value: '32GB', label: '32 GB', priceModifier: 500 },
      { value: '64GB', label: '64 GB', priceModifier: 900 },
    ],
    allowCustom: true,
  },
]

// Food variants
const foodVariants: VariantTypeConfig[] = [
  {
    type: 'weight',
    name: 'Poids',
    inputType: 'select',
    options: [
      { value: '100g', label: '100g', priceModifier: 0 },
      { value: '250g', label: '250g', priceModifier: 0 },
      { value: '500g', label: '500g', priceModifier: 0 },
      { value: '1kg', label: '1 kg', priceModifier: 0 },
      { value: '2kg', label: '2 kg', priceModifier: 0 },
    ],
    allowCustom: true,
  },
  {
    type: 'format',
    name: 'Format',
    inputType: 'select',
    options: [
      { value: 'fresh', label: 'Frais' },
      { value: 'frozen', label: 'Surgelé' },
      { value: 'canned', label: 'En conserve' },
      { value: 'dried', label: 'Séché' },
    ],
    allowCustom: true,
  },
  {
    type: 'packaging',
    name: 'Conditionnement',
    inputType: 'select',
    options: [
      { value: 'unit', label: 'À l\'unité' },
      { value: 'pack3', label: 'Lot de 3' },
      { value: 'pack6', label: 'Lot de 6' },
      { value: 'bulk', label: 'En vrac' },
    ],
    allowCustom: true,
  },
]

// Alcohol variants
const alcoholVariants: VariantTypeConfig[] = [
  {
    type: 'volume',
    name: 'Volume',
    inputType: 'select',
    options: [
      { value: '200ml', label: '20 cl' },
      { value: '375ml', label: '37.5 cl (demi)' },
      { value: '750ml', label: '75 cl' },
      { value: '1000ml', label: '1 L' },
      { value: '1500ml', label: '1.5 L (Magnum)' },
      { value: '3000ml', label: '3 L (Jeroboam)' },
    ],
    allowCustom: true,
  },
  {
    type: 'packaging',
    name: 'Conditionnement',
    inputType: 'select',
    options: [
      { value: 'single', label: 'Bouteille seule' },
      { value: 'gift', label: 'Coffret cadeau' },
      { value: 'case6', label: 'Caisse de 6' },
      { value: 'case12', label: 'Carton de 12' },
    ],
    allowCustom: true,
  },
]

// Hotel variants
const hotelVariants: VariantTypeConfig[] = [
  {
    type: 'roomType',
    name: 'Type de chambre',
    inputType: 'select',
    options: [
      { value: 'single', label: 'Chambre Simple', priceModifier: 0 },
      { value: 'double', label: 'Chambre Double', priceModifier: 30 },
      { value: 'twin', label: 'Chambre Twin', priceModifier: 30 },
      { value: 'suite', label: 'Suite', priceModifier: 150 },
      { value: 'family', label: 'Familiale', priceModifier: 80 },
    ],
    required: true,
  },
  {
    type: 'view',
    name: 'Vue',
    inputType: 'select',
    options: [
      { value: 'standard', label: 'Standard', priceModifier: 0 },
      { value: 'garden', label: 'Jardin', priceModifier: 20 },
      { value: 'pool', label: 'Piscine', priceModifier: 30 },
      { value: 'sea', label: 'Mer', priceModifier: 50 },
      { value: 'city', label: 'Ville', priceModifier: 25 },
    ],
  },
  {
    type: 'board',
    name: 'Pension',
    inputType: 'select',
    options: [
      { value: 'room_only', label: 'Chambre seule', priceModifier: 0 },
      { value: 'breakfast', label: 'Petit-déjeuner inclus', priceModifier: 15 },
      { value: 'half_board', label: 'Demi-pension', priceModifier: 40 },
      { value: 'full_board', label: 'Pension complète', priceModifier: 70 },
      { value: 'all_inclusive', label: 'All Inclusive', priceModifier: 100 },
    ],
    required: true,
  },
]

// Travel variants
const travelVariants: VariantTypeConfig[] = [
  {
    type: 'class',
    name: 'Classe',
    inputType: 'select',
    options: [
      { value: 'economy', label: 'Économique', priceModifier: 0 },
      { value: 'premium_economy', label: 'Premium Économique', priceModifier: 200 },
      { value: 'business', label: 'Business', priceModifier: 800 },
      { value: 'first', label: 'Première', priceModifier: 2000 },
    ],
    required: true,
  },
  {
    type: 'flexibility',
    name: 'Flexibilité',
    inputType: 'select',
    options: [
      { value: 'non_refundable', label: 'Non remboursable', priceModifier: 0 },
      { value: 'flexible', label: 'Flexible', priceModifier: 50 },
      { value: 'full_flex', label: 'Full Flex', priceModifier: 150 },
    ],
  },
  {
    type: 'luggage',
    name: 'Bagages',
    inputType: 'select',
    options: [
      { value: 'carry_on', label: 'Bagage cabine', priceModifier: 0 },
      { value: '1_bag', label: '1 bagage soute', priceModifier: 30 },
      { value: '2_bags', label: '2 bagages soute', priceModifier: 50 },
    ],
  },
]

// Restaurant variants
const restaurantVariants: VariantTypeConfig[] = [
  {
    type: 'portion',
    name: 'Portion',
    inputType: 'select',
    options: [
      { value: 'small', label: 'Petite', priceModifier: -2 },
      { value: 'regular', label: 'Normale', priceModifier: 0 },
      { value: 'large', label: 'Grande', priceModifier: 3 },
    ],
  },
  {
    type: 'customization',
    name: 'Personnalisation',
    inputType: 'select',
    options: [
      { value: 'standard', label: 'Standard' },
      { value: 'extra_sauce', label: 'Extra sauce', priceModifier: 1 },
      { value: 'no_sauce', label: 'Sans sauce' },
      { value: 'spicy', label: 'Extra pimenté' },
    ],
    allowCustom: true,
  },
]

// Services variants
const servicesVariants: VariantTypeConfig[] = [
  {
    type: 'duration',
    name: 'Durée',
    inputType: 'select',
    options: [
      { value: '30min', label: '30 minutes', priceModifier: 0 },
      { value: '1h', label: '1 heure', priceModifier: 0 },
      { value: '2h', label: '2 heures', priceModifier: 0 },
      { value: 'half_day', label: 'Demi-journée', priceModifier: 0 },
      { value: 'full_day', label: 'Journée', priceModifier: 0 },
    ],
    allowCustom: true,
    required: true,
  },
  {
    type: 'level',
    name: 'Niveau',
    inputType: 'select',
    options: [
      { value: 'basic', label: 'Basique', priceModifier: 0 },
      { value: 'standard', label: 'Standard', priceModifier: 50 },
      { value: 'premium', label: 'Premium', priceModifier: 150 },
    ],
  },
]

// Beauty variants
const beautyVariants: VariantTypeConfig[] = [
  {
    type: 'size',
    name: 'Contenance',
    inputType: 'select',
    options: [
      { value: '30ml', label: '30 ml', priceModifier: 0 },
      { value: '50ml', label: '50 ml', priceModifier: 0 },
      { value: '75ml', label: '75 ml', priceModifier: 0 },
      { value: '100ml', label: '100 ml', priceModifier: 0 },
      { value: '200ml', label: '200 ml', priceModifier: 0 },
    ],
    allowCustom: true,
  },
  {
    type: 'shade',
    name: 'Teinte',
    inputType: 'color',
    options: [
      { value: 'light', label: 'Claire', color: '#FFE4C4' },
      { value: 'medium', label: 'Medium', color: '#DEB887' },
      { value: 'tan', label: 'Bronzée', color: '#D2B48C' },
      { value: 'deep', label: 'Foncée', color: '#8B4513' },
    ],
    allowCustom: true,
  },
]

// Recreation variants
const recreationVariants: VariantTypeConfig[] = [
  {
    type: 'duration',
    name: 'Durée',
    inputType: 'select',
    options: [
      { value: '1h', label: '1 heure' },
      { value: '2h', label: '2 heures' },
      { value: 'half_day', label: 'Demi-journée' },
      { value: 'full_day', label: 'Journée complète' },
    ],
    required: true,
  },
  {
    type: 'group_size',
    name: 'Nombre de participants',
    inputType: 'select',
    options: [
      { value: '1', label: '1 personne' },
      { value: '2', label: '2 personnes', priceModifier: 0 },
      { value: '3-5', label: '3-5 personnes', priceModifier: -5 },
      { value: '6-10', label: '6-10 personnes', priceModifier: -10 },
    ],
    allowCustom: true,
  },
  {
    type: 'equipment',
    name: 'Équipement',
    inputType: 'select',
    options: [
      { value: 'basic', label: 'Basique inclus', priceModifier: 0 },
      { value: 'premium', label: 'Premium', priceModifier: 20 },
      { value: 'own', label: 'Équipement personnel', priceModifier: -10 },
    ],
  },
]

// Generic variants for general commerce
const generalVariants: VariantTypeConfig[] = [
  {
    type: 'option1',
    name: 'Option 1',
    inputType: 'custom',
    options: [],
    allowCustom: true,
  },
  {
    type: 'option2',
    name: 'Option 2',
    inputType: 'custom',
    options: [],
    allowCustom: true,
  },
]

/**
 * Get variant configuration for a commerce type
 */
export function getVariantConfigForCommerceType(commerceType: CommerceType): CommerceVariantConfig {
  const configs: Record<CommerceType, VariantTypeConfig[]> = {
    GENERAL: generalVariants,
    FASHION: fashionVariants,
    ELECTRONICS: electronicsVariants,
    FOOD: foodVariants,
    ALCOHOL: alcoholVariants,
    DIGITAL: [], // Digital products don't have variants
    SERVICES: servicesVariants,
    HOTEL: hotelVariants,
    TRAVEL: travelVariants,
    RESTAURANT: restaurantVariants,
    RECREATION: recreationVariants,
    BEAUTY: beautyVariants,
    HOME: generalVariants,
    SPORTS: fashionVariants, // Similar to fashion (sizes, colors)
    TOYS: generalVariants,
    AUTOMOTIVE: generalVariants,
    BOOKS: [], // Books usually don't have variants
    PETS: foodVariants, // Similar to food (weight, packaging)
    SEASONAL: generalVariants,
  }

  return {
    commerceType,
    variantTypes: configs[commerceType] || generalVariants,
    maxVariantCombinations: commerceType === 'DIGITAL' || commerceType === 'BOOKS' ? 0 : 100,
  }
}

/**
 * Generate all variant combinations from selected options
 */
export function generateVariantCombinations(
  selectedOptions: Record<string, string[]>,
  basePrice: number
): Array<{
  name: string
  options: Record<string, string>
  price: number
}> {
  const optionKeys = Object.keys(selectedOptions).filter(
    (key) => selectedOptions[key].length > 0
  )

  if (optionKeys.length === 0) {
    return []
  }

  // Generate all combinations
  function cartesianProduct(arrays: string[][]): string[][] {
    return arrays.reduce<string[][]>(
      (acc, curr) =>
        acc.flatMap((a) => curr.map((c) => [...a, c])),
      [[]]
    )
  }

  const optionArrays = optionKeys.map((key) => selectedOptions[key])
  const combinations = cartesianProduct(optionArrays)

  return combinations.map((combo) => {
    const options: Record<string, string> = {}
    optionKeys.forEach((key, index) => {
      options[key] = combo[index]
    })

    // Generate name from options
    const name = combo.join(' / ')

    return {
      name,
      options,
      price: basePrice, // Price modifiers can be applied later
    }
  })
}

/**
 * Calculate price with variant modifiers
 */
export function calculateVariantPrice(
  basePrice: number,
  selectedOptions: Record<string, string>,
  variantConfig: CommerceVariantConfig
): number {
  let price = basePrice

  for (const [type, value] of Object.entries(selectedOptions)) {
    const typeConfig = variantConfig.variantTypes.find((vt) => vt.type === type)
    if (typeConfig) {
      const option = typeConfig.options.find((o) => o.value === value)
      if (option?.priceModifier) {
        price += option.priceModifier
      }
    }
  }

  return Math.max(0, price)
}
