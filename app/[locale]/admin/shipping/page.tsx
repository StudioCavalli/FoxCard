'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { formatPrice } from '@/lib/utils'
import { Plus, Edit, Trash2, Truck, MapPin, Clock, DollarSign, Globe } from 'lucide-react'
import { useStoreContext } from '@/lib/context/store-context'

const COMMON_COUNTRIES = [
  { code: 'FR', name: 'France' },
  { code: 'BE', name: 'Belgique' },
  { code: 'CH', name: 'Suisse' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'DE', name: 'Allemagne' },
  { code: 'IT', name: 'Italie' },
  { code: 'ES', name: 'Espagne' },
  { code: 'PT', name: 'Portugal' },
  { code: 'NL', name: 'Pays-Bas' },
  { code: 'GB', name: 'Royaume-Uni' },
]

export default function AdminShippingPage() {
  const { storeId } = useStoreContext()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: '',
    isActive: true,
  })

  const [rates, setRates] = useState<Array<{
    name: string
    price: string
    minOrderAmount: string
    estimatedDays: string
  }>>([
    { name: '', price: '', minOrderAmount: '', estimatedDays: '' }
  ])

  const { data: shippingZones, refetch } = trpc.shipping.getAll.useQuery(
    {
      storeId: storeId!,
    },
    {
      enabled: !!storeId,
    }
  )

  const createZone = trpc.shipping.create.useMutation({
    onSuccess: () => {
      refetch()
      setIsCreating(false)
      resetForm()
    },
  })

  const updateZone = trpc.shipping.update.useMutation({
    onSuccess: () => {
      refetch()
      setEditingId(null)
      resetForm()
    },
  })

  const deleteZone = trpc.shipping.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const deleteRateMutation = trpc.shipping.deleteRate.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const resetForm = () => {
    setFormData({
      name: '',
      isActive: true,
    })
    setSelectedCountries([])
    setRates([{ name: '', price: '', minOrderAmount: '', estimatedDays: '' }])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedCountries.length === 0) {
      alert('Veuillez sélectionner au moins un pays')
      return
    }

    const validRates = rates.filter(r => r.name && r.price)
    if (validRates.length === 0) {
      alert('Veuillez ajouter au moins un tarif de livraison')
      return
    }

    const data = {
      storeId: storeId!,
      name: formData.name,
      countries: selectedCountries,
      isActive: formData.isActive,
      rates: validRates.map(rate => ({
        name: rate.name,
        price: parseFloat(rate.price),
        minOrderAmount: rate.minOrderAmount ? parseFloat(rate.minOrderAmount) : undefined,
        estimatedDays: rate.estimatedDays || undefined,
      })),
    }

    if (editingId) {
      updateZone.mutate({ id: editingId, ...data })
    } else {
      createZone.mutate(data)
    }
  }

  const startEdit = (zone: any) => {
    setEditingId(zone.id)
    setFormData({
      name: zone.name,
      isActive: zone.isActive,
    })
    setSelectedCountries(zone.countries)
    setRates(zone.rates.map((r: any) => ({
      name: r.name,
      price: r.price.toString(),
      minOrderAmount: r.minOrderAmount?.toString() || '',
      estimatedDays: r.estimatedDays || '',
    })))
    setIsCreating(true)
  }

  const cancelForm = () => {
    setIsCreating(false)
    setEditingId(null)
    resetForm()
  }

  const toggleCountry = (countryCode: string) => {
    setSelectedCountries(prev =>
      prev.includes(countryCode)
        ? prev.filter(c => c !== countryCode)
        : [...prev, countryCode]
    )
  }

  const addRate = () => {
    setRates([...rates, { name: '', price: '', minOrderAmount: '', estimatedDays: '' }])
  }

  const removeRate = (index: number) => {
    if (rates.length > 1) {
      setRates(rates.filter((_, i) => i !== index))
    }
  }

  const updateRate = (index: number, field: string, value: string) => {
    const newRates = [...rates]
    newRates[index] = { ...newRates[index], [field]: value }
    setRates(newRates)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion de la Livraison</h1>
          <p className="text-gray-600">Configurez vos zones et tarifs de livraison</p>
        </div>
        {!isCreating && (
          <Button variant="primary" size="lg" onClick={() => setIsCreating(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle Zone de Livraison
          </Button>
        )}
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingId ? 'Modifier la zone de livraison' : 'Nouvelle zone de livraison'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nom de la zone *"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Europe de l'Ouest"
            />

            {/* Country Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pays inclus *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {COMMON_COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => toggleCountry(country.code)}
                    className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      selectedCountries.includes(country.code)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {country.name}
                  </button>
                ))}
              </div>
              {selectedCountries.length > 0 && (
                <p className="text-xs text-gray-600 mt-2">
                  {selectedCountries.length} pays sélectionné{selectedCountries.length > 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Shipping Rates */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Tarifs de livraison *
                </label>
                <Button type="button" variant="outline" size="sm" onClick={addRate}>
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter un tarif
                </Button>
              </div>

              {rates.map((rate, index) => (
                <Card key={index} className="p-4 bg-gray-50">
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        label="Nom du tarif *"
                        required
                        value={rate.name}
                        onChange={(e) => updateRate(index, 'name', e.target.value)}
                        placeholder="Livraison Standard"
                      />
                      <Input
                        label="Prix (€) *"
                        type="number"
                        step="0.01"
                        required
                        value={rate.price}
                        onChange={(e) => updateRate(index, 'price', e.target.value)}
                        placeholder="5.99"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        label="Montant minimum (€)"
                        type="number"
                        step="0.01"
                        value={rate.minOrderAmount}
                        onChange={(e) => updateRate(index, 'minOrderAmount', e.target.value)}
                        placeholder="50.00"
                        helperText="Laisser vide pour aucun minimum"
                      />
                      <Input
                        label="Délai estimé"
                        value={rate.estimatedDays}
                        onChange={(e) => updateRate(index, 'estimatedDays', e.target.value)}
                        placeholder="3-5 jours"
                      />
                    </div>
                    {rates.length > 1 && (
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRate(index)}
                        >
                          <Trash2 className="w-4 h-4 mr-1 text-red-600" />
                          Supprimer ce tarif
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
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
                Zone active
              </label>
            </div>

            <div className="flex items-center gap-4">
              <Button
                type="submit"
                variant="primary"
                isLoading={createZone.isPending || updateZone.isPending}
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

      {/* Shipping Zones List */}
      <div className="grid grid-cols-1 gap-4">
        {shippingZones?.map((zone) => (
          <Card key={zone.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{zone.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    zone.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {zone.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Globe className="w-4 h-4" />
                  <span>{zone.countries.join(', ')}</span>
                </div>

                {/* Rates */}
                <div className="space-y-2">
                  {zone.rates.map((rate) => (
                    <div key={rate.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-gray-900">{rate.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="w-3 h-3" />
                          <span>{formatPrice(rate.price)}</span>
                        </div>
                        {rate.minOrderAmount && (
                          <div className="text-sm text-gray-600">
                            Min: {formatPrice(rate.minOrderAmount)}
                          </div>
                        )}
                        {rate.estimatedDays && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="w-3 h-3" />
                            <span>{rate.estimatedDays}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button variant="ghost" size="sm" onClick={() => startEdit(zone)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir supprimer cette zone de livraison ?')) {
                      deleteZone.mutate({ id: zone.id })
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

      {shippingZones?.length === 0 && !isCreating && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-gray-600 mb-4">Aucune zone de livraison créée</p>
          <Button variant="primary" onClick={() => setIsCreating(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Créer votre première zone de livraison
          </Button>
        </Card>
      )}
    </div>
  )
}
