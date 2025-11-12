'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { trpc } from '@/lib/trpc/client'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function NewsletterConfirmPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  const confirmMutation = trpc.newsletter.confirm.useMutation()

  useEffect(() => {
    const token = searchParams.get('token')
    const email = searchParams.get('email')
    const storeId = searchParams.get('storeId') || '000000000000000000000001'

    if (!token || !email) {
      setStatus('error')
      setMessage('Lien de confirmation invalide')
      return
    }

    // Confirm subscription
    confirmMutation.mutate(
      {
        storeId,
        email,
        token,
      },
      {
        onSuccess: (data) => {
          setStatus('success')
          setMessage(data.message)
        },
        onError: (error) => {
          setStatus('error')
          setMessage(error.message || 'Erreur lors de la confirmation')
        },
      }
    )
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Confirmation en cours...
              </h1>
              <p className="text-gray-600">
                Veuillez patienter pendant que nous confirmons votre inscription.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Inscription confirmée !
              </h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <Link href="/">
                <Button variant="primary" size="lg" className="w-full">
                  Retour à l'accueil
                </Button>
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Erreur de confirmation
              </h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <Link href="/">
                <Button variant="outline" size="lg" className="w-full">
                  Retour à l'accueil
                </Button>
              </Link>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
