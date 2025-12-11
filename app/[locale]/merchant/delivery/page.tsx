'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { AdminInput } from '@/components/admin/ui/AdminInput'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import {
  Loader2,
  Save,
  Clock,
  MapPin,
  Euro,
  Plus,
  Trash2,
  Bike,
  Package,
  AlertCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DeliverySlot {
  time: string
  capacity: number
}

interface DeliverySettings {
  preparationTime?: number
  deliveryRadius?: number
  minimumOrder?: number
  slots?: DeliverySlot[]
}

export default function DeliverySettingsPage() {
  const t = useTranslations('merchant.restaurant.delivery')
  const { storeId } = useStoreContext()
  const { toast } = useToast()

  const [settings, setSettings] = useState<DeliverySettings>({
    preparationTime: 30,
    deliveryRadius: 5,
    minimumOrder: 15,
    slots: []
  })
  const [newSlot, setNewSlot] = useState({ time: '12:00', capacity: 5 })
  const [hasChanges, setHasChanges] = useState(false)

  // Fetch store settings
  const { data: store, isLoading } = trpc.store.getById.useQuery(
    { id: storeId! },
    { enabled: !!storeId }
  )

  // Update settings mutation
  const updateMutation = trpc.restaurant.updateDeliverySettings.useMutation({
    onSuccess: () => {
      toast({ title: t('saved'), variant: 'default' })
      setHasChanges(false)
    },
    onError: (error) => {
      toast({ title: error.message, variant: 'destructive' })
    }
  })

  // Load existing settings
  useEffect(() => {
    if (store?.settings) {
      const storeSettings = store.settings as Record<string, unknown>
      const delivery = storeSettings.delivery as DeliverySettings | undefined
      if (delivery) {
        setSettings({
          preparationTime: delivery.preparationTime ?? 30,
          deliveryRadius: delivery.deliveryRadius ?? 5,
          minimumOrder: delivery.minimumOrder ?? 15,
          slots: delivery.slots ?? []
        })
      }
    }
  }, [store])

  // Handle save
  const handleSave = () => {
    if (!storeId) return
    updateMutation.mutate({
      storeId,
      preparationTime: settings.preparationTime,
      deliveryRadius: settings.deliveryRadius,
      minimumOrder: settings.minimumOrder,
      slots: settings.slots
    })
  }

  // Handle change
  const handleChange = (key: keyof DeliverySettings, value: number | undefined) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  // Add slot
  const handleAddSlot = () => {
    if (settings.slots?.some(s => s.time === newSlot.time)) {
      toast({ title: t('slotExists'), variant: 'destructive' })
      return
    }
    setSettings(prev => ({
      ...prev,
      slots: [...(prev.slots || []), newSlot].sort((a, b) => a.time.localeCompare(b.time))
    }))
    setHasChanges(true)
  }

  // Remove slot
  const handleRemoveSlot = (time: string) => {
    setSettings(prev => ({
      ...prev,
      slots: prev.slots?.filter(s => s.time !== time) || []
    }))
    setHasChanges(true)
  }

  // Update slot capacity
  const handleUpdateSlotCapacity = (time: string, capacity: number) => {
    setSettings(prev => ({
      ...prev,
      slots: prev.slots?.map(s => s.time === time ? { ...s, capacity } : s) || []
    }))
    setHasChanges(true)
  }

  // Default lunch and dinner slots
  const addDefaultSlots = () => {
    const defaultSlots: DeliverySlot[] = [
      { time: '11:30', capacity: 5 },
      { time: '12:00', capacity: 5 },
      { time: '12:30', capacity: 5 },
      { time: '13:00', capacity: 5 },
      { time: '13:30', capacity: 5 },
      { time: '14:00', capacity: 5 },
      { time: '18:30', capacity: 5 },
      { time: '19:00', capacity: 5 },
      { time: '19:30', capacity: 5 },
      { time: '20:00', capacity: 5 },
      { time: '20:30', capacity: 5 },
      { time: '21:00', capacity: 5 },
      { time: '21:30', capacity: 5 },
    ]
    setSettings(prev => ({ ...prev, slots: defaultSlots }))
    setHasChanges(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
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
        <AdminButton
          onClick={handleSave}
          disabled={!hasChanges || updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {t('save')}
        </AdminButton>
      </div>

      {/* General Settings */}
      <AdminCard>
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white">{t('generalSettings')}</h3>
        </div>
        <div className="p-4 space-y-6">
          {/* Preparation Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Clock className="w-4 h-4 text-primary-500" />
                {t('preparationTime')}
              </label>
              <div className="flex items-center gap-2">
                <AdminInput
                  type="number"
                  min={5}
                  max={120}
                  value={settings.preparationTime ?? ''}
                  onChange={(e) => handleChange('preparationTime', parseInt(e.target.value) || undefined)}
                />
                <span className="text-sm text-slate-500 dark:text-slate-400">{t('minutes')}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('preparationTimeHelp')}</p>
            </div>

            {/* Delivery Radius */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <MapPin className="w-4 h-4 text-primary-500" />
                {t('deliveryRadius')}
              </label>
              <div className="flex items-center gap-2">
                <AdminInput
                  type="number"
                  min={1}
                  max={50}
                  value={settings.deliveryRadius ?? ''}
                  onChange={(e) => handleChange('deliveryRadius', parseInt(e.target.value) || undefined)}
                />
                <span className="text-sm text-slate-500 dark:text-slate-400">km</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('deliveryRadiusHelp')}</p>
            </div>

            {/* Minimum Order */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Euro className="w-4 h-4 text-primary-500" />
                {t('minOrder')}
              </label>
              <div className="flex items-center gap-2">
                <AdminInput
                  type="number"
                  min={0}
                  step={0.5}
                  value={settings.minimumOrder ?? ''}
                  onChange={(e) => handleChange('minimumOrder', parseFloat(e.target.value) || undefined)}
                />
                <span className="text-sm text-slate-500 dark:text-slate-400">€</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('minOrderHelp')}</p>
            </div>
          </div>
        </div>
      </AdminCard>

      {/* Delivery/Takeaway Slots */}
      <AdminCard>
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{t('slots')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('slotsDescription')}</p>
          </div>
          <AdminButton variant="ghost" size="sm" onClick={addDefaultSlots}>
            {t('addDefaultSlots')}
          </AdminButton>
        </div>
        <div className="p-4">
          {/* Add new slot */}
          <div className="flex items-end gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                {t('slotTime')}
              </label>
              <AdminInput
                type="time"
                value={newSlot.time}
                onChange={(e) => setNewSlot(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
            <div className="w-32">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                {t('slotCapacity')}
              </label>
              <AdminInput
                type="number"
                min={1}
                max={50}
                value={newSlot.capacity}
                onChange={(e) => setNewSlot(prev => ({ ...prev, capacity: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <AdminButton onClick={handleAddSlot}>
              <Plus className="w-4 h-4 mr-2" />
              {t('addSlot')}
            </AdminButton>
          </div>

          {/* Slots list */}
          {!settings.slots || settings.slots.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h4 className="font-medium text-slate-900 dark:text-white mb-2">{t('noSlots')}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('noSlotsDescription')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Lunch slots */}
              {settings.slots.filter(s => {
                const hour = parseInt(s.time.split(':')[0])
                return hour >= 11 && hour < 15
              }).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    {t('lunchSlots')}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {settings.slots.filter(s => {
                      const hour = parseInt(s.time.split(':')[0])
                      return hour >= 11 && hour < 15
                    }).map(slot => (
                      <div
                        key={slot.time}
                        className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg group"
                      >
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{slot.time}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {slot.capacity} {t('ordersMax')}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveSlot(slot.time)}
                          className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dinner slots */}
              {settings.slots.filter(s => {
                const hour = parseInt(s.time.split(':')[0])
                return hour >= 18 && hour < 23
              }).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <Bike className="w-4 h-4" />
                    {t('dinnerSlots')}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {settings.slots.filter(s => {
                      const hour = parseInt(s.time.split(':')[0])
                      return hour >= 18 && hour < 23
                    }).map(slot => (
                      <div
                        key={slot.time}
                        className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg group"
                      >
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{slot.time}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {slot.capacity} {t('ordersMax')}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveSlot(slot.time)}
                          className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other slots */}
              {settings.slots.filter(s => {
                const hour = parseInt(s.time.split(':')[0])
                return (hour < 11 || (hour >= 15 && hour < 18) || hour >= 23)
              }).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('otherSlots')}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {settings.slots.filter(s => {
                      const hour = parseInt(s.time.split(':')[0])
                      return (hour < 11 || (hour >= 15 && hour < 18) || hour >= 23)
                    }).map(slot => (
                      <div
                        key={slot.time}
                        className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg group"
                      >
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{slot.time}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {slot.capacity} {t('ordersMax')}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveSlot(slot.time)}
                          className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </AdminCard>

      {/* Info box */}
      <AdminCard>
        <div className="p-4 flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="font-medium text-slate-900 dark:text-white mb-1">{t('infoTitle')}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t('infoDescription')}</p>
          </div>
        </div>
      </AdminCard>
    </div>
  )
}
