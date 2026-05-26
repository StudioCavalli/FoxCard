import { getTranslations } from 'next-intl/server'
import ExploreClient from './ExploreClient'

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
      <ExploreClient />
    </div>
  )
}
