'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import { generateSlug } from '@/lib/utils'
import {
  Plus,
  Edit,
  Trash2,
  Bed,
  Save,
  X,
  Loader2,
  Package
} from 'lucide-react'

export default function RoomTypesPage() {
  const t = useTranslations('merchant.hotel.roomTypes')
  const { storeId } = useStoreContext()
  const params = useParams()
  const locale = params?.locale || 'fr'
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  // Use Categories - room types are categories for HOTEL stores
  const { data: categories, isLoading, refetch } = trpc.category.getAll.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  )

  const createCategory = trpc.category.create.useMutation({
    onSuccess: () => {
      refetch()
      setIsCreating(false)
      resetForm()
    },
  })

  const updateCategory = trpc.category.update.useMutation({
    onSuccess: () => {
      refetch()
      setEditingId(null)
      resetForm()
    },
  })

  const deleteCategory = trpc.category.delete.useMutation({
    onSuccess: () => refetch(),
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeId || !formData.name) return

    if (editingId) {
      await updateCategory.mutateAsync({
        id: editingId,
        name: formData.name,
        description: formData.description || undefined,
      })
    } else {
      await createCategory.mutateAsync({
        storeId,
        name: formData.name,
        slug: generateSlug(formData.name),
        description: formData.description || undefined,
      })
    }
  }

  const startEdit = (category: any) => {
    setEditingId(category.id)
    setIsCreating(false)
    setFormData({
      name: category.name,
      description: category.description || '',
    })
  }

  // Get product count per category
  const { data: productsData } = trpc.product.getAll.useQuery(
    { storeId: storeId!, limit: 500 },
    { enabled: !!storeId }
  )

  const getProductCount = (categoryId: string) => {
    return productsData?.products?.filter(p => p.categoryId === categoryId).length || 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Organisez vos chambres par type (Standard, Suite, Deluxe...)</p>
        </div>
        {!isCreating && !editingId && (
          <AdminButton icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreating(true)}>
            {t('create')}
          </AdminButton>
        )}
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <AdminCard padding="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {editingId ? 'Modifier le type' : t('create')}
              </h3>
              <AdminButton
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => {
                  setIsCreating(false)
                  setEditingId(null)
                  resetForm()
                }}
              >
                <X className="w-4 h-4" />
              </AdminButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('name')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Standard, Deluxe, Suite..."
                  required
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description optionnelle..."
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <AdminButton
                variant="secondary"
                type="button"
                onClick={() => {
                  setIsCreating(false)
                  setEditingId(null)
                  resetForm()
                }}
              >
                Annuler
              </AdminButton>
              <AdminButton type="submit" icon={<Save className="w-4 h-4" />}>
                {editingId ? 'Enregistrer' : 'Créer'}
              </AdminButton>
            </div>
          </form>
        </AdminCard>
      )}

      {/* Room Types List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : !categories || categories.length === 0 ? (
        <AdminCard padding="lg">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bed className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Aucun type de chambre</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Créez des catégories pour organiser vos chambres (Standard, Suite, etc.)</p>
            <AdminButton icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreating(true)}>
              {t('create')}
            </AdminButton>
          </div>
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category: any) => {
            const productCount = getProductCount(category.id)
            return (
              <AdminCard key={category.id} padding="md" hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-primary-500/20 dark:from-primary-500/30 dark:to-primary-500/30 rounded-xl flex items-center justify-center">
                      <Bed className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">{category.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <AdminButton variant="ghost" size="sm" onClick={() => startEdit(category)}>
                      <Edit className="w-4 h-4" />
                    </AdminButton>
                    <AdminButton
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                      onClick={() => {
                        if (confirm('Supprimer ce type ?')) {
                          deleteCategory.mutate({ id: category.id })
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </AdminButton>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Package className="w-4 h-4 text-slate-400" />
                  <span>{productCount} chambre{productCount > 1 ? 's' : ''}</span>
                </div>
              </AdminCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
