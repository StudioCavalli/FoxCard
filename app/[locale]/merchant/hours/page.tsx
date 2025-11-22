'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import { useTranslations } from 'next-intl'
import {
  Clock,
  Calendar,
  Plus,
  Save,
  Loader2,
  X,
  Trash2,
  AlertCircle,
  Check,
  CalendarDays,
  Sunrise,
  Moon
} from 'lucide-react'

// Days of the week
const DAYS = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
]

interface DaySchedule {
  isOpen: boolean
  openTime: string
  closeTime: string
  breakStart?: string
  breakEnd?: string
}

interface SpecialDate {
  id: string
  date: string
  name: string
  isOpen: boolean
  openTime?: string
  closeTime?: string
}

const defaultSchedule: Record<string, DaySchedule> = {
  monday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
  tuesday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
  wednesday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
  thursday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
  friday: { isOpen: true, openTime: '09:00', closeTime: '23:00' },
  saturday: { isOpen: true, openTime: '10:00', closeTime: '23:00' },
  sunday: { isOpen: false, openTime: '10:00', closeTime: '20:00' },
}

export default function MerchantHoursPage() {
  const params = useParams()
  const locale = params?.locale || 'fr'
  const { storeId } = useStoreContext()
  const t = useTranslations('merchant.restaurant.hours')

  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(defaultSchedule)
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([])
  const [showAddSpecialDate, setShowAddSpecialDate] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [newSpecialDate, setNewSpecialDate] = useState({
    date: '',
    name: '',
    isOpen: false,
    openTime: '09:00',
    closeTime: '18:00',
  })

  // Load store data to get hours
  const { data: store, isLoading, refetch } = trpc.store.getById.useQuery(
    { id: storeId! },
    { enabled: !!storeId }
  )

  // Load schedule from store data
  useEffect(() => {
    if (store?.openingHours) {
      try {
        const parsed = typeof store.openingHours === 'string'
          ? JSON.parse(store.openingHours)
          : store.openingHours
        if (parsed.schedule) setSchedule(parsed.schedule)
        if (parsed.specialDates) setSpecialDates(parsed.specialDates)
      } catch (e) {
        console.error('Failed to parse opening hours:', e)
      }
    }
  }, [store])

  // Update store mutation
  const updateStore = trpc.store.update.useMutation({
    onSuccess: () => {
      setIsSaving(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      refetch()
    },
    onError: () => {
      setIsSaving(false)
    }
  })

  const handleSave = () => {
    if (!storeId) return
    setIsSaving(true)

    updateStore.mutate({
      storeId: storeId,
      openingHours: JSON.stringify({ schedule, specialDates })
    })
  }

  const updateDaySchedule = (day: string, field: keyof DaySchedule, value: any) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }))
  }

  const addSpecialDate = () => {
    if (!newSpecialDate.date || !newSpecialDate.name) return

    const newDate: SpecialDate = {
      id: Date.now().toString(),
      ...newSpecialDate
    }

    setSpecialDates(prev => [...prev, newDate].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ))

    setNewSpecialDate({
      date: '',
      name: '',
      isOpen: false,
      openTime: '09:00',
      closeTime: '18:00',
    })
    setShowAddSpecialDate(false)
  }

  const removeSpecialDate = (id: string) => {
    setSpecialDates(prev => prev.filter(d => d.id !== id))
  }

  const isToday = (dayKey: string) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    return today === dayKey
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
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
          disabled={isSaving}
          icon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        >
          {isSaving ? t('saving') : saveSuccess ? t('saved') : t('save')}
        </AdminButton>
      </div>

      {/* Weekly Schedule */}
      <AdminCard>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <h2 className="font-semibold text-slate-900 dark:text-white">{t('weeklySchedule')}</h2>
          </div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {DAYS.map(({ key, label }) => (
            <div
              key={key}
              className={`p-4 flex flex-col sm:flex-row sm:items-center gap-4 ${
                isToday(key) ? 'bg-violet-50 dark:bg-violet-500/10' : ''
              }`}
            >
              {/* Day Label */}
              <div className="sm:w-32 flex items-center gap-2">
                <span className={`font-medium ${isToday(key) ? 'text-violet-600 dark:text-violet-400' : 'text-slate-900 dark:text-white'}`}>
                  {t(`days.${key}`)}
                </span>
                {isToday(key) && (
                  <AdminBadge variant="purple" size="sm">{t('today')}</AdminBadge>
                )}
              </div>

              {/* Open/Closed Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={schedule[key]?.isOpen}
                  onChange={(e) => updateDaySchedule(key, 'isOpen', e.target.checked)}
                  className="w-5 h-5 rounded text-violet-600 border-slate-300 dark:border-slate-600 focus:ring-violet-500"
                />
                <span className={`text-sm ${schedule[key]?.isOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {schedule[key]?.isOpen ? t('open') : t('closed')}
                </span>
              </label>

              {/* Time Inputs */}
              {schedule[key]?.isOpen && (
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <Sunrise className="w-4 h-4 text-slate-400" />
                    <input
                      type="time"
                      value={schedule[key]?.openTime}
                      onChange={(e) => updateDaySchedule(key, 'openTime', e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                  <span className="text-slate-400">—</span>
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-slate-400" />
                    <input
                      type="time"
                      value={schedule[key]?.closeTime}
                      onChange={(e) => updateDaySchedule(key, 'closeTime', e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </AdminCard>

      {/* Special Dates */}
      <AdminCard>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              <h2 className="font-semibold text-slate-900 dark:text-white">{t('specialDates.title')}</h2>
            </div>
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() => setShowAddSpecialDate(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              {t('specialDates.add')}
            </AdminButton>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('specialDates.description')}
          </p>
        </div>

        {specialDates.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {specialDates.map((specialDate) => (
              <div key={specialDate.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex flex-col items-center justify-center">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {new Date(specialDate.date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {new Date(specialDate.date).getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{specialDate.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {specialDate.isOpen
                        ? `${t('open')} ${specialDate.openTime} - ${specialDate.closeTime}`
                        : t('closed')
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AdminBadge variant={specialDate.isOpen ? 'success' : 'danger'}>
                    {specialDate.isOpen ? t('open') : t('closed')}
                  </AdminBadge>
                  <button
                    onClick={() => removeSpecialDate(specialDate.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">{t('specialDates.empty')}</h3>
            <p className="text-slate-500 dark:text-slate-400">{t('specialDates.emptyDesc')}</p>
          </div>
        )}
      </AdminCard>

      {/* Add Special Date Modal */}
      {showAddSpecialDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t('specialDates.addTitle')}
              </h2>
              <button
                onClick={() => setShowAddSpecialDate(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('specialDates.date')} *
                </label>
                <input
                  type="date"
                  value={newSpecialDate.date}
                  onChange={(e) => setNewSpecialDate({ ...newSpecialDate, date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('specialDates.name')} *
                </label>
                <input
                  type="text"
                  value={newSpecialDate.name}
                  onChange={(e) => setNewSpecialDate({ ...newSpecialDate, name: e.target.value })}
                  placeholder={t('specialDates.namePlaceholder')}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={newSpecialDate.isOpen}
                  onChange={(e) => setNewSpecialDate({ ...newSpecialDate, isOpen: e.target.checked })}
                  className="w-5 h-5 rounded text-violet-600 border-slate-300 dark:border-slate-600 focus:ring-violet-500"
                />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{t('specialDates.openOnDate')}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('specialDates.openOnDateDesc')}</p>
                </div>
              </label>

              {newSpecialDate.isOpen && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t('specialDates.openTime')}
                    </label>
                    <input
                      type="time"
                      value={newSpecialDate.openTime}
                      onChange={(e) => setNewSpecialDate({ ...newSpecialDate, openTime: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t('specialDates.closeTime')}
                    </label>
                    <input
                      type="time"
                      value={newSpecialDate.closeTime}
                      onChange={(e) => setNewSpecialDate({ ...newSpecialDate, closeTime: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <AdminButton
                  variant="secondary"
                  onClick={() => setShowAddSpecialDate(false)}
                  className="flex-1"
                >
                  {t('cancel')}
                </AdminButton>
                <AdminButton
                  onClick={addSpecialDate}
                  disabled={!newSpecialDate.date || !newSpecialDate.name}
                  className="flex-1"
                >
                  {t('specialDates.addButton')}
                </AdminButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
