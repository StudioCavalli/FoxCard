'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { trpc } from '@/lib/trpc/client'
import { Mail, Eye, RefreshCw, Send, BarChart3 } from 'lucide-react'

type EmailStatus = 'PENDING' | 'SENDING' | 'SENT' | 'FAILED' | 'BOUNCED'

export default function AdminEmailsPage() {
  const DEMO_STORE_ID = '000000000000000000000001'
  const [statusFilter, setStatusFilter] = useState<EmailStatus | undefined>(undefined)
  const [showTestModal, setShowTestModal] = useState(false)

  // Get email logs
  const { data: logsData, isLoading: logsLoading, refetch: refetchLogs } = trpc.email.getLogs.useQuery({
    storeId: DEMO_STORE_ID,
    limit: 50,
    offset: 0,
    status: statusFilter,
  })

  // Get email statistics
  const { data: stats, isLoading: statsLoading } = trpc.email.getStats.useQuery({
    storeId: DEMO_STORE_ID,
  })

  const logs = logsData?.logs || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'bg-green-100 text-green-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      case 'BOUNCED':
        return 'bg-orange-100 text-orange-800'
      case 'SENDING':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'Envoyé'
      case 'FAILED':
        return 'Échoué'
      case 'BOUNCED':
        return 'Rejeté'
      case 'SENDING':
        return 'En cours'
      case 'PENDING':
        return 'En attente'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Emails</h1>
          <p className="text-gray-600">Gérez vos emails et consultez les logs</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => refetchLogs()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={() => setShowTestModal(true)}>
            <Send className="w-4 h-4 mr-2" />
            Envoyer un test
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Envoyés</p>
                <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Échoués</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Mail className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ouverts</p>
                <p className="text-2xl font-bold text-purple-600">{stats.opened}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux d'ouverture</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.openRate}%</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Filtrer par statut :</span>
        <Button
          variant={statusFilter === undefined ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter(undefined)}
        >
          Tous
        </Button>
        <Button
          variant={statusFilter === 'SENT' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('SENT')}
        >
          Envoyés
        </Button>
        <Button
          variant={statusFilter === 'FAILED' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('FAILED')}
        >
          Échoués
        </Button>
        <Button
          variant={statusFilter === 'PENDING' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('PENDING')}
        >
          En attente
        </Button>
      </div>

      {/* Email Logs Table */}
      <Card className="overflow-hidden">
        {logsLoading ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">Chargement des logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun email pour le moment</p>
            <p className="text-sm text-gray-500 mt-2">
              Les emails envoyés apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Destinataire</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Sujet</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Template</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ouvertures</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(log.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900">{log.to}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-900">{log.subject}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                        {log.templateName}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                        {getStatusLabel(log.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {log.opened ? (
                          <span className="flex items-center text-sm text-green-600">
                            <Eye className="w-4 h-4 mr-1" />
                            {log.openCount} fois
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Non ouvert</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {log.status === 'FAILED' && (
                          <ResendButton logId={log.id} onSuccess={() => refetchLogs()} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Test Email Modal */}
      {showTestModal && (
        <TestEmailModal
          storeId={DEMO_STORE_ID}
          onClose={() => setShowTestModal(false)}
          onSuccess={() => {
            setShowTestModal(false)
            refetchLogs()
          }}
        />
      )}
    </div>
  )
}

function ResendButton({ logId, onSuccess }: { logId: string; onSuccess: () => void }) {
  const resendMutation = trpc.email.resend.useMutation()

  const handleResend = async () => {
    try {
      await resendMutation.mutateAsync({ logId })
      onSuccess()
    } catch (error) {
      console.error('Failed to resend email:', error)
      alert('Erreur lors du renvoi de l\'email')
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleResend}
      disabled={resendMutation.isPending}
    >
      <RefreshCw className="w-4 h-4" />
    </Button>
  )
}

function TestEmailModal({
  storeId,
  onClose,
  onSuccess,
}: {
  storeId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [email, setEmail] = useState('')
  const [template, setTemplate] = useState<'OrderConfirmation' | 'OrderStatusUpdate' | 'WelcomeEmail' | 'ResetPassword'>('OrderConfirmation')
  const sendTestMutation = trpc.email.sendTest.useMutation()

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await sendTestMutation.mutateAsync({
        storeId,
        to: email,
        template,
      })
      alert('Email de test envoyé avec succès !')
      onSuccess()
    } catch (error) {
      console.error('Failed to send test email:', error)
      alert('Erreur lors de l\'envoi de l\'email de test')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Envoyer un email de test</h2>
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="exemple@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template
            </label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="OrderConfirmation">Confirmation de commande</option>
              <option value="OrderStatusUpdate">Mise à jour de commande</option>
              <option value="WelcomeEmail">Email de bienvenue</option>
              <option value="ResetPassword">Réinitialisation mot de passe</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={sendTestMutation.isPending}
            >
              {sendTestMutation.isPending ? 'Envoi...' : 'Envoyer'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
