'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useStoreContext } from '@/lib/context/store-context'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/Button'
import {
  Palette,
  Check,
  Plus,
  Eye,
  Copy,
  Trash2,
  Loader2,
  RefreshCw,
  Type,
  Sun,
  Moon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

// Color presets for quick selection
const COLOR_PRESETS = [
  { name: 'Indigo', primary: '#6366f1', secondary: '#ec4899' },
  { name: 'Blue', primary: '#3b82f6', secondary: '#10b981' },
  { name: 'Green', primary: '#10b981', secondary: '#6366f1' },
  { name: 'Purple', primary: '#8b5cf6', secondary: '#f59e0b' },
  { name: 'Rose', primary: '#f43f5e', secondary: '#8b5cf6' },
  { name: 'Orange', primary: '#f97316', secondary: '#06b6d4' },
]

// Font options
const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Merriweather', label: 'Merriweather' },
]

interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
    textMuted: string
    border: string
    borderLight: string
  }
  fonts: {
    heading: string
    body: string
  }
  spacing: {
    containerMaxWidth: string
    sectionPadding: string
  }
  borderRadius: string
}

const DEFAULT_CONFIG: ThemeConfig = {
  colors: {
    primary: '#6366f1',
    secondary: '#ec4899',
    accent: '#f59e0b',
    background: '#ffffff',
    surface: '#fafafa',
    text: '#111827',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    border: '#e5e5e5',
    borderLight: '#f5f5f5',
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
  },
  spacing: {
    containerMaxWidth: '1280px',
    sectionPadding: '4rem',
  },
  borderRadius: '0.5rem',
}

