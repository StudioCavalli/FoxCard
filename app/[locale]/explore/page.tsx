import { getTranslations } from 'next-intl/server'
import dynamic from 'next/dynamic'

const ExploreStores = dynamic(() => import('@/components/explore/ExploreStores').then(mod => ({ default: mod.ExploreStores })), { ssr: false, loading: () => <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full" /></div> })

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'explore' })

  return {
    title: `${t('title')} - FoxCard`,
    description: t('description'),
  }
}

export default async function ExplorePage() {
  return (
    <div className="container mx-auto px-4">
      <ExploreStores />
    </div>
  )
}
