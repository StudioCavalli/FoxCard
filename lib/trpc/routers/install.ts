import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'
import fs from 'fs'
import path from 'path'
import { TRPCError } from '@trpc/server'
import { prisma } from '@/lib/prisma'

// Détecte si l'installation est complète (checks database for existing admin)
async function isInstalled(): Promise<boolean> {
  try {
    // Primary check: does a SUPER_ADMIN user exist in the database?
    const superAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
      select: { id: true },
    })
    if (superAdmin) {
      return true
    }

    // Fallback: check if PlatformSettings exist
    const settings = await prisma.platformSettings.findFirst({
      select: { id: true },
    })
    if (settings) {
      return true
    }
  } catch {
    // Database may not be reachable yet during initial install - fall through to .env check
  }

  // Secondary check: does .env exist with required keys?
  const envPath = path.join(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) {
    return false
  }

  const envContent = fs.readFileSync(envPath, 'utf-8')
  const hasDbUrl = envContent.includes('DATABASE_URL=')
  const hasNextAuthSecret = envContent.includes('NEXTAUTH_SECRET=')

  return hasDbUrl && hasNextAuthSecret
}

// Enforce that the platform is NOT already installed (throws FORBIDDEN if it is)
async function enforceNotInstalled(): Promise<void> {
  const installed = await isInstalled()
  if (installed) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Platform already installed',
    })
  }
}

// Test de connexion à la base de données
async function testDbConnection(url: string): Promise<{ success: boolean; error?: string }> {
  try {
    const testPrisma = new PrismaClient({
      datasources: {
        db: {
          url
        }
      }
    })

    // Tester la connexion
    await testPrisma.$connect()
    await testPrisma.$disconnect()

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Impossible de se connecter à la base de données'
    }
  }
}

// Génère un secret aléatoire
function generateSecret(length: number = 32): string {
  return randomBytes(length).toString('hex')
}

export const installRouter = router({
  // Vérifier si l'installation est déjà faite
  checkInstallation: publicProcedure
    .query(async () => {
      const installed = await isInstalled()
      return { installed }
    }),

  // Vérifier les prérequis système
  checkPrerequisites: publicProcedure
    .query(async () => {
      const nodeVersion = process.version
      const nodeMajorVersion = parseInt(nodeVersion.slice(1).split('.')[0])

      return {
        node: {
          version: nodeVersion,
          compatible: nodeMajorVersion >= 18,
          required: '18.x ou supérieur'
        },
        os: {
          platform: process.platform,
          arch: process.arch
        }
      }
    }),

  // Tester la connexion à la base de données
  testDatabase: publicProcedure
    .input(z.object({
      databaseUrl: z.string().min(1, 'L\'URL de la base de données est requise')
    }))
    .mutation(async ({ input }) => {
      // Block if already installed
      await enforceNotInstalled()

      return await testDbConnection(input.databaseUrl)
    }),

  // Configurer l'installation et créer le fichier .env
  install: publicProcedure
    .input(z.object({
      databaseUrl: z.string().min(1),
      nextAuthUrl: z.string().url(),
      nextAuthSecret: z.string().optional(),
      stripeSecretKey: z.string().optional(),
      stripePublishableKey: z.string().optional(),
      stripeWebhookSecret: z.string().optional(),
      r2AccountId: z.string().optional(),
      r2AccessKeyId: z.string().optional(),
      r2SecretAccessKey: z.string().optional(),
      r2BucketName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Block if already installed
        await enforceNotInstalled()

        // Tester la connexion DB
        const dbTest = await testDbConnection(input.databaseUrl)
        if (!dbTest.success) {
          throw new Error(`Erreur de connexion à la base de données: ${dbTest.error}`)
        }

        // Générer NEXTAUTH_SECRET si non fourni
        const nextAuthSecret = input.nextAuthSecret || generateSecret()

        // Créer le contenu du fichier .env
        const envContent = `# Base de données
DATABASE_URL="${input.databaseUrl}"

# NextAuth
NEXTAUTH_URL="${input.nextAuthUrl}"
NEXTAUTH_SECRET="${nextAuthSecret}"

${input.stripeSecretKey ? `# Stripe
STRIPE_SECRET_KEY="${input.stripeSecretKey}"
STRIPE_PUBLISHABLE_KEY="${input.stripePublishableKey || ''}"
STRIPE_WEBHOOK_SECRET="${input.stripeWebhookSecret || ''}"
` : ''}
${input.r2AccountId ? `# Cloudflare R2
R2_ACCOUNT_ID="${input.r2AccountId}"
R2_ACCESS_KEY_ID="${input.r2AccessKeyId}"
R2_SECRET_ACCESS_KEY="${input.r2SecretAccessKey}"
R2_BUCKET_NAME="${input.r2BucketName}"
R2_PUBLIC_URL="https://${input.r2BucketName}.${input.r2AccountId}.r2.cloudflarestorage.com"
` : ''}
# GoldenEra Marketplace
NODE_ENV="production"
`

        // Écrire le fichier .env
        const envPath = path.join(process.cwd(), '.env')
        fs.writeFileSync(envPath, envContent, 'utf-8')

        // Initialiser Prisma using programmatic API instead of execSync
        try {
          const installPrisma = new PrismaClient({
            datasources: {
              db: { url: input.databaseUrl },
            },
          })
          await installPrisma.$connect()
          await installPrisma.$disconnect()
          // Note: Schema push should be handled via a migration script or deployment step,
          // not via execSync in a web request handler.
          console.log('[Install] Database connection verified. Run `npx prisma db push` to initialize the schema.')
        } catch (error) {
          console.error('Erreur lors de l\'initialisation de Prisma:', error)
        }

        return {
          success: true,
          message: 'Installation terminée avec succès !',
        }
      } catch (error: any) {
        throw new Error(error.message || 'Erreur lors de l\'installation')
      }
    }),
})
