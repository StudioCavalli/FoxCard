'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Puzzle,
  Store,
  Settings,
  Power,
  PowerOff,
  Trash2,
  Search,
  Package,
  Truck,
  Megaphone,
  BarChart3,
  Link,
  Wrench,
} from 'lucide-react'
import { useStoreContext } from '@/lib/context/store-context'

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

export default function PluginsPage() {
  const router = useRouter()
  const { storeId } = useStoreContext()

  const { data: plugins, refetch } = trpc.plugin.getAll.useQuery({ storeId: storeId! })

  const enableMutation = trpc.plugin.enable.useMutation()
  const disableMutation = trpc.plugin.disable.useMutation()
  const uninstallMutation = trpc.plugin.uninstall.useMutation()

  const [searchQuery, setSearchQuery] = useState('')

  const filteredPlugins = plugins?.filter(
    (plugin) =>
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggle = async (plugin: any) => {
    if (plugin.isEnabled) {
      disableMutation.mutate(
        { storeId: storeId!, id: plugin.id },
        {
          onSuccess: () => refetch(),
          onError: (error) => alert(error.message),
        }
      )
    } else {
      enableMutation.mutate(
        { storeId: storeId!, id: plugin.id },
        {
          onSuccess: () => refetch(),
          onError: (error) => alert(error.message),
        }
      )
    }
  }

  const handleUninstall = async (plugin: any) => {
    if (!confirm(`Voulez-vous vraiment désinstaller "${plugin.name}" ?`)) return

    uninstallMutation.mutate(
      { storeId: storeId!, id: plugin.id },
      {
        onSuccess: () => refetch(),
        onError: (error) => alert(error.message),
      }
    )
  }

  const enabledCount = plugins?.filter((p) => p.isEnabled).length || 0
  const totalCount = plugins?.length || 0

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plugins</h1>
          <p className="text-gray-600">
            {enabledCount} plugin{enabledCount !== 1 ? 's' : ''} actif{enabledCount !== 1 ? 's' : ''} sur {totalCount} installé{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => router.push('/admin/plugins/marketplace')}
        >
          <Store className="w-4 h-4 mr-2" />
          Marketplace
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
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

      {/* Plugins grid */}
      {filteredPlugins && filteredPlugins.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlugins.map((plugin) => {
            const CategoryIcon = categoryIcons[plugin.category] || Puzzle

            return (
              <Card key={plugin.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                      {plugin.icon || <CategoryIcon className="w-5 h-5 text-gray-600" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{plugin.name}</h3>
                      <span className="text-xs text-gray-500">
                        {typeLabels[plugin.type] || plugin.type}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      plugin.isEnabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {plugin.isEnabled ? 'Actif' : 'Inactif'}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {plugin.description || 'Aucune description'}
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant={plugin.isEnabled ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => handleToggle(plugin)}
                    disabled={enableMutation.isPending || disableMutation.isPending}
                    className="flex-1"
                  >
                    {plugin.isEnabled ? (
                      <>
                        <PowerOff className="w-4 h-4 mr-1" />
                        Désactiver
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4 mr-1" />
                        Activer
                      </>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push(`/admin/plugins/${plugin.id}/settings`)}
                    title="Configurer"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleUninstall(plugin)}
                    disabled={uninstallMutation.isPending}
                    title="Désinstaller"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  v{plugin.version}
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
            {searchQuery ? 'Aucun plugin trouvé' : 'Aucun plugin installé'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery
              ? 'Essayez avec d\'autres termes de recherche'
              : 'Explorez le marketplace pour découvrir des plugins'}
          </p>
          {!searchQuery && (
            <Button
              variant="primary"
              onClick={() => router.push('/admin/plugins/marketplace')}
            >
              <Store className="w-4 h-4 mr-2" />
              Découvrir les plugins
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
