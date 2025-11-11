'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { trpc } from '@/lib/trpc/client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const DEMO_STORE_ID = '000000000000000000000001'

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    compareAtPrice: '',
    sku: '',
    quantity: '',
    images: [] as string[],
    categoryId: '',
    status: 'ACTIVE' as const,
  })

  const { data: product, isLoading } = trpc.product.getById.useQuery({ id })
  const { data: categories } = trpc.category.getAll.useQuery({
    storeId: DEMO_STORE_ID,
  })

  const updateProduct = trpc.product.update.useMutation({
    onSuccess: () => {
      router.push('/admin/products')
    },
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        price: product.price.toString(),
        compareAtPrice: product.compareAtPrice?.toString() || '',
        sku: product.sku || '',
        quantity: product.quantity.toString(),
        images: product.images,
        categoryId: product.categoryId || '',
        status: product.status,
      })
    }
  }, [product])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    updateProduct.mutate({
      id,
      name: formData.name,
      slug: formData.slug,
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
      sku: formData.sku || undefined,
      quantity: parseInt(formData.quantity),
      images: formData.images,
      status: formData.status,
      categoryId: formData.categoryId || undefined,
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <Card className="p-6 space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </Card>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Produit introuvable</p>
      </div>
    )
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
          <h1 className="text-3xl font-bold text-gray-900">Modifier le produit</h1>
          <p className="text-gray-600">{product.name}</p>
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
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Input
            label="Slug (URL)"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 outline-none transition-all"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="ACTIVE">Actif</option>
              <option value="DRAFT">Brouillon</option>
              <option value="ARCHIVED">Archivé</option>
            </select>
          </div>
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
            Ajoutez ou modifiez les images du produit (maximum 5)
          </p>

          <ImageUpload
            value={formData.images}
            onChange={(urls) => setFormData({ ...formData, images: urls })}
            maxImages={5}
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
            isLoading={updateProduct.isPending}
          >
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </div>
  )
}
