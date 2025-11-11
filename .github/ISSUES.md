# 📋 Liste Complète des Issues - Roadmap v1.0.0 → v2.0.0

Ce fichier liste toutes les issues à créer pour la roadmap FoxCard.

## 🚀 Version 1.1.0 - Installeur & Configuration (4 issues)

### Issue #1 - Créer l'installeur web wizard
- **Labels** : `enhancement`, `v1.1.0`, `installer`
- **Milestone** : v1.1.0
- **Description** : Installeur web style WordPress avec configuration guidée
- **Tâches** : Interface wizard, détection environnement, validation config, génération .env

### Issue #2 - Implémenter le support PostgreSQL
- **Labels** : `enhancement`, `v1.1.0`, `database`
- **Milestone** : v1.1.0
- **Description** : Support PostgreSQL en plus de MongoDB
- **Tâches** : Adapter schema Prisma, migration MongoDB→PostgreSQL, tests

### Issue #3 - Interface de gestion des variables d'environnement
- **Labels** : `enhancement`, `v1.1.0`, `admin`
- **Milestone** : v1.1.0
- **Description** : Gérer les variables d'environnement via UI admin
- **Tâches** : Modèle EnvVariable, chiffrement AES-256, interface admin, surcharge runtime

### Issue #4 - Documentation d'installation simplifiée
- **Labels** : `documentation`, `v1.1.0`
- **Milestone** : v1.1.0
- **Description** : Guide d'installation en 5 minutes + vidéo
- **Tâches** : Guide Markdown, screenshots, vidéo démo, traductions

---

## 💳 Version 1.2.0 - Paiements Additionnels (4 issues)

### Issue #5 - Intégration PayPal Checkout
- **Labels** : `enhancement`, `v1.2.0`, `payment`
- **Milestone** : v1.2.0
- **Description** : PayPal comme alternative à Stripe
- **Tâches** : SDK PayPal, router tRPC, composant boutons, webhooks, remboursements

### Issue #6 - Support Apple Pay / Google Pay
- **Labels** : `enhancement`, `v1.2.0`, `payment`
- **Milestone** : v1.2.0
- **Description** : Apple Pay et Google Pay via Stripe
- **Tâches** : Payment Request Button API, détection device, tests iOS/Android

### Issue #7 - Module de virement bancaire
- **Labels** : `enhancement`, `v1.2.0`, `payment`
- **Milestone** : v1.2.0
- **Description** : Virement bancaire comme méthode manuelle
- **Tâches** : Instructions de virement, upload preuve, validation admin, timeout

### Issue #8 - Interface admin de gestion des paiements
- **Labels** : `enhancement`, `v1.2.0`, `admin`, `payment`
- **Milestone** : v1.2.0
- **Description** : Page centralisée pour gérer les méthodes de paiement
- **Tâches** : Activation/désactivation, configuration, ordre d'affichage, statistiques

---

## 📧 Version 1.3.0 - Notifications & Communication (5 issues)

### Issue #9 - Système d'emails transactionnels
- **Labels** : `enhancement`, `v1.3.0`, `email`
- **Milestone** : v1.3.0
- **Description** : Emails transactionnels complets
- **Tâches** : SMTP Nodemailer, templates React Email, queue BullMQ, tracking

### Issue #10 - Éditeur de templates email
- **Labels** : `enhancement`, `v1.3.0`, `email`, `admin`
- **Milestone** : v1.3.0
- **Description** : Éditeur visuel WYSIWYG pour emails
- **Tâches** : Intégration Unlayer/MJML, variables dynamiques, preview, branding

### Issue #11 - Génération de factures PDF
- **Labels** : `enhancement`, `v1.3.0`, `orders`, `pdf`
- **Milestone** : v1.3.0
- **Description** : Factures PDF automatiques
- **Tâches** : Puppeteer/jsPDF, template HTML, upload R2, numérotation

### Issue #12 - Intégration SMS (Twilio)
- **Labels** : `enhancement`, `v1.3.0`, `sms`, `optional`
- **Milestone** : v1.3.0
- **Description** : SMS optionnel via Twilio
- **Tâches** : SDK Twilio, configuration admin, templates SMS, queue, logs

### Issue #13 - Module newsletter
- **Labels** : `enhancement`, `v1.3.0`, `email`, `marketing`
- **Milestone** : v1.3.0
- **Description** : Newsletter pour marketing email
- **Tâches** : Modèle Subscriber, double opt-in, éditeur, envoi planifié, stats

