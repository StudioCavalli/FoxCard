'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { AdminInput } from '@/components/admin/ui/AdminInput'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import {
  Loader2,
  Plus,
  Users,
  Circle,
  Clock,
  Trash2,
  Edit3,
  X,
  Check,
  UtensilsCrossed,
  Sparkles,
  AlertCircle
} from 'lucide-react'

type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING'

interface TableInfo {
  id: string
  number: string
  capacity: number
  status: TableStatus
  floor?: string
  section?: string
  reservedUntil?: Date
  currentOrderId?: string
}

export default function TablesPage() {
  const t = useTranslations('merchant.restaurant.tables')
  const { storeId } = useStoreContext()

  const [isCreating, setIsCreating] = useState(false)
  const [editingTable, setEditingTable] = useState<string | null>(null)
  const [newTable, setNewTable] = useState({
    number: '',
    capacity: 2,
    floor: '',
    section: ''
  })

  // Fetch tables
  const { data: tables, isLoading, refetch } = trpc.restaurant.getTables.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  )

  // Mutations
  const createTableMutation = trpc.restaurant.createTable.useMutation({
    onSuccess: () => {
      refetch()
      setIsCreating(false)
      setNewTable({ number: '', capacity: 2, floor: '', section: '' })
    }
  })

  const updateStatusMutation = trpc.restaurant.updateTableStatus.useMutation({
    onSuccess: () => refetch()
  })

  const deleteTableMutation = trpc.restaurant.deleteTable.useMutation({
    onSuccess: () => refetch()
  })

  // Handle create table
  const handleCreate = () => {
    if (!storeId || !newTable.number) return
    createTableMutation.mutate({
      storeId,
      number: newTable.number,
      capacity: newTable.capacity,
      floor: newTable.floor || undefined,
      section: newTable.section || undefined
    })
  }

  // Handle status change
  const handleStatusChange = (tableId: string, status: TableStatus) => {
    if (!storeId) return
    updateStatusMutation.mutate({
      storeId,
      tableId,
      status
    })
  }

  // Handle delete
  const handleDelete = (tableId: string) => {
    if (!storeId) return
    if (window.confirm(t('confirmDelete'))) {
      deleteTableMutation.mutate({ storeId, tableId })
    }
  }

  // Status colors and icons
  const getStatusStyle = (status: TableStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', badge: 'success' as const }
      case 'OCCUPIED':
        return { bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-700 dark:text-red-400', badge: 'danger' as const }
      case 'RESERVED':
        return { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-400', badge: 'warning' as const }
      case 'CLEANING':
        return { bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-400', badge: 'info' as const }
    }
  }

  // Group tables by floor/section
  const groupedTables = tables?.reduce((acc, table) => {
    const key = table.floor || 'main'
    if (!acc[key]) acc[key] = []
    acc[key].push(table)
    return acc
  }, {} as Record<string, TableInfo[]>) || {}

  // Stats
  const stats = {
    total: tables?.length || 0,
    available: tables?.filter(t => t.status === 'AVAILABLE').length || 0,
    occupied: tables?.filter(t => t.status === 'OCCUPIED').length || 0,
    reserved: tables?.filter(t => t.status === 'RESERVED').length || 0,
    totalCapacity: tables?.reduce((sum, t) => sum + t.capacity, 0) || 0
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
        <AdminButton onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('addTable')}
        </AdminButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <AdminCard padding="md">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{t('totalTables')}</div>
          </div>
        </AdminCard>
        <AdminCard padding="md">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.available}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{t('available')}</div>
          </div>
        </AdminCard>
        <AdminCard padding="md">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.occupied}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{t('occupied')}</div>
          </div>
        </AdminCard>
        <AdminCard padding="md">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.reserved}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{t('reserved')}</div>
          </div>
        </AdminCard>
        <AdminCard padding="md">
          <div className="text-center">
            <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">{stats.totalCapacity}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{t('totalCapacity')}</div>
          </div>
        </AdminCard>
      </div>

      {/* Create Table Modal */}
      {isCreating && (
        <AdminCard>
          <div className="p-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">{t('addTable')}</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <AdminInput
                label={t('tableNumber')}
                value={newTable.number}
                onChange={(e) => setNewTable({ ...newTable, number: e.target.value })}
                placeholder="1, 2, A1..."
              />
              <AdminInput
                label={t('capacity')}
                type="number"
                min={1}
                max={20}
                value={newTable.capacity}
                onChange={(e) => setNewTable({ ...newTable, capacity: parseInt(e.target.value) || 2 })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <AdminInput
                label={t('floor')}
                value={newTable.floor}
                onChange={(e) => setNewTable({ ...newTable, floor: e.target.value })}
                placeholder={t('floorPlaceholder')}
              />
              <AdminInput
                label={t('section')}
                value={newTable.section}
                onChange={(e) => setNewTable({ ...newTable, section: e.target.value })}
                placeholder={t('sectionPlaceholder')}
              />
            </div>
            <div className="flex justify-end gap-2">
              <AdminButton variant="ghost" onClick={() => setIsCreating(false)}>
                <X className="w-4 h-4 mr-2" />
                {t('cancel')}
              </AdminButton>
              <AdminButton
                onClick={handleCreate}
                disabled={!newTable.number || createTableMutation.isPending}
              >
                {createTableMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                {t('create')}
              </AdminButton>
            </div>
          </div>
        </AdminCard>
      )}

      {/* Tables Grid */}
      {!tables || tables.length === 0 ? (
        <AdminCard padding="lg">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-violet-100 dark:bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-10 h-10 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {t('noTables')}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {t('noTablesDescription')}
            </p>
            <AdminButton onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('addFirstTable')}
            </AdminButton>
          </div>
        </AdminCard>
      ) : (
        Object.entries(groupedTables).map(([floor, floorTables]) => (
          <div key={floor}>
            {Object.keys(groupedTables).length > 1 && (
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 capitalize">
                {floor === 'main' ? t('mainFloor') : floor}
              </h2>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {floorTables.map((table) => {
                const style = getStatusStyle(table.status)
                return (
                  <div
                    key={table.id}
                    className={`${style.bg} rounded-xl p-4 relative group transition-all hover:scale-105 cursor-pointer`}
                  >
                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(table.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>

                    {/* Table number */}
                    <div className="text-center mb-3">
                      <div className={`text-2xl font-bold ${style.text}`}>
                        {table.number}
                      </div>
                      {table.section && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {table.section}
                        </div>
                      )}
                    </div>

                    {/* Capacity */}
                    <div className="flex items-center justify-center gap-1 mb-3">
                      <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {table.capacity}
                      </span>
                    </div>

                    {/* Status badge */}
                    <div className="text-center mb-3">
                      <AdminBadge variant={style.badge} size="sm">
                        {t(`status.${table.status.toLowerCase()}`)}
                      </AdminBadge>
                    </div>

                    {/* Quick actions */}
                    <div className="grid grid-cols-2 gap-1">
                      {table.status !== 'AVAILABLE' && (
                        <button
                          onClick={() => handleStatusChange(table.id, 'AVAILABLE')}
                          className="p-1.5 text-xs bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                          title={t('markAvailable')}
                        >
                          <Circle className="w-3 h-3 mx-auto" />
                        </button>
                      )}
                      {table.status !== 'OCCUPIED' && (
                        <button
                          onClick={() => handleStatusChange(table.id, 'OCCUPIED')}
                          className="p-1.5 text-xs bg-red-500/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          title={t('markOccupied')}
                        >
                          <UtensilsCrossed className="w-3 h-3 mx-auto" />
                        </button>
                      )}
                      {table.status !== 'RESERVED' && (
                        <button
                          onClick={() => handleStatusChange(table.id, 'RESERVED')}
                          className="p-1.5 text-xs bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors"
                          title={t('markReserved')}
                        >
                          <Clock className="w-3 h-3 mx-auto" />
                        </button>
                      )}
                      {table.status !== 'CLEANING' && (
                        <button
                          onClick={() => handleStatusChange(table.id, 'CLEANING')}
                          className="p-1.5 text-xs bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                          title={t('markCleaning')}
                        >
                          <Sparkles className="w-3 h-3 mx-auto" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}

      {/* Legend */}
      {tables && tables.length > 0 && (
        <AdminCard>
          <div className="p-4">
            <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">{t('legend')}</h4>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-emerald-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">{t('status.available')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">{t('status.occupied')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">{t('status.reserved')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">{t('status.cleaning')}</span>
              </div>
            </div>
          </div>
        </AdminCard>
      )}
    </div>
  )
}
