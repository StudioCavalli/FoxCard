'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/Button'
import { Loader2, CheckCircle, XCircle, LogIn, Store } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale || 'fr'
  const { data: session, status: sessionStatus } = useSession()
  const t = useTranslations('merchant')
  const tCommon = useTranslations('common')

  const token = searchParams.get('token')

  const [acceptedStore, setAcceptedStore] = useState<{
    storeId: string
    storeName: string
  } | null>(null)

  const acceptInvitation = trpc.team.acceptInvitation.useMutation({
    onSuccess: (data) => {
      setAcceptedStore({
        storeId: data.storeId,
        storeName: data.storeName,
      })
    },
  })

  useEffect(() => {
    // Wait for session to load and token to be available
    if (sessionStatus === 'loading' || !token) return

    // If user is authenticated, accept the invitation
    if (sessionStatus === 'authenticated' && session?.user) {
      acceptInvitation.mutate({ token })
    }
  }, [token, sessionStatus, session])

  // No token provided
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invalid Invitation
          </h1>
          <p className="text-gray-600 mb-6">
            This invitation link is invalid or has expired.
          </p>
          <Link href={`/${locale}`}>
            <Button variant="primary">{tCommon('home')}</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Loading session
  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{tCommon('loading')}</p>
        </div>
      </div>
    )
  }

  // User not authenticated - redirect to login
  if (sessionStatus === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Sign In Required
          </h1>
          <p className="text-gray-600 mb-6">
            Please sign in to accept this team invitation.
          </p>
          <Link
            href={`/${locale}/auth/login?from=${encodeURIComponent(`/${locale}/invite/accept?token=${token}`)}`}
          >
            <Button variant="primary" className="gap-2">
              <LogIn className="w-4 h-4" />
              {tCommon('login')}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Accepting invitation
  if (acceptInvitation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Accepting invitation...</p>
        </div>
      </div>
    )
  }

  // Error accepting
  if (acceptInvitation.isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Unable to Accept Invitation
          </h1>
          <p className="text-gray-600 mb-6">
            {acceptInvitation.error?.message || 'An error occurred while accepting the invitation.'}
          </p>
          <div className="space-x-3">
            <Link href={`/${locale}`}>
              <Button variant="outline">{tCommon('home')}</Button>
            </Link>
            <Button
              variant="primary"
              onClick={() => acceptInvitation.mutate({ token })}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Success
  if (acceptedStore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to the Team!
          </h1>
          <p className="text-gray-600 mb-6">
            You have successfully joined <strong>{acceptedStore.storeName}</strong>.
          </p>
          <Link href={`/${locale}/merchant`}>
            <Button variant="primary" className="gap-2">
              <Store className="w-4 h-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Default loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">{tCommon('loading')}</p>
      </div>
    </div>
  )
}
