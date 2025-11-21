'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Store,
  Download,
  Star,
  Check,
  Search,
  RefreshCw,
} from 'lucide-react'
import { useStoreContext } from '@/lib/context/store-context'

export default function MarketplacePage() {
  const { storeId } = useStoreContext()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const { data: presets, refetch: refetchPresets } = trpc.theme.getPresets.useQuery({
    search: searchTerm || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
  })

  const { data: installedThemes, refetch: refetchInstalledThemes } = trpc.theme.getAll.useQuery({ storeId: storeId! })

  const seedPresetsMutation = trpc.theme.seedPresets.useMutation()
  const installFromPresetMutation = trpc.theme.installFromPreset.useMutation()

  const handleSeedPresets = async () => {
    seedPresetsMutation.mutate(undefined, {
      onSuccess: (data) => {
        alert(data.message)
        refetchPresets()
      },
      onError: (error) => {
        alert(error.message)
      },
    })
  }

  const handleInstallTheme = async (presetId: string, presetName: string) => {
    if (!confirm(`Installer le thème "${presetName}" ?`)) return

    installFromPresetMutation.mutate(
      { storeId: storeId!, presetId },
      {
        onSuccess: () => {
          alert('Thème installé avec succès!')
          // Rafraîchir à la fois les presets ET les thèmes installés
          refetchPresets()
          refetchInstalledThemes()
        },
        onError: (error) => {
          alert(error.message)
        },
      }
    )
  }

  const isThemeInstalled = (presetId: string) => {
    return installedThemes?.some((theme) => theme.sourcePresetId === presetId)
  }

  const availableTags = ['minimal', 'luxe', 'tech', 'ecommerce', 'responsive']

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketplace de Thèmes</h1>
          <p className="text-gray-600">
            Découvrez et installez des thèmes pour votre boutique
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={handleSeedPresets}
          disabled={seedPresetsMutation.isPending}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {seedPresetsMutation.isPending ? 'Initialisation...' : 'Initialiser les presets'}
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un thème..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Tags */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Filtrer par tags</p>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    if (selectedTags.includes(tag)) {
                      setSelectedTags(selectedTags.filter((t) => t !== tag))
                    } else {
                      setSelectedTags([...selectedTags, tag])
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Theme Grid */}
      {presets && presets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {presets.map((preset) => {
            const installed = isThemeInstalled(preset.id)
            const config = preset.config as any

            return (
              <Card key={preset.id} className="p-6">
                {/* Preview */}
                {config && config.colors && (
                  <div className="mb-4 h-32 rounded-lg overflow-hidden border border-gray-200">
                    <div
                      className="h-full flex items-center justify-center"
                      style={{ backgroundColor: config.colors.background }}
                    >
                      <div className="text-center">
                        <div
                          className="text-3xl font-bold mb-2"
                          style={{ color: config.colors.primary }}
                        >
                          {preset.name}
                        </div>
                        <div
                          className="text-sm"
                          style={{ color: config.colors.textSecondary }}
                        >
                          Aperçu du thème
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {preset.name}
                    </h3>
                    {installed && (
                      <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Installé
                      </span>
                    )}
                    {preset.isPremium && (
                      <span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">
                        Premium
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {preset.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {preset.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {preset.installCount} installations
                    </div>
                    {preset.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {preset.rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Color Palette */}
                {config && config.colors && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      Palette de couleurs
                    </p>
                    <div className="flex gap-2">
                      <div
                        className="w-10 h-10 rounded-lg border border-gray-200"
                        style={{ backgroundColor: config.colors.primary }}
                        title="Primary"
                      />
                      <div
                        className="w-10 h-10 rounded-lg border border-gray-200"
                        style={{ backgroundColor: config.colors.secondary }}
                        title="Secondary"
                      />
                      <div
                        className="w-10 h-10 rounded-lg border border-gray-200"
                        style={{ backgroundColor: config.colors.accent }}
                        title="Accent"
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant={installed ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => handleInstallTheme(preset.id, preset.name)}
                    disabled={installed || installFromPresetMutation.isPending}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    {installed ? 'Déjà installé' : 'Installer'}
                  </Button>
                </div>

                {/* Author & Version */}
                <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-gray-500">
                  <span>Par {preset.author || 'Inconnu'}</span>
                  <span>v{preset.version}</span>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun thème disponible
          </h3>
          <p className="text-gray-600 mb-4">
            Initialisez les presets pour voir les thèmes disponibles
          </p>
          <Button variant="primary" onClick={handleSeedPresets}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Initialiser les presets
          </Button>
        </Card>
      )}
    </div>
  )
}
