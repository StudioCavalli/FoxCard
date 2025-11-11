/**
 * Script de détection automatique de la base de données
 * Détecte si c'est MongoDB ou PostgreSQL depuis DATABASE_URL
 * et copie le bon schéma Prisma
 */

const fs = require('fs')
const path = require('path')

// Lire DATABASE_URL depuis .env
function getDatabaseUrl() {
  const envPath = path.join(__dirname, '..', '.env')

  if (!fs.existsSync(envPath)) {
    console.error('❌ Fichier .env introuvable')
    console.log('ℹ️  Utilisez l\'installeur web à /install pour configurer votre base de données')
    process.exit(1)
  }

  const envContent = fs.readFileSync(envPath, 'utf-8')
  const match = envContent.match(/DATABASE_URL="?([^"\n]+)"?/)

  if (!match) {
    console.error('❌ DATABASE_URL non trouvée dans .env')
    process.exit(1)
  }

  return match[1]
}

// Détecter le type de base de données depuis l'URL
function detectDatabaseType(url) {
  if (url.startsWith('mongodb://') || url.startsWith('mongodb+srv://')) {
    return 'mongodb'
  } else if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
    return 'postgresql'
  } else {
    console.error('❌ Type de base de données non supporté')
    console.log('ℹ️  Seuls MongoDB et PostgreSQL sont supportés')
    process.exit(1)
  }
}

// Copier le bon schéma Prisma
function copySchema(dbType) {
  const prismaDir = path.join(__dirname, '..', 'prisma')
  const sourceSchema = dbType === 'mongodb'
    ? path.join(prismaDir, 'schema.prisma')  // Le schéma MongoDB original
    : path.join(prismaDir, 'schema-postgresql.prisma')

  const targetSchema = path.join(prismaDir, 'schema-active.prisma')

  if (!fs.existsSync(sourceSchema)) {
    console.error(`❌ Schéma source introuvable: ${sourceSchema}`)
    process.exit(1)
  }

  // Copier le schéma
  const content = fs.readFileSync(sourceSchema, 'utf-8')
  fs.writeFileSync(targetSchema, content, 'utf-8')

  // Mettre à jour package.json pour pointer vers le bon schéma
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')
  )

  // Mettre à jour les scripts pour utiliser schema-active.prisma
  packageJson.scripts['db:generate'] = 'prisma generate --schema=prisma/schema-active.prisma'
  packageJson.scripts['db:push'] = 'prisma db push --schema=prisma/schema-active.prisma'
  packageJson.scripts['db:studio'] = 'prisma studio --schema=prisma/schema-active.prisma'
  packageJson.scripts['postinstall'] = 'node scripts/detect-database.js && prisma generate --schema=prisma/schema-active.prisma'

  fs.writeFileSync(
    path.join(__dirname, '..', 'package.json'),
    JSON.stringify(packageJson, null, 2) + '\n',
    'utf-8'
  )

  console.log(`✅ Schéma ${dbType.toUpperCase()} activé`)
  console.log(`📄 Fichier actif: prisma/schema-active.prisma`)
}

// Main
try {
  const databaseUrl = getDatabaseUrl()
  const dbType = detectDatabaseType(databaseUrl)

  console.log(`🔍 Base de données détectée: ${dbType.toUpperCase()}`)
  copySchema(dbType)
} catch (error) {
  console.error('❌ Erreur:', error.message)
  process.exit(1)
}
