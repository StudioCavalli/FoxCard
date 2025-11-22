# 📝 Changelog

Toutes les modifications notables de FoxCard seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [1.14.0] - 2025-11-23 🏨 Commerce-Type Specific Features (M14)

### ✨ Ajouté
- **Gestion des Tables Restaurant** (`/merchant/tables`)
  - Grille visuelle avec statut couleur (libre, occupé, réservé, nettoyage)
  - Statistiques en temps réel (tables libres, occupées, revenue)
  - CRUD complet avec capacité et emplacement
  - Changement de statut rapide via dropdown
- **Paramètres de Livraison** (`/merchant/delivery`)
  - Configuration zone de livraison
  - Frais de livraison et minimum de commande
  - Créneaux horaires personnalisables
  - Modes de livraison multiples (livraison, click & collect, dine-in)
- **Améliorations Storefront**
  - Page Hôtel avec attributs dynamiques (roomType, capacity, amenities, cancellationPolicy)
  - Page Restaurant avec modificateurs depuis la base de données
  - Support complet des options produit pour tous les types de commerce

### 🔧 Corrigé
- **Fix persistance de langue (i18n)** - IMPORTANT
  - Correction des liens sans préfixe locale dans tous les composants
  - Header, Footer, CartDrawer, PublicStoreSelector, BookingConfirmation
  - Toutes les pages produit (Standard, Restaurant, Hotel, Digital, Travel, Service)
  - Ajout du sélecteur de langue dans MerchantHeader et SuperAdminHeader
  - La langue persiste maintenant correctement lors de la navigation

### 📚 Documentation
- Traductions i18n ajoutées pour tables et livraison (5 langues)
- Traductions hôtel complètes (roomType, checkIn/Out, cancellationPolicy)

---

## [1.0.0] - 2025-01-11 🎉 Production Ready

### ✨ Ajouté
- **PWA (Progressive Web App)** avec support offline complet
  - Manifest PWA avec icônes multiples (72px à 512px)
  - Service Worker avec Workbox
  - Stratégies de cache optimisées (CacheFirst, StaleWhileRevalidate, NetworkFirst)
  - Page offline dédiée avec UI élégante
- **SEO Avancé** pour un référencement optimal
  - Meta tags globaux (title, description, keywords)
  - Open Graph tags pour partage Facebook/LinkedIn
  - Twitter Cards pour partage Twitter/X
  - Apple Web App meta tags
  - Robots.txt dynamique
  - Sitemap.xml dynamique depuis la base de données
- **Système de Thèmes Customisables**
  - Architecture de thèmes avec TypeScript
  - Thème par défaut avec mode dark
  - Theme Manager singleton
  - Génération dynamique de CSS variables
  - Interface admin de customisation des couleurs
  - Support de 12 couleurs système
  - Preview en temps réel
- **Optimisations de Performance**
  - Code splitting automatique avec Next.js
  - Image optimization (WebP, lazy loading)
  - Bundle optimization (tree shaking, minification)

### 🔧 Modifié
- Migration vers Next.js 16 avec Turbopack
- Renommé `middleware.ts` → `proxy.ts` (nouvelle convention Next.js 16)
- Séparé export `viewport` dans `app/layout.tsx` pour conformité Next.js 16
- Ajout du lien "Thème" dans la sidebar admin

### 📚 Documentation
- README mis à jour vers v1.0.0
- Documentation complète du système de thèmes
- Documentation PWA et stratégies de cache
- Documentation SEO avec robots.txt et sitemap.xml

---

## [0.4.0] - 2024-12-20

### ✨ Ajouté
- **Upload d'Images - Cloudflare R2**
  - Client S3 compatible pour Cloudflare R2
  - Presigned URLs pour upload sécurisé
  - Composant ImageUpload avec drag & drop
  - Support de plusieurs images en parallèle
- **Système de Plugins**
  - Architecture extensible avec hooks
  - Plugin Manager singleton
  - Plugins d'exemple (email-notifications, analytics-widget)
  - Documentation pour développeurs de plugins
