'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  AdminCard,
  AdminButton,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  AdminBadge,
} from '@/components/admin/ui'
import {
  Settings,
  Globe,
  Mail,
  CreditCard,
  Shield,
  Save,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Server,
  Store,
  Wrench,
  Banknote,
  Lock,
  UserPlus,
  Clock,
} from 'lucide-react'

type TabId = 'general' | 'localization' | 'email' | 'payments' | 'security'

const tabs: { id: TabId; label: string; icon: any; description: string }[] = [
  { id: 'general', label: 'Général', icon: Settings, description: 'Paramètres de base' },
  { id: 'localization', label: 'Localisation', icon: Globe, description: 'Langue et devise' },
  { id: 'email', label: 'Email', icon: Mail, description: 'Configuration SMTP' },
  { id: 'payments', label: 'Paiements', icon: CreditCard, description: 'Passerelles de paiement' },
  { id: 'security', label: 'Sécurité', icon: Shield, description: 'Authentification' },
]

const currencyOptions = [
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'USD', label: 'Dollar US (USD)' },
  { value: 'GBP', label: 'Livre Sterling (GBP)' },
  { value: 'CHF', label: 'Franc Suisse (CHF)' },
]

const languageOptions = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
  { value: 'sk', label: 'Slovenčina' },
  { value: 'cs', label: 'Čeština' },
]

