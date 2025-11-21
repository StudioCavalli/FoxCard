'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { trpc } from '@/lib/trpc/client'
import { CheckCircle, XCircle } from 'lucide-react'

export default function NewsletterUnsubscribePage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const storeId = searchParams.get('storeId') || '000000000000000000000001'

  const [isUnsubscribed, setIsUnsubscribed] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const unsubscribeMutation = trpc.newsletter.unsubscribe.useMutation()

  const handleUnsubscribe = async () => {
    if (!email) {
      setError('Email invalide')
      return
    }

    unsubscribeMutation.mutate(
      {
        storeId,
        email,
        reason: reason || undefined,
      },
      {
        onSuccess: () => {
          setIsUnsubscribed(true)
          setError('')
        },
        onError: (err) => {
          setError(err.message || 'Erreur lors du désabonnement')
        },
      }
    )
  }

  if (isUnsubscribed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Désabonnement confirmé
            </h1>
            <p className="text-gray-600 mb-6">
              Vous avez été désinscrit de notre newsletter. Nous sommes désolés de vous voir partir.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Vous pouvez vous réinscrire à tout moment en utilisant le formulaire d'inscription.
            </p>
            <Link href="/">
              <Button variant="primary" size="lg" className="w-full">
                Retour à l'accueil
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Se désinscrire de la newsletter
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            Nous sommes désolés de vous voir partir
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pourquoi vous désabonnez-vous ? (optionnel)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows={4}
              placeholder="Vos commentaires nous aident à nous améliorer..."
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleUnsubscribe}
            disabled={unsubscribeMutation.isPending}
          >
            {unsubscribeMutation.isPending ? 'Désabonnement...' : 'Me désinscrire'}
          </Button>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-primary-600 hover:underline">
              Finalement, je reste inscrit
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
