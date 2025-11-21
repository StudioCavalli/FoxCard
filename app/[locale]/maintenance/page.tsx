'use client'

import { useSearchParams } from 'next/navigation'
import { Wrench, Clock, Mail } from 'lucide-react'

export default function MaintenancePage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wrench className="w-10 h-10 text-yellow-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Site en maintenance
          </h1>

          <p className="text-gray-600 mb-6">
            {message || 'Nous effectuons actuellement une maintenance programmee. Le site sera de nouveau accessible dans quelques instants.'}
          </p>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Retour imminent</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>support@foxcard.io</span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Merci de votre patience et de votre comprehension.
        </p>
      </div>
    </div>
  )
}
