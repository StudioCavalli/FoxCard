'use client'

import { useState } from 'react'
import { useStoreContext } from '@/lib/context/store-context'
import { trpc } from '@/lib/trpc/client'
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Package,
  DollarSign,
  Star,
  Map,
  Scissors,
  BarChart3,
  History,
  AlertTriangle,
} from 'lucide-react'

type RuleType = 'DISTANCE' | 'STOCK_LEVEL' | 'COST' | 'PRIORITY' | 'ZONE' | 'SPLIT_ALLOWED'

export default function AllocationPage() {
  const { storeId } = useStoreContext()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRule, setEditingRule] = useState<any>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'DISTANCE' as RuleType,
    priority: 0,
    config: { weight: 1 },
    isActive: true,
  })

  const utils = trpc.useUtils()

  // Queries
  const { data: rules, isLoading } = trpc.allocation.listRules.useQuery(
    { storeId: storeId || '' },
    { enabled: !!storeId }
  )

  const { data: stats } = trpc.allocation.getStats.useQuery(
    { storeId: storeId || '' },
    { enabled: !!storeId }
  )

  const { data: history } = trpc.allocation.getHistory.useQuery(
    { storeId: storeId || '', limit: 20 },
    { enabled: !!storeId }
  )

  // Mutations
  const createRule = trpc.allocation.createRule.useMutation({
    onSuccess: () => {
      utils.allocation.listRules.invalidate()
      setShowCreateModal(false)
      resetForm()
    },
  })

  const updateRule = trpc.allocation.updateRule.useMutation({
    onSuccess: () => {
      utils.allocation.listRules.invalidate()
      setEditingRule(null)
      resetForm()
    },
  })

  const deleteRule = trpc.allocation.deleteRule.useMutation({
    onSuccess: () => {
      utils.allocation.listRules.invalidate()
    },
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'DISTANCE',
      priority: 0,
      config: { weight: 1 },
      isActive: true,
    })
  }

  const handleCreate = () => {
    if (!storeId) return
    createRule.mutate({
      storeId: storeId!,
      ...formData,
    })
  }

  const handleUpdate = () => {
    if (!storeId || !editingRule) return
    updateRule.mutate({
      ruleId: editingRule.id,
      storeId: storeId!,
      ...formData,
    })
  }

  const handleEdit = (rule: any) => {
    setEditingRule(rule)
    setFormData({
      name: rule.name,
      description: rule.description || '',
      type: rule.type,
      priority: rule.priority,
      config: rule.config || { weight: 1 },
      isActive: rule.isActive,
    })
  }

  const getRuleIcon = (type: RuleType) => {
    switch (type) {
      case 'DISTANCE':
        return <MapPin className="w-5 h-5" />
      case 'STOCK_LEVEL':
        return <Package className="w-5 h-5" />
      case 'COST':
        return <DollarSign className="w-5 h-5" />
      case 'PRIORITY':
        return <Star className="w-5 h-5" />
      case 'ZONE':
        return <Map className="w-5 h-5" />
      case 'SPLIT_ALLOWED':
        return <Scissors className="w-5 h-5" />
      default:
        return <Settings className="w-5 h-5" />
    }
  }

  const getRuleLabel = (type: RuleType) => {
    switch (type) {
      case 'DISTANCE':
        return 'Distance'
      case 'STOCK_LEVEL':
        return 'Niveau de stock'
      case 'COST':
        return 'Coût'
      case 'PRIORITY':
        return 'Priorité entrepôt'
      case 'ZONE':
        return 'Zone géographique'
      case 'SPLIT_ALLOWED':
        return 'Split autorisé'
      default:
        return type
    }
  }

  if (!storeId) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Veuillez sélectionner une boutique</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Allocation intelligente</h1>
          <p className="text-gray-500">
            Configurez les règles pour allouer automatiquement les commandes aux entrepôts
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          Nouvelle règle
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Allocations totales</p>
                <p className="text-2xl font-bold">{stats.totalDecisions}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Scissors className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Taux de split</p>
                <p className="text-2xl font-bold">{stats.splitRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Distance moyenne</p>
                <p className="text-2xl font-bold">{stats.avgDistance.toFixed(0)} km</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Taux d'override</p>
                <p className="text-2xl font-bold">{stats.overrideRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rules */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Règles d'allocation</h2>
            <p className="text-sm text-gray-500">Les règles sont appliquées par priorité décroissante</p>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Chargement...</div>
          ) : rules && rules.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {rules.map((rule) => (
                <div key={rule.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          rule.isActive ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {getRuleIcon(rule.type as RuleType)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{rule.name}</h3>
                        <p className="text-sm text-gray-500">
                          {getRuleLabel(rule.type as RuleType)} • Priorité: {rule.priority}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(rule)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Supprimer cette règle ?')) {
                            deleteRule.mutate({ ruleId: rule.id, storeId: storeId! })
                          }
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {rule.description && (
                    <p className="mt-2 text-sm text-gray-600">{rule.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucune règle configurée</p>
              <p className="text-sm">Créez des règles pour optimiser l'allocation</p>
            </div>
          )}
        </div>

        {/* History */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5" />
              Historique des allocations
            </h2>
          </div>
          {history && history.length > 0 ? (
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {history.map((decision) => (
                <div key={decision.id} className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      Commande #{decision.orderId.slice(-6)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(decision.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-600">
                      {decision.splitCount} entrepôt{decision.splitCount > 1 ? 's' : ''}
                    </span>
                    {decision.totalDistance && (
                      <span className="text-gray-600">
                        {decision.totalDistance.toFixed(0)} km
                      </span>
                    )}
                    {decision.wasOverridden && (
                      <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                        Modifié
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucun historique</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingRule) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">
                {editingRule ? 'Modifier la règle' : 'Nouvelle règle'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Distance client"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as RuleType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="DISTANCE">Distance (proximité client)</option>
                  <option value="STOCK_LEVEL">Niveau de stock</option>
                  <option value="COST">Coût d'expédition</option>
                  <option value="PRIORITY">Priorité entrepôt</option>
                  <option value="ZONE">Zone géographique</option>
                  <option value="SPLIT_ALLOWED">Autoriser le split</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Poids</label>
                  <input
                    type="number"
                    value={formData.config.weight || 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        config: { ...formData.config, weight: parseFloat(e.target.value) || 1 },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    step="0.1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  rows={2}
                  placeholder="Description de la règle..."
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Règle active</span>
              </label>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingRule(null)
                  resetForm()
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={editingRule ? handleUpdate : handleCreate}
                disabled={!formData.name || createRule.isPending || updateRule.isPending}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {createRule.isPending || updateRule.isPending
                  ? 'Enregistrement...'
                  : editingRule
                  ? 'Modifier'
                  : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
