'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { trpc } from '@/lib/trpc/client'
import { Mail, Users, CheckCircle, XCircle, Clock, Send, Trash2, Search } from 'lucide-react'
import { useStoreContext } from '@/lib/context/store-context'

type TabType = 'subscribers' | 'campaign'
type StatusFilter = 'PENDING' | 'CONFIRMED' | 'UNSUBSCRIBED' | undefined

export default function AdminNewsletterPage() {
  const { storeId } = useStoreContext()
  const [activeTab, setActiveTab] = useState<TabType>('subscribers')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(undefined)
  const [searchQuery, setSearchQuery] = useState('')

  // Campaign form
  const [campaignSubject, setCampaignSubject] = useState('')
  const [campaignContent, setCampaignContent] = useState('')

  // Get stats
  const { data: stats } = trpc.newsletter.getStats.useQuery(
    {
      storeId: storeId!,
    },
    {
      enabled: !!storeId,
    }
  )

  // Get subscribers
  const { data: subscribersData, refetch } = trpc.newsletter.getSubscribers.useQuery(
    {
      storeId: storeId!,
      status: statusFilter,
      search: searchQuery || undefined,
      limit: 50,
      offset: 0,
    },
    {
      enabled: !!storeId,
    }
  )

  const subscribers = subscribersData?.subscribers || []

  // Mutations
  const deleteSubscriberMutation = trpc.newsletter.deleteSubscriber.useMutation()
  const sendCampaignMutation = trpc.newsletter.sendCampaign.useMutation()

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet abonné ?')) {
      return
    }

    try {
      await deleteSubscriberMutation.mutateAsync({ id })
      alert('Abonné supprimé avec succès')
      refetch()
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la suppression')
    }
  }

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!campaignSubject || !campaignContent) {
      alert('Veuillez remplir tous les champs')
      return
    }

    if (!confirm(`Envoyer cette campagne à ${stats?.confirmed || 0} abonnés ?`)) {
      return
    }

    try {
      const result = await sendCampaignMutation.mutateAsync({
        storeId: storeId!,
        subject: campaignSubject,
        htmlContent: campaignContent,
      })

      alert(result.message)
      setCampaignSubject('')
      setCampaignContent('')
    } catch (error: any) {
      alert(error.message || 'Erreur lors de l\'envoi de la campagne')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'UNSUBSCRIBED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmé'
      case 'PENDING':
        return 'En attente'
      case 'UNSUBSCRIBED':
        return 'Désinscrit'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Newsletter</h1>
        <p className="text-gray-600">Gérez vos abonnés et envoyez des campagnes</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmés</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Désinscrits</p>
                <p className="text-2xl font-bold text-gray-600">{stats.unsubscribed}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <XCircle className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux de confirm.</p>
                <p className="text-2xl font-bold text-purple-600">{stats.confirmationRate}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('subscribers')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'subscribers'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Abonnés
        </button>
        <button
          onClick={() => setActiveTab('campaign')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'campaign'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Send className="w-4 h-4 inline mr-2" />
          Envoyer une campagne
        </button>
      </div>

      {/* Subscribers Tab */}
      {activeTab === 'subscribers' && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par email ou nom..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={statusFilter === undefined ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(undefined)}
              >
                Tous
              </Button>
              <Button
                variant={statusFilter === 'CONFIRMED' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('CONFIRMED')}
              >
                Confirmés
              </Button>
              <Button
                variant={statusFilter === 'PENDING' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('PENDING')}
              >
                En attente
              </Button>
              <Button
                variant={statusFilter === 'UNSUBSCRIBED' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('UNSUBSCRIBED')}
              >
                Désinscrits
              </Button>
            </div>
          </div>

          {/* Subscribers Table */}
          <Card className="overflow-hidden">
            {subscribers.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucun abonné pour le moment</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nom</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date d'inscription</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium text-gray-900">{subscriber.email}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-900">
                            {subscriber.firstName || subscriber.lastName
                              ? `${subscriber.firstName || ''} ${subscriber.lastName || ''}`.trim()
                              : '-'}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subscriber.status)}`}>
                            {getStatusLabel(subscriber.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-600">
                            {new Date(subscriber.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSubscriber(subscriber.id)}
                              disabled={deleteSubscriberMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Campaign Tab */}
      {activeTab === 'campaign' && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Envoyer une campagne newsletter
          </h2>

          <form onSubmit={handleSendCampaign} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sujet de l'email
              </label>
              <input
                type="text"
                value={campaignSubject}
                onChange={(e) => setCampaignSubject(e.target.value)}
                placeholder="Nouvelle collection disponible !"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenu de l'email (HTML)
              </label>
              <textarea
                value={campaignContent}
                onChange={(e) => setCampaignContent(e.target.value)}
                placeholder="<h1>Bonjour {{firstName}}</h1><p>Découvrez notre nouvelle collection...</p>"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
                rows={12}
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Utilisez du HTML pour formater votre email. Variable disponible : {'{{firstName}}'}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>ℹ️ Information :</strong> Cette campagne sera envoyée à{' '}
                <strong>{stats?.confirmed || 0} abonnés confirmés</strong>.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={sendCampaignMutation.isPending}
              className="w-full"
            >
              <Send className="w-5 h-5 mr-2" />
              {sendCampaignMutation.isPending ? 'Envoi en cours...' : 'Envoyer la campagne'}
            </Button>
          </form>
        </Card>
      )}
    </div>
  )
}
