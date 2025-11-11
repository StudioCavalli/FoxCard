import Link from 'next/link'
import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-pink-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-100 mb-6">
          <WifiOff className="w-10 h-10 text-teal-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Vous êtes hors ligne
        </h1>

        <p className="text-gray-600 mb-8">
          Vous n'êtes pas connecté à Internet. Certaines fonctionnalités peuvent ne pas être disponibles.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
          >
            Réessayer
          </button>

          <Link
            href="/"
            className="block w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-6 rounded-xl border-2 border-gray-200 transition-colors duration-200"
          >
            Retour à l'accueil
          </Link>
        </div>

        <div className="mt-8 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">
            💡 <strong>Astuce :</strong> Les pages que vous avez déjà visitées sont disponibles hors ligne grâce à notre PWA.
          </p>
        </div>
      </div>
    </div>
  )
}
