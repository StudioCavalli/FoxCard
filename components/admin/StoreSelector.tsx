'use client'

import { useStoreContext } from '@/lib/context/store-context'

export default function StoreSelector() {
  const { storeId, storeName, stores, setStoreId } = useStoreContext()

  // Don't show selector if only one store or no stores
  if (stores.length <= 1) {
    return storeName ? (
      <div className="px-3 py-2 text-sm font-medium text-gray-700">
        {storeName}
      </div>
    ) : null
  }

  return (
    <div className="relative">
      <select
        value={storeId || ''}
        onChange={(e) => setStoreId(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
      >
        {stores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  )
}