---

## 👥 Version 1.4.0 - Gestion Multi-Utilisateurs (4 issues)

### Issue #14 - Système de rôles et permissions
- **Labels** : `enhancement`, `v1.4.0`, `auth`, `admin`
- **Milestone** : v1.4.0
- **Description** : Rôles et permissions granulaires
- **Tâches** : Modèle Role/Permission, middleware de vérification, custom roles

### Issue #15 - Interface de gestion des utilisateurs
- **Labels** : `enhancement`, `v1.4.0`, `admin`
- **Milestone** : v1.4.0
- **Description** : Gestion des utilisateurs admin
- **Tâches** : Liste utilisateurs, invitation email, gestion rôles, désactivation

### Issue #16 - Système d'audit logs
- **Labels** : `enhancement`, `v1.4.0`, `admin`, `security`
- **Milestone** : v1.4.0
- **Description** : Historique de toutes les actions admin
- **Tâches** : Modèle AuditLog, middleware d'enregistrement, filtres, export

### Issue #17 - Invitation d'utilisateurs par email
- **Labels** : `enhancement`, `v1.4.0`, `email`, `auth`
- **Milestone** : v1.4.0
- **Description** : Système d'invitation sécurisé
- **Tâches** : Token d'invitation, email avec lien, validation, expiration

---

## 🎨 Version 1.5.0 - Éditeur de Thèmes Avancé (5 issues)

### Issue #18 - Éditeur visuel de thèmes
- **Labels** : `enhancement`, `v1.5.0`, `themes`, `admin`
- **Milestone** : v1.5.0
- **Description** : Éditeur drag & drop complet
- **Tâches** : Drag & drop sections, customisation temps réel, preview responsive, undo/redo

### Issue #19 - Marketplace de thèmes
- **Labels** : `enhancement`, `v1.5.0`, `themes`, `marketplace`
- **Milestone** : v1.5.0
- **Description** : Repository de thèmes gratuits et premium
- **Tâches** : Interface découverte, installation 1-clic, preview, reviews

### Issue #20 - Développer thème "Minimal"
- **Labels** : `enhancement`, `v1.5.0`, `themes`
- **Milestone** : v1.5.0
- **Description** : Thème minimaliste élégant
- **Tâches** : Design, développement, documentation, screenshots

### Issue #21 - Développer thème "Luxe"
- **Labels** : `enhancement`, `v1.5.0`, `themes`
- **Milestone** : v1.5.0
- **Description** : Thème haut de gamme
- **Tâches** : Design, développement, documentation, screenshots

### Issue #22 - Développer thème "Tech"
- **Labels** : `enhancement`, `v1.5.0`, `themes`
- **Milestone** : v1.5.0
- **Description** : Thème pour produits technologiques
- **Tâches** : Design, développement, documentation, screenshots

---

## 🔌 Version 1.6.0 - Marketplace de Plugins (6 issues)

### Issue #23 - Marketplace de plugins
- **Labels** : `enhancement`, `v1.6.0`, `plugins`, `marketplace`
- **Milestone** : v1.6.0
- **Description** : Écosystème complet de plugins
- **Tâches** : Interface découverte, installation 1-clic, mises à jour auto, reviews

### Issue #24 - Plugins shipping (Colissimo, UPS, DHL)
- **Labels** : `enhancement`, `v1.6.0`, `plugins`, `shipping`
- **Milestone** : v1.6.0
- **Description** : Plugins pour transporteurs majeurs
- **Tâches** : Colissimo API, UPS API, DHL API, Chronopost, tracking

### Issue #25 - Plugins marketing (pop-ups, exit intent)
- **Labels** : `enhancement`, `v1.6.0`, `plugins`, `marketing`
- **Milestone** : v1.6.0
- **Description** : Outils marketing
- **Tâches** : Pop-ups, exit intent, codes promo automatiques, upsell

### Issue #26 - Plugins SEO avancés
- **Labels** : `enhancement`, `v1.6.0`, `plugins`, `seo`
- **Milestone** : v1.6.0
- **Description** : SEO automation
- **Tâches** : Schema.org auto, redirections 301, sitemap avancé, meta auto

