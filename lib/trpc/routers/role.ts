import { z } from 'zod'
import { router, protectedProcedure, requirePermission, requirePermissions } from '../trpc'
import { TRPCError } from '@trpc/server'
import { PERMISSIONS } from '@/lib/rbac/roles'
import { seedSystemRoles, getUserPermissions } from '@/lib/rbac/seed'
import crypto from 'crypto'
import { emailService } from '@/lib/email/service'

export const roleRouter = router({
  // List all roles for a store
  list: requirePermission(PERMISSIONS.ROLES_VIEW)
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
    const roles = await ctx.prisma.role.findMany({
      where: { storeId: input.storeId },
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: [{ isSystem: 'desc' }, { createdAt: 'asc' }],
    })

    return roles
  }),

  // Get a specific role
  get: requirePermission(PERMISSIONS.ROLES_VIEW)
    .input(
      z.object({
        storeId: z.string(),
        roleId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const role = await ctx.prisma.role.findFirst({
        where: {
          id: input.roleId,
          storeId: input.storeId,
        },
        include: {
          users: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
      })

      if (!role) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Role not found',
        })
      }

      return role
    }),

  // Create a new role
  create: requirePermission(PERMISSIONS.ROLES_CREATE)
    .input(
      z.object({
        storeId: z.string(),
        name: z.string().min(1).max(50),
        description: z.string().optional(),
        permissions: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if role name already exists
      const existingRole = await ctx.prisma.role.findUnique({
        where: {
          storeId_name: {
            storeId: input.storeId,
            name: input.name,
          },
        },
      })

      if (existingRole) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A role with this name already exists',
        })
      }

      const role = await ctx.prisma.role.create({
        data: {
          storeId: input.storeId,
          name: input.name,
          description: input.description,
          permissions: input.permissions,
          isSystem: false,
        },
      })

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          storeId: input.storeId,
          userId: ctx.session.user.id,
          ipAddress: ctx.ipAddress,
          userAgent: ctx.userAgent,
          action: 'role.create',
          entity: 'Role',
          entityId: role.id,
          roleId: role.id,
          metadata: {
            roleName: role.name,
            permissions: role.permissions,
          },
          success: true,
        },
      })

      return role
    }),

  // Update a role
  update: requirePermission(PERMISSIONS.ROLES_UPDATE)
    .input(
      z.object({
        storeId: z.string(),
        roleId: z.string(),
        name: z.string().min(1).max(50).optional(),
        description: z.string().optional(),
        permissions: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

      // Cannot modify system roles
      if (role.isSystem) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot modify system roles',
        })
      }

      // If changing name, check for conflicts
      if (input.name && input.name !== role.name) {
        const existingRole = await ctx.prisma.role.findUnique({
          where: {
            storeId_name: {
              storeId: input.storeId,
              name: input.name,
            },
          },
        })

        if (existingRole) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A role with this name already exists',
          })
        }
      }

      const updatedRole = await ctx.prisma.role.update({
        where: { id: input.roleId },
        data: {
          name: input.name,
          description: input.description,
          permissions: input.permissions,
        },
      })

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          storeId: input.storeId,
          userId: ctx.session.user.id,
          ipAddress: ctx.ipAddress,
          userAgent: ctx.userAgent,
          action: 'role.update',
          entity: 'Role',
          entityId: updatedRole.id,
          roleId: updatedRole.id,
          metadata: {
            before: role,
            after: updatedRole,
          },
          success: true,
        },
      })

      return updatedRole
    }),

  // Delete a role
  delete: requirePermission(PERMISSIONS.ROLES_DELETE)
    .input(
      z.object({
        storeId: z.string(),
        roleId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const role = await ctx.prisma.role.findFirst({
        where: {
          id: input.roleId,
          storeId: input.storeId,
        },
        include: {
          _count: {
            select: { users: true },
          },
        },
      })

      if (!role) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Role not found',
        })
      }

      // Cannot delete system roles
      if (role.isSystem) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot delete system roles',
        })
      }

      // Cannot delete role if users are assigned to it
      if (role._count.users > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `Cannot delete role. ${role._count.users} user(s) are assigned to this role.`,
        })
      }

      await ctx.prisma.role.delete({
        where: { id: input.roleId },
      })

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          storeId: input.storeId,
          userId: ctx.session.user.id,
          ipAddress: ctx.ipAddress,
          userAgent: ctx.userAgent,
          action: 'role.delete',
          entity: 'Role',
          entityId: role.id,
          metadata: {
            roleName: role.name,
            permissions: role.permissions,
          },
          success: true,
        },
      })

      return { success: true }
    }),

  // Seed system roles (useful for setup)
  seedSystemRoles: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is store owner
      const store = await ctx.prisma.store.findUnique({
        where: { id: input.storeId },
      })

      if (!store) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Store not found',
        })
      }

      if (store.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only store owner can seed system roles',
        })
      }

      const roles = await seedSystemRoles(input.storeId, ctx.prisma)

      return {
        success: true,
        count: roles.length,
        roles,
      }
    }),

  // Get current user's permissions for a store
  getMyPermissions: protectedProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const permissions = await getUserPermissions(
        ctx.session.user.id,
        input.storeId,
        ctx.prisma
      )

      const storeUser = await ctx.prisma.storeUser.findUnique({
        where: {
          userId_storeId: {
            userId: ctx.session.user.id,
            storeId: input.storeId,
          },
        },
        include: {
          role: true,
        },
      })

      return {
        permissions,
        role: storeUser?.role,
        status: storeUser?.status,
      }
    }),

  // Assign role to a user
  assignRole: requirePermission(PERMISSIONS.USERS_UPDATE)
    .input(
      z.object({
        storeId: z.string(),
        userId: z.string(),
        roleId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify role exists and belongs to the store
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

      // Check if user exists
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      // Update or create StoreUser
      const storeUser = await ctx.prisma.storeUser.upsert({
        where: {
          userId_storeId: {
            userId: input.userId,
            storeId: input.storeId,
          },
        },
        create: {
          userId: input.userId,
          storeId: input.storeId,
          roleId: input.roleId,
          invitedBy: ctx.session.user.id,
          status: 'ACTIVE',
          acceptedAt: new Date(),
        },
        update: {
          roleId: input.roleId,
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
          role: true,
        },
      })

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          storeId: input.storeId,
          userId: ctx.session.user.id,
          ipAddress: ctx.ipAddress,
          userAgent: ctx.userAgent,
          action: 'user.assign_role',
          entity: 'StoreUser',
          entityId: storeUser.id,
          roleId: input.roleId,
          metadata: {
            targetUserId: input.userId,
            targetUserEmail: user.email,
            roleName: role.name,
          },
          success: true,
        },
      })

      return storeUser
    }),

  // Get users with their roles for a store
  getStoreUsers: requirePermission(PERMISSIONS.USERS_VIEW)
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const storeUsers = await ctx.prisma.storeUser.findMany({
        where: {
          storeId: input.storeId,
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
          role: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      })

      return storeUsers
    }),

  // Suspend a user
  suspendUser: requirePermission(PERMISSIONS.USERS_UPDATE)
    .input(
      z.object({
        storeId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user exists in store
      const storeUser = await ctx.prisma.storeUser.findUnique({
        where: {
          userId_storeId: {
            userId: input.userId,
            storeId: input.storeId,
          },
        },
        include: {
          user: true,
          role: true,
        },
      })

      if (!storeUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found in this store',
        })
      }

      // Cannot suspend store owner
      const store = await ctx.prisma.store.findUnique({
        where: { id: input.storeId },
      })

      if (store?.ownerId === input.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot suspend store owner',
        })
      }

      // Update status
      const updatedStoreUser = await ctx.prisma.storeUser.update({
        where: { id: storeUser.id },
        data: { status: 'SUSPENDED' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          role: true,
        },
      })

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          storeId: input.storeId,
          userId: ctx.session.user.id,
          ipAddress: ctx.ipAddress,
          userAgent: ctx.userAgent,
          action: 'user.suspend',
          entity: 'StoreUser',
          entityId: storeUser.id,
          metadata: {
            targetUserId: input.userId,
            targetUserEmail: storeUser.user.email,
            targetUserName: storeUser.user.name,
          },
          success: true,
        },
      })

      return updatedStoreUser
    }),

  // Reactivate a user
  reactivateUser: requirePermission(PERMISSIONS.USERS_UPDATE)
    .input(
      z.object({
        storeId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user exists in store
      const storeUser = await ctx.prisma.storeUser.findUnique({
        where: {
          userId_storeId: {
            userId: input.userId,
            storeId: input.storeId,
          },
        },
        include: {
          user: true,
        },
      })

      if (!storeUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found in this store',
        })
      }

      // Update status
      const updatedStoreUser = await ctx.prisma.storeUser.update({
        where: { id: storeUser.id },
        data: { status: 'ACTIVE' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          role: true,
        },
      })

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          storeId: input.storeId,
          userId: ctx.session.user.id,
          ipAddress: ctx.ipAddress,
          userAgent: ctx.userAgent,
          action: 'user.reactivate',
          entity: 'StoreUser',
          entityId: storeUser.id,
          metadata: {
            targetUserId: input.userId,
            targetUserEmail: storeUser.user.email,
            targetUserName: storeUser.user.name,
          },
          success: true,
        },
      })

      return updatedStoreUser
    }),

  // Remove a user from the store
  removeUser: requirePermission(PERMISSIONS.USERS_DELETE)
    .input(
      z.object({
        storeId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user exists in store
      const storeUser = await ctx.prisma.storeUser.findUnique({
        where: {
          userId_storeId: {
            userId: input.userId,
            storeId: input.storeId,
          },
        },
        include: {
          user: true,
          role: true,
        },
      })

      if (!storeUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found in this store',
        })
      }

      // Cannot remove store owner
      const store = await ctx.prisma.store.findUnique({
        where: { id: input.storeId },
      })

      if (store?.ownerId === input.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot remove store owner',
        })
      }

      // Create audit log before deletion
      await ctx.prisma.auditLog.create({
        data: {
          storeId: input.storeId,
          userId: ctx.session.user.id,
          ipAddress: ctx.ipAddress,
          userAgent: ctx.userAgent,
          action: 'user.remove',
          entity: 'StoreUser',
          entityId: storeUser.id,
          metadata: {
            targetUserId: input.userId,
            targetUserEmail: storeUser.user.email,
            targetUserName: storeUser.user.name,
            roleName: storeUser.role?.name,
          },
          success: true,
        },
      })

      // Delete the StoreUser
      await ctx.prisma.storeUser.delete({
        where: { id: storeUser.id },
      })

      return { success: true }
    }),

  // Invite a user to the store
  inviteUser: requirePermission(PERMISSIONS.USERS_INVITE)
    .input(
      z.object({
        storeId: z.string(),
        email: z.string().email(),
        roleId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if role exists
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

      // Get store info
      const store = await ctx.prisma.store.findUnique({
        where: { id: input.storeId },
      })

      if (!store) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Store not found',
        })
      }

      // Check if user exists
      let user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      })

      // If user doesn't exist, we'll create a placeholder
      // They'll complete registration when accepting the invitation
      if (!user) {
        // For now, create a user with minimal info
        // They'll update their profile upon first login
        const tempPassword = crypto.randomBytes(32).toString('hex')
        user = await ctx.prisma.user.create({
          data: {
            email: input.email,
            password: tempPassword, // Will be reset on first login
            name: input.email.split('@')[0], // Temporary name
          },
        })
      }

      // Check if user is already in this store
      const existingStoreUser = await ctx.prisma.storeUser.findUnique({
        where: {
          userId_storeId: {
            userId: user.id,
            storeId: input.storeId,
          },
        },
      })

      if (existingStoreUser) {
        if (existingStoreUser.status === 'ACTIVE') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'User is already active in this store',
          })
        }
        // If PENDING, we can resend invitation
        // Update the role if changed
        await ctx.prisma.storeUser.update({
          where: { id: existingStoreUser.id },
          data: {
            roleId: input.roleId,
            invitedBy: ctx.session.user.id,
            invitedAt: new Date(),
          },
        })
      } else {
        // Create new StoreUser with PENDING status
        await ctx.prisma.storeUser.create({
          data: {
            userId: user.id,
            storeId: input.storeId,
            roleId: input.roleId,
            invitedBy: ctx.session.user.id,
            status: 'PENDING',
          },
        })
      }

      // Get the latest StoreUser record
      const storeUser = await ctx.prisma.storeUser.findUnique({
        where: {
          userId_storeId: {
            userId: user.id,
            storeId: input.storeId,
          },
        },
      })

      if (!storeUser) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create invitation',
        })
      }

      // Generate invitation URL using StoreUser ID as token
      const invitationToken = Buffer.from(storeUser.id).toString('base64url')
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const invitationUrl = `${appUrl}/accept-invitation?token=${invitationToken}`

      // Send invitation email
      try {
        await emailService.sendEmail({
          to: input.email,
          subject: `Invitation à rejoindre ${store.name}`,
          template: 'UserInvitation',
          props: {
            inviterName: ctx.session.user.name || ctx.session.user.email,
            inviterEmail: ctx.session.user.email!,
            storeName: store.name,
            roleName: role.name,
            invitationUrl,
            expiresInDays: 7,
          },
          storeId: input.storeId,
          trackingEnabled: false,
        })
      } catch (error) {
        console.error('Failed to send invitation email:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send invitation email',
        })
      }

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          storeId: input.storeId,
          userId: ctx.session.user.id,
          ipAddress: ctx.ipAddress,
          userAgent: ctx.userAgent,
          action: 'user.invite',
          entity: 'StoreUser',
          entityId: storeUser.id,
          metadata: {
            targetEmail: input.email,
            roleName: role.name,
          },
          success: true,
        },
      })

      return {
        success: true,
        message: 'Invitation sent successfully',
      }
    }),

  // Accept invitation
  acceptInvitation: protectedProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Decode token to get StoreUser ID
      let storeUserId: string
      try {
        storeUserId = Buffer.from(input.token, 'base64url').toString('utf-8')
      } catch {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid invitation token',
        })
      }

      // Find the StoreUser
      const storeUser = await ctx.prisma.storeUser.findUnique({
        where: { id: storeUserId },
        include: {
          store: true,
          role: true,
        },
      })

      if (!storeUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invitation not found',
        })
      }

      // Check if invitation is still pending
      if (storeUser.status !== 'PENDING') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invitation has already been accepted or is no longer valid',
        })
      }

      // Check if user matches
      if (storeUser.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This invitation is not for you',
        })
      }

      // Check if invitation has expired (7 days)
      const expirationDate = new Date(storeUser.invitedAt)
      expirationDate.setDate(expirationDate.getDate() + 7)
      if (new Date() > expirationDate) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This invitation has expired',
        })
      }

      // Accept the invitation
      const updatedStoreUser = await ctx.prisma.storeUser.update({
        where: { id: storeUser.id },
        data: {
          status: 'ACTIVE',
          acceptedAt: new Date(),
        },
        include: {
          store: true,
          role: true,
        },
      })

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          storeId: storeUser.storeId,
          userId: ctx.session.user.id,
          ipAddress: ctx.ipAddress,
          userAgent: ctx.userAgent,
          action: 'user.accept_invitation',
          entity: 'StoreUser',
          entityId: storeUser.id,
          metadata: {
            storeName: storeUser.store.name,
            roleName: storeUser.role.name,
          },
          success: true,
        },
      })

      return {
        success: true,
        store: updatedStoreUser.store,
        role: updatedStoreUser.role,
      }
    }),
})
