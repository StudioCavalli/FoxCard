'use client'

import { useState } from 'react'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { useStoreContext } from '@/lib/context/store-context'
import {
  Wine,
  TrendingUp,
  TrendingDown,
  Package,
  MapPin,
  Calendar,
  BarChart3,
  AlertTriangle
} from 'lucide-react'

export default function InventoryAnalyticsPage() {
  const { storeId } = useStoreContext()
  const [dateRange, setDateRange] = useState<'30d' | '90d' | '1y'>('30d')

  const regionStats = [
    { region: 'Bordeaux', bottles: 156, value: 28400, change: 12 },
    { region: 'Bourgogne', bottles: 89, value: 45200, change: -5 },
    { region: 'Champagne', bottles: 124, value: 18600, change: 8 },
    { region: 'Rhône', bottles: 67, value: 8900, change: 15 },
    { region: 'Loire', bottles: 45, value: 4500, change: 3 },
  ]

  const vintageStats = [
    { year: 2020, bottles: 87, value: 12400 },
    { year: 2019, bottles: 124, value: 34500 },
    { year: 2018, bottles: 98, value: 28900 },
    { year: 2017, bottles: 56, value: 15600 },
    { year: 2016, bottles: 45, value: 18200 },
  ]

  const lowStockItems = [
    { name: 'Château Margaux 2018', stock: 2, reorderPoint: 6 },
    { name: 'Dom Pérignon 2012', stock: 3, reorderPoint: 5 },
    { name: 'Romanée-Conti 2019', stock: 1, reorderPoint: 3 },
  ]

  const totalBottles = regionStats.reduce((sum, r) => sum + r.bottles, 0)
  const totalValue = regionStats.reduce((sum, r) => sum + r.value, 0)
  const avgBottleValue = Math.round(totalValue / totalBottles)
  const maxRegion = Math.max(...regionStats.map(r => r.bottles))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Inventaire Cave</h1>
          <p className="text-gray-600">Analyse de votre stock par région et millésime</p>
        </div>
        <div className="flex border rounded-lg overflow-hidden">
          {(['30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-2 text-sm ${dateRange === range ? 'bg-blue-600 text-white' : 'bg-white'}`}
            >
              {range === '30d' ? '30 jours' : range === '90d' ? '90 jours' : '1 an'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Wine className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalBottles}</p>
              <p className="text-sm text-gray-500">Bouteilles</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalValue.toLocaleString()}€</p>
              <p className="text-sm text-gray-500">Valeur totale</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{avgBottleValue}€</p>
              <p className="text-sm text-gray-500">Prix moyen</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{lowStockItems.length}</p>
              <p className="text-sm text-gray-500">Stock faible</p>
            </div>
          </div>
        </AdminCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminCard>
          <h3 className="font-medium text-gray-900 mb-4">Par région</h3>
          <div className="space-y-3">
            {regionStats.map((stat) => (
              <div key={stat.region} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{stat.region}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>{stat.bottles} btl</span>
                    <span className="font-medium">{stat.value.toLocaleString()}€</span>
                    <span className={stat.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {stat.change >= 0 ? '+' : ''}{stat.change}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${(stat.bottles / maxRegion) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <h3 className="font-medium text-gray-900 mb-4">Par millésime</h3>
          <div className="space-y-3">
            {vintageStats.map((stat) => (
              <div key={stat.year} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{stat.year}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{stat.value.toLocaleString()}€</p>
                  <p className="text-xs text-gray-500">{stat.bottles} bouteilles</p>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>

      <AdminCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Stock faible - À réapprovisionner</h3>
          <AlertTriangle className="w-5 h-5 text-orange-500" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="pb-3 font-medium">Produit</th>
                <th className="pb-3 font-medium">Stock actuel</th>
                <th className="pb-3 font-medium">Seuil de réappro</th>
                <th className="pb-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {lowStockItems.map((item, idx) => (
                <tr key={idx} className="text-sm">
                  <td className="py-3 font-medium">{item.name}</td>
                  <td className="py-3 text-red-600 font-bold">{item.stock}</td>
                  <td className="py-3">{item.reorderPoint}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                      Critique
                    </span>
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
