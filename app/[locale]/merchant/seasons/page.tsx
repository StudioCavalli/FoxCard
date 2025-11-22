'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { trpc } from '@/lib/trpc/client'
import { useStoreContext } from '@/lib/context/store-context'
import {
  Plus,
  Trash2,
  Loader2,
  X,
  Save,
  Calendar,
  Sun,
  Snowflake,
  Leaf,
  Flower2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface Season {
  id: string
  name: string
  type: string
  modifier: number
  startDate?: string
  endDate?: string
  priority: number
}

const SEASON_PRESETS = [
  { name: 'Haute saison', icon: Sun, modifier: 1.3, color: 'bg-red-100 text-red-700' },
  { name: 'Moyenne saison', icon: Leaf, modifier: 1.1, color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Basse saison', icon: Snowflake, modifier: 0.8, color: 'bg-blue-100 text-blue-700' },
  { name: 'Printemps', icon: Flower2, modifier: 1.0, color: 'bg-green-100 text-green-700' },
]

export default function SeasonsPage() {
  const t = useTranslations('merchant.hotel.seasons')
  const { storeId } = useStoreContext()
  const params = useParams()
  const locale = params?.locale || 'fr'

  const [isCreating, setIsCreating] = useState(false)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [formData, setFormData] = useState({
    name: '',
    modifier: '1.0',
    startDate: '',
    endDate: '',
    priority: '1',
  })

  // Get rate rules from hotel router (filter for SEASONAL type)
  const { data: allRules, isLoading, refetch } = trpc.hotel.getRateRules.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  )

  const seasons = useMemo(() => {
    if (!allRules) return []
    return (allRules as Season[]).filter(r => r.type === 'SEASONAL' || r.type === 'EVENT')
  }, [allRules])

  const createRule = trpc.hotel.createRateRule.useMutation({
    onSuccess: () => {
      refetch()
      resetForm()
      setIsCreating(false)
    },
  })

  const deleteRule = trpc.hotel.deleteRateRule.useMutation({
    onSuccess: () => refetch(),
  })

  const resetForm = () => {
    setFormData({
      name: '',
      modifier: '1.0',
      startDate: '',
      endDate: '',
      priority: '1',
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeId || !formData.name || !formData.startDate || !formData.endDate) return

    createRule.mutate({
      storeId,
      name: formData.name,
      type: 'SEASONAL',
      modifier: parseFloat(formData.modifier),
      startDate: formData.startDate,
      endDate: formData.endDate,
      priority: parseInt(formData.priority) || 1,
    })
  }

  const handleDelete = (ruleId: string) => {
    if (!storeId || !confirm('Supprimer cette saison ?')) return
    deleteRule.mutate({ storeId, ruleId })
  }

  const applyPreset = (preset: typeof SEASON_PRESETS[0]) => {
    setFormData({
      ...formData,
      name: preset.name,
      modifier: preset.modifier.toString(),
    })
  }

  const formatModifier = (modifier: number) => {
    if (modifier > 1) {
      return `+${Math.round((modifier - 1) * 100)}%`
    } else if (modifier < 1) {
      return `-${Math.round((1 - modifier) * 100)}%`
    }
    return 'Prix normal'
  }

  // Generate months for calendar view
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(currentYear, i, 1)
      return {
        month: i,
        name: date.toLocaleDateString(locale, { month: 'long' }),
        days: new Date(currentYear, i + 1, 0).getDate(),
      }
    })
  }, [currentYear, locale])

  // Get season for a specific date
  const getSeasonForDate = (month: number, day: number): Season | null => {
    const dateStr = `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    for (const season of seasons) {
      if (season.startDate && season.endDate) {
        if (dateStr >= season.startDate && dateStr <= season.endDate) {
          return season
        }
      }
    }
    return null
  }

  const getSeasonColor = (modifier: number): string => {
    if (modifier >= 1.2) return 'bg-red-200'
    if (modifier >= 1.1) return 'bg-orange-200'
    if (modifier > 1) return 'bg-yellow-200'
    if (modifier < 0.9) return 'bg-blue-200'
    if (modifier < 1) return 'bg-cyan-200'
    return 'bg-green-200'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Définissez vos périodes tarifaires saisonnières</p>
        </div>
        {!isCreating && (
          <AdminButton icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreating(true)}>
            {t('create')}
          </AdminButton>
        )}
      </div>

      {/* Create Form */}
      {isCreating && (
        <AdminCard padding="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">{t('create')}</h3>
              <AdminButton
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => {
                  setIsCreating(false)
                  resetForm()
                }}
              >
                <X className="w-4 h-4" />
              </AdminButton>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-2 mb-4">
              {SEASON_PRESETS.map((preset) => {
                const Icon = preset.icon
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${preset.color} hover:opacity-80 transition-opacity`}
                  >
                    <Icon className="w-4 h-4" />
                    {preset.name}
                  </button>
                )
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nom de la saison *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Haute saison été"
                  required
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Modificateur de prix *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.modifier}
                    onChange={(e) => setFormData({ ...formData, modifier: e.target.value })}
                    step="0.05"
                    min="0.1"
                    max="10"
                    required
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
                    {formData.modifier && formatModifier(parseFloat(formData.modifier))}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('startDate')} *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('endDate')} *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <AdminButton
                variant="secondary"
                type="button"
                onClick={() => {
                  setIsCreating(false)
                  resetForm()
                }}
              >
                Annuler
              </AdminButton>
              <AdminButton
                type="submit"
                disabled={createRule.isPending}
                icon={createRule.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              >
                Créer
              </AdminButton>
            </div>
          </form>
        </AdminCard>
      )}

      {/* Calendar View */}
      <AdminCard padding="lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-400" />
            Vue calendrier
          </h3>
          <div className="flex items-center gap-2">
            <AdminButton variant="ghost" size="sm" onClick={() => setCurrentYear(y => y - 1)}>
              <ChevronLeft className="w-5 h-5" />
            </AdminButton>
            <span className="font-medium text-lg px-4 text-slate-900 dark:text-white">{currentYear}</span>
            <AdminButton variant="ghost" size="sm" onClick={() => setCurrentYear(y => y + 1)}>
              <ChevronRight className="w-5 h-5" />
            </AdminButton>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {months.map((m) => (
              <div key={m.month} className="text-center">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 capitalize">{m.name}</p>
                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({ length: m.days }, (_, d) => {
                    const season = getSeasonForDate(m.month, d + 1)
                    return (
                      <div
                        key={d}
                        className={`w-full aspect-square text-xs flex items-center justify-center rounded-sm ${
                          season ? getSeasonColor(season.modifier) : 'bg-slate-100 dark:bg-slate-700'
                        }`}
                        title={season ? `${season.name}: ${formatModifier(season.modifier)}` : 'Prix normal'}
                      >
                        {d + 1}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        {seasons.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-4">
            {seasons.map((season) => (
              <div key={season.id} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <div className={`w-4 h-4 rounded ${getSeasonColor(season.modifier)}`} />
                <span>{season.name} ({formatModifier(season.modifier)})</span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <div className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-700" />
              <span>Prix normal</span>
            </div>
          </div>
        )}
      </AdminCard>

      {/* Seasons List */}
      {!isLoading && seasons.length > 0 && (
        <AdminCard padding="lg">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Saisons configurées</h3>
          <div className="space-y-3">
            {seasons.map((season) => (
              <div
                key={season.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-12 rounded ${getSeasonColor(season.modifier)}`} />
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">{season.name}</h4>
                    {season.startDate && season.endDate && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(season.startDate).toLocaleDateString(locale)} - {new Date(season.endDate).toLocaleDateString(locale)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-bold ${
                    season.modifier > 1 ? 'text-red-600 dark:text-red-400' : season.modifier < 1 ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {formatModifier(season.modifier)}
                  </span>
                  <AdminButton
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                    onClick={() => handleDelete(season.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </AdminButton>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      )}

      {/* Empty State */}
      {!isLoading && seasons.length === 0 && !isCreating && (
        <AdminCard padding="lg">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Aucune saison configurée</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Créez des périodes pour ajuster vos prix automatiquement</p>
            <AdminButton icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreating(true)}>
              {t('create')}
            </AdminButton>
          </div>
        </AdminCard>
      )}
    </div>
  )
}
