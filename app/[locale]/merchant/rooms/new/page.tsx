'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { AdminCheckbox } from '@/components/admin/ui/AdminCheckbox'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import { ProductStatus, ProductType } from '@prisma/client'
import {
  ArrowLeft,
  Save,
  Loader2,
  Bed,
  Users,
  Maximize,
  Wifi,
  Check,
} from 'lucide-react'

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

interface Amenity {
  id: string
  name: string
  category: string
  isHighlighted: boolean
}

export default function NewRoomPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale || 'fr'
  const basePath = `/${locale}/merchant`
  const { storeId } = useStoreContext()
  const t = useTranslations('merchant.hotel.rooms')

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    compareAtPrice: '',
    images: [] as string[],
    thumbnail: '',
    status: ProductStatus.DRAFT as ProductStatus,
    featured: false,
    categoryId: '', // Room Type
    // Hotel-specific attributes
    maxGuests: '2',
    maxAdults: '2',
    maxChildren: '0',
    bedType: '',
    bedCount: '1',
    sizeSqm: '',
    floorNumber: '',
    roomNumber: '',
    hasBalcony: false,
    hasSeaView: false,
    hasMountainView: false,
    isSmoking: false,
    isPetFriendly: false,
    selectedAmenities: [] as string[],
  })
  const [error, setError] = useState('')
  const [amenities, setAmenities] = useState<Amenity[]>([])

  // Fetch categories (room types)
  const { data: categoriesData } = trpc.category.getAll.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  )

  // Fetch store commerce config for amenities
  const { data: storeTypeData } = trpc.commerceType.getStoreType.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  )

  useEffect(() => {
    if (storeTypeData?.storeConfig) {
      const config = storeTypeData.storeConfig as any
      setAmenities(config.amenities || [])
    }
  }, [storeTypeData])

  const createProduct = trpc.product.create.useMutation({
    onSuccess: () => {
      router.push(`${basePath}/rooms`)
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  const handleNameChange = (value: string) => {
    setFormData({
      ...formData,
      name: value,
      slug: slugify(value),
    })
  }

  const handleImagesChange = (urls: string[]) => {
    setFormData({
      ...formData,
      images: urls,
      thumbnail: urls[0] || '',
    })
  }

  const toggleAmenity = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAmenities: prev.selectedAmenities.includes(amenityId)
        ? prev.selectedAmenities.filter(id => id !== amenityId)
        : [...prev.selectedAmenities, amenityId]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeId) return

    setError('')
    createProduct.mutate({
      storeId,
      name: formData.name,
      slug: formData.slug,
      description: formData.description || undefined,
      price: parseFloat(formData.price) || 0,
      compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
      type: ProductType.SIMPLE,
      trackInventory: false,
      quantity: 1,
      images: formData.images,
      thumbnail: formData.thumbnail || undefined,
      status: formData.status,
      featured: formData.featured,
      categoryId: formData.categoryId || undefined,
      attributes: {
        // Hotel-specific attributes
        maxGuests: parseInt(formData.maxGuests) || 2,
        maxAdults: parseInt(formData.maxAdults) || 2,
        maxChildren: parseInt(formData.maxChildren) || 0,
        bedType: formData.bedType || undefined,
        bedCount: parseInt(formData.bedCount) || 1,
        sizeSqm: formData.sizeSqm ? parseFloat(formData.sizeSqm) : undefined,
        floorNumber: formData.floorNumber ? parseInt(formData.floorNumber) : undefined,
        roomNumber: formData.roomNumber || undefined,
        hasBalcony: formData.hasBalcony,
        hasSeaView: formData.hasSeaView,
        hasMountainView: formData.hasMountainView,
        isSmoking: formData.isSmoking,
        isPetFriendly: formData.isPetFriendly,
        amenities: formData.selectedAmenities,
      },
    })
  }

  const bedTypes = [
    { value: '', label: 'Sélectionner...' },
    { value: 'single', label: 'Lit simple' },
    { value: 'double', label: 'Lit double' },
    { value: 'queen', label: 'Lit Queen' },
    { value: 'king', label: 'Lit King' },
    { value: 'twin', label: 'Lits jumeaux' },
    { value: 'bunk', label: 'Lits superposés' },
    { value: 'sofa', label: 'Canapé-lit' },
  ]

  // Group amenities by category
  const groupedAmenities = amenities.reduce((acc: Record<string, Amenity[]>, amenity) => {
    const cat = amenity.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(amenity)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`${basePath}/rooms`}>
          <AdminButton variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </AdminButton>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('create')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Ajoutez une nouvelle chambre à votre établissement</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <AdminCard padding="lg">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Informations générales</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Nom de la chambre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Chambre Deluxe Vue Mer"
                  required
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="chambre-deluxe-vue-mer"
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez cette chambre..."
                  rows={4}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>
            </div>
          </AdminCard>

          {/* Capacity & Beds */}
          <AdminCard padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-violet-500" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Capacité & Literie</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Capacité max
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.maxGuests}
                  onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Adultes max
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxAdults}
                  onChange={(e) => setFormData({ ...formData, maxAdults: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Enfants max
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.maxChildren}
                  onChange={(e) => setFormData({ ...formData, maxChildren: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Nombre de lits
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.bedCount}
                  onChange={(e) => setFormData({ ...formData, bedCount: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Type de lit
                </label>
                <select
                  value={formData.bedType}
                  onChange={(e) => setFormData({ ...formData, bedType: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                >
                  {bedTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Surface (m²)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.sizeSqm}
                    onChange={(e) => setFormData({ ...formData, sizeSqm: e.target.value })}
                    placeholder="25"
                    className="w-full px-4 py-2.5 pr-10 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                  />
                  <Maximize className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
          </AdminCard>

          {/* Room Details */}
          <AdminCard padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <Bed className="w-5 h-5 text-violet-500" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Détails de la chambre</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Numéro de chambre
                </label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  placeholder="101"
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Étage
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.floorNumber}
                  onChange={(e) => setFormData({ ...formData, floorNumber: e.target.value })}
                  placeholder="1"
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <AdminCheckbox
                checked={formData.hasBalcony}
                onChange={(e) => setFormData({ ...formData, hasBalcony: e.target.checked })}
                label="Balcon"
              />
              <AdminCheckbox
                checked={formData.hasSeaView}
                onChange={(e) => setFormData({ ...formData, hasSeaView: e.target.checked })}
                label="Vue mer"
              />
              <AdminCheckbox
                checked={formData.hasMountainView}
                onChange={(e) => setFormData({ ...formData, hasMountainView: e.target.checked })}
                label="Vue montagne"
              />
              <AdminCheckbox
                checked={formData.isSmoking}
                onChange={(e) => setFormData({ ...formData, isSmoking: e.target.checked })}
                label="Fumeur"
              />
              <AdminCheckbox
                checked={formData.isPetFriendly}
                onChange={(e) => setFormData({ ...formData, isPetFriendly: e.target.checked })}
                label="Animaux acceptés"
              />
            </div>
          </AdminCard>

          {/* Amenities */}
          {amenities.length > 0 && (
            <AdminCard padding="lg">
              <div className="flex items-center gap-2 mb-4">
                <Wifi className="w-5 h-5 text-violet-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Équipements</h2>
              </div>
              <div className="space-y-4">
                {Object.entries(groupedAmenities).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 capitalize">
                      {category.toLowerCase()}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {items.map((amenity) => {
                        const isSelected = formData.selectedAmenities.includes(amenity.id)
                        return (
                          <button
                            key={amenity.id}
                            type="button"
                            onClick={() => toggleAmenity(amenity.id)}
                            className={`
                              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                              ${isSelected
                                ? 'bg-violet-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                              }
                            `}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                            {amenity.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
          )}

          {/* Media */}
          <AdminCard padding="lg">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Photos</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Photos de la chambre
                </label>
                <ImageUpload
                  value={formData.images}
                  onChange={handleImagesChange}
                  maxImages={10}
                  storeId={storeId || undefined}
                />
                <p className="mt-2 text-xs text-slate-500">
                  La première image sera utilisée comme photo principale
                </p>
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <AdminCard padding="lg">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Tarification</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Prix par nuit *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    required
                    className="w-full px-4 py-2.5 pr-8 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Prix barré (optionnel)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 pr-8 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                </div>
              </div>
            </div>
          </AdminCard>

          {/* Status */}
          <AdminCard padding="lg">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Statut</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Visibilité
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                >
                  <option value={ProductStatus.DRAFT}>Brouillon</option>
                  <option value={ProductStatus.ACTIVE}>Active</option>
                  <option value={ProductStatus.ARCHIVED}>Archivée</option>
                </select>
              </div>
              <AdminCheckbox
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                label="Chambre mise en avant"
              />
            </div>
          </AdminCard>

          {/* Room Type */}
          <AdminCard padding="lg">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Type de chambre</h2>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
            >
              <option value="">Sans type</option>
              {categoriesData?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <Link href={`${basePath}/room-types`} className="block mt-2">
              <span className="text-sm text-violet-500 hover:text-violet-600 dark:text-violet-400 dark:hover:text-violet-300">
                + Gérer les types de chambre
              </span>
            </Link>
          </AdminCard>

          {/* Actions */}
          <AdminCard padding="lg">
            <AdminButton
              type="submit"
              className="w-full"
              disabled={createProduct.isPending}
              icon={createProduct.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            >
              {createProduct.isPending ? 'Création...' : 'Créer la chambre'}
            </AdminButton>
          </AdminCard>
        </div>
      </form>
    </div>
  )
}
