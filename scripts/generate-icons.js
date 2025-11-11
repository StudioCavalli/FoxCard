#!/usr/bin/env node

/**
 * Script pour générer les icônes PWA à partir d'un SVG
 * Nécessite sharp: npm install --save-dev sharp
 */

const fs = require('fs')
const path = require('path')

// Vérifier si sharp est disponible
let sharp
try {
  sharp = require('sharp')
} catch (err) {
  console.error('⚠️  Sharp n\'est pas installé. Installation...')
  console.error('   Exécutez: npm install --save-dev sharp')
  process.exit(1)
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const publicDir = path.join(__dirname, '..', 'public')
const svgPath = path.join(publicDir, 'icon.svg')

async function generateIcons() {
  console.log('🦊 Génération des icônes PWA FoxCard...\n')

  if (!fs.existsSync(svgPath)) {
    console.error('❌ icon.svg introuvable dans /public')
    process.exit(1)
  }

  const svgBuffer = fs.readFileSync(svgPath)

  for (const size of sizes) {
    const outputPath = path.join(publicDir, `icon-${size}x${size}.png`)

    try {
      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath)

      console.log(`✅ Créé: icon-${size}x${size}.png`)
    } catch (error) {
      console.error(`❌ Erreur pour icon-${size}x${size}.png:`, error.message)
    }
  }

  console.log('\n✨ Génération terminée!')
  console.log('📁 Les icônes sont dans /public')
}

generateIcons().catch(console.error)
