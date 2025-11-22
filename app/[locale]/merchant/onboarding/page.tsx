'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Store,
  Palette,
  Settings,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  ShoppingBag,
  Building2,
  Utensils,
  Plane,
  Download,
  Calendar,
  Wine,
  Shirt,
  Laptop,
  Sparkle,
  Home,
  Dumbbell,
  Gamepad2,
  Car,
  BookOpen,
  PawPrint,
  ShoppingCart,
  Gift,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

// Commerce types with icons and descriptions
const COMMERCE_TYPES = [
  { id: 'GENERAL', icon: ShoppingCart, color: 'bg-gray-500', category: 'physical' },
  { id: 'ELECTRONICS', icon: Laptop, color: 'bg-blue-500', category: 'physical' },
  { id: 'FASHION', icon: Shirt, color: 'bg-pink-500', category: 'physical' },
  { id: 'BEAUTY', icon: Sparkle, color: 'bg-purple-500', category: 'physical' },
  { id: 'HOME', icon: Home, color: 'bg-amber-500', category: 'physical' },
  { id: 'SPORTS', icon: Dumbbell, color: 'bg-green-500', category: 'physical' },
  { id: 'TOYS', icon: Gamepad2, color: 'bg-red-500', category: 'physical' },
  { id: 'AUTOMOTIVE', icon: Car, color: 'bg-slate-500', category: 'physical' },
  { id: 'BOOKS', icon: BookOpen, color: 'bg-orange-500', category: 'physical' },
  { id: 'PETS', icon: PawPrint, color: 'bg-lime-500', category: 'physical' },
  { id: 'FOOD', icon: ShoppingBag, color: 'bg-emerald-500', category: 'physical' },
  { id: 'ALCOHOL', icon: Wine, color: 'bg-rose-500', category: 'physical' },
  { id: 'SEASONAL', icon: Gift, color: 'bg-cyan-500', category: 'physical' },
  { id: 'DIGITAL', icon: Download, color: 'bg-indigo-500', category: 'digital' },
  { id: 'SERVICES', icon: Calendar, color: 'bg-teal-500', category: 'services' },
  { id: 'RESTAURANT', icon: Utensils, color: 'bg-orange-600', category: 'services' },
  { id: 'HOTEL', icon: Building2, color: 'bg-sky-500', category: 'services' },
  { id: 'TRAVEL', icon: Plane, color: 'bg-violet-500', category: 'services' },
  { id: 'RECREATION', icon: Sparkles, color: 'bg-fuchsia-500', category: 'services' },
]

const STEPS = [
  { id: 'commerceType', icon: Building2, label: 'Type de commerce' },
  { id: 'store', icon: Store, label: 'Informations' },
  { id: 'config', icon: Settings, label: 'Configuration' },
  { id: 'theme', icon: Palette, label: 'Thème' },
  { id: 'complete', icon: CheckCircle, label: 'Terminé' },
]

const THEME_PRESETS = [
  { id: 'modern', nameKey: 'themeModern', primary: '#6366f1', secondary: '#ec4899' },
  { id: 'nature', nameKey: 'themeNature', primary: '#10b981', secondary: '#3b82f6' },
  { id: 'warm', nameKey: 'themeWarm', primary: '#f97316', secondary: '#eab308' },
  { id: 'minimal', nameKey: 'themeMinimal', primary: '#111827', secondary: '#6b7280' },
  { id: 'luxury', nameKey: 'themeLuxury', primary: '#8b5cf6', secondary: '#c084fc' },
  { id: 'playful', nameKey: 'themePlayful', primary: '#f43f5e', secondary: '#06b6d4' },
]

// Type-specific configuration fields
const TYPE_CONFIGS: Record<string, { fields: { key: string; label: string; type: string; placeholder?: string; options?: string[] }[] }> = {
  HOTEL: {
    fields: [
      { key: 'roomCount', label: 'Nombre de chambres', type: 'number', placeholder: '50' },
      { key: 'starRating', label: 'Classement étoiles', type: 'select', options: ['1', '2', '3', '4', '5'] },
      { key: 'checkInTime', label: 'Heure de check-in', type: 'time' },
      { key: 'checkOutTime', label: 'Heure de check-out', type: 'time' },
    ],
  },
  RESTAURANT: {
    fields: [
      { key: 'cuisineType', label: 'Type de cuisine', type: 'text', placeholder: 'Française, Italienne...' },
      { key: 'seatingCapacity', label: 'Nombre de couverts', type: 'number', placeholder: '60' },
      { key: 'deliveryEnabled', label: 'Livraison activée', type: 'checkbox' },
      { key: 'takeawayEnabled', label: 'À emporter activé', type: 'checkbox' },
    ],
  },
  TRAVEL: {
    fields: [
      { key: 'destinations', label: 'Destinations principales', type: 'text', placeholder: 'Europe, Asie...' },
      { key: 'travelTypes', label: 'Types de voyage', type: 'text', placeholder: 'Aventure, Luxe, Famille...' },
      { key: 'licenseNumber', label: 'Numéro de licence', type: 'text', placeholder: 'IM075XXXXXX' },
    ],
  },
  DIGITAL: {
    fields: [
      { key: 'downloadLimit', label: 'Limite de téléchargements', type: 'number', placeholder: '5' },
      { key: 'licenseType', label: 'Type de licence', type: 'select', options: ['Personnel', 'Commercial', 'Les deux'] },
    ],
  },
  SERVICES: {
    fields: [
      { key: 'bookingAdvance', label: 'Réservation à l\'avance (jours)', type: 'number', placeholder: '30' },
      { key: 'cancellationPolicy', label: 'Politique d\'annulation', type: 'select', options: ['Flexible', 'Modérée', 'Stricte'] },
    ],
  },
  ALCOHOL: {
    fields: [
      { key: 'licenseNumber', label: 'Numéro de licence débit de boissons', type: 'text', placeholder: 'Licence IV' },
      { key: 'ageVerification', label: 'Vérification d\'âge obligatoire', type: 'checkbox' },
    ],
  },
}

