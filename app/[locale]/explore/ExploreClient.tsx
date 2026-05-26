'use client'

import dynamic from 'next/dynamic'

const ExploreStores = dynamic(
  () => import('@/components/explore/ExploreStores').then(mod => ({ default: mod.ExploreStores })),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    ),
  }
)

export default function ExploreClient() {
  return <ExploreStores />
}
