'use client'

import { useState } from 'react'
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
  Percent,
  TrendingUp,
  TrendingDown,
  Sun,
  Moon,
  CalendarDays,
  Tag
} from 'lucide-react'

const RATE_TYPES = [
  { value: 'WEEKEND', label: 'Week-end', icon: Sun, description: 'Sam-Dim' },
  { value: 'WEEKDAY', label: 'Semaine', icon: Moon, description: 'Lun-Ven' },
  { value: 'SEASONAL', label: 'Saisonnier', icon: CalendarDays, description: 'Période définie' },
  { value: 'EVENT', label: 'Événement', icon: Tag, description: 'Période spéciale' },
  { value: 'LAST_MINUTE', label: 'Dernière minute', icon: TrendingDown, description: 'Réduction' },
  { value: 'EARLY_BIRD', label: 'Réservation anticipée', icon: TrendingUp, description: 'Réduction' },
]

interface RateRule {
  id: string
  name: string
  type: string
  modifier: number
  startDate?: string
  endDate?: string
  daysOfWeek?: number[]
  minimumStay?: number
  priority: number
}

export default function RatesPage() {
  const t = useTranslations('merchant.hotel.rates')
  const { storeId } = useStoreContext()
  const params = useParams()
  const locale = params?.locale || 'fr'

  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'WEEKEND',
    modifier: '1.2',
    startDate: '',
    endDate: '',
    minimumStay: '',
    priority: '0',
  })

  // Get rate rules from hotel router
  const { data: rateRules, isLoading, refetch } = trpc.hotel.getRateRules.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  )

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
      type: 'WEEKEND',
      modifier: '1.2',
      startDate: '',
      endDate: '',
      minimumStay: '',
      priority: '0',
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeId || !formData.name) return

    createRule.mutate({
      storeId,
      name: formData.name,
      type: formData.type as any,
      modifier: parseFloat(formData.modifier),
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      minimumStay: formData.minimumStay ? parseInt(formData.minimumStay) : undefined,
      priority: parseInt(formData.priority) || 0,
    })
  }

  const handleDelete = (ruleId: string) => {
    if (!storeId || !confirm('Supprimer cette règle ?')) return
    deleteRule.mutate({ storeId, ruleId })
  }

  const formatModifier = (modifier: number) => {
    if (modifier > 1) {
      return `+${Math.round((modifier - 1) * 100)}%`
    } else if (modifier < 1) {
      return `-${Math.round((1 - modifier) * 100)}%`
    }
    return '0%'
  }

  const getRuleTypeInfo = (type: string) => {
    return RATE_TYPES.find(t => t.value === type) || RATE_TYPES[0]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Configurez vos règles tarifaires</p>
        </div>
        {!isCreating && (
          <AdminButton icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreating(true)}>
            {t('create')}
          </AdminButton>
        )}
      </div>

      {/* Info Card */}
      <AdminCard padding="md" className="bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <Percent className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">Comment fonctionnent les règles tarifaires</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Les règles modifient le prix de base des chambres selon des conditions (jour, période, etc.).
              Un modificateur de 1.2 = +20%, 0.8 = -20%. Les règles sont appliquées par priorité décroissante.
            </p>
          </div>
        </div>
      </AdminCard>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nom de la règle *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Tarif week-end haute saison"
                  required
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                >
                  {RATE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
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
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">1 = prix normal, 1.2 = +20%, 0.8 = -20%</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Priorité
                </label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Plus élevé = prioritaire</p>
              </div>

              {(formData.type === 'SEASONAL' || formData.type === 'EVENT') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Date de début
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Séjour minimum (nuits)
                </label>
                <input
                  type="number"
                  value={formData.minimumStay}
                  onChange={(e) => setFormData({ ...formData, minimumStay: e.target.value })}
                  placeholder="Aucun"
                  min="1"
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
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

      {/* Rules List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      ) : !rateRules || rateRules.length === 0 ? (
        <AdminCard padding="lg">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Percent className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Aucune règle tarifaire</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Créez des règles pour ajuster vos prix automatiquement</p>
            <AdminButton icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreating(true)}>
              {t('create')}
            </AdminButton>
          </div>
        </AdminCard>
      ) : (
        <div className="space-y-3">
          {(rateRules as RateRule[]).map((rule) => {
            const typeInfo = getRuleTypeInfo(rule.type)
            const Icon = typeInfo.icon
            const isIncrease = rule.modifier > 1

            return (
              <AdminCard key={rule.id} padding="md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${isIncrease ? 'bg-red-100 dark:bg-red-500/20' : 'bg-green-100 dark:bg-green-500/20'}`}>
                      <Icon className={`w-5 h-5 ${isIncrease ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-slate-900 dark:text-white">{rule.name}</h3>
                        <span className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                          {typeInfo.label}
                        </span>
                        {rule.priority > 0 && (
                          <span className="px-2 py-0.5 text-xs bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400 rounded-full">
                            Priorité {rule.priority}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {rule.startDate && rule.endDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(rule.startDate).toLocaleDateString(locale)} - {new Date(rule.endDate).toLocaleDateString(locale)}
                          </span>
                        )}
                        {rule.minimumStay && (
                          <span>Min. {rule.minimumStay} nuit{rule.minimumStay > 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-lg font-bold ${isIncrease ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {formatModifier(rule.modifier)}
                    </span>
                    <AdminButton
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                      onClick={() => handleDelete(rule.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </AdminButton>
                  </div>
                </div>
              </AdminCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