export default function MerchantOnboardingPage() {
  const params = useParams()
  const router = useRouter()
  const locale = params?.locale || 'fr'
  const { data: session } = useSession()
  const t = useTranslations('merchant.onboarding')
  const tCommon = useTranslations('common')

  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form data
  const [selectedCommerceType, setSelectedCommerceType] = useState<string | null>(null)
  const [storeData, setStoreData] = useState({
    name: '',
    description: '',
    slug: '',
    publicEmail: '',
    publicPhone: '',
  })
  const [typeConfig, setTypeConfig] = useState<Record<string, string | boolean>>({})
  const [selectedTheme, setSelectedTheme] = useState('modern')

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (name: string) => {
    setStoreData({
      ...storeData,
      name,
      slug: generateSlug(name),
    })
  }

  // Mutations
  const createStore = trpc.store.create.useMutation()
  const createTheme = trpc.theme.create.useMutation()
  const seedThemes = trpc.theme.seedSystemThemes.useMutation()

  const handleNext = async () => {
    if (currentStep === 0 && !selectedCommerceType) return
    if (currentStep === 1 && (!storeData.name || !storeData.slug)) return
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setIsSubmitting(true)

    try {
      // 1. Create the store with commerce type
      const store = await createStore.mutateAsync({
        name: storeData.name,
        slug: storeData.slug,
        description: storeData.description,
        commerceType: selectedCommerceType as any,
        commerceConfig: typeConfig,
        publicEmail: storeData.publicEmail || undefined,
        publicPhone: storeData.publicPhone || undefined,
      })

      // 2. Seed default themes and create custom theme
      await seedThemes.mutateAsync({ storeId: store.id })

      const themePreset = THEME_PRESETS.find((tp) => tp.id === selectedTheme)
      if (themePreset) {
        await createTheme.mutateAsync({
          storeId: store.id,
          name: `${themePreset.id.charAt(0).toUpperCase() + themePreset.id.slice(1)} Theme`,
          config: {
            colors: {
              primary: themePreset.primary,
              secondary: themePreset.secondary,
              accent: '#f59e0b',
              background: '#ffffff',
              surface: '#fafafa',
              text: '#111827',
              textSecondary: '#6b7280',
              textMuted: '#9ca3af',
              border: '#e5e5e5',
              borderLight: '#f5f5f5',
            },
            fonts: { heading: 'Inter', body: 'Inter' },
            spacing: { containerMaxWidth: '1280px', sectionPadding: '4rem' },
            borderRadius: '0.5rem',
          },
        })
      }

      // 3. Redirect to dashboard
      router.push(`/${locale}/merchant`)
    } catch (error) {
      console.error('Onboarding error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentStepData = STEPS[currentStep]
  const progress = ((currentStep + 1) / STEPS.length) * 100
  const selectedType = COMMERCE_TYPES.find(t => t.id === selectedCommerceType)
  const configFields = selectedCommerceType ? TYPE_CONFIGS[selectedCommerceType]?.fields || [] : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Configuration de votre boutique
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentStepData.label}
          </h1>
          <p className="text-gray-600">
            Étape {currentStep + 1} sur {STEPS.length}
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mb-8 overflow-x-auto pb-2">
          <div className="flex items-center gap-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0',
                    index < currentStep
                      ? 'bg-green-500 text-white'
                      : index === currentStep
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                  )}
                >
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'w-8 md:w-12 h-1 mx-1 rounded transition-all',
                      index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* Step 0: Commerce Type Selection */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Quel type de commerce souhaitez-vous créer ?
                </h2>
                <p className="text-gray-600 mt-1">
                  Cela déterminera les fonctionnalités et l'affichage de vos produits
                </p>
              </div>

              {/* Physical Products */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Produits Physiques
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {COMMERCE_TYPES.filter(t => t.category === 'physical').map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedCommerceType(type.id)}
                      className={cn(
                        'p-4 rounded-xl border-2 text-center transition-all hover:scale-105',
                        selectedCommerceType === type.id
                          ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2', type.color)}>
                        <type.icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="font-medium text-gray-900 text-sm">{type.id}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Digital Products */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Produits Numériques
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {COMMERCE_TYPES.filter(t => t.category === 'digital').map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedCommerceType(type.id)}
                      className={cn(
                        'p-4 rounded-xl border-2 text-center transition-all hover:scale-105',
                        selectedCommerceType === type.id
                          ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2', type.color)}>
                        <type.icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="font-medium text-gray-900 text-sm">{type.id}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Services & Réservations
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {COMMERCE_TYPES.filter(t => t.category === 'services').map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedCommerceType(type.id)}
                      className={cn(
                        'p-4 rounded-xl border-2 text-center transition-all hover:scale-105',
                        selectedCommerceType === type.id
                          ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2', type.color)}>
                        <type.icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="font-medium text-gray-900 text-sm">{type.id}</p>
                    </button>
                  ))}
                </div>
              </div>

              {selectedCommerceType && (
                <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <div className="flex items-center gap-3">
                    {selectedType && (
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', selectedType.color)}>
                        <selectedType.icon className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{selectedCommerceType} sélectionné</p>
                      <p className="text-sm text-gray-600">
                        {selectedType?.category === 'services'
                          ? 'Système de réservation et calendrier inclus'
                          : selectedType?.category === 'digital'
                          ? 'Téléchargements et licences numériques'
                          : 'E-commerce classique avec panier'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Store Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Store className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Informations de votre boutique
                </h2>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de la boutique *
                  </label>
                  <Input
                    type="text"
                    placeholder="Ma Super Boutique"
                    value={storeData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de la boutique
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm">
                      foxcard.app/stores/
                    </span>
                    <Input
                      type="text"
                      value={storeData.slug}
                      onChange={(e) => setStoreData({ ...storeData, slug: e.target.value })}
                      className="rounded-l-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Décrivez votre boutique en quelques mots..."
                    value={storeData.description}
                    onChange={(e) => setStoreData({ ...storeData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email public
                    </label>
                    <Input
                      type="email"
                      placeholder="contact@maboutique.com"
                      value={storeData.publicEmail}
                      onChange={(e) => setStoreData({ ...storeData, publicEmail: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <Input
                      type="tel"
                      placeholder="+33 1 23 45 67 89"
                      value={storeData.publicPhone}
                      onChange={(e) => setStoreData({ ...storeData, publicPhone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Type-specific Configuration */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Configuration {selectedCommerceType}
                </h2>
                <p className="text-gray-600 mt-1">
                  Paramètres spécifiques à votre type de commerce
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                {configFields.length > 0 ? (
                  configFields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          value={typeConfig[field.key] as string || ''}
                          onChange={(e) => setTypeConfig({ ...typeConfig, [field.key]: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Sélectionner...</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field.type === 'checkbox' ? (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={typeConfig[field.key] as boolean || false}
                            onChange={(e) => setTypeConfig({ ...typeConfig, [field.key]: e.target.checked })}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-600">Activer</span>
                        </label>
                      ) : (
                        <Input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={typeConfig[field.key] as string || ''}
                          onChange={(e) => setTypeConfig({ ...typeConfig, [field.key]: e.target.value })}
                        />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucune configuration spécifique requise pour ce type.</p>
                    <p className="text-sm">Vous pourrez personnaliser davantage dans les paramètres.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Theme Selection */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-8 h-8 text-pink-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Choisissez votre thème
                </h2>
                <p className="text-gray-600 mt-1">
                  Vous pourrez le personnaliser plus tard
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                {THEME_PRESETS.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left transition-all hover:scale-105',
                      selectedTheme === theme.id
                        ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div
                      className="w-full h-20 rounded-lg mb-3"
                      style={{
                        background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                      }}
                    />
                    <p className="font-medium text-gray-900 capitalize">{theme.id}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 4 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Votre boutique est prête !
                </h2>
                <p className="text-gray-600">
                  Commencez à ajouter vos produits et personnalisez votre boutique
                </p>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-6 text-left max-w-md mx-auto">
                <h3 className="font-semibold text-gray-900 mb-4">Récapitulatif</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {selectedType && (
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', selectedType.color)}>
                        <selectedType.icon className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Type de commerce</p>
                      <p className="font-medium text-gray-900">{selectedCommerceType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Store className="w-8 h-8 text-gray-400 p-1.5 bg-gray-100 rounded-lg" />
                    <div>
                      <p className="text-sm text-gray-500">Boutique</p>
                      <p className="font-medium text-gray-900">{storeData.name}</p>
                      <p className="text-xs text-gray-500">foxcard.app/stores/{storeData.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Palette className="w-8 h-8 text-gray-400 p-1.5 bg-gray-100 rounded-lg" />
                    <div>
                      <p className="text-sm text-gray-500">Thème</p>
                      <p className="font-medium text-gray-900 capitalize">{selectedTheme}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={
                  (currentStep === 0 && !selectedCommerceType) ||
                  (currentStep === 1 && !storeData.name)
                }
                className="gap-2"
              >
                Suivant
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleComplete}
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Créer ma boutique
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
