'use client'

import { useState, useEffect } from 'react'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import {
  Store, Save, Globe, Mail, Phone, ChevronRight, Check, AlertTriangle,
  ShoppingBag, Utensils, Wine, Shirt, Smartphone, Sparkles, Home as HomeIcon, Dumbbell,
  Gamepad2, Car, BookOpen, PawPrint, Download, CalendarCheck, Snowflake, ChefHat,
  Building2, Plane, Ticket,
} from 'lucide-react'
import {
  commerceTypeConfigs,
  type CommerceType,
} from '@/lib/commerce-types'
import { CountryMultiSelect } from '@/components/ui/CountryMultiSelect'
import { getCountryFlag, getCountryLabel } from '@/lib/countries'
import { useLocale } from 'next-intl'

const iconMap: Record<CommerceType, React.ElementType> = {
  GENERAL: ShoppingBag,
  FOOD: Utensils,
  ALCOHOL: Wine,
  FASHION: Shirt,
  ELECTRONICS: Smartphone,
  BEAUTY: Sparkles,
  HOME: HomeIcon,
  SPORTS: Dumbbell,
  TOYS: Gamepad2,
  AUTOMOTIVE: Car,
  BOOKS: BookOpen,
  PETS: PawPrint,
  DIGITAL: Download,
  SERVICES: CalendarCheck,
  SEASONAL: Snowflake,
  RESTAURANT: ChefHat,
  HOTEL: Building2,
  TRAVEL: Plane,
  RECREATION: Ticket,
}

