import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { generateSlug } from '@/lib/utils'

interface CategoryFormData {
  name: string
  slug: string
  description: string
}

const emptyForm: CategoryFormData = { name: '', slug: '', description: '' }

export function useCategoriesCRUD(storeId: string | null) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>(emptyForm)

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
      setFormData(emptyForm)
    },
  })

  const updateCategory = trpc.category.update.useMutation({
    onSuccess: () => {
      refetch()
      setEditingId(null)
      setFormData(emptyForm)
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

  const startEdit = (category: { id: string; name: string; slug: string; description?: string | null }) => {
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
    setFormData(emptyForm)
  }

  const handleDelete = (categoryId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      deleteCategory.mutate({ id: categoryId })
    }
  }

  return {
    categories,
    isLoading,
    // Form state
    isCreating,
    setIsCreating,
    editingId,
    formData,
    setFormData,
    // Mutations
    createCategory,
    updateCategory,
    deleteCategory,
    // Handlers
    handleSubmit,
    startEdit,
    cancelForm,
    handleDelete,
  }
}
