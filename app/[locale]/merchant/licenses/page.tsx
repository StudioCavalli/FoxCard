'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import {
  Key,
  Plus,
  Search,
  Filter,
  Copy,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  Download,
  User,
  Package,
  X
} from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  EXPIRED: 'bg-red-100 text-red-800',
  REVOKED: 'bg-orange-100 text-orange-800',
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Actif',
  INACTIVE: 'Inactif',
  EXPIRED: 'Expiré',
  REVOKED: 'Révoqué',
}

const LICENSE_TYPES = [
  { value: 'SINGLE', label: 'Licence Unique', description: '1 activation' },
  { value: 'TEAM', label: 'Équipe', description: 'Jusqu\'à 10 activations' },
  { value: 'ENTERPRISE', label: 'Entreprise', description: 'Activations illimitées' },
]

interface License {
  id: string
  licenseKey: string
  productId: string
  productName: string
  customerId?: string
  customerEmail?: string
  customerName?: string
  type: string
  maxActivations: number
  activationsUsed: number
  status: string
  expiresAt?: string
  createdAt: string
  lastActivatedAt?: string
  notes?: string
}

export default function LicensesPage() {
  const { storeId } = useStoreContext()
  const params = useParams()
  const locale = params?.locale || 'fr'

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [viewingLicense, setViewingLicense] = useState<License | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    productId: '',
    type: 'SINGLE',
    quantity: 1,
    expiryDays: 365,
    customerEmail: '',
    notes: '',
  })

  // Get products (digital)
  const { data: productsData } = trpc.product.getAll.useQuery(
    { storeId: storeId!, limit: 100, type: 'DIGITAL' },
    { enabled: !!storeId }
  )

  const digitalProducts = productsData?.products || []

  // Mock licenses data
  const [licenses, setLicenses] = useState<License[]>([
    {
      id: '1',
      licenseKey: 'XXXX-XXXX-XXXX-1234',
      productId: '1',
      productName: 'Plugin Premium',
      customerEmail: 'client@example.com',
      customerName: 'Jean Dupont',
      type: 'SINGLE',
      maxActivations: 1,
      activationsUsed: 1,
      status: 'ACTIVE',
      expiresAt: '2025-01-15',
      createdAt: '2024-01-15',
      lastActivatedAt: '2024-01-16',
      notes: 'Licence annuelle',
    },
    {
      id: '2',
      licenseKey: 'XXXX-XXXX-XXXX-5678',
      productId: '2',
      productName: 'Theme Pro',
      customerEmail: 'team@company.com',
      customerName: 'Company Inc',
      type: 'TEAM',
      maxActivations: 10,
      activationsUsed: 5,
      status: 'ACTIVE',
      expiresAt: '2025-06-30',
      createdAt: '2024-06-30',
      lastActivatedAt: '2024-07-02',
    },
    {
      id: '3',
      licenseKey: 'XXXX-XXXX-XXXX-9012',
      productId: '1',
      productName: 'Plugin Premium',
      type: 'ENTERPRISE',
      maxActivations: 999,
      activationsUsed: 0,
      status: 'INACTIVE',
      createdAt: '2024-08-01',
    },
  ])

  // Filter licenses
  const filteredLicenses = licenses.filter((l) => {
    const matchesSearch =
      l.licenseKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (l.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

    const matchesType = typeFilter === 'all' || l.type === typeFilter
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  // Stats
  const totalLicenses = licenses.length
  const activeLicenses = licenses.filter(l => l.status === 'ACTIVE').length
  const totalActivations = licenses.reduce((sum, l) => sum + l.activationsUsed, 0)
  const unusedLicenses = licenses.filter(l => l.status === 'INACTIVE').length

  const generateLicenseKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const segments = []
    for (let i = 0; i < 4; i++) {
      let segment = ''
      for (let j = 0; j < 4; j++) {
        segment += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      segments.push(segment)
    }
    return segments.join('-')
  }

  const handleGenerate = () => {
    const licenseType = LICENSE_TYPES.find(t => t.value === formData.type)
    const maxActivations = formData.type === 'SINGLE' ? 1 :
                          formData.type === 'TEAM' ? 10 : 999

    const newLicenses: License[] = []
    for (let i = 0; i < formData.quantity; i++) {
      newLicenses.push({
        id: Date.now().toString() + i,
        licenseKey: generateLicenseKey(),
        productId: formData.productId,
        productName: digitalProducts.find(p => p.id === formData.productId)?.name || 'Produit',
        customerEmail: formData.customerEmail || undefined,
        type: formData.type,
        maxActivations,
        activationsUsed: 0,
        status: 'INACTIVE',
        expiresAt: new Date(Date.now() + formData.expiryDays * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        notes: formData.notes || undefined,
      })
    }

    setLicenses([...licenses, ...newLicenses])
    setShowAddModal(false)
    setFormData({
      productId: '',
      type: 'SINGLE',
      quantity: 1,
      expiryDays: 365,
      customerEmail: '',
      notes: '',
    })
  }

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleRevoke = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir révoquer cette licence ?')) {
      setLicenses(licenses.map(l =>
        l.id === id ? { ...l, status: 'REVOKED' } : l
      ))
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette licence ?')) {
      setLicenses(licenses.filter(l => l.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Licences</h1>
          <p className="text-gray-600">Générez et gérez les clés de licence pour vos produits digitaux</p>
        </div>
        <AdminButton onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Générer des licences
        </AdminButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Key className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalLicenses}</p>
              <p className="text-sm text-gray-500">Total licences</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeLicenses}</p>
              <p className="text-sm text-gray-500">Actives</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Download className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalActivations}</p>
              <p className="text-sm text-gray-500">Activations</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{unusedLicenses}</p>
              <p className="text-sm text-gray-500">Non utilisées</p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Filters */}
      <AdminCard>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par clé, produit, client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les types</option>
              {LICENSE_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </AdminCard>

      {/* Licenses list */}
      <AdminCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="pb-3 font-medium">Clé de licence</th>
                <th className="pb-3 font-medium">Produit</th>
                <th className="pb-3 font-medium">Client</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Activations</th>
                <th className="pb-3 font-medium">Expiration</th>
                <th className="pb-3 font-medium">Statut</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredLicenses.map((license) => (
                <tr key={license.id} className="text-sm">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {license.licenseKey}
                      </code>
                      <button
                        onClick={() => copyToClipboard(license.licenseKey)}
                        className="p-1 text-gray-500 hover:text-blue-600"
                        title="Copier"
                      >
                        {copiedKey === license.licenseKey ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span>{license.productName}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    {license.customerEmail ? (
                      <div>
                        <p className="font-medium text-gray-900">{license.customerName || '-'}</p>
                        <p className="text-gray-500 text-xs">{license.customerEmail}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">Non assigné</span>
                    )}
                  </td>
                  <td className="py-3">
                    <span className="text-xs">
                      {LICENSE_TYPES.find(t => t.value === license.type)?.label}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={license.activationsUsed >= license.maxActivations ? 'text-red-600' : ''}>
                      {license.activationsUsed}/{license.maxActivations === 999 ? '∞' : license.maxActivations}
                    </span>
                  </td>
                  <td className="py-3">
                    {license.expiresAt ? (
                      new Date(license.expiresAt).toLocaleDateString('fr-FR')
                    ) : (
                      <span className="text-gray-400">Jamais</span>
                    )}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[license.status]}`}>
                      {STATUS_LABELS[license.status]}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewingLicense(license)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Voir détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {license.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleRevoke(license.id)}
                          className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded"
                          title="Révoquer"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(license.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLicenses.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Aucune licence trouvée avec ces critères.'
                : 'Aucune licence. Générez votre première licence.'}
            </p>
          )}
        </div>
      </AdminCard>

      {/* Generate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Générer des licences</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produit *
                </label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner un produit</option>
                  {digitalProducts.map((product) => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de licence
                </label>
                <div className="space-y-2">
                  {LICENSE_TYPES.map(({ value, label, description }) => (
                    <label
                      key={value}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                        formData.type === value ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="licenseType"
                        value={value}
                        checked={formData.type === value}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="sr-only"
                      />
                      <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-xs text-gray-500">{description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantité
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Validité (jours)
                  </label>
                  <input
                    type="number"
                    value={formData.expiryDays}
                    onChange={(e) => setFormData({ ...formData, expiryDays: parseInt(e.target.value) || 365 })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email client (optionnel)
                </label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="client@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optionnel)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <AdminButton variant="secondary" onClick={() => setShowAddModal(false)}>
                Annuler
              </AdminButton>
              <AdminButton onClick={handleGenerate} disabled={!formData.productId}>
                <Key className="w-4 h-4 mr-2" />
                Générer {formData.quantity} licence(s)
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingLicense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Détails de la licence</h3>
                <button
                  onClick={() => setViewingLicense(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Clé de licence</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="font-mono bg-gray-100 px-3 py-2 rounded flex-1">
                    {viewingLicense.licenseKey}
                  </code>
                  <button
                    onClick={() => copyToClipboard(viewingLicense.licenseKey)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Produit</p>
                  <p className="font-medium">{viewingLicense.productName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">
                    {LICENSE_TYPES.find(t => t.value === viewingLicense.type)?.label}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Activations</p>
                  <p className="font-medium">
                    {viewingLicense.activationsUsed}/{viewingLicense.maxActivations === 999 ? '∞' : viewingLicense.maxActivations}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[viewingLicense.status]}`}>
                    {STATUS_LABELS[viewingLicense.status]}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Créée le</p>
                  <p className="font-medium">
                    {new Date(viewingLicense.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expire le</p>
                  <p className="font-medium">
                    {viewingLicense.expiresAt
                      ? new Date(viewingLicense.expiresAt).toLocaleDateString('fr-FR')
                      : 'Jamais'}
                  </p>
                </div>
              </div>

              {viewingLicense.customerEmail && (
                <div>
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="font-medium">{viewingLicense.customerName || '-'}</p>
                  <p className="text-sm text-gray-600">{viewingLicense.customerEmail}</p>
                </div>
              )}

              {viewingLicense.lastActivatedAt && (
                <div>
                  <p className="text-sm text-gray-500">Dernière activation</p>
                  <p className="font-medium">
                    {new Date(viewingLicense.lastActivatedAt).toLocaleString('fr-FR')}
                  </p>
                </div>
              )}

              {viewingLicense.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-sm">{viewingLicense.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <AdminButton variant="secondary" onClick={() => setViewingLicense(null)}>
                Fermer
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
