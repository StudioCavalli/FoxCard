# 🦊 Guide d'Installation FoxCard

Installation de FoxCard en moins de 5 minutes grâce à l'installeur web intégré.

## 🚀 Installation Rapide (Recommandé)

### Prérequis
- **Node.js** 18.x ou supérieur
- **MongoDB** ou **PostgreSQL** (base de données)
- **npm** ou **yarn**

### Étapes

1. **Cloner le projet**
```bash
git clone https://github.com/StudioCavalli/FoxCard.git
cd FoxCard
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Lancer le serveur de développement**
```bash
npm run dev
```

4. **Accéder à l'installeur**
Ouvrez votre navigateur et allez sur :
```
http://localhost:3000/install
```

5. **Suivre les étapes du wizard**
L'installeur vous guidera à travers :
- ✅ Vérification des prérequis système
- 🗄️ Configuration de la base de données
- ⚙️ Configuration optionnelle (Stripe, R2)
- ✨ Finalisation de l'installation

6. **C'est terminé !**
Votre boutique FoxCard est maintenant prête à l'emploi !

---

## 📦 Bases de Données Supportées

### MongoDB (Recommandé pour démarrer rapidement)

**MongoDB Atlas (Gratuit)**
1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit
3. Récupérez votre connection string :
   ```
   mongodb+srv://username:password@cluster.mongodb.net/foxcard
   ```

**MongoDB Local**
```bash
# Installation sur macOS
brew install mongodb-community
brew services start mongodb-community

# URL de connexion locale
mongodb://localhost:27017/foxcard
```

### PostgreSQL

**PostgreSQL Local**
```bash
# Installation sur macOS
brew install postgresql
brew services start postgresql

# Créer la base de données
createdb foxcard

# URL de connexion
postgresql://username:password@localhost:5432/foxcard
```

**Supabase (PostgreSQL hébergé gratuit)**
1. Créez un compte sur [Supabase](https://supabase.com)
2. Créez un nouveau projet
3. Récupérez votre connection string depuis les paramètres

---

## 🔧 Installation Manuelle (Pour développeurs)

Si vous préférez configurer manuellement sans l'installeur :

1. **Créer le fichier `.env`**
```env
# Base de données
DATABASE_URL="mongodb://localhost:27017/foxcard"
# ou pour PostgreSQL :
# DATABASE_URL="postgresql://user:password@localhost:5432/foxcard"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-aleatoire-de-32-caracteres"

# Stripe (Optionnel)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Cloudflare R2 (Optionnel)
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="..."
```

2. **Pousser le schéma Prisma**
```bash
npm run db:push
```

3. **Seed la base de données** (Optionnel)
```bash
npm run db:seed
```

4. **Démarrer l'application**
```bash
npm run dev
```

---

## 🔄 Migration MongoDB → PostgreSQL

Si vous souhaitez migrer de MongoDB vers PostgreSQL :

1. **Configurer les deux bases de données dans .env**
```env
MONGODB_URL="mongodb://..."
POSTGRESQL_URL="postgresql://..."
```

2. **Lancer la migration**
```bash
node scripts/migrate-mongo-to-pg.js
```

3. **Mettre à jour DATABASE_URL**
Changez `DATABASE_URL` pour pointer vers PostgreSQL dans votre `.env`

4. **Redémarrer l'application**
```bash
npm run dev
```

---

## 📝 Configuration Post-Installation

Après l'installation, vous devriez :

### 1. Créer votre compte administrateur
- Allez sur `/auth/signup`
- Créez votre premier utilisateur (sera admin)

### 2. Configurer votre boutique
- Allez sur `/admin/settings`
- Configurez le nom, logo, et informations de votre boutique

### 3. Ajouter des produits
- Allez sur `/admin/products`
- Créez vos premiers produits

### 4. Configurer les paiements (Optionnel)
- Allez sur `/admin/settings`
- Ajoutez vos clés API Stripe

### 5. Configurer le stockage (Optionnel)
- Configurez Cloudflare R2 pour héberger vos images
- Ou utilisez un service S3-compatible

---

## 🎨 Personnalisation

### Changer le thème
- Allez sur `/admin/theme`
- Personnalisez les couleurs, typographie, etc.

### Ajouter des catégories
- Allez sur `/admin/categories`
- Créez la structure de votre catalogue

### Configurer l'expédition
- Allez sur `/admin/shipping`
- Définissez vos zones et tarifs d'expédition

---

## 🐛 Dépannage

### Erreur "DATABASE_URL not found"
Assurez-vous d'avoir créé le fichier `.env` avec DATABASE_URL

### Erreur de connexion MongoDB
- Vérifiez votre URL de connexion
- Assurez-vous que votre IP est whitelistée sur MongoDB Atlas
- Vérifiez vos identifiants

### Erreur de connexion PostgreSQL
- Vérifiez que PostgreSQL est démarré
- Vérifiez vos identifiants
- Vérifiez que la base de données existe

### Port 3000 déjà utilisé
```bash
# Trouver et tuer le processus
lsof -ti:3000 | xargs kill -9
```

---

## 📚 Ressources

- [Documentation complète](https://github.com/StudioCavalli/FoxCard/wiki)
- [Issues GitHub](https://github.com/StudioCavalli/FoxCard/issues)
- [Contribution](./CONTRIBUTING.md)

---

## 🚀 Déploiement en Production

### Vercel
1. Push votre code sur GitHub
2. Importez le projet sur [Vercel](https://vercel.com)
3. Configurez les variables d'environnement
4. Déployez !

### Docker
```bash
docker-compose up -d
```

---

**Besoin d'aide ?** Ouvrez une [issue sur GitHub](https://github.com/StudioCavalli/FoxCard/issues) !
