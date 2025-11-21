'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface PlatformSettings {
  platformName: string
  maintenanceMode: boolean
  maintenanceMessage: string
  defaultCurrency: string
  defaultLanguage: string
  supportedCurrencies: string[]
  supportedLanguages: string[]
  allowRegistration: boolean
}

interface PlatformSettingsContextType {
  settings: PlatformSettings
  loading: boolean
  refetch: () => Promise<void>
}

const defaultSettings: PlatformSettings = {
  platformName: 'FoxCard',
  maintenanceMode: false,
  maintenanceMessage: '',
  defaultCurrency: 'EUR',
  defaultLanguage: 'fr',
  supportedCurrencies: ['EUR', 'USD', 'GBP', 'CHF'],
  supportedLanguages: ['fr', 'en', 'de'],
  allowRegistration: true,
}

const PlatformSettingsContext = createContext<PlatformSettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refetch: async () => {},
})

export function PlatformSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/platform/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings({
          platformName: data.platformName || defaultSettings.platformName,
          maintenanceMode: data.maintenanceMode ?? defaultSettings.maintenanceMode,
          maintenanceMessage: data.maintenanceMessage || defaultSettings.maintenanceMessage,
          defaultCurrency: data.defaultCurrency || defaultSettings.defaultCurrency,
          defaultLanguage: data.defaultLanguage || defaultSettings.defaultLanguage,
          supportedCurrencies: data.supportedCurrencies || defaultSettings.supportedCurrencies,
          supportedLanguages: data.supportedLanguages || defaultSettings.supportedLanguages,
          allowRegistration: data.allowRegistration ?? defaultSettings.allowRegistration,
        })
      }
    } catch (error) {
      console.error('Failed to fetch platform settings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <PlatformSettingsContext.Provider value={{ settings, loading, refetch: fetchSettings }}>
      {children}
    </PlatformSettingsContext.Provider>
  )
}

export function usePlatformSettings() {
  const context = useContext(PlatformSettingsContext)
  if (!context) {
    throw new Error('usePlatformSettings must be used within a PlatformSettingsProvider')
  }
  return context
}

export function usePlatformName() {
  const { settings } = usePlatformSettings()
  return settings.platformName
}
