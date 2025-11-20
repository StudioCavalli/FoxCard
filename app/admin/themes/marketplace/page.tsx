'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  ArrowLeft,
  Search,
  Download,
  Star,
  Eye,
  Filter,
  X,
  Check,
  Sparkles,
  Crown,
  TrendingUp,
  Clock,
} from 'lucide-react'
import { generateThemeCSS } from '@/lib/themes/presets'

type SortOption = 'popular' | 'rating' | 'newest'
type FilterOption = 'all' | 'free' | 'premium'

export default function ThemeMarketplacePage() {
  const router = useRouter()
  const storeId = '000000000000000000000001' // TODO: Get from context

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('popular')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [previewPreset, setPreviewPreset] = useState<any>(null)
  const [installingId, setInstallingId] = useState<string | null>(null)

  // Fetch presets
  const { data: presets, isLoading, refetch } = trpc.theme.getPresets.useQuery({
    search: searchQuery || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
  })

  // Fetch installed themes to check what's already installed
  const { data: installedThemes } = trpc.theme.getAll.useQuery({ storeId })

  // Install mutation
  const installMutation = trpc.theme.installFromPreset.useMutation()

  // Get unique tags from presets
  const allTags = Array.from(
    new Set(presets?.flatMap((p) => p.tags || []) || [])
  ).sort()

  // Filter and sort presets
  const filteredPresets = presets
    ?.filter((preset) => {
      if (filterBy === 'free') return !preset.isPremium
      if (filterBy === 'premium') return preset.isPremium
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.installCount - a.installCount
        case 'rating':
          return b.rating - a.rating
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

  // Check if preset is installed
  const isInstalled = (presetId: string) => {
    return installedThemes?.some((t) => t.sourcePresetId === presetId)
  }

  // Handle install
  const handleInstall = async (preset: any) => {
    if (isInstalled(preset.id)) {
      alert('Ce thème est déjà installé')
      return
    }

    setInstallingId(preset.id)

    installMutation.mutate(
      {
        storeId,
        presetId: preset.id,
      },
      {
        onSuccess: () => {
          setInstallingId(null)
          refetch()
          alert(`Thème "${preset.name}" installé avec succès !`)
        },
        onError: (error) => {
          setInstallingId(null)
          alert(error.message)
        },
      }
    )
  }

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
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
                <h1 className="text-xl font-bold text-gray-900">
                  Marketplace de Thèmes
                </h1>
                <p className="text-sm text-gray-600">
                  Découvrez et installez des thèmes pour votre boutique
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {filteredPresets?.length || 0} thème{(filteredPresets?.length || 0) !== 1 ? 's' : ''} disponible{(filteredPresets?.length || 0) !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un thème..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="popular">Plus populaires</option>
              <option value="rating">Mieux notés</option>
              <option value="newest">Plus récents</option>
            </select>

            {/* Filter */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="all">Tous les thèmes</option>
              <option value="free">Gratuits</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  Effacer filtres
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredPresets && filteredPresets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPresets.map((preset) => (
              <Card key={preset.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Theme preview */}
                <div
                  className="h-48 relative"
                  style={{
                    backgroundColor: (preset.config as any)?.colors?.background || '#FFFFFF',
                  }}
                >
                  {/* Mini preview */}
                  <div className="absolute inset-4">
                    <div
                      className="w-full h-full rounded-lg border overflow-hidden"
                      style={{
                        borderColor: (preset.config as any)?.colors?.border || '#E5E5E5',
                        backgroundColor: (preset.config as any)?.colors?.surface || '#FAFAFA',
                      }}
                    >
                      {/* Header bar */}
                      <div
                        className="h-6 flex items-center px-2 border-b"
                        style={{
                          borderColor: (preset.config as any)?.colors?.border || '#E5E5E5',
                        }}
                      >
                        <div
                          className="w-16 h-2 rounded"
                          style={{
                            backgroundColor: (preset.config as any)?.colors?.text || '#000',
                          }}
                        />
                      </div>
                      {/* Content */}
                      <div className="p-3 space-y-2">
                        <div
                          className="w-24 h-3 rounded"
                          style={{
                            backgroundColor: (preset.config as any)?.colors?.text || '#000',
                          }}
                        />
                        <div
                          className="w-full h-2 rounded"
                          style={{
                            backgroundColor: (preset.config as any)?.colors?.textSecondary || '#666',
                          }}
                        />
                        <div
                          className="w-3/4 h-2 rounded"
                          style={{
                            backgroundColor: (preset.config as any)?.colors?.textSecondary || '#666',
                          }}
                        />
                        <div className="flex gap-2 mt-3">
                          <div
                            className="w-12 h-4 rounded"
                            style={{
                              backgroundColor: (preset.config as any)?.colors?.primary || '#3B82F6',
                              borderRadius: (preset.config as any)?.borderRadius || '0.25rem',
                            }}
                          />
                          <div
                            className="w-12 h-4 rounded border"
                            style={{
                              borderColor: (preset.config as any)?.colors?.border || '#E5E5E5',
                              borderRadius: (preset.config as any)?.borderRadius || '0.25rem',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {preset.isPremium && (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Premium
                      </span>
                    )}
                    {isInstalled(preset.id) && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Installé
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {preset.name}
                    </h3>
                    {preset.isPremium && preset.price && (
                      <span className="text-lg font-bold text-primary-600">
                        {preset.price}€
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {preset.description || 'Aucune description'}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>{preset.installCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{preset.rating.toFixed(1)}</span>
                      {preset.reviewCount > 0 && (
                        <span className="text-gray-400">({preset.reviewCount})</span>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {preset.tags && preset.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {preset.tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {preset.tags.length > 3 && (
                        <span className="px-2 py-0.5 text-xs text-gray-500">
                          +{preset.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPreviewPreset(preset)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Aperçu
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleInstall(preset)}
                      disabled={isInstalled(preset.id) || installingId === preset.id}
                      className="flex-1"
                    >
                      {installingId === preset.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                          Installation...
                        </>
                      ) : isInstalled(preset.id) ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Installé
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-1" />
                          Installer
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun thème trouvé
            </h3>
            <p className="text-gray-600">
              {searchQuery || selectedTags.length > 0
                ? 'Essayez de modifier vos critères de recherche'
                : 'Le marketplace est vide. Les thèmes seront bientôt disponibles.'}
            </p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewPreset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {previewPreset.name}
                </h2>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    {previewPreset.installCount} installations
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {previewPreset.rating.toFixed(1)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPreviewPreset(null)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Live preview */}
              <div
                className="rounded-lg border overflow-hidden mb-4"
                style={{
                  backgroundColor: (previewPreset.config as any)?.colors?.background || '#FFFFFF',
                }}
              >
                <style
                  dangerouslySetInnerHTML={{
                    __html: `:root { ${generateThemeCSS(previewPreset.config)} }`,
                  }}
                />

                {/* Header */}
                <header
                  className="border-b px-6 py-4"
                  style={{
                    borderColor: (previewPreset.config as any)?.colors?.border || '#E5E5E5',
                    backgroundColor: (previewPreset.config as any)?.colors?.surface || '#FAFAFA',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h3
                      className="text-lg font-bold"
                      style={{
                        color: (previewPreset.config as any)?.colors?.text || '#000',
                        fontFamily: `${(previewPreset.config as any)?.fonts?.heading || 'Inter'}, sans-serif`,
                      }}
                    >
                      Ma Boutique
                    </h3>
                    <nav className="flex gap-4">
                      {['Accueil', 'Produits', 'Contact'].map((item) => (
                        <span
                          key={item}
                          className="text-sm"
                          style={{
                            color: (previewPreset.config as any)?.colors?.textSecondary || '#6B7280',
                            fontFamily: `${(previewPreset.config as any)?.fonts?.body || 'Inter'}, sans-serif`,
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </nav>
                  </div>
                </header>

                {/* Hero */}
                <section className="px-6 py-8">
                  <h2
                    className="text-2xl font-bold mb-2"
                    style={{
                      color: (previewPreset.config as any)?.colors?.text || '#000',
                      fontFamily: `${(previewPreset.config as any)?.fonts?.heading || 'Inter'}, sans-serif`,
                    }}
                  >
                    Bienvenue
                  </h2>
                  <p
                    className="mb-4"
                    style={{
                      color: (previewPreset.config as any)?.colors?.textSecondary || '#6B7280',
                      fontFamily: `${(previewPreset.config as any)?.fonts?.body || 'Inter'}, sans-serif`,
                    }}
                  >
                    Découvrez notre collection
                  </p>
                  <button
                    className="px-4 py-2 text-white text-sm font-medium"
                    style={{
                      backgroundColor: (previewPreset.config as any)?.colors?.primary || '#3B82F6',
                      borderRadius: (previewPreset.config as any)?.borderRadius || '0.5rem',
                    }}
                  >
                    Voir les produits
                  </button>
                </section>

                {/* Products */}
                <section className="px-6 pb-6">
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="border overflow-hidden"
                        style={{
                          borderColor: (previewPreset.config as any)?.colors?.border || '#E5E5E5',
                          borderRadius: (previewPreset.config as any)?.borderRadius || '0.5rem',
                        }}
                      >
                        <div
                          className="h-20"
                          style={{
                            backgroundColor: (previewPreset.config as any)?.colors?.borderLight || '#F5F5F5',
                          }}
                        />
                        <div className="p-2">
                          <div
                            className="text-sm font-medium"
                            style={{
                              color: (previewPreset.config as any)?.colors?.text || '#000',
                            }}
                          >
                            Produit {i}
                          </div>
                          <div
                            className="text-sm font-bold"
                            style={{
                              color: (previewPreset.config as any)?.colors?.primary || '#3B82F6',
                            }}
                          >
                            29,99 €
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">
                  {previewPreset.description || 'Aucune description disponible.'}
                </p>
              </div>

              {/* Tags */}
              {previewPreset.tags && previewPreset.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {previewPreset.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
              <div>
                {previewPreset.isPremium && previewPreset.price ? (
                  <span className="text-2xl font-bold text-primary-600">
                    {previewPreset.price}€
                  </span>
                ) : (
                  <span className="text-lg font-medium text-green-600">
                    Gratuit
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setPreviewPreset(null)}
                >
                  Fermer
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    handleInstall(previewPreset)
                    setPreviewPreset(null)
                  }}
                  disabled={isInstalled(previewPreset.id)}
                >
                  {isInstalled(previewPreset.id) ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Déjà installé
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Installer ce thème
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
