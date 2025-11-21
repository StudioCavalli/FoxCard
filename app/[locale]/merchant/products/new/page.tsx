'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import { ProductStatus, ProductType } from '@prisma/client'
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  X,
  Plus,
  Loader2,
  Info,
} from 'lucide-react'
import { useStoreCommerceType } from '@/lib/commerce-types/hooks'
import { CommerceTypeFields } from '@/components/merchant/product-form/CommerceTypeFields'
import { commerceTypeConfigs, type CommerceType } from '@/lib/commerce-types'

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export default function NewProductPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale || 'fr'
  const basePath = `/${locale}/merchant`
  const { storeId } = useStoreContext()
  const { type: commerceType, config: commerceConfig } = useStoreCommerceType(storeId || undefined)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    compareAtPrice: '',
    cost: '',
    type: ProductType.SIMPLE as ProductType,
    sku: '',
    barcode: '',
    trackInventory: true,
    quantity: '0',
    lowStockThreshold: '5',
    images: [] as string[],
    thumbnail: '',
    metaTitle: '',
    metaDescription: '',
    tags: [] as string[],
    status: ProductStatus.DRAFT as ProductStatus,
    featured: false,
    categoryId: '',
    commerceAttributes: {} as Record<string, unknown>,
  })
  const [tagInput, setTagInput] = useState('')
  const [imageInput, setImageInput] = useState('')
  const [error, setError] = useState('')

  const { data: categoriesData } = trpc.category.getAll.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  )

  const createProduct = trpc.product.create.useMutation({
    onSuccess: () => {
      router.push(`${basePath}/products`)
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

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    })
  }

  const handleAddImage = () => {
    if (imageInput.trim() && !formData.images.includes(imageInput.trim())) {
      setFormData({
        ...formData,
        images: [...formData.images, imageInput.trim()],
      })
      setImageInput('')
    }
  }

  const handleRemoveImage = (image: string) => {
    setFormData({
      ...formData,
      images: formData.images.filter(i => i !== image),
    })
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
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      type: formData.type,
      sku: formData.sku || undefined,
      barcode: formData.barcode || undefined,
      trackInventory: formData.trackInventory,
      quantity: parseInt(formData.quantity) || 0,
      lowStockThreshold: parseInt(formData.lowStockThreshold) || undefined,
      images: formData.images,
      thumbnail: formData.thumbnail || undefined,
      metaTitle: formData.metaTitle || undefined,
      metaDescription: formData.metaDescription || undefined,
      tags: formData.tags,
      status: formData.status,
      featured: formData.featured,
      categoryId: formData.categoryId || undefined,
      attributes: Object.keys(formData.commerceAttributes).length > 0 ? formData.commerceAttributes : undefined,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`${basePath}/products`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouveau produit</h1>
          <p className="text-gray-500 mt-1">Ajoutez un produit à votre catalogue</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du produit *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: T-shirt Premium"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL)
                </label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="t-shirt-premium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez votre produit..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Commerce Type Specific Fields */}
          {commerceType && commerceType !== 'GENERAL' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Attributs {commerceConfig?.name || commerceType}
                </h2>
                <span className="text-xl">{commerceConfig?.emoji}</span>
              </div>
              {commerceConfig?.description && (
                <p className="text-sm text-gray-500 mb-4 flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {commerceConfig.description}
                </p>
              )}
              <CommerceTypeFields
                commerceType={commerceType}
                attributes={formData.commerceAttributes}
                onChange={(attrs) => setFormData({ ...formData, commerceAttributes: attrs })}
              />
            </div>
          )}

          {/* Media */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image principale (URL)
                </label>
                <Input
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Galerie d'images
                </label>
                <div className="flex gap-2">
                  <Input
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    placeholder="URL de l'image"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddImage}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.images.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.images.map((image, idx) => (
                      <div key={idx} className="relative group">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                          <img src={image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(image)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tarification</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix de vente *
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="pr-8"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix barré
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                    placeholder="0.00"
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coût d'achat
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="0.00"
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                </div>
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventaire</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="SKU-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code-barres
                  </label>
                  <Input
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="123456789"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="trackInventory"
                  checked={formData.trackInventory}
                  onChange={(e) => setFormData({ ...formData, trackInventory: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="trackInventory" className="text-sm text-gray-700">
                  Suivre l'inventaire
                </label>
              </div>
              {formData.trackInventory && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantité en stock
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Seuil d'alerte stock faible
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.lowStockThreshold}
                      onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre SEO
                </label>
                <Input
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  placeholder="Titre pour les moteurs de recherche"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description SEO
                </label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder="Description pour les moteurs de recherche"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Statut</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibilité
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value={ProductStatus.DRAFT}>Brouillon</option>
                  <option value={ProductStatus.ACTIVE}>Actif</option>
                  <option value={ProductStatus.ARCHIVED}>Archivé</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="featured" className="text-sm text-gray-700">
                  Produit mis en avant
                </label>
              </div>
            </div>
          </div>

          {/* Type */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Type de produit</h2>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ProductType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={ProductType.SIMPLE}>Simple</option>
              <option value={ProductType.VARIABLE}>Variable</option>
              <option value={ProductType.DIGITAL}>Digital</option>
            </select>
          </div>

          {/* Category */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Catégorie</h2>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Sans catégorie</option>
              {categoriesData?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Ajouter un tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={createProduct.isPending}
            >
              {createProduct.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Créer le produit
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
