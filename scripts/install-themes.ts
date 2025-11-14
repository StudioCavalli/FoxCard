import { PrismaClient } from '@prisma/client'
import { seedSystemThemes } from '../lib/themes/seed.js'

const prisma = new PrismaClient()

async function main() {
  const storeId = '000000000000000000000001'

  console.log('🎨 Installation des thèmes système...')

  const themes = await seedSystemThemes(storeId, prisma)

  console.log(`\n✅ ${themes.length} thème(s) installé(s):`)
  themes.forEach((theme) => {
    console.log(`   - ${theme.name}`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
