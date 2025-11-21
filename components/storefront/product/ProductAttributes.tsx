'use client'

import type { CommerceType } from '@/lib/commerce-types'

interface ProductAttributesProps {
  commerceType: CommerceType
  attributes: Record<string, any>
}

export default function ProductAttributes({
  commerceType,
  attributes
}: ProductAttributesProps) {
  if (!attributes || Object.keys(attributes).length === 0) {
    return null
  }

  switch (commerceType) {
    case 'FOOD':
      return <FoodAttributes attributes={attributes} />
    case 'ALCOHOL':
      return <AlcoholAttributes attributes={attributes} />
    case 'FASHION':
      return <FashionAttributes attributes={attributes} />
    case 'ELECTRONICS':
      return <ElectronicsAttributes attributes={attributes} />
    case 'BEAUTY':
      return <BeautyAttributes attributes={attributes} />
    case 'HOME':
      return <HomeAttributes attributes={attributes} />
    case 'SPORTS':
      return <SportsAttributes attributes={attributes} />
    default:
      return null
  }
}

// Food attributes display
function FoodAttributes({ attributes }: { attributes: Record<string, any> }) {
  return (
    <div className="space-y-4">
      {/* Nutritional Info */}
      {attributes.nutritionalInfo && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Valeurs nutritionnelles (pour 100g)</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {Object.entries(attributes.nutritionalInfo as Record<string, number>).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600 capitalize">{translateNutrient(key)}</span>
                <span className="font-medium">{value}{getNutrientUnit(key)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ingredients */}
      {attributes.ingredients && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Ingrédients</h4>
          <p className="text-sm text-gray-600">
            {(attributes.ingredients as string[]).join(', ')}
          </p>
        </div>
      )}

      {/* Allergens */}
      {attributes.allergens && (attributes.allergens as string[]).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
          <h4 className="font-semibold text-amber-800 mb-1">⚠️ Allergènes</h4>
          <p className="text-sm text-amber-700">
            {(attributes.allergens as string[]).join(', ')}
          </p>
        </div>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {attributes.organic && (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">🌱 Bio</span>
        )}
        {attributes.vegan && (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">🥬 Vegan</span>
        )}
        {attributes.glutenFree && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">🌾 Sans gluten</span>
        )}
      </div>

      {/* Storage */}
      {attributes.storageInstructions && (
        <p className="text-sm text-gray-600">
          <span className="font-medium">Conservation :</span> {attributes.storageInstructions as string}
        </p>
      )}
    </div>
  )
}

// Alcohol attributes display
function AlcoholAttributes({ attributes }: { attributes: Record<string, any> }) {
  return (
    <div className="space-y-4">
      {/* Main info */}
      <div className="grid grid-cols-2 gap-4">
        {attributes.alcoholPercentage && (
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <span className="text-2xl font-bold text-purple-900">{attributes.alcoholPercentage}°</span>
            <p className="text-xs text-purple-600">Alcool</p>
          </div>
        )}
        {attributes.volume && (
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <span className="text-2xl font-bold text-gray-900">{attributes.volume}ml</span>
            <p className="text-xs text-gray-600">Contenance</p>
          </div>
        )}
      </div>

      {/* Wine details */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {attributes.region && (
          <div>
            <span className="text-gray-500">Région</span>
            <p className="font-medium">{attributes.region as string}</p>
          </div>
        )}
        {attributes.vintage && (
          <div>
            <span className="text-gray-500">Millésime</span>
            <p className="font-medium">{attributes.vintage as number}</p>
          </div>
        )}
        {attributes.grapeVariety && (
          <div className="col-span-2">
            <span className="text-gray-500">Cépage</span>
            <p className="font-medium">{(attributes.grapeVariety as string[]).join(', ')}</p>
          </div>
        )}
      </div>

      {/* Tasting notes */}
      {attributes.tastingNotes && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Notes de dégustation</h4>
          <p className="text-sm text-gray-600 italic">{attributes.tastingNotes as string}</p>
        </div>
      )}

      {/* Pairings */}
      {attributes.pairings && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Accords mets</h4>
          <div className="flex flex-wrap gap-1">
            {(attributes.pairings as string[]).map((pairing, i) => (
              <span key={i} className="px-2 py-1 bg-amber-50 text-amber-800 text-xs rounded">
                {pairing}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Serving temperature */}
      {attributes.servingTemp && (
        <p className="text-sm text-gray-600">
          🌡️ <span className="font-medium">Servir à :</span> {attributes.servingTemp as string}
        </p>
      )}
    </div>
  )
}

// Fashion attributes display
function FashionAttributes({ attributes }: { attributes: Record<string, any> }) {
  return (
    <div className="space-y-4">
      {/* Materials */}
      {attributes.material && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Composition</h4>
          <p className="text-sm text-gray-600">
            {(attributes.material as string[]).join(', ')}
          </p>
        </div>
      )}

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {attributes.fit && (
          <div>
            <span className="text-gray-500">Coupe</span>
            <p className="font-medium capitalize">{attributes.fit as string}</p>
          </div>
        )}
        {attributes.color && (
          <div>
            <span className="text-gray-500">Couleur</span>
            <p className="font-medium">{attributes.color as string}</p>
          </div>
        )}
        {attributes.pattern && (
          <div>
            <span className="text-gray-500">Motif</span>
            <p className="font-medium">{attributes.pattern as string}</p>
          </div>
        )}
      </div>

      {/* Care instructions */}
      {attributes.careInstructions && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Entretien</h4>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            {(attributes.careInstructions as string[]).map((instruction, i) => (
              <li key={i}>{instruction}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Season badges */}
      {attributes.season && (
        <div className="flex flex-wrap gap-1">
          {(attributes.season as string[]).map((s) => (
            <span key={s} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded capitalize">
              {translateSeason(s)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// Electronics attributes display
function ElectronicsAttributes({ attributes }: { attributes: Record<string, any> }) {
  return (
    <div className="space-y-4">
      {/* Specifications table */}
      {attributes.specifications && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Caractéristiques techniques</h4>
          <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
            {Object.entries(attributes.specifications as Record<string, string>).map(([key, value]) => (
              <div key={key} className="flex justify-between py-2 px-3 text-sm">
                <span className="text-gray-600">{key}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {attributes.warranty && (
          <div className="text-center p-2 bg-green-50 rounded">
            <p className="text-lg font-bold text-green-700">{attributes.warranty as number}</p>
            <p className="text-xs text-green-600">mois garantie</p>
          </div>
        )}
        {attributes.batteryLife && (
          <div className="text-center p-2 bg-blue-50 rounded">
            <p className="text-lg font-bold text-blue-700">{attributes.batteryLife as number}h</p>
            <p className="text-xs text-blue-600">autonomie</p>
          </div>
        )}
        {attributes.weight && (
          <div className="text-center p-2 bg-gray-50 rounded">
            <p className="text-lg font-bold text-gray-700">{attributes.weight as number}g</p>
            <p className="text-xs text-gray-600">poids</p>
          </div>
        )}
      </div>

      {/* Connectivity */}
      {attributes.connectivity && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Connectivité</h4>
          <div className="flex flex-wrap gap-1">
            {(attributes.connectivity as string[]).map((conn, i) => (
              <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                {conn}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Beauty attributes display
function BeautyAttributes({ attributes }: { attributes: Record<string, any> }) {
  return (
    <div className="space-y-4">
      {/* Certifications badges */}
      {attributes.certifications && (
        <div className="flex flex-wrap gap-2">
          {(attributes.certifications as string[]).map((cert) => (
            <span key={cert} className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded">
              {translateCertification(cert)}
            </span>
          ))}
        </div>
      )}

      {/* Skin type */}
      {attributes.skinType && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Type de peau</h4>
          <div className="flex flex-wrap gap-1">
            {(attributes.skinType as string[]).map((type) => (
              <span key={type} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                {translateSkinType(type)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Concerns */}
      {attributes.concerns && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Problématiques ciblées</h4>
          <div className="flex flex-wrap gap-1">
            {(attributes.concerns as string[]).map((concern) => (
              <span key={concern} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                {translateConcern(concern)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Usage */}
      {attributes.usage && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Mode d'emploi</h4>
          <p className="text-sm text-gray-600">{attributes.usage as string}</p>
        </div>
      )}

      {/* Ingredients */}
      {attributes.ingredients && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Ingrédients (INCI)</h4>
          <p className="text-xs text-gray-500">
            {(attributes.ingredients as string[]).join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}

// Home attributes display
function HomeAttributes({ attributes }: { attributes: Record<string, any> }) {
  return (
    <div className="space-y-4">
      {/* Dimensions */}
      {attributes.dimensions && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Dimensions</h4>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center">
              <p className="font-bold">{(attributes.dimensions as any).width}cm</p>
              <p className="text-xs text-gray-500">Largeur</p>
            </div>
            <div className="text-center">
              <p className="font-bold">{(attributes.dimensions as any).height}cm</p>
              <p className="text-xs text-gray-500">Hauteur</p>
            </div>
            <div className="text-center">
              <p className="font-bold">{(attributes.dimensions as any).depth}cm</p>
              <p className="text-xs text-gray-500">Profondeur</p>
            </div>
          </div>
        </div>
      )}

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {attributes.material && (
          <div>
            <span className="text-gray-500">Matériaux</span>
            <p className="font-medium">{(attributes.material as string[]).join(', ')}</p>
          </div>
        )}
        {attributes.weight && (
          <div>
            <span className="text-gray-500">Poids</span>
            <p className="font-medium">{attributes.weight as number} kg</p>
          </div>
        )}
        {attributes.assembly && (
          <div>
            <span className="text-gray-500">Montage</span>
            <p className="font-medium">{translateAssembly(attributes.assembly as string)}</p>
          </div>
        )}
        {attributes.maxLoad && (
          <div>
            <span className="text-gray-500">Charge max</span>
            <p className="font-medium">{attributes.maxLoad as number} kg</p>
          </div>
        )}
      </div>

      {/* Room type */}
      {attributes.roomType && (
        <div className="flex flex-wrap gap-1">
          {(attributes.roomType as string[]).map((room) => (
            <span key={room} className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded">
              {translateRoom(room)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// Sports attributes display
function SportsAttributes({ attributes }: { attributes: Record<string, any> }) {
  return (
    <div className="space-y-4">
      {/* Sport tags */}
      {attributes.sport && (
        <div className="flex flex-wrap gap-1">
          {(attributes.sport as string[]).map((sport) => (
            <span key={sport} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium">
              {sport}
            </span>
          ))}
        </div>
      )}

      {/* Level */}
      {attributes.level && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Niveau :</span>
          <span className={`px-2 py-1 text-xs rounded font-medium ${getLevelColor(attributes.level as string)}`}>
            {translateLevel(attributes.level as string)}
          </span>
        </div>
      )}

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {attributes.material && (
          <div>
            <span className="text-gray-500">Matière</span>
            <p className="font-medium">{(attributes.material as string[]).join(', ')}</p>
          </div>
        )}
        {attributes.weight && (
          <div>
            <span className="text-gray-500">Poids</span>
            <p className="font-medium">{attributes.weight as number}g</p>
          </div>
        )}
      </div>

      {/* Features */}
      {attributes.features && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Caractéristiques</h4>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            {(attributes.features as string[]).map((feature, i) => (
              <li key={i}>{feature}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Helper translation functions
function translateNutrient(key: string): string {
  const map: Record<string, string> = {
    calories: 'Calories',
    protein: 'Protéines',
    carbs: 'Glucides',
    fat: 'Lipides',
    fiber: 'Fibres',
    sodium: 'Sodium'
  }
  return map[key] || key
}

function getNutrientUnit(key: string): string {
  return key === 'calories' ? ' kcal' : key === 'sodium' ? ' mg' : ' g'
}

function translateSeason(season: string): string {
  const map: Record<string, string> = {
    spring: 'Printemps',
    summer: 'Été',
    fall: 'Automne',
    winter: 'Hiver'
  }
  return map[season] || season
}

function translateCertification(cert: string): string {
  const map: Record<string, string> = {
    'cruelty-free': '🐰 Cruelty-free',
    'vegan': '🌱 Vegan',
    'organic': '🌿 Bio',
    'dermatologist-tested': '👨‍⚕️ Testé dermatologiquement'
  }
  return map[cert] || cert
}

function translateSkinType(type: string): string {
  const map: Record<string, string> = {
    normal: 'Normale',
    dry: 'Sèche',
    oily: 'Grasse',
    combination: 'Mixte',
    sensitive: 'Sensible'
  }
  return map[type] || type
}

function translateConcern(concern: string): string {
  const map: Record<string, string> = {
    aging: 'Anti-âge',
    acne: 'Acné',
    hydration: 'Hydratation',
    brightening: 'Éclat',
    pores: 'Pores'
  }
  return map[concern] || concern
}

function translateAssembly(assembly: string): string {
  const map: Record<string, string> = {
    none: 'Aucun',
    minimal: 'Minimal',
    full: 'Complet'
  }
  return map[assembly] || assembly
}

function translateRoom(room: string): string {
  const map: Record<string, string> = {
    living: 'Salon',
    bedroom: 'Chambre',
    kitchen: 'Cuisine',
    bathroom: 'Salle de bain',
    office: 'Bureau',
    outdoor: 'Extérieur'
  }
  return map[room] || room
}

function translateLevel(level: string): string {
  const map: Record<string, string> = {
    beginner: 'Débutant',
    intermediate: 'Intermédiaire',
    advanced: 'Avancé',
    professional: 'Professionnel'
  }
  return map[level] || level
}

function getLevelColor(level: string): string {
  const map: Record<string, string> = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-blue-100 text-blue-800',
    advanced: 'bg-orange-100 text-orange-800',
    professional: 'bg-red-100 text-red-800'
  }
  return map[level] || 'bg-gray-100 text-gray-800'
}
