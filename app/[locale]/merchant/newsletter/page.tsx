'use client'

import { Send } from 'lucide-react'

export default function MerchantNewsletterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Newsletter</h1>
        <p className="text-gray-500 mt-1">Gérez vos abonnés et envoyez des newsletters</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Send className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Newsletter</h3>
        <p className="text-gray-500">Cette fonctionnalité sera bientôt disponible</p>
      </div>
    </div>
  )
}
