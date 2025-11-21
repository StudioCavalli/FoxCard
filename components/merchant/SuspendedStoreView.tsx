'use client'

import { useState } from 'react'
import { AlertTriangle, Send, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/Button'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface SuspendedStoreViewProps {
  storeId: string
  storeName: string
  suspendedAt: Date | null
  suspendedReason: string | null
  hasPendingAppeal: boolean
  lastAppeal: {
    status: string
    message: string
    adminResponse: string | null
    createdAt: Date
    reviewedAt: Date | null
  } | null
  onAppealSubmitted: () => void
}

export function SuspendedStoreView({
  storeId,
  storeName,
  suspendedAt,
  suspendedReason,
  hasPendingAppeal,
  lastAppeal,
  onAppealSubmitted,
}: SuspendedStoreViewProps) {
  const [appealMessage, setAppealMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const submitAppeal = trpc.store.submitAppeal.useMutation({
    onSuccess: () => {
      setSuccess(true)
      setAppealMessage('')
      onAppealSubmitted()
    },
    onError: (err) => {
      setError(err.message)
    },
    onSettled: () => {
      setIsSubmitting(false)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    submitAppeal.mutate({ storeId, message: appealMessage })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'REVIEWING':
        return <MessageSquare className="w-5 h-5 text-blue-500" />
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'En attente de traitement'
      case 'REVIEWING':
        return 'En cours d\'examen'
      case 'APPROVED':
        return 'Approuve'
      case 'REJECTED':
        return 'Rejete'
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-red-500 text-white p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Boutique suspendue</h1>
              <p className="text-red-100">{storeName}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Suspension info */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="font-semibold text-red-800 mb-2">Raison de la suspension</h2>
            <p className="text-red-700">
              {suspendedReason || 'Aucune raison specifiee'}
            </p>
            {suspendedAt && (
              <p className="text-sm text-red-600 mt-2">
                Suspendue le {format(new Date(suspendedAt), "d MMMM yyyy 'a' HH:mm", { locale: fr })}
              </p>
            )}
          </div>

          {/* Last appeal status */}
          {lastAppeal && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                {getStatusIcon(lastAppeal.status)}
                <h3 className="font-semibold">Dernier appel: {getStatusLabel(lastAppeal.status)}</h3>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Votre message:</p>
                  <p className="text-gray-700 bg-gray-50 p-2 rounded mt-1">
                    {lastAppeal.message}
                  </p>
                </div>

                {lastAppeal.adminResponse && (
                  <div>
                    <p className="text-gray-500">Reponse de l'administrateur:</p>
                    <p className="text-gray-700 bg-blue-50 p-2 rounded mt-1">
                      {lastAppeal.adminResponse}
                    </p>
                  </div>
                )}

                <p className="text-gray-500">
                  Soumis le {format(new Date(lastAppeal.createdAt), "d MMMM yyyy 'a' HH:mm", { locale: fr })}
                  {lastAppeal.reviewedAt && (
                    <> - Examine le {format(new Date(lastAppeal.reviewedAt), "d MMMM yyyy", { locale: fr })}</>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Appeal form */}
          {hasPendingAppeal ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <Clock className="w-5 h-5" />
                <p className="font-medium">Un appel est deja en cours de traitement</p>
              </div>
              <p className="text-sm text-yellow-700 mt-2">
                Vous ne pouvez pas soumettre un nouvel appel tant que le precedent n'a pas ete traite.
                Un administrateur examinera votre demande dans les plus brefs delais.
              </p>
            </div>
          ) : success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <p className="font-medium">Appel soumis avec succes</p>
              </div>
              <p className="text-sm text-green-700 mt-2">
                Votre appel a ete envoye. Un administrateur l'examinera et vous recevrez une reponse prochainement.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="appeal" className="block text-sm font-medium text-gray-700 mb-2">
                  Faire appel de cette decision
                </label>
                <textarea
                  id="appeal"
                  value={appealMessage}
                  onChange={(e) => setAppealMessage(e.target.value)}
                  placeholder="Expliquez pourquoi vous pensez que cette suspension devrait etre levee. Soyez precis et fournissez tous les details pertinents (minimum 50 caracteres)..."
                  className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  required
                  minLength={50}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {appealMessage.length}/50 caracteres minimum
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || appealMessage.length < 50}
                className="w-full flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Soumettre mon appel
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Contact info */}
          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            <p>Besoin d'aide ? Contactez notre support a</p>
            <a href="mailto:support@foxcard.com" className="text-orange-500 hover:underline">
              support@foxcard.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
