'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import {
  Download,
  TrendingUp,
  Package,
  Globe,
  Calendar,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Users,
  Loader2,
  FileText,
  Clock
} from 'lucide-react'

interface DownloadStat {
  productId: string
  productName: string
  version: string
  totalDownloads: number
  uniqueUsers: number
  lastDownloadAt: string
}

interface DailyDownload {
  date: string
  downloads: number
}

interface GeoDownload {
  country: string
  countryCode: string
  downloads: number
  percentage: number
}

export default function DownloadsAnalyticsPage() {
  const { storeId } = useStoreContext()
  const params = useParams()
  const locale = params?.locale || 'fr'

  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [selectedProduct, setSelectedProduct] = useState<string>('all')

  // Get products (digital)
  const { data: productsData, isLoading: productsLoading } = trpc.product.getAll.useQuery(
    { storeId: storeId!, limit: 100, type: 'DIGITAL' },
    { enabled: !!storeId }
  )

  const digitalProducts = productsData?.products || []

  // Mock download stats
  const downloadStats: DownloadStat[] = [
    {
      productId: '1',
      productName: 'Plugin Premium',
      version: '2.1.0',
      totalDownloads: 1247,
      uniqueUsers: 892,
      lastDownloadAt: '2024-01-15T10:30:00Z',
    },
    {
      productId: '2',
      productName: 'Theme Pro',
      version: '1.5.2',
      totalDownloads: 856,
      uniqueUsers: 634,
      lastDownloadAt: '2024-01-15T09:45:00Z',
    },
    {
      productId: '3',
      productName: 'Icon Pack',
      version: '3.0.0',
      totalDownloads: 2103,
      uniqueUsers: 1567,
      lastDownloadAt: '2024-01-15T11:00:00Z',
    },
  ]

  // Mock daily downloads
  const dailyDownloads: DailyDownload[] = useMemo(() => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
    const data: DailyDownload[] = []
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toISOString().split('T')[0],
        downloads: Math.floor(Math.random() * 100) + 20,
      })
    }
    return data
  }, [dateRange])

  // Mock geo distribution
  const geoDownloads: GeoDownload[] = [
    { country: 'France', countryCode: 'FR', downloads: 1823, percentage: 35 },
    { country: 'États-Unis', countryCode: 'US', downloads: 1045, percentage: 20 },
    { country: 'Allemagne', countryCode: 'DE', downloads: 678, percentage: 13 },
    { country: 'Royaume-Uni', countryCode: 'GB', downloads: 521, percentage: 10 },
    { country: 'Canada', countryCode: 'CA', downloads: 417, percentage: 8 },
    { country: 'Autres', countryCode: 'XX', downloads: 728, percentage: 14 },
  ]

  // Calculate totals
  const totalDownloads = downloadStats.reduce((sum, s) => sum + s.totalDownloads, 0)
  const totalUniqueUsers = downloadStats.reduce((sum, s) => sum + s.uniqueUsers, 0)
  const avgDownloadsPerDay = Math.round(
    dailyDownloads.reduce((sum, d) => sum + d.downloads, 0) / dailyDownloads.length
  )

  // Filter stats by selected product
  const filteredStats = selectedProduct === 'all'
    ? downloadStats
    : downloadStats.filter(s => s.productId === selectedProduct)

  // Calculate max for chart scaling
  const maxDownloads = Math.max(...dailyDownloads.map(d => d.downloads))

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Téléchargements</h1>
          <p className="text-gray-600">Suivez les téléchargements de vos produits digitaux</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les produits</option>
            {digitalProducts.map((product) => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>
          <div className="flex border rounded-lg overflow-hidden">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-2 text-sm ${
                  dateRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {range === '7d' ? '7 jours' : range === '30d' ? '30 jours' : '90 jours'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalDownloads.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Téléchargements</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalUniqueUsers.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Utilisateurs uniques</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{avgDownloadsPerDay}</p>
              <p className="text-sm text-gray-500">Moy. par jour</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{downloadStats.length}</p>
              <p className="text-sm text-gray-500">Produits actifs</p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Downloads Chart */}
      <AdminCard>
        <h3 className="font-medium text-gray-900 mb-4">Téléchargements par jour</h3>
        <div className="h-64">
          <div className="flex items-end gap-1 h-48">
            {dailyDownloads.map((day, idx) => {
              const height = (day.downloads / maxDownloads) * 100
              return (
                <div
                  key={day.date}
                  className="flex-1 group relative"
                >
                  <div
                    className="bg-blue-500 hover:bg-blue-600 rounded-t transition-all cursor-pointer"
                    style={{ height: `${height}%` }}
                  />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    {new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    <br />
                    {day.downloads} téléchargements
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>
              {new Date(dailyDownloads[0]?.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
            </span>
            <span>
              {new Date(dailyDownloads[dailyDownloads.length - 1]?.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
            </span>
          </div>
        </div>
      </AdminCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products Stats */}
        <AdminCard>
          <h3 className="font-medium text-gray-900 mb-4">Par produit</h3>
          <div className="space-y-4">
            {filteredStats.map((stat) => (
              <div key={stat.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{stat.productName}</p>
                    <p className="text-xs text-gray-500">v{stat.version}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{stat.totalDownloads.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{stat.uniqueUsers} utilisateurs</p>
                </div>
              </div>
            ))}
            {filteredStats.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                Aucune donnée disponible
              </p>
            )}
          </div>
        </AdminCard>

        {/* Geographic Distribution */}
        <AdminCard>
          <h3 className="font-medium text-gray-900 mb-4">Distribution géographique</h3>
          <div className="space-y-3">
            {geoDownloads.map((geo) => (
              <div key={geo.countryCode} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{geo.country}</span>
                  </div>
                  <span className="text-gray-600">
                    {geo.downloads.toLocaleString()} ({geo.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${geo.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>

      {/* Recent Downloads */}
      <AdminCard>
        <h3 className="font-medium text-gray-900 mb-4">Téléchargements récents</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="pb-3 font-medium">Produit</th>
                <th className="pb-3 font-medium">Version</th>
                <th className="pb-3 font-medium">Utilisateur</th>
                <th className="pb-3 font-medium">Localisation</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {/* Mock recent downloads */}
              {[
                { product: 'Plugin Premium', version: '2.1.0', user: 'jean@example.com', location: 'France', date: '2024-01-15T10:30:00Z' },
                { product: 'Theme Pro', version: '1.5.2', user: 'marie@company.com', location: 'Canada', date: '2024-01-15T09:45:00Z' },
                { product: 'Icon Pack', version: '3.0.0', user: 'bob@design.io', location: 'États-Unis', date: '2024-01-15T09:30:00Z' },
                { product: 'Plugin Premium', version: '2.1.0', user: 'alice@startup.de', location: 'Allemagne', date: '2024-01-15T08:15:00Z' },
                { product: 'Theme Pro', version: '1.5.2', user: 'paul@agency.co.uk', location: 'Royaume-Uni', date: '2024-01-15T07:00:00Z' },
              ].map((download, idx) => (
                <tr key={idx} className="text-sm">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{download.product}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="text-gray-600">v{download.version}</span>
                  </td>
                  <td className="py-3">
                    <span className="text-gray-600">{download.user}</span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-gray-400" />
                      <span>{download.location}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(download.date).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  )
}
