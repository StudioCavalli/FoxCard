'use client'

import { Receipt } from 'lucide-react'

export default function MerchantTaxesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Taxes</h1>
        <p className="text-gray-500 mt-1">Configurez vos taux de TVA</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Configuration des taxes</h3>
        <p className="text-gray-500">Cette fonctionnalité sera bientôt disponible</p>
      </div>
    </div>
  )
}
