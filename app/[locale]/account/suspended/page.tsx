'use client'

import { signOut, useSession } from 'next-auth/react'
import { AlertTriangle, LogOut, Mail, MessageSquare } from 'lucide-react'

export default function AccountSuspendedPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-yellow-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Compte suspendu
          </h1>

          <p className="text-gray-600 mb-2">
            Votre compte a ete temporairement suspendu.
          </p>

          {session?.user?.suspendedReason && (
            <div className="my-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
              <p className="text-sm font-medium text-yellow-800 mb-1">Raison:</p>
              <p className="text-sm text-yellow-700">{session.user.suspendedReason}</p>
            </div>
          )}

          <p className="text-gray-600 mb-8">
            Si vous pensez que c'est une erreur, veuillez contacter notre equipe de support.
          </p>

          <div className="flex flex-col gap-3">
            <a
              href="mailto:support@foxcard.io"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Contacter le support
            </a>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Se deconnecter
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3 text-left">
            <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">Faire appel</p>
              <p className="text-sm text-blue-700">
                Vous pouvez faire appel de cette suspension en contactant notre equipe.
                Nous examinerons votre dossier dans les plus brefs delais.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