export default function MerchantStorePage() {
  const locale = useLocale()
  const { storeId } = useStoreContext()
  const [isEditing, setIsEditing] = useState(false)
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const [selectedType, setSelectedType] = useState<CommerceType | null>(null)

  const { data: store, isLoading, refetch } = trpc.store.getById.useQuery(
    { id: storeId! },
    { enabled: !!storeId }
  )

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    publicEmail: '',
    publicPhone: '',
  })
  const [editCountries, setEditCountries] = useState<string[]>([])

  useEffect(() => {
    if (store?.commerceType) {
      setSelectedType(store.commerceType as CommerceType)
    }
  }, [store?.commerceType])

  const updateStore = trpc.store.update.useMutation({
    onSuccess: () => {
      refetch()
      setIsEditing(false)
    },
  })

  const updateCommerceType = trpc.commerceType.updateStoreType.useMutation({
    onSuccess: () => {
      refetch()
      setShowTypeSelector(false)
    },
  })

  const createDefaultCategories = trpc.commerceType.createDefaultCategories.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const handleEdit = () => {
    if (store) {
      setFormData({
        name: store.name || '',
        tagline: store.tagline || '',
        description: store.description || '',
        publicEmail: store.publicEmail || '',
        publicPhone: store.publicPhone || '',
      })
      setEditCountries(store.countries || [])
      setIsEditing(true)
    }
  }

  const handleSave = () => {
    updateStore.mutate({
      storeId: storeId!,
      ...formData,
      countries: editCountries,
    })
  }

  const handleTypeChange = async (type: CommerceType) => {
    setSelectedType(type)
    await updateCommerceType.mutateAsync({
      storeId: storeId!,
      commerceType: type,
    })
  }

  const handleCreateCategories = () => {
    createDefaultCategories.mutate({ storeId: storeId! })
  }

  const currentConfig = selectedType ? commerceTypeConfigs[selectedType] : null

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-48 animate-pulse" />
        <AdminCard padding="lg">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
            ))}
          </div>
        </AdminCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ma boutique</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gérez les informations et le type de votre boutique</p>
        </div>
        {!isEditing ? (
          <AdminButton onClick={handleEdit}>
            Modifier les infos
          </AdminButton>
        ) : (
          <div className="flex items-center gap-2">
            <AdminButton variant="secondary" onClick={() => setIsEditing(false)}>
              Annuler
            </AdminButton>
            <AdminButton onClick={handleSave} disabled={updateStore.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {updateStore.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </AdminButton>
          </div>
        )}
      </div>

      {/* Commerce Type Card */}
      <AdminCard className="overflow-hidden" padding="none">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Type de commerce</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Définit les fonctionnalités et champs disponibles pour vos produits
              </p>
            </div>
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() => setShowTypeSelector(!showTypeSelector)}
            >
              {showTypeSelector ? 'Fermer' : 'Changer le type'}
            </AdminButton>
          </div>
        </div>

        {/* Current Type Display */}
        {currentConfig && !showTypeSelector && (
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-purple-500/20 dark:from-primary-500/30 dark:to-purple-500/30 rounded-xl flex items-center justify-center">
                {(() => {
                  const Icon = iconMap[selectedType!]
                  return <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                })()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{currentConfig.name}</h3>
                  <span className="text-xl">{currentConfig.emoji}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{currentConfig.description}</p>

                {/* Features */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {currentConfig.features.hasPhysicalProducts && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Produits physiques</span>
                    </div>
                  )}
                  {currentConfig.features.hasDigitalProducts && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Produits digitaux</span>
                    </div>
                  )}
                  {currentConfig.features.hasBookings && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Réservations</span>
                    </div>
                  )}
                  {currentConfig.features.hasSubscriptions && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Abonnements</span>
                    </div>
                  )}
                  {currentConfig.features.requiresShipping && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Livraison</span>
                    </div>
                  )}
                  {currentConfig.features.hasVariants && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Variantes produit</span>
                    </div>
                  )}
                  {currentConfig.features.hasTimeslots && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Créneaux horaires</span>
                    </div>
                  )}
                  {currentConfig.features.requiresAgeVerification && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Vérification âge ({currentConfig.minAge}+)</span>
                    </div>
                  )}
                </div>

                {/* Default Categories */}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Catégories par défaut</span>
                    <AdminButton
                      variant="ghost"
                      size="sm"
                      onClick={handleCreateCategories}
                      disabled={createDefaultCategories.isPending}
                    >
                      {createDefaultCategories.isPending ? 'Création...' : 'Créer les catégories'}
                    </AdminButton>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentConfig.defaultCategories.map((cat) => (
                      <span
                        key={cat}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-lg"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Regulations */}
                {currentConfig.regulations && currentConfig.regulations.length > 0 && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Réglementations obligatoires</p>
                        <ul className="mt-1 text-sm text-amber-700 dark:text-amber-300 space-y-1">
                          {currentConfig.regulations.map((reg, i) => (
                            <li key={i}>&bull; {reg}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Type Selector */}
        {showTypeSelector && (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(commerceTypeConfigs).map(([type, config]) => {
                const Icon = iconMap[type as CommerceType]
                const isSelected = selectedType === type
                return (
                  <button
                    key={type}
                    onClick={() => handleTypeChange(type as CommerceType)}
                    disabled={updateCommerceType.isPending}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected
                          ? 'bg-primary-100 dark:bg-primary-500/20'
                          : 'bg-slate-100 dark:bg-slate-700'
                      }`}>
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${isSelected ? 'text-primary-900 dark:text-primary-100' : 'text-slate-900 dark:text-white'}`}>
                            {config.name}
                          </span>
                          <span>{config.emoji}</span>
                          {isSelected && <Check className="w-4 h-4 text-primary-500" />}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{config.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </AdminCard>

      {/* Store Info Card */}
      <AdminCard className="overflow-hidden" padding="none">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-primary-500 to-purple-600 relative">
          {store?.bannerImage && (
            <img src={store.bannerImage} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-xl shadow-lg flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800">
              {store?.logo ? (
                <img src={store.logo} alt="" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-8 h-8 text-slate-400" />
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-14 p-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Nom de la boutique
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Slogan
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Une phrase accrocheuse pour votre boutique"
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez votre boutique..."
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Email de contact
                  </label>
                  <input
                    type="email"
                    value={formData.publicEmail}
                    onChange={(e) => setFormData({ ...formData, publicEmail: e.target.value })}
                    placeholder="contact@maboutique.com"
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    value={formData.publicPhone}
                    onChange={(e) => setFormData({ ...formData, publicPhone: e.target.value })}
                    placeholder="+33 1 23 45 67 89"
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Pays d&apos;activité
                </label>
                <CountryMultiSelect
                  value={editCountries}
                  onChange={setEditCountries}
                  placeholder="Sélectionner des pays..."
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{store?.name}</h2>
                {store?.tagline && (
                  <p className="text-slate-600 dark:text-slate-400 mt-1">{store.tagline}</p>
                )}
              </div>

              {store?.description && (
                <p className="text-slate-600 dark:text-slate-400">{store.description}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <Globe className="w-5 h-5 text-slate-400" />
                  <span className="text-sm">{store?.slug}.foxcard.io</span>
                </div>
                {store?.publicEmail && (
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <span className="text-sm">{store.publicEmail}</span>
                  </div>
                )}
                {store?.publicPhone && (
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <span className="text-sm">{store.publicPhone}</span>
                  </div>
                )}
              </div>

              {store?.countries && store.countries.length > 0 && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Pays d&apos;activité</p>
                  <div className="flex flex-wrap gap-2">
                    {store.countries.map((code: string) => (
                      <span
                        key={code}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm"
                      >
                        {getCountryFlag(code)} {getCountryLabel(code, locale)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </AdminCard>

      {/* Checkout Steps Preview */}
      {currentConfig && (
        <AdminCard padding="lg">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Étapes du checkout</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Les étapes de paiement sont automatiquement adaptées selon votre type de commerce
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {currentConfig.checkoutSteps.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300 text-sm font-medium rounded-lg capitalize">
                  {step.replace(/-/g, ' ')}
                </span>
                {i < currentConfig.checkoutSteps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </div>
            ))}
          </div>
        </AdminCard>
      )}
    </div>
  )
}
