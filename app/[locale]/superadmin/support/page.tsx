'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { trpc } from '@/lib/trpc/client'
import {
  AdminCard,
  AdminStatCard,
  AdminButton,
  AdminInput,
  AdminSelect,
  AdminSearchInput,
  AdminBadge,
  AdminTabs,
  AdminEmptyState,
} from '@/components/admin/ui'
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Store,
  Send,
  ChevronRight,
  Loader2,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  Hourglass,
  Hash,
  Calendar,
  Tag,
} from 'lucide-react'

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED'
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

const getStatusConfig = (t: any): Record<TicketStatus, { label: string; variant: 'warning' | 'info' | 'default' | 'success' | 'danger'; icon: any }> => ({
  OPEN: { label: t('supportPage.status.open'), variant: 'warning', icon: AlertCircle },
  IN_PROGRESS: { label: t('supportPage.status.inProgress'), variant: 'info', icon: Clock },
  WAITING_CUSTOMER: { label: t('supportPage.status.waitingCustomer'), variant: 'default', icon: Hourglass },
  RESOLVED: { label: t('supportPage.status.resolved'), variant: 'success', icon: CheckCircle },
  CLOSED: { label: t('supportPage.status.closed'), variant: 'danger', icon: XCircle },
})

const getPriorityConfig = (t: any): Record<TicketPriority, { label: string; variant: 'default' | 'info' | 'warning' | 'danger' }> => ({
  LOW: { label: t('supportPage.low'), variant: 'default' },
  MEDIUM: { label: t('supportPage.medium'), variant: 'info' },
  HIGH: { label: t('supportPage.high'), variant: 'warning' },
  URGENT: { label: t('supportPage.urgentPriority'), variant: 'danger' },
})

