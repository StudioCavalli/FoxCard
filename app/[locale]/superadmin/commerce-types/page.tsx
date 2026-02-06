'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  ShoppingBag, Utensils, Wine, Shirt, Smartphone, Sparkles, Home as HomeIcon, Dumbbell,
  Gamepad2, Car, BookOpen, PawPrint, Download, CalendarCheck, Snowflake, ChefHat,
  Building2, Plane, Ticket, Check, X, Store, Filter, Package, Globe, Layers,
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import {
  commerceTypeConfigs,
  getAllCommerceTypes,
  getCommerceTypesByCategory,
  type CommerceType,
} from '@/lib/commerce-types'
import { AdminCard, AdminCardHeader } from '@/components/admin/ui/AdminCard'
import { AdminStatCard } from '@/components/admin/ui/AdminStatCard'
import { AdminTabs } from '@/components/admin/ui/AdminTabs'
import { AdminSearchInput } from '@/components/admin/ui/AdminSearchInput'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState'

const iconMap: Record<CommerceType, React.ElementType> = {
  GENERAL: ShoppingBag,
  FOOD: Utensils,
  ALCOHOL: Wine,
  FASHION: Shirt,
  ELECTRONICS: Smartphone,
  BEAUTY: Sparkles,
  HOME: HomeIcon,
  SPORTS: Dumbbell,
  TOYS: Gamepad2,
  AUTOMOTIVE: Car,
  BOOKS: BookOpen,
  PETS: PawPrint,
  DIGITAL: Download,
  SERVICES: CalendarCheck,
  SEASONAL: Snowflake,
  RESTAURANT: ChefHat,
  HOTEL: Building2,
  TRAVEL: Plane,
  RECREATION: Ticket,
}