### Issue #27 - Plugins analytics
- **Labels** : `enhancement`, `v1.6.0`, `plugins`, `analytics`
- **Milestone** : v1.6.0
- **Description** : Intégrations analytics
- **Tâches** : Google Analytics, Facebook Pixel, Matomo, TikTok Pixel

### Issue #28 - SDK et CLI pour développeurs
- **Labels** : `enhancement`, `v1.6.0`, `plugins`, `developer-experience`
- **Milestone** : v1.6.0
- **Description** : Outils pour créer des plugins
- **Tâches** : CLI create-foxcard-plugin, templates, documentation, hot reload

---

## 📊 Version 1.7.0 - Analytics & Reporting (4 issues)

### Issue #29 - Dashboard analytics avancé
- **Labels** : `enhancement`, `v1.7.0`, `analytics`, `admin`
- **Milestone** : v1.7.0
- **Description** : Analytics temps réel
- **Tâches** : Graphiques ventes, taux conversion, top produits, sources trafic

### Issue #30 - Système de rapports exportables
- **Labels** : `enhancement`, `v1.7.0`, `analytics`, `export`
- **Milestone** : v1.7.0
- **Description** : Rapports détaillés exportables
- **Tâches** : Rapports ventes/produits/clients, analyse cohortes, abandon panier, PDF/Excel

### Issue #31 - Module de prévisions
- **Labels** : `enhancement`, `v1.7.0`, `analytics`, `ai`
- **Milestone** : v1.7.0
- **Description** : Prévisions avec ML
- **Tâches** : Prévisions ventes, prévisions stock, tendances, ML basique

### Issue #32 - A/B testing intégré
- **Labels** : `enhancement`, `v1.7.0`, `marketing`, `testing`
- **Milestone** : v1.7.0
- **Description** : Tests A/B pour optimisation
- **Tâches** : Tests pages produits, tests checkout, tests homepage, statistiques

---

## 🏪 Version 1.8.0 - Inventaire Multi-Entrepôts (4 issues)

### Issue #33 - Système multi-entrepôts
- **Labels** : `enhancement`, `v1.8.0`, `inventory`, `admin`
- **Milestone** : v1.8.0
- **Description** : Gestion de plusieurs entrepôts
- **Tâches** : Modèle Warehouse, stock par entrepôt, transferts, localisation

### Issue #34 - Règles d'allocation intelligente
- **Labels** : `enhancement`, `v1.8.0`, `inventory`, `ai`
- **Milestone** : v1.8.0
- **Description** : Allocation automatique selon distance/disponibilité
- **Tâches** : Algorithme allocation, priorisation, split commandes, optimisation

### Issue #35 - Gestion avancée du stock
- **Labels** : `enhancement`, `v1.8.0`, `inventory`, `admin`
- **Milestone** : v1.8.0
- **Description** : Suivi temps réel et alertes
- **Tâches** : Alertes stock bas, réapprovisionnement auto, historique, inventaire physique

### Issue #36 - Rapports d'inventaire
- **Labels** : `enhancement`, `v1.8.0`, `inventory`, `analytics`
- **Milestone** : v1.8.0
- **Description** : Analyse de l'inventaire
- **Tâches** : Valeur stock, rotation, produits obsolètes, prévisions réappro

---

## 🐳 Version 1.9.0 - Déploiement & Infrastructure (4 issues)

### Issue #37 - Docker Compose production
- **Labels** : `enhancement`, `v1.9.0`, `devops`, `docker`
- **Milestone** : v1.9.0
- **Description** : Setup Docker complet pour production
- **Tâches** : Services Next.js/MongoDB/Redis/MinIO, variables env, volumes, networking

### Issue #38 - Templates one-click deploy
- **Labels** : `enhancement`, `v1.9.0`, `devops`, `deployment`
- **Milestone** : v1.9.0
- **Description** : Deploy facile sur plateformes cloud
- **Tâches** : Template Vercel, Railway, Render, DigitalOcean App Platform

### Issue #39 - Documentation déploiement VPS
- **Labels** : `documentation`, `v1.9.0`, `devops`
- **Milestone** : v1.9.0
- **Description** : Guide complet VPS
- **Tâches** : Guide Ubuntu/Debian, Nginx, SSL Let's Encrypt, backup, monitoring

