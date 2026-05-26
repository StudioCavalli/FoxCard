'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { AdminToggle } from '@/components/admin/ui/AdminToggle'
import { useStoreContext } from '@/lib/context/store-context'
import { trpc } from '@/lib/trpc/client'
import {
  Bell,
  Globe,
  Shield,
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('settings')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('configureSpace')}</p>
        </div>
        <AdminButton variant="primary" onClick={handleSave} disabled={isSaving} icon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}>
          {isSaving ? t('saving') : t('save')}
        </AdminButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <AdminCard padding="sm">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </AdminCard>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'notifications' && (
            <AdminCard>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">{t('notificationSettings')}</h2>
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                  <AdminToggle
                    label={t('newOrder')}
                    description={t('newOrderDesc')}
                    checked={notificationSettings.newOrderEmail}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      newOrderEmail: e.target.checked
                    })}
                  />
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                  <AdminToggle
                    label={t('lowStockAlert')}
                    description={t('lowStockAlertDesc')}
                    checked={notificationSettings.lowStockEmail}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      lowStockEmail: e.target.checked
                    })}
                  />
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                  <AdminToggle
                    label={t('customerMessage')}
                    description={t('customerMessageDesc')}
                    checked={notificationSettings.customerMessageEmail}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      customerMessageEmail: e.target.checked
                    })}
                  />
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                  <h3 className="font-medium text-slate-900 dark:text-white mb-4">{t('reports.title')}</h3>

                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                      <AdminToggle
                        label={t('weeklyReport')}
                        description={t('weeklyReportDesc')}
                        checked={notificationSettings.weeklyReport}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          weeklyReport: e.target.checked
                        })}
                      />
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                      <AdminToggle
                        label={t('monthlyReport')}
                        description={t('monthlyReportDesc')}
                        checked={notificationSettings.monthlyReport}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          monthlyReport: e.target.checked
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AdminCard>
          )}

          {activeTab === 'locale' && (
            <AdminCard>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">{t('languageAndLocalization')}</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('interfaceLanguage')}
                  </label>
                  <select
                    value={localeSettings.language}
                    onChange={(e) => setLocaleSettings({
                      ...localeSettings,
                      language: e.target.value
                    })}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                    <option value="es">Español</option>
                    <option value="sk">Slovenčina</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('currency')}
                  </label>
                  <select
                    value={localeSettings.currency}
                    onChange={(e) => setLocaleSettings({
                      ...localeSettings,
                      currency: e.target.value
                    })}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer"
                  >
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="GBP">British Pound (£)</option>
                    <option value="CHF">Swiss Franc (CHF)</option>
                    <option value="CZK">Czech Koruna (CZK)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('timezone')}
                  </label>
                  <select
                    value={localeSettings.timezone}
                    onChange={(e) => setLocaleSettings({
                      ...localeSettings,
                      timezone: e.target.value
                    })}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer"
                  >
                    <option value="Europe/Paris">Paris (UTC+1)</option>
                    <option value="Europe/London">London (UTC+0)</option>
                    <option value="Europe/Berlin">Berlin (UTC+1)</option>
                    <option value="Europe/Prague">Prague (UTC+1)</option>
                    <option value="America/New_York">New York (UTC-5)</option>
                  </select>
                </div>
              </div>
            </AdminCard>
          )}

          {activeTab === 'security' && (
            <AdminCard>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">{t('accountSecurity')}</h2>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{t('password')}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{t('lastModified', { days: 30 })}</p>
                    </div>
                    <AdminButton variant="secondary" size="sm">
                      {t('modify')}
                    </AdminButton>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{t('twoFactorAuth')}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{t('addSecurityLayer')}</p>
                    </div>
                    <AdminButton variant="secondary" size="sm">
                      {t('enable')}
                    </AdminButton>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{t('activeSessions')}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{t('manageConnections')}</p>
                    </div>
                    <AdminButton variant="secondary" size="sm">
                      {t('view')}
                    </AdminButton>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                  <h3 className="font-medium text-red-600 dark:text-red-400 mb-4">{t('dangerZone')}</h3>
                  <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-900 dark:text-red-400">{t('deleteAccount')}</p>
                        <p className="text-sm text-red-700 dark:text-red-400/80">{t('deleteAccountWarning')}</p>
                      </div>
                      <AdminButton variant="secondary" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-500/20">
                        {t('delete')}
                      </AdminButton>
                    </div>
                  </div>
                </div>
              </div>
            </AdminCard>
          )}
        </div>
      </div>
    </div>
  )
}
