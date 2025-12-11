'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { AdminToggle } from '@/components/admin/ui/AdminToggle'
import { AdminInput } from '@/components/admin/ui/AdminInput'
import { AdminModal } from '@/components/admin/ui/AdminModal'
import { AdminTimePicker } from '@/components/admin/ui/AdminTimePicker'
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
  Check,
  CalendarDays
} from 'lucide-react'

// Days of the week (keys used for translations and schedule)
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

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
            <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="font-semibold text-slate-900 dark:text-white">{t('weeklySchedule')}</h2>
          </div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {DAYS.map((day) => (
            <div
              key={day}
              className={`p-4 sm:p-5 ${
                isToday(day) ? 'bg-primary-50 dark:bg-primary-500/10' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Day Label */}
                <div className="sm:w-36 flex items-center gap-2">
                  <span className={`font-semibold ${isToday(day) ? 'text-primary-600 dark:text-primary-400' : 'text-slate-900 dark:text-white'}`}>
                    {t(`days.${day}`)}
                  </span>
                  {isToday(day) && (
                    <AdminBadge variant="purple" size="sm">{t('today')}</AdminBadge>
                  )}
                </div>

                {/* Open/Closed Toggle */}
                <div className="flex items-center gap-4 sm:w-32">
                  <AdminToggle
                    checked={schedule[day]?.isOpen}
                    onChange={(e) => updateDaySchedule(day, 'isOpen', e.target.checked)}
                  />
                  <span className={`text-sm font-medium ${schedule[day]?.isOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                    {schedule[day]?.isOpen ? t('open') : t('closed')}
                  </span>
                </div>

                {/* Time Inputs */}
                {schedule[day]?.isOpen && (
                  <div className="flex items-center gap-2 sm:gap-3 flex-1">
                    <div className="flex-1 max-w-[140px]">
                      <AdminTimePicker
                        value={schedule[day]?.openTime}
                        onChange={(value) => updateDaySchedule(day, 'openTime', value)}
                        minuteStep={15}
                      />
                    </div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium">→</span>
                    <div className="flex-1 max-w-[140px]">
                      <AdminTimePicker
                        value={schedule[day]?.closeTime}
                        onChange={(value) => updateDaySchedule(day, 'closeTime', value)}
                        minuteStep={15}
                      />
                    </div>
                  </div>
                )}

                {/* Closed indicator */}
                {!schedule[day]?.isOpen && (
                  <div className="flex-1 flex items-center">
                    <span className="text-sm text-slate-400 dark:text-slate-500 italic">
                      {t('closedAllDay')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </AdminCard>

      {/* Special Dates */}
      <AdminCard>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary-600 dark:text-primary-400" />
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
      <AdminModal
        isOpen={showAddSpecialDate}
        onClose={() => setShowAddSpecialDate(false)}
        title={t('specialDates.addTitle')}
        size="sm"
        footer={
          <>
            <AdminButton
              variant="secondary"
              onClick={() => setShowAddSpecialDate(false)}
            >
              {t('cancel')}
            </AdminButton>
            <AdminButton
              onClick={addSpecialDate}
              disabled={!newSpecialDate.date || !newSpecialDate.name}
            >
              {t('specialDates.addButton')}
            </AdminButton>
          </>
        }
      >
        <div className="space-y-5">
          <AdminInput
            type="date"
            label={`${t('specialDates.date')} *`}
            value={newSpecialDate.date}
            onChange={(e) => setNewSpecialDate({ ...newSpecialDate, date: e.target.value })}
          />

          <AdminInput
            type="text"
            label={`${t('specialDates.name')} *`}
            value={newSpecialDate.name}
            onChange={(e) => setNewSpecialDate({ ...newSpecialDate, name: e.target.value })}
            placeholder={t('specialDates.namePlaceholder')}
          />

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <AdminToggle
              checked={newSpecialDate.isOpen}
              onChange={(e) => setNewSpecialDate({ ...newSpecialDate, isOpen: e.target.checked })}
              label={t('specialDates.openOnDate')}
              description={t('specialDates.openOnDateDesc')}
            />
          </div>

          {newSpecialDate.isOpen && (
            <div className="grid grid-cols-2 gap-4">
              <AdminTimePicker
                label={t('specialDates.openTime')}
                value={newSpecialDate.openTime}
                onChange={(value) => setNewSpecialDate({ ...newSpecialDate, openTime: value })}
                minuteStep={15}
              />
              <AdminTimePicker
                label={t('specialDates.closeTime')}
                value={newSpecialDate.closeTime}
                onChange={(value) => setNewSpecialDate({ ...newSpecialDate, closeTime: value })}
                minuteStep={15}
              />
            </div>
          )}
        </div>
      </AdminModal>
    </div>
  )
}