### Issue #40 - Intégration Redis et BullMQ
- **Labels** : `enhancement`, `v1.9.0`, `infrastructure`, `performance`
- **Milestone** : v1.9.0
- **Description** : Cache et queue jobs
- **Tâches** : Configuration Redis, BullMQ pour jobs, cache multi-niveaux, monitoring

---

## 🧪 Version 1.10.0 - Tests & Qualité (4 issues)

### Issue #41 - Suite de tests unitaires
- **Labels** : `testing`, `v1.10.0`, `quality`
- **Milestone** : v1.10.0
- **Description** : Tests unitaires avec Jest
- **Tâches** : Tests utilitaires/helpers/validations, coverage > 80%, CI integration

### Issue #42 - Tests d'intégration tRPC
- **Labels** : `testing`, `v1.10.0`, `quality`
- **Milestone** : v1.10.0
- **Description** : Tests des routers tRPC
- **Tâches** : Tests routers, tests webhooks, tests paiements mode test, tests API REST

### Issue #43 - Tests E2E Playwright
- **Labels** : `testing`, `v1.10.0`, `quality`, `e2e`
- **Milestone** : v1.10.0
- **Description** : Tests end-to-end
- **Tâches** : Parcours utilisateur, création commande, processus paiement, interface admin, multi-navigateurs

### Issue #44 - CI/CD avec GitHub Actions
- **Labels** : `devops`, `v1.10.0`, `ci-cd`
- **Milestone** : v1.10.0
- **Description** : Pipeline CI/CD complet
- **Tâches** : Tests automatiques sur PR, linting/formatting, build auto, déploiement auto

---

## 📱 Version 2.0.0 - Applications Mobiles (6 issues)

### Issue #45 - Application React Native (iOS/Android)
- **Labels** : `enhancement`, `v2.0.0`, `mobile`, `react-native`
- **Milestone** : v2.0.0
- **Description** : Apps natives iOS et Android
- **Tâches** : Setup Expo, code partagé, navigation native, screens principales

### Issue #46 - Notifications push
- **Labels** : `enhancement`, `v2.0.0`, `mobile`, `notifications`
- **Milestone** : v2.0.0
- **Description** : Push notifications pour mobile
- **Tâches** : Firebase Cloud Messaging, notifications promos/statut, deep linking, badge

### Issue #47 - Mode offline mobile
- **Labels** : `enhancement`, `v2.0.0`, `mobile`, `offline`
- **Milestone** : v2.0.0
- **Description** : Consultation catalogue offline
- **Tâches** : AsyncStorage, sync data, cache images, indicateur connexion

### Issue #48 - Scan QR code / barcode
- **Labels** : `enhancement`, `v2.0.0`, `mobile`, `camera`
- **Milestone** : v2.0.0
- **Description** : Scanner pour produits
- **Tâches** : Intégration camera, scan QR/barcode, recherche produit, ajout panier

### Issue #49 - White-label configuration
- **Labels** : `enhancement`, `v2.0.0`, `mobile`, `branding`
- **Milestone** : v2.0.0
- **Description** : Apps personnalisées par boutique
- **Tâches** : Config branding, icône/splash custom, nom app, build automatisé

### Issue #50 - Documentation publication app stores
- **Labels** : `documentation`, `v2.0.0`, `mobile`
- **Milestone** : v2.0.0
- **Description** : Guide publication Apple/Google
- **Tâches** : Guide App Store, guide Google Play, guide white-labeling, screenshots/videos

---

## 🎯 Résumé

**Total : 50 issues**

- v1.1.0 : 4 issues
- v1.2.0 : 4 issues
- v1.3.0 : 5 issues
- v1.4.0 : 4 issues
- v1.5.0 : 5 issues
- v1.6.0 : 6 issues
- v1.7.0 : 4 issues
- v1.8.0 : 4 issues
- v1.9.0 : 4 issues
- v1.10.0 : 4 issues
- v2.0.0 : 6 issues

---

## 📝 Création Manuelle des Issues

Si le script automatique ne fonctionne pas, vous pouvez créer les issues manuellement :

1. Allez sur : https://github.com/StudioCavalli/FoxCard/issues/new
2. Copiez le titre de l'issue
3. Copiez la description depuis le script `.github/create-issues.sh`
4. Ajoutez les labels appropriés
5. Assignez au milestone correspondant
6. Créez l'issue

---

**Dernière mise à jour** : Janvier 2025