export default function SuperAdminSupportPage() {
  const t = useTranslations('superadmin')
  const statusConfig = getStatusConfig(t)
  const priorityConfig = getPriorityConfig(t)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [page, setPage] = useState(0)
  const limit = 20

  // Fetch tickets list
  const {
    data: ticketsData,
    isLoading: isLoadingTickets,
    refetch: refetchTickets,
  } = trpc.superadmin.getAllTickets.useQuery({
    limit,
    offset: page * limit,
    search: search || undefined,
    status: statusFilter as TicketStatus | 'all',
    priority: priorityFilter as TicketPriority | 'all',
  })

  // Fetch single ticket with messages
  const {
    data: selectedTicket,
    isLoading: isLoadingTicket,
    refetch: refetchTicket,
  } = trpc.superadmin.getTicket.useQuery(
    { ticketId: selectedTicketId! },
    { enabled: !!selectedTicketId }
  )

  // Fetch stats
  const { data: stats } = trpc.superadmin.getSupportStats.useQuery()

  // Update status mutation
  const updateStatus = trpc.superadmin.updateTicketStatus.useMutation({
    onSuccess: () => {
      refetchTicket()
      refetchTickets()
    },
  })

  // Add message mutation
  const addMessage = trpc.superadmin.addTicketMessage.useMutation({
    onSuccess: () => {
      setNewMessage('')
      refetchTicket()
      refetchTickets()
    },
  })

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicketId) return
    addMessage.mutate({ ticketId: selectedTicketId, content: newMessage })
  }

  const handleUpdateStatus = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedTicketId) return
    updateStatus.mutate({ ticketId: selectedTicketId, status: e.target.value as TicketStatus })
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const statusTabs = [
    { value: 'all', label: t('supportPage.all'), count: ticketsData?.total || 0 },
    { value: 'OPEN', label: t('supportPage.opened'), count: ticketsData?.statusCounts?.open || 0, icon: <AlertCircle className="w-4 h-4" /> },
    { value: 'IN_PROGRESS', label: t('supportPage.inProgressStatus'), count: ticketsData?.statusCounts?.inProgress || 0, icon: <Clock className="w-4 h-4" /> },
    { value: 'WAITING_CUSTOMER', label: t('supportPage.waitingCustomer'), count: ticketsData?.statusCounts?.waitingCustomer || 0, icon: <Hourglass className="w-4 h-4" /> },
    { value: 'RESOLVED', label: t('supportPage.resolvedStatus'), count: ticketsData?.statusCounts?.resolved || 0, icon: <CheckCircle className="w-4 h-4" /> },
  ]

  const priorityOptions = [
    { value: 'all', label: t('supportPage.allPriorities') },
    { value: 'LOW', label: t('supportPage.low') },
    { value: 'MEDIUM', label: t('supportPage.medium') },
    { value: 'HIGH', label: t('supportPage.high') },
    { value: 'URGENT', label: t('supportPage.urgentPriority') },
  ]

  const statusOptions = [
    { value: 'OPEN', label: t('supportPage.status.open') },
    { value: 'IN_PROGRESS', label: t('supportPage.status.inProgress') },
    { value: 'WAITING_CUSTOMER', label: t('supportPage.status.waitingCustomer') },
    { value: 'RESOLVED', label: t('supportPage.status.resolved') },
    { value: 'CLOSED', label: t('supportPage.status.closed') },
  ]

  // Detail view
  if (selectedTicketId) {
    if (isLoadingTicket || !selectedTicket) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('supportPage.loadingTicket')}</p>
          </div>
        </div>
      )
    }

    const ticketStatus = statusConfig[selectedTicket.status as TicketStatus]
    const ticketPriority = priorityConfig[selectedTicket.priority as TicketPriority]
    const StatusIcon = ticketStatus?.icon || AlertCircle

    return (
      <div className="space-y-6">
        {/* Back button */}
        <button
          onClick={() => setSelectedTicketId(null)}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">{t('supportPage.backToTickets')}</span>
        </button>

        {/* Ticket Header */}
        <AdminCard>
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="space-y-3">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedTicket.subject}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <AdminBadge variant={ticketStatus?.variant || 'default'}>
                    <StatusIcon className="w-3.5 h-3.5 mr-1" />
                    {ticketStatus?.label || selectedTicket.status}
                  </AdminBadge>
                  <AdminBadge variant={ticketPriority?.variant || 'default'}>
                    {ticketPriority?.label || selectedTicket.priority}
                  </AdminBadge>
                  <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Hash className="w-4 h-4" />
                    {selectedTicket.ticketNumber}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedTicket.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <AdminSelect
                  value={selectedTicket.status}
                  onChange={handleUpdateStatus}
                  options={statusOptions}
                  disabled={updateStatus.isPending}
                />
                {updateStatus.isPending && <Loader2 className="w-4 h-4 animate-spin text-primary-500" />}
              </div>
            </div>
          </div>

          {/* User info */}
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {selectedTicket.user.name || 'Sans nom'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedTicket.user.email}
                </p>
              </div>
            </div>
            {selectedTicket.store && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {selectedTicket.store.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('supportPage.store')}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                <Tag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {selectedTicket.category}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('supportPage.category')}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {selectedTicket.description && (
            <div className="px-5 pb-5">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
              </div>
            </div>
          )}
        </AdminCard>

        {/* Messages */}
        <AdminCard>
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('supportPage.conversation')}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedTicket.messages.length} {selectedTicket.messages.length === 1 ? t('supportPage.messages') : t('supportPage.messagesPlural')}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
            {selectedTicket.messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">{t('supportPage.noMessages')}</p>
              </div>
            ) : (
              selectedTicket.messages.map((message: any) => (
                <div
                  key={message.id}
                  className={`flex ${message.isAdmin ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.isAdmin
                        ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-medium ${
                          message.isAdmin ? 'text-primary-200' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {message.authorName}
                      </span>
                      <span
                        className={`text-xs ${
                          message.isAdmin ? 'text-primary-200' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Reply form */}
          {selectedTicket.status !== 'CLOSED' && (
            <div className="p-5 border-t border-slate-100 dark:border-slate-800">
              <div className="flex gap-3">
                <AdminInput
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t('supportPage.yourReply')}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  disabled={addMessage.isPending}
                />
                <AdminButton
                  variant="primary"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || addMessage.isPending}
                  loading={addMessage.isPending}
                  icon={<Send className="w-4 h-4" />}
                >
                  {t('supportPage.send')}
                </AdminButton>
              </div>
              {addMessage.error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{addMessage.error.message}</p>
              )}
            </div>
          )}
        </AdminCard>
      </div>
    )
  }

  // List view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('supportPage.title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {t('supportPage.subtitle')}
          </p>
        </div>
        <AdminButton
          variant="secondary"
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={() => refetchTickets()}
        >
          {t('supportPage.refresh')}
        </AdminButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <AdminStatCard
          title={t('supportPage.open')}
          value={ticketsData?.statusCounts?.open || 0}
          icon={AlertCircle}
          variant="amber"
          onClick={() => setStatusFilter('OPEN')}
        />
        <AdminStatCard
          title={t('supportPage.inProgress')}
          value={ticketsData?.statusCounts?.inProgress || 0}
          icon={Clock}
          variant="blue"
          onClick={() => setStatusFilter('IN_PROGRESS')}
        />
        <AdminStatCard
          title={t('supportPage.waiting')}
          value={ticketsData?.statusCounts?.waitingCustomer || 0}
          icon={Hourglass}
          variant="slate"
          onClick={() => setStatusFilter('WAITING_CUSTOMER')}
        />
        <AdminStatCard
          title={t('supportPage.resolved')}
          value={ticketsData?.statusCounts?.resolved || 0}
          icon={CheckCircle}
          variant="emerald"
          onClick={() => setStatusFilter('RESOLVED')}
        />
        <AdminStatCard
          title={t('supportPage.urgent')}
          value={stats?.urgent || 0}
          icon={AlertTriangle}
          variant="rose"
          onClick={() => setPriorityFilter('URGENT')}
        />
      </div>

      {/* Filters */}
      <AdminCard>
        <div className="p-4 space-y-4">
          {/* Status Tabs */}
          <AdminTabs
            items={statusTabs}
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v)
              setPage(0)
            }}
            variant="pills"
            size="sm"
          />

          {/* Search and Priority Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <AdminSearchInput
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(0)
                }}
                placeholder={t('supportPage.searchPlaceholder')}
              />
            </div>
            <div className="sm:w-48">
              <AdminSelect
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value)
                  setPage(0)
                }}
                options={priorityOptions}
              />
            </div>
          </div>
        </div>
      </AdminCard>

      {/* Loading */}
      {isLoadingTickets && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('supportPage.loadingTickets')}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoadingTickets && (!ticketsData?.tickets || ticketsData.tickets.length === 0) && (
        <AdminEmptyState
          icon={MessageSquare}
          title={t('supportPage.noTicketsFound')}
          description={search || statusFilter !== 'all' || priorityFilter !== 'all'
            ? t('supportPage.noMatchCriteria')
            : t('supportPage.ticketsWillAppear')
          }
          action={
            (search || statusFilter !== 'all' || priorityFilter !== 'all') ? (
              <AdminButton
                variant="secondary"
                onClick={() => {
                  setSearch('')
                  setStatusFilter('all')
                  setPriorityFilter('all')
                }}
              >
                {t('supportPage.resetFilters')}
              </AdminButton>
            ) : undefined
          }
        />
      )}

      {/* Tickets List */}
      {!isLoadingTickets && ticketsData?.tickets && ticketsData.tickets.length > 0 && (
        <AdminCard>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {ticketsData.tickets.map((ticket: any) => {
              const status = statusConfig[ticket.status as TicketStatus]
              const priority = priorityConfig[ticket.priority as TicketPriority]
              const StatusIcon = status?.icon || AlertCircle

              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <AdminBadge variant={status?.variant || 'default'} size="sm">
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status?.label || ticket.status}
                        </AdminBadge>
                        <AdminBadge variant={priority?.variant || 'default'} size="sm">
                          {priority?.label || ticket.priority}
                        </AdminBadge>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                          #{ticket.ticketNumber}
                        </span>
                      </div>

                      {/* Subject */}
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                        {ticket.subject}
                      </h3>

                      {/* Meta */}
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          {ticket.user?.name || ticket.user?.email}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {ticket.messagesCount} {ticket.messagesCount === 1 ? t('supportPage.messages') : t('supportPage.messagesPlural')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t('supportPage.updated')}</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {formatDate(ticket.updatedAt)}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination Footer */}
          {ticketsData.total > limit && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('supportPage.displaying', { start: page * limit + 1, end: Math.min((page + 1) * limit, ticketsData.total), total: ticketsData.total })}
              </p>
              <div className="flex gap-2">
                <AdminButton
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  {t('supportPage.previous')}
                </AdminButton>
                <AdminButton
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(page + 1) * limit >= ticketsData.total}
                >
                  {t('supportPage.next')}
                </AdminButton>
              </div>
            </div>
          )}
        </AdminCard>
      )}
    </div>
  )
}
