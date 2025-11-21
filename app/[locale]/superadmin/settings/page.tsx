'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Settings,
  Globe,
  Mail,
  CreditCard,
  Bell,
  Shield,
  Database,
  Save,
  Loader2
} from 'lucide-react'

export default function SuperAdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [isSaving, setIsSaving] = useState(false)

  const [settings, setSettings] = useState({
    platformName: 'FoxCard',
    platformUrl: 'https://foxcard.io',
    supportEmail: 'support@foxcard.io',
    defaultCurrency: 'EUR',
    defaultLanguage: 'fr',
    allowRegistration: true,
    requireEmailVerification: true,
    maxStoresPerUser: 5,
    maintenanceMode: false,
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    stripeEnabled: true,
    paypalEnabled: true,
  })

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const tabs = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'localization', label: 'Localisation', icon: Globe },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'payments', label: 'Paiements', icon: CreditCard },
    { id: 'security', label: 'Sécurité', icon: Shield },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres Plateforme</h1>
          <p className="text-gray-600">Configuration globale de FoxCard</p>
        </div>
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Enregistrer
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="p-2 h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Paramètres généraux</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la plateforme
                  </label>
                  <Input
                    value={settings.platformName}
                    onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de la plateforme
                  </label>
                  <Input
                    value={settings.platformUrl}
                    onChange={(e) => setSettings({ ...settings, platformUrl: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de support
                  </label>
                  <Input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Boutiques max par utilisateur
                  </label>
                  <Input
                    type="number"
                    value={settings.maxStoresPerUser}
                    onChange={(e) => setSettings({ ...settings, maxStoresPerUser: parseInt(e.target.value) })}
                  />
                </div>
                <label className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-red-900">Mode maintenance</p>
                    <p className="text-sm text-red-700">Désactive l'accès public à la plateforme</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    className="w-5 h-5 rounded text-red-600 border-gray-300"
                  />
                </label>
              </div>
            </Card>
          )}

          {activeTab === 'localization' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Localisation</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Devise par défaut
                  </label>
                  <select
                    value={settings.defaultCurrency}
                    onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="EUR">Euro (EUR)</option>
                    <option value="USD">Dollar US (USD)</option>
                    <option value="GBP">Livre Sterling (GBP)</option>
                    <option value="CHF">Franc Suisse (CHF)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Langue par défaut
                  </label>
                  <select
                    value={settings.defaultLanguage}
                    onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                    <option value="sk">Slovenčina</option>
                    <option value="cs">Čeština</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'email' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Configuration Email (SMTP)</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serveur SMTP
                  </label>
                  <Input
                    value={settings.smtpHost}
                    onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                    placeholder="smtp.example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Port SMTP
                  </label>
                  <Input
                    value={settings.smtpPort}
                    onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Utilisateur SMTP
                  </label>
                  <Input
                    value={settings.smtpUser}
                    onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe SMTP
                  </label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'payments' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Passerelles de paiement</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Stripe</p>
                      <p className="text-sm text-gray-500">Cartes bancaires et plus</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.stripeEnabled}
                    onChange={(e) => setSettings({ ...settings, stripeEnabled: e.target.checked })}
                    className="w-5 h-5 rounded text-purple-600 border-gray-300"
                  />
                </label>
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">PayPal</p>
                      <p className="text-sm text-gray-500">Paiement PayPal</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.paypalEnabled}
                    onChange={(e) => setSettings({ ...settings, paypalEnabled: e.target.checked })}
                    className="w-5 h-5 rounded text-blue-600 border-gray-300"
                  />
                </label>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Sécurité</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Autoriser les inscriptions</p>
                    <p className="text-sm text-gray-500">Permettre aux nouveaux utilisateurs de s'inscrire</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.allowRegistration}
                    onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                    className="w-5 h-5 rounded text-purple-600 border-gray-300"
                  />
                </label>
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Vérification email obligatoire</p>
                    <p className="text-sm text-gray-500">Les utilisateurs doivent vérifier leur email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.requireEmailVerification}
                    onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                    className="w-5 h-5 rounded text-purple-600 border-gray-300"
                  />
                </label>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
