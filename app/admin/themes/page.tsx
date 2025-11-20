'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import {
  Palette,
  Plus,
  Edit,
  Trash2,
  Copy,
  Check,
  Eye,
  X,
  Download,
  Paintbrush,
  Store,
} from 'lucide-react'

export default function ThemesPage() {
  const router = useRouter()
  const storeId = '000000000000000000000001' // TODO: Get from context

  const { data: themes, refetch: refetchThemes } = trpc.theme.getAll.useQuery({
    storeId,
  })

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B',
      background: '#FFFFFF',
      text: '#111827',
      textSecondary: '#6B7280',
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
  })

  const createThemeMutation = trpc.theme.create.useMutation()
  const updateThemeMutation = trpc.theme.update.useMutation()
  const deleteThemeMutation = trpc.theme.delete.useMutation()
  const activateThemeMutation = trpc.theme.activate.useMutation()
  const duplicateThemeMutation = trpc.theme.duplicate.useMutation()
  const seedSystemThemesMutation = trpc.theme.seedSystemThemes.useMutation()

  const handleCreateTheme = async () => {
    createThemeMutation.mutate(
      {
        storeId,
        name: formData.name,
        description: formData.description,
        config: {
          colors: formData.colors,
          fonts: formData.fonts,
          spacing: formData.spacing,
          borderRadius: formData.borderRadius,
        },
      },
      {
        onSuccess: () => {
          setShowCreateModal(false)
          refetchThemes()
          // Reset form
          setFormData({
            name: '',
            description: '',
            colors: {
              primary: '#3B82F6',
              secondary: '#10B981',
              accent: '#F59E0B',
              background: '#FFFFFF',
              text: '#111827',
              textSecondary: '#6B7280',
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
          })
        },
        onError: (error) => {
          alert(error.message)
        },
      }
    )
  }

  const handleEditTheme = async () => {
    if (!selectedTheme) return

    updateThemeMutation.mutate(
      {
        storeId,
        id: selectedTheme.id,
        name: formData.name,
        description: formData.description,
        config: {
          colors: formData.colors,
          fonts: formData.fonts,
          spacing: formData.spacing,
          borderRadius: formData.borderRadius,
        },
      },
      {
        onSuccess: () => {
          setShowEditModal(false)
          setSelectedTheme(null)
          refetchThemes()
        },
        onError: (error) => {
          alert(error.message)
        },
      }
    )
  }

  const handleDeleteTheme = async (themeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce thème ?')) return

    deleteThemeMutation.mutate(
      { storeId, id: themeId },
      {
        onSuccess: () => {
          refetchThemes()
        },
        onError: (error) => {
          alert(error.message)
        },
      }
    )
  }

  const handleActivateTheme = async (themeId: string) => {
    activateThemeMutation.mutate(
      { storeId, id: themeId },
      {
        onSuccess: () => {
          refetchThemes()
        },
        onError: (error) => {
          alert(error.message)
        },
      }
    )
  }

  const handleDuplicateTheme = async (themeId: string) => {
    duplicateThemeMutation.mutate(
      { storeId, id: themeId },
      {
        onSuccess: () => {
          refetchThemes()
        },
        onError: (error) => {
          alert(error.message)
        },
      }
    )
  }

  const openEditModal = (theme: any) => {
    setSelectedTheme(theme)
    setFormData({
      name: theme.name,
      description: theme.description || '',
      colors: theme.config.colors,
      fonts: theme.config.fonts,
      spacing: theme.config.spacing,
      borderRadius: theme.config.borderRadius,
    })
    setShowEditModal(true)
  }

  const handleSeedSystemThemes = async () => {
    if (!confirm('Voulez-vous installer les 3 thèmes système (Minimal, Elegant, Bold) ?')) return

    seedSystemThemesMutation.mutate(
      { storeId },
      {
        onSuccess: (data) => {
          alert(data.message)
          refetchThemes()
        },
        onError: (error) => {
          alert(error.message)
        },
      }
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thèmes</h1>
          <p className="text-gray-600">
            Gérez l'apparence de votre boutique avec des thèmes personnalisés
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => router.push('/admin/themes/marketplace')}
          >
            <Store className="w-4 h-4 mr-2" />
            Marketplace
          </Button>
          <Button
            variant="secondary"
            onClick={handleSeedSystemThemes}
            disabled={seedSystemThemesMutation.isPending}
          >
            <Download className="w-4 h-4 mr-2" />
            {seedSystemThemesMutation.isPending ? 'Installation...' : 'Installer thèmes système'}
          </Button>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Créer un thème
          </Button>
        </div>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes?.map((theme) => (
          <Card key={theme.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {theme.name}
                  </h3>
                  {theme.isActive && (
                    <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                      Actif
                    </span>
                  )}
                  {theme.isSystem && (
                    <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                      Système
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {theme.description || 'Aucune description'}
                </p>
              </div>
            </div>

            {/* Color Palette Preview */}
            {theme.config && (theme.config as any).colors && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  Palette de couleurs
                </p>
                <div className="flex gap-2">
                  <div
                    className="w-10 h-10 rounded-lg border border-gray-200"
                    style={{ backgroundColor: (theme.config as any).colors.primary }}
                    title="Primary"
                  />
                  <div
                    className="w-10 h-10 rounded-lg border border-gray-200"
                    style={{ backgroundColor: (theme.config as any).colors.secondary }}
                    title="Secondary"
                  />
                  <div
                    className="w-10 h-10 rounded-lg border border-gray-200"
                    style={{ backgroundColor: (theme.config as any).colors.accent }}
                    title="Accent"
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {!theme.isActive && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleActivateTheme(theme.id)}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Activer
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push(`/admin/themes/editor/${theme.id}`)}
                title="Éditeur visuel"
              >
                <Paintbrush className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => openEditModal(theme)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDuplicateTheme(theme.id)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              {!theme.isActive && !theme.isSystem && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteTheme(theme.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Components Count */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                {theme.components?.length || 0} composant
                {theme.components?.length !== 1 ? 's' : ''}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Theme Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Créer un nouveau thème
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du thème *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Mon thème personnalisé"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Description du thème..."
                />
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Palette de couleurs
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Couleur primaire
                    </label>
                    <input
                      type="color"
                      value={formData.colors.primary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          colors: {
                            ...formData.colors,
                            primary: e.target.value,
                          },
                        })
                      }
                      className="w-full h-10 rounded border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Couleur secondaire
                    </label>
                    <input
                      type="color"
                      value={formData.colors.secondary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          colors: {
                            ...formData.colors,
                            secondary: e.target.value,
                          },
                        })
                      }
                      className="w-full h-10 rounded border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Couleur d'accent
                    </label>
                    <input
                      type="color"
                      value={formData.colors.accent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          colors: {
                            ...formData.colors,
                            accent: e.target.value,
                          },
                        })
                      }
                      className="w-full h-10 rounded border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Arrière-plan
                    </label>
                    <input
                      type="color"
                      value={formData.colors.background}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          colors: {
                            ...formData.colors,
                            background: e.target.value,
                          },
                        })
                      }
                      className="w-full h-10 rounded border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Texte principal
                    </label>
                    <input
                      type="color"
                      value={formData.colors.text}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          colors: {
                            ...formData.colors,
                            text: e.target.value,
                          },
                        })
                      }
                      className="w-full h-10 rounded border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Texte secondaire
                    </label>
                    <input
                      type="color"
                      value={formData.colors.textSecondary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          colors: {
                            ...formData.colors,
                            textSecondary: e.target.value,
                          },
                        })
                      }
                      className="w-full h-10 rounded border border-gray-300"
                    />
                  </div>
                </div>
              </div>

              {/* Fonts */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Typographie
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Police des titres
                    </label>
                    <select
                      value={formData.fonts.heading}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fonts: { ...formData.fonts, heading: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Playfair Display">Playfair Display</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Police du corps
                    </label>
                    <select
                      value={formData.fonts.body}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fonts: { ...formData.fonts, body: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Poppins">Poppins</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCreateTheme}
                  disabled={createThemeMutation.isPending || !formData.name}
                  className="flex-1"
                >
                  {createThemeMutation.isPending ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Theme Modal */}
      {showEditModal && selectedTheme && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Modifier le thème
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedTheme(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Same form as create modal */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du thème *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  disabled={selectedTheme.isSystem}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Palette de couleurs
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Couleur primaire
                    </label>
                    <input
                      type="color"
                      value={formData.colors.primary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          colors: {
                            ...formData.colors,
                            primary: e.target.value,
                          },
                        })
                      }
                      className="w-full h-10 rounded border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Couleur secondaire
                    </label>
                    <input
                      type="color"
                      value={formData.colors.secondary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          colors: {
                            ...formData.colors,
                            secondary: e.target.value,
                          },
                        })
                      }
                      className="w-full h-10 rounded border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Couleur d'accent
                    </label>
                    <input
                      type="color"
                      value={formData.colors.accent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          colors: {
                            ...formData.colors,
                            accent: e.target.value,
                          },
                        })
                      }
                      className="w-full h-10 rounded border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Arrière-plan
                    </label>
                    <input
                      type="color"
                      value={formData.colors.background}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          colors: {
                            ...formData.colors,
                            background: e.target.value,
                          },
                        })
                      }
                      className="w-full h-10 rounded border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Texte principal
                    </label>
                    <input
                      type="color"
                      value={formData.colors.text}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          colors: {
                            ...formData.colors,
                            text: e.target.value,
                          },
                        })
                      }
                      className="w-full h-10 rounded border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Texte secondaire
                    </label>
                    <input
                      type="color"
                      value={formData.colors.textSecondary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          colors: {
                            ...formData.colors,
                            textSecondary: e.target.value,
                          },
                        })
                      }
                      className="w-full h-10 rounded border border-gray-300"
                    />
                  </div>
                </div>
              </div>

              {/* Fonts */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Typographie
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Police des titres
                    </label>
                    <select
                      value={formData.fonts.heading}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fonts: { ...formData.fonts, heading: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Playfair Display">Playfair Display</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Police du corps
                    </label>
                    <select
                      value={formData.fonts.body}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fonts: { ...formData.fonts, body: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Poppins">Poppins</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedTheme(null)
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  onClick={handleEditTheme}
                  disabled={updateThemeMutation.isPending || !formData.name}
                  className="flex-1"
                >
                  {updateThemeMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
