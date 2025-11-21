'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import {
  Percent,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  X,
  Calendar,
  Tag,
  TrendingUp,
  Copy,
  Check
} from 'lucide-react'

export default function MerchantDiscountsPage() {
  const params = useParams()
  const locale = params?.locale || 'fr'
  const { storeId } = useStoreContext()

  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<any>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

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

  const { data: discounts, isLoading, refetch } = trpc.discount.getAll.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  )

  const createDiscount = trpc.discount.create.useMutation({
    onSuccess: () => {
      refetch()
      resetForm()
      setShowModal(false)
    },
  })

  const updateDiscount = trpc.discount.update.useMutation({
    onSuccess: () => {
      refetch()
      resetForm()
      setShowModal(false)
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
    setEditingDiscount(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      storeId: storeId!,
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

    if (editingDiscount) {
      updateDiscount.mutate({ id: editingDiscount.id, ...data })
    } else {
      createDiscount.mutate(data)
    }
  }

  const handleEdit = (discount: any) => {
    setEditingDiscount(discount)
    setFormData({
      code: discount.code,
      description: discount.description || '',
      type: discount.type,
      value: discount.value.toString(),
      usageLimit: discount.usageLimit?.toString() || '',
      minOrderAmount: discount.minOrderAmount?.toString() || '',
      startsAt: discount.startsAt ? new Date(discount.startsAt).toISOString().split('T')[0] : '',
      expiresAt: discount.expiresAt ? new Date(discount.expiresAt).toISOString().split('T')[0] : '',
      isActive: discount.isActive,
    })
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Supprimer ce code promo ?')) {
      deleteDiscount.mutate({ id })
    }
  }

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredDiscounts = discounts?.filter(d =>
    d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isExpired = (date: Date | null) => date && new Date(date) < new Date()
  const isUpcoming = (date: Date | null) => date && new Date(date) > new Date()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Codes promo</h1>
          <p className="text-gray-500 mt-1">Gérez vos promotions et codes de réduction</p>
        </div>
        <Button variant="primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau code
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total codes</p>
              <p className="text-xl font-bold text-gray-900">{discounts?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Codes actifs</p>
              <p className="text-xl font-bold text-gray-900">
                {discounts?.filter(d => d.isActive && !isExpired(d.expiresAt)).length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Utilisations totales</p>
              <p className="text-xl font-bold text-gray-900">
                {discounts?.reduce((sum, d) => sum + d.usageCount, 0) || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Rechercher un code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Discounts List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filteredDiscounts && filteredDiscounts.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Code</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Réduction</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Utilisations</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Validité</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Statut</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDiscounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono font-medium">
                          {discount.code}
                        </code>
                        <button
                          onClick={() => copyCode(discount.code, discount.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {copiedId === discount.id ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {discount.description && (
                        <p className="text-sm text-gray-500 mt-1">{discount.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-gray-900">
                        {discount.type === 'PERCENTAGE'
                          ? `${discount.value}%`
                          : `${discount.value} €`}
                      </span>
                      {discount.minOrderAmount && (
                        <p className="text-xs text-gray-500">
                          Min. {discount.minOrderAmount} €
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-900">{discount.usageCount}</span>
                      {discount.usageLimit && (
                        <span className="text-gray-400"> / {discount.usageLimit}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {discount.startsAt || discount.expiresAt ? (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {discount.startsAt && new Date(discount.startsAt).toLocaleDateString('fr-FR')}
                            {discount.startsAt && discount.expiresAt && ' - '}
                            {discount.expiresAt && new Date(discount.expiresAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Illimité</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {!discount.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Inactif
                        </span>
                      ) : isExpired(discount.expiresAt) ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          Expiré
                        </span>
                      ) : isUpcoming(discount.startsAt) ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                          À venir
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Actif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(discount)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(discount.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Percent className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun code promo</h3>
          <p className="text-gray-500 mb-4">Créez votre premier code de réduction</p>
          <Button variant="primary" onClick={() => { resetForm(); setShowModal(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Créer un code
          </Button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingDiscount ? 'Modifier le code' : 'Nouveau code promo'}
              </h2>
              <button
                onClick={() => { resetForm(); setShowModal(false); }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code *
                </label>
                <Input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="ex: PROMO20"
                  required
                  className="uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="ex: 20% de réduction pour les nouveaux clients"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'PERCENTAGE' | 'FIXED' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="PERCENTAGE">Pourcentage (%)</option>
                    <option value="FIXED">Montant fixe (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valeur *
                  </label>
                  <Input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={formData.type === 'PERCENTAGE' ? 'ex: 20' : 'ex: 10'}
                    min="0"
                    step={formData.type === 'PERCENTAGE' ? '1' : '0.01'}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Limite d'utilisation
                  </label>
                  <Input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="Illimité"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Montant minimum
                  </label>
                  <Input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    placeholder="Aucun"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de début
                  </label>
                  <Input
                    type="date"
                    value={formData.startsAt}
                    onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'expiration
                  </label>
                  <Input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <div>
                  <p className="font-medium text-gray-900">Code actif</p>
                  <p className="text-sm text-gray-500">Les clients peuvent utiliser ce code</p>
                </div>
              </label>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { resetForm(); setShowModal(false); }}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={createDiscount.isPending || updateDiscount.isPending}
                  className="flex-1"
                >
                  {(createDiscount.isPending || updateDiscount.isPending) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingDiscount ? (
                    'Mettre à jour'
                  ) : (
                    'Créer le code'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
