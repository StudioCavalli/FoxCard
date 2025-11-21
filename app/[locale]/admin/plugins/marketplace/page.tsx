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
  Check,
  X,
  Puzzle,
  Truck,
  Megaphone,
  BarChart3,
  Link,
  Wrench,
  Package,
  Filter,
} from 'lucide-react'

const categoryIcons: Record<string, any> = {
  shipping: Truck,
  marketing: Megaphone,
  seo: Search,
  analytics: BarChart3,
  email: Package,
  automation: Link,
  reviews: Package,
  ux: Wrench,
}

const typeLabels: Record<string, string> = {
  SHIPPING: 'Expédition',
  MARKETING: 'Marketing',
  SEO: 'SEO',
  ANALYTICS: 'Analytics',
  INTEGRATION: 'Intégration',
  UTILITY: 'Utilitaire',
}

const categories = [
  { id: 'all', label: 'Tous', icon: Puzzle },
  { id: 'shipping', label: 'Expédition', icon: Truck },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'email', label: 'Email', icon: Package },
  { id: 'automation', label: 'Automation', icon: Link },
]

export default function PluginMarketplacePage() {
  const router = useRouter()
  const storeId = '000000000000000000000001' // TODO: Get from context

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [previewPlugin, setPreviewPlugin] = useState<any>(null)
  const [installingId, setInstallingId] = useState<string | null>(null)

  // Fetch presets
  const { data: presets, isLoading, refetch } = trpc.plugin.getPresets.useQuery({
    search: searchQuery || undefined,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
  })

  // Fetch installed plugins
  const { data: installedPlugins } = trpc.plugin.getAll.useQuery({ storeId })

  // Install mutation
  const installMutation = trpc.plugin.installFromPreset.useMutation()

  // Get unique tags
  const allTags = Array.from(
    new Set(presets?.flatMap((p) => p.tags || []) || [])
  ).sort()

  // Check if installed
  const isInstalled = (slug: string) => {
    return installedPlugins?.some((p) => p.slug === slug)
  }

  // Handle install
  const handleInstall = async (preset: any) => {
    if (isInstalled(preset.slug)) {
      alert('Ce plugin est déjà installé')
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
          alert(`Plugin "${preset.name}" installé avec succès !`)
        },
        onError: (error) => {
          setInstallingId(null)
          alert(error.message)
        },
      }
    )
  }

  // Toggle tag
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
                onClick={() => router.push('/admin/plugins')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <div className="h-6 w-px bg-gray-200" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Marketplace de Plugins
                </h1>
                <p className="text-sm text-gray-600">
                  Étendez les fonctionnalités de votre boutique
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {presets?.length || 0} plugin{(presets?.length || 0) !== 1 ? 's' : ''} disponible{(presets?.length || 0) !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Search */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un plugin..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              )
            })}
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {allTags.slice(0, 15).map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  Effacer
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
        ) : presets && presets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presets.map((preset) => {
              const CategoryIcon = categoryIcons[preset.category] || Puzzle
              const installed = isInstalled(preset.slug)

              return (
                <Card key={preset.id} className="p-4 hover:shadow-lg transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                        {preset.icon || <CategoryIcon className="w-6 h-6 text-gray-600" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{preset.name}</h3>
                        <span className="text-xs text-gray-500">
                          {typeLabels[preset.type] || preset.type}
                        </span>
                      </div>
                    </div>
                    {installed && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Installé
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {preset.description || 'Aucune description'}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>{preset.installCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{preset.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-xs">v{preset.version}</span>
                  </div>

                  {/* Tags */}
                  {preset.tags && preset.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {preset.tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPreviewPlugin(preset)}
                      className="flex-1"
                    >
                      Détails
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleInstall(preset)}
                      disabled={installed || installingId === preset.id}
                      className="flex-1"
                    >
                      {installingId === preset.id ? (
                        'Installation...'
                      ) : installed ? (
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
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Puzzle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun plugin trouvé
            </h3>
            <p className="text-gray-600">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewPlugin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                  {previewPlugin.icon || <Puzzle className="w-6 h-6 text-gray-600" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {previewPlugin.name}
                  </h2>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{typeLabels[previewPlugin.type]}</span>
                    <span>v{previewPlugin.version}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPreviewPlugin(null)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Stats */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">{previewPlugin.installCount}</span>
                  <span className="text-gray-500">installations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{previewPlugin.rating.toFixed(1)}</span>
                  {previewPlugin.reviewCount > 0 && (
                    <span className="text-gray-500">({previewPlugin.reviewCount} avis)</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{previewPlugin.description}</p>
              </div>

              {/* Hooks */}
              {previewPlugin.hooks && previewPlugin.hooks.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Événements écoutés</h4>
                  <div className="flex flex-wrap gap-2">
                    {previewPlugin.hooks.map((hook: string) => (
                      <code
                        key={hook}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {hook}
                      </code>
                    ))}
                  </div>
                </div>
              )}

              {/* Permissions */}
              {previewPlugin.permissions && previewPlugin.permissions.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Permissions requises</h4>
                  <div className="flex flex-wrap gap-2">
                    {previewPlugin.permissions.map((perm: string) => (
                      <span
                        key={perm}
                        className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {previewPlugin.tags && previewPlugin.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {previewPlugin.tags.map((tag: string) => (
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

              {/* Author */}
              {previewPlugin.author && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Auteur</h4>
                  <p className="text-gray-600">{previewPlugin.author}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
              <div>
                {previewPlugin.isPremium && previewPlugin.price ? (
                  <span className="text-xl font-bold text-primary-600">
                    {previewPlugin.price}€
                  </span>
                ) : (
                  <span className="text-lg font-medium text-green-600">Gratuit</span>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setPreviewPlugin(null)}>
                  Fermer
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    handleInstall(previewPlugin)
                    setPreviewPlugin(null)
                  }}
                  disabled={isInstalled(previewPlugin.slug)}
                >
                  {isInstalled(previewPlugin.slug) ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Déjà installé
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Installer
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
