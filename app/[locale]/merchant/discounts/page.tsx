'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Codes promo</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gérez vos promotions et codes de réduction</p>
        </div>
        <AdminButton onClick={() => { resetForm(); setShowModal(true); }} icon={<Plus className="w-4 h-4" />}>
          Nouveau code
        </AdminButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-primary-500/20 dark:from-primary-500/30 dark:to-primary-500/30 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total codes</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{discounts?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-green-500/20 dark:from-emerald-500/30 dark:to-green-500/30 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Codes actifs</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {discounts?.filter(d => d.isActive && !isExpired(d.expiresAt)).length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-primary-500/20 dark:from-purple-500/30 dark:to-primary-500/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Utilisations totales</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {discounts?.reduce((sum, d) => sum + d.usageCount, 0) || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <AdminCard padding="md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>
      </AdminCard>

      {/* Discounts List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : filteredDiscounts && filteredDiscounts.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">Code</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">Réduction</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">Utilisations</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">Validité</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">Statut</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredDiscounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm font-mono font-medium">
                          {discount.code}
                        </code>
                        <button
                          onClick={() => copyCode(discount.code, discount.id)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                        >
                          {copiedId === discount.id ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </div>
                      {discount.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{discount.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {discount.type === 'PERCENTAGE'
                          ? `${discount.value}%`
                          : `${discount.value} €`}
                      </span>
                      {discount.minOrderAmount && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Min. {discount.minOrderAmount} €
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-900 dark:text-white">{discount.usageCount}</span>
                      {discount.usageLimit && (
                        <span className="text-slate-400"> / {discount.usageLimit}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {discount.startsAt || discount.expiresAt ? (
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {discount.startsAt && new Date(discount.startsAt).toLocaleDateString('fr-FR')}
                            {discount.startsAt && discount.expiresAt && ' - '}
                            {discount.expiresAt && new Date(discount.expiresAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Illimité</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {!discount.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                          Inactif
                        </span>
                      ) : isExpired(discount.expiresAt) ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400">
                          Expiré
                        </span>
                      ) : isUpcoming(discount.startsAt) ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
                          À venir
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400">
                          Actif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(discount)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(discount.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
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
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <Percent className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Aucun code promo</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">Créez votre premier code de réduction</p>
          <AdminButton onClick={() => { resetForm(); setShowModal(true); }} icon={<Plus className="w-4 h-4" />}>
            Créer un code
          </AdminButton>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {editingDiscount ? 'Modifier le code' : 'Nouveau code promo'}
              </h2>
              <button
                onClick={() => { resetForm(); setShowModal(false); }}
                className="p-2 hover:bg-slate-100 dark:bg-slate-700 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="ex: PROMO20"
                  required
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all uppercase"
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
                  placeholder="ex: 20% de réduction pour les nouveaux clients"
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'PERCENTAGE' | 'FIXED' })}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  >
                    <option value="PERCENTAGE">Pourcentage (%)</option>
                    <option value="FIXED">Montant fixe (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Valeur *
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={formData.type === 'PERCENTAGE' ? 'ex: 20' : 'ex: 10'}
                    min="0"
                    step={formData.type === 'PERCENTAGE' ? '1' : '0.01'}
                    required
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Limite d'utilisation
                  </label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="Illimité"
                    min="1"
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Montant minimum
                  </label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    placeholder="Aucun"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={formData.startsAt}
                    onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date d'expiration
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded text-primary-600 border-slate-300 dark:border-slate-600 focus:ring-primary-500"
                />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Code actif</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Les clients peuvent utiliser ce code</p>
                </div>
              </label>

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <AdminButton
                  type="button"
                  variant="secondary"
                  onClick={() => { resetForm(); setShowModal(false); }}
                  className="flex-1"
                >
                  Annuler
                </AdminButton>
                <AdminButton
                  type="submit"
                  disabled={createDiscount.isPending || updateDiscount.isPending}
                  className="flex-1"
                  icon={(createDiscount.isPending || updateDiscount.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                >
                  {(createDiscount.isPending || updateDiscount.isPending) ? '' : editingDiscount ? 'Mettre à jour' : 'Créer le code'}
                </AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
