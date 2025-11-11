import { router, publicProcedure } from '../trpc'
import { z } from 'zod'
import * as bcrypt from 'bcryptjs'
import { TRPCError } from '@trpc/server'

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

  getProfile: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.email) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Vous devez être connecté',
      })
    }

    const user = await ctx.prisma.user.findUnique({
      where: { email: ctx.session.user.email },
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

  updateProfile: publicProcedure
    .input(
      z.object({
        name: z.string().min(2).optional(),
        image: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.email) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Vous devez être connecté',
        })
      }

      const user = await ctx.prisma.user.update({
        where: { email: ctx.session.user.email },
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

  changePassword: publicProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.email) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Vous devez être connecté',
        })
      }

      const user = await ctx.prisma.user.findUnique({
        where: { email: ctx.session.user.email },
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
        where: { email: ctx.session.user.email },
        data: { password: hashedPassword },
      })

      return { success: true }
    }),
})
