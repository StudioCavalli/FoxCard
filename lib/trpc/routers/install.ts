import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'
import fs from 'fs'
import path from 'path'

// Détecte si l'installation est complète
async function isInstalled(): Promise<boolean> {
  const envPath = path.join(process.cwd(), '.env')

  // Vérifier si .env existe
  if (!fs.existsSync(envPath)) {
    return false
  }

  // Vérifier si DATABASE_URL et NEXTAUTH_SECRET existent dans .env
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const hasDbUrl = envContent.includes('DATABASE_URL=')
  const hasNextAuthSecret = envContent.includes('NEXTAUTH_SECRET=')

  return hasDbUrl && hasNextAuthSecret
}

// Test de connexion à la base de données
async function testDbConnection(url: string): Promise<{ success: boolean; error?: string }> {
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url
        }
      }
    })

    // Tester la connexion
    await prisma.$connect()
    await prisma.$disconnect()

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
        // Vérifier si déjà installé
        const installed = await isInstalled()
        if (installed) {
          throw new Error('GoldenEra est déjà installé')
        }

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
# GoldenEra
NODE_ENV="production"
`

        // Écrire le fichier .env
        const envPath = path.join(process.cwd(), '.env')
        fs.writeFileSync(envPath, envContent, 'utf-8')

        // Initialiser Prisma (générer le client et push le schéma)
        const { execSync } = require('child_process')
        try {
          execSync('npx prisma generate', { stdio: 'inherit' })
          execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' })
        } catch (error) {
          console.error('Erreur lors de l\'initialisation de Prisma:', error)
        }

        return {
          success: true,
          message: 'Installation terminée avec succès !',
          nextAuthSecret: nextAuthSecret
        }
      } catch (error: any) {
        throw new Error(error.message || 'Erreur lors de l\'installation')
      }
    }),
})
