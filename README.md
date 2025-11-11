# 🦊 FoxCard - E-commerce Open Source

**Version 0.3.0**

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

### ✅ Version 0.3.0 - Paiements & Expédition (COMPLETE)

#### 💳 Intégration Stripe
- [x] **Configuration Stripe** :
  - Installation et configuration complète (stripe, @stripe/stripe-js)
  - Variables d'environnement (clés API, webhook secret)
  - Helper functions pour formater les montants (euros ↔ cents)
  - API Version: 2024-12-18.acacia
- [x] **Stripe Checkout** :
  - Création automatique de session de paiement après création de commande
  - Redirection vers Stripe pour le paiement sécurisé
  - Support des cartes bancaires
  - URLs de succès et d'annulation personnalisées
- [x] **Router tRPC Payment** (`lib/trpc/routers/payment.ts`) :
  - `createCheckoutSession` : Création des sessions Stripe
  - Conversion des items de commande en line items Stripe
  - Gestion des métadonnées (orderId, orderNumber)
  - `getPaymentStatus` : Récupération du statut de paiement
- [x] **Webhook Stripe** (`/api/webhooks/stripe/route.ts`) :
  - Vérification de signature pour sécurité
  - Gestion des événements :
    - `checkout.session.completed` : Mise à jour commande → PROCESSING/PAID
    - `checkout.session.async_payment_succeeded` : Paiement asynchrone réussi
    - `checkout.session.async_payment_failed` : Annulation de commande
    - `charge.refunded` : Gestion des remboursements
  - Confirmation automatique des paiements
  - Création automatique de client après paiement

#### 🎟️ Codes Promo & Réductions
- [x] **Modèle de données DiscountCode** :
  - Code unique par boutique (unique composite: storeId + code)
  - Type : PERCENTAGE ou FIXED
  - Valeur de la réduction
  - Limite d'utilisation (usageLimit) et compteur (usageCount)
  - Montant minimum de commande (minOrderAmount)
  - Dates de validité (startsAt / expiresAt)
  - Statut actif/inactif
  - Description optionnelle
- [x] **Router tRPC Discount** (`lib/trpc/routers/discount.ts`) :
  - `getAll` : Liste des codes promo pour une boutique (admin)
  - `validateCode` : Validation et calcul de réduction (public)
  - `create` : Création avec vérification d'unicité
  - `update` : Modification de codes existants
  - `delete` : Suppression
  - `incrementUsage` : Incrémentation automatique du compteur
- [x] **Validation complète** :
  - Vérification du statut actif
  - Vérification des dates de début/fin
  - Vérification de la limite d'utilisation
  - Vérification du montant minimum de commande
  - Calcul automatique du montant de réduction
- [x] **Page Admin Codes Promo** (`/admin/discounts`) :
  - Liste complète avec statistiques d'utilisation
  - Formulaire de création/modification
  - Badges visuels (actif/inactif, type de réduction)
  - Affichage du compteur d'utilisation
  - Suppression avec confirmation
  - Support des deux types de réduction (% et €)
- [x] **Application dans le Checkout** :
  - Champ de saisie de code promo dans le récapitulatif
  - Validation en temps réel via tRPC
  - Affichage de la réduction appliquée
  - Possibilité de retirer le code
  - Mise à jour automatique du total
  - Passage du discountCodeId à la commande
  - Incrémentation du compteur après application
- [x] **Intégration dans Order Router** :
  - Acceptation du paramètre discountCodeId
  - Calcul automatique de la réduction lors de la création
  - Soustraction du montant du total final

#### 🚚 Gestion des Zones de Livraison
- [x] **Modèle de données ShippingZone** :
  - Nom de la zone
  - Liste de pays (codes ISO : FR, BE, CH, etc.)
  - Relations avec ShippingRate (tarifs multiples)
  - Statut actif/inactif
- [x] **Modèle de données ShippingRate** :
  - Nom du tarif (ex: "Livraison Standard")
  - Prix de livraison
  - Montant minimum pour ce tarif (optional)
  - Délai estimé (ex: "3-5 jours")
  - Relation avec ShippingZone
- [x] **Router tRPC Shipping** (`lib/trpc/routers/shipping.ts`) :
  - `getAll` : Liste des zones pour une boutique (admin)
  - `calculateShipping` : Calcul automatique des frais (public)
    - Recherche de la zone par pays
    - Sélection du tarif applicable selon montant
    - Retour du tarif et estimation de délai
  - `create` : Création de zone avec tarifs multiples
  - `update` : Modification de zones
  - `delete` : Suppression
  - `createRate`, `updateRate`, `deleteRate` : Gestion des tarifs
- [x] **Page Admin Livraison** (`/admin/shipping`) :
  - Interface complète de gestion des zones
  - Sélection visuelle des pays (10 pays européens communs)
  - Gestion de tarifs multiples par zone
  - Formulaire avec :
    - Nom de la zone
    - Sélection multi-pays
    - Ajout/suppression de tarifs
    - Prix, montant minimum, délai estimé
    - Statut actif/inactif
  - Liste des zones avec tous les détails
  - Badges visuels pour le statut
  - Modification et suppression
- [x] **Calcul Dynamique dans Checkout** :
  - Requête automatique vers `calculateShipping`
  - Basé sur le pays de livraison sélectionné
  - Mise à jour en temps réel lors du changement de pays
  - Affichage du délai estimé
  - Affichage du nom du tarif et de la zone
  - Fallback vers tarif par défaut si zone introuvable
- [x] **Intégration dans Order Router** :
  - Calcul automatique lors de la création de commande
  - Recherche de la zone par pays de livraison
  - Sélection du tarif applicable selon montant
  - Fallback vers logique par défaut (gratuit > 50€)
  - Gestion des erreurs avec fallback

#### 💰 Gestion des Paiements
- [x] **Statuts de paiement** :
  - PENDING (en attente)
  - PAID (payé)
  - FAILED (échoué)
  - REFUNDED (remboursé)
- [x] **Intégration complète** dans le flux de commande :
  1. Création de commande avec adresse
  2. Création de session Stripe
  3. Redirection vers Stripe
  4. Paiement sécurisé
  5. Webhook de confirmation
  6. Mise à jour statut commande
  7. Page de confirmation
- [x] **Sécurité** :
  - Paiements traités par Stripe (PCI DSS compliant)
  - Webhooks sécurisés avec signature
  - Pas de données de carte stockées
- [x] **Configuration environnement** requise :
  ```env
  STRIPE_SECRET_KEY=sk_test_...
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```

### 🚧 Roadmap v0.4.0 et Au-delà

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
