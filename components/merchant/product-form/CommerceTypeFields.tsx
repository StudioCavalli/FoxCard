'use client'

import { CommerceType } from '@/lib/commerce-types'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/Switch'
import { AlertTriangle, Wine, Utensils, Shirt, Cpu, Sparkles, Download, CalendarCheck, Building2, Plane, Ticket, ChefHat } from 'lucide-react'

// Types for commerce-specific attributes
export interface CommerceTypeFieldsProps {
  commerceType: CommerceType
  attributes: Record<string, unknown>
  onChange: (attributes: Record<string, unknown>) => void
}

// Electronics Fields
function ElectronicsFields({ attributes, onChange }: Omit<CommerceTypeFieldsProps, 'commerceType'>) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
        <Cpu className="w-5 h-5" />
        <span className="font-medium">Spécifications techniques</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Marque</Label>
          <Input
            value={(attributes.brand as string) || ''}
            onChange={(e) => onChange({ ...attributes, brand: e.target.value })}
            placeholder="Ex: Apple, Samsung..."
          />
        </div>
        <div>
          <Label>Modèle</Label>
          <Input
            value={(attributes.model as string) || ''}
            onChange={(e) => onChange({ ...attributes, model: e.target.value })}
            placeholder="Ex: iPhone 15 Pro"
          />
        </div>
        <div>
          <Label>Garantie (mois)</Label>
          <Input
            type="number"
            value={(attributes.warrantyMonths as number) || ''}
            onChange={(e) => onChange({ ...attributes, warrantyMonths: parseInt(e.target.value) || 0 })}
            placeholder="24"
          />
        </div>
        <div>
          <Label>Indice de réparabilité (/10)</Label>
          <Input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={(attributes.repairabilityIndex as number) || ''}
            onChange={(e) => onChange({ ...attributes, repairabilityIndex: parseFloat(e.target.value) || 0 })}
            placeholder="7.5"
          />
        </div>
      </div>
      <div>
        <Label>Spécifications techniques</Label>
        <textarea
          value={(attributes.technicalSpecs as string) || ''}
          onChange={(e) => onChange({ ...attributes, technicalSpecs: e.target.value })}
          placeholder="Processeur: A17 Pro&#10;RAM: 8GB&#10;Stockage: 256GB"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>
  )
}

