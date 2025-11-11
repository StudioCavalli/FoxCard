'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Store, CreditCard, Truck, Globe } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600">Configurez votre boutique</p>
      </div>

      {/* Store Settings */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Store className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Informations de la boutique</h2>
        </div>

        <Input label="Nom de la boutique" defaultValue="FoxCard Demo Store" />
        <Input label="Email de contact" type="email" defaultValue="contact@foxcard.com" />
        <Input label="Téléphone" type="tel" placeholder="+33 1 23 45 67 89" />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 outline-none transition-all"
            rows={3}
            placeholder="Décrivez votre boutique..."
          />
        </div>

        <Button variant="primary">Enregistrer les modifications</Button>
      </Card>

      {/* Payment Settings */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-secondary-100 rounded-lg">
            <CreditCard className="w-6 h-6 text-secondary-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Paiements</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Stripe</h3>
                <p className="text-sm text-gray-600">Acceptez les paiements par carte</p>
              </div>
              <Button variant="outline" size="sm">Configurer</Button>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-xl opacity-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">PayPal</h3>
                <p className="text-sm text-gray-600">Acceptez les paiements PayPal</p>
              </div>
              <Button variant="outline" size="sm" disabled>Bientôt disponible</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Shipping Settings */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Truck className="w-6 h-6 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Livraison</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
            <div>
              <h3 className="font-semibold text-gray-900">Livraison gratuite</h3>
              <p className="text-sm text-gray-600">Pour toutes les commandes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* SEO Settings */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Globe className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">SEO</h2>
        </div>

        <Input label="Titre du site" defaultValue="FoxCard - E-commerce Open Source" />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meta Description
          </label>
          <textarea
            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 outline-none transition-all"
            rows={3}
            defaultValue="La plateforme e-commerce 100% gratuite et open source"
          />
        </div>

        <Button variant="primary">Enregistrer les modifications</Button>
      </Card>
    </div>
  )
}
