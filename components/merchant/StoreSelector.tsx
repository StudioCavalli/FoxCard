'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStoreContext } from '@/lib/context/store-context'
import { Store, ChevronDown, Check, Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface StoreSelectorProps {
  onSelect?: () => void
}

export function StoreSelector({ onSelect }: StoreSelectorProps) {
  const { storeId, storeName, stores, isLoading, setStoreId } = useStoreContext()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const params = useParams()
  const router = useRouter()
  const locale = params?.locale || 'fr'
  const t = useTranslations('merchant')

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelectStore = (id: string) => {
    setStoreId(id)
    setIsOpen(false)
    onSelect?.()
    // Refresh the page to load new store data
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">{t('loading')}</span>
      </div>
    )
  }

  if (stores.length === 0) {
    return (
      <Link
        href={`/${locale}/merchant/store/new`}
        className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>{t('createStore')}</span>
      </Link>
    )
  }

  // If only one store, show simple display without dropdown
  if (stores.length === 1) {
    return (
      <div className="flex items-center gap-3 px-3 py-2">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Store className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{storeName}</p>
          <p className="text-xs text-slate-400">{t('singleStore')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-lg transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Store className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-white truncate">{storeName}</p>
          <p className="text-xs text-slate-400">{t('switchStore')}</p>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-slate-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
          <div className="py-1 max-h-64 overflow-y-auto">
            {stores.map((store) => (
              <button
                key={store.id}
                onClick={() => handleSelectStore(store.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                  store.id === storeId
                    ? 'bg-indigo-600/20 text-indigo-400'
                    : 'text-slate-300 hover:bg-slate-700'
                )}
              >
                <div className="w-7 h-7 bg-gradient-to-br from-indigo-500/80 to-purple-600/80 rounded-md flex items-center justify-center flex-shrink-0">
                  <Store className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="flex-1 text-sm truncate">{store.name}</span>
                {store.id === storeId && (
                  <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Create new store link */}
          <div className="border-t border-slate-700">
            <Link
              href={`/${locale}/merchant/store/new`}
              onClick={() => {
                setIsOpen(false)
                onSelect?.()
              }}
              className="flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <div className="w-7 h-7 bg-slate-600 rounded-md flex items-center justify-center">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm">{t('createNewStore')}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
