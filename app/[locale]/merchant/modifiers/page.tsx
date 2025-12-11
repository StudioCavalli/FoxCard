'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Settings2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  DollarSign
} from 'lucide-react'

interface Modifier {
  id: string
  name: string
  description?: string | null
  priceAdjustment: number
  isDefault: boolean
  isAvailable: boolean
  calories?: number | null
  allergens: string[]
  sortOrder: number
}

interface ModifierGroup {
  id: string
  name: string
  slug: string
  description?: string | null
  selectionType: 'SINGLE' | 'MULTIPLE' | 'QUANTITY'
  minSelections: number
  maxSelections?: number | null
  isRequired: boolean
  isActive: boolean
  productIds: string[]
  modifiers: Modifier[]
  sortOrder: number
}

export default function ModifiersPage() {
  const t = useTranslations('merchant.restaurant.modifiers')
  const { storeId } = useStoreContext()

  // State
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [isCreatingModifier, setIsCreatingModifier] = useState<string | null>(null) // groupId
  const [editingModifierId, setEditingModifierId] = useState<string | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // Form state - Group
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    selectionType: 'SINGLE' as 'SINGLE' | 'MULTIPLE' | 'QUANTITY',
    minSelections: 0,
    maxSelections: null as number | null,
    isRequired: false,
  })

  // Form state - Modifier
  const [modifierForm, setModifierForm] = useState({
    name: '',
    description: '',
    priceAdjustment: 0,
    isDefault: false,
    isAvailable: true,
    calories: null as number | null,
    allergens: [] as string[],
  })

  // Queries
  const { data: groups, isLoading, refetch } = trpc.restaurant.getModifierGroups.useQuery(
    { storeId: storeId!, includeInactive: true },
    { enabled: !!storeId }
  )

  // Mutations
  const createGroupMutation = trpc.restaurant.createModifierGroup.useMutation({
    onSuccess: () => {
      refetch()
      setIsCreatingGroup(false)
      resetGroupForm()
    },
  })

  const updateGroupMutation = trpc.restaurant.updateModifierGroup.useMutation({
    onSuccess: () => {
      refetch()
      setEditingGroupId(null)
      resetGroupForm()
    },
  })

  const deleteGroupMutation = trpc.restaurant.deleteModifierGroup.useMutation({
    onSuccess: () => refetch(),
  })

  const createModifierMutation = trpc.restaurant.createModifier.useMutation({
    onSuccess: () => {
      refetch()
      setIsCreatingModifier(null)
      resetModifierForm()
    },
  })

  const updateModifierMutation = trpc.restaurant.updateModifier.useMutation({
    onSuccess: () => {
      refetch()
      setEditingModifierId(null)
      resetModifierForm()
    },
  })

  const deleteModifierMutation = trpc.restaurant.deleteModifier.useMutation({
    onSuccess: () => refetch(),
  })

  // Reset forms
  const resetGroupForm = () => {
    setGroupForm({
      name: '',
      description: '',
      selectionType: 'SINGLE' as 'SINGLE' | 'MULTIPLE' | 'QUANTITY',
      minSelections: 0,
      maxSelections: null,
      isRequired: false,
    })
  }

  const resetModifierForm = () => {
    setModifierForm({
      name: '',
      description: '',
      priceAdjustment: 0,
      isDefault: false,
      isAvailable: true,
      calories: null,
      allergens: [],
    })
  }

  // Handlers
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeId || !groupForm.name) return

    await createGroupMutation.mutateAsync({
      storeId,
      name: groupForm.name,
      description: groupForm.description || undefined,
      selectionType: groupForm.selectionType,
      minSelections: groupForm.minSelections,
      maxSelections: groupForm.maxSelections,
      isRequired: groupForm.isRequired,
    })
  }

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeId || !editingGroupId || !groupForm.name) return

    await updateGroupMutation.mutateAsync({
      storeId,
      groupId: editingGroupId,
      name: groupForm.name,
      description: groupForm.description || null,
      selectionType: groupForm.selectionType,
      minSelections: groupForm.minSelections,
      maxSelections: groupForm.maxSelections,
      isRequired: groupForm.isRequired,
    })
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!storeId || !confirm(t('confirmDeleteGroup'))) return
    await deleteGroupMutation.mutateAsync({ storeId, groupId })
  }

  const handleToggleGroupActive = async (group: ModifierGroup) => {
    if (!storeId) return
    await updateGroupMutation.mutateAsync({
      storeId,
      groupId: group.id,
      isActive: !group.isActive,
    })
  }

  const handleCreateModifier = async (e: React.FormEvent, groupId: string) => {
    e.preventDefault()
    if (!storeId || !modifierForm.name) return

    await createModifierMutation.mutateAsync({
      storeId,
      groupId,
      name: modifierForm.name,
      description: modifierForm.description || undefined,
      priceAdjustment: modifierForm.priceAdjustment,
      isDefault: modifierForm.isDefault,
      isAvailable: modifierForm.isAvailable,
      calories: modifierForm.calories,
      allergens: modifierForm.allergens,
    })
  }

  const handleUpdateModifier = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeId || !editingModifierId || !modifierForm.name) return

    await updateModifierMutation.mutateAsync({
      storeId,
      modifierId: editingModifierId,
      name: modifierForm.name,
      description: modifierForm.description || null,
      priceAdjustment: modifierForm.priceAdjustment,
      isDefault: modifierForm.isDefault,
      isAvailable: modifierForm.isAvailable,
      calories: modifierForm.calories,
      allergens: modifierForm.allergens,
    })
  }

  const handleDeleteModifier = async (modifierId: string) => {
    if (!storeId || !confirm(t('confirmDeleteModifier'))) return
    await deleteModifierMutation.mutateAsync({ storeId, modifierId })
  }

  const startEditGroup = (group: ModifierGroup) => {
    setEditingGroupId(group.id)
    setIsCreatingGroup(false)
    setGroupForm({
      name: group.name,
      description: group.description || '',
      selectionType: group.selectionType,
      minSelections: group.minSelections,
      maxSelections: group.maxSelections ?? null,
      isRequired: group.isRequired,
    })
  }

  const startEditModifier = (modifier: Modifier) => {
    setEditingModifierId(modifier.id)
    setIsCreatingModifier(null)
    setModifierForm({
      name: modifier.name,
      description: modifier.description || '',
      priceAdjustment: modifier.priceAdjustment,
      isDefault: modifier.isDefault,
      isAvailable: modifier.isAvailable,
      calories: modifier.calories ?? null,
      allergens: modifier.allergens,
    })
  }

  const toggleGroupExpanded = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }

  const formatPrice = (price: number) => {
    if (price === 0) return null
    const sign = price > 0 ? '+' : ''
    return `${sign}${price.toFixed(2)} €`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
        {!isCreatingGroup && !editingGroupId && (
          <AdminButton icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreatingGroup(true)}>
            {t('createGroup')}
          </AdminButton>
        )}
      </div>

      {/* Create/Edit Group Form */}
      {(isCreatingGroup || editingGroupId) && (
        <AdminCard padding="lg">
          <form onSubmit={editingGroupId ? handleUpdateGroup : handleCreateGroup} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {editingGroupId ? t('editGroup') : t('createGroup')}
              </h3>
              <AdminButton
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => {
                  setIsCreatingGroup(false)
                  setEditingGroupId(null)
                  resetGroupForm()
                }}
              >
                <X className="w-4 h-4" />
              </AdminButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('groupName')} *
                </label>
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder={t('groupNamePlaceholder')}
                  required
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('selectionType')}
                </label>
                <select
                  value={groupForm.selectionType}
                  onChange={(e) => setGroupForm({ ...groupForm, selectionType: e.target.value as 'SINGLE' | 'MULTIPLE' | 'QUANTITY' })}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                >
                  <option value="SINGLE">{t('single')}</option>
                  <option value="MULTIPLE">{t('multiple')}</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('description')}
                </label>
                <input
                  type="text"
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                  placeholder={t('descriptionPlaceholder')}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('minSelections')}
                </label>
                <input
                  type="number"
                  min="0"
                  value={groupForm.minSelections}
                  onChange={(e) => setGroupForm({ ...groupForm, minSelections: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('maxSelections')}
                </label>
                <input
                  type="number"
                  min="1"
                  value={groupForm.maxSelections ?? ''}
                  onChange={(e) => setGroupForm({ ...groupForm, maxSelections: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder={t('unlimited')}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={groupForm.isRequired}
                    onChange={(e) => setGroupForm({ ...groupForm, isRequired: e.target.checked })}
                    className="rounded border-slate-300 dark:border-slate-600 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{t('isRequired')}</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <AdminButton
                variant="secondary"
                type="button"
                onClick={() => {
                  setIsCreatingGroup(false)
                  setEditingGroupId(null)
                  resetGroupForm()
                }}
              >
                {t('cancel')}
              </AdminButton>
              <AdminButton
                type="submit"
                icon={<Save className="w-4 h-4" />}
                disabled={createGroupMutation.isPending || updateGroupMutation.isPending}
              >
                {createGroupMutation.isPending || updateGroupMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingGroupId ? (
                  t('save')
                ) : (
                  t('create')
                )}
              </AdminButton>
            </div>
          </form>
        </AdminCard>
      )}

      {/* Groups List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : !groups || groups.length === 0 ? (
        <AdminCard padding="lg">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings2 className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('noGroups')}</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">{t('noGroupsDescription')}</p>
            <AdminButton icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreatingGroup(true)}>
              {t('createGroup')}
            </AdminButton>
          </div>
        </AdminCard>
      ) : (
        <div className="space-y-4">
          {groups.map((group: ModifierGroup) => (
            <AdminCard key={group.id} padding="none" className={!group.isActive ? 'opacity-60' : ''}>
              {/* Group Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                onClick={() => toggleGroupExpanded(group.id)}
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-5 h-5 text-slate-400 cursor-grab" />
                  {expandedGroups.has(group.id) ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{group.name}</h3>
                      <AdminBadge variant={group.selectionType === 'SINGLE' ? 'default' : 'info'}>
                        {group.selectionType === 'SINGLE' ? t('single') : t('multiple')}
                      </AdminBadge>
                      {group.isRequired && (
                        <AdminBadge variant="warning">{t('required')}</AdminBadge>
                      )}
                      {!group.isActive && (
                        <AdminBadge variant="default">{t('inactive')}</AdminBadge>
                      )}
                    </div>
                    {group.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{group.description}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      {group.modifiers.length} {t('modifiersCount')}
                      {group.minSelections > 0 && ` • Min: ${group.minSelections}`}
                      {group.maxSelections && ` • Max: ${group.maxSelections}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <AdminButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleGroupActive(group)}
                    title={group.isActive ? t('deactivate') : t('activate')}
                  >
                    {group.isActive ? (
                      <ToggleRight className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-slate-400" />
                    )}
                  </AdminButton>
                  <AdminButton variant="ghost" size="sm" onClick={() => startEditGroup(group)}>
                    <Edit className="w-4 h-4" />
                  </AdminButton>
                  <AdminButton
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                    onClick={() => handleDeleteGroup(group.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </AdminButton>
                </div>
              </div>

              {/* Group Modifiers */}
              {expandedGroups.has(group.id) && (
                <div className="border-t border-slate-200 dark:border-slate-700">
                  {/* Modifiers */}
                  {group.modifiers.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {group.modifiers.map((modifier) => (
                        <div
                          key={modifier.id}
                          className={`flex items-center justify-between px-4 py-3 pl-14 ${
                            !modifier.isAvailable ? 'opacity-50' : ''
                          }`}
                        >
                          {editingModifierId === modifier.id ? (
                            // Edit Modifier Form
                            <form
                              onSubmit={handleUpdateModifier}
                              className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3"
                            >
                              <input
                                type="text"
                                value={modifierForm.name}
                                onChange={(e) => setModifierForm({ ...modifierForm, name: e.target.value })}
                                placeholder={t('modifierName')}
                                required
                                className="px-3 py-2 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                              />
                              <input
                                type="number"
                                step="0.01"
                                value={modifierForm.priceAdjustment}
                                onChange={(e) =>
                                  setModifierForm({ ...modifierForm, priceAdjustment: parseFloat(e.target.value) || 0 })
                                }
                                placeholder={t('priceAdjustment')}
                                className="px-3 py-2 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                              />
                              <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={modifierForm.isDefault}
                                    onChange={(e) => setModifierForm({ ...modifierForm, isDefault: e.target.checked })}
                                    className="rounded border-slate-300 dark:border-slate-600 text-primary-500 focus:ring-primary-500"
                                  />
                                  <span className="text-slate-700 dark:text-slate-300">{t('default')}</span>
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={modifierForm.isAvailable}
                                    onChange={(e) => setModifierForm({ ...modifierForm, isAvailable: e.target.checked })}
                                    className="rounded border-slate-300 dark:border-slate-600 text-primary-500 focus:ring-primary-500"
                                  />
                                  <span className="text-slate-700 dark:text-slate-300">{t('available')}</span>
                                </label>
                              </div>
                              <div className="flex items-center gap-2">
                                <AdminButton type="submit" size="sm" disabled={updateModifierMutation.isPending}>
                                  <Save className="w-4 h-4" />
                                </AdminButton>
                                <AdminButton
                                  variant="ghost"
                                  size="sm"
                                  type="button"
                                  onClick={() => {
                                    setEditingModifierId(null)
                                    resetModifierForm()
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </AdminButton>
                              </div>
                            </form>
                          ) : (
                            // Modifier Display
                            <>
                              <div className="flex items-center gap-3">
                                <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-900 dark:text-white">{modifier.name}</span>
                                    {modifier.isDefault && (
                                      <AdminBadge variant="success" size="sm">
                                        {t('default')}
                                      </AdminBadge>
                                    )}
                                    {!modifier.isAvailable && (
                                      <AdminBadge variant="default" size="sm">
                                        {t('unavailable')}
                                      </AdminBadge>
                                    )}
                                  </div>
                                  {modifier.description && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{modifier.description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                {modifier.priceAdjustment !== 0 && (
                                  <span
                                    className={`text-sm font-medium ${
                                      modifier.priceAdjustment > 0
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-red-600 dark:text-red-400'
                                    }`}
                                  >
                                    {formatPrice(modifier.priceAdjustment)}
                                  </span>
                                )}
                                <div className="flex items-center gap-1">
                                  <AdminButton variant="ghost" size="sm" onClick={() => startEditModifier(modifier)}>
                                    <Edit className="w-4 h-4" />
                                  </AdminButton>
                                  <AdminButton
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                    onClick={() => handleDeleteModifier(modifier.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </AdminButton>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>{t('noModifiers')}</p>
                    </div>
                  )}

                  {/* Add Modifier Form / Button */}
                  {isCreatingModifier === group.id ? (
                    <form
                      onSubmit={(e) => handleCreateModifier(e, group.id)}
                      className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                          type="text"
                          value={modifierForm.name}
                          onChange={(e) => setModifierForm({ ...modifierForm, name: e.target.value })}
                          placeholder={t('modifierName')}
                          required
                          className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                        />
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="number"
                            step="0.01"
                            value={modifierForm.priceAdjustment}
                            onChange={(e) =>
                              setModifierForm({ ...modifierForm, priceAdjustment: parseFloat(e.target.value) || 0 })
                            }
                            placeholder="0.00"
                            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={modifierForm.isDefault}
                              onChange={(e) => setModifierForm({ ...modifierForm, isDefault: e.target.checked })}
                              className="rounded border-slate-300 dark:border-slate-600 text-primary-500 focus:ring-primary-500"
                            />
                            <span className="text-slate-700 dark:text-slate-300">{t('default')}</span>
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <AdminButton type="submit" size="sm" disabled={createModifierMutation.isPending}>
                            {createModifierMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                          </AdminButton>
                          <AdminButton
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={() => {
                              setIsCreatingModifier(null)
                              resetModifierForm()
                            }}
                          >
                            <X className="w-4 h-4" />
                          </AdminButton>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                      <AdminButton
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsCreatingModifier(group.id)
                          setEditingModifierId(null)
                          resetModifierForm()
                        }}
                        className="w-full justify-center"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('addModifier')}
                      </AdminButton>
                    </div>
                  )}
                </div>
              )}
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  )
}
