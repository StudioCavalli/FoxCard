'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useStoreContext } from '@/lib/context/store-context'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Users,
  UserPlus,
  Mail,
  MoreVertical,
  Loader2,
  Crown,
  Shield,
  Edit3,
  Eye,
  Trash2,
  RefreshCw,
  X,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

export default function TeamManagementPage() {
  const params = useParams()
  const locale = params?.locale || 'fr'
  const { storeId } = useStoreContext()
  const t = useTranslations('merchant')
  const tCommon = useTranslations('common')

  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)

  // Fetch team members
  const { data: members, isLoading, refetch } = trpc.team.getMembers.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  )

  // Fetch available roles
  const { data: roles } = trpc.team.getRoles.useQuery(
    { storeId: storeId! },
    { enabled: !!storeId }
  )

  // Mutations
  const sendInvitation = trpc.team.sendInvitation.useMutation({
    onSuccess: () => {
      setShowInviteModal(false)
      setInviteEmail('')
      setSelectedRoleId('')
      refetch()
    },
  })

  const revokeInvitation = trpc.team.revokeInvitation.useMutation({
    onSuccess: () => {
      refetch()
      setActionMenuId(null)
    },
  })

  const removeMember = trpc.team.removeMember.useMutation({
    onSuccess: () => {
      refetch()
      setActionMenuId(null)
    },
  })

  const resendInvitation = trpc.team.resendInvitation.useMutation({
    onSuccess: () => {
      refetch()
      setActionMenuId(null)
    },
  })

  const updateMemberRole = trpc.team.updateMemberRole.useMutation({
    onSuccess: () => {
      refetch()
      setActionMenuId(null)
    },
  })

  // Create default roles if needed
  const createDefaultRoles = trpc.team.createDefaultRoles.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  // Separate active members and pending invitations
  const activeMembers = members?.filter((m) => m.status === 'ACTIVE') || []
  const pendingInvitations = members?.filter((m) => m.status === 'PENDING') || []

  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'owner':
        return Crown
      case 'admin':
        return Shield
      case 'editor':
        return Edit3
      case 'viewer':
        return Eye
      default:
        return Users
    }
  }

  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'owner':
        return 'text-amber-600 bg-amber-100'
      case 'admin':
        return 'text-indigo-600 bg-indigo-100'
      case 'editor':
        return 'text-green-600 bg-green-100'
      case 'viewer':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const handleSendInvitation = () => {
    if (!storeId || !inviteEmail || !selectedRoleId) return

    sendInvitation.mutate({
      storeId,
      email: inviteEmail,
      roleId: selectedRoleId,
    })
  }

  if (!storeId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">{t('noStoreSelected')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('team')}</h1>
          <p className="text-gray-500 mt-1">{t('teamDescription')}</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowInviteModal(true)}
          className="gap-2"
        >
          <UserPlus className="w-4 h-4" />
          {t('inviteMember')}
        </Button>
      </div>

      {/* Active Members */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-500" />
            {t('activeMembers')} ({activeMembers.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : activeMembers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('noTeamMembers')}</p>
            <p className="text-sm text-gray-400 mt-1">{t('noTeamMembersDesc')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {activeMembers.map((member) => {
              const RoleIcon = getRoleIcon(member.role.name)
              return (
                <div
                  key={member.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {member.user.image ? (
                      <img
                        src={member.user.image}
                        alt={member.user.name || ''}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {member.user.name?.charAt(0).toUpperCase() ||
                            member.user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.user.name || member.user.email}
                        {member.isOwner && (
                          <Crown className="w-4 h-4 text-amber-500 inline ml-2" />
                        )}
                      </p>
                      <p className="text-sm text-gray-500">{member.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                        getRoleColor(member.role.name)
                      )}
                    >
                      <RoleIcon className="w-3.5 h-3.5" />
                      {member.role.name}
                    </span>

                    {!member.isOwner && (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActionMenuId(
                              actionMenuId === member.id ? null : member.id
                            )
                          }
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>

                        {actionMenuId === member.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                            <button
                              onClick={() => {
                                // TODO: Implement role change modal
                                setActionMenuId(null)
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Shield className="w-4 h-4" />
                              {t('changeRole')}
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    'Are you sure you want to remove this member?'
                                  )
                                ) {
                                  removeMember.mutate({
                                    storeId: storeId!,
                                    storeUserId: member.id,
                                  })
                                }
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              {t('removeFromTeam')}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pending Invitations */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            {t('pendingInvitations')} ({pendingInvitations.length})
          </h2>
        </div>

        {pendingInvitations.length === 0 ? (
          <div className="p-8 text-center">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('noPendingInvitations')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingInvitations.map((invitation) => {
              const RoleIcon = getRoleIcon(invitation.role.name)
              return (
                <div
                  key={invitation.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {invitation.invitationEmail}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t('invitedBy')}{' '}
                        {invitation.invitedBy?.name || invitation.invitedBy?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                        getRoleColor(invitation.role.name)
                      )}
                    >
                      <RoleIcon className="w-3.5 h-3.5" />
                      {invitation.role.name}
                    </span>

                    <div className="relative">
                      <button
                        onClick={() =>
                          setActionMenuId(
                            actionMenuId === invitation.id ? null : invitation.id
                          )
                        }
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>

                      {actionMenuId === invitation.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                          <button
                            onClick={() =>
                              resendInvitation.mutate({
                                storeId: storeId!,
                                storeUserId: invitation.id,
                              })
                            }
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            {t('resendInvitation')}
                          </button>
                          <button
                            onClick={() =>
                              revokeInvitation.mutate({
                                storeId: storeId!,
                                storeUserId: invitation.id,
                              })
                            }
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            {t('revokeInvitation')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {t('inviteMember')}
              </h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('emailAddress')}
                </label>
                <Input
                  type="email"
                  placeholder="member@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('role')}
                </label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">{t('selectRole')}</option>
                  {roles
                    ?.filter((r) => r.name !== 'Owner')
                    .map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                </select>
              </div>

              {sendInvitation.isError && (
                <p className="text-sm text-red-600">
                  {sendInvitation.error?.message}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowInviteModal(false)}
                >
                  {tCommon('cancel')}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSendInvitation}
                  disabled={
                    !inviteEmail || !selectedRoleId || sendInvitation.isPending
                  }
                  className="gap-2"
                >
                  {sendInvitation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  {t('sendInvitation')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
