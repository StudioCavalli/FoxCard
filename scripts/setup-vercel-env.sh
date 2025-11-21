#!/bin/bash

# Script pour ajouter toutes les variables d'environnement sur Vercel
# Usage: ./scripts/setup-vercel-env.sh

echo "🔧 Configuration des variables d'environnement Vercel"
echo ""

# Vérifier que Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé"
    echo "👉 Installe-le avec: npm i -g vercel"
    exit 1
fi

echo "📝 Configuration des variables OBLIGATOIRES..."
echo ""

# DATABASE_URL
echo "➡️  DATABASE_URL"
vercel env add DATABASE_URL production preview development

# NEXTAUTH_URL (seulement production)
echo ""
echo "➡️  NEXTAUTH_URL"
echo "⚠️  Entre l'URL de production (ex: https://foxcard.vercel.app)"
vercel env add NEXTAUTH_URL production

# NEXTAUTH_SECRET
echo ""
echo "➡️  NEXTAUTH_SECRET"
echo "💡 Génère un secret avec: openssl rand -base64 32"
vercel env add NEXTAUTH_SECRET production preview development

# NEXT_PUBLIC_APP_URL
echo ""
echo "➡️  NEXT_PUBLIC_APP_URL"
vercel env add NEXT_PUBLIC_APP_URL production preview development

echo ""
echo "✅ Variables obligatoires configurées!"
echo ""
echo "📋 Variables optionnelles (appuie sur Ctrl+C pour arrêter):"
read -p "Veux-tu configurer Stripe ? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
    vercel env add STRIPE_SECRET_KEY production
    vercel env add STRIPE_WEBHOOK_SECRET production
fi

read -p "Veux-tu configurer SMTP ? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel env add SMTP_HOST production
    vercel env add SMTP_PORT production
    vercel env add SMTP_USER production
    vercel env add SMTP_PASSWORD production
    vercel env add SMTP_FROM_EMAIL production
    vercel env add SMTP_FROM_NAME production
fi

echo ""
echo "🎉 Configuration terminée!"
echo "👉 Lance un redéploiement avec: vercel --prod"
