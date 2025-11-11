'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Palette, RotateCcw, Save } from 'lucide-react'

const STORE_ID = '000000000000000000000001'

export default function ThemePage() {
  const [customColors, setCustomColors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  const { data: currentTheme, refetch } = trpc.theme.getCurrent.useQuery({ storeId: STORE_ID })
  const { data: availableThemes } = trpc.theme.getAll.useQuery()
  const updateTheme = trpc.theme.update.useMutation()
  const resetTheme = trpc.theme.reset.useMutation()

  const handleColorChange = (colorKey: string, value: string) => {
    setCustomColors((prev) => ({
      ...prev,
      [colorKey]: value,
    }))
  }

  const handleSave = async () => {
    if (!currentTheme) return

    setIsSaving(true)
    try {
      await updateTheme.mutateAsync({
        storeId: STORE_ID,
        themeId: currentTheme.id,
        customColors: Object.keys(customColors).length > 0 ? customColors : undefined,
      })
      await refetch()
      setCustomColors({})
      alert('Thème sauvegardé avec succès !')
    } catch (error) {
      console.error('Error saving theme:', error)
      alert('Erreur lors de la sauvegarde du thème')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Voulez-vous vraiment réinitialiser le thème par défaut ?')) {
      return
    }

    try {
      await resetTheme.mutateAsync({ storeId: STORE_ID })
      await refetch()
      setCustomColors({})
      alert('Thème réinitialisé avec succès !')
    } catch (error) {
      console.error('Error resetting theme:', error)
      alert('Erreur lors de la réinitialisation du thème')
    }
  }

  if (!currentTheme) {
    return <div className="p-8">Chargement...</div>
  }

  const colors = currentTheme.colors.light

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Palette className="w-8 h-8 text-teal-600" />
              Personnalisation du Thème
            </h1>
            <p className="mt-2 text-gray-600">
              Personnalisez les couleurs et l'apparence de votre boutique
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Réinitialiser
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving || Object.keys(customColors).length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Theme Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Thème Actuel</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nom</p>
              <p className="font-medium">{currentTheme.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Version</p>
              <p className="font-medium">{currentTheme.version}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Description</p>
              <p className="font-medium">{currentTheme.description}</p>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">Couleurs</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(colors).map(([key, value]) => {
              const currentValue = customColors[key] || value

              return (
                <div key={key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>

                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={currentValue}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="w-16 h-10 rounded-lg cursor-pointer border border-gray-300"
                    />

                    <div className="flex-1">
                      <input
                        type="text"
                        value={currentValue}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  {customColors[key] && (
                    <button
                      onClick={() => {
                        const newColors = { ...customColors }
                        delete newColors[key]
                        setCustomColors(newColors)
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Réinitialiser cette couleur
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">Aperçu</h2>

          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <button
                className="px-4 py-2 rounded-xl text-white font-medium"
                style={{ backgroundColor: customColors.primary || colors.primary }}
              >
                Bouton Primary
              </button>
              <button
                className="px-4 py-2 rounded-xl text-white font-medium"
                style={{ backgroundColor: customColors.secondary || colors.secondary }}
              >
                Bouton Secondary
              </button>
              <button
                className="px-4 py-2 rounded-xl text-white font-medium"
                style={{ backgroundColor: customColors.accent || colors.accent }}
              >
                Bouton Accent
              </button>
            </div>

            <div
              className="p-6 rounded-xl"
              style={{
                backgroundColor: customColors.muted || colors.muted,
                borderColor: customColors.border || colors.border,
                borderWidth: '1px',
              }}
            >
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: customColors.foreground || colors.foreground }}
              >
                Exemple de Card
              </h3>
              <p style={{ color: customColors.foreground || colors.foreground }}>
                Ceci est un exemple de contenu avec les couleurs personnalisées.
              </p>
            </div>

            <div className="flex gap-2">
              <div
                className="px-3 py-1 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: customColors.success || colors.success,
                  color: 'white',
                }}
              >
                Succès
              </div>
              <div
                className="px-3 py-1 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: customColors.warning || colors.warning,
                  color: 'white',
                }}
              >
                Avertissement
              </div>
              <div
                className="px-3 py-1 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: customColors.error || colors.error,
                  color: 'white',
                }}
              >
                Erreur
              </div>
            </div>
          </div>
        </div>
      </div>

      {Object.keys(customColors).length > 0 && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-800">
            💡 Vous avez {Object.keys(customColors).length} couleur
            {Object.keys(customColors).length > 1 ? 's' : ''} personnalisée
            {Object.keys(customColors).length > 1 ? 's' : ''}. N'oubliez pas de sauvegarder vos
            modifications !
          </p>
        </div>
      )}
    </div>
  )
}