export default function MerchantThemesPage() {
  const params = useParams()
  const locale = params?.locale || 'fr'
  const { storeId } = useStoreContext()
  const t = useTranslations('merchant')
  const tCommon = useTranslations('common')

  const [activeTab, setActiveTab] = useState<'colors' | 'fonts' | 'layout'>('colors')
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null)
  const [isDarkPreview, setIsDarkPreview] = useState(false)
  const [localConfig, setLocalConfig] = useState<ThemeConfig>(DEFAULT_CONFIG)
  const [hasChanges, setHasChanges] = useState(false)

  // Fetch themes
  const { data: themes, isLoading, refetch } = trpc.theme.getAll.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  )

  // Mutations
  const createTheme = trpc.theme.create.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const updateTheme = trpc.theme.update.useMutation({
    onSuccess: () => {
      refetch()
      setHasChanges(false)
    },
  })

  const activateTheme = trpc.theme.activate.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const duplicateTheme = trpc.theme.duplicate.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const deleteTheme = trpc.theme.delete.useMutation({
    onSuccess: () => {
      refetch()
      setSelectedThemeId(null)
    },
  })

  const seedThemes = trpc.theme.seedSystemThemes.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  // Select first theme or active theme on load
  useEffect(() => {
    if (themes && themes.length > 0 && !selectedThemeId) {
      const activeTheme = themes.find((t) => t.isActive) || themes[0]
      setSelectedThemeId(activeTheme.id)
      setLocalConfig((activeTheme.config as unknown as ThemeConfig) || DEFAULT_CONFIG)
    }
  }, [themes, selectedThemeId])

  // Update local config when theme changes
  useEffect(() => {
    if (selectedThemeId && themes) {
      const theme = themes.find((t) => t.id === selectedThemeId)
      if (theme) {
        setLocalConfig((theme.config as unknown as ThemeConfig) || DEFAULT_CONFIG)
        setHasChanges(false)
      }
    }
  }, [selectedThemeId, themes])

  const handleConfigChange = (path: string, value: string) => {
    const keys = path.split('.')
    setLocalConfig((prev) => {
      const newConfig = { ...prev }
      let current: any = newConfig
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] }
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value
      return newConfig
    })
    setHasChanges(true)
  }

  const handleSave = () => {
    if (!selectedThemeId || !storeId) return
    updateTheme.mutate({
      storeId,
      id: selectedThemeId,
      config: localConfig,
    })
  }

  const handleCreateTheme = () => {
    if (!storeId) return
    createTheme.mutate({
      storeId,
      name: 'Nouveau thème',
      config: DEFAULT_CONFIG,
    })
  }

  const handleActivate = (themeId: string) => {
    if (!storeId) return
    activateTheme.mutate({ storeId, id: themeId })
  }

  const handleDuplicate = (themeId: string) => {
    if (!storeId) return
    duplicateTheme.mutate({ storeId, id: themeId })
  }

  const handleDelete = (themeId: string) => {
    if (!storeId) return
    if (confirm('Êtes-vous sûr de vouloir supprimer ce thème ?')) {
      deleteTheme.mutate({ storeId, id: themeId })
    }
  }

  const handleSeedThemes = () => {
    if (!storeId) return
    seedThemes.mutate({ storeId })
  }

  const selectedTheme = themes?.find((t) => t.id === selectedThemeId)

  if (!storeId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">{t('noStoreSelected')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thèmes</h1>
          <p className="text-gray-500 mt-1">Personnalisez l'apparence de votre boutique</p>
        </div>
        <div className="flex gap-2">
          {themes?.length === 0 && (
            <Button
              variant="outline"
              onClick={handleSeedThemes}
              disabled={seedThemes.isPending}
              className="gap-2"
            >
              {seedThemes.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Charger les thèmes par défaut
            </Button>
          )}
          <Button variant="primary" onClick={handleCreateTheme} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouveau thème
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      ) : themes?.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Palette className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun thème</h3>
          <p className="text-gray-500 mb-4">
            Créez un thème ou chargez les thèmes par défaut
          </p>
          <Button variant="primary" onClick={handleSeedThemes} className="gap-2">
            <Palette className="w-4 h-4" />
            Charger les thèmes par défaut
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Theme List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Vos thèmes
            </h3>
            <div className="space-y-2">
              {themes?.map((theme) => (
                <div
                  key={theme.id}
                  onClick={() => setSelectedThemeId(theme.id)}
                  className={cn(
                    'p-4 bg-white rounded-xl border cursor-pointer transition-all',
                    selectedThemeId === theme.id
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg"
                        style={{
                          background: `linear-gradient(135deg, ${(theme.config as any)?.colors?.primary || '#6366f1'}, ${(theme.config as any)?.colors?.secondary || '#ec4899'})`,
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{theme.name}</p>
                        <p className="text-xs text-gray-500">
                          {theme.isSystem ? 'Système' : 'Personnalisé'}
                        </p>
                      </div>
                    </div>
                    {theme.isActive && (
                      <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        <Check className="w-3 h-3" />
                        Actif
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Theme Editor */}
          <div className="lg:col-span-2 space-y-6">
            {selectedTheme && (
              <>
                {/* Theme Actions */}
                <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedTheme.name}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedTheme.description || 'Aucune description'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!selectedTheme.isActive && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleActivate(selectedTheme.id)}
                        disabled={activateTheme.isPending}
                        className="gap-1"
                      >
                        <Check className="w-4 h-4" />
                        Activer
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(selectedTheme.id)}
                      className="gap-1"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    {!selectedTheme.isActive && !selectedTheme.isSystem && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(selectedTheme.id)}
                        className="gap-1 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Editor Tabs */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="flex border-b border-gray-200">
                    {[
                      { id: 'colors', label: 'Couleurs', icon: Palette },
                      { id: 'fonts', label: 'Polices', icon: Type },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                          'flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors',
                          activeTab === tab.id
                            ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        )}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-6">
                    {activeTab === 'colors' && (
                      <div className="space-y-6">
                        {/* Quick Presets */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Presets rapides
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {COLOR_PRESETS.map((preset) => (
                              <button
                                key={preset.name}
                                onClick={() => {
                                  handleConfigChange('colors.primary', preset.primary)
                                  handleConfigChange('colors.secondary', preset.secondary)
                                }}
                                className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <div
                                  className="w-5 h-5 rounded"
                                  style={{
                                    background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})`,
                                  }}
                                />
                                <span className="text-sm text-gray-700">{preset.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Color Pickers */}
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { key: 'primary', label: 'Primaire' },
                            { key: 'secondary', label: 'Secondaire' },
                            { key: 'accent', label: 'Accent' },
                            { key: 'background', label: 'Fond' },
                            { key: 'surface', label: 'Surface' },
                            { key: 'text', label: 'Texte' },
                            { key: 'textSecondary', label: 'Texte secondaire' },
                            { key: 'border', label: 'Bordure' },
                          ].map((color) => (
                            <div key={color.key}>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {color.label}
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={(localConfig.colors as any)[color.key]}
                                  onChange={(e) =>
                                    handleConfigChange(`colors.${color.key}`, e.target.value)
                                  }
                                  className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                                />
                                <input
                                  type="text"
                                  value={(localConfig.colors as any)[color.key]}
                                  onChange={(e) =>
                                    handleConfigChange(`colors.${color.key}`, e.target.value)
                                  }
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'fonts' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Police des titres
                            </label>
                            <select
                              value={localConfig.fonts.heading}
                              onChange={(e) =>
                                handleConfigChange('fonts.heading', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                              {FONT_OPTIONS.map((font) => (
                                <option key={font.value} value={font.value}>
                                  {font.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Police du corps
                            </label>
                            <select
                              value={localConfig.fonts.body}
                              onChange={(e) => handleConfigChange('fonts.body', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                              {FONT_OPTIONS.map((font) => (
                                <option key={font.value} value={font.value}>
                                  {font.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Font Preview */}
                        <div className="p-6 bg-gray-50 rounded-xl">
                          <h4
                            className="text-2xl font-bold mb-2"
                            style={{ fontFamily: localConfig.fonts.heading }}
                          >
                            Aperçu des titres
                          </h4>
                          <p style={{ fontFamily: localConfig.fonts.body }}>
                            Ceci est un aperçu du texte de corps avec la police sélectionnée.
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Save Button */}
                  {hasChanges && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                      <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={updateTheme.isPending}
                        className="gap-2"
                      >
                        {updateTheme.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Enregistrer les modifications
                      </Button>
                    </div>
                  )}
                </div>

                {/* Live Preview */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Aperçu en direct
                    </h3>
                    <button
                      onClick={() => setIsDarkPreview(!isDarkPreview)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {isDarkPreview ? (
                        <Sun className="w-4 h-4" />
                      ) : (
                        <Moon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div
                    className="p-6"
                    style={{
                      backgroundColor: isDarkPreview ? '#1f2937' : localConfig.colors.background,
                      fontFamily: localConfig.fonts.body,
                    }}
                  >
                    <div
                      className="p-4 rounded-xl mb-4"
                      style={{ backgroundColor: localConfig.colors.surface }}
                    >
                      <h3
                        className="text-xl font-bold mb-2"
                        style={{
                          color: localConfig.colors.text,
                          fontFamily: localConfig.fonts.heading,
                        }}
                      >
                        Titre de section
                      </h3>
                      <p style={{ color: localConfig.colors.textSecondary }}>
                        Texte de description avec la couleur secondaire.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        className="px-4 py-2 rounded-lg font-medium text-white"
                        style={{ backgroundColor: localConfig.colors.primary }}
                      >
                        Bouton primaire
                      </button>
                      <button
                        className="px-4 py-2 rounded-lg font-medium"
                        style={{
                          backgroundColor: localConfig.colors.secondary,
                          color: '#fff',
                        }}
                      >
                        Bouton secondaire
                      </button>
                      <button
                        className="px-4 py-2 rounded-lg font-medium"
                        style={{
                          border: `1px solid ${localConfig.colors.border}`,
                          color: localConfig.colors.text,
                        }}
                      >
                        Bouton outline
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
