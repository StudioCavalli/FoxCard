'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  MessageSquare,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Store,
  Send,
  ChevronRight,
  Loader2,
  ArrowLeft
} from 'lucide-react'

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

type Ticket = {
  id: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category: string
  createdAt: string
  updatedAt: string
  user: {
    name: string
    email: string
  }
  store?: {
    name: string
  }
  messages: {
    id: string
    content: string
    isAdmin: boolean
    createdAt: string
    authorName: string
  }[]
}

const statusLabels: Record<TicketStatus, string> = {
  OPEN: 'Ouvert',
  IN_PROGRESS: 'En cours',
  RESOLVED: 'Résolu',
  CLOSED: 'Fermé',
}

const statusColors: Record<TicketStatus, string> = {
  OPEN: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-700',
}

const statusIcons: Record<TicketStatus, typeof Clock> = {
  OPEN: AlertCircle,
  IN_PROGRESS: Clock,
  RESOLVED: CheckCircle,
  CLOSED: XCircle,
}

const priorityLabels: Record<TicketPriority, string> = {
  LOW: 'Basse',
  MEDIUM: 'Moyenne',
  HIGH: 'Haute',
  URGENT: 'Urgente',
}

const priorityColors: Record<TicketPriority, string> = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-blue-100 text-blue-600',
  HIGH: 'bg-orange-100 text-orange-600',
  URGENT: 'bg-red-100 text-red-600',
}

// Données simulées
const mockTickets: Ticket[] = [
  {
    id: '1',
    subject: 'Problème de paiement Stripe',
    description: 'Je n\'arrive pas à configurer Stripe sur ma boutique, le webhook ne fonctionne pas.',
    status: 'OPEN',
    priority: 'HIGH',
    category: 'Paiement',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    user: { name: 'Jean Dupont', email: 'jean@example.com' },
    store: { name: 'Boutique Mode' },
    messages: [
      { id: '1', content: 'Bonjour, j\'ai configuré mon compte Stripe mais les webhooks ne fonctionnent pas. J\'ai vérifié les clés API mais le problème persiste.', isAdmin: false, createdAt: '2024-01-15T10:30:00Z', authorName: 'Jean Dupont' },
    ],
  },
  {
    id: '2',
    subject: 'Comment ajouter un nouveau thème ?',
    description: 'Je souhaite personnaliser ma boutique avec un nouveau thème.',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    category: 'Personnalisation',
    createdAt: '2024-01-14T14:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    user: { name: 'Marie Martin', email: 'marie@example.com' },
    store: { name: 'Bijoux Artisanaux' },
    messages: [
      { id: '1', content: 'Comment puis-je changer le thème de ma boutique ?', isAdmin: false, createdAt: '2024-01-14T14:00:00Z', authorName: 'Marie Martin' },
      { id: '2', content: 'Bonjour Marie ! Pour changer votre thème, rendez-vous dans Paramètres > Apparence. Vous y trouverez tous les thèmes disponibles.', isAdmin: true, createdAt: '2024-01-15T09:00:00Z', authorName: 'Support FoxCard' },
    ],
  },
  {
    id: '3',
    subject: 'Demande de remboursement client',
    description: 'Un client demande un remboursement mais je ne trouve pas l\'option.',
    status: 'RESOLVED',
    priority: 'MEDIUM',
    category: 'Commandes',
    createdAt: '2024-01-13T16:45:00Z',
    updatedAt: '2024-01-14T11:30:00Z',
    user: { name: 'Pierre Durand', email: 'pierre@example.com' },
    store: { name: 'Tech Store' },
    messages: [
      { id: '1', content: 'Comment effectuer un remboursement pour une commande ?', isAdmin: false, createdAt: '2024-01-13T16:45:00Z', authorName: 'Pierre Durand' },
      { id: '2', content: 'Dans la page Commandes, cliquez sur la commande concernée puis sur le bouton "Rembourser".', isAdmin: true, createdAt: '2024-01-14T10:00:00Z', authorName: 'Support FoxCard' },
      { id: '3', content: 'Parfait, j\'ai trouvé ! Merci beaucoup !', isAdmin: false, createdAt: '2024-01-14T11:30:00Z', authorName: 'Pierre Durand' },
    ],
  },
  {
    id: '4',
    subject: 'Bug affichage sur mobile',
    description: 'Le menu ne s\'affiche pas correctement sur iPhone.',
    status: 'CLOSED',
    priority: 'LOW',
    category: 'Bug',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-12T15:00:00Z',
    user: { name: 'Sophie Lefebvre', email: 'sophie@example.com' },
    store: { name: 'Déco Maison' },
    messages: [
      { id: '1', content: 'Le menu hamburger ne fonctionne pas sur Safari mobile.', isAdmin: false, createdAt: '2024-01-10T09:00:00Z', authorName: 'Sophie Lefebvre' },
      { id: '2', content: 'Nous avons identifié le problème et déployé un correctif. Pouvez-vous vérifier de votre côté ?', isAdmin: true, createdAt: '2024-01-11T14:00:00Z', authorName: 'Support FoxCard' },
      { id: '3', content: 'C\'est résolu, merci !', isAdmin: false, createdAt: '2024-01-12T15:00:00Z', authorName: 'Sophie Lefebvre' },
    ],
  },
]

