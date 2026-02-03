'use client'

import { useState, useEffect } from 'react'
import { useStoreContext } from '@/lib/context/store-context'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SingleImageUpload } from '@/components/ui/SingleImageUpload'
import { Store, Save, Eye, Image as ImageIcon, Globe, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin, Youtube, Star } from 'lucide-react'

export default function StoreSettingsPage() {
  const { storeId } = useStoreContext()
  const { data: store } = trpc.store.getById.useQuery(
    { id: storeId! },
    { enabled: !!storeId }
  )

  const updateMutation = trpc.store.update.useMutation()
  const updateStorefrontMutation = trpc.store.updateStorefront.useMutation()

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logo: '',
    tagline: '',
    bannerImage: '',
    story: '',
    foundedAt: '',
    publicEmail: '',
    publicPhone: '',
    publicAddress: {
      street: '',
      city: '',
      postalCode: '',
      country: '',
    },
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
      youtube: '',
    },
    showOnDirectory: true,
  })

  const [savedSuccessfully, setSavedSuccessfully] = useState(false)

  useEffect(() => {
    if (store) {
      const socialLinks = (store.socialLinks as any) || {}
      const publicAddress = (store.publicAddress as any) || {}

      setFormData({
        name: store.name || '',
        slug: store.slug || '',
        description: store.description || '',
        logo: store.logo || '',
        tagline: store.tagline || '',
        bannerImage: store.bannerImage || '',
        story: store.story || '',
        foundedAt: store.foundedAt ? new Date(store.foundedAt).toISOString().split('T')[0] : '',
        publicEmail: store.publicEmail || '',
        publicPhone: store.publicPhone || '',
        publicAddress: {
          street: publicAddress.street || '',
          city: publicAddress.city || '',
          postalCode: publicAddress.postalCode || '',
          country: publicAddress.country || '',
        },
        socialLinks: {
          facebook: socialLinks.facebook || '',
          instagram: socialLinks.instagram || '',
          twitter: socialLinks.twitter || '',
          linkedin: socialLinks.linkedin || '',
          youtube: socialLinks.youtube || '',
        },
        showOnDirectory: store.showOnDirectory ?? true,
      })
    }
  }, [store])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!storeId) return

    try {
      // Update basic store info
      await updateMutation.mutateAsync({
        storeId,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        logo: formData.logo,
      })

      // Update storefront content
      await updateStorefrontMutation.mutateAsync({
        storeId,
        tagline: formData.tagline,
        bannerImage: formData.bannerImage,
        story: formData.story,
        foundedAt: formData.foundedAt ? new Date(formData.foundedAt) : undefined,
        publicEmail: formData.publicEmail,
        publicPhone: formData.publicPhone,
        publicAddress: formData.publicAddress,
        socialLinks: formData.socialLinks,
        showOnDirectory: formData.showOnDirectory,
      })

      setSavedSuccessfully(true)
      setTimeout(() => setSavedSuccessfully(false), 3000)
    } catch (error) {
      console.error('Failed to save store settings:', error)
    }
  }

  if (!storeId) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Veuillez sélectionner une boutique</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres de la boutique</h1>
          <p className="text-gray-600 mt-1">Configurez votre boutique et votre vitrine publique</p>
        </div>
        <a
          href={`/stores/${store?.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Voir la vitrine
        </a>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Store className="w-5 h-5" />
            Informations de base
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la boutique *
              </label>
              <Input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL (slug) *
              </label>
              <Input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                URL: /stores/{formData.slug || 'votre-boutique'}
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description courte
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Une brève description de votre boutique..."
              />
            </div>

            <div>
              <SingleImageUpload
                label="Logo de la boutique"
                value={formData.logo}
                onChange={(url) => setFormData({ ...formData, logo: url })}
                storeId={storeId || undefined}
                aspectRatio="logo"
                placeholder="Cliquez pour uploader votre logo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fondation
              </label>
              <Input
                type="date"
                value={formData.foundedAt}
                onChange={(e) => setFormData({ ...formData, foundedAt: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Storefront Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Contenu de la vitrine
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slogan
              </label>
              <Input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="Votre slogan accrocheur..."
              />
            </div>

            <div>
              <SingleImageUpload
                label="Image de bannière"
                value={formData.bannerImage}
                onChange={(url) => setFormData({ ...formData, bannerImage: url })}
                storeId={storeId || undefined}
                aspectRatio="banner"
                placeholder="Cliquez pour uploader votre bannière"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Histoire de la boutique
              </label>
              <textarea
                rows={8}
                value={formData.story}
                onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Racontez l'histoire de votre boutique, votre mission, vos valeurs..."
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="showOnDirectory"
                checked={formData.showOnDirectory}
                onChange={(e) => setFormData({ ...formData, showOnDirectory: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="showOnDirectory" className="text-sm text-gray-700">
                Afficher dans le répertoire des boutiques
              </label>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Informations de contact publiques
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email public
              </label>
              <Input
                type="email"
                value={formData.publicEmail}
                onChange={(e) => setFormData({ ...formData, publicEmail: e.target.value })}
                placeholder="contact@votreboutique.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone public
              </label>
              <Input
                type="tel"
                value={formData.publicPhone}
                onChange={(e) => setFormData({ ...formData, publicPhone: e.target.value })}
                placeholder="+33 1 23 45 67 89"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse publique
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  value={formData.publicAddress.street}
                  onChange={(e) => setFormData({
                    ...formData,
                    publicAddress: { ...formData.publicAddress, street: e.target.value }
                  })}
                  placeholder="Rue"
                />
                <Input
                  type="text"
                  value={formData.publicAddress.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    publicAddress: { ...formData.publicAddress, city: e.target.value }
                  })}
                  placeholder="Ville"
                />
                <Input
                  type="text"
                  value={formData.publicAddress.postalCode}
                  onChange={(e) => setFormData({
                    ...formData,
                    publicAddress: { ...formData.publicAddress, postalCode: e.target.value }
                  })}
                  placeholder="Code postal"
                />
                <Input
                  type="text"
                  value={formData.publicAddress.country}
                  onChange={(e) => setFormData({
                    ...formData,
                    publicAddress: { ...formData.publicAddress, country: e.target.value }
                  })}
                  placeholder="Pays"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Réseaux sociaux
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Facebook className="w-4 h-4 text-blue-600" />
                Facebook
              </label>
              <Input
                type="url"
                value={formData.socialLinks.facebook}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                })}
                placeholder="https://facebook.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Instagram className="w-4 h-4 text-primary-500" />
                Instagram
              </label>
              <Input
                type="url"
                value={formData.socialLinks.instagram}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                })}
                placeholder="https://instagram.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Twitter className="w-4 h-4 text-sky-600" />
                Twitter
              </label>
              <Input
                type="url"
                value={formData.socialLinks.twitter}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                })}
                placeholder="https://twitter.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-blue-700" />
                LinkedIn
              </label>
              <Input
                type="url"
                value={formData.socialLinks.linkedin}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                })}
                placeholder="https://linkedin.com/company/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-600" />
                YouTube
              </label>
              <Input
                type="url"
                value={formData.socialLinks.youtube}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, youtube: e.target.value }
                })}
                placeholder="https://youtube.com/@..."
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          {savedSuccessfully && (
            <div className="flex items-center gap-2 text-green-600">
              <Star className="w-5 h-5 fill-green-600" />
              <span className="font-medium">Enregistré avec succès!</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={updateMutation.isPending || updateStorefrontMutation.isPending}
          >
            {updateMutation.isPending || updateStorefrontMutation.isPending ? (
              'Enregistrement...'
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer les modifications
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
