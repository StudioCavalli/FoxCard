'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { Plus, Edit, Trash2, Percent, Globe, MapPin, Star } from 'lucide-react'
import { useStoreContext } from '@/lib/context/store-context'

const COMMON_COUNTRIES = [
  { code: 'FR', name: 'France', defaultRate: 20 },
  { code: 'BE', name: 'Belgique', defaultRate: 21 },
  { code: 'CH', name: 'Suisse', defaultRate: 7.7 },
  { code: 'LU', name: 'Luxembourg', defaultRate: 17 },
  { code: 'DE', name: 'Allemagne', defaultRate: 19 },
  { code: 'IT', name: 'Italie', defaultRate: 22 },
  { code: 'ES', name: 'Espagne', defaultRate: 21 },
  { code: 'PT', name: 'Portugal', defaultRate: 23 },
  { code: 'NL', name: 'Pays-Bas', defaultRate: 21 },
  { code: 'GB', name: 'Royaume-Uni', defaultRate: 20 },
  { code: 'US', name: 'États-Unis', defaultRate: 0, hasStates: true },
  { code: 'CA', name: 'Canada', defaultRate: 5, hasStates: true },
]

const US_STATES = [
  { code: 'CA', name: 'Californie', rate: 7.25 },
  { code: 'NY', name: 'New York', rate: 4 },
  { code: 'TX', name: 'Texas', rate: 6.25 },
  { code: 'FL', name: 'Floride', rate: 6 },
  { code: 'IL', name: 'Illinois', rate: 6.25 },
]

