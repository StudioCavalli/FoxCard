'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { generateSlug } from '@/lib/utils'

export default function AdminCategoriesPage() {
  const DEMO_STORE_ID = '000000000000000000000001'
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  })

  const { data: categories, refetch } = trpc.category.getAll.useQuery({
    storeId: DEMO_STORE_ID,
  })

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
        storeId: DEMO_STORE_ID,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catégories</h1>
          <p className="text-gray-600">Organisez vos produits par catégorie</p>
        </div>
        {!isCreating && (
          <Button variant="primary" size="lg" onClick={() => setIsCreating(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle Catégorie
          </Button>
        )}
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nom *"
              required
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                if (!formData.slug && !editingId) {
                  setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })
                }
              }}
            />

            <Input
              label="Slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 outline-none transition-all"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-4">
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
        </Card>
      )}

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories?.map((category) => (
          <Card key={category.id} className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">{category.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{category.slug}</p>
              </div>
              <div className="flex items-center gap-2">
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
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
            {category.description && (
              <p className="text-sm text-gray-600 mb-3">{category.description}</p>
            )}
            <div className="text-sm text-gray-500">
              {category._count?.products || 0} produit{category._count?.products !== 1 ? 's' : ''}
            </div>
          </Card>
        ))}
      </div>

      {categories?.length === 0 && !isCreating && (
        <Card className="p-12 text-center">
          <p className="text-gray-600 mb-4">Aucune catégorie créée</p>
          <Button variant="primary" onClick={() => setIsCreating(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Créer votre première catégorie
          </Button>
        </Card>
      )}
    </div>
  )
}
