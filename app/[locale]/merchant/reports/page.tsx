'use client'

import { useTranslations } from 'next-intl'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { FileText, Download, BarChart3, Calendar, TrendingUp } from 'lucide-react'

export default function MerchantReportsPage() {
  const t = useTranslations('merchant.reports')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('description')}</p>
      </div>

      {/* Coming Soon State */}
      <AdminCard padding="lg">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-primary-100 dark:bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            {t('comingSoon')}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {t('comingSoonDescription')}
          </p>
        </div>
      </AdminCard>

      {/* Preview of upcoming features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BarChart3, label: t('features.salesReport'), color: 'emerald' },
          { icon: TrendingUp, label: t('features.analytics'), color: 'blue' },
          { icon: Calendar, label: t('features.periodic'), color: 'amber' },
          { icon: Download, label: t('features.export'), color: 'violet' },
        ].map((feature, idx) => (
          <AdminCard key={idx} padding="md" className="opacity-60">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-${feature.color}-100 dark:bg-${feature.color}-500/20 rounded-lg flex items-center justify-center`}>
                <feature.icon className={`w-5 h-5 text-${feature.color}-600 dark:text-${feature.color}-400`} />
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-300">{feature.label}</span>
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  )
}
