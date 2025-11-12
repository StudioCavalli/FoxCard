'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/Button'
import { Mail, CheckCircle } from 'lucide-react'

export interface NewsletterFormProps {
  storeId?: string
  variant?: 'inline' | 'card' | 'footer'
  showNames?: boolean
  buttonText?: string
  placeholder?: string
}

export const NewsletterForm = ({
  storeId = '000000000000000000000001',
  variant = 'inline',
  showNames = false,
  buttonText = 'S\'inscrire',
  placeholder = 'Votre email',
}: NewsletterFormProps) => {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState('')

  const subscribeMutation = trpc.newsletter.subscribe.useMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Veuillez entrer votre email')
      return
    }

    subscribeMutation.mutate(
      {
        storeId,
        email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        source: 'website',
      },
      {
        onSuccess: (data) => {
          if (!data.alreadySubscribed) {
            setIsSubscribed(true)
            setEmail('')
            setFirstName('')
            setLastName('')
          } else {
            setError(data.message)
          }
        },
        onError: (err) => {
          setError(err.message || 'Une erreur est survenue')
        },
      }
    )
  }

  if (isSubscribed) {
    return (
      <div className={getContainerClass(variant)}>
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-900">Merci pour votre inscription !</p>
            <p className="text-xs text-green-700 mt-1">
              Vérifiez votre email pour confirmer votre inscription
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={getContainerClass(variant)}>
      {variant === 'card' && (
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Inscrivez-vous à notre newsletter
          </h3>
          <p className="text-sm text-gray-600">
            Recevez nos dernières actualités et offres exclusives
          </p>
        </div>
      )}

      {variant === 'footer' && (
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Newsletter
        </h4>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {showNames && (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Prénom"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Nom"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )}

        <div className={variant === 'inline' ? 'flex gap-2' : 'space-y-2'}>
          <div className="flex-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size={variant === 'footer' ? 'sm' : 'md'}
            disabled={subscribeMutation.isPending}
            className={variant === 'inline' ? '' : 'w-full'}
          >
            <Mail className="w-4 h-4 mr-2" />
            {subscribeMutation.isPending ? 'Inscription...' : buttonText}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <p className="text-xs text-gray-500">
          En vous inscrivant, vous acceptez de recevoir nos emails. Vous pouvez vous
          désinscrire à tout moment.
        </p>
      </form>
    </div>
  )
}

function getContainerClass(variant: string): string {
  switch (variant) {
    case 'card':
      return 'p-6 bg-white rounded-2xl shadow-sm border border-gray-200'
    case 'footer':
      return ''
    case 'inline':
    default:
      return ''
  }
}
