'use client'

import Link from 'next/link'
import { ShieldX, Home, ArrowLeft } from 'lucide-react'
import { useParams } from 'next/navigation'

export default function UnauthorizedPage() {
  const params = useParams()
  const locale = params.locale || 'fr'

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldX className="w-10 h-10 text-red-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Acces non autorise
          </h1>

          <p className="text-gray-600 mb-8">
            Vous n'avez pas les permissions necessaires pour acceder a cette page.
            Cette section est reservee aux administrateurs de la plateforme.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              Retour a l'accueil
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Page precedente
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