- **Internationalisation (i18n)**
  - Support de 4 langues (FR, EN, ES, DE)
  - Composant LanguageSwitcher
  - Traductions complètes pour toutes les pages
- **Export de Données**
  - Export CSV et JSON pour produits, commandes, clients
  - Filtres avancés pour les exports
  - Router tRPC export dédié
- **Système de Webhooks**
  - Configuration de webhooks par boutique
  - 8 types d'événements (orders, products, customers, payments)
  - Retry automatique avec exponential backoff
  - Logs des envois (WebhookDelivery)
  - Signature HMAC SHA-256 pour sécurité
- **API REST Publique**
  - Authentification par API Key (Bearer Token)
  - Endpoints : products, orders, customers
  - Pagination et filtres
  - Rate limiting configurable
  - Scopes de permissions

### 🔧 Modifié
- Amélioration du système d'upload d'images
- Optimisation des performances d'export

### 📚 Documentation
- Guide de création de plugins
- Documentation API REST
- Documentation des webhooks

---

## [0.3.0] - 2024-11-15

### ✨ Ajouté
- **Intégration Stripe**
  - Stripe Checkout pour paiements sécurisés
  - Webhooks Stripe pour confirmation automatique
  - Gestion des remboursements
  - API Version: 2024-12-18.acacia
- **Codes Promo & Réductions**
  - Système complet de codes promo
  - Types : PERCENTAGE et FIXED
  - Validation avancée (dates, usage, montant minimum)
  - Interface admin de gestion
  - Application dans le checkout
- **Zones de Livraison**
  - Gestion de zones géographiques
  - Tarifs multiples par zone
  - Calcul automatique des frais selon le pays
  - Interface admin avec sélection de pays
  - Support de 10 pays européens communs

### 🔧 Modifié
- Amélioration du flux de checkout avec codes promo
- Calcul dynamique des frais de port

### 🐛 Corrigé
- Bugs de validation dans le checkout
- Problèmes de calcul de réduction

---

## [0.2.0] - 2024-10-01

### ✨ Ajouté
- **Dashboard Admin Complet**
  - Statistiques en temps réel (revenu, commandes, produits, clients)
  - Interface moderne avec sidebar et header
  - Middleware de protection (rôles ADMIN/SUPER_ADMIN)
- **Gestion des Produits**
  - Liste avec tableau complet
  - Création et modification de produits
  - Upload d'images (jusqu'à 5)
  - Support des variantes
  - Statuts : ACTIVE, DRAFT, ARCHIVED
- **Gestion des Commandes**
  - Liste avec filtres et tri
  - Visualisation détaillée
  - Badges colorés par statut
- **Gestion des Catégories**
  - Interface en grid cards
  - Création et modification inline
  - Compteur de produits
- **Gestion des Clients**
  - Liste avec statistiques
  - Total dépensé par client
  - Recherche avancée

### 🔧 Modifié
- Amélioration de l'interface admin
- Optimisation des requêtes Prisma

---

## [0.1.0] - 2024-09-01

### ✨ Ajouté
- **Core E-commerce**
  - Page d'accueil avec catégories et produits vedettes
  - Catalogue produits avec pagination infinie
  - Pages de catégories dédiées
  - Pages produits détaillées avec galerie d'images
  - Barre de recherche fonctionnelle
  - Filtres avancés (catégorie, prix, recherche)
  - Options de tri multiples
- **Panier & Checkout**
  - Panier persistant avec Zustand et localStorage
  - Gestion des quantités avec validation du stock
  - Page panier dédiée
  - Calcul automatique des frais de port
  - Page checkout complète
  - Page de confirmation de commande
- **Authentification & Compte**
  - Système d'inscription et connexion
  - Page compte utilisateur
  - Gestion du profil
  - Changement de mot de passe
  - Historique des commandes
- **Design System**
  - Palette de couleurs pastels moderne
  - Composants UI réutilisables
  - Animations et transitions fluides
  - États de chargement (skeletons)
  - Design responsive (Desktop, Tablet, Mobile)
