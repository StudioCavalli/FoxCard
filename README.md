# 🦊 FoxCard - E-commerce Open Source

**Version 0.2.0**

Alternative 100% gratuite et open source à Shopify, construite avec les technologies web modernes. FoxCard est une plateforme e-commerce complète, prête à l'emploi, avec un design moderne et une architecture scalable.

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

### ✅ Version 0.1.0 - Fonctionnalités Implémentées

#### 🏪 Catalogue & Navigation
- [x] **Page d'accueil** avec sections catégories et produits vedettes
- [x] **Catalogue produits** avec pagination infinie
- [x] **Pages de catégories** dédiées avec URL `/categories/[slug]`
- [x] **Pages produits détaillées** avec galerie d'images et produits similaires
- [x] **Barre de recherche** fonctionnelle (nom, description, SKU)
- [x] **Filtres avancés** :
  - Filtrage par catégorie
  - Filtrage par plage de prix (min/max)
  - Recherche textuelle
- [x] **Options de tri** :
  - Plus récents
  - Prix croissant/décroissant
  - Nom alphabétique (A-Z, Z-A)
  - Produits populaires (featured)
- [x] **Design responsive** (Desktop, Tablet, Mobile)
- [x] **Filtres mobiles** avec tiroir coulissant

#### 🛒 Panier & Checkout
- [x] **Panier persistant** avec Zustand (localStorage)
- [x] **Gestion des quantités** avec validation du stock
- [x] **Page panier** dédiée avec récapitulatif
- [x] **Calcul automatique** des frais de port (gratuit > 50€)
- [x] **Page checkout** complète avec :
  - Formulaire de livraison
  - Sélection du mode de paiement (Carte/PayPal)
  - Validation des données
- [x] **Page de confirmation** de commande avec détails complets

#### 👤 Authentification & Compte
- [x] **Système d'inscription** avec validation
- [x] **Connexion sécurisée** (NextAuth.js + bcrypt)
- [x] **Page compte utilisateur** avec :
  - Gestion du profil
  - Changement de mot de passe
  - Historique des commandes
  - Préférences (newsletter, notifications)
- [x] **Sessions persistantes**

#### 🎨 Design System
- [x] **Palette de couleurs pastels** moderne
- [x] **Composants UI réutilisables** (Button, Card, Input, etc.)
- [x] **Animations et transitions** fluides
- [x] **États de chargement** (skeletons)
- [x] **États vides** avec appels à l'action
- [x] **Badges et indicateurs** visuels (stock, réductions, popularité)

#### ⚙️ Backend & Architecture
- [x] **API tRPC** type-safe avec React Query
- [x] **Base de données MongoDB** avec Prisma ORM
- [x] **Gestion multi-tenant** (stores isolés)
- [x] **Modèles de données** complets :
  - Store, Product, Category, Order, User
  - Support des variantes produits
  - Gestion de l'inventaire
- [x] **Seed de données** de démonstration
- [x] **Validation Zod** sur toutes les entrées

### ✅ Version 0.2.0 - Dashboard Admin (COMPLETE)

#### 🎨 Interface Admin
- [x] **Layout admin complet** avec sidebar et header
- [x] **Middleware de protection** (rôles ADMIN/SUPER_ADMIN requis)
- [x] **Dashboard principal** avec statistiques en temps réel :
  - Revenu total (calculé sur commandes complétées/en cours)
  - Nombre de commandes
  - Nombre de produits
  - Nombre de clients
  - Tableau des commandes récentes
  - Quick actions avec liens directs
- [x] **Design cohérent** avec la charte graphique (pastels, coins arrondis)

#### 📦 Gestion des Produits
- [x] **Liste des produits** avec tableau complet :
  - Image, nom, catégorie
  - SKU, stock (avec indicateurs visuels)
  - Prix, statut
  - Actions : Voir, Éditer, Supprimer
- [x] **Création de produits** avec formulaire complet :
  - Informations générales (nom, slug auto, description)
  - Catégorie
  - Prix & prix comparatif
  - SKU, quantité en stock
  - Upload d'images (jusqu'à 5)
  - Support des variantes
- [x] **Modification de produits** :
  - Formulaire pré-rempli
  - Modification du statut (ACTIVE, DRAFT, ARCHIVED)
  - Mise à jour des images
- [x] **Suppression de produits** avec confirmation
- [x] **Recherche** par nom ou SKU

#### 🛒 Gestion des Commandes
- [x] **Liste des commandes** avec tableau détaillé :
  - Numéro de commande
  - Client (nom, email)
  - Date de création
  - Nombre d'articles
  - Total
  - Statut avec badges colorés
- [x] **Visualisation des commandes** (lien vers page confirmation)
- [x] **Tri et filtrage** des commandes

#### 📁 Gestion des Catégories
- [x] **Liste des catégories** en grid cards
- [x] **Création de catégories** :
  - Nom, slug auto-généré
  - Description
  - Compteur de produits
- [x] **Modification de catégories** (formulaire inline)
- [x] **Suppression de catégories** avec confirmation
- [x] **Affichage du nombre de produits** par catégorie

#### 👥 Gestion des Clients
- [x] **Liste des clients** avec tableau complet :
  - Nom, email, téléphone
  - Nombre de commandes
  - Total dépensé (calculé)
  - Date d'inscription
- [x] **Recherche de clients** par nom ou email
- [x] **Statistiques clients** :
  - Total clients
  - Revenu total généré
  - Panier moyen
- [x] **Suppression de clients** avec confirmation
- [x] **Endpoint tRPC** dédié avec calcul du total dépensé

### 🚧 Roadmap v0.3.0 et Au-delà

#### Phase 3 (v0.3.0) - Paiements & Expédition
- [ ] Intégration Stripe/PayPal
- [ ] Gestion des méthodes de paiement
- [ ] Calcul des frais de port avancés
- [ ] Intégrations transporteurs
- [ ] Codes promo et réductions
- [ ] Gestion des taxes

#### Phase 4 (v0.4.0) - Avancé
- [ ] Upload d'images (S3/Cloudflare R2)
- [ ] Système de plugins
- [ ] Multi-langue (i18n)
- [ ] Export de données
- [ ] Webhooks
- [ ] API REST publique

#### Phase 5 (v1.0.0) - Production Ready
- [ ] PWA (Progressive Web App)
- [ ] Optimisation SEO avancée
- [ ] Tests E2E complets
- [ ] Documentation complète
- [ ] Thèmes customisables
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
