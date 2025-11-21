'use client'

import { FileText } from 'lucide-react'

export default function MerchantReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
        <p className="text-gray-500 mt-1">Exportez et analysez vos données</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Rapports</h3>
        <p className="text-gray-500">Cette fonctionnalité sera bientôt disponible</p>
      </div>
    </div>
  )
}