export default function SuperAdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  // Stats
  const stats = {
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length,
    closed: tickets.filter(t => t.status === 'CLOSED').length,
  }

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = search === '' ||
      ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
      ticket.user.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return

    setIsSending(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    const message = {
      id: Date.now().toString(),
      content: newMessage,
      isAdmin: true,
      createdAt: new Date().toISOString(),
      authorName: 'Support FoxCard',
    }

    setTickets(prev => prev.map(t =>
      t.id === selectedTicket.id
        ? { ...t, messages: [...t.messages, message], updatedAt: new Date().toISOString() }
        : t
    ))

    setSelectedTicket(prev => prev ? { ...prev, messages: [...prev.messages, message] } : null)
    setNewMessage('')
    setIsSending(false)
  }

  const handleUpdateStatus = async (ticketId: string, newStatus: TicketStatus) => {
    setTickets(prev => prev.map(t =>
      t.id === ticketId
        ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
        : t
    ))
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Detail view
  if (selectedTicket) {
    const StatusIcon = statusIcons[selectedTicket.status]

    return (
      <div className="space-y-6">
        {/* Back button */}
        <button
          onClick={() => setSelectedTicket(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour aux tickets</span>
        </button>

        {/* Ticket Header */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">{selectedTicket.subject}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[selectedTicket.status]}`}>
                  <StatusIcon className="w-3.5 h-3.5 mr-1" />
                  {statusLabels[selectedTicket.status]}
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${priorityColors[selectedTicket.priority]}`}>
                  {priorityLabels[selectedTicket.priority]}
                </span>
                <span className="text-sm text-gray-500">
                  #{selectedTicket.id} • Créé le {formatDate(selectedTicket.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedTicket.status}
                onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value as TicketStatus)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="OPEN">Ouvert</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="RESOLVED">Résolu</option>
                <option value="CLOSED">Fermé</option>
              </select>
            </div>
          </div>

          {/* User info */}
          <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedTicket.user.name}</p>
                <p className="text-xs text-gray-500">{selectedTicket.user.email}</p>
              </div>
            </div>
            {selectedTicket.store && (
              <div className="flex items-center gap-3">
                <Store className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedTicket.store.name}</p>
                  <p className="text-xs text-gray-500">Boutique</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedTicket.category}</p>
                <p className="text-xs text-gray-500">Catégorie</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Messages */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversation</h2>

          <div className="space-y-4 mb-6">
            {selectedTicket.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isAdmin ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
                  message.isAdmin
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${message.isAdmin ? 'text-purple-200' : 'text-gray-500'}`}>
                      {message.authorName}
                    </span>
                    <span className={`text-xs ${message.isAdmin ? 'text-purple-200' : 'text-gray-400'}`}>
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Reply form */}
          {selectedTicket.status !== 'CLOSED' && (
            <div className="flex gap-3">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Votre réponse..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <Button
                variant="primary"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSending}
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </Card>
      </div>
    )
  }

  // List view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Support & Tickets</h1>
        <p className="text-gray-600">Gérez les demandes de support des marchands</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Ouverts</p>
              <p className="text-xl font-bold text-gray-900">{stats.open}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">En cours</p>
              <p className="text-xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Résolus</p>
              <p className="text-xl font-bold text-gray-900">{stats.resolved}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Fermés</p>
              <p className="text-xl font-bold text-gray-900">{stats.closed}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Rechercher par sujet ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="OPEN">Ouverts</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="RESOLVED">Résolus</option>
              <option value="CLOSED">Fermés</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucun ticket trouvé</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => {
            const StatusIcon = statusIcons[ticket.status]

            return (
              <Card
                key={ticket.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusLabels[ticket.status]}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
                        {priorityLabels[ticket.priority]}
                      </span>
                      <span className="text-xs text-gray-400">#{ticket.id}</span>
                    </div>
                    <h3 className="font-medium text-gray-900 truncate">{ticket.subject}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {ticket.user.name}
                      </span>
                      {ticket.store && (
                        <span className="flex items-center gap-1">
                          <Store className="w-3.5 h-3.5" />
                          {ticket.store.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {ticket.messages.length} message{ticket.messages.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-500">Mis à jour</p>
                      <p className="text-sm text-gray-700">{formatDate(ticket.updatedAt)}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
