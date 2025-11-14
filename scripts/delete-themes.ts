import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const storeId = '000000000000000000000001'

  console.log('🗑️  Suppression des thèmes...')

  // Supprimer tous les thèmes du store
  const result = await prisma.theme.deleteMany({
    where: {
      storeId,
    },
  })

  console.log(`✅ ${result.count} thème(s) supprimé(s)`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
