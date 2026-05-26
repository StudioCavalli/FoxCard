'use client'

import { useState } from 'react'
import { useStoreContext } from '@/lib/context/store-context'
import { trpc } from '@/lib/trpc/client'
import { formatPrice } from '@/lib/utils'
import {
  Warehouse,
  Plus,
  MapPin,
  Phone,
  Mail,
  User,
  Package,
  ArrowRightLeft,
  Edit,
  Trash2,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
} from 'lucide-react'

export default function WarehousesPage() {
  const { storeId } = useStoreContext()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null)
  const [editingWarehouse, setEditingWarehouse] = useState<any>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'FR',
    phone: '',
    email: '',
    manager: '',
    isPrimary: false,
    priority: 0,
  })

  // Transfer form state
  const [transferData, setTransferData] = useState({
    fromWarehouseId: '',
    toWarehouseId: '',
    reason: '',
    notes: '',
    items: [] as { productId: string; productName: string; quantity: number }[],
  })

  const utils = trpc.useUtils()

  // Queries
  const { data: warehouses, isLoading } = trpc.warehouse.list.useQuery(
    { storeId: storeId || '', includeInactive: true },
    { enabled: !!storeId }
  )

  const { data: dashboard } = trpc.warehouse.getDashboard.useQuery(
    { storeId: storeId || '' },
    { enabled: !!storeId }
  )

  const { data: transfers } = trpc.warehouse.listTransfers.useQuery(
    { storeId: storeId || '' },
    { enabled: !!storeId }
  )

  const { data: warehouseDetails } = trpc.warehouse.get.useQuery(
    { warehouseId: selectedWarehouse || '', storeId: storeId || '' },
    { enabled: !!selectedWarehouse && !!storeId }
  )

  // Mutations
  const createWarehouse = trpc.warehouse.create.useMutation({
    onSuccess: () => {
      utils.warehouse.list.invalidate()
      utils.warehouse.getDashboard.invalidate()
      setShowCreateModal(false)
      resetForm()
    },
  })

  const updateWarehouse = trpc.warehouse.update.useMutation({
    onSuccess: () => {
      utils.warehouse.list.invalidate()
      utils.warehouse.get.invalidate()
      setEditingWarehouse(null)
      resetForm()
    },
  })

  const deleteWarehouse = trpc.warehouse.delete.useMutation({
    onSuccess: () => {
      utils.warehouse.list.invalidate()
      utils.warehouse.getDashboard.invalidate()
      setSelectedWarehouse(null)
    },
  })

  const createTransfer = trpc.warehouse.createTransfer.useMutation({
    onSuccess: () => {
      utils.warehouse.listTransfers.invalidate()
      utils.warehouse.getDashboard.invalidate()
      setShowTransferModal(false)
      setTransferData({
        fromWarehouseId: '',
        toWarehouseId: '',
        reason: '',
        notes: '',
        items: [],
      })
    },
  })

  const approveTransfer = trpc.warehouse.approveTransfer.useMutation({
    onSuccess: () => {
      utils.warehouse.listTransfers.invalidate()
    },
  })

  const shipTransfer = trpc.warehouse.shipTransfer.useMutation({
    onSuccess: () => {
      utils.warehouse.listTransfers.invalidate()
      utils.warehouse.list.invalidate()
    },
  })

  const receiveTransfer = trpc.warehouse.receiveTransfer.useMutation({
    onSuccess: () => {
      utils.warehouse.listTransfers.invalidate()
      utils.warehouse.list.invalidate()
    },
  })

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'FR',
      phone: '',
      email: '',
      manager: '',
      isPrimary: false,
      priority: 0,
    })
  }

  const handleCreate = () => {
    if (!storeId) return
    createWarehouse.mutate({
      storeId: storeId!,
      ...formData,
    })
  }

  const handleUpdate = () => {
    if (!storeId || !editingWarehouse) return
    updateWarehouse.mutate({
      warehouseId: editingWarehouse.id,
      storeId: storeId!,
      ...formData,
    })
  }

  const handleEdit = (warehouse: any) => {
    setEditingWarehouse(warehouse)
    setFormData({
      name: warehouse.name,
      code: warehouse.code,
      description: warehouse.description || '',
      address: warehouse.address,
      city: warehouse.city,
      postalCode: warehouse.postalCode,
      country: warehouse.country,
      phone: warehouse.phone || '',
      email: warehouse.email || '',
      manager: warehouse.manager || '',
      isPrimary: warehouse.isPrimary,
      priority: warehouse.priority,
    })
  }

  const getTransferStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800'
      case 'IN_TRANSIT':
        return 'bg-purple-100 text-purple-800'
      case 'RECEIVED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTransferStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'En attente'
      case 'APPROVED':
        return 'Approuvé'
      case 'IN_TRANSIT':
        return 'En transit'
      case 'RECEIVED':
        return 'Reçu'
      case 'CANCELLED':
        return 'Annulé'
      default:
        return status
    }
  }

  if (!storeId) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Veuillez sélectionner une boutique</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entrepôts</h1>
          <p className="text-gray-500">Gérez vos entrepôts et le stock par localisation</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Nouveau transfert
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" />
            Nouvel entrepôt
          </button>
        </div>
      </div>

      {/* Dashboard Summary */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Warehouse className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Entrepôts</p>
                <p className="text-2xl font-bold">{dashboard.summary.warehouseCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Stock total</p>
                <p className="text-2xl font-bold">{dashboard.summary.totalQuantity}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Valeur totale</p>
                <p className="text-2xl font-bold">{formatPrice(dashboard.summary.totalValue)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Transferts en attente</p>
                <p className="text-2xl font-bold">{dashboard.summary.pendingTransfers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Alertes stock bas</p>
                <p className="text-2xl font-bold">{dashboard.summary.lowStockAlerts}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Warehouses List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Mes entrepôts</h2>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Chargement...</div>
          ) : warehouses && warehouses.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {warehouses.map((warehouse) => (
                <div
                  key={warehouse.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${
                    selectedWarehouse === warehouse.id ? 'bg-primary-50' : ''
                  }`}
                  onClick={() => setSelectedWarehouse(warehouse.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{warehouse.name}</h3>
                        {warehouse.isPrimary && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                        {!warehouse.isActive && (
                          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                            Inactif
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {warehouse.city} • {warehouse.code}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-gray-900">{warehouse.totalQuantity} unités</p>
                      <p className="text-gray-500">{formatPrice(warehouse.totalValue)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Warehouse className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucun entrepôt</p>
              <p className="text-sm">Créez votre premier entrepôt</p>
            </div>
          )}
        </div>

        {/* Warehouse Details or Transfers */}
        {selectedWarehouse && warehouseDetails ? (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">{warehouseDetails.name}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(warehouseDetails)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir supprimer cet entrepôt ?')) {
                      deleteWarehouse.mutate({
                        warehouseId: warehouseDetails.id,
                        storeId: storeId!,
                      })
                    }
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {/* Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {warehouseDetails.address}, {warehouseDetails.postalCode}{' '}
                    {warehouseDetails.city}
                  </span>
                </div>
                {warehouseDetails.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{warehouseDetails.phone}</span>
                  </div>
                )}
                {warehouseDetails.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{warehouseDetails.email}</span>
                  </div>
                )}
                {warehouseDetails.manager && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{warehouseDetails.manager}</span>
                  </div>
                )}
              </div>

              {/* Stock Items */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Stock ({warehouseDetails.stockItems.length} produits)
                </h3>
                {warehouseDetails.stockItems.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="text-left p-2 font-medium">Produit</th>
                          <th className="text-right p-2 font-medium">Qté</th>
                          <th className="text-right p-2 font-medium">Dispo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {warehouseDetails.stockItems.map((item) => (
                          <tr key={item.id}>
                            <td className="p-2">
                              <div className="font-medium">{item.product.name}</div>
                              {item.product.sku && (
                                <div className="text-xs text-gray-500">{item.product.sku}</div>
                              )}
                            </td>
                            <td className="p-2 text-right">{item.quantity}</td>
                            <td className="p-2 text-right">
                              <span
                                className={
                                  item.available === 0 ? 'text-red-600' : 'text-green-600'
                                }
                              >
                                {item.available}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Aucun stock dans cet entrepôt</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Transferts récents</h2>
            </div>
            {transfers && transfers.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {transfers.slice(0, 10).map((transfer) => (
                  <div key={transfer.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{transfer.transferNumber}</span>
                      <span
                        className={`px-2 py-0.5 text-xs rounded ${getTransferStatusColor(
                          transfer.status
                        )}`}
                      >
                        {getTransferStatusLabel(transfer.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {transfer.fromWarehouse.name} → {transfer.toWarehouse.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {transfer.items.length} produit(s) •{' '}
                      {new Date(transfer.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                    {transfer.status === 'PENDING' && (
                      <button
                        onClick={() =>
                          approveTransfer.mutate({
                            transferId: transfer.id,
                            storeId: storeId!,
                          })
                        }
                        className="mt-2 text-xs text-primary-600 hover:text-primary-700"
                      >
                        Approuver
                      </button>
                    )}
                    {transfer.status === 'APPROVED' && (
                      <button
                        onClick={() =>
                          shipTransfer.mutate({
                            transferId: transfer.id,
                            storeId: storeId!,
                          })
                        }
                        className="mt-2 text-xs text-primary-600 hover:text-primary-700"
                      >
                        Expédier
                      </button>
                    )}
                    {transfer.status === 'IN_TRANSIT' && (
                      <button
                        onClick={() =>
                          receiveTransfer.mutate({
                            transferId: transfer.id,
                            storeId: storeId!,
                            items: transfer.items.map((i) => ({
                              productId: i.productId,
                              received: i.quantity,
                            })),
                          })
                        }
                        className="mt-2 text-xs text-primary-600 hover:text-primary-700"
                      >
                        Confirmer réception
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <ArrowRightLeft className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Aucun transfert</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingWarehouse) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingWarehouse ? 'Modifier l\'entrepôt' : 'Nouvel entrepôt'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingWarehouse(null)
                  resetForm()
                }}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Entrepôt Paris"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="WH-PARIS"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="123 Rue du Commerce"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Paris"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="75001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="FR">France</option>
                    <option value="BE">Belgique</option>
                    <option value="CH">Suisse</option>
                    <option value="LU">Luxembourg</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="entrepot@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                <input
                  type="text"
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Jean Dupont"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPrimary}
                    onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Entrepôt principal</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingWarehouse(null)
                  resetForm()
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={editingWarehouse ? handleUpdate : handleCreate}
                disabled={
                  !formData.name ||
                  !formData.code ||
                  !formData.address ||
                  createWarehouse.isPending ||
                  updateWarehouse.isPending
                }
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {createWarehouse.isPending || updateWarehouse.isPending
                  ? 'Enregistrement...'
                  : editingWarehouse
                  ? 'Modifier'
                  : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold">Nouveau transfert</h2>
              <button
                onClick={() => setShowTransferModal(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entrepôt source
                  </label>
                  <select
                    value={transferData.fromWarehouseId}
                    onChange={(e) =>
                      setTransferData({ ...transferData, fromWarehouseId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Sélectionner</option>
                    {warehouses?.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entrepôt destination
                  </label>
                  <select
                    value={transferData.toWarehouseId}
                    onChange={(e) =>
                      setTransferData({ ...transferData, toWarehouseId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Sélectionner</option>
                    {warehouses
                      ?.filter((w) => w.id !== transferData.fromWarehouseId)
                      .map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Raison</label>
                <input
                  type="text"
                  value={transferData.reason}
                  onChange={(e) => setTransferData({ ...transferData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Rééquilibrage stock, demande client..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={transferData.notes}
                  onChange={(e) => setTransferData({ ...transferData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  rows={2}
                  placeholder="Notes additionnelles..."
                />
              </div>

              <p className="text-sm text-gray-500">
                Les produits à transférer seront sélectionnés après la création du transfert.
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  // For now, create empty transfer - items would be added in a separate step
                  createTransfer.mutate({
                    storeId: storeId!,
                    ...transferData,
                    items: [{ productId: '', productName: 'Test', quantity: 1 }], // Placeholder
                  })
                }}
                disabled={
                  !transferData.fromWarehouseId ||
                  !transferData.toWarehouseId ||
                  createTransfer.isPending
                }
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {createTransfer.isPending ? 'Création...' : 'Créer le transfert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
