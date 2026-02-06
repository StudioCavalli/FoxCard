import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { StoresMap } from '@/components/superadmin/StoresMap'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'superadmin.storesMap' })

  return {
    title: `${t('title')} - FoxCard Super Admin`,
    description: t('description'),
  }
}

export default async function StoresMapPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect('/unauthorized')
  }

  return (
    <div className="space-y-6">
      <StoresMap />
    </div>
  )
}
