'use client'

import { useStoreContext } from '@/lib/context/store-context'
import { useRouter, useParams } from 'next/navigation'
import { Eye, LogOut, Store, Shield } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function ImpersonationBanner() {
  const { isImpersonating, impersonatedStore, endImpersonation, isSuperAdmin } = useStoreContext()
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale || 'fr'
  const t = useTranslations('superadmin')

  if (!isSuperAdmin || !isImpersonating || !impersonatedStore) {
    return null
  }

  const handleExitImpersonation = () => {
    endImpersonation()
    router.push(`/${locale}/superadmin/stores`)
  }

  return (
    <div className="sticky top-0 z-50 w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">SuperAdmin</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              <span className="text-sm">
                {t('viewingAs')}:
              </span>
              <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1">
                <Store className="w-4 h-4" />
                <span className="font-semibold">{impersonatedStore.name}</span>
                {impersonatedStore.slug && (
                  <span className="text-xs text-white/70">/{impersonatedStore.slug}</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleExitImpersonation}
            className="flex items-center gap-2 px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            {t('exitImpersonation')}
          </button>
        </div>
      </div>
    </div>
  )
}
