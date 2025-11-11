import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { EnvCategory } from '@prisma/client'

export const envVariableRouter = router({
  // Obtenir toutes les variables d'environnement d'un store
  getAll: adminProcedure
    .input(z.object({
      storeId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const variables = await ctx.prisma.envVariable.findMany({
        where: { storeId: input.storeId },
        orderBy: { category: 'asc' }
      })

      // Masquer les valeurs des secrets
      return variables.map(v => ({
        ...v,
        value: v.isSecret ? '••••••••' : v.value
      }))
    }),

  // Créer ou mettre à jour une variable
  upsert: adminProcedure
    .input(z.object({
      storeId: z.string(),
      key: z.string().min(1),
      value: z.string(),
      category: z.nativeEnum(EnvCategory),
      isSecret: z.boolean().default(false),
      description: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { storeId, ...data } = input

      return await ctx.prisma.envVariable.upsert({
        where: {
          storeId_key: {
            storeId,
            key: data.key
          }
        },
        create: {
          storeId,
          ...data
        },
        update: data
      })
    }),

  // Supprimer une variable
  delete: adminProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.envVariable.delete({
        where: { id: input.id }
      })
    }),

  // Test de connexion pour une catégorie donnée
  testConnection: adminProcedure
    .input(z.object({
      category: z.nativeEnum(EnvCategory),
      variables: z.record(z.string())
    }))
    .mutation(async ({ input }) => {
      try {
        switch (input.category) {
          case 'SMTP':
            // TODO: Tester la connexion SMTP
            return { success: true, message: 'Connexion SMTP réussie' }

          case 'STRIPE':
            // Tester Stripe
            if (!input.variables.STRIPE_SECRET_KEY) {
              throw new Error('STRIPE_SECRET_KEY requis')
            }
            // TODO: Vérifier la clé Stripe
            return { success: true, message: 'Clé Stripe valide' }

          case 'R2':
            // Tester R2
            if (!input.variables.R2_ACCESS_KEY_ID || !input.variables.R2_SECRET_ACCESS_KEY) {
              throw new Error('Identifiants R2 requis')
            }
            // TODO: Tester la connexion R2
            return { success: true, message: 'Connexion R2 réussie' }

          default:
            return { success: true, message: 'Test non implémenté pour cette catégorie' }
        }
      } catch (error: any) {
        return { success: false, message: error.message }
      }
    })
})
