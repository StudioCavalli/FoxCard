# Configuration Vercel

## Étape 1: Configurer MongoDB Atlas

### Autoriser les connexions Vercel

1. Va sur [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. Sélectionne ton cluster → **Network Access**
3. Clique sur **Add IP Address**
4. Sélectionne **Allow Access from Anywhere** (0.0.0.0/0)
   - ⚠️ En production, tu peux restreindre aux IPs Vercel: https://vercel.com/docs/deployments/ip-addresses
5. Clique sur **Confirm**

## Étape 2: Variables d'environnement Vercel

Va sur ton projet Vercel → **Settings** → **Environment Variables**

### Variables OBLIGATOIRES

```bash
# Database
DATABASE_URL=mongodb+srv://foxcard:EBCKV3oTxVXdM3LA@foxcard.o2tmmub.mongodb.net/foxcard?retryWrites=true&w=majority&appName=FoxCard&maxPoolSize=10&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000

# NextAuth
NEXTAUTH_URL=https://ton-domaine.vercel.app
NEXTAUTH_SECRET=<générer avec: openssl rand -base64 32>

# App
NEXT_PUBLIC_APP_URL=https://ton-domaine.vercel.app
```

### Variables OPTIONNELLES

```bash
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# PayPal
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_MODE=sandbox

# SMTP / Email
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=noreply@foxcard.com
SMTP_FROM_NAME=FoxCard

# Redis (optionnel - pour BullMQ)
REDIS_URL=
```

## Étape 3: Redéployer

Une fois les variables ajoutées:
1. Va dans **Deployments**
2. Clique sur **Redeploy** sur le dernier déploiement
3. Coche **Use existing Build Cache**
4. Clique sur **Redeploy**

## Troubleshooting

### Erreur "Server selection timeout"

Si tu vois encore cette erreur:
1. Vérifie que 0.0.0.0/0 est bien dans Network Access
2. Vérifie que ta DATABASE_URL contient bien les paramètres:
   - `maxPoolSize=10`
   - `serverSelectionTimeoutMS=5000`
   - `connectTimeoutMS=10000`
3. Attends 2-3 minutes que MongoDB Atlas applique les changements

### Génér un NEXTAUTH_SECRET sécurisé

```bash
openssl rand -base64 32
```

Copie le résultat et colle-le dans NEXTAUTH_SECRET sur Vercel.
