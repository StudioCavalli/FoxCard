'use client'

import { ReactNode, useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Column<T> {
  key: string
  header: string
  render?: (item: T, index: number) => ReactNode
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  className?: string
}

interface MerchantTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string
  loading?: boolean
  emptyMessage?: string
  searchable?: boolean
  searchKeys?: string[]
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
  }
  onRowClick?: (item: T) => void
  selectedRows?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  stickyHeader?: boolean
  className?: string
}

export function MerchantTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyExtractor,
  loading = false,
  emptyMessage,
  searchable = false,
  searchKeys = [],
  pagination,
  onRowClick,
  selectedRows,
  onSelectionChange,
  stickyHeader = false,
  className,
}: MerchantTableProps<T>) {
  const t = useTranslations()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  const filteredData = useMemo(() => {
    if (!searchQuery || !searchKeys.length) return data

    const query = searchQuery.toLowerCase()
    return data.filter((item) =>
      searchKeys.some((key) => {
        const value = item[key]
        if (typeof value === 'string') return value.toLowerCase().includes(query)
        if (typeof value === 'number') return value.toString().includes(query)
        return false
      })
    )
  }, [data, searchQuery, searchKeys])

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]

      if (aVal === bVal) return 0
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      const comparison = aVal < bVal ? -1 : 1
      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
  }, [filteredData, sortConfig])

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === 'asc'
          ? { key, direction: 'desc' }
          : null
      }
      return { key, direction: 'asc' }
    })
  }

  const toggleRowSelection = (id: string) => {
    if (!onSelectionChange || !selectedRows) return

    const newSelection = selectedRows.includes(id)
      ? selectedRows.filter((rowId) => rowId !== id)
      : [...selectedRows, id]

    onSelectionChange(newSelection)
  }

  const toggleAllSelection = () => {
    if (!onSelectionChange) return

    if (selectedRows?.length === sortedData.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(sortedData.map(keyExtractor))
    }
  }

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return (
    <div className={cn('', className)}>
      {searchable && (
        <div className="mb-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('common.search')}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full">
          <thead className={cn(
            'bg-slate-800/80',
            stickyHeader && 'sticky top-0 z-10'
          )}>
            <tr>
              {onSelectionChange && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows?.length === sortedData.length && sortedData.length > 0}
                    onChange={toggleAllSelection}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider',
                    alignClasses[column.align || 'left'],
                    column.sortable && 'cursor-pointer hover:text-white transition-colors',
                    column.className
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    <span>{column.header}</span>
                    {column.sortable && sortConfig?.key === column.key && (
                      sortConfig.direction === 'asc' ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="bg-slate-900/30">
                  {onSelectionChange && (
                    <td className="px-4 py-3">
                      <div className="w-4 h-4 bg-slate-700 rounded animate-pulse" />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3">
                      <div className="h-4 bg-slate-700 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onSelectionChange ? 1 : 0)}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  {emptyMessage || t('common.noData')}
                </td>
              </tr>
            ) : (
              sortedData.map((item, index) => {
                const id = keyExtractor(item)
                const isSelected = selectedRows?.includes(id)

                return (
                  <tr
                    key={id}
                    className={cn(
                      'bg-slate-900/30 transition-colors',
                      onRowClick && 'cursor-pointer hover:bg-slate-800/50',
                      isSelected && 'bg-indigo-900/20'
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {onSelectionChange && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRowSelection(id)}
                          className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          'px-4 py-3 text-sm text-slate-300',
                          alignClasses[column.align || 'left'],
                          column.className
                        )}
                      >
                        {column.render
                          ? column.render(item, index)
                          : String(item[column.key] ?? '-')}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {t('common.showing')} {((pagination.page - 1) * pagination.pageSize) + 1}-
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} {t('common.of')} {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-400 px-3">
              {pagination.page} / {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface TableBadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

export function TableBadge({ children, variant = 'default', className }: TableBadgeProps) {
  const variantClasses = {
    default: 'bg-slate-700 text-slate-300',
    success: 'bg-emerald-900/50 text-emerald-400',
    warning: 'bg-amber-900/50 text-amber-400',
    danger: 'bg-red-900/50 text-red-400',
    info: 'bg-blue-900/50 text-blue-400',
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  )
}
