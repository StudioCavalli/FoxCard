'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import { Store, Save, Globe, Mail, Phone, MapPin, Image as ImageIcon } from 'lucide-react'

export default function MerchantStorePage() {
  const { storeId } = useStoreContext()
  const [isEditing, setIsEditing] = useState(false)

  const { data: store, isLoading, refetch } = trpc.store.getById.useQuery(
    { id: storeId! },
    { enabled: !!storeId }
  )

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    publicEmail: '',
    publicPhone: '',
  })

  const updateStore = trpc.store.update.useMutation({
    onSuccess: () => {
      refetch()
      setIsEditing(false)
    },
  })

  const handleEdit = () => {
    if (store) {
      setFormData({
        name: store.name || '',
        tagline: store.tagline || '',
        description: store.description || '',
        publicEmail: store.publicEmail || '',
        publicPhone: store.publicPhone || '',
      })
      setIsEditing(true)
    }
  }

  const handleSave = () => {
    updateStore.mutate({
      storeId: storeId!,
      ...formData,
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ma boutique</h1>
          <p className="text-gray-500 mt-1">Gérez les informations de votre boutique</p>
        </div>
        {!isEditing ? (
          <Button variant="primary" onClick={handleEdit}>
            Modifier
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleSave} isLoading={updateStore.isPending}>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
          </div>
        )}
      </div>

      {/* Store Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
          {store?.bannerImage && (
            <img src={store.bannerImage} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 bg-white rounded-xl shadow-lg flex items-center justify-center overflow-hidden">
              {store?.logo ? (
                <img src={store.logo} alt="" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-8 h-8 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-14 p-6">
          {isEditing ? (
            <div className="space-y-4">
              <Input
                label="Nom de la boutique"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Slogan"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="Une phrase accrocheuse pour votre boutique"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 outline-none transition-all resize-none"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez votre boutique..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email de contact"
                  type="email"
                  value={formData.publicEmail}
                  onChange={(e) => setFormData({ ...formData, publicEmail: e.target.value })}
                  placeholder="contact@maboutique.com"
                />
                <Input
                  label="Téléphone"
                  value={formData.publicPhone}
                  onChange={(e) => setFormData({ ...formData, publicPhone: e.target.value })}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{store?.name}</h2>
                {store?.tagline && (
                  <p className="text-gray-600 mt-1">{store.tagline}</p>
                )}
              </div>

              {store?.description && (
                <p className="text-gray-600">{store.description}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 text-gray-600">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">{store?.slug}.foxcard.io</span>
                </div>
                {store?.publicEmail && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-sm">{store.publicEmail}</span>
                  </div>
                )}
                {store?.publicPhone && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-sm">{store.publicPhone}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
