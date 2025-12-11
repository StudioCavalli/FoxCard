'use client'

import { useState } from 'react'
import { AdminCard, AdminCardHeader } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { trpc } from '@/lib/trpc/client'
import { Plus, Edit, Trash2, FolderTree, Package, X } from 'lucide-react'
import { generateSlug } from '@/lib/utils'
import { useStoreContext } from '@/lib/context/store-context'
import { useTranslations } from 'next-intl'

export default function MerchantCategoriesPage() {
  const { storeId } = useStoreContext()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const t = useTranslations('common')

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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('categories')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Organisez vos produits par catégorie</p>
        </div>
        {!isCreating && (
          <AdminButton onClick={() => setIsCreating(true)} icon={<Plus className="w-4 h-4" />}>
            Nouvelle Catégorie
          </AdminButton>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <AdminCard padding="md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-primary-500/20 dark:from-primary-500/30 dark:to-primary-500/30 rounded-xl flex items-center justify-center">
              <FolderTree className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Catégories</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{categories?.length || 0}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard padding="md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-green-500/20 dark:from-emerald-500/30 dark:to-green-500/30 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Produits catégorisés</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalProducts}</p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <AdminCard padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </h2>
            <button
              onClick={cancelForm}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nom *
              </label>
              <input
                type="text"
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
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="electronique"
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Description
              </label>
              <textarea
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la catégorie..."
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <AdminButton
                type="submit"
                disabled={createCategory.isPending || updateCategory.isPending}
              >
                {createCategory.isPending || updateCategory.isPending ? 'En cours...' : editingId ? 'Mettre à jour' : 'Créer'}
              </AdminButton>
              <AdminButton type="button" variant="secondary" onClick={cancelForm}>
                Annuler
              </AdminButton>
            </div>
          </form>
        </AdminCard>
      )}

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <AdminCard key={i} padding="md">
              <div className="animate-pulse">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
              </div>
            </AdminCard>
          ))}
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <AdminCard key={category.id} padding="md" hover>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate">{category.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">/{category.slug}</p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <AdminButton variant="ghost" size="sm" onClick={() => startEdit(category)}>
                    <Edit className="w-4 h-4" />
                  </AdminButton>
                  <AdminButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
                        deleteCategory.mutate({ id: category.id })
                      }
                    }}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </AdminButton>
                </div>
              </div>
              {category.description && (
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">{category.description}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Package className="w-4 h-4" />
                <span>{category._count?.products || 0} produit{(category._count?.products || 0) !== 1 ? 's' : ''}</span>
              </div>
            </AdminCard>
          ))}
        </div>
      ) : !isCreating ? (
        <AdminCard padding="lg">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderTree className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Aucune catégorie</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Créez des catégories pour organiser vos produits</p>
            <AdminButton onClick={() => setIsCreating(true)} icon={<Plus className="w-4 h-4" />}>
              Créer une catégorie
            </AdminButton>
          </div>
        </AdminCard>
      ) : null}
    </div>
  )
}
