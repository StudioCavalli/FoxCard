import { z } from 'zod'
import { router, requireStoreAccess, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import crypto from 'crypto'

// Default role permissions by type
const DEFAULT_ROLE_PERMISSIONS = {
  admin: [
    'products:create', 'products:read', 'products:update', 'products:delete',
    'orders:read', 'orders:update',
    'customers:read', 'customers:update',
    'analytics:read',
    'settings:manage',
  ],
  editor: [
    'products:create', 'products:read', 'products:update',
    'orders:read', 'orders:update',
    'customers:read',
  ],
  viewer: [
    'products:read',
    'orders:read',
    'customers:read',
    'analytics:read',
  ],
}

export const teamRouter = router({
  // Get all team members for a store
  getMembers: requireStoreAccess
    .input(z.object({ storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      const storeUsers = await ctx.prisma.storeUser.findMany({
        where: {
          storeId: input.storeId,
          status: { in: ['ACTIVE', 'PENDING'] },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          role: {
            select: {
              id: true,
              name: true,
              permissions: true,
              isSystem: true,
            },
          },
          invitedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      })

      // Get the store owner
      const store = await ctx.prisma.store.findUnique({
        where: { id: input.storeId },
        select: { ownerId: true },
      })

      return storeUsers.map((su) => ({
        id: su.id,
        userId: su.userId,
        storeId: su.storeId,
        user: su.user,
        role: su.role,
        status: su.status,
        isOwner: su.userId === store?.ownerId,
        invitedBy: su.invitedByUser,
        invitedAt: su.createdAt,
        invitationEmail: su.invitationEmail,
      }))
    }),

  // Get available roles for a store
  getRoles: requireStoreAccess
    .input(z.object({ storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.role.findMany({
        where: { storeId: input.storeId },
        orderBy: { name: 'asc' },
      })
    }),

  // Create a new role for the store
  createRole: requireStoreAccess
    .input(
      z.object({
        storeId: z.string(),
        name: z.string().min(1),
        permissions: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if role with same name exists
      const existing = await ctx.prisma.role.findFirst({
        where: {
          storeId: input.storeId,
          name: { equals: input.name, mode: 'insensitive' },
        },
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A role with this name already exists',
        })
      }

      return ctx.prisma.role.create({
        data: {
          storeId: input.storeId,
          name: input.name,
          permissions: input.permissions,
          isSystem: false,
        },
      })
    }),

  // Send an invitation to join the store
  sendInvitation: requireStoreAccess
    .input(
      z.object({
        storeId: z.string(),
        email: z.string().email(),
        roleId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is already a member
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      })

      if (existingUser) {
        const existingMembership = await ctx.prisma.storeUser.findUnique({
          where: {
            userId_storeId: {
              userId: existingUser.id,
              storeId: input.storeId,
            },
          },
        })

        if (existingMembership) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'This user is already a member of this store',
          })
        }
      }

      // Check if there's already a pending invitation
      const existingInvitation = await ctx.prisma.storeUser.findFirst({
        where: {
          storeId: input.storeId,
          invitationEmail: input.email,
          status: 'PENDING',
        },
      })

      if (existingInvitation) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'An invitation has already been sent to this email',
        })
      }

      // Verify the role exists and belongs to this store
      const role = await ctx.prisma.role.findFirst({
        where: {
          id: input.roleId,
          storeId: input.storeId,
        },
      })

      if (!role) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Role not found',
        })
      }

      // Generate invitation token
      const invitationToken = crypto.randomBytes(32).toString('hex')
      const invitationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      // Get store info
      const store = await ctx.prisma.store.findUnique({
        where: { id: input.storeId },
        select: { name: true },
      })

      // Create StoreUser with pending status
      // If user exists, link to them. If not, leave userId null until they accept
      const storeUser = await ctx.prisma.storeUser.create({
        data: {
          userId: existingUser?.id ?? ctx.session.user.id, // Temporarily use inviter's ID if user doesn't exist
          storeId: input.storeId,
          roleId: input.roleId,
          status: 'PENDING',
          invitedBy: ctx.session.user.id,
          invitationEmail: input.email,
          invitationToken,
          invitationExpires,
        },
      })

      // Create email log for the invitation
      await ctx.prisma.emailLog.create({
        data: {
          storeId: input.storeId,
          templateName: 'team_invitation',
          to: input.email,
          from: 'noreply@foxcard.app',
          subject: `You've been invited to join ${store?.name}`,
          htmlBody: `
            <h2>Team Invitation</h2>
            <p>You've been invited to join <strong>${store?.name}</strong> as a ${role.name}.</p>
            <p>Click the link below to accept the invitation:</p>
            <a href="${process.env.NEXTAUTH_URL}/invite/accept?token=${invitationToken}" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px;">Accept Invitation</a>
            <p>This invitation expires in 7 days.</p>
          `,
          textBody: `
            Team Invitation

            You've been invited to join ${store?.name} as a ${role.name}.

            Accept the invitation: ${process.env.NEXTAUTH_URL}/invite/accept?token=${invitationToken}

            This invitation expires in 7 days.
          `,
          status: 'PENDING',
        },
      })

      return {
        success: true,
        message: 'Invitation sent successfully',
        storeUser,
      }
    }),

  // Accept an invitation
  acceptInvitation: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Find the invitation
      const invitation = await ctx.prisma.storeUser.findFirst({
        where: {
          invitationToken: input.token,
          status: 'PENDING',
        },
        include: {
          store: { select: { name: true } },
          role: { select: { name: true } },
        },
      })

      if (!invitation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invitation not found or already used',
        })
      }

      // Check if invitation expired
      if (invitation.invitationExpires && invitation.invitationExpires < new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This invitation has expired',
        })
      }

      // Check if the email matches the logged-in user
      if (invitation.invitationEmail !== ctx.session.user.email) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This invitation was sent to a different email address',
        })
      }

      // Check if user is already a member
      const existingMembership = await ctx.prisma.storeUser.findUnique({
        where: {
          userId_storeId: {
            userId: ctx.session.user.id,
            storeId: invitation.storeId,
          },
        },
      })

      if (existingMembership && existingMembership.id !== invitation.id) {
        // Delete the invitation since user is already a member
        await ctx.prisma.storeUser.delete({
          where: { id: invitation.id },
        })

        throw new TRPCError({
          code: 'CONFLICT',
          message: 'You are already a member of this store',
        })
      }

      // Accept the invitation
      const updatedStoreUser = await ctx.prisma.storeUser.update({
        where: { id: invitation.id },
        data: {
          userId: ctx.session.user.id,
          status: 'ACTIVE',
          invitationToken: null,
          invitationExpires: null,
        },
      })

      return {
        success: true,
        message: `You have joined ${invitation.store.name} as ${invitation.role.name}`,
        storeId: invitation.storeId,
        storeName: invitation.store.name,
      }
    }),

  // Revoke/cancel an invitation
  revokeInvitation: requireStoreAccess
    .input(
      z.object({
        storeId: z.string(),
        storeUserId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const storeUser = await ctx.prisma.storeUser.findUnique({
        where: { id: input.storeUserId },
      })

      if (!storeUser || storeUser.storeId !== input.storeId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invitation not found',
        })
      }

      if (storeUser.status !== 'PENDING') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only revoke pending invitations',
        })
      }

      await ctx.prisma.storeUser.delete({
        where: { id: input.storeUserId },
      })

      return { success: true, message: 'Invitation revoked' }
    }),

  // Remove a team member
  removeMember: requireStoreAccess
    .input(
      z.object({
        storeId: z.string(),
        storeUserId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const storeUser = await ctx.prisma.storeUser.findUnique({
        where: { id: input.storeUserId },
        include: { role: true },
      })

      if (!storeUser || storeUser.storeId !== input.storeId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team member not found',
        })
      }

      // Check if trying to remove owner
      const store = await ctx.prisma.store.findUnique({
        where: { id: input.storeId },
        select: { ownerId: true },
      })

      if (storeUser.userId === store?.ownerId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot remove the store owner',
        })
      }

      // Cannot remove yourself unless you're the owner
      if (storeUser.userId === ctx.session.user.id && ctx.session.user.id !== store?.ownerId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You cannot remove yourself from the team',
        })
      }

      await ctx.prisma.storeUser.delete({
        where: { id: input.storeUserId },
      })

      return { success: true, message: 'Team member removed' }
    }),

  // Update member role
  updateMemberRole: requireStoreAccess
    .input(
      z.object({
        storeId: z.string(),
        storeUserId: z.string(),
        roleId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const storeUser = await ctx.prisma.storeUser.findUnique({
        where: { id: input.storeUserId },
      })

      if (!storeUser || storeUser.storeId !== input.storeId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team member not found',
        })
      }

      // Check if trying to change owner's role
      const store = await ctx.prisma.store.findUnique({
        where: { id: input.storeId },
        select: { ownerId: true },
      })

      if (storeUser.userId === store?.ownerId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot change the owner\'s role',
        })
      }

      // Verify the role exists and belongs to this store
      const role = await ctx.prisma.role.findFirst({
        where: {
          id: input.roleId,
          storeId: input.storeId,
        },
      })

      if (!role) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Role not found',
        })
      }

      // Cannot assign Owner role
      if (role.name === 'Owner' && role.isSystem) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot assign the Owner role',
        })
      }

      await ctx.prisma.storeUser.update({
        where: { id: input.storeUserId },
        data: { roleId: input.roleId },
      })

      return { success: true, message: 'Role updated' }
    }),

  // Create default roles for a store (called when store is created)
  createDefaultRoles: requireStoreAccess
    .input(z.object({ storeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if roles already exist
      const existingRoles = await ctx.prisma.role.count({
        where: { storeId: input.storeId },
      })

      if (existingRoles > 1) {
        // Already has roles beyond Owner
        return { success: true, message: 'Roles already exist' }
      }

      // Create default roles
      await ctx.prisma.role.createMany({
        data: [
          {
            storeId: input.storeId,
            name: 'Admin',
            permissions: DEFAULT_ROLE_PERMISSIONS.admin,
            isSystem: true,
          },
          {
            storeId: input.storeId,
            name: 'Editor',
            permissions: DEFAULT_ROLE_PERMISSIONS.editor,
            isSystem: true,
          },
          {
            storeId: input.storeId,
            name: 'Viewer',
            permissions: DEFAULT_ROLE_PERMISSIONS.viewer,
            isSystem: true,
          },
        ],
      })

      return { success: true, message: 'Default roles created' }
    }),

  // Resend invitation email
  resendInvitation: requireStoreAccess
    .input(
      z.object({
        storeId: z.string(),
        storeUserId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const storeUser = await ctx.prisma.storeUser.findUnique({
        where: { id: input.storeUserId },
        include: {
          store: { select: { name: true } },
          role: { select: { name: true } },
        },
      })

      if (!storeUser || storeUser.storeId !== input.storeId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invitation not found',
        })
      }

      if (storeUser.status !== 'PENDING') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only resend pending invitations',
        })
      }

      // Generate new token and expiry
      const invitationToken = crypto.randomBytes(32).toString('hex')
      const invitationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

      await ctx.prisma.storeUser.update({
        where: { id: input.storeUserId },
        data: {
          invitationToken,
          invitationExpires,
        },
      })

      // Create new email log
      await ctx.prisma.emailLog.create({
        data: {
          storeId: input.storeId,
          templateName: 'team_invitation',
          to: storeUser.invitationEmail!,
          from: 'noreply@foxcard.app',
          subject: `Reminder: You've been invited to join ${storeUser.store.name}`,
          htmlBody: `
            <h2>Team Invitation Reminder</h2>
            <p>This is a reminder that you've been invited to join <strong>${storeUser.store.name}</strong> as a ${storeUser.role.name}.</p>
            <p>Click the link below to accept the invitation:</p>
            <a href="${process.env.NEXTAUTH_URL}/invite/accept?token=${invitationToken}" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px;">Accept Invitation</a>
            <p>This invitation expires in 7 days.</p>
          `,
          textBody: `
            Team Invitation Reminder

            This is a reminder that you've been invited to join ${storeUser.store.name} as a ${storeUser.role.name}.

            Accept the invitation: ${process.env.NEXTAUTH_URL}/invite/accept?token=${invitationToken}

            This invitation expires in 7 days.
          `,
          status: 'PENDING',
        },
      })

      return { success: true, message: 'Invitation resent' }
    }),
})
