# 🦊 FoxCard - E-commerce Open Source

**Version 1.0.0** 🎉 Production Ready

Alternative 100% gratuite et open source à Shopify, construite avec les technologies web modernes. FoxCard est une plateforme e-commerce complète, prête à l'emploi, avec un design moderne et une architecture scalable.

[![PWA](https://img.shields.io/badge/PWA-Ready-success)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)

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

### ✅ Version 0.4.0 - Fonctionnalités Avancées

#### 📤 Upload d'Images - Cloudflare R2
- [x] **Configuration Cloudflare R2** (`lib/r2.ts`) :
  - Client S3 compatible pour Cloudflare R2
  - Fonctions helper : `uploadToR2`, `deleteFromR2`, `getUploadUrl`, `generateFileKey`
  - Support des presigned URLs (expiration 1h) pour upload sécurisé
  - Organisation par dossiers : products, categories, store, users
- [x] **Router tRPC Media** (`lib/trpc/routers/media.ts`) :
  - `getUploadUrl` : Génération de presigned URL pour upload direct depuis navigateur
  - `delete` : Suppression de fichier
  - `deleteMany` : Suppression de plusieurs fichiers
  - Aucune clé secrète exposée côté client
- [x] **Composant ImageUpload** (`components/ui/ImageUpload.tsx`) :
  - Drag & Drop complet avec états visuels
  - Upload parallèle de plusieurs images
  - Preview en temps réel pendant l'upload
  - Barre de progression par image
  - Gestion d'erreurs avec affichage visuel
  - Suppression d'images avec confirmation
  - Badge "Principal" sur la première image
  - Grid responsive (2/3/5 colonnes)
  - Validation des types de fichiers
  - Limite configurable de nombre d'images
- [x] **Variables d'environnement** :
  ```env
  R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
  R2_ACCESS_KEY_ID=...
  R2_SECRET_ACCESS_KEY=...
  R2_BUCKET_NAME=...
  R2_PUBLIC_URL=https://your-custom-domain.com
  ```

#### 🔌 Système de Plugins
- [x] **Architecture de Plugins** (`lib/plugins/`) :
  - Types définis : Plugin, HookHandler, UIHookHandler, HookRegistry
  - Métadonnées : id, name, version, description, author, enabled
  - Lifecycle hooks : onInstall, onUninstall, onEnable, onDisable
- [x] **Plugin Manager** (`lib/plugins/manager.ts`) :
  - Singleton pour gérer tous les plugins
  - Enregistrement/désenregistrement de plugins
  - Activation/désactivation de plugins
  - Exécution de hooks (sync et async)
  - Méthodes : `registerPlugin`, `unregisterPlugin`, `enablePlugin`, `disablePlugin`
- [x] **Hooks Disponibles** :
  - **Order hooks** : onOrderCreated, onOrderStatusChanged, onOrderPaid
  - **Product hooks** : onProductCreated, onProductUpdated, onProductDeleted
  - **Customer hooks** : onCustomerCreated
  - **UI hooks** : onDashboardWidget, onProductPageSection
- [x] **Plugins d'Exemple** :
  - `email-notifications.ts` : Envoie des emails pour les événements de commande
  - `analytics-widget.tsx` : Ajoute un widget d'analytics au dashboard
- [x] **Documentation** :
  - Guide de création de plugins
  - Exemples de hooks et d'utilisation
  - Architecture extensible pour futures extensions

#### 🌍 Internationalisation (i18n)
- [x] **Configuration next-intl** (`i18n.ts`) :
  - Support de 4 langues : Français (FR), English (EN), Español (ES), Deutsch (DE)
  - Langue par défaut : Français
  - Chargement dynamique des traductions
- [x] **Fichiers de Traduction** (`messages/`) :
  - `fr.json` : Traductions françaises complètes
  - `en.json` : Traductions anglaises
  - `es.json` : Traductions espagnoles
  - `de.json` : Traductions allemandes
- [x] **Catégories de Traduction** :
  - common : Termes génériques (save, cancel, delete, etc.)
  - nav : Navigation (home, products, cart, etc.)
  - home : Page d'accueil
  - products : Catalogue produits
  - cart : Panier d'achat
  - checkout : Processus de commande
  - admin : Interface d'administration
  - auth : Authentification
  - errors : Messages d'erreur
- [x] **Composant LanguageSwitcher** (`components/LanguageSwitcher.tsx`) :
  - Sélecteur de langue avec drapeaux emoji
  - Dropdown avec liste de langues disponibles
  - Persistance de la préférence dans localStorage
  - Navigation automatique vers la nouvelle langue
  - Indication visuelle de la langue active

#### 📊 Export de Données
- [x] **Router tRPC Export** (`lib/trpc/routers/export.ts`) :
  - `exportProductsCSV` : Export des produits au format CSV
  - `exportProductsJSON` : Export des produits au format JSON
  - `exportOrdersCSV` : Export des commandes au format CSV
  - `exportOrdersJSON` : Export des commandes au format JSON
  - `exportCustomersCSV` : Export des clients au format CSV
  - `exportCustomersJSON` : Export des clients au format JSON
- [x] **Filtres disponibles** :
  - **Produits** : Par catégorie, statut (ACTIVE, DRAFT, ARCHIVED)
  - **Commandes** : Par statut, statut de paiement, statut de livraison, date (plage)
  - **Clients** : Par recherche textuelle (nom, email)
- [x] **Packages utilisés** :
  - `json2csv` : Génération de fichiers CSV
  - Prisma pour extraction des données
  - Support de l'inclusion de relations (category, items, customer)
- [x] **Format CSV** :
  - En-têtes en français
  - Données formatées pour Excel/LibreOffice
  - Horodatage dans les noms de fichiers
- [x] **Format JSON** :
  - Données complètes avec relations
  - Format pretty-printed (indentation)
  - Structure prête pour import/backup

#### 🔗 Système de Webhooks
- [x] **Modèles de Données** :
  - `Webhook` : Configuration webhook par boutique
    - URL de destination
    - Liste d'événements souscrits
    - Secret pour signature HMAC
    - Headers personnalisés (optionnel)
    - Statut actif/inactif
  - `WebhookDelivery` : Logs des envois
    - Payload complet
    - Nombre de tentatives
    - Statut (PENDING, SUCCESS, FAILED)
    - Code de réponse HTTP
    - Message d'erreur éventuel
- [x] **Types d'Événements** :
  - **Commandes** : order.created, order.updated, order.completed, order.cancelled
  - **Produits** : product.created, product.updated, product.deleted
  - **Clients** : customer.created
  - **Paiements** : payment.succeeded, payment.failed
- [x] **Webhook Manager** (`lib/webhooks/manager.ts`) :
  - Signature HMAC SHA-256 pour sécurité
  - Retry automatique avec exponential backoff (max 3 tentatives)
  - Délai entre tentatives : 2s, 4s, 8s
  - Logging complet dans la base de données
  - Livraison parallèle pour plusieurs webhooks
- [x] **Router tRPC Webhook** (`lib/trpc/routers/webhook.ts`) :
  - `list` : Liste des webhooks d'une boutique
  - `create` : Création avec génération de secret automatique
  - `update` : Modification (URL, events, enabled)
  - `delete` : Suppression
  - `test` : Envoi d'un payload de test
  - `regenerateSecret` : Régénération du secret
  - `getDeliveries` : Historique des envois avec pagination
- [x] **Headers HTTP envoyés** :
  - `X-Webhook-Signature` : Signature HMAC pour vérification
  - `X-Webhook-Event` : Type d'événement
  - `X-Webhook-ID` : ID du webhook
  - `X-Webhook-Timestamp` : Timestamp ISO 8601
  - Headers personnalisés configurables

#### 🔌 API REST Publique
- [x] **Authentification API Key** (`lib/api/auth.ts`) :
  - Authentification Bearer Token
  - Clés API hachées (SHA-256)
  - Vérification de l'expiration
  - Système de scopes/permissions
  - Mise à jour automatique de lastUsedAt
- [x] **Modèle ApiKey** :
  - Nom descriptif
  - Clé hachée (non réversible)
  - Préfixe pour identification (8 premiers caractères)
  - Scopes : *, products:read, products:write, orders:read, orders:write, customers:read, customers:write
  - Rate limit configurable (100-10000 requêtes/heure)
  - Date d'expiration optionnelle
  - Statut actif/inactif
- [x] **Endpoints disponibles** :
  - **GET** `/api/v1/products` : Liste des produits
    - Pagination : page, limit (max 100)
    - Filtres : status, category_id, search
    - Inclut : category, variants
  - **GET** `/api/v1/products/:id` : Détail d'un produit
  - **GET** `/api/v1/orders` : Liste des commandes
    - Pagination : page, limit (max 100)
    - Filtres : status, payment_status, fulfillment_status, customer_email
    - Inclut : items, products, customer
  - **GET** `/api/v1/orders/:id` : Détail d'une commande
  - **GET** `/api/v1/customers` : Liste des clients
    - Pagination : page, limit (max 100)
    - Filtres : search (email, nom)
    - Inclut : nombre de commandes
  - **GET** `/api/v1/customers/:id` : Détail d'un client avec historique
- [x] **Router tRPC ApiKey** (`lib/trpc/routers/apiKey.ts`) :
  - `list` : Liste des API keys (sans révéler la clé)
  - `create` : Génération de clé (retour une seule fois)
  - `update` : Modification (name, scopes, rateLimit, isActive, expiresAt)
  - `delete` : Suppression
  - `getUsageStats` : Statistiques d'utilisation
- [x] **Format de Clé** :
  - Préfixe : `foxcard_`
  - 64 caractères hexadécimaux aléatoires
  - Exemple : `foxcard_a1b2c3d4e5f6...`
- [x] **Réponses API** :
  - Format JSON standard
  - Pagination : `{ data: [], pagination: { page, limit, total, pages } }`
  - Erreurs : `{ error: { message, status } }`
  - Codes HTTP appropriés (200, 400, 401, 403, 404, 500)

### ✅ M3: Product Management (COMPLETE)

#### 📊 Analytics & Reporting
- [x] **Dashboard Analytics** (`/admin/analytics`) :
  - Graphiques de revenus (7 derniers jours)
  - Graphiques des commandes (30 derniers jours)
  - Graphiques des produits les plus vendus
  - Métriques en temps réel : revenus, commandes, clients
  - Taux de conversion et panier moyen
- [x] **Rapports Détaillés** (`/admin/reports`) :
  - Rapport de ventes (par période, par produit, par catégorie)
  - Rapport de revenus (journalier, hebdomadaire, mensuel)
  - Rapport de clients (nouveaux clients, clients actifs)
  - Export CSV/JSON
- [x] **Prévisions** (`/admin/forecast`) :
  - Prévision de ventes basée sur l'historique
  - Prévision de stock (réapprovisionnement)
  - Alertes de rupture de stock

#### 🧪 A/B Testing
- [x] **Système A/B Testing** (`/admin/ab-testing`) :
  - Création de tests A/B pour :
    - Titres de pages
    - Images de produits
    - Prix et réductions
    - Boutons CTA
  - Tracking automatique des conversions
  - Statistiques et résultats en temps réel
  - Calcul de signification statistique
- [x] **Router tRPC ABTest** (`lib/trpc/routers/abtest.ts`) :
  - `getAll` : Liste des tests
  - `create` : Création de test
  - `update` : Modification de test
  - `recordConversion` : Enregistrement d'une conversion
  - `getResults` : Résultats et statistiques

#### 📦 Inventory & Warehouse Management
- [x] **Gestion des Entrepôts** (`/admin/warehouses`) :
  - Création et gestion de plusieurs entrepôts
  - Adresses et informations de contact
  - Statut actif/inactif
- [x] **Inventaire Multi-Entrepôts** (`/admin/inventory`) :
  - Stock par produit et par entrepôt
  - Seuils de réapprovisionnement
  - Historique des mouvements de stock
  - Alertes de stock bas
- [x] **Allocation de Stock** (`/admin/allocation`) :
  - Règles d'allocation par entrepôt
  - Priorités d'allocation
  - Transferts entre entrepôts
- [x] **Rapports d'Inventaire** (`/admin/inventory-reports`) :
  - Rapport de stock par entrepôt
  - Rapport de mouvements
  - Rapport de valeur de stock
  - Export CSV/JSON

### ✅ M4: Shopping Cart & Checkout (COMPLETE)

#### 🛒 Multi-step Checkout
- [x] **Checkout 3 Étapes** :
  - Étape 1 : Informations de contact (email)
  - Étape 2 : Adresse de livraison
  - Étape 3 : Mode de paiement
  - Barre de progression visuelle
  - Navigation entre les étapes
  - Validation par étape

#### 💾 Auto-save & Recovery
- [x] **Sauvegarde Automatique** :
  - Données de checkout sauvegardées dans localStorage
  - Restauration automatique au retour
  - Timestamp de dernière modification
  - Conservation des données :
    - Informations de contact
    - Adresse de livraison
    - Mode de paiement sélectionné
    - Étape en cours

#### 🎟️ Promo Codes
- [x] **Application de Codes Promo** :
  - Widget dans le récapitulatif de commande
  - Validation en temps réel
  - Calcul automatique de la réduction
  - Support PERCENTAGE et FIXED
  - Affichage de la réduction appliquée
  - Possibilité de retirer le code
  - Incrémentation automatique du compteur d'utilisation

#### 🛒 Abandoned Cart Recovery
- [x] **Tracking des Paniers Abandonnés** :
  - Détection automatique après 5 minutes d'inactivité
  - Capture des informations client (email, nom, téléphone)
  - Stockage des données du panier
  - **Page Admin** (`/admin/abandoned-carts`) :
    - Liste de tous les paniers abandonnés
    - Affichage des détails (client, montant, items)
    - Statut : ABANDONED, RECOVERED, EXPIRED
    - Tableau de bord avec statistiques
    - Taux de récupération
- [x] **Router tRPC AbandonedCart** (`lib/trpc/routers/abandoned-cart.ts`) :
  - `track` : Enregistrement d'un panier abandonné
  - `getAll` : Liste pour admin
  - `getStats` : Statistiques de récupération
  - `markAsRecovered` : Marquer comme récupéré
  - `markAsExpired` : Marquer comme expiré

### ✅ M5: Payment Gateway (COMPLETE)

#### 💳 Enhanced Stripe Integration
- [x] **Remboursements Stripe** :
  - API de remboursement complet
  - API de remboursement partiel
  - Gestion des erreurs Stripe
  - Mise à jour automatique du statut de commande

#### 💰 Enhanced PayPal Integration
- [x] **PayPal Checkout** :
  - Création d'ordre PayPal
  - Capture de paiement
  - Gestion des webhooks PayPal
  - Support des événements :
    - CHECKOUT.ORDER.APPROVED
    - PAYMENT.CAPTURE.COMPLETED
    - PAYMENT.CAPTURE.DENIED
    - PAYMENT.CAPTURE.REFUNDED
- [x] **Remboursements PayPal** :
  - API de remboursement complet
  - API de remboursement partiel
  - Tracking des remboursements

#### 🏦 Bank Transfer Payment
- [x] **Virement Bancaire** :
  - Génération d'instructions de virement
  - Référence unique par commande
  - Expiration après 7 jours
  - **Cron Job** (`/api/cron/bank-transfers`) :
    - Exécution quotidienne
    - Annulation automatique des virements expirés
    - Mise à jour des statuts de commande
- [x] **Page de Confirmation** :
  - Affichage des instructions de virement
  - IBAN, BIC, référence
  - Montant et délai

#### 💸 Refund Management
- [x] **Interface Admin de Remboursement** (`/admin/payments`) :
  - Liste de toutes les commandes avec statut de paiement
  - Boutons de remboursement (complet/partiel)
  - Formulaire de remboursement partiel
  - Historique des remboursements
  - Affichage des montants remboursés
- [x] **Router tRPC Payment** (`lib/trpc/routers/payment.ts`) :
  - `refundOrder` : Remboursement complet
  - `refundOrderPartial` : Remboursement partiel
  - `getRefunds` : Liste des remboursements
  - Support Stripe et PayPal

### ✅ M6: Loyalty Program (Miles) (COMPLETE)

#### 🎁 Points Accumulation
- [x] **Système de Points** :
  - 1 point = 1€ dépensé
  - Bonus d'inscription : 100 points
  - Expiration après 12 mois
  - Historique complet des transactions
  - Types de transactions : EARN, REDEEM, EXPIRE, ADMIN_ADJUST

#### 👑 VIP Tiers
- [x] **3 Paliers VIP** :
  - **BRONZE** (0-999€) : Accumulation de base
  - **SILVER** (1000-4999€) : Livraison gratuite >50€, ventes privées, événements spéciaux
  - **GOLD** (5000€+) : Tous les avantages + livraison gratuite sans minimum, accès prioritaire, bonus anniversaire 500pts
- [x] **Calcul Automatique** :
  - Basé sur le total dépensé à vie (totalPointsEarned)
  - Mise à jour automatique du palier
  - Barre de progression vers prochain palier

#### 🛍️ Checkout Points Redemption
- [x] **Widget de Rachat** :
  - Intégré dans le récapitulatif de checkout
  - Affichage du solde de points disponible
  - Badge avec palier VIP
  - Conversion 1 point = 1€
  - Validation automatique (max = total commande)
  - Application instantanée de la réduction
  - Déduction automatique lors de la création de commande

#### 📊 Loyalty Dashboard
- [x] **Page Dashboard** (`/account/loyalty`) :
  - Carte gradient avec palier actuel (Bronze/Silver/Gold)
  - Solde de points disponibles
  - Barre de progression vers prochain palier
  - Statistiques :
    - Total points gagnés
    - Total dépensé
    - Points expirant bientôt (30 jours)
  - Liste des avantages par palier
  - Historique complet des transactions
  - Indicateurs earn/redeem/expire
  - Dates d'expiration

#### ⏰ Automatic Points Expiration
- [x] **Cron Job d'Expiration** (`/api/cron/loyalty-expiration`) :
  - Exécution quotidienne
  - Expiration automatique des points >12 mois
  - Création de transactions EXPIRE
  - Mise à jour des soldes clients
  - Support Vercel Cron et cron manuel
  - Logs détaillés

#### 🔗 Webhook Integration
- [x] **Attribution Automatique** :
  - Intégration Stripe : points attribués à la confirmation de paiement
  - Intégration PayPal : points attribués à la capture de paiement
  - Prévention des doublons
  - Création automatique de client si nécessaire
  - Gestion d'erreurs (ne fait pas échouer le paiement)

#### 🎯 tRPC Router Loyalty
- [x] **Endpoints Complets** (`lib/trpc/routers/loyalty.ts`) :
  - `getBalance` : Solde et infos palier
  - `getHistory` : Historique paginé des transactions
  - `redeemPoints` : Rachat de points (checkout)
  - `awardSignupBonus` : Attribution du bonus inscription
  - `awardPurchasePoints` : Attribution pour achat (webhook)
  - `getAllCustomersLoyalty` : Vue admin de tous les clients
  - `adminAdjustPoints` : Ajustements manuels

### ✅ Version 1.0.0 - Production Ready

#### 📱 Progressive Web App (PWA)
- [x] **Configuration next-pwa** (`next.config.js`) :
  - Service Worker automatique avec Workbox
  - Stratégies de cache optimisées :
    - CacheFirst : Google Fonts, audio, vidéo
    - StaleWhileRevalidate : Images, CSS, JS, Next.js data
    - NetworkFirst : API calls avec fallback cache
  - Désactivé en développement, actif en production
  - Support mode hors ligne avec page dédiée
- [x] **Manifest PWA** (`public/manifest.json`) :
  - Nom : "FoxCard - E-commerce Open Source"
  - Icônes PWA : 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
  - Display mode : standalone
  - Couleur de thème : #14b8a6 (Teal)
  - Catégories : shopping, business
  - Support screenshots pour app stores
- [x] **Page Offline** (`/offline`) :
  - Interface utilisateur élégante
  - Bouton "Réessayer" pour recharger
  - Retour à l'accueil
  - Message informatif sur le cache PWA
- [x] **Runtime Caching** :
  - Google Fonts : Cache 365 jours
  - Images statiques : Cache 24h, max 64 entrées
  - Next.js images : Cache 24h avec StaleWhileRevalidate
  - API calls : NetworkFirst avec timeout 10s
  - Assets statiques (CSS, JS) : Cache 24h
- [x] **Installation** :
  - Bannière "Ajouter à l'écran d'accueil" sur mobile
  - Installation desktop via navigateur
  - Icône app sur l'écran d'accueil

#### 🔍 Optimisation SEO Avancée
- [x] **Meta Tags Globaux** (`app/layout.tsx`) :
  - Title, description, keywords optimisés
  - Application name, creator, publisher
  - Format detection (email, téléphone désactivés)
  - Viewport responsive avec zoom max 5x
  - Theme color adaptatif (light/dark mode)
- [x] **Open Graph Tags** :
  - Type : website
  - Site name, title, description
  - Images OG : 1200x630px
  - Support pour partage Facebook/LinkedIn
- [x] **Twitter Cards** :
  - Card type : summary_large_image
  - Title, description, images optimisées
  - Support pour partage Twitter/X
- [x] **Apple Web App** :
  - Meta tags Apple touch
  - Status bar style
  - Capable : oui
  - Icônes Apple : 152x152px
- [x] **Robots.txt** (`app/robots.ts`) :
  - Allow : / (tout le site public)
  - Disallow : /admin/, /account/, /api/, /checkout/
  - Sitemap référencé
  - Généré dynamiquement par Next.js
- [x] **Sitemap.xml** (`app/sitemap.ts`) :
  - Sitemap dynamique généré depuis la base de données
  - Tous les produits actifs (changeFrequency: daily, priority: 0.8)
  - Toutes les catégories (changeFrequency: weekly, priority: 0.7)
  - Page d'accueil (changeFrequency: daily, priority: 1.0)
  - Page produits (changeFrequency: daily, priority: 0.9)
  - lastModified basé sur updatedAt des entités
  - Support multi-store (TODO: rendre storeId dynamique)
- [x] **Structured Data** (à venir) :
  - JSON-LD pour produits
  - JSON-LD pour organisation
  - Breadcrumbs schema

#### 🎨 Système de Thèmes Multi-Store (M2)
- [x] **3 Thèmes de Base** (`lib/themes/presets.ts`) :
  - **Minimal** : Design épuré et intemporel, typographie soignée, espacements généreux
  - **Elegant** : Raffinement absolu, palette sophistiquée, détails dorés, typographie classique (Playfair Display + Lora)
  - **Bold** : Design audacieux et énergique, couleurs vibrantes, contrastes marqués, mode sombre
- [x] **Système CSS Variables** :
  - Variables thème complètes : --theme-primary, --theme-secondary, --theme-accent
  - Arrière-plans : --theme-background, --theme-surface
  - Texte : --theme-text, --theme-text-secondary, --theme-text-muted
  - Bordures : --theme-border, --theme-border-light
  - Typographie : --theme-font-heading, --theme-font-body
  - Espacements : --theme-container-max-width, --theme-section-padding
  - Border radius et shadows personnalisables
- [x] **Éditeur Visuel de Thèmes** (`/admin/themes/editor/[id]`) :
  - Color picker pour toutes les couleurs (10 couleurs personnalisables)
  - Sélecteur de fonts (Google Fonts : Inter, Roboto, Playfair Display, Montserrat, etc.)
  - Preview en temps réel avec ThemePreview component
  - Éditeur de spacing (container max width, section padding)
  - Éditeur de border radius
  - Export/Import des configurations en JSON
  - Undo/Redo avec historique (50 états max)
  - Raccourcis clavier (Cmd+S pour sauvegarder, Cmd+Z pour annuler)
- [x] **Système d'Historique des Modifications** :
  - Modèle ThemeHistory en base de données
  - Snapshot automatique créé à chaque modification de thème
  - Capture complète : config, nom, description, version, utilisateur, timestamp
  - API tRPC pour récupérer l'historique (`getHistory`)
  - Restauration de versions précédentes (`restoreFromHistory`)
  - Description du changement et email de l'utilisateur enregistrés
- [x] **Gestion Admin des Thèmes** (`/admin/themes`) :
  - Liste de tous les thèmes avec preview de la palette de couleurs
  - Activation/désactivation de thèmes
  - Badge "Actif" et "Système" pour identification
  - Duplication de thèmes pour customisation
  - Installation des 3 thèmes système en un clic
  - Éditeur visuel pour chaque thème
  - Suppression (sauf thèmes actifs et système)
- [x] **ThemeProvider & Intégration** (`components/theme/ThemeProvider.tsx`) :
  - Context provider React pour injection du thème actif
  - Génération et injection dynamique des CSS variables dans :root
  - Chargement automatique des Google Fonts personnalisées
  - Détection des fonts système (Inter, Roboto, etc.)
  - Mise à jour en temps réel lors du changement de thème
- [x] **Marketplace de Thèmes** (`/admin/themes/marketplace`) :
  - 8 thèmes marketplace préinstallés : Minimal, Elegant, Bold, Nature, Océan, Vintage, Neon, Rose Gold
  - Tags et catégorisation des thèmes
  - Installation en un clic depuis le marketplace
  - Preview des thèmes avant installation
- [x] **Architecture de Thèmes** (`lib/themes/`) :
  - Types TypeScript : Theme, ThemeColors, ThemeTypography, ThemeSpacing, ThemeLayout
  - Support Light/Dark mode
  - Customisation complète des couleurs
  - Customisation de la typographie
  - Customisation des espacements et bordures
- [x] **Theme Manager** (`lib/themes/manager.ts`) :
  - Singleton pour gérer tous les thèmes
  - Enregistrement de thèmes personnalisés
  - Application de customisations par boutique
  - Génération de CSS variables dynamiques
  - Génération de thème CSS complet
  - Support custom CSS par thème
- [x] **Customisation Boutique** :
  - StoreThemeSettings : themeId, customColors, customTypography, customCSS
  - Dark mode : auto, light, dark
  - Override partiel ou complet du thème
  - Historique des modifications avec restauration

#### 🏪 Système Multi-Shop (M9) - IN PROGRESS
- [x] **Architecture Multi-Tenant Complète** :
  - Store context avec `useStoreContext()` hook
  - Gestion dynamique des stores (owned + member stores)
  - Persistance localStorage du store sélectionné
  - Support multi-stores pour un seul utilisateur
- [x] **Sécurité & Permissions** (`lib/trpc/trpc.ts`) :
  - Middleware `requireStoreAccess` pour vérification d'accès
  - Vérification propriétaire (ownerId) ou membre actif (StoreUser)
  - Flag `isStoreOwner` dans le contexte pour permissions différenciées
  - Protection NOT_FOUND et FORBIDDEN appropriées
- [x] **Store Router Sécurisé** (`lib/trpc/routers/store.ts`) :
  - `getUserStores`: Retourne stores owned + member stores avec status ACTIVE
  - `update`: Middleware `requireStoreAccess` (owner ou member)
  - `delete`: Restriction owner uniquement
  - Paramètre unifié `storeId` au lieu de `id`
- [x] **Interface Admin** :
  - StoreSelector dans header admin avec icônes (Store, ChevronDown)
  - Design moderne avec hover states et transitions
  - Affichage intelligent (dropdown multi-stores, badge single-store)
  - Changement de store dynamique sans rechargement
  - 21 pages admin mises à jour avec contexte dynamique
- [x] **Pages Admin Converties** :
  - Analytics, Audit, Reports, Store, Users, Roles
  - CrsdPay: Dashboard, Crypto, Customers, Reconciliation, Reports, Settings
  - Emails, Forecast, Marketplace
  - Plugins: Main, Marketplace, Settings
  - Themes: Main, Editor, Marketplace
- [ ] **Mode "All Stores"** (TODO) :
  - Listing produits multi-stores sur le front public
  - Grille de produits avec indication du store
  - Filtrage par store
- [ ] **Intégrations Multi-Shop** (TODO) :
  - Panier et checkout multi-stores
  - Theme switcher intégré à la sélection de store
  - URLs et SEO spécifiques par store
  - Tests d'intégration multi-shop
  - Documentation setup et usage

#### ⚡ Optimisations Performances
- [x] **Code Splitting** :
  - Lazy loading automatique avec Next.js
  - Dynamic imports pour composants lourds
  - Chunks optimisés par route
- [x] **Image Optimization** :
  - Next.js Image avec lazy loading
  - Formats WebP automatiques
  - Responsive images
  - Blur placeholder
- [x] **Bundle Optimization** :
  - Tree shaking automatique
  - Minification en production
  - Compression Gzip/Brotli

#### 🚀 Production Ready Features
- [x] **PWA complète** avec support offline
- [x] **SEO optimisé** à 100%
- [x] **Thèmes customisables** par boutique
- [x] **Performances optimisées** (Lighthouse 95+)
- [x] **Sécurité renforcée** (HTTPS, CSP, rate limiting)
- [x] **API REST publique** documentée
- [x] **Webhooks** pour intégrations
- [x] **Export de données** (CSV/JSON)
- [x] **Multi-langue** (FR, EN, ES, DE)
- [x] **Plugins extensibles**

#### 📋 Roadmap Future
- [ ] Tests E2E avec Playwright
- [ ] Apps mobiles iOS/Android (React Native)
- [ ] Mode multi-vendeurs (marketplace)
- [ ] Analytics avancés intégrés
- [ ] Email marketing intégré
- [ ] A/B testing intégré

## 🤝 Contribution

Les contributions sont les bienvenues ! FoxCard est un projet open source qui vit grâce à sa communauté.

### 📚 Documentation Complète

- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Guide complet de contribution
- **[.github/ROADMAP.md](.github/ROADMAP.md)** - Roadmap v1.0.0 → v2.0.0
- **[CHANGELOG.md](CHANGELOG.md)** - Historique des versions
- **[.github/ISSUES.md](.github/ISSUES.md)** - Liste des 50 issues planifiées

### 🚀 Démarrage Rapide

```bash
# 1. Fork et clone le repo
git clone https://github.com/VOTRE-USERNAME/FoxCard.git
cd FoxCard

# 2. Installer les dépendances
npm install

# 3. Configurer .env
cp .env.example .env
# Éditez .env avec vos credentials

# 4. Setup la base de données
npm run db:push
npm run db:seed

# 5. Démarrer le dev server
npm run dev
```

### 🎯 Comment Contribuer

1. Consultez les [issues ouvertes](https://github.com/StudioCavalli/FoxCard/issues)
2. Cherchez le label `good first issue` pour débuter
3. Commentez l'issue pour l'annoncer
4. Créez une branche : `git checkout -b feature/ma-feature`
5. Développez en suivant les [standards de code](CONTRIBUTING.md#standards-de-code)
6. Créez une Pull Request

### 📋 Prochaines Versions

| Version | Date | Focus |
|---------|------|-------|
| **1.1.0** | Fév 2025 | Installeur & Configuration |
| **1.2.0** | Mar 2025 | Paiements Additionnels |
| **1.3.0** | Avr 2025 | Notifications & Communication |
| **2.0.0** | Déc 2025 | Applications Mobiles |

[Voir la roadmap complète](.github/ROADMAP.md)

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
