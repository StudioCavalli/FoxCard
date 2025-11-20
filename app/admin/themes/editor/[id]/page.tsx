'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/Button'
import { ColorPicker } from '@/components/admin/theme-editor/ColorPicker'
import { FontSelector } from '@/components/admin/theme-editor/FontSelector'
import { SpacingEditor, BorderRadiusEditor } from '@/components/admin/theme-editor/SpacingEditor'
import { ThemePreview } from '@/components/admin/theme-editor/ThemePreview'
import {
  ArrowLeft,
  Save,
  Undo2,
  Redo2,
  Palette,
  Type,
  Layout,
  Layers,
  RotateCcw,
  Eye,
  EyeOff,
} from 'lucide-react'

type TabType = 'colors' | 'typography' | 'spacing' | 'advanced'

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
  shadows?: {
    sm: string
    md: string
    lg: string
    xl: string
  }
}

const defaultConfig: ThemeConfig = {
  colors: {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    background: '#FFFFFF',
    surface: '#FAFAFA',
    text: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    border: '#E5E5E5',
    borderLight: '#F5F5F5',
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

export default function ThemeEditorPage() {
  const params = useParams()
  const router = useRouter()
  const themeId = params.id as string
  const storeId = '000000000000000000000001' // TODO: Get from context

  // State
  const [activeTab, setActiveTab] = useState<TabType>('colors')
  const [config, setConfig] = useState<ThemeConfig>(defaultConfig)
  const [originalConfig, setOriginalConfig] = useState<ThemeConfig>(defaultConfig)
  const [themeName, setThemeName] = useState('')
  const [themeDescription, setThemeDescription] = useState('')
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [showPreview, setShowPreview] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)

  // History for undo/redo
  const [history, setHistory] = useState<ThemeConfig[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Fetch theme data
  const { data: theme, isLoading } = trpc.theme.getById.useQuery(
    { storeId, id: themeId },
    { enabled: !!themeId && themeId !== 'new' }
  )

  // Mutations
  const updateThemeMutation = trpc.theme.update.useMutation()
  const createThemeMutation = trpc.theme.create.useMutation()

  // Load theme data
  useEffect(() => {
    if (theme) {
      const loadedConfig = {
        ...defaultConfig,
        ...theme.config,
        colors: { ...defaultConfig.colors, ...(theme.config as any)?.colors },
        fonts: { ...defaultConfig.fonts, ...(theme.config as any)?.fonts },
        spacing: { ...defaultConfig.spacing, ...(theme.config as any)?.spacing },
      }
      setConfig(loadedConfig)
      setOriginalConfig(loadedConfig)
      setThemeName(theme.name)
      setThemeDescription(theme.description || '')
      setHistory([loadedConfig])
      setHistoryIndex(0)
    }
  }, [theme])

  // Track changes
  useEffect(() => {
    const configChanged = JSON.stringify(config) !== JSON.stringify(originalConfig)
    const nameChanged = theme && themeName !== theme.name
    const descChanged = theme && themeDescription !== (theme.description || '')
    setHasChanges(configChanged || nameChanged || descChanged)
  }, [config, originalConfig, themeName, themeDescription, theme])

  // Update config with history
  const updateConfig = useCallback((newConfig: ThemeConfig) => {
    setConfig(newConfig)

    // Add to history (remove future states if we're not at the end)
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newConfig)

    // Limit history to 50 states
    if (newHistory.length > 50) {
      newHistory.shift()
    }

    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setConfig(history[historyIndex - 1])
    }
  }, [history, historyIndex])

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setConfig(history[historyIndex + 1])
    }
  }, [history, historyIndex])

  // Reset to original
  const handleReset = useCallback(() => {
    if (confirm('Voulez-vous annuler toutes les modifications ?')) {
      setConfig(originalConfig)
      setHistory([originalConfig])
      setHistoryIndex(0)
      if (theme) {
        setThemeName(theme.name)
        setThemeDescription(theme.description || '')
      }
    }
  }, [originalConfig, theme])

  // Save theme
  const handleSave = async () => {
    if (themeId === 'new') {
      createThemeMutation.mutate(
        {
          storeId,
          name: themeName || 'Nouveau thème',
          description: themeDescription,
          config,
        },
        {
          onSuccess: (data) => {
            setOriginalConfig(config)
            setHasChanges(false)
            router.push(`/admin/themes/editor/${data.id}`)
          },
          onError: (error) => {
            alert(error.message)
          },
        }
      )
    } else {
      updateThemeMutation.mutate(
        {
          storeId,
          id: themeId,
          name: themeName,
          description: themeDescription,
          config,
        },
        {
          onSuccess: () => {
            setOriginalConfig(config)
            setHasChanges(false)
          },
          onError: (error) => {
            alert(error.message)
          },
        }
      )
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          handleRedo()
        } else {
          handleUndo()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave, handleUndo, handleRedo])

  if (isLoading && themeId !== 'new') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const tabs = [
    { id: 'colors' as TabType, label: 'Couleurs', icon: Palette },
    { id: 'typography' as TabType, label: 'Typographie', icon: Type },
    { id: 'spacing' as TabType, label: 'Espacement', icon: Layout },
    { id: 'advanced' as TabType, label: 'Avancé', icon: Layers },
  ]

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/themes')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div className="h-6 w-px bg-gray-200" />
          <div>
            <input
              type="text"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              placeholder="Nom du thème"
              className="text-lg font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Annuler (Cmd+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Rétablir (Cmd+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={!hasChanges}
            title="Réinitialiser"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <div className="h-6 w-px bg-gray-200 mx-2" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            title={showPreview ? 'Masquer preview' : 'Afficher preview'}
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || updateThemeMutation.isPending || createThemeMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            {updateThemeMutation.isPending || createThemeMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Editor Panel */}
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {activeTab === 'colors' && (
              <>
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Couleurs principales</h3>
                  <ColorPicker
                    label="Primaire"
                    value={config.colors.primary}
                    onChange={(value) =>
                      updateConfig({
                        ...config,
                        colors: { ...config.colors, primary: value },
                      })
                    }
                    description="Boutons principaux, liens, accents"
                  />
                  <ColorPicker
                    label="Secondaire"
                    value={config.colors.secondary}
                    onChange={(value) =>
                      updateConfig({
                        ...config,
                        colors: { ...config.colors, secondary: value },
                      })
                    }
                    description="Éléments secondaires, badges"
                  />
                  <ColorPicker
                    label="Accent"
                    value={config.colors.accent}
                    onChange={(value) =>
                      updateConfig({
                        ...config,
                        colors: { ...config.colors, accent: value },
                      })
                    }
                    description="Mises en évidence, notifications"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Arrière-plans</h3>
                  <ColorPicker
                    label="Fond de page"
                    value={config.colors.background}
                    onChange={(value) =>
                      updateConfig({
                        ...config,
                        colors: { ...config.colors, background: value },
                      })
                    }
                  />
                  <ColorPicker
                    label="Surface"
                    value={config.colors.surface}
                    onChange={(value) =>
                      updateConfig({
                        ...config,
                        colors: { ...config.colors, surface: value },
                      })
                    }
                    description="Cartes, modales, sections"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Texte</h3>
                  <ColorPicker
                    label="Texte principal"
                    value={config.colors.text}
                    onChange={(value) =>
                      updateConfig({
                        ...config,
                        colors: { ...config.colors, text: value },
                      })
                    }
                  />
                  <ColorPicker
                    label="Texte secondaire"
                    value={config.colors.textSecondary}
                    onChange={(value) =>
                      updateConfig({
                        ...config,
                        colors: { ...config.colors, textSecondary: value },
                      })
                    }
                  />
                  <ColorPicker
                    label="Texte atténué"
                    value={config.colors.textMuted}
                    onChange={(value) =>
                      updateConfig({
                        ...config,
                        colors: { ...config.colors, textMuted: value },
                      })
                    }
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Bordures</h3>
                  <ColorPicker
                    label="Bordure standard"
                    value={config.colors.border}
                    onChange={(value) =>
                      updateConfig({
                        ...config,
                        colors: { ...config.colors, border: value },
                      })
                    }
                  />
                  <ColorPicker
                    label="Bordure légère"
                    value={config.colors.borderLight}
                    onChange={(value) =>
                      updateConfig({
                        ...config,
                        colors: { ...config.colors, borderLight: value },
                      })
                    }
                  />
                </div>
              </>
            )}

            {activeTab === 'typography' && (
              <>
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Polices</h3>
                  <FontSelector
                    label="Police des titres"
                    value={config.fonts.heading}
                    onChange={(value) =>
                      updateConfig({
                        ...config,
                        fonts: { ...config.fonts, heading: value },
                      })
                    }
                  />
                  <FontSelector
                    label="Police du corps"
                    value={config.fonts.body}
                    onChange={(value) =>
                      updateConfig({
                        ...config,
                        fonts: { ...config.fonts, body: value },
                      })
                    }
                  />
                </div>

                {/* Font preview */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Aperçu</h3>
                  <div className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <h4
                      className="text-2xl font-bold"
                      style={{ fontFamily: `${config.fonts.heading}, sans-serif` }}
                    >
                      Titre d'exemple
                    </h4>
                    <p
                      className="text-base"
                      style={{ fontFamily: `${config.fonts.body}, sans-serif` }}
                    >
                      Ceci est un paragraphe d'exemple pour voir comment le texte du corps s'affiche avec la police sélectionnée.
                    </p>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'spacing' && (
              <>
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Conteneur</h3>
                  <SpacingEditor
                    label="Largeur max du conteneur"
                    value={config.spacing.containerMaxWidth}
                    onChange={(value) =>
                      updateConfig({
                        ...config,
                        spacing: { ...config.spacing, containerMaxWidth: value },
                      })
                    }
                    description="Largeur maximale du contenu principal"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Sections</h3>
                  <SpacingEditor
                    label="Padding des sections"
                    value={config.spacing.sectionPadding}
                    onChange={(value) =>
                      updateConfig({
                        ...config,
                        spacing: { ...config.spacing, sectionPadding: value },
                      })
                    }
                    description="Espacement vertical entre les sections"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Forme</h3>
                  <BorderRadiusEditor
                    value={config.borderRadius}
                    onChange={(value) =>
                      updateConfig({ ...config, borderRadius: value })
                    }
                  />
                </div>
              </>
            )}

            {activeTab === 'advanced' && (
              <>
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Description du thème</h3>
                  <textarea
                    value={themeDescription}
                    onChange={(e) => setThemeDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Description du thème..."
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Export / Import</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const json = JSON.stringify(config, null, 2)
                        navigator.clipboard.writeText(json)
                        alert('Configuration copiée dans le presse-papier')
                      }}
                    >
                      Exporter JSON
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = prompt('Collez la configuration JSON :')
                        if (input) {
                          try {
                            const imported = JSON.parse(input)
                            updateConfig({ ...defaultConfig, ...imported })
                          } catch (e) {
                            alert('JSON invalide')
                          }
                        }
                      }}
                    >
                      Importer JSON
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Informations</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>ID: {themeId}</p>
                    <p>Historique: {historyIndex + 1} / {history.length}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="flex-1">
            <ThemePreview
              config={config}
              viewport={viewport}
              onViewportChange={setViewport}
            />
          </div>
        )}
      </div>
    </div>
  )
}
