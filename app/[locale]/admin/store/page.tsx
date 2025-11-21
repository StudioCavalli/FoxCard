'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Store, Save, Image as ImageIcon } from 'lucide-react'

export default function StorePage() {
  const storeId = '000000000000000000000001' // TODO: Get from context

  const { data: store } = trpc.store.getById.useQuery({ id: storeId })

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
    domain: '',
  })

  // Update form when store loads
  useState(() => {
    if (store) {
      setFormData({
        name: store.name || '',
        description: store.description || '',
        logo: store.logo || '',
        domain: store.domain || '',
      })
    }
  })

  const updateStoreMutation = trpc.store.update.useMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    updateStoreMutation.mutate(
      {
        id: storeId,
        ...formData,
      },
      {
        onSuccess: () => {
          alert('Boutique mise à jour avec succès')
        },
        onError: (error) => {
          alert(error.message)
        },
      }
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres de la boutique</h1>
        <p className="text-gray-600">
          Gérez les informations générales de votre boutique
        </p>
      </div>

      <div className="max-w-3xl">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la boutique *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ma Super Boutique"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Décrivez votre boutique..."
              />
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo (URL)
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://example.com/logo.png"
                />
                {formData.logo && (
                  <div className="w-12 h-12 border border-gray-300 rounded-lg overflow-hidden">
                    <img
                      src={formData.logo}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                URL de votre logo (format recommandé : PNG ou SVG)
              </p>
            </div>

            {/* Domain */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domaine personnalisé
              </label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="boutique.exemple.com"
              />
              <p className="text-sm text-gray-500 mt-1">
                Domaine personnalisé pour votre boutique (optionnel)
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="submit"
                variant="primary"
                disabled={updateStoreMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {updateStoreMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Store Info */}
        <Card className="p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Store className="w-5 h-5" />
            Informations du magasin
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-gray-600">ID du magasin</span>
              <span className="text-sm font-mono text-gray-900">{storeId}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-gray-600">Créé le</span>
              <span className="text-sm text-gray-900">
                {store?.createdAt ? new Date(store.createdAt).toLocaleDateString('fr-FR') : '-'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">Dernière modification</span>
              <span className="text-sm text-gray-900">
                {store?.updatedAt ? new Date(store.updatedAt).toLocaleDateString('fr-FR') : '-'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
