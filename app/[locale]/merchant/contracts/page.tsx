'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import {
  FileText,
  Plus,
  Search,
  Filter,
  Upload,
  Download,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Building2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  X
} from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  EXPIRED: 'bg-red-100 text-red-800',
  TERMINATED: 'bg-gray-100 text-gray-800',
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Actif',
  PENDING: 'En attente',
  EXPIRED: 'Expiré',
  TERMINATED: 'Résilié',
}

const CONTRACT_TYPES = [
  { value: 'HOTEL', label: 'Hôtel / Hébergement' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'EXCURSION', label: 'Excursion / Activité' },
  { value: 'GUIDE', label: 'Guide' },
  { value: 'INSURANCE', label: 'Assurance' },
  { value: 'OTHER', label: 'Autre' },
]

interface Contract {
  id: string
  contractNumber: string
  supplierName: string
  supplierEmail: string
  supplierPhone: string
  type: string
  description: string
  startDate: string
  endDate: string
  value: number
  commission: number
  status: string
  documents: string[]
  createdAt: string
  notes: string
}

export default function ContractsPage() {
  const { storeId } = useStoreContext()
  const params = useParams()
  const locale = params?.locale || 'fr'

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const [viewingContract, setViewingContract] = useState<Contract | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    supplierName: '',
    supplierEmail: '',
    supplierPhone: '',
    type: 'HOTEL',
    description: '',
    startDate: '',
    endDate: '',
    value: 0,
    commission: 0,
    notes: '',
  })

  // Mock contracts data (would come from tRPC in real implementation)
  const [contracts, setContracts] = useState<Contract[]>([
    {
      id: '1',
      contractNumber: 'CTR-2024-001',
      supplierName: 'Hotel Marrakech Palace',
      supplierEmail: 'contact@marrakechpalace.com',
      supplierPhone: '+212 5 24 123 456',
      type: 'HOTEL',
      description: 'Contrat hébergement - 50 chambres garanties',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      value: 150000,
      commission: 15,
      status: 'ACTIVE',
      documents: ['contrat-mp-2024.pdf'],
      createdAt: '2023-12-15',
      notes: 'Tarifs négociés avec réduction -20% en basse saison',
    },
    {
      id: '2',
      contractNumber: 'CTR-2024-002',
      supplierName: 'Transport Atlas',
      supplierEmail: 'reservation@atlas-transport.ma',
      supplierPhone: '+212 5 28 456 789',
      type: 'TRANSPORT',
      description: 'Transferts aéroport et excursions',
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      value: 45000,
      commission: 10,
      status: 'EXPIRED',
      documents: ['contrat-atlas-2024.pdf', 'tarifs-2024.pdf'],
      createdAt: '2023-11-20',
      notes: 'Renouvellement à négocier',
    },
    {
      id: '3',
      contractNumber: 'CTR-2024-003',
      supplierName: 'Excursions Désert',
      supplierEmail: 'info@desert-tours.com',
      supplierPhone: '+212 6 12 345 678',
      type: 'EXCURSION',
      description: 'Excursions désert Merzouga - 2-3 jours',
      startDate: '2024-03-01',
      endDate: '2025-02-28',
      value: 80000,
      commission: 12,
      status: 'ACTIVE',
      documents: ['contrat-desert-2024.pdf'],
      createdAt: '2024-02-15',
      notes: 'Inclut camping luxury et dîner traditionnel',
    },
  ])

  // Filter contracts
  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      c.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = typeFilter === 'all' || c.type === typeFilter
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  // Stats
  const totalContracts = contracts.length
  const activeContracts = contracts.filter(c => c.status === 'ACTIVE').length
  const expiringContracts = contracts.filter(c => {
    const endDate = new Date(c.endDate)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return c.status === 'ACTIVE' && endDate <= thirtyDaysFromNow
  }).length
  const totalValue = contracts
    .filter(c => c.status === 'ACTIVE')
    .reduce((sum, c) => sum + c.value, 0)

  const resetForm = () => {
    setFormData({
      supplierName: '',
      supplierEmail: '',
      supplierPhone: '',
      type: 'HOTEL',
      description: '',
      startDate: '',
      endDate: '',
      value: 0,
      commission: 0,
      notes: '',
    })
  }

  const handleSave = () => {
    if (editingContract) {
      // Update existing contract
      setContracts(contracts.map(c =>
        c.id === editingContract.id
          ? {
              ...c,
              ...formData,
            }
          : c
      ))
    } else {
      // Add new contract
      const newContract: Contract = {
        id: Date.now().toString(),
        contractNumber: `CTR-${new Date().getFullYear()}-${String(contracts.length + 1).padStart(3, '0')}`,
        ...formData,
        status: 'ACTIVE',
        documents: [],
        createdAt: new Date().toISOString(),
      }
      setContracts([...contracts, newContract])
    }
    setShowAddModal(false)
    setEditingContract(null)
    resetForm()
  }

  const handleEdit = (contract: Contract) => {
    setEditingContract(contract)
    setFormData({
      supplierName: contract.supplierName,
      supplierEmail: contract.supplierEmail,
      supplierPhone: contract.supplierPhone,
      type: contract.type,
      description: contract.description,
      startDate: contract.startDate,
      endDate: contract.endDate,
      value: contract.value,
      commission: contract.commission,
      notes: contract.notes,
    })
    setShowAddModal(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce contrat ?')) {
      setContracts(contracts.filter(c => c.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contrats Fournisseurs</h1>
          <p className="text-gray-600">Gérez vos contrats avec les partenaires et fournisseurs</p>
        </div>
        <AdminButton onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau contrat
        </AdminButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalContracts}</p>
              <p className="text-sm text-gray-500">Total contrats</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeContracts}</p>
              <p className="text-sm text-gray-500">Actifs</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{expiringContracts}</p>
              <p className="text-sm text-gray-500">Expire bientôt</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalValue.toLocaleString()}€</p>
              <p className="text-sm text-gray-500">Valeur totale</p>
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
              placeholder="Rechercher par numéro, fournisseur..."
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
              {CONTRACT_TYPES.map(({ value, label }) => (
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

      {/* Contracts list */}
      <AdminCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="pb-3 font-medium">N° Contrat</th>
                <th className="pb-3 font-medium">Fournisseur</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Période</th>
                <th className="pb-3 font-medium">Valeur</th>
                <th className="pb-3 font-medium">Commission</th>
                <th className="pb-3 font-medium">Statut</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredContracts.map((contract) => (
                <tr key={contract.id} className="text-sm">
                  <td className="py-3">
                    <span className="font-mono font-medium text-blue-600">
                      {contract.contractNumber}
                    </span>
                  </td>
                  <td className="py-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <p className="font-medium text-gray-900">{contract.supplierName}</p>
                      </div>
                      <p className="text-gray-500 text-xs ml-6">{contract.supplierEmail}</p>
                    </div>
                  </td>
                  <td className="py-3">
                    {CONTRACT_TYPES.find(t => t.value === contract.type)?.label || contract.type}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1 text-xs">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span>
                        {new Date(contract.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                        {' - '}
                        {new Date(contract.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 font-medium">{contract.value.toLocaleString()}€</td>
                  <td className="py-3">{contract.commission}%</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[contract.status]}`}>
                      {STATUS_LABELS[contract.status]}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewingContract(contract)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Voir détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(contract)}
                        className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(contract.id)}
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
          {filteredContracts.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Aucun contrat trouvé avec ces critères.'
                : 'Aucun contrat. Créez votre premier contrat fournisseur.'}
            </p>
          )}
        </div>
      </AdminCard>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {editingContract ? 'Modifier le contrat' : 'Nouveau contrat'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingContract(null)
                    resetForm()
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du fournisseur *
                  </label>
                  <input
                    type="text"
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.supplierEmail}
                    onChange={(e) => setFormData({ ...formData, supplierEmail: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.supplierPhone}
                    onChange={(e) => setFormData({ ...formData, supplierPhone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de contrat *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {CONTRACT_TYPES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valeur du contrat (€)
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de début *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de fin *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commission (%)
                  </label>
                  <input
                    type="number"
                    value={formData.commission}
                    onChange={(e) => setFormData({ ...formData, commission: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes internes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Documents
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      Glissez-déposez ou cliquez pour télécharger
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <AdminButton
                variant="secondary"
                onClick={() => {
                  setShowAddModal(false)
                  setEditingContract(null)
                  resetForm()
                }}
              >
                Annuler
              </AdminButton>
              <AdminButton onClick={handleSave}>
                {editingContract ? 'Modifier' : 'Créer'}
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{viewingContract.contractNumber}</h3>
                  <p className="text-sm text-gray-500">{viewingContract.supplierName}</p>
                </div>
                <button
                  onClick={() => setViewingContract(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">
                    {CONTRACT_TYPES.find(t => t.value === viewingContract.type)?.label}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[viewingContract.status]}`}>
                    {STATUS_LABELS[viewingContract.status]}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{viewingContract.supplierEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="font-medium">{viewingContract.supplierPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Période</p>
                  <p className="font-medium">
                    {new Date(viewingContract.startDate).toLocaleDateString('fr-FR')} -{' '}
                    {new Date(viewingContract.endDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valeur</p>
                  <p className="font-medium text-lg">{viewingContract.value.toLocaleString()}€</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium">{viewingContract.description}</p>
                </div>
                {viewingContract.notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="font-medium">{viewingContract.notes}</p>
                  </div>
                )}
                {viewingContract.documents.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 mb-2">Documents</p>
                    <div className="space-y-2">
                      {viewingContract.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{doc}</span>
                          </div>
                          <button className="p-1 hover:bg-gray-200 rounded">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <AdminButton variant="secondary" onClick={() => setViewingContract(null)}>
                Fermer
              </AdminButton>
              <AdminButton onClick={() => {
                handleEdit(viewingContract)
                setViewingContract(null)
              }}>
                <Edit2 className="w-4 h-4 mr-2" />
                Modifier
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
