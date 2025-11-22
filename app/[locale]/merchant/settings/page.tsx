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
import { useTranslations } from 'next-intl'

export default function MerchantSettingsPage() {
  const params = useParams()
  const locale = params?.locale || 'fr'
  const { storeId } = useStoreContext()
  const [activeTab, setActiveTab] = useState('notifications')
  const [isSaving, setIsSaving] = useState(false)
  const t = useTranslations('merchant')

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
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'locale', label: t('languageCurrency'), icon: Globe },
    { id: 'security', label: t('security'), icon: Shield },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('settings')}</h1>
          <p className="text-gray-500 mt-1">{t('configureSpace')}</p>
        </div>
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('saving')}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {t('save')}
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
              <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('notificationSettings')}</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">{t('newOrder')}</p>
                    <p className="text-sm text-gray-500">{t('newOrderDesc')}</p>
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
                    <p className="font-medium text-gray-900">{t('lowStockAlert')}</p>
                    <p className="text-sm text-gray-500">{t('lowStockAlertDesc')}</p>
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
                    <p className="font-medium text-gray-900">{t('customerMessage')}</p>
                    <p className="text-sm text-gray-500">{t('customerMessageDesc')}</p>
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
                  <h3 className="font-medium text-gray-900 mb-4">{t('reports')}</h3>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{t('weeklyReport')}</p>
                      <p className="text-sm text-gray-500">{t('weeklyReportDesc')}</p>
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
                      <p className="font-medium text-gray-900">{t('monthlyReport')}</p>
                      <p className="text-sm text-gray-500">{t('monthlyReportDesc')}</p>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('languageAndLocalization')}</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('interfaceLanguage')}
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
                    <option value="es">Español</option>
                    <option value="sk">Slovenčina</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('currency')}
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
                    <option value="GBP">British Pound (£)</option>
                    <option value="CHF">Swiss Franc (CHF)</option>
                    <option value="CZK">Czech Koruna (CZK)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('timezone')}
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
                    <option value="Europe/London">London (UTC+0)</option>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('accountSecurity')}</h2>
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium text-gray-900">{t('password')}</p>
                      <p className="text-sm text-gray-500">{t('lastModified', { days: 30 })}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      {t('modify')}
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium text-gray-900">{t('twoFactorAuth')}</p>
                      <p className="text-sm text-gray-500">{t('addSecurityLayer')}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      {t('enable')}
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{t('activeSessions')}</p>
                      <p className="text-sm text-gray-500">{t('manageConnections')}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      {t('view')}
                    </Button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium text-red-600 mb-4">{t('dangerZone')}</h3>
                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-900">{t('deleteAccount')}</p>
                        <p className="text-sm text-red-700">{t('deleteAccountWarning')}</p>
                      </div>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-100">
                        {t('delete')}
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
