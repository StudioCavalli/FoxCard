'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { Plus, Edit, Trash2, FolderTree, Package } from 'lucide-react'
import { generateSlug } from '@/lib/utils'
import { useStoreContext } from '@/lib/context/store-context'

export default function MerchantCategoriesPage() {
  const { storeId } = useStoreContext()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  })

  const { data: categories, refetch, isLoading } = trpc.category.getAll.useQuery(
    {
      storeId: storeId!,
    },
    {
      enabled: !!storeId,
    }
  )

  const createCategory = trpc.category.create.useMutation({
    onSuccess: () => {
      refetch()
      setIsCreating(false)
      setFormData({ name: '', slug: '', description: '' })
    },
  })

  const updateCategory = trpc.category.update.useMutation({
    onSuccess: () => {
      refetch()
      setEditingId(null)
      setFormData({ name: '', slug: '', description: '' })
    },
  })

  const deleteCategory = trpc.category.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingId) {
      updateCategory.mutate({
        id: editingId,
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description || undefined,
      })
    } else {
      createCategory.mutate({
        storeId: storeId!,
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description || undefined,
      })
    }
  }

  const startEdit = (category: any) => {
    setEditingId(category.id)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    })
    setIsCreating(true)
  }

  const cancelForm = () => {
    setIsCreating(false)
    setEditingId(null)
    setFormData({ name: '', slug: '', description: '' })
  }

  const totalProducts = categories?.reduce((sum, cat) => sum + (cat._count?.products || 0), 0) || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
          <p className="text-gray-500 mt-1">Organisez vos produits par catégorie</p>
        </div>
        {!isCreating && (
          <Button variant="primary" onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Catégorie
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <FolderTree className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Catégories</p>
              <p className="text-2xl font-bold text-gray-900">{categories?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Produits catégorisés</p>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nom *"
              required
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value
                setFormData({
                  ...formData,
                  name,
                  slug: !editingId ? generateSlug(name) : formData.slug
                })
              }}
              placeholder="Ex: Électronique, Vêtements..."
            />

            <Input
              label="Slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="electronique"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 outline-none transition-all resize-none"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la catégorie..."
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                isLoading={createCategory.isPending || updateCategory.isPending}
              >
                {editingId ? 'Mettre à jour' : 'Créer'}
              </Button>
              <Button type="button" variant="outline" onClick={cancelForm}>
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{category.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">/{category.slug}</p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(category)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
                        deleteCategory.mutate({ id: category.id })
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
              {category.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{category.description}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Package className="w-4 h-4" />
                <span>{category._count?.products || 0} produit{(category._count?.products || 0) !== 1 ? 's' : ''}</span>
              </div>
            </div>
          ))}
        </div>
      ) : !isCreating ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FolderTree className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune catégorie</h3>
          <p className="text-gray-500 mb-4">Créez des catégories pour organiser vos produits</p>
          <Button variant="primary" onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Créer une catégorie
          </Button>
        </div>
      ) : null}
    </div>
  )
}