export default function SuperAdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('general')
  const [hasChanges, setHasChanges] = useState(false)

  const { data: settings, isLoading, refetch } = trpc.superadmin.getSettings.useQuery()
  const updateSettings = trpc.superadmin.updateSettings.useMutation({
    onSuccess: () => {
      setHasChanges(false)
      refetch()
    },
  })

  const [formData, setFormData] = useState({
    platformName: '',
    platformUrl: '',
    supportEmail: '',
    maxStoresPerUser: 5,
    maintenanceMode: false,
    maintenanceMessage: '',
    defaultCurrency: 'EUR',
    defaultLanguage: 'fr',
    allowRegistration: true,
    requireEmailVerification: true,
    sessionTimeout: 30,
    stripeEnabled: false,
    paypalEnabled: false,
    bankTransferEnabled: true,
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    smtpFromEmail: '',
    smtpFromName: '',
  })

  useEffect(() => {
    if (settings) {
      setFormData({
        platformName: settings.platformName,
        platformUrl: settings.platformUrl,
        supportEmail: settings.supportEmail,
        maxStoresPerUser: settings.maxStoresPerUser,
        maintenanceMode: settings.maintenanceMode,
        maintenanceMessage: settings.maintenanceMessage || '',
        defaultCurrency: settings.defaultCurrency,
        defaultLanguage: settings.defaultLanguage,
        allowRegistration: settings.allowRegistration,
        requireEmailVerification: settings.requireEmailVerification,
        sessionTimeout: settings.sessionTimeout,
        stripeEnabled: settings.stripeEnabled,
        paypalEnabled: settings.paypalEnabled,
        bankTransferEnabled: settings.bankTransferEnabled,
        smtpHost: settings.smtpHost || '',
        smtpPort: settings.smtpPort || 587,
        smtpUser: settings.smtpUser || '',
        smtpPassword: '',
        smtpFromEmail: settings.smtpFromEmail || '',
        smtpFromName: settings.smtpFromName || '',
      })
    }
  }, [settings])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    const dataToSave: any = { ...formData }
    if (!dataToSave.smtpPassword) {
      delete dataToSave.smtpPassword
    }
    updateSettings.mutate(dataToSave)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Chargement des paramètres...</p>
        </div>
      </div>
    )
  }

  // Toggle Switch Component
  const ToggleSwitch = ({
    checked,
    onChange,
    disabled = false,
  }: {
    checked: boolean
    onChange: (checked: boolean) => void
    disabled?: boolean
  }) => (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked
          ? 'bg-violet-600'
          : 'bg-slate-200 dark:bg-slate-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )

  // Setting Row Component
  const SettingRow = ({
    icon: Icon,
    iconBg,
    title,
    description,
    children,
  }: {
    icon: any
    iconBg: string
    title: string
    description: string
    children: React.ReactNode
  }) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{title}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Paramètres Plateforme
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Configuration globale de FoxCard
          </p>
        </div>
        <div className="flex items-center gap-3">
          {updateSettings.isSuccess && (
            <AdminBadge variant="success">
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              Enregistré
            </AdminBadge>
          )}
          <AdminButton
            variant="primary"
            icon={<Save className="w-4 h-4" />}
            onClick={handleSave}
            disabled={!hasChanges || updateSettings.isPending}
            loading={updateSettings.isPending}
          >
            Enregistrer
          </AdminButton>
        </div>
      </div>

      {/* Error Message */}
      {updateSettings.error && (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{updateSettings.error.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <AdminCard className="p-2 h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : ''}`} />
                <div>
                  <span className="font-medium block">{tab.label}</span>
                  <span className={`text-xs ${activeTab === tab.id ? 'text-violet-200' : 'text-slate-400 dark:text-slate-500'}`}>
                    {tab.description}
                  </span>
                </div>
              </button>
            ))}
          </nav>
        </AdminCard>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <AdminCard>
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Paramètres généraux</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Informations de base de la plateforme</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-5">
                <AdminInput
                  label="Nom de la plateforme"
                  value={formData.platformName}
                  onChange={(e) => handleChange('platformName', e.target.value)}
                  placeholder="FoxCard"
                />
                <AdminInput
                  label="URL de la plateforme"
                  value={formData.platformUrl}
                  onChange={(e) => handleChange('platformUrl', e.target.value)}
                  placeholder="https://foxcard.io"
                />
                <AdminInput
                  label="Email de support"
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) => handleChange('supportEmail', e.target.value)}
                  placeholder="support@foxcard.io"
                />
                <AdminInput
                  label="Boutiques max par utilisateur"
                  type="number"
                  value={formData.maxStoresPerUser}
                  onChange={(e) => handleChange('maxStoresPerUser', parseInt(e.target.value))}
                />

                {/* Maintenance Mode */}
                <div className={`p-4 rounded-xl border-2 transition-colors ${
                  formData.maintenanceMode
                    ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        formData.maintenanceMode
                          ? 'bg-red-500'
                          : 'bg-slate-400 dark:bg-slate-600'
                      }`}>
                        <Wrench className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className={`font-medium ${formData.maintenanceMode ? 'text-red-900 dark:text-red-300' : 'text-slate-900 dark:text-white'}`}>
                          Mode maintenance
                        </p>
                        <p className={`text-sm ${formData.maintenanceMode ? 'text-red-700 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                          Désactive l'accès public à la plateforme
                        </p>
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={formData.maintenanceMode}
                      onChange={(checked) => handleChange('maintenanceMode', checked)}
                    />
                  </div>

                  {formData.maintenanceMode && (
                    <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-500/30">
                      <AdminTextarea
                        label="Message de maintenance"
                        value={formData.maintenanceMessage}
                        onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                        placeholder="Site en maintenance, veuillez revenir plus tard..."
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </div>
            </AdminCard>
          )}

          {/* Localization Tab */}
          {activeTab === 'localization' && (
            <AdminCard>
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Localisation</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Langue et devise par défaut</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-5">
                <AdminSelect
                  label="Devise par défaut"
                  value={formData.defaultCurrency}
                  onChange={(value) => handleChange('defaultCurrency', value)}
                  options={currencyOptions}
                />
                <AdminSelect
                  label="Langue par défaut"
                  value={formData.defaultLanguage}
                  onChange={(value) => handleChange('defaultLanguage', value)}
                  options={languageOptions}
                />
              </div>
            </AdminCard>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <AdminCard>
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Configuration Email (SMTP)</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Paramètres du serveur mail</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AdminInput
                    label="Serveur SMTP"
                    value={formData.smtpHost}
                    onChange={(e) => handleChange('smtpHost', e.target.value)}
                    placeholder="smtp.example.com"
                  />
                  <AdminInput
                    label="Port SMTP"
                    type="number"
                    value={formData.smtpPort}
                    onChange={(e) => handleChange('smtpPort', parseInt(e.target.value))}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AdminInput
                    label="Utilisateur SMTP"
                    value={formData.smtpUser}
                    onChange={(e) => handleChange('smtpUser', e.target.value)}
                  />
                  <AdminInput
                    label="Mot de passe SMTP"
                    type="password"
                    value={formData.smtpPassword}
                    onChange={(e) => handleChange('smtpPassword', e.target.value)}
                    placeholder="Laisser vide pour ne pas changer"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AdminInput
                    label="Email expéditeur"
                    type="email"
                    value={formData.smtpFromEmail}
                    onChange={(e) => handleChange('smtpFromEmail', e.target.value)}
                    placeholder="noreply@foxcard.io"
                  />
                  <AdminInput
                    label="Nom expéditeur"
                    value={formData.smtpFromName}
                    onChange={(e) => handleChange('smtpFromName', e.target.value)}
                    placeholder="FoxCard"
                  />
                </div>
              </div>
            </AdminCard>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <AdminCard>
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Passerelles de paiement</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Activez les méthodes de paiement</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <SettingRow
                  icon={CreditCard}
                  iconBg="bg-gradient-to-br from-violet-500 to-indigo-600"
                  title="Stripe"
                  description="Cartes bancaires et plus"
                >
                  <ToggleSwitch
                    checked={formData.stripeEnabled}
                    onChange={(checked) => handleChange('stripeEnabled', checked)}
                  />
                </SettingRow>

                <SettingRow
                  icon={CreditCard}
                  iconBg="bg-gradient-to-br from-blue-500 to-cyan-600"
                  title="PayPal"
                  description="Paiement PayPal"
                >
                  <ToggleSwitch
                    checked={formData.paypalEnabled}
                    onChange={(checked) => handleChange('paypalEnabled', checked)}
                  />
                </SettingRow>

                <SettingRow
                  icon={Banknote}
                  iconBg="bg-gradient-to-br from-emerald-500 to-green-600"
                  title="Virement bancaire"
                  description="Paiement par virement"
                >
                  <ToggleSwitch
                    checked={formData.bankTransferEnabled}
                    onChange={(checked) => handleChange('bankTransferEnabled', checked)}
                  />
                </SettingRow>
              </div>
            </AdminCard>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <AdminCard>
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Sécurité</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Authentification et sessions</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <SettingRow
                  icon={UserPlus}
                  iconBg="bg-gradient-to-br from-violet-500 to-indigo-600"
                  title="Autoriser les inscriptions"
                  description="Permettre aux nouveaux utilisateurs de s'inscrire"
                >
                  <ToggleSwitch
                    checked={formData.allowRegistration}
                    onChange={(checked) => handleChange('allowRegistration', checked)}
                  />
                </SettingRow>

                <SettingRow
                  icon={Mail}
                  iconBg="bg-gradient-to-br from-blue-500 to-cyan-600"
                  title="Vérification email obligatoire"
                  description="Les utilisateurs doivent vérifier leur email"
                >
                  <ToggleSwitch
                    checked={formData.requireEmailVerification}
                    onChange={(checked) => handleChange('requireEmailVerification', checked)}
                  />
                </SettingRow>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Timeout de session</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Durée d'inactivité avant déconnexion</p>
                    </div>
                  </div>
                  <AdminInput
                    type="number"
                    value={formData.sessionTimeout}
                    onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                    min={5}
                    max={1440}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Valeur en minutes (5-1440)
                  </p>
                </div>
              </div>
            </AdminCard>
          )}
        </div>
      </div>
    </div>
  )
}