- **Backend & Architecture**
  - API tRPC type-safe
  - Base de données MongoDB avec Prisma
  - Gestion multi-tenant (stores isolés)
  - Seed de données de démonstration
  - Validation Zod sur toutes les entrées

### 📚 Documentation
- README initial
- Guide d'installation
- Documentation technique

---

## [À venir] - Roadmap v1.1.0 à v2.0.0

Consultez la roadmap complète : [.github/ROADMAP.md](.github/ROADMAP.md)

### 🚀 v1.1.0 - Installeur & Configuration (Février 2025)
- Installeur web en 1-clic
- Support PostgreSQL
- Configuration via UI admin
- Documentation simplifiée

### 💳 v1.2.0 - Paiements Additionnels (Mars 2025)
- PayPal Integration
- Apple Pay / Google Pay
- Virement bancaire
- Interface admin de gestion des paiements

### 📧 v1.3.0 - Notifications & Communication (Avril 2025)
- Emails transactionnels
- Éditeur de templates email
- Factures PDF
- SMS (Twilio)
- Module newsletter

### 👥 v1.4.0 - Gestion Multi-Utilisateurs (Mai 2025)
- Système de rôles et permissions
- Interface de gestion des utilisateurs
- Audit logs
- Invitation par email

### 🎨 v1.5.0 - Éditeur de Thèmes Avancé (Juin 2025)
- Éditeur visuel drag & drop
- Marketplace de thèmes
- 3 thèmes additionnels

### 🔌 v1.6.0 - Marketplace de Plugins (Juillet 2025)
- Marketplace de plugins
- Plugins essentiels (shipping, marketing, SEO, analytics)
- SDK et CLI pour développeurs

### 📊 v1.7.0 - Analytics & Reporting (Août 2025)
- Dashboard analytics avancé
- Rapports exportables
- Prévisions
- A/B testing

### 🏪 v1.8.0 - Inventaire Multi-Entrepôts (Septembre 2025)
- Système multi-entrepôts
- Règles d'allocation intelligente
- Gestion avancée du stock

### 🐳 v1.9.0 - Déploiement & Infrastructure (Octobre 2025)
- Docker Compose production
- One-click deploy (Vercel, Railway, Render)
- Documentation déploiement VPS
- Redis et BullMQ

### 🧪 v1.10.0 - Tests & Qualité (Novembre 2025)
- Tests unitaires
- Tests d'intégration
- Tests E2E (Playwright)
- CI/CD avec GitHub Actions

### 📱 v2.0.0 - Applications Mobiles (Décembre 2025)
- Applications React Native (iOS/Android)
- Notifications push
- Mode offline mobile
- White-label configuration
- Mode multi-vendeurs (bonus)
- Email marketing intégré (bonus)

---

## Format des Entrées

### Types de Changements
- `✨ Ajouté` : Nouvelles fonctionnalités
- `🔧 Modifié` : Changements dans des fonctionnalités existantes
- `🗑️ Déprécié` : Fonctionnalités bientôt supprimées
- `🚫 Supprimé` : Fonctionnalités supprimées
- `🐛 Corrigé` : Corrections de bugs
- `🔒 Sécurité` : Correctifs de sécurité
- `📚 Documentation` : Modifications de documentation

---

**Liens**
- [Unreleased]: https://github.com/StudioCavalli/FoxCard/compare/v1.0.0...HEAD
- [1.0.0]: https://github.com/StudioCavalli/FoxCard/releases/tag/v1.0.0
- [0.4.0]: https://github.com/StudioCavalli/FoxCard/releases/tag/v0.4.0
- [0.3.0]: https://github.com/StudioCavalli/FoxCard/releases/tag/v0.3.0
- [0.2.0]: https://github.com/StudioCavalli/FoxCard/releases/tag/v0.2.0
- [0.1.0]: https://github.com/StudioCavalli/FoxCard/releases/tag/v0.1.0
