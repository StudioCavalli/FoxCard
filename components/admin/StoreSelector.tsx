'use client'

import { useStoreContext } from '@/lib/context/store-context'
import { Store, ChevronDown } from 'lucide-react'

export default function StoreSelector() {
  const { storeId, storeName, stores, setStoreId } = useStoreContext()

  // Don't show selector if only one store or no stores
  if (stores.length <= 1) {
    return storeName ? (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
        <Store className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">{storeName}</span>
      </div>
    ) : null
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
        <Store className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <select
          value={storeId || ''}
          onChange={(e) => setStoreId(e.target.value)}
          className="appearance-none bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer pr-6 min-w-[120px]"
          title="Sélectionner une boutique"
        >
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 pointer-events-none" />
      </div>
    </div>
  )
}
