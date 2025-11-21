'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useStoreContext } from '@/lib/context/store-context'
import { trpc } from '@/lib/trpc/client'
import {
  Settings,
  Bell,
  Globe,
  Shield,
  Palette,
  Mail,
  Save,
  Loader2
} from 'lucide-react'

export default function MerchantSettingsPage() {
  const params = useParams()
  const locale = params?.locale || 'fr'
  const { storeId } = useStoreContext()
  const [activeTab, setActiveTab] = useState('notifications')
  const [isSaving, setIsSaving] = useState(false)

  const [notificationSettings, setNotificationSettings] = useState({
    newOrderEmail: true,
    lowStockEmail: true,
    customerMessageEmail: true,
    weeklyReport: false,
    monthlyReport: true,
  })

  const [localeSettings, setLocaleSettings] = useState({
    language: locale,
    currency: 'EUR',
    timezone: 'Europe/Paris',
  })

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'locale', label: 'Langue & devise', icon: Globe },
    { id: 'security', label: 'Sécurité', icon: Shield },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-500 mt-1">Configurez votre espace marchand</p>
        </div>
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <nav className="p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Notifications par email</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">Nouvelle commande</p>
                    <p className="text-sm text-gray-500">Recevez un email à chaque nouvelle commande</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.newOrderEmail}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      newOrderEmail: e.target.checked
                    })}
                    className="w-5 h-5 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">Stock faible</p>
                    <p className="text-sm text-gray-500">Alerte quand un produit atteint le seuil de stock faible</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.lowStockEmail}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      lowStockEmail: e.target.checked
                    })}
                    className="w-5 h-5 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">Message client</p>
                    <p className="text-sm text-gray-500">Notification quand un client vous contacte</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.customerMessageEmail}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      customerMessageEmail: e.target.checked
                    })}
                    className="w-5 h-5 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                </label>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="font-medium text-gray-900 mb-4">Rapports</h3>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors mb-2">
                    <div>
                      <p className="font-medium text-gray-900">Rapport hebdomadaire</p>
                      <p className="text-sm text-gray-500">Résumé de vos ventes chaque semaine</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.weeklyReport}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        weeklyReport: e.target.checked
                      })}
                      className="w-5 h-5 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">Rapport mensuel</p>
                      <p className="text-sm text-gray-500">Analyse complète de vos performances</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.monthlyReport}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        monthlyReport: e.target.checked
                      })}
                      className="w-5 h-5 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'locale' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Langue et régionalisation</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Langue de l'interface
                  </label>
                  <select
                    value={localeSettings.language}
                    onChange={(e) => setLocaleSettings({
                      ...localeSettings,
                      language: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                    <option value="sk">Slovenčina</option>
                    <option value="cs">Čeština</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Devise
                  </label>
                  <select
                    value={localeSettings.currency}
                    onChange={(e) => setLocaleSettings({
                      ...localeSettings,
                      currency: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="GBP">Livre Sterling (£)</option>
                    <option value="CHF">Franc Suisse (CHF)</option>
                    <option value="CZK">Couronne Tchèque (CZK)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuseau horaire
                  </label>
                  <select
                    value={localeSettings.timezone}
                    onChange={(e) => setLocaleSettings({
                      ...localeSettings,
                      timezone: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="Europe/Paris">Paris (UTC+1)</option>
                    <option value="Europe/London">Londres (UTC+0)</option>
                    <option value="Europe/Berlin">Berlin (UTC+1)</option>
                    <option value="Europe/Prague">Prague (UTC+1)</option>
                    <option value="America/New_York">New York (UTC-5)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Sécurité du compte</h2>
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium text-gray-900">Mot de passe</p>
                      <p className="text-sm text-gray-500">Dernière modification il y a 30 jours</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium text-gray-900">Authentification à deux facteurs</p>
                      <p className="text-sm text-gray-500">Ajoutez une couche de sécurité supplémentaire</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Activer
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Sessions actives</p>
                      <p className="text-sm text-gray-500">Gérez vos connexions actives</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Voir
                    </Button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium text-red-600 mb-4">Zone de danger</h3>
                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-900">Supprimer mon compte</p>
                        <p className="text-sm text-red-700">Cette action est irréversible</p>
                      </div>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-100">
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
