'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { trpc } from '@/lib/trpc/client'
import { formatPrice, formatDate } from '@/lib/utils'
import {
  Store,
  Search,
  ArrowRight,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Plus,
  Edit2,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  X
} from 'lucide-react'

type StoreStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'CLOSED' | 'all'

const statusLabels: Record<string, string> = {
  ACTIVE: 'Active',
  SUSPENDED: 'Suspendue',
  PENDING: 'En attente',
  CLOSED: 'Fermée',
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  SUSPENDED: 'bg-red-100 text-red-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  CLOSED: 'bg-gray-100 text-gray-700',
}

const statusIcons: Record<string, typeof CheckCircle> = {
  ACTIVE: CheckCircle,
  SUSPENDED: Ban,
  PENDING: Clock,
  CLOSED: XCircle,
}

export default function SuperAdminStoresPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StoreStatus>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false)
  const [selectedStore, setSelectedStore] = useState<any>(null)
  const [suspendReason, setSuspendReason] = useState('')

  // Form state for create
  const [createForm, setCreateForm] = useState({
    name: '',
    slug: '',
    description: '',
    ownerEmail: '',
  })

  const utils = trpc.useUtils()

  const { data, isLoading, refetch } = trpc.superadmin.getAllStores.useQuery({
    limit: 50,
    offset: 0,
    search: search || undefined,
    status: statusFilter,
  })

  const createStore = trpc.superadmin.createStore.useMutation({
    onSuccess: () => {
      setIsCreateModalOpen(false)
      setCreateForm({ name: '', slug: '', description: '', ownerEmail: '' })
      refetch()
    },
  })

  const updateStoreStatus = trpc.superadmin.updateStoreStatus.useMutation({
    onSuccess: () => {
      setIsSuspendModalOpen(false)
      setSelectedStore(null)
      setSuspendReason('')
      refetch()
    },
  })

  const stores = data?.stores || []
  const statusCounts = data?.statusCounts || { active: 0, suspended: 0, pending: 0, closed: 0 }

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault()
    await createStore.mutateAsync({
      ...createForm,
      status: 'ACTIVE',
    })
  }

  const handleStatusChange = async (storeId: string, newStatus: 'ACTIVE' | 'SUSPENDED' | 'CLOSED', reason?: string) => {
    await updateStoreStatus.mutateAsync({
      storeId,
      status: newStatus,
      reason,
    })
  }

  const openSuspendModal = (store: any) => {
    setSelectedStore(store)
    setSuspendReason('')
    setIsSuspendModalOpen(true)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Boutiques</h1>
          <p className="text-gray-600">
            {data?.total || 0} boutique{(data?.total || 0) > 1 ? 's' : ''} sur la plateforme
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle boutique
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('ACTIVE')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Actives</p>
              <p className="text-xl font-bold text-gray-900">{statusCounts.active}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('SUSPENDED')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Ban className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Suspendues</p>
              <p className="text-xl font-bold text-gray-900">{statusCounts.suspended}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('PENDING')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-xl font-bold text-gray-900">{statusCounts.pending}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('CLOSED')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Fermées</p>
              <p className="text-xl font-bold text-gray-900">{statusCounts.closed}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Rechercher par nom, slug ou email du propriétaire..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StoreStatus)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="ACTIVE">Actives</option>
            <option value="SUSPENDED">Suspendues</option>
            <option value="PENDING">En attente</option>
            <option value="CLOSED">Fermées</option>
          </select>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      )}

      {/* Stores List */}
      {!isLoading && stores.length === 0 && (
        <Card className="p-12 text-center">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucune boutique trouvée</p>
        </Card>
      )}

      {!isLoading && stores.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {stores.map((store) => {
            const StatusIcon = statusIcons[store.status] || CheckCircle

            return (
              <Card key={store.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  {/* Store Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {store.logo ? (
                        <img
                          src={store.logo}
                          alt={store.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Store className="w-6 h-6 text-purple-600" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-gray-900">{store.name}</h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[store.status]}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusLabels[store.status]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">/{store.slug}</p>
                      </div>
                    </div>

                    {store.description && (
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">{store.description}</p>
                    )}

                    {/* Suspension reason */}
                    {store.status === 'SUSPENDED' && store.suspendedReason && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-700">Raison de la suspension</p>
                          <p className="text-sm text-red-600">{store.suspendedReason}</p>
                        </div>
                      </div>
                    )}

                    {/* Owner Info */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Propriétaire:</span> {store.owner.name || store.owner.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Email:</span> {store.owner.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Créée le:</span> {formatDate(store.createdAt)}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-600">Produits</p>
                          <p className="text-sm font-semibold text-gray-900">{store._count.products}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-xs text-gray-600">Commandes</p>
                          <p className="text-sm font-semibold text-gray-900">{store._count.orders}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        <div>
                          <p className="text-xs text-gray-600">Clients</p>
                          <p className="text-sm font-semibold text-gray-900">{store._count.customers}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-orange-600" />
                        <div>
                          <p className="text-xs text-gray-600">Revenu</p>
                          <p className="text-sm font-semibold text-gray-900">{formatPrice(store.revenue)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="ml-4 flex flex-col gap-2">
                    <Link href={`/superadmin/stores/${store.id}`}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Détails
                      </Button>
                    </Link>

                    {store.status === 'ACTIVE' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => openSuspendModal(store)}
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Suspendre
                      </Button>
                    )}

                    {store.status === 'SUSPENDED' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleStatusChange(store.id, 'ACTIVE')}
                        disabled={updateStoreStatus.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Réactiver
                      </Button>
                    )}

                    {store.status === 'PENDING' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleStatusChange(store.id, 'ACTIVE')}
                        disabled={updateStoreStatus.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approuver
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Store Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Créer une boutique</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateStore} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la boutique *
                </label>
                <Input
                  value={createForm.name}
                  onChange={(e) => {
                    setCreateForm({
                      ...createForm,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    })
                  }}
                  placeholder="Ma Boutique"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug (URL) *
                </label>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">foxcard.io/</span>
                  <Input
                    value={createForm.slug}
                    onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    placeholder="ma-boutique"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Description de la boutique..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email du propriétaire *
                </label>
                <Input
                  type="email"
                  value={createForm.ownerEmail}
                  onChange={(e) => setCreateForm({ ...createForm, ownerEmail: e.target.value })}
                  placeholder="proprietaire@exemple.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">L'utilisateur doit déjà avoir un compte sur la plateforme</p>
              </div>

              {createStore.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{createStore.error.message}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary" disabled={createStore.isPending}>
                  {createStore.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Créer la boutique
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suspend Store Modal */}
      {isSuspendModalOpen && selectedStore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Suspendre la boutique</h2>
              <button onClick={() => setIsSuspendModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Attention</p>
                  <p className="text-sm text-yellow-700">
                    La suspension de la boutique <strong>{selectedStore.name}</strong> empêchera le marchand
                    d'accéder à son espace et bloquera toutes les opérations commerciales.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison de la suspension *
                </label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Expliquez la raison de cette suspension..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsSuspendModalOpen(false)}>
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  className="bg-red-600 hover:bg-red-700"
                  disabled={!suspendReason.trim() || updateStoreStatus.isPending}
                  onClick={() => handleStatusChange(selectedStore.id, 'SUSPENDED', suspendReason)}
                >
                  {updateStoreStatus.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Suspendre la boutique
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
