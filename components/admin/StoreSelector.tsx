'use client'

import { useStoreContext } from '@/lib/context/store-context'
import { Store, ChevronDown, Shield } from 'lucide-react'

export default function StoreSelector() {
  const { storeId, storeName, stores, setStoreId, isSuperAdmin } = useStoreContext()

  // Don't show selector if only one store or no stores (unless super admin)
  if (stores.length <= 1 && !isSuperAdmin) {
    return storeName ? (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
        <Store className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">{storeName}</span>
      </div>
    ) : null
  }

  return (
    <div className="relative">
      <div className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
        isSuperAdmin
          ? 'bg-purple-50 border-purple-300 hover:border-purple-400'
          : 'bg-white border-gray-300 hover:border-gray-400'
      }`}>
        {isSuperAdmin ? (
          <Shield className="w-4 h-4 text-purple-600 flex-shrink-0" />
        ) : (
          <Store className="w-4 h-4 text-gray-500 flex-shrink-0" />
        )}
        <select
          value={storeId || ''}
          onChange={(e) => setStoreId(e.target.value)}
          className={`appearance-none bg-transparent text-sm font-medium focus:outline-none cursor-pointer pr-6 min-w-[140px] ${
            isSuperAdmin ? 'text-purple-800' : 'text-gray-700'
          }`}
          title={isSuperAdmin ? "Mode Super Admin - Toutes les boutiques" : "Sélectionner une boutique"}
        >
          {isSuperAdmin && <option value="">Sélectionner une boutique...</option>}
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
        <ChevronDown className={`w-4 h-4 absolute right-2 pointer-events-none ${
          isSuperAdmin ? 'text-purple-400' : 'text-gray-400'
        }`} />
      </div>
      {isSuperAdmin && (
        <div className="absolute top-full mt-1 left-0 right-0 text-center">
          <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
            SUPER ADMIN
          </span>
        </div>
      )}
    </div>
  )
}
