# 🦊 FoxCard - E-commerce Open Source

Alternative 100% gratuite et open source à Shopify, construite avec les technologies web modernes.

## 🚀 Stack Technique

### Frontend
- **Next.js 14+** avec App Router
- **React 18+** avec TypeScript
- **Tailwind CSS** pour le styling
- **Zustand** pour le state management
- **React Query** (@tanstack/react-query) pour la gestion des données

### Backend
- **tRPC** pour des APIs type-safe
- **Prisma** comme ORM (support MongoDB et PostgreSQL)
- **NextAuth.js** pour l'authentification
- **MongoDB** comme base de données

## 📦 Installation

### Prérequis

- Node.js 18+ et npm
- Compte MongoDB Atlas (ou instance MongoDB locale)

### Étapes

1. **Cloner le repository**
```bash
git clone https://github.com/StudioCavalli/FoxCard.git
cd FoxCard
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**
```bash
cp .env.example .env
```

Éditer `.env` avec vos informations :
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

4. **Initialiser la base de données**
```bash
npm run db:push
npm run db:seed
```

5. **Démarrer le serveur de développement**
```bash
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

## 🔧 Scripts Disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Build pour la production
- `npm run start` - Démarre le serveur en production
- `npm run lint` - Lint le code
- `npm run db:generate` - Génère le client Prisma
- `npm run db:push` - Push le schéma vers la base de données
- `npm run db:studio` - Ouvre Prisma Studio
- `npm run db:seed` - Peuple la base de données avec des données de démo

## 📚 Architecture

### Structure du Projet

```
FoxCard/
├── app/                      # Pages Next.js (App Router)
│   ├── api/                  # API Routes
│   │   ├── auth/            # NextAuth endpoints
│   │   └── trpc/            # tRPC endpoints
│   ├── products/            # Page catalogue produits
│   ├── checkout/            # Page checkout
│   └── order-confirmation/  # Page confirmation
├── components/              # Composants React
│   ├── ui/                  # Composants UI de base
│   ├── products/            # Composants produits
│   ├── cart/                # Composants panier
│   └── layout/              # Composants layout
├── lib/                     # Utilitaires et configuration
│   ├── trpc/                # Configuration tRPC
│   │   └── routers/         # Routers tRPC
│   ├── store/               # Stores Zustand
│   ├── auth.ts              # Configuration NextAuth
│   ├── prisma.ts            # Client Prisma
│   └── utils.ts             # Fonctions utilitaires
├── prisma/                  # Schéma et migrations Prisma
│   ├── schema.prisma        # Schéma de base de données
│   └── seed.ts              # Script de seed
└── public/                  # Fichiers statiques
```

### Modèles de Données

#### Store (Multi-tenant)
Chaque store est isolé avec ses propres produits, commandes et clients.

#### Product
- Types: Simple, Variable, Digital
- Support des variantes
- Gestion de l'inventaire
- SEO intégré

#### Order
Suivi complet des commandes avec statuts multiples :
- Status général (PENDING, PROCESSING, COMPLETED, etc.)
- Status paiement
- Status livraison

## 🎨 Design System

### Couleurs

Le design suit une palette de couleurs pastels inspirée du PDF UI/UX :

- **Primary (Teal)** : #14b8a6
- **Secondary (Pink)** : #ec4899
- **Accent Colors** : Yellow, Orange, Blue, Green, Purple

### Composants

Tous les composants utilisent des coins arrondis (`rounded-xl`, `rounded-2xl`) et des ombres subtiles pour un look moderne et accueillant.

## 🔐 Authentification

### Compte Admin par Défaut

Après le seed, utilisez ces credentials :
- **Email** : admin@foxcard.com
- **Password** : admin123

## 🛒 Fonctionnalités Principales

### ✅ Implémenté (MVP)

- [x] Catalogue de produits avec filtres
- [x] Panier persistant (localStorage)
- [x] Checkout simple
- [x] Gestion multi-tenant (stores)
- [x] API tRPC type-safe
- [x] Authentification NextAuth
- [x] Design moderne et responsive

### 🚧 À Venir (Phase 2)

- [ ] Dashboard admin complet
- [ ] Intégration paiement Stripe
- [ ] Gestion des variantes produits
- [ ] Upload d'images (S3/Cloudflare R2)
- [ ] Système de plugins
- [ ] Multi-langue
- [ ] PWA
- [ ] Apps mobiles (React Native)

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 License

Ce projet est sous licence MIT - voir le fichier LICENSE pour plus de détails.

## 🙏 Remerciements

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [tRPC](https://trpc.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)

---

Développé avec ❤️ par [Studio Cavalli](https://github.com/StudioCavalli)
