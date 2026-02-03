'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Store, ChevronDown, X } from 'lucide-react'
import { usePublicStore } from '@/lib/context/public-store-context'
import Link from 'next/link'

export function PublicStoreSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const { selectedStore, setSelectedStore, stores, isLoading } = usePublicStore()
  const params = useParams()
  const locale = (params?.locale as string) || 'fr'

  const currentStore = stores.find(s => s.id === selectedStore)

  const handleStoreSelect = (storeId: string | 'all') => {
    setSelectedStore(storeId)
    setIsOpen(false)
  }

  // If no stores, don't show selector
  if (stores.length === 0) return null

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-theme-surface/50 hover:bg-theme-surface border border-theme-border rounded-full text-sm text-theme-text-secondary hover:text-theme-text transition-all duration-200 group"
      >
        <Store className="w-4 h-4 text-theme-text-muted group-hover:text-theme-primary transition-colors" />
        <span className="hidden lg:inline max-w-[120px] truncate">
          {currentStore ? currentStore.name : 'Toutes les boutiques'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full right-0 mt-2 w-72 bg-theme-surface border border-theme-border rounded-xl shadow-xl z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-theme-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-theme-text">Sélectionner une boutique</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-theme-background rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-theme-text-muted" />
                </button>
              </div>
              <p className="text-xs text-theme-text-muted">
                Filtrez les produits par boutique
              </p>
            </div>

            {/* Store List */}
            <div className="max-h-[400px] overflow-y-auto">
              {/* All Stores Option */}
              <button
                onClick={() => handleStoreSelect('all')}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-theme-background transition-colors ${
                  selectedStore === 'all' ? 'bg-theme-primary/10' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-theme-primary to-theme-accent flex items-center justify-center flex-shrink-0">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-theme-text">Toutes les boutiques</div>
                  <div className="text-xs text-theme-text-muted">
                    {stores.length} boutique{stores.length > 1 ? 's' : ''}
                  </div>
                </div>
                {selectedStore === 'all' && (
                  <div className="w-2 h-2 rounded-full bg-theme-primary" />
                )}
              </button>

              {/* Individual Stores */}
              {stores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => handleStoreSelect(store.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-theme-background transition-colors ${
                    selectedStore === store.id ? 'bg-theme-primary/10' : ''
                  }`}
                >
                  {store.logo ? (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {store.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium text-theme-text truncate">{store.name}</div>
                    <div className="text-xs text-theme-text-muted">
                      Voir les produits →
                    </div>
                  </div>
                  {selectedStore === store.id && (
                    <div className="w-2 h-2 rounded-full bg-theme-primary flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-theme-border bg-theme-background/50">
              <Link
                href={`/${locale}/stores`}
                onClick={() => setIsOpen(false)}
                className="block w-full text-center px-4 py-2 text-sm font-medium text-theme-primary hover:bg-theme-primary/10 rounded-lg transition-colors"
              >
                Voir toutes les boutiques →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
