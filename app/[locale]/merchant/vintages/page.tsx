'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { useStoreContext } from '@/lib/context/store-context'
import {
  Wine,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Star,
  MapPin,
  Calendar,
  X
} from 'lucide-react'

interface Vintage {
  id: string
  productId: string
  productName: string
  year: number
  region: string
  appellation: string
  grapeVariety: string
  alcoholPercentage: number
  rating: number
  stock: number
  price: number
  notes: string
}

export default function VintagesPage() {
  const { storeId } = useStoreContext()
  const params = useParams()

  const [searchQuery, setSearchQuery] = useState('')
  const [yearFilter, setYearFilter] = useState('all')
  const [regionFilter, setRegionFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingVintage, setEditingVintage] = useState<Vintage | null>(null)

  const [formData, setFormData] = useState({
    productName: '',
    year: new Date().getFullYear(),
    region: '',
    appellation: '',
    grapeVariety: '',
    alcoholPercentage: 13,
    rating: 0,
    stock: 0,
    price: 0,
    notes: '',
  })

  const [vintages, setVintages] = useState<Vintage[]>([
    {
      id: '1',
      productId: '1',
      productName: 'Château Margaux',
      year: 2018,
      region: 'Bordeaux',
      appellation: 'Margaux',
      grapeVariety: 'Cabernet Sauvignon, Merlot',
      alcoholPercentage: 13.5,
      rating: 96,
      stock: 24,
      price: 450,
      notes: 'Excellent millésime, garde 20+ ans',
    },
    {
      id: '2',
      productId: '2',
      productName: 'Dom Pérignon',
      year: 2012,
      region: 'Champagne',
      appellation: 'Champagne',
      grapeVariety: 'Chardonnay, Pinot Noir',
      alcoholPercentage: 12.5,
      rating: 94,
      stock: 12,
      price: 180,
      notes: 'Millésime classique',
    },
    {
      id: '3',
      productId: '3',
      productName: 'Romanée-Conti',
      year: 2019,
      region: 'Bourgogne',
      appellation: 'Vosne-Romanée',
      grapeVariety: 'Pinot Noir',
      alcoholPercentage: 13,
      rating: 98,
      stock: 6,
      price: 8500,
      notes: 'Millésime exceptionnel',
    },
  ])

  const regions = [...new Set(vintages.map(v => v.region))]
  const years = [...new Set(vintages.map(v => v.year))].sort((a, b) => b - a)

  const filteredVintages = vintages.filter((v) => {
    const matchesSearch =
      v.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.appellation.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesYear = yearFilter === 'all' || v.year.toString() === yearFilter
    const matchesRegion = regionFilter === 'all' || v.region === regionFilter
    return matchesSearch && matchesYear && matchesRegion
  })

  const totalStock = vintages.reduce((sum, v) => sum + v.stock, 0)
  const totalValue = vintages.reduce((sum, v) => sum + v.stock * v.price, 0)
  const avgRating = Math.round(vintages.reduce((sum, v) => sum + v.rating, 0) / vintages.length)

  const resetForm = () => {
    setFormData({
      productName: '',
      year: new Date().getFullYear(),
      region: '',
      appellation: '',
      grapeVariety: '',
      alcoholPercentage: 13,
      rating: 0,
      stock: 0,
      price: 0,
      notes: '',
    })
  }

  const handleSave = () => {
    if (editingVintage) {
      setVintages(vintages.map(v =>
        v.id === editingVintage.id ? { ...v, ...formData, productId: v.productId } : v
      ))
    } else {
      const newVintage: Vintage = {
        id: Date.now().toString(),
        productId: Date.now().toString(),
        ...formData,
      }
      setVintages([...vintages, newVintage])
    }
    setShowAddModal(false)
    setEditingVintage(null)
    resetForm()
  }

  const handleEdit = (vintage: Vintage) => {
    setEditingVintage(vintage)
    setFormData({
      productName: vintage.productName,
      year: vintage.year,
      region: vintage.region,
      appellation: vintage.appellation,
      grapeVariety: vintage.grapeVariety,
      alcoholPercentage: vintage.alcoholPercentage,
      rating: vintage.rating,
      stock: vintage.stock,
      price: vintage.price,
      notes: vintage.notes,
    })
    setShowAddModal(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Supprimer ce millésime ?')) {
      setVintages(vintages.filter(v => v.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Millésimes</h1>
          <p className="text-gray-600">Catalogue de vos vins par année et région</p>
        </div>
        <AdminButton onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un millésime
        </AdminButton>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Wine className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalStock}</p>
              <p className="text-sm text-gray-500">Bouteilles en stock</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Star className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{avgRating}/100</p>
              <p className="text-sm text-gray-500">Note moyenne</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wine className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalValue.toLocaleString()}€</p>
              <p className="text-sm text-gray-500">Valeur totale</p>
            </div>
          </div>
        </AdminCard>
      </div>

      <AdminCard>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">Toutes les années</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">Toutes les régions</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
      </AdminCard>

      <AdminCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="pb-3 font-medium">Vin</th>
                <th className="pb-3 font-medium">Millésime</th>
                <th className="pb-3 font-medium">Région</th>
                <th className="pb-3 font-medium">Note</th>
                <th className="pb-3 font-medium">Stock</th>
                <th className="pb-3 font-medium">Prix</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredVintages.map((vintage) => (
                <tr key={vintage.id} className="text-sm">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Wine className="w-4 h-4 text-purple-500" />
                      <div>
                        <p className="font-medium">{vintage.productName}</p>
                        <p className="text-xs text-gray-500">{vintage.grapeVariety}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 font-medium">{vintage.year}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span>{vintage.region}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span>{vintage.rating}/100</span>
                    </div>
                  </td>
                  <td className="py-3">{vintage.stock}</td>
                  <td className="py-3 font-medium">{vintage.price}€</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(vintage)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(vintage.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingVintage ? 'Modifier' : 'Ajouter'} un millésime
              </h3>
              <button onClick={() => { setShowAddModal(false); setEditingVintage(null); resetForm() }} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du vin *</label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Année *</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Région *</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Appellation</label>
                  <input
                    type="text"
                    value={formData.appellation}
                    onChange={(e) => setFormData({ ...formData, appellation: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cépage</label>
                  <input
                    type="text"
                    value={formData.grapeVariety}
                    onChange={(e) => setFormData({ ...formData, grapeVariety: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alcool %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.alcoholPercentage}
                    onChange={(e) => setFormData({ ...formData, alcoholPercentage: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note /100</label>
                  <input
                    type="number"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <AdminButton variant="secondary" onClick={() => { setShowAddModal(false); setEditingVintage(null); resetForm() }}>
                Annuler
              </AdminButton>
              <AdminButton onClick={handleSave}>
                {editingVintage ? 'Modifier' : 'Ajouter'}
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
