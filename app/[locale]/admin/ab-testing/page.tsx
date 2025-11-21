'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store/use-store'
import { trpc } from '@/lib/trpc/client'
import {
  FlaskConical,
  Plus,
  Play,
  Pause,
  CheckCircle,
  Trash2,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  BarChart3,
  Clock,
  Award,
  AlertTriangle,
} from 'lucide-react'

type TestType = 'PAGE' | 'ELEMENT' | 'CHECKOUT' | 'PRICE'
type GoalType = 'CONVERSION' | 'CLICKS' | 'REVENUE' | 'ENGAGEMENT'
type TestStatus = 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED'

interface VariantInput {
  name: string
  isControl: boolean
  config: Record<string, any>
  weight: number
}

export default function ABTestingPage() {
  const { currentStore } = useStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTest, setSelectedTest] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<TestStatus | 'all'>('all')

  // Form state for new test
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'ELEMENT' as TestType,
    targetPage: 'product',
    targetElement: '',
    trafficPercent: 100,
    goalType: 'CONVERSION' as GoalType,
    goalTarget: '',
    variants: [
      { name: 'Contrôle', isControl: true, config: {}, weight: 50 },
      { name: 'Variante A', isControl: false, config: {}, weight: 50 },
    ] as VariantInput[],
  })

  const utils = trpc.useUtils()

  // Queries
  const { data: tests, isLoading } = trpc.abtest.list.useQuery(
    {
      storeId: currentStore?.id || '',
      ...(statusFilter !== 'all' && { status: statusFilter }),
    },
    { enabled: !!currentStore }
  )

  const { data: dashboard } = trpc.abtest.getDashboard.useQuery(
    { storeId: currentStore?.id || '' },
    { enabled: !!currentStore }
  )

  const { data: testDetails } = trpc.abtest.get.useQuery(
    { testId: selectedTest || '', storeId: currentStore?.id || '' },
    { enabled: !!selectedTest && !!currentStore }
  )

  // Mutations
  const createTest = trpc.abtest.create.useMutation({
    onSuccess: () => {
      utils.abtest.list.invalidate()
      utils.abtest.getDashboard.invalidate()
      setShowCreateModal(false)
      resetForm()
    },
  })

  const startTest = trpc.abtest.start.useMutation({
    onSuccess: () => {
      utils.abtest.list.invalidate()
      utils.abtest.getDashboard.invalidate()
      utils.abtest.get.invalidate()
    },
  })

  const pauseTest = trpc.abtest.pause.useMutation({
    onSuccess: () => {
      utils.abtest.list.invalidate()
      utils.abtest.getDashboard.invalidate()
      utils.abtest.get.invalidate()
    },
  })

  const completeTest = trpc.abtest.complete.useMutation({
    onSuccess: () => {
      utils.abtest.list.invalidate()
      utils.abtest.getDashboard.invalidate()
      utils.abtest.get.invalidate()
    },
  })

  const deleteTest = trpc.abtest.delete.useMutation({
    onSuccess: () => {
      utils.abtest.list.invalidate()
      utils.abtest.getDashboard.invalidate()
      setSelectedTest(null)
    },
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'ELEMENT',
      targetPage: 'product',
      targetElement: '',
      trafficPercent: 100,
      goalType: 'CONVERSION',
      goalTarget: '',
      variants: [
        { name: 'Contrôle', isControl: true, config: {}, weight: 50 },
        { name: 'Variante A', isControl: false, config: {}, weight: 50 },
      ],
    })
  }

  const handleCreateTest = () => {
    if (!currentStore) return
    createTest.mutate({
      storeId: currentStore.id,
      ...formData,
    })
  }

  const addVariant = () => {
    const newVariant: VariantInput = {
      name: `Variante ${String.fromCharCode(65 + formData.variants.length - 1)}`,
      isControl: false,
      config: {},
      weight: Math.floor(100 / (formData.variants.length + 1)),
    }
    setFormData({
      ...formData,
      variants: [...formData.variants, newVariant],
    })
  }

  const removeVariant = (index: number) => {
    if (formData.variants.length <= 2) return
    const newVariants = formData.variants.filter((_, i) => i !== index)
    setFormData({ ...formData, variants: newVariants })
  }

  const getStatusColor = (status: TestStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'RUNNING':
        return 'bg-green-100 text-green-800'
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: TestStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'Brouillon'
      case 'RUNNING':
        return 'En cours'
      case 'PAUSED':
        return 'En pause'
      case 'COMPLETED':
        return 'Terminé'
      default:
        return status
    }
  }

  if (!currentStore) {
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
          <h1 className="text-2xl font-bold text-gray-900">Tests A/B</h1>
          <p className="text-gray-500">
            Optimisez vos conversions avec des tests statistiquement significatifs
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          Nouveau test
        </button>
      </div>

      {/* Dashboard Summary */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">En cours</p>
                <p className="text-2xl font-bold">{dashboard.summary.running}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Terminés</p>
                <p className="text-2xl font-bold">{dashboard.summary.completed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Clock className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Brouillons</p>
                <p className="text-2xl font-bold">{dashboard.summary.draft}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FlaskConical className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{dashboard.summary.total}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Winners */}
      {dashboard && dashboard.recentWinners.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Gagnants récents
          </h3>
          <div className="space-y-2">
            {dashboard.recentWinners.map((winner) => (
              <div
                key={winner.testId}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <div>
                  <span className="font-medium">{winner.testName}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    Gagnant: {winner.winnerName}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-medium ${
                      winner.improvement > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {winner.improvement > 0 ? '+' : ''}
                    {winner.improvement.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500">
                    {winner.confidence.toFixed(0)}% confiance
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Filtrer par statut:</span>
            {(['all', 'RUNNING', 'DRAFT', 'PAUSED', 'COMPLETED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-sm rounded-full ${
                  statusFilter === status
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'Tous' : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : tests && tests.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {tests.map((test) => (
              <div
                key={test.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${
                  selectedTest === test.id ? 'bg-primary-50' : ''
                }`}
                onClick={() => setSelectedTest(test.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{test.name}</h3>
                    <p className="text-sm text-gray-500">
                      {test.targetPage} • {test.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                      <p className="text-gray-900">{test.totalVisitors} visiteurs</p>
                      <p className="text-gray-500">{test.totalConversions} conversions</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(test.status)}`}
                    >
                      {getStatusLabel(test.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <FlaskConical className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Aucun test trouvé</p>
            <p className="text-sm">Créez votre premier test A/B pour optimiser vos conversions</p>
          </div>
        )}
      </div>

      {/* Test Details */}
      {selectedTest && testDetails && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{testDetails.name}</h2>
              <p className="text-gray-500">{testDetails.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {testDetails.status === 'DRAFT' && (
                <button
                  onClick={() =>
                    startTest.mutate({ testId: testDetails.id, storeId: currentStore.id })
                  }
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  <Play className="w-4 h-4" />
                  Démarrer
                </button>
              )}
              {testDetails.status === 'RUNNING' && (
                <>
                  <button
                    onClick={() =>
                      pauseTest.mutate({ testId: testDetails.id, storeId: currentStore.id })
                    }
                    className="flex items-center gap-1 px-3 py-1.5 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </button>
                  <button
                    onClick={() =>
                      completeTest.mutate({ testId: testDetails.id, storeId: currentStore.id })
                    }
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Terminer
                  </button>
                </>
              )}
              {testDetails.status === 'PAUSED' && (
                <button
                  onClick={() =>
                    startTest.mutate({ testId: testDetails.id, storeId: currentStore.id })
                  }
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  <Play className="w-4 h-4" />
                  Reprendre
                </button>
              )}
              <button
                onClick={() => {
                  if (confirm('Êtes-vous sûr de vouloir supprimer ce test ?')) {
                    deleteTest.mutate({ testId: testDetails.id, storeId: currentStore.id })
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sample Size Warning */}
          {!testDetails.hasEnoughData && testDetails.status === 'RUNNING' && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Données insuffisantes. Minimum recommandé: {testDetails.minSampleSize} visiteurs
                par variante.
              </span>
            </div>
          )}

          {/* Control Stats */}
          {testDetails.controlStats && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Contrôle</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Visiteurs</p>
                    <p className="text-xl font-bold">{testDetails.controlStats.visitors}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Conversions</p>
                    <p className="text-xl font-bold">{testDetails.controlStats.conversions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Taux de conversion</p>
                    <p className="text-xl font-bold">
                      {testDetails.controlStats.conversionRate.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Variants Stats */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Variantes</h3>
            <div className="space-y-3">
              {testDetails.variantStats.map((variant) => (
                <div
                  key={variant.variantId}
                  className={`p-4 rounded-lg border ${
                    variant.isSignificant && variant.improvement > 0
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{variant.name}</span>
                      {variant.isSignificant && variant.improvement > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                          Significatif
                        </span>
                      )}
                      {testDetails.winnerVariantId === variant.variantId && (
                        <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Gagnant
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {variant.improvement > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : variant.improvement < 0 ? (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      ) : null}
                      <span
                        className={`font-medium ${
                          variant.improvement > 0
                            ? 'text-green-600'
                            : variant.improvement < 0
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {variant.improvement > 0 ? '+' : ''}
                        {variant.improvement.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Visiteurs</p>
                      <p className="font-medium">{variant.visitors}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Conversions</p>
                      <p className="font-medium">{variant.conversions}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Taux</p>
                      <p className="font-medium">{variant.conversionRate.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">p-value</p>
                      <p className="font-medium">{variant.pValue.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Confiance</p>
                      <p className="font-medium">{variant.confidence.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Créer un nouveau test A/B</h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Test Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du test
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: Test bouton CTA rouge vs bleu"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  rows={2}
                  placeholder="Objectif et hypothèse du test"
                />
              </div>

              {/* Type and Target */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de test
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as TestType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="ELEMENT">Élément</option>
                    <option value="PAGE">Page complète</option>
                    <option value="CHECKOUT">Checkout</option>
                    <option value="PRICE">Prix</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Page cible
                  </label>
                  <select
                    value={formData.targetPage}
                    onChange={(e) => setFormData({ ...formData, targetPage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="homepage">Page d'accueil</option>
                    <option value="product">Page produit</option>
                    <option value="collection">Collection</option>
                    <option value="cart">Panier</option>
                    <option value="checkout">Checkout</option>
                  </select>
                </div>
              </div>

              {/* Target Element */}
              {formData.type === 'ELEMENT' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sélecteur CSS de l'élément
                  </label>
                  <input
                    type="text"
                    value={formData.targetElement}
                    onChange={(e) => setFormData({ ...formData, targetElement: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Ex: #add-to-cart-btn, .hero-title"
                  />
                </div>
              )}

              {/* Goal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Objectif
                  </label>
                  <select
                    value={formData.goalType}
                    onChange={(e) =>
                      setFormData({ ...formData, goalType: e.target.value as GoalType })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="CONVERSION">Conversion</option>
                    <option value="CLICKS">Clics</option>
                    <option value="REVENUE">Revenu</option>
                    <option value="ENGAGEMENT">Engagement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    % du trafic
                  </label>
                  <input
                    type="number"
                    value={formData.trafficPercent}
                    onChange={(e) =>
                      setFormData({ ...formData, trafficPercent: parseInt(e.target.value) || 100 })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    min={1}
                    max={100}
                  />
                </div>
              </div>

              {/* Variants */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Variantes</label>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Ajouter une variante
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => {
                          const newVariants = [...formData.variants]
                          newVariants[index].name = e.target.value
                          setFormData({ ...formData, variants: newVariants })
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="Nom de la variante"
                      />
                      <input
                        type="number"
                        value={variant.weight}
                        onChange={(e) => {
                          const newVariants = [...formData.variants]
                          newVariants[index].weight = parseInt(e.target.value) || 50
                          setFormData({ ...formData, variants: newVariants })
                        }}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="%"
                        min={1}
                        max={100}
                      />
                      {variant.isControl ? (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          Contrôle
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateTest}
                disabled={!formData.name || createTest.isPending}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {createTest.isPending ? 'Création...' : 'Créer le test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
