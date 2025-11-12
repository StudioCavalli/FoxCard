'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'
import Link from 'next/link'

function AcceptInvitationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [message, setMessage] = useState('')
  const [store, setStore] = useState<any>(null)

  const acceptInvitationMutation = trpc.role.acceptInvitation.useMutation()

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token d\'invitation invalide')
      return
    }

    // Auto-accept invitation
    acceptInvitationMutation.mutate(
      { token },
      {
        onSuccess: (data) => {
          setStatus('success')
          setStore(data.store)
          setMessage(`Vous avez rejoint ${data.store.name} en tant que ${data.role.name}`)
        },
        onError: (error) => {
          setStatus('error')
          setMessage(error.message)
        },
      }
    )
  }, [token])

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="p-8 text-center">
            <Loader2 className="w-16 h-16 text-primary-600 mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Traitement de l'invitation...
            </h1>
            <p className="text-gray-600">Veuillez patienter</p>
          </Card>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Erreur
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
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
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invitation acceptée
          </h1>
          <p className="text-gray-600 mb-6">{message}</p>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 font-medium mb-2">
              Prochaines étapes
            </p>
            <ul className="text-sm text-blue-700 space-y-1 text-left">
              <li>• Accédez au tableau de bord du magasin</li>
              <li>• Familiarisez-vous avec vos permissions</li>
              <li>• Commencez à collaborer avec l'équipe</li>
            </ul>
          </div>

          <Link href="/admin">
            <Button variant="primary" size="lg" className="w-full">
              Accéder au tableau de bord
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Card className="p-8 text-center">
              <Loader2 className="w-16 h-16 text-primary-600 mx-auto mb-6 animate-spin" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Chargement...
              </h1>
            </Card>
          </div>
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  )
}
