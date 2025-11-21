'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { TagInput } from '@/components/ui/TagInput'
import { VariantManager, type ProductVariant } from '@/components/products/VariantManager'
import { trpc } from '@/lib/trpc/client'
import { generateSlug } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewProductPage() {
  const router = useRouter()
  const DEMO_STORE_ID = '000000000000000000000001'

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    compareAtPrice: '',
    sku: '',
    quantity: '0',
    images: [] as string[],
    tags: [] as string[],
    categoryId: '',
  })
  const [variants, setVariants] = useState<ProductVariant[]>([])

  const { data: categories } = trpc.category.getAll.useQuery({
    storeId: DEMO_STORE_ID,
  })

  const createProduct = trpc.product.create.useMutation({
    onSuccess: () => {
      router.push('/admin/products')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    createProduct.mutate({
      storeId: DEMO_STORE_ID,
      name: formData.name,
      slug: formData.slug || generateSlug(formData.name),
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
      sku: formData.sku || undefined,
      quantity: parseInt(formData.quantity),
      images: formData.images,
      tags: formData.tags,
      type: 'SIMPLE',
      status: 'ACTIVE',
      trackInventory: true,
      featured: false,
      categoryId: formData.categoryId || undefined,
    })
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nouveau Produit</h1>
          <p className="text-gray-600">Créez un nouveau produit dans votre catalogue</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Informations Générales</h2>

          <Input
            label="Nom du produit *"
            required
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value })
              if (!formData.slug) {
                setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })
              }
            }}
          />

          <Input
            label="Slug (URL)"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="nom-du-produit"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 outline-none transition-all min-h-[120px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <select
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 outline-none transition-all"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            >
              <option value="">Aucune catégorie</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <TagInput
            value={formData.tags}
            onChange={(tags) => setFormData({ ...formData, tags })}
            placeholder="Ajouter des tags (ex: promo, nouveau, soldes...)"
          />
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Prix & Stock</h2>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Prix *"
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />

            <Input
              label="Prix comparatif"
              type="number"
              step="0.01"
              value={formData.compareAtPrice}
              onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SKU"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            />

            <Input
              label="Quantité *"
              type="number"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Images</h2>
          <p className="text-sm text-gray-600">
            Ajoutez des images pour votre produit (maximum 5)
          </p>

          <ImageUpload
            value={formData.images}
            onChange={(urls) => setFormData({ ...formData, images: urls })}
            maxImages={5}
          />
        </Card>

        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Variantes</h2>
            <p className="text-sm text-gray-600 mt-1">
              Gérez les différentes options du produit (taille, couleur, etc.)
            </p>
          </div>

          <VariantManager
            variants={variants}
            onChange={setVariants}
            basePrice={parseFloat(formData.price) || 0}
          />
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/products">
            <Button variant="outline" size="lg">
              Annuler
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={createProduct.isPending}
          >
            Créer le Produit
          </Button>
        </div>
      </form>
    </div>
  )
}