export default function AdminTaxesPage() {
  const { storeId } = useStoreContext()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [quickAddCountry, setQuickAddCountry] = useState<string>('')

  const [formData, setFormData] = useState({
    name: '',
    countryCode: '',
    stateCode: '',
    rate: '',
    includedInPrice: true,
    isActive: true,
    isDefault: false,
  })

  const { data: taxRates, refetch } = trpc.tax.getAll.useQuery(
    {
      storeId: storeId!,
    },
    {
      enabled: !!storeId,
    }
  )

  const createTax = trpc.tax.create.useMutation({
    onSuccess: () => {
      refetch()
      setIsCreating(false)
      resetForm()
    },
  })

  const updateTax = trpc.tax.update.useMutation({
    onSuccess: () => {
      refetch()
      setEditingId(null)
      resetForm()
    },
  })

  const deleteTax = trpc.tax.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const bulkCreateTax = trpc.tax.bulkCreate.useMutation({
    onSuccess: () => {
      refetch()
      setQuickAddCountry('')
    },
  })

  const resetForm = () => {
    setFormData({
      name: '',
      countryCode: '',
      stateCode: '',
      rate: '',
      includedInPrice: true,
      isActive: true,
      isDefault: false,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.countryCode || !formData.name || !formData.rate) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    const data = {
      storeId: storeId!,
      name: formData.name,
      countryCode: formData.countryCode,
      stateCode: formData.stateCode || undefined,
      rate: parseFloat(formData.rate),
      includedInPrice: formData.includedInPrice,
      isActive: formData.isActive,
      isDefault: formData.isDefault,
    }

    if (editingId) {
      updateTax.mutate({ id: editingId, ...data })
    } else {
      createTax.mutate(data)
    }
  }

  const startEdit = (tax: any) => {
    setEditingId(tax.id)
    setFormData({
      name: tax.name,
      countryCode: tax.countryCode,
      stateCode: tax.stateCode || '',
      rate: tax.rate.toString(),
      includedInPrice: tax.includedInPrice,
      isActive: tax.isActive,
      isDefault: tax.isDefault,
    })
    setIsCreating(true)
  }

  const cancelForm = () => {
    setIsCreating(false)
    setEditingId(null)
    resetForm()
  }

  const handleQuickAdd = (countryCode: string) => {
    const country = COMMON_COUNTRIES.find(c => c.code === countryCode)
    if (!country) return

    const rates = [{
      name: `TVA ${country.name}`,
      countryCode: country.code,
      rate: country.defaultRate,
      includedInPrice: true,
      isActive: true,
      isDefault: true,
    }]

    bulkCreateTax.mutate({
      storeId: storeId!,
      rates,
    })
  }

  const groupedTaxes = taxRates?.reduce((acc, tax) => {
    const key = tax.stateCode ? `${tax.countryCode}-${tax.stateCode}` : tax.countryCode
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(tax)
    return acc
  }, {} as Record<string, typeof taxRates>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Taxes</h1>
          <p className="text-gray-600">Configurez les taux de TVA et taxes par pays</p>
        </div>
        {!isCreating && (
          <Button variant="primary" size="lg" onClick={() => setIsCreating(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Nouveau Taux de Taxe
          </Button>
        )}
      </div>

      {/* Quick Add */}
      {!isCreating && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ajout Rapide</h2>
          <p className="text-sm text-gray-600 mb-4">
            Ajoutez rapidement les taux de TVA standards pour les pays européens
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {COMMON_COUNTRIES.map((country) => {
              const hasExisting = taxRates?.some(t => t.countryCode === country.code)
              return (
                <button
                  key={country.code}
                  onClick={() => handleQuickAdd(country.code)}
                  disabled={hasExisting || bulkCreateTax.isPending}
                  className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    hasExisting
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-gray-200 hover:border-primary-500 hover:bg-primary-50 text-gray-700'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>{country.name}</span>
                    <span className="text-xs text-gray-500">{country.defaultRate}%</span>
                  </div>
                </button>
              )
            })}
          </div>
        </Card>
      )}

      {/* Create/Edit Form */}
      {isCreating && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingId ? 'Modifier le taux de taxe' : 'Nouveau taux de taxe'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nom *"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="TVA France"
                helperText="Ex: TVA France, Sales Tax California"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays *
                </label>
                <select
                  required
                  value={formData.countryCode}
                  onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Sélectionnez un pays</option>
                  {COMMON_COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              {formData.countryCode && COMMON_COUNTRIES.find(c => c.code === formData.countryCode)?.hasStates && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    État / Province
                  </label>
                  <select
                    value={formData.stateCode}
                    onChange={(e) => setFormData({ ...formData, stateCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Aucun (taux fédéral)</option>
                    {formData.countryCode === 'US' && US_STATES.map((state) => (
                      <option key={state.code} value={state.code}>
                        {state.name} ({state.rate}%)
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Laissez vide pour appliquer au niveau fédéral
                  </p>
                </div>
              )}

              <Input
                label="Taux de taxe (%) *"
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                placeholder="20.00"
                helperText="Taux en pourcentage (ex: 20 pour 20%)"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includedInPrice"
                  checked={formData.includedInPrice}
                  onChange={(e) => setFormData({ ...formData, includedInPrice: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="includedInPrice" className="text-sm text-gray-700">
                  <span className="font-medium">Taxe incluse dans le prix (TTC)</span>
                  <p className="text-xs text-gray-500">
                    Si coché, les prix affichés incluent déjà la taxe. Sinon, la taxe sera ajoutée au montant.
                  </p>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">
                  <span className="font-medium">Taux par défaut pour ce pays/région</span>
                  <p className="text-xs text-gray-500">
                    Ce taux sera utilisé en priorité lors du calcul des taxes
                  </p>
                </label>
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
                  Taux actif
                </label>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                type="submit"
                variant="primary"
                isLoading={createTax.isPending || updateTax.isPending}
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

      {/* Tax Rates List */}
      <div className="grid grid-cols-1 gap-4">
        {Object.entries(groupedTaxes || {}).map(([key, taxes]) => {
          const firstTax = taxes[0]
          const country = COMMON_COUNTRIES.find(c => c.code === firstTax.countryCode)

          return (
            <Card key={key} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-900">
                      {country?.name || firstTax.countryCode}
                      {firstTax.stateCode && ` - ${firstTax.stateCode}`}
                    </h3>
                  </div>

                  {/* Tax Rates */}
                  <div className="space-y-2 mt-4">
                    {taxes.map((tax) => (
                      <div key={tax.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-2">
                            <Percent className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-gray-900">{tax.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-primary-600">{tax.rate}%</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            {tax.isDefault && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                Défaut
                              </span>
                            )}
                            <span className={`px-2 py-1 rounded-full ${
                              tax.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {tax.isActive ? 'Actif' : 'Inactif'}
                            </span>
                            <span className={`px-2 py-1 rounded-full ${
                              tax.includedInPrice ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {tax.includedInPrice ? 'TTC' : 'HT'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => startEdit(tax)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Êtes-vous sûr de vouloir supprimer ce taux de taxe ?')) {
                                deleteTax.mutate({ id: tax.id })
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {taxRates?.length === 0 && !isCreating && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Percent className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-gray-600 mb-4">Aucun taux de taxe créé</p>
          <p className="text-sm text-gray-500 mb-6">
            Utilisez l'ajout rapide ci-dessus ou créez un taux personnalisé
          </p>
          <Button variant="primary" onClick={() => setIsCreating(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Créer votre premier taux de taxe
          </Button>
        </Card>
      )}
    </div>
  )
}
