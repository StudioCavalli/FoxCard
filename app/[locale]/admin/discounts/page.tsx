'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { formatPrice, formatDate } from '@/lib/utils'
import { Plus, Edit, Trash2, Percent, DollarSign, Calendar, Users } from 'lucide-react'

export default function AdminDiscountsPage() {
  const DEMO_STORE_ID = '000000000000000000000001'
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    value: '',
    usageLimit: '',
    minOrderAmount: '',
    startsAt: '',
    expiresAt: '',
    isActive: true,
  })

  const { data: discounts, refetch } = trpc.discount.getAll.useQuery({
    storeId: DEMO_STORE_ID,
  })

  const createDiscount = trpc.discount.create.useMutation({
    onSuccess: () => {
      refetch()
      setIsCreating(false)
      resetForm()
    },
  })

  const updateDiscount = trpc.discount.update.useMutation({
    onSuccess: () => {
      refetch()
      setEditingId(null)
      resetForm()
    },
  })

  const deleteDiscount = trpc.discount.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      type: 'PERCENTAGE',
      value: '',
      usageLimit: '',
      minOrderAmount: '',
      startsAt: '',
      expiresAt: '',
      isActive: true,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      storeId: DEMO_STORE_ID,
      code: formData.code.toUpperCase(),
      description: formData.description || undefined,
      type: formData.type,
      value: parseFloat(formData.value),
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
      minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : undefined,
      startsAt: formData.startsAt ? new Date(formData.startsAt) : undefined,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
      isActive: formData.isActive,
    }

    if (editingId) {
      updateDiscount.mutate({ id: editingId, ...data })
    } else {
      createDiscount.mutate(data)
    }
  }

  const startEdit = (discount: any) => {
    setEditingId(discount.id)
    setFormData({
      code: discount.code,
      description: discount.description || '',
      type: discount.type,
      value: discount.value.toString(),
      usageLimit: discount.usageLimit?.toString() || '',
      minOrderAmount: discount.minOrderAmount?.toString() || '',
      startsAt: discount.startsAt ? new Date(discount.startsAt).toISOString().slice(0, 16) : '',
      expiresAt: discount.expiresAt ? new Date(discount.expiresAt).toISOString().slice(0, 16) : '',
      isActive: discount.isActive,
    })
    setIsCreating(true)
  }

  const cancelForm = () => {
    setIsCreating(false)
    setEditingId(null)
    resetForm()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Codes Promo</h1>
          <p className="text-gray-600">Gerez vos codes de reduction</p>
        </div>
        {!isCreating && (
          <Button variant="primary" size="lg" onClick={() => setIsCreating(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Nouveau Code Promo
          </Button>
        )}
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingId ? 'Modifier le code promo' : 'Nouveau code promo'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Code *"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="PROMO2024"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de reduction *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 outline-none transition-all"
                >
                  <option value="PERCENTAGE">Pourcentage (%)</option>
                  <option value="FIXED">Montant fixe (€)</option>
                </select>
              </div>
            </div>

            <Input
              label={`Valeur * ${formData.type === 'PERCENTAGE' ? '(%)' : '(€)'}`}
              type="number"
              step="0.01"
              required
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder={formData.type === 'PERCENTAGE' ? '10' : '5.00'}
            />

            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Reduction speciale"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Limite d'utilisation"
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                placeholder="100"
                helperText="Nombre maximum d'utilisations"
              />

              <Input
                label="Montant minimum (€)"
                type="number"
                step="0.01"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                placeholder="50.00"
                helperText="Montant minimum de commande"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date de debut"
                type="datetime-local"
                value={formData.startsAt}
                onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
              />

              <Input
                label="Date d'expiration"
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Code actif
              </label>
            </div>

            <div className="flex items-center gap-4">
              <Button
                type="submit"
                variant="primary"
                isLoading={createDiscount.isPending || updateDiscount.isPending}
              >
                {editingId ? 'Mettre a jour' : 'Creer'}
              </Button>
              <Button type="button" variant="outline" onClick={cancelForm}>
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Discounts List */}
      <div className="grid grid-cols-1 gap-4">
        {discounts?.map((discount) => (
          <Card key={discount.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    discount.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {discount.code}
                  </div>
                  {discount.type === 'PERCENTAGE' ? (
                    <div className="flex items-center gap-1 text-primary-600">
                      <Percent className="w-4 h-4" />
                      <span className="font-semibold">{discount.value}%</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-primary-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold">{formatPrice(discount.value)}</span>
                    </div>
                  )}
                </div>

                {discount.description && (
                  <p className="text-gray-600 text-sm mb-3">{discount.description}</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {discount.usageLimit && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{discount.usageCount} / {discount.usageLimit} utilisations</span>
                    </div>
                  )}

                  {discount.minOrderAmount && (
                    <div className="text-gray-600">
                      Min: {formatPrice(discount.minOrderAmount)}
                    </div>
                  )}

                  {discount.expiresAt && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Expire: {formatDate(discount.expiresAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button variant="ghost" size="sm" onClick={() => startEdit(discount)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm('Etes-vous sur de vouloir supprimer ce code promo ?')) {
                      deleteDiscount.mutate({ id: discount.id })
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {discounts?.length === 0 && !isCreating && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Percent className="w-8 h-8 text-primary-600" />
          </div>
          <p className="text-gray-600 mb-4">Aucun code promo cree</p>
          <Button variant="primary" onClick={() => setIsCreating(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Creer votre premier code promo
          </Button>
        </Card>
      )}
    </div>
  )
}
