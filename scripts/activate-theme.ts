import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const storeId = '000000000000000000000001'
  const themeName = process.argv[2] || 'Minimal'

  console.log(`🎨 Activation du thème "${themeName}"...`)

  // Désactiver tous les thèmes
  await prisma.theme.updateMany({
    where: { storeId },
    data: { isActive: false },
  })

  // Activer le thème choisi
  const theme = await prisma.theme.updateMany({
    where: {
      storeId,
      name: themeName,
    },
    data: { isActive: true },
  })

  if (theme.count === 0) {
    console.log(`❌ Thème "${themeName}" non trouvé`)
    process.exit(1)
  }

  console.log(`✅ Thème "${themeName}" activé!`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