// Fashion Fields
function FashionFields({ attributes, onChange }: Omit<CommerceTypeFieldsProps, 'commerceType'>) {
  const sizes = (attributes.sizes as string[]) || []
  const colors = (attributes.colors as string[]) || []
  const materials = (attributes.materials as string[]) || []

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 mb-2">
        <Shirt className="w-5 h-5" />
        <span className="font-medium">Mode & Vêtements</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Tailles disponibles</Label>
          <Input
            value={sizes.join(', ')}
            onChange={(e) => onChange({ ...attributes, sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
            placeholder="XS, S, M, L, XL"
          />
          <p className="text-xs text-gray-500 mt-1">Séparez par des virgules</p>
        </div>
        <div>
          <Label>Couleurs</Label>
          <Input
            value={colors.join(', ')}
            onChange={(e) => onChange({ ...attributes, colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
            placeholder="Noir, Blanc, Rouge"
          />
        </div>
        <div>
          <Label>Matières</Label>
          <Input
            value={materials.join(', ')}
            onChange={(e) => onChange({ ...attributes, materials: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
            placeholder="Coton, Polyester, Lin"
          />
        </div>
        <div>
          <Label>Genre</Label>
          <select
            value={(attributes.gender as string) || ''}
            onChange={(e) => onChange({ ...attributes, gender: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
          >
            <option value="">Non spécifié</option>
            <option value="men">Homme</option>
            <option value="women">Femme</option>
            <option value="unisex">Unisexe</option>
            <option value="kids">Enfant</option>
          </select>
        </div>
      </div>
      <div>
        <Label>Guide des tailles (URL ou texte)</Label>
        <Input
          value={(attributes.sizeGuide as string) || ''}
          onChange={(e) => onChange({ ...attributes, sizeGuide: e.target.value })}
          placeholder="Lien vers le guide des tailles ou instructions"
        />
      </div>
    </div>
  )
}

// Food Fields
function FoodFields({ attributes, onChange }: Omit<CommerceTypeFieldsProps, 'commerceType'>) {
  const allergens = (attributes.allergens as string[]) || []

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-2">
        <Utensils className="w-5 h-5" />
        <span className="font-medium">Produit alimentaire</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Poids / Volume</Label>
          <Input
            value={(attributes.weight as string) || ''}
            onChange={(e) => onChange({ ...attributes, weight: e.target.value })}
            placeholder="500g, 1L..."
          />
        </div>
        <div>
          <Label>Date limite de consommation</Label>
          <Input
            type="date"
            value={(attributes.expirationDate as string) || ''}
            onChange={(e) => onChange({ ...attributes, expirationDate: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label>Allergènes</Label>
        <Input
          value={allergens.join(', ')}
          onChange={(e) => onChange({ ...attributes, allergens: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
          placeholder="Gluten, Lait, Œufs, Fruits à coque..."
        />
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Les allergènes doivent être déclarés selon la réglementation
        </p>
      </div>
      <div>
        <Label>Valeurs nutritionnelles (pour 100g)</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Input
            placeholder="Calories (kcal)"
            value={(attributes.calories as string) || ''}
            onChange={(e) => onChange({ ...attributes, calories: e.target.value })}
          />
          <Input
            placeholder="Protéines (g)"
            value={(attributes.proteins as string) || ''}
            onChange={(e) => onChange({ ...attributes, proteins: e.target.value })}
          />
          <Input
            placeholder="Glucides (g)"
            value={(attributes.carbs as string) || ''}
            onChange={(e) => onChange({ ...attributes, carbs: e.target.value })}
          />
          <Input
            placeholder="Lipides (g)"
            value={(attributes.fat as string) || ''}
            onChange={(e) => onChange({ ...attributes, fat: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label>Ingrédients</Label>
        <textarea
          value={(attributes.ingredients as string) || ''}
          onChange={(e) => onChange({ ...attributes, ingredients: e.target.value })}
          placeholder="Liste complète des ingrédients..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>
  )
}

// Alcohol Fields
function AlcoholFields({ attributes, onChange }: Omit<CommerceTypeFieldsProps, 'commerceType'>) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
        <Wine className="w-5 h-5" />
        <span className="font-medium">Boissons alcoolisées</span>
      </div>
      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 mb-4">
        <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Vente interdite aux mineurs. Vérification d'âge obligatoire.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label>Degré d'alcool (%)</Label>
          <Input
            type="number"
            step="0.1"
            value={(attributes.alcoholDegree as number) || ''}
            onChange={(e) => onChange({ ...attributes, alcoholDegree: parseFloat(e.target.value) || 0 })}
            placeholder="12.5"
          />
        </div>
        <div>
          <Label>Volume (ml)</Label>
          <Input
            type="number"
            value={(attributes.volume as number) || ''}
            onChange={(e) => onChange({ ...attributes, volume: parseInt(e.target.value) || 0 })}
            placeholder="750"
          />
        </div>
        <div>
          <Label>Millésime</Label>
          <Input
            type="number"
            value={(attributes.vintage as number) || ''}
            onChange={(e) => onChange({ ...attributes, vintage: parseInt(e.target.value) || 0 })}
            placeholder="2021"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Cépage</Label>
          <Input
            value={(attributes.grapeVariety as string) || ''}
            onChange={(e) => onChange({ ...attributes, grapeVariety: e.target.value })}
            placeholder="Cabernet Sauvignon, Merlot..."
          />
        </div>
        <div>
          <Label>Région / Appellation</Label>
          <Input
            value={(attributes.region as string) || ''}
            onChange={(e) => onChange({ ...attributes, region: e.target.value })}
            placeholder="Bordeaux, Champagne..."
          />
        </div>
      </div>
      <div>
        <Label>Accords mets-vins</Label>
        <Input
          value={(attributes.foodPairing as string) || ''}
          onChange={(e) => onChange({ ...attributes, foodPairing: e.target.value })}
          placeholder="Viandes rouges, fromages affinés..."
        />
      </div>
      <div>
        <Label>Notes de dégustation</Label>
        <textarea
          value={(attributes.tastingNotes as string) || ''}
          onChange={(e) => onChange({ ...attributes, tastingNotes: e.target.value })}
          placeholder="Robe rubis profond, arômes de fruits rouges..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>
  )
}

// Digital Products Fields
function DigitalFields({ attributes, onChange }: Omit<CommerceTypeFieldsProps, 'commerceType'>) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 mb-2">
        <Download className="w-5 h-5" />
        <span className="font-medium">Produit numérique</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Format du fichier</Label>
          <Input
            value={(attributes.fileFormat as string) || ''}
            onChange={(e) => onChange({ ...attributes, fileFormat: e.target.value })}
            placeholder="PDF, MP3, ZIP..."
          />
        </div>
        <div>
          <Label>Taille du fichier</Label>
          <Input
            value={(attributes.fileSize as string) || ''}
            onChange={(e) => onChange({ ...attributes, fileSize: e.target.value })}
            placeholder="15 MB, 2.5 GB..."
          />
        </div>
        <div>
          <Label>Limite de téléchargements</Label>
          <Input
            type="number"
            value={(attributes.downloadLimit as number) || ''}
            onChange={(e) => onChange({ ...attributes, downloadLimit: parseInt(e.target.value) || 0 })}
            placeholder="Illimité si vide"
          />
        </div>
        <div>
          <Label>Durée de validité (jours)</Label>
          <Input
            type="number"
            value={(attributes.validityDays as number) || ''}
            onChange={(e) => onChange({ ...attributes, validityDays: parseInt(e.target.value) || 0 })}
            placeholder="Illimité si vide"
          />
        </div>
      </div>
      <div>
        <Label>Type de licence</Label>
        <select
          value={(attributes.licenseType as string) || ''}
          onChange={(e) => onChange({ ...attributes, licenseType: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
        >
          <option value="">Non spécifié</option>
          <option value="personal">Usage personnel</option>
          <option value="commercial">Usage commercial</option>
          <option value="extended">Licence étendue</option>
        </select>
      </div>
      <div>
        <Label>URL du fichier (après achat)</Label>
        <Input
          value={(attributes.downloadUrl as string) || ''}
          onChange={(e) => onChange({ ...attributes, downloadUrl: e.target.value })}
          placeholder="https://..."
        />
        <p className="text-xs text-gray-500 mt-1">Le lien sera accessible uniquement après l'achat</p>
      </div>
    </div>
  )
}

// Services Fields
function ServicesFields({ attributes, onChange }: Omit<CommerceTypeFieldsProps, 'commerceType'>) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
        <CalendarCheck className="w-5 h-5" />
        <span className="font-medium">Service / Prestation</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Durée de la prestation</Label>
          <Input
            value={(attributes.duration as string) || ''}
            onChange={(e) => onChange({ ...attributes, duration: e.target.value })}
            placeholder="1h, 2h30, 1 journée..."
          />
        </div>
        <div>
          <Label>Lieu</Label>
          <select
            value={(attributes.locationType as string) || ''}
            onChange={(e) => onChange({ ...attributes, locationType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
          >
            <option value="">Non spécifié</option>
            <option value="onsite">Sur place</option>
            <option value="remote">À distance</option>
            <option value="customer">Chez le client</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Switch
          checked={(attributes.requiresBooking as boolean) || false}
          onCheckedChange={(checked) => onChange({ ...attributes, requiresBooking: checked })}
        />
        <Label>Nécessite une réservation</Label>
      </div>
      <div>
        <Label>Instructions de préparation</Label>
        <textarea
          value={(attributes.preparationInstructions as string) || ''}
          onChange={(e) => onChange({ ...attributes, preparationInstructions: e.target.value })}
          placeholder="Ce que le client doit préparer avant la prestation..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>
  )
}

// Hotel Fields
function HotelFields({ attributes, onChange }: Omit<CommerceTypeFieldsProps, 'commerceType'>) {
  const amenities = (attributes.amenities as string[]) || []

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
        <Building2 className="w-5 h-5" />
        <span className="font-medium">Hébergement</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Type de chambre</Label>
          <select
            value={(attributes.roomType as string) || ''}
            onChange={(e) => onChange({ ...attributes, roomType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
          >
            <option value="">Sélectionner</option>
            <option value="single">Simple</option>
            <option value="double">Double</option>
            <option value="twin">Twin</option>
            <option value="suite">Suite</option>
            <option value="apartment">Appartement</option>
          </select>
        </div>
        <div>
          <Label>Capacité (personnes)</Label>
          <Input
            type="number"
            value={(attributes.capacity as number) || ''}
            onChange={(e) => onChange({ ...attributes, capacity: parseInt(e.target.value) || 0 })}
            placeholder="2"
          />
        </div>
        <div>
          <Label>Check-in</Label>
          <Input
            type="time"
            value={(attributes.checkInTime as string) || ''}
            onChange={(e) => onChange({ ...attributes, checkInTime: e.target.value })}
          />
        </div>
        <div>
          <Label>Check-out</Label>
          <Input
            type="time"
            value={(attributes.checkOutTime as string) || ''}
            onChange={(e) => onChange({ ...attributes, checkOutTime: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label>Équipements</Label>
        <Input
          value={amenities.join(', ')}
          onChange={(e) => onChange({ ...attributes, amenities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
          placeholder="WiFi, Climatisation, Piscine, Parking..."
        />
      </div>
      <div>
        <Label>Politique d'annulation</Label>
        <textarea
          value={(attributes.cancellationPolicy as string) || ''}
          onChange={(e) => onChange({ ...attributes, cancellationPolicy: e.target.value })}
          placeholder="Annulation gratuite jusqu'à 24h avant..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>
  )
}

// Travel Fields
function TravelFields({ attributes, onChange }: Omit<CommerceTypeFieldsProps, 'commerceType'>) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 mb-2">
        <Plane className="w-5 h-5" />
        <span className="font-medium">Voyage</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Destination</Label>
          <Input
            value={(attributes.destination as string) || ''}
            onChange={(e) => onChange({ ...attributes, destination: e.target.value })}
            placeholder="Paris, Bali, New York..."
          />
        </div>
        <div>
          <Label>Durée</Label>
          <Input
            value={(attributes.tripDuration as string) || ''}
            onChange={(e) => onChange({ ...attributes, tripDuration: e.target.value })}
            placeholder="7 jours / 6 nuits"
          />
        </div>
        <div>
          <Label>Date de départ</Label>
          <Input
            type="date"
            value={(attributes.departureDate as string) || ''}
            onChange={(e) => onChange({ ...attributes, departureDate: e.target.value })}
          />
        </div>
        <div>
          <Label>Date de retour</Label>
          <Input
            type="date"
            value={(attributes.returnDate as string) || ''}
            onChange={(e) => onChange({ ...attributes, returnDate: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label>Itinéraire</Label>
        <textarea
          value={(attributes.itinerary as string) || ''}
          onChange={(e) => onChange({ ...attributes, itinerary: e.target.value })}
          placeholder="Jour 1: Arrivée...&#10;Jour 2: Visite..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Inclus dans le prix</Label>
          <textarea
            value={(attributes.inclusions as string) || ''}
            onChange={(e) => onChange({ ...attributes, inclusions: e.target.value })}
            placeholder="Vol, Hébergement, Petit-déjeuner..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <Label>Non inclus</Label>
          <textarea
            value={(attributes.exclusions as string) || ''}
            onChange={(e) => onChange({ ...attributes, exclusions: e.target.value })}
            placeholder="Repas, Activités optionnelles..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  )
}

// Restaurant Fields
function RestaurantFields({ attributes, onChange }: Omit<CommerceTypeFieldsProps, 'commerceType'>) {
  const allergens = (attributes.allergens as string[]) || []

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
        <ChefHat className="w-5 h-5" />
        <span className="font-medium">Restaurant / Menu</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Catégorie de plat</Label>
          <select
            value={(attributes.dishCategory as string) || ''}
            onChange={(e) => onChange({ ...attributes, dishCategory: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
          >
            <option value="">Sélectionner</option>
            <option value="starter">Entrée</option>
            <option value="main">Plat principal</option>
            <option value="dessert">Dessert</option>
            <option value="drink">Boisson</option>
            <option value="side">Accompagnement</option>
          </select>
        </div>
        <div>
          <Label>Temps de préparation</Label>
          <Input
            value={(attributes.prepTime as string) || ''}
            onChange={(e) => onChange({ ...attributes, prepTime: e.target.value })}
            placeholder="15-20 min"
          />
        </div>
      </div>
      <div>
        <Label>Allergènes</Label>
        <Input
          value={allergens.join(', ')}
          onChange={(e) => onChange({ ...attributes, allergens: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
          placeholder="Gluten, Lait, Œufs..."
        />
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={(attributes.isVegetarian as boolean) || false}
            onChange={(e) => onChange({ ...attributes, isVegetarian: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm">Végétarien</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={(attributes.isVegan as boolean) || false}
            onChange={(e) => onChange({ ...attributes, isVegan: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm">Vegan</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={(attributes.isGlutenFree as boolean) || false}
            onChange={(e) => onChange({ ...attributes, isGlutenFree: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm">Sans gluten</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={(attributes.isSpicy as boolean) || false}
            onChange={(e) => onChange({ ...attributes, isSpicy: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm">Épicé</span>
        </label>
      </div>
    </div>
  )
}

// Recreation Fields
function RecreationFields({ attributes, onChange }: Omit<CommerceTypeFieldsProps, 'commerceType'>) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
        <Ticket className="w-5 h-5" />
        <span className="font-medium">Activité / Loisir</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Durée de l'activité</Label>
          <Input
            value={(attributes.activityDuration as string) || ''}
            onChange={(e) => onChange({ ...attributes, activityDuration: e.target.value })}
            placeholder="2h, Demi-journée..."
          />
        </div>
        <div>
          <Label>Âge minimum</Label>
          <Input
            type="number"
            value={(attributes.minAge as number) || ''}
            onChange={(e) => onChange({ ...attributes, minAge: parseInt(e.target.value) || 0 })}
            placeholder="Aucun si vide"
          />
        </div>
        <div>
          <Label>Difficulté</Label>
          <select
            value={(attributes.difficulty as string) || ''}
            onChange={(e) => onChange({ ...attributes, difficulty: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
          >
            <option value="">Non spécifié</option>
            <option value="easy">Facile</option>
            <option value="moderate">Modéré</option>
            <option value="difficult">Difficile</option>
          </select>
        </div>
        <div>
          <Label>Groupe max.</Label>
          <Input
            type="number"
            value={(attributes.maxGroupSize as number) || ''}
            onChange={(e) => onChange({ ...attributes, maxGroupSize: parseInt(e.target.value) || 0 })}
            placeholder="Illimité si vide"
          />
        </div>
      </div>
      <div>
        <Label>Équipement fourni</Label>
        <Input
          value={(attributes.equipmentProvided as string) || ''}
          onChange={(e) => onChange({ ...attributes, equipmentProvided: e.target.value })}
          placeholder="Casque, Vélo, Gilet..."
        />
      </div>
      <div>
        <Label>Ce qu'il faut apporter</Label>
        <Input
          value={(attributes.toBring as string) || ''}
          onChange={(e) => onChange({ ...attributes, toBring: e.target.value })}
          placeholder="Chaussures fermées, Bouteille d'eau..."
        />
      </div>
    </div>
  )
}

// Beauty Fields
function BeautyFields({ attributes, onChange }: Omit<CommerceTypeFieldsProps, 'commerceType'>) {
  const ingredients = (attributes.ingredients as string[]) || []

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-2">
        <Sparkles className="w-5 h-5" />
        <span className="font-medium">Beauté & Cosmétiques</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Type de peau</Label>
          <Input
            value={(attributes.skinType as string) || ''}
            onChange={(e) => onChange({ ...attributes, skinType: e.target.value })}
            placeholder="Tous types, Peau sèche, Peau grasse..."
          />
        </div>
        <div>
          <Label>Contenance</Label>
          <Input
            value={(attributes.volume as string) || ''}
            onChange={(e) => onChange({ ...attributes, volume: e.target.value })}
            placeholder="50ml, 100ml..."
          />
        </div>
      </div>
      <div>
        <Label>Ingrédients clés</Label>
        <Input
          value={ingredients.join(', ')}
          onChange={(e) => onChange({ ...attributes, ingredients: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
          placeholder="Acide hyaluronique, Vitamine C, Rétinol..."
        />
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={(attributes.isOrganic as boolean) || false}
            onChange={(e) => onChange({ ...attributes, isOrganic: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm">Bio</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={(attributes.isVegan as boolean) || false}
            onChange={(e) => onChange({ ...attributes, isVegan: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm">Vegan</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={(attributes.isCrueltyFree as boolean) || false}
            onChange={(e) => onChange({ ...attributes, isCrueltyFree: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm">Cruelty-free</span>
        </label>
      </div>
      <div>
        <Label>Mode d'emploi</Label>
        <textarea
          value={(attributes.howToUse as string) || ''}
          onChange={(e) => onChange({ ...attributes, howToUse: e.target.value })}
          placeholder="Appliquer matin et soir sur peau propre..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>
  )
}

// Main component with factory pattern
export function CommerceTypeFields({ commerceType, attributes, onChange }: CommerceTypeFieldsProps) {
  // Types that don't need specific fields use the default form
  const typesWithoutSpecificFields: CommerceType[] = ['GENERAL', 'HOME', 'SPORTS', 'TOYS', 'AUTOMOTIVE', 'BOOKS', 'PETS', 'SEASONAL']

  if (typesWithoutSpecificFields.includes(commerceType)) {
    return null
  }

  switch (commerceType) {
    case 'ELECTRONICS':
      return <ElectronicsFields attributes={attributes} onChange={onChange} />
    case 'FASHION':
      return <FashionFields attributes={attributes} onChange={onChange} />
    case 'FOOD':
      return <FoodFields attributes={attributes} onChange={onChange} />
    case 'ALCOHOL':
      return <AlcoholFields attributes={attributes} onChange={onChange} />
    case 'DIGITAL':
      return <DigitalFields attributes={attributes} onChange={onChange} />
    case 'SERVICES':
      return <ServicesFields attributes={attributes} onChange={onChange} />
    case 'HOTEL':
      return <HotelFields attributes={attributes} onChange={onChange} />
    case 'TRAVEL':
      return <TravelFields attributes={attributes} onChange={onChange} />
    case 'RESTAURANT':
      return <RestaurantFields attributes={attributes} onChange={onChange} />
    case 'RECREATION':
      return <RecreationFields attributes={attributes} onChange={onChange} />
    case 'BEAUTY':
      return <BeautyFields attributes={attributes} onChange={onChange} />
    default:
      return null
  }
}