export default function CommerceTypesPage() {
  const t = useTranslations('superadmin')
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'physical' | 'digital' | 'services'>('all')
  const [selectedType, setSelectedType] = useState<CommerceType | null>(null)

  const { data: storesData } = trpc.superadmin.getAllStores.useQuery({ limit: 100 })
  const stores = storesData?.stores

  const categories = getCommerceTypesByCategory()
  const allTypes = getAllCommerceTypes()

  // Filter types based on category
  const filteredTypes = allTypes.filter((type) => {
    if (selectedCategory === 'all') return true
    if (selectedCategory === 'physical') return categories.physical.includes(type)
    if (selectedCategory === 'digital') return categories.digital.includes(type)
    if (selectedCategory === 'services') return categories.services.includes(type)
    return true
  }).filter((type) => {
    if (!search) return true
    const config = commerceTypeConfigs[type]
    return (
      config.name.toLowerCase().includes(search.toLowerCase()) ||
      config.description.toLowerCase().includes(search.toLowerCase())
    )
  })

  // Count stores by type
  const storesByType: Partial<Record<CommerceType, number>> = stores?.reduce((acc, store) => {
    const type = store.commerceType as CommerceType
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Partial<Record<CommerceType, number>>) || {}

  const selectedConfig = selectedType ? commerceTypeConfigs[selectedType] : null

  const tabItems = [
    { value: 'all', label: t('commerceTypesPage.all'), count: allTypes.length },
    { value: 'physical', label: t('commerceTypesPage.physical'), count: categories.physical.length },
    { value: 'digital', label: t('commerceTypesPage.digital'), count: categories.digital.length },
    { value: 'services', label: t('commerceTypesPage.services'), count: categories.services.length },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('commerceTypesPage.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('commerceTypesPage.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title={t('commerceTypesPage.totalTypes')}
          value={allTypes.length}
          icon={Layers}
          variant="violet"
        />
        <AdminStatCard
          title={t('commerceTypesPage.physicalProducts')}
          value={categories.physical.length}
          icon={Package}
          variant="blue"
        />
        <AdminStatCard
          title={t('commerceTypesPage.digitalProducts')}
          value={categories.digital.length}
          icon={Download}
          variant="rose"
        />
        <AdminStatCard
          title={t('commerceTypesPage.servicesBookings')}
          value={categories.services.length}
          icon={Globe}
          variant="emerald"
        />
      </div>

      {/* Filters */}
      <AdminCard padding="md">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1 w-full md:w-auto">
            <AdminSearchInput
              placeholder={t('commerceTypesPage.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
            />
          </div>
          <AdminTabs
            items={tabItems}
            value={selectedCategory}
            onChange={(v) => setSelectedCategory(v as typeof selectedCategory)}
            variant="pills"
            size="sm"
          />
        </div>
      </AdminCard>

      {/* Empty State */}
      {filteredTypes.length === 0 && (
        <AdminEmptyState
          icon={Filter}
          title={t('commerceTypesPage.noTypesFound')}
          description={t('commerceTypesPage.modifySearch')}
        />
      )}

      {/* Content Grid */}
      {filteredTypes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Types List */}
          <div className="lg:col-span-2 space-y-3">
            {filteredTypes.map((type) => {
              const config = commerceTypeConfigs[type]
              const Icon = iconMap[type]
              const storeCount = storesByType[type] || 0
              const isSelected = selectedType === type

              return (
                <AdminCard
                  key={type}
                  hover
                  padding="none"
                  className={isSelected ? 'ring-2 ring-primary-500 dark:ring-primary-400' : ''}
                >
                  <button
                    onClick={() => setSelectedType(isSelected ? null : type)}
                    className="w-full p-5 text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900 dark:text-white">{config.name}</span>
                          <span className="text-xl">{config.emoji}</span>
                          {storeCount > 0 && (
                            <AdminBadge variant="purple" size="sm">
                              {storeCount} {storeCount > 1 ? t('commerceTypesPage.stores') : t('commerceTypesPage.store')}
                            </AdminBadge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{config.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {config.features.hasPhysicalProducts && (
                            <AdminBadge variant="info" size="sm">{t('commerceTypesPage.physicalLabel')}</AdminBadge>
                          )}
                          {config.features.hasDigitalProducts && (
                            <AdminBadge variant="purple" size="sm">{t('commerceTypesPage.digitalLabel')}</AdminBadge>
                          )}
                          {config.features.hasBookings && (
                            <AdminBadge variant="success" size="sm">{t('commerceTypesPage.booking')}</AdminBadge>
                          )}
                          {config.features.requiresAgeVerification && (
                            <AdminBadge variant="warning" size="sm">{t('commerceTypesPage.ageRestriction')}</AdminBadge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                </AdminCard>
              )
            })}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {selectedConfig ? (
              <AdminCard padding="none" className="sticky top-6 overflow-hidden">
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-br from-primary-500/10 to-primary-500/10 dark:from-primary-500/20 dark:to-primary-500/20 p-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-primary-500/5" />
                  <div className="absolute -right-2 -top-2 w-16 h-16 rounded-full bg-primary-500/5" />
                  <div className="relative flex items-center gap-4">
                    {(() => {
                      const Icon = iconMap[selectedType!]
                      return (
                        <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                          <Icon className="w-7 h-7" />
                        </div>
                      )
                    })()}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedConfig.name}</h3>
                      <p className="text-2xl">{selectedConfig.emoji}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Description */}
                  <p className="text-sm text-slate-600 dark:text-slate-300">{selectedConfig.description}</p>

                  {/* Features */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">{t('commerceTypesPage.features')}</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(selectedConfig.features).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 text-sm">
                          {value ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                              <X className="w-3 h-3 text-slate-400" />
                            </div>
                          )}
                          <span className={value ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Checkout Steps */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">{t('commerceTypesPage.checkoutSteps')}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedConfig.checkoutSteps.map((step, i) => (
                        <span
                          key={step}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-lg"
                        >
                          <span className="w-4 h-4 rounded-full bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center text-[10px] font-bold">
                            {i + 1}
                          </span>
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Default Categories */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">{t('commerceTypesPage.defaultCategories')}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedConfig.defaultCategories.map((cat) => (
                        <AdminBadge key={cat} variant="info" size="sm">{cat}</AdminBadge>
                      ))}
                    </div>
                  </div>

                  {/* Regulations */}
                  {selectedConfig.regulations && selectedConfig.regulations.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                      <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">{t('commerceTypesPage.regulations')}</h4>
                      <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                        {selectedConfig.regulations.map((reg, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            {reg}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Stores using this type */}
                  {(storesByType[selectedType!] ?? 0) > 0 && (
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                        {(storesByType[selectedType!] ?? 0) > 1
                          ? t('commerceTypesPage.storesUsingTypePlural', { count: storesByType[selectedType!] ?? 0 })
                          : t('commerceTypesPage.storesUsingType', { count: storesByType[selectedType!] ?? 0 })
                        }
                      </h4>
                      <div className="space-y-2">
                        {stores
                          ?.filter((s) => s.commerceType === selectedType)
                          .slice(0, 5)
                          .map((store) => (
                            <div key={store.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/10 to-primary-500/10 dark:from-primary-500/20 dark:to-primary-500/20 flex items-center justify-center">
                                <Store className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                              </div>
                              <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{store.name}</span>
                            </div>
                          ))}
                        {(storesByType[selectedType!] ?? 0) > 5 && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-1">
                            +{(storesByType[selectedType!] ?? 0) - 5} {t('rolesPage.others')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </AdminCard>
            ) : (
              <AdminEmptyState
                icon={Filter}
                title={t('commerceTypesPage.selectType')}
                description={t('commerceTypesPage.selectTypeDesc')}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
