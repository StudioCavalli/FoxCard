'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  FilterConfig,
  CommerceFilterConfig,
  getFiltersForCommerceType,
  getActiveFilterCount,
} from '@/lib/search/commerce-filters'
import { CommerceType } from '@/lib/commerce-types'
import {
  ChevronDown,
  ChevronUp,
  X,
  SlidersHorizontal,
  Check,
  Calendar,
  Star,
} from 'lucide-react'

interface CommerceSearchFiltersProps {
  commerceType: CommerceType
  onFilterChange?: (filters: Record<string, unknown>) => void
  initialFilters?: Record<string, unknown>
  dynamicOptions?: Record<string, { value: string; label: string; count?: number }[]>
  className?: string
  showMobileToggle?: boolean
}

export function CommerceSearchFilters({
  commerceType,
  onFilterChange,
  initialFilters = {},
  dynamicOptions = {},
  className = '',
  showMobileToggle = true,
}: CommerceSearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState<Record<string, unknown>>(initialFilters)
  const [expandedFilters, setExpandedFilters] = useState<Set<string>>(new Set())
  const [mobileOpen, setMobileOpen] = useState(false)

  const config = useMemo(() => getFiltersForCommerceType(commerceType), [commerceType])
  const activeCount = useMemo(() => getActiveFilterCount(filters, commerceType), [filters, commerceType])

  // Initialize expanded state based on defaultExpanded
  useState(() => {
    const defaultExpanded = new Set<string>()
    config.filters.forEach((f) => {
      if (f.defaultExpanded) {
        defaultExpanded.add(f.key)
      }
    })
    setExpandedFilters(defaultExpanded)
  })

  const handleFilterChange = useCallback((key: string, value: unknown) => {
    const newFilters = { ...filters, [key]: value }

    // Remove empty values
    if (value === null || value === undefined || value === '' ||
        (Array.isArray(value) && value.length === 0)) {
      delete newFilters[key]
    }

    setFilters(newFilters)
    onFilterChange?.(newFilters)

    // Update URL params
    const params = new URLSearchParams(searchParams.toString())
    if (newFilters[key] !== undefined) {
      if (typeof newFilters[key] === 'object') {
        params.set(key, JSON.stringify(newFilters[key]))
      } else {
        params.set(key, String(newFilters[key]))
      }
    } else {
      params.delete(key)
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }, [filters, onFilterChange, router, searchParams])

  const toggleExpanded = useCallback((key: string) => {
    setExpandedFilters((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  const clearAllFilters = useCallback(() => {
    setFilters({})
    onFilterChange?.({})
    router.push(window.location.pathname, { scroll: false })
  }, [onFilterChange, router])

  const clearFilter = useCallback((key: string) => {
    handleFilterChange(key, undefined)
  }, [handleFilterChange])

  // Get options for a filter, using dynamic options if provided
  const getFilterOptions = useCallback((filter: FilterConfig) => {
    if (dynamicOptions[filter.key]?.length) {
      return dynamicOptions[filter.key]
    }
    return filter.options || []
  }, [dynamicOptions])

  const renderFilter = (filter: FilterConfig) => {
    const isExpanded = expandedFilters.has(filter.key)
    const value = filters[filter.key]
    const options = getFilterOptions(filter)

    return (
      <div key={filter.key} className="border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => toggleExpanded(filter.key)}
          className="flex items-center justify-between w-full py-3 px-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {filter.label}
            {value !== undefined && (
              <span className="ml-2 text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">
                {Array.isArray(value) ? value.length : '1'}
              </span>
            )}
          </span>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {isExpanded && (
          <div className="px-4 pb-4">
            {filter.type === 'multiselect' || filter.type === 'checkbox' ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {options.map((option) => {
                  const isChecked = Array.isArray(value) && value.includes(option.value)
                  return (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          const currentValues = Array.isArray(value) ? value : []
                          const newValues = isChecked
                            ? currentValues.filter((v) => v !== option.value)
                            : [...currentValues, option.value]
                          handleFilterChange(filter.key, newValues)
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {option.label}
                      </span>
                      {option.count !== undefined && (
                        <span className="text-xs text-gray-400">({option.count})</span>
                      )}
                    </label>
                  )
                })}
              </div>
            ) : filter.type === 'range' ? (
              <RangeFilter
                filter={filter}
                value={value as { min?: number; max?: number } | undefined}
                onChange={(newValue) => handleFilterChange(filter.key, newValue)}
              />
            ) : filter.type === 'toggle' ? (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value === true}
                  onChange={() => handleFilterChange(filter.key, value === true ? undefined : true)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Oui
                </span>
              </label>
            ) : filter.type === 'select' ? (
              <select
                value={value as string || ''}
                onChange={(e) => handleFilterChange(filter.key, e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Tous</option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : filter.type === 'date-range' ? (
              <DateRangeFilter
                value={value as { start?: string; end?: string } | undefined}
                onChange={(newValue) => handleFilterChange(filter.key, newValue)}
              />
            ) : filter.type === 'rating' ? (
              <RatingFilter
                filter={filter}
                value={value as number | undefined}
                onChange={(newValue) => handleFilterChange(filter.key, newValue)}
              />
            ) : null}
          </div>
        )}
      </div>
    )
  }

  const filterContent = (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} />
          <span className="font-semibold">Filtres</span>
          {activeCount > 0 && (
            <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Tout effacer
          </button>
        )}
      </div>

      {/* Active filters */}
      {activeCount > 0 && (
        <div className="px-4 py-2 flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
          {config.filters.map((filter) => {
            const value = filters[filter.key]
            if (value === undefined) return null

            if (Array.isArray(value)) {
              return value.map((v) => {
                const option = getFilterOptions(filter).find((o) => o.value === v)
                return (
                  <span
                    key={`${filter.key}-${v}`}
                    className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full"
                  >
                    {option?.label || v}
                    <button
                      onClick={() => {
                        const newValues = value.filter((val) => val !== v)
                        handleFilterChange(filter.key, newValues.length > 0 ? newValues : undefined)
                      }}
                      className="hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )
              })
            }

            if (typeof value === 'boolean') {
              return (
                <span
                  key={filter.key}
                  className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full"
                >
                  {filter.label}
                  <button onClick={() => clearFilter(filter.key)} className="hover:text-red-500">
                    <X size={12} />
                  </button>
                </span>
              )
            }

            if (typeof value === 'object' && value !== null) {
              const range = value as { min?: number; max?: number; start?: string; end?: string }
              let label = filter.label + ': '
              if (range.min !== undefined || range.max !== undefined) {
                label += `${range.min || '0'} - ${range.max || '∞'}`
                if (filter.unit) label += ` ${filter.unit}`
              } else if (range.start || range.end) {
                label += `${range.start || '...'} - ${range.end || '...'}`
              }
              return (
                <span
                  key={filter.key}
                  className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full"
                >
                  {label}
                  <button onClick={() => clearFilter(filter.key)} className="hover:text-red-500">
                    <X size={12} />
                  </button>
                </span>
              )
            }

            return null
          })}
        </div>
      )}

      {/* Filters list */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {config.filters.map(renderFilter)}
      </div>
    </div>
  )

  if (showMobileToggle) {
    return (
      <>
        {/* Mobile toggle button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden fixed bottom-4 left-4 z-40 flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-full shadow-lg"
        >
          <SlidersHorizontal size={18} />
          Filtres
          {activeCount > 0 && (
            <span className="bg-white text-primary-600 text-xs px-2 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </button>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <span className="font-semibold">Filtres</span>
                <button onClick={() => setMobileOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              {filterContent}
              <div className="sticky bottom-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Voir les résultats
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop filters */}
        <div className="hidden md:block">{filterContent}</div>
      </>
    )
  }

  return filterContent
}

// Range filter component
interface RangeFilterProps {
  filter: FilterConfig
  value?: { min?: number; max?: number }
  onChange: (value: { min?: number; max?: number } | undefined) => void
}

function RangeFilter({ filter, value, onChange }: RangeFilterProps) {
  const [localMin, setLocalMin] = useState<string>(value?.min?.toString() || '')
  const [localMax, setLocalMax] = useState<string>(value?.max?.toString() || '')

  const handleBlur = () => {
    const min = localMin ? parseFloat(localMin) : undefined
    const max = localMax ? parseFloat(localMax) : undefined

    if (min === undefined && max === undefined) {
      onChange(undefined)
    } else {
      onChange({ min, max })
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder={`Min${filter.unit ? ` (${filter.unit})` : ''}`}
          value={localMin}
          onChange={(e) => setLocalMin(e.target.value)}
          onBlur={handleBlur}
          min={filter.min}
          max={filter.max}
          step={filter.step}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500"
        />
        <span className="text-gray-400">-</span>
        <input
          type="number"
          placeholder={`Max${filter.unit ? ` (${filter.unit})` : ''}`}
          value={localMax}
          onChange={(e) => setLocalMax(e.target.value)}
          onBlur={handleBlur}
          min={filter.min}
          max={filter.max}
          step={filter.step}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500"
        />
      </div>
      {filter.min !== undefined && filter.max !== undefined && (
        <input
          type="range"
          min={filter.min}
          max={filter.max}
          step={filter.step}
          value={value?.max || filter.max}
          onChange={(e) => {
            const max = parseFloat(e.target.value)
            setLocalMax(max.toString())
            onChange({ min: value?.min, max })
          }}
          className="w-full"
        />
      )}
    </div>
  )
}

// Date range filter component
interface DateRangeFilterProps {
  value?: { start?: string; end?: string }
  onChange: (value: { start?: string; end?: string } | undefined) => void
}

function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Calendar size={16} className="text-gray-400" />
        <input
          type="date"
          value={value?.start || ''}
          onChange={(e) => onChange({ ...value, start: e.target.value || undefined })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div className="flex items-center gap-2">
        <Calendar size={16} className="text-gray-400" />
        <input
          type="date"
          value={value?.end || ''}
          onChange={(e) => onChange({ ...value, end: e.target.value || undefined })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500"
        />
      </div>
    </div>
  )
}

// Rating filter component
interface RatingFilterProps {
  filter: FilterConfig
  value?: number
  onChange: (value: number | undefined) => void
}

function RatingFilter({ filter, value, onChange }: RatingFilterProps) {
  const min = filter.min || 1
  const max = filter.max || 5

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max - min + 1 }, (_, i) => {
        const rating = min + i
        const isSelected = value !== undefined && rating <= value
        return (
          <button
            key={rating}
            onClick={() => onChange(value === rating ? undefined : rating)}
            className={`p-1 ${isSelected ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            <Star size={20} fill={isSelected ? 'currentColor' : 'none'} />
          </button>
        )
      })}
      {value && (
        <span className="ml-2 text-sm text-gray-500">
          {value}+ étoiles
        </span>
      )}
    </div>
  )
}

// Sort dropdown component
interface SortDropdownProps {
  commerceType: CommerceType
  value?: string
  onChange: (value: string) => void
}

export function SortDropdown({ commerceType, value, onChange }: SortDropdownProps) {
  const config = getFiltersForCommerceType(commerceType)

  return (
    <select
      value={value || config.defaultSort}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500"
    >
      {config.sortOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export default CommerceSearchFilters
