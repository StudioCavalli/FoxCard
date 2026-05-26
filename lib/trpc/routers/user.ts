import { router, publicProcedure, protectedProcedure } from '../trpc'
import { z } from 'zod'
import * as bcrypt from 'bcryptjs'
import { TRPCError } from '@trpc/server'
import { isRegistrationAllowed, getMaxStoresPerUser } from '@/lib/platform/settings'

export const userRouter = router({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
        email: z.string().email('Email invalide'),
        password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, email, password } = input

      // Check if registration is allowed by platform settings
      const registrationAllowed = await isRegistrationAllowed()
      if (!registrationAllowed) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Les inscriptions sont temporairement desactivees. Veuillez reessayer plus tard.',
        })
      }

      // Check if user already exists
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Un utilisateur avec cet email existe déjà',
        })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user
      const user = await ctx.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'USER',
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      })

      return {
        success: true,
        user,
      }
    }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
    })

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Utilisateur non trouvé',
      })
    }

    return user
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).optional(),
        image: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: input,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      })

      return user
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Utilisateur non trouvé',
        })
      }

      // Verify current password
      const isValid = await bcrypt.compare(input.currentPassword, user.password)
      if (!isValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Mot de passe actuel incorrect',
        })
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(input.newPassword, 10)

      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { password: hashedPassword },
      })

      return { success: true }
    }),
})
