#!/bin/bash

# Script pour créer toutes les 50 issues GitHub de la roadmap FoxCard
# Prérequis : GitHub CLI (gh) installé et authentifié

echo "🦊 Création de TOUTES les issues de la roadmap FoxCard (v1.1.0 → v2.0.0)"
echo ""

# Vérifier que gh CLI est installé
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) n'est pas installé."
    echo "Installez-le depuis : https://cli.github.com/"
    exit 1
fi

# Vérifier l'authentification
if ! gh auth status &> /dev/null; then
    echo "❌ Vous n'êtes pas authentifié avec GitHub CLI."
    echo "Exécutez : gh auth login"
    exit 1
fi

echo "✅ GitHub CLI configuré"
echo ""

# Fonction pour créer une issue
create_issue() {
    local title="$1"
    local body="$2"
    local labels="$3"
    local milestone="$4"

    gh issue create \
      --title "$title" \
      --body "$body" \
      --label "$labels" \
      ${milestone:+--milestone "$milestone"}

    if [ $? -eq 0 ]; then
        echo "✅ Créé: $title"
    else
        echo "❌ Erreur: $title"
    fi
}

# Version 1.1.0 - Installeur & Configuration (4 issues)
echo "📦 Création des issues v1.1.0..."

create_issue \
  "Créer l'installeur web wizard" \
  "## Description
Créer un installeur web style WordPress qui permet de configurer FoxCard en quelques clics sans éditer le fichier .env.

## Fonctionnalités
- [ ] Interface wizard avec étapes de configuration
- [ ] Détection automatique de l'environnement (Node.js, DB)
- [ ] Vérification des prérequis
- [ ] Test de connexion base de données
- [ ] Génération automatique du fichier .env
- [ ] Page de succès avec liens vers admin et site

## Acceptance Criteria
- L'installeur doit fonctionner sans connaissance technique
- Toutes les erreurs doivent être claires et actionnables
- L'installation complète doit prendre < 5 minutes" \
  "enhancement,v1.1.0,installer" \
  "v1.1.0"

create_issue \
  "Implémenter le support PostgreSQL" \
  "## Description
Ajouter le support de PostgreSQL en plus de MongoDB, avec détection automatique dans l'installeur.

## Fonctionnalités
- [ ] Adapter le schéma Prisma pour PostgreSQL
- [ ] Migration des données MongoDB → PostgreSQL (script)
- [ ] Tests sur les deux bases de données
- [ ] Documentation des différences

## Acceptance Criteria
- Les deux bases de données doivent avoir exactement les mêmes fonctionnalités
- Les performances doivent être comparables
- Les tests doivent passer sur les deux BDD" \
  "enhancement,v1.1.0,database" \
  "v1.1.0"

create_issue \
  "Interface de gestion des variables d'environnement" \
  "## Description
Créer une interface admin pour gérer les variables d'environnement (SMTP, Stripe, R2, etc.) sans éditer le fichier .env.

## Fonctionnalités
- [ ] Page /admin/settings/env
- [ ] Catégories : Database, SMTP, Stripe, R2, Auth
- [ ] Formulaires avec validation
- [ ] Masquage des secrets (afficher ****)
- [ ] Test de connexion pour chaque service
- [ ] Sauvegarde sécurisée dans la base de données

## Tâches Techniques
- [ ] Modèle EnvVariable dans Prisma (key, value, category, isSecret)
- [ ] Chiffrement des valeurs sensibles (AES-256)
- [ ] Router tRPC pour CRUD des variables
- [ ] Interface admin avec formulaires par catégorie
- [ ] Surcharge des process.env au runtime

## Acceptance Criteria
- Les secrets doivent être chiffrés en base de données
- Chaque modification doit demander confirmation
- Les changements doivent être appliqués sans restart (sauf DB)
- Interface intuitive pour utilisateurs non-techniques" \
  "enhancement,v1.1.0,admin" \
  "v1.1.0"

create_issue \
  "Documentation d'installation simplifiée" \
  "## Description
Mettre à jour la documentation pour inclure l'installeur en 1-clic.

## Contenu
- [ ] Guide d'installation en 5 minutes (avec installeur)
- [ ] Guide d'installation manuelle (pour développeurs)
- [ ] Guide de migration depuis installation manuelle
- [ ] Vidéo de démonstration (5 min)
- [ ] FAQ installation

## Acceptance Criteria
- Un utilisateur novice doit pouvoir installer FoxCard en suivant le guide
- Tous les cas d'erreur courants doivent être documentés
- La vidéo doit être < 5 minutes" \
  "documentation,v1.1.0" \
  "v1.1.0"

# Version 1.2.0 - Paiements (4 issues)
echo "💳 Création des issues v1.2.0..."

create_issue \
  "Intégration PayPal Checkout" \
  "## Description
Ajouter PayPal comme méthode de paiement alternative à Stripe.

## Fonctionnalités
- [ ] PayPal Checkout SDK
- [ ] Création de commande PayPal
- [ ] Capture du paiement
- [ ] Webhooks PayPal
- [ ] Gestion des remboursements

## Acceptance Criteria
- Le paiement PayPal doit être aussi fluide que Stripe
- Les webhooks doivent être traités correctement
- Support des remboursements complets et partiels" \
  "enhancement,v1.2.0,payment" \
  "v1.2.0"

create_issue \
  "Support Apple Pay / Google Pay" \
  "## Description
Ajouter Apple Pay et Google Pay via l'intégration Stripe.

## Fonctionnalités
- [ ] Boutons Apple Pay / Google Pay dans le checkout
- [ ] Support mobile et desktop
- [ ] Remplissage automatique des données
- [ ] Tests sur devices réels

## Acceptance Criteria
- Les boutons doivent apparaître automatiquement si disponibles
- Le paiement doit être traité en < 5 secondes
- Les données doivent être auto-remplies correctement" \
  "enhancement,v1.2.0,payment" \
  "v1.2.0"

create_issue \
  "Module de virement bancaire" \
  "## Description
Ajouter le virement bancaire comme méthode de paiement manuelle.

## Fonctionnalités
- [ ] Affichage des instructions de virement
- [ ] Upload de preuve de paiement
- [ ] Validation manuelle par admin
- [ ] Notification au client après validation
- [ ] Timeout configurable (ex: 7 jours)

## Acceptance Criteria
- Les instructions doivent être claires et copiables
- L'admin doit pouvoir valider/rejeter facilement
- Les clients doivent recevoir des notifications à chaque étape" \
  "enhancement,v1.2.0,payment" \
  "v1.2.0"

create_issue \
  "Interface admin de gestion des paiements" \
  "## Description
Page admin centralisée pour gérer toutes les méthodes de paiement.

## Fonctionnalités
- [ ] Activation/désactivation par méthode
- [ ] Configuration de chaque méthode (clés API)
- [ ] Ordre d'affichage dans le checkout
- [ ] Frais supplémentaires par méthode (optionnel)
- [ ] Statistiques par méthode

## Acceptance Criteria
- Configuration possible sans toucher au code
- Changements appliqués immédiatement
- Interface intuitive pour non-développeurs" \
  "enhancement,v1.2.0,admin,payment" \
  "v1.2.0"

# Version 1.3.0 - Notifications (5 issues)
echo "📧 Création des issues v1.3.0..."

create_issue \
  "Système d'emails transactionnels" \
  "## Description
Système complet d'envoi d'emails transactionnels avec templates.

## Emails à Implémenter
- [ ] Confirmation de commande
- [ ] Mise à jour de statut de commande
- [ ] Facture (avec PDF)
- [ ] Email de bienvenue
- [ ] Réinitialisation de mot de passe
- [ ] Code promo personnel

## Tâches Techniques
- [ ] Configuration SMTP (Nodemailer)
- [ ] Templates HTML avec React Email
- [ ] Queue d'envoi avec BullMQ
- [ ] Tracking des ouvertures (pixel)
- [ ] Retry automatique en cas d'échec

## Acceptance Criteria
- Les emails doivent être responsive
- Support du dark mode dans les emails
- Délai d'envoi < 30 secondes
- Taux de délivrabilité > 95%" \
  "enhancement,v1.3.0,email" \
  "v1.3.0"

create_issue \
  "Éditeur de templates email" \
  "## Description
Éditeur visuel pour personnaliser les templates d'emails sans code.

## Fonctionnalités
- [ ] Éditeur WYSIWYG (Unlayer ou similaire)
- [ ] Variables dynamiques
- [ ] Preview en temps réel
- [ ] Support multi-langue
- [ ] Branding personnalisé (logo, couleurs)
- [ ] Templates prédéfinis

## Acceptance Criteria
- L'éditeur doit être utilisable par un non-développeur
- Les emails générés doivent être compatibles tous clients email
- Support de Gmail, Outlook, Apple Mail, etc." \
  "enhancement,v1.3.0,email,admin" \
  "v1.3.0"

create_issue \
  "Génération de factures PDF" \
  "## Description
Génération automatique de factures PDF pour chaque commande.

## Fonctionnalités
- [ ] Template de facture personnalisable
- [ ] Génération automatique après paiement
- [ ] Envoi par email
- [ ] Téléchargement depuis l'espace client
- [ ] Téléchargement depuis l'admin
- [ ] Numérotation séquentielle

## Tâches Techniques
- [ ] Utiliser Puppeteer ou jsPDF
- [ ] Template HTML → PDF
- [ ] Upload automatique vers R2
- [ ] Relation Invoice dans Prisma
- [ ] Endpoint de téléchargement sécurisé

## Acceptance Criteria
- Les factures doivent être conformes à la législation
- Format PDF/A pour archivage
- Génération < 5 secondes" \
  "enhancement,v1.3.0,orders,pdf" \
  "v1.3.0"

create_issue \
  "Intégration SMS (Twilio)" \
  "## Description
Module optionnel d'envoi de SMS via Twilio.

## Fonctionnalités
- [ ] Configuration Twilio dans admin
- [ ] SMS de confirmation de commande
- [ ] SMS de suivi de livraison
- [ ] Activation/désactivation par événement
- [ ] Fallback si échec

## Acceptance Criteria
- Configuration simple dans l'admin
- Support des numéros internationaux
- Respect du RGPD (opt-in)" \
  "enhancement,v1.3.0,sms,optional" \
  "v1.3.0"

create_issue \
  "Module newsletter" \
  "## Description
Système de newsletters pour le marketing email.

## Fonctionnalités
- [ ] Base de données d'abonnés
- [ ] Formulaire d'inscription
- [ ] Double opt-in
- [ ] Éditeur de newsletters
- [ ] Envoi planifié
- [ ] Statistiques (taux d'ouverture, clics)
- [ ] Désabonnement facile (1-clic)

## Acceptance Criteria
- Respect du RGPD
- Envoi < 1000 emails/minute
- Lien de désabonnement dans tous les emails" \
  "enhancement,v1.3.0,email,marketing" \
  "v1.3.0"

# Version 1.4.0 - Multi-utilisateurs (4 issues)
echo "👥 Création des issues v1.4.0..."

create_issue \
  "Système de rôles et permissions" \
  "## Description
Implémenter un système de rôles et permissions granulaires pour gérer les accès à l'interface d'administration.

## Fonctionnalités
- [ ] Modèle Role et Permission dans Prisma
- [ ] Rôles prédéfinis (Owner, Admin, Manager, Staff)
- [ ] Permissions granulaires (products.create, orders.view, etc.)
- [ ] Middleware de vérification des permissions
- [ ] Interface de création de rôles personnalisés

## Acceptance Criteria
- Les permissions doivent être vérifiées côté serveur (tRPC middleware)
- Les rôles personnalisés doivent pouvoir être créés sans code
- L'interface doit clairement indiquer les permissions manquantes" \
  "enhancement,v1.4.0,auth,admin" \
  "v1.4.0"

create_issue \
  "Interface de gestion des utilisateurs" \
  "## Description
Créer une interface complète pour gérer les utilisateurs de l'administration.

## Fonctionnalités
- [ ] Page /admin/users avec liste des utilisateurs
- [ ] Invitation d'utilisateurs par email
- [ ] Attribution et modification des rôles
- [ ] Désactivation/réactivation de comptes
- [ ] Historique des connexions
- [ ] Filtres et recherche

## Acceptance Criteria
- Seuls les Owners et Admins peuvent gérer les utilisateurs
- Les utilisateurs doivent recevoir un email d'invitation
- La désactivation doit être réversible (soft delete)" \
  "enhancement,v1.4.0,admin" \
  "v1.4.0"

create_issue \
  "Système d'audit logs" \
  "## Description
Enregistrer toutes les actions importantes effectuées dans l'admin pour traçabilité et sécurité.

## Fonctionnalités
- [ ] Modèle AuditLog (user, action, entity, changes, timestamp)
- [ ] Middleware d'enregistrement automatique
- [ ] Page /admin/audit-logs avec filtres avancés
- [ ] Export CSV des logs
- [ ] Rétention configurable (ex: 90 jours)

## Acceptance Criteria
- Toutes les actions CRUD doivent être loggées
- Les logs doivent inclure les valeurs avant/après modification
- L'interface doit permettre de filtrer par utilisateur, action, date" \
  "enhancement,v1.4.0,admin,security" \
  "v1.4.0"

create_issue \
  "Invitation d'utilisateurs par email" \
  "## Description
Système d'invitation sécurisé pour ajouter de nouveaux utilisateurs admin.

## Fonctionnalités
- [ ] Génération de tokens d'invitation uniques
- [ ] Email avec lien d'inscription
- [ ] Page de création de compte avec token
- [ ] Validation du token et expiration (7 jours)
- [ ] Attribution du rôle lors de l'invitation

## Acceptance Criteria
- Les tokens doivent être à usage unique
- Les tokens expirés doivent être rejetés
- L'email doit contenir toutes les infos nécessaires" \
  "enhancement,v1.4.0,email,auth" \
  "v1.4.0"

# Version 1.5.0 - Éditeur de thèmes (5 issues)
echo "🎨 Création des issues v1.5.0..."

create_issue \
  "Éditeur visuel de thèmes" \
  "## Description
Créer un éditeur drag & drop complet pour personnaliser les thèmes sans code.

## Fonctionnalités
- [ ] Drag & drop des sections (header, hero, products, footer)
- [ ] Customisation en temps réel (couleurs, fonts, spacing)
- [ ] Preview responsive (mobile, tablet, desktop)
- [ ] Système d'undo/redo
- [ ] Sauvegarde automatique
- [ ] Export/import de configurations

## Tâches Techniques
- [ ] Intégration GrapesJS ou similaire
- [ ] Sérialisation JSON des layouts
- [ ] Génération CSS dynamique
- [ ] Système de composants réutilisables

## Acceptance Criteria
- L'éditeur doit être utilisable par un non-développeur
- Les changements doivent être visibles en temps réel
- Support de tous les types de sections (hero, grille, carrousel, etc.)" \
  "enhancement,v1.5.0,themes,admin" \
  "v1.5.0"

create_issue \
  "Marketplace de thèmes" \
  "## Description
Créer un repository central de thèmes gratuits et premium pour FoxCard.

## Fonctionnalités
- [ ] Interface de découverte des thèmes
- [ ] Installation en 1-clic
- [ ] Preview live des thèmes
- [ ] Système de reviews et ratings
- [ ] Filtres (gratuit/premium, catégorie, popularité)
- [ ] Mises à jour automatiques

## Acceptance Criteria
- L'installation ne doit nécessiter aucune configuration manuelle
- Les previews doivent charger en < 3 secondes
- Les thèmes doivent être isolés (un thème ne doit pas casser l'installation)" \
  "enhancement,v1.5.0,themes,marketplace" \
  "v1.5.0"

create_issue \
  "Développer thème \"Minimal\"" \
  "## Description
Créer un thème minimaliste et élégant pour boutiques modernes.

## Design
- Style épuré, espaces généreux
- Typographie élégante
- Navigation simple
- Focus sur les images produits

## Tâches
- [ ] Design Figma complet
- [ ] Développement du thème
- [ ] Documentation d'utilisation
- [ ] Screenshots et démo
- [ ] Tests sur différents types de produits

## Acceptance Criteria
- Compatible avec tous les types de produits
- Performance Lighthouse > 95
- Responsive parfait sur tous devices" \
  "enhancement,v1.5.0,themes" \
  "v1.5.0"

create_issue \
  "Développer thème \"Luxe\"" \
  "## Description
Créer un thème haut de gamme pour produits premium.

## Design
- Typographie serif élégante
- Animations subtiles
- Palette de couleurs raffinée (noir, or, blanc)
- Focus sur l'expérience premium

## Tâches
- [ ] Design Figma complet
- [ ] Développement du thème
- [ ] Documentation d'utilisation
- [ ] Screenshots et démo
- [ ] Tests sur produits premium

## Acceptance Criteria
- Animations fluides 60 FPS
- Support du parallax scrolling
- Compatible produits avec variantes multiples" \
  "enhancement,v1.5.0,themes" \
  "v1.5.0"

create_issue \
  "Développer thème \"Tech\"" \
  "## Description
Créer un thème moderne pour produits technologiques.

## Design
- Style futuriste
- Dark mode natif
- Comparatif de produits intégré
- Specs techniques mise en avant

## Tâches
- [ ] Design Figma complet
- [ ] Développement du thème
- [ ] Documentation d'utilisation
- [ ] Screenshots et démo
- [ ] Tests avec produits tech

## Acceptance Criteria
- Dark mode parfait
- Tableau comparatif responsive
- Support des fiches techniques détaillées" \
  "enhancement,v1.5.0,themes" \
  "v1.5.0"

# Version 1.6.0 - Marketplace plugins (6 issues)
echo "🔌 Création des issues v1.6.0..."

create_issue \
  "Marketplace de plugins" \
  "## Description
Créer un écosystème complet de plugins pour étendre FoxCard.

## Fonctionnalités
- [ ] Interface de découverte des plugins
- [ ] Installation/désinstallation en 1-clic
- [ ] Mises à jour automatiques
- [ ] Système de reviews et ratings
- [ ] Configuration des plugins via UI
- [ ] Sandbox de sécurité

## Tâches Techniques
- [ ] API de registry des plugins
- [ ] Système de versioning (semver)
- [ ] Validation des plugins (tests auto)
- [ ] Documentation API plugins

## Acceptance Criteria
- Les plugins ne doivent pas pouvoir casser l'installation
- L'installation doit prendre < 30 secondes
- Les plugins doivent être hot-reloadable" \
  "enhancement,v1.6.0,plugins,marketplace" \
  "v1.6.0"

create_issue \
  "Plugins shipping (Colissimo, UPS, DHL)" \
  "## Description
Créer des plugins pour les transporteurs majeurs.

## Plugins à Développer
- [ ] Colissimo (API + tracking)
- [ ] UPS (API + tracking)
- [ ] DHL (API + tracking)
- [ ] Chronopost
- [ ] Mondial Relay

## Fonctionnalités
- [ ] Calcul automatique des frais de port
- [ ] Génération d'étiquettes
- [ ] Tracking en temps réel
- [ ] Webhooks de statut

## Acceptance Criteria
- Les tarifs doivent être mis à jour automatiquement
- Le tracking doit fonctionner pour 100% des colis
- Support des retours" \
  "enhancement,v1.6.0,plugins,shipping" \
  "v1.6.0"

create_issue \
  "Plugins marketing (pop-ups, exit intent)" \
  "## Description
Créer des outils marketing pour augmenter les conversions.

## Plugins à Développer
- [ ] Pop-ups personnalisables
- [ ] Exit intent (détection sortie)
- [ ] Codes promo automatiques
- [ ] Upsell/Cross-sell intelligent
- [ ] Panier abandonné

## Fonctionnalités
- [ ] Éditeur visuel de pop-ups
- [ ] Règles de déclenchement (temps, scroll, pages)
- [ ] A/B testing intégré
- [ ] Statistiques de conversion

## Acceptance Criteria
- Les pop-ups ne doivent pas impacter le SEO
- Respect des réglementations (RGPD, bouton fermeture)
- Taux de conversion mesurable" \
  "enhancement,v1.6.0,plugins,marketing" \
  "v1.6.0"

create_issue \
  "Plugins SEO avancés" \
  "## Description
Automatiser et optimiser le SEO de FoxCard.

## Fonctionnalités
- [ ] Génération automatique de Schema.org
- [ ] Gestionnaire de redirections 301
- [ ] Sitemap avancé (images, vidéos, actualités)
- [ ] Génération automatique de meta descriptions
- [ ] Audit SEO en temps réel
- [ ] Suggestions d'optimisation

## Acceptance Criteria
- Schema.org valide sur tous les produits
- Redirections sans perte de SEO
- Sitemap conforme aux standards Google" \
  "enhancement,v1.6.0,plugins,seo" \
  "v1.6.0"

create_issue \
  "Plugins analytics" \
  "## Description
Intégrations avec les principales plateformes d'analytics.

## Plugins à Développer
- [ ] Google Analytics 4
- [ ] Facebook Pixel
- [ ] Matomo (auto-hébergé)
- [ ] TikTok Pixel
- [ ] Hotjar

## Fonctionnalités
- [ ] Configuration via UI (no code)
- [ ] Events e-commerce trackés automatiquement
- [ ] Consentement RGPD
- [ ] Dashboard unifié

## Acceptance Criteria
- Tous les events e-commerce doivent être trackés
- Respect du RGPD (opt-in/opt-out)
- Configuration en < 5 minutes" \
  "enhancement,v1.6.0,plugins,analytics" \
  "v1.6.0"

create_issue \
  "SDK et CLI pour développeurs" \
  "## Description
Créer des outils pour faciliter le développement de plugins.

## Outils à Créer
- [ ] CLI create-foxcard-plugin
- [ ] Templates de plugins (starter kits)
- [ ] Documentation complète de l'API
- [ ] Hot reload pour développement
- [ ] Tests automatiques
- [ ] Validation avant publication

## Fonctionnalités CLI
- [ ] npx create-foxcard-plugin mon-plugin
- [ ] Génération de boilerplate
- [ ] Dev server avec hot reload
- [ ] Commandes de build et publish

## Acceptance Criteria
- Un développeur doit pouvoir créer un plugin en < 30 minutes
- La documentation doit couvrir tous les use cases courants
- Hot reload doit fonctionner sans redémarrer" \
  "enhancement,v1.6.0,plugins,developer-experience" \
  "v1.6.0"

# Version 1.7.0 - Analytics (4 issues)
echo "📊 Création des issues v1.7.0..."

create_issue \
  "Dashboard analytics avancé" \
  "## Description
Créer un dashboard analytics temps réel complet dans l'admin.

## Fonctionnalités
- [ ] Graphiques de ventes (jour, semaine, mois, année)
- [ ] Taux de conversion du funnel
- [ ] Top produits (ventes, vues, panier abandonné)
- [ ] Sources de trafic
- [ ] Temps réel (visiteurs actuels)
- [ ] Comparaisons de périodes

## Tâches Techniques
- [ ] Charts avec Recharts ou Chart.js
- [ ] WebSocket pour temps réel
- [ ] Caching Redis pour perf
- [ ] Export des données

## Acceptance Criteria
- Dashboard doit charger en < 2 secondes
- Données temps réel avec latence < 5 secondes
- Mobile responsive" \
  "enhancement,v1.7.0,analytics,admin" \
  "v1.7.0"

create_issue \
  "Système de rapports exportables" \
  "## Description
Générer des rapports détaillés exportables en PDF et Excel.

## Types de Rapports
- [ ] Rapport de ventes (détaillé, par produit, par catégorie)
- [ ] Rapport de clients (acquisition, rétention, LTV)
- [ ] Rapport de produits (performances, stock, marge)
- [ ] Analyse de cohortes
- [ ] Paniers abandonnés

## Fonctionnalités
- [ ] Génération PDF avec graphiques
- [ ] Export Excel avec données brutes
- [ ] Planification automatique (quotidien, hebdo, mensuel)
- [ ] Envoi par email

## Acceptance Criteria
- Génération PDF < 10 secondes
- Excel avec formules et mise en forme
- Rapports planifiés envoyés à l'heure exacte" \
  "enhancement,v1.7.0,analytics,export" \
  "v1.7.0"

create_issue \
  "Module de prévisions" \
  "## Description
Utiliser le machine learning pour prévoir les ventes et le stock.

## Fonctionnalités
- [ ] Prévisions de ventes (7, 30, 90 jours)
- [ ] Prévisions de stock (alertes rupture)
- [ ] Détection de tendances (produits en hausse/baisse)
- [ ] Saisonnalité automatique
- [ ] Recommandations d'actions

## Tâches Techniques
- [ ] Algorithme de ML basique (ARIMA ou Prophet)
- [ ] Entrainement sur historique de données
- [ ] Mise à jour quotidienne des prévisions
- [ ] Visualisation des prédictions

## Acceptance Criteria
- Précision > 70% sur prévisions 7 jours
- Détection automatique des tendances
- Interface claire et actionnable" \
  "enhancement,v1.7.0,analytics,ai" \
  "v1.7.0"

create_issue \
  "A/B testing intégré" \
  "## Description
Système de tests A/B pour optimiser les conversions.

## Fonctionnalités
- [ ] Tests sur pages produits (prix, images, descriptions)
- [ ] Tests sur checkout (formulaire, paiement)
- [ ] Tests sur homepage (hero, CTA)
- [ ] Répartition du trafic (50/50 ou custom)
- [ ] Statistiques de significance
- [ ] Déclaration automatique du gagnant

## Tâches Techniques
- [ ] Modèle ABTest dans Prisma
- [ ] Middleware de routing des variantes
- [ ] Calcul statistique (p-value, confidence)
- [ ] Interface admin de création de tests

## Acceptance Criteria
- Les tests doivent être faciles à créer (no code)
- Les résultats doivent être statistiquement significatifs
- Impact SEO nul (même URL)" \
  "enhancement,v1.7.0,marketing,testing" \
  "v1.7.0"

# Version 1.8.0 - Multi-entrepôts (4 issues)
echo "🏪 Création des issues v1.8.0..."

create_issue \
  "Système multi-entrepôts" \
  "## Description
Gérer plusieurs entrepôts avec stock indépendant par localisation.

## Fonctionnalités
- [ ] Modèle Warehouse dans Prisma (nom, adresse, contact)
- [ ] Stock par produit et par entrepôt
- [ ] Transferts entre entrepôts
- [ ] Localisation géographique (lat/lng)
- [ ] Interface admin de gestion des entrepôts

## Tâches Techniques
- [ ] Relation Product <-> Warehouse <-> Stock
- [ ] Historique des transferts
- [ ] Validation des quantités
- [ ] Calcul du stock total

## Acceptance Criteria
- Le stock doit être correct en temps réel
- Les transferts doivent être traçables
- Interface intuitive pour ajouter/gérer les entrepôts" \
  "enhancement,v1.8.0,inventory,admin" \
  "v1.8.0"

create_issue \
  "Règles d'allocation intelligente" \
  "## Description
Allouer automatiquement les commandes à l'entrepôt optimal.

## Algorithme d'Allocation
- [ ] Priorisation par distance (client ↔ entrepôt)
- [ ] Disponibilité du stock
- [ ] Coûts d'expédition
- [ ] Split de commande si nécessaire (plusieurs entrepôts)

## Fonctionnalités
- [ ] Configuration des règles (admin)
- [ ] Simulation avant allocation
- [ ] Override manuel possible
- [ ] Historique des décisions

## Acceptance Criteria
- L'algorithme doit choisir l'entrepôt optimal en < 1 seconde
- Les split de commandes doivent être transparents pour le client
- Économies mesurables sur les frais d'expédition" \
  "enhancement,v1.8.0,inventory,ai" \
  "v1.8.0"

create_issue \
  "Gestion avancée du stock" \
  "## Description
Suivi en temps réel du stock avec alertes et automatisation.

## Fonctionnalités
- [ ] Alertes stock bas (configurable par produit)
- [ ] Suggestions de réapprovisionnement automatique
- [ ] Historique des mouvements de stock
- [ ] Inventaire physique (comptage)
- [ ] Ajustements de stock avec justification

## Tâches Techniques
- [ ] Modèle StockMovement (type, quantity, reason)
- [ ] Job quotidien pour alertes
- [ ] Export des mouvements pour audit
- [ ] Interface de comptage d'inventaire

## Acceptance Criteria
- Alertes envoyées avant rupture de stock
- Traçabilité complète de tous les mouvements
- Interface mobile pour inventaire physique" \
  "enhancement,v1.8.0,inventory,admin" \
  "v1.8.0"

create_issue \
  "Rapports d'inventaire" \
  "## Description
Analyser l'inventaire pour optimiser le stock et réduire les coûts.

## Rapports
- [ ] Valeur du stock (par entrepôt, par catégorie)
- [ ] Taux de rotation des produits
- [ ] Produits obsolètes (0 vente depuis X jours)
- [ ] Prévisions de réapprovisionnement
- [ ] Analyse ABC (produits à haute valeur)

## Fonctionnalités
- [ ] Visualisations graphiques
- [ ] Export PDF/Excel
- [ ] Planification automatique
- [ ] Recommandations d'actions

## Acceptance Criteria
- Calculs corrects et vérifiables
- Rapports générés en < 10 secondes
- Recommandations actionnables" \
  "enhancement,v1.8.0,inventory,analytics" \
  "v1.8.0"

# Version 1.9.0 - Déploiement (4 issues)
echo "🐳 Création des issues v1.9.0..."

create_issue \
  "Docker Compose production" \
  "## Description
Créer une configuration Docker Compose complète pour production.

## Services à Configurer
- [ ] Next.js (production build)
- [ ] MongoDB (avec replica set)
- [ ] Redis (cache + queue)
- [ ] MinIO (S3-compatible storage)
- [ ] Nginx (reverse proxy)

## Configuration
- [ ] Variables d'environnement
- [ ] Volumes persistants
- [ ] Networking interne
- [ ] Health checks
- [ ] Logs centralisés
- [ ] Backup automatique

## Acceptance Criteria
- Un seul docker-compose up doit démarrer tout
- Les données doivent persister après restart
- SSL/HTTPS configuré via Let's Encrypt" \
  "enhancement,v1.9.0,devops,docker" \
  "v1.9.0"

create_issue \
  "Templates one-click deploy" \
  "## Description
Créer des templates pour déployer FoxCard en 1-clic sur différentes plateformes.

## Plateformes
- [ ] Vercel (avec MongoDB Atlas)
- [ ] Railway
- [ ] Render
- [ ] DigitalOcean App Platform
- [ ] Heroku

## Contenu des Templates
- [ ] Fichiers de configuration (vercel.json, railway.toml, etc.)
- [ ] Variables d'environnement pré-configurées
- [ ] Documentation spécifique par plateforme
- [ ] Boutons \"Deploy to\" dans README

## Acceptance Criteria
- Déploiement complet en < 10 minutes
- Configuration minimale requise
- Documentation claire pour chaque plateforme" \
  "enhancement,v1.9.0,devops,deployment" \
  "v1.9.0"

create_issue \
  "Documentation déploiement VPS" \
  "## Description
Guide complet pour déployer FoxCard sur un VPS.

## Contenu
- [ ] Guide Ubuntu 22.04 / Debian 12
- [ ] Installation des dépendances (Node.js, MongoDB, Redis)
- [ ] Configuration Nginx (reverse proxy, SSL)
- [ ] SSL avec Let's Encrypt (certbot)
- [ ] Configuration de backup automatique
- [ ] Monitoring (PM2, logs)
- [ ] Mises à jour et maintenance

## Format
- [ ] Documentation Markdown
- [ ] Screenshots pour chaque étape
- [ ] Scripts d'installation automatisés
- [ ] Troubleshooting courant

## Acceptance Criteria
- Un utilisateur débutant doit pouvoir déployer en suivant le guide
- Toutes les commandes doivent être testées
- Guide de sécurisation inclus (firewall, fail2ban)" \
  "documentation,v1.9.0,devops" \
  "v1.9.0"

create_issue \
  "Intégration Redis et BullMQ" \
  "## Description
Implémenter Redis pour le cache et BullMQ pour les jobs asynchrones.

## Fonctionnalités
- [ ] Configuration Redis (cluster-ready)
- [ ] BullMQ pour jobs asynchrones
- [ ] Cache multi-niveaux (memory, Redis, DB)
- [ ] Queue pour emails
- [ ] Queue pour génération de PDFs
- [ ] Queue pour webhooks
- [ ] Monitoring des queues
- [ ] Retry automatique en cas d'échec

## Tâches Techniques
- [ ] Configuration Redis client (ioredis)
- [ ] Setup BullMQ avec workers
- [ ] Cache tRPC avec Redis
- [ ] Interface admin pour monitor les queues

## Acceptance Criteria
- Les jobs doivent être persistés (pas de perte en cas de crash)
- Retry exponentiel configuré
- Dashboard de monitoring des queues" \
  "enhancement,v1.9.0,infrastructure,performance" \
  "v1.9.0"

# Version 1.10.0 - Tests (4 issues)
echo "🧪 Création des issues v1.10.0..."

create_issue \
  "Suite de tests unitaires" \
  "## Description
Implémenter une suite complète de tests unitaires avec Jest.

## Tests à Créer
- [ ] Tests des fonctions utilitaires (formatPrice, formatDate, etc.)
- [ ] Tests des helpers (validation, transformation)
- [ ] Tests des validations Zod
- [ ] Tests des calculs (taxes, shipping, discounts)

## Configuration
- [ ] Setup Jest + TypeScript
- [ ] Coverage report (> 80%)
- [ ] Tests automatiques sur CI
- [ ] Fast tests (< 30 secondes)

## Acceptance Criteria
- Coverage > 80% sur les utilitaires
- Tests rapides et isolés
- Intégration CI/CD" \
  "testing,v1.10.0,quality" \
  "v1.10.0"

create_issue \
  "Tests d'intégration tRPC" \
  "## Description
Tester tous les routers tRPC pour garantir le fonctionnement de l'API.

## Tests à Créer
- [ ] Tests de tous les routers (product, order, user, etc.)
- [ ] Tests des webhooks Stripe
- [ ] Tests des paiements (mode test)
- [ ] Tests des permissions
- [ ] Tests des API REST externes

## Configuration
- [ ] Base de données de test (in-memory ou Docker)
- [ ] Fixtures pour données de test
- [ ] Mocking des API externes
- [ ] Tests parallélisés

## Acceptance Criteria
- Tous les endpoints testés
- Tests isolés (chaque test crée ses données)
- Temps d'exécution < 2 minutes" \
  "testing,v1.10.0,quality" \
  "v1.10.0"

create_issue \
  "Tests E2E Playwright" \
  "## Description
Créer des tests end-to-end avec Playwright pour valider les parcours utilisateurs.

## Tests à Créer
- [ ] Parcours complet utilisateur (navigation, recherche, panier, checkout)
- [ ] Création de commande avec paiement (mode test)
- [ ] Processus de paiement Stripe
- [ ] Interface admin (création produit, gestion commandes)
- [ ] Tests sur plusieurs navigateurs (Chrome, Firefox, Safari)

## Configuration
- [ ] Setup Playwright
- [ ] Tests headless pour CI
- [ ] Screenshots en cas d'échec
- [ ] Vidéos des tests

## Acceptance Criteria
- Coverage des parcours critiques
- Tests stables (pas de flaky tests)
- Temps d'exécution < 5 minutes" \
  "testing,v1.10.0,quality,e2e" \
  "v1.10.0"

create_issue \
  "CI/CD avec GitHub Actions" \
  "## Description
Mettre en place un pipeline CI/CD complet avec GitHub Actions.

## Pipeline
- [ ] Tests automatiques sur chaque PR
- [ ] Linting (ESLint, Prettier)
- [ ] Type checking (TypeScript)
- [ ] Build vérification
- [ ] Déploiement automatique (staging puis production)
- [ ] Notifications sur échec

## Fonctionnalités
- [ ] Tests parallélisés pour rapidité
- [ ] Cache des dépendances
- [ ] Preview deployments (Vercel)
- [ ] Protection de la branche main
- [ ] Release automatique avec tags

## Acceptance Criteria
- Pipeline complet en < 10 minutes
- Déploiement automatique après merge sur main
- Notifications sur échec (Slack/Discord)" \
  "devops,v1.10.0,ci-cd" \
  "v1.10.0"

# Version 2.0.0 - Applications mobiles (6 issues)
echo "📱 Création des issues v2.0.0..."

create_issue \
  "Application React Native (iOS/Android)" \
  "## Description
Développer une application mobile native avec React Native pour iOS et Android.

## Fonctionnalités
- [ ] Setup Expo avec TypeScript
- [ ] Code partagé avec le web (utils, types)
- [ ] Navigation native (React Navigation)
- [ ] Screens principales (home, produits, panier, profil)
- [ ] Authentification (NextAuth compatible)
- [ ] Checkout avec paiement natif

## Tâches Techniques
- [ ] Architecture mono-repo (apps/mobile)
- [ ] Partage du code tRPC
- [ ] Configuration des builds iOS/Android
- [ ] Deep linking (ouverture depuis liens web)

## Acceptance Criteria
- App fonctionnelle sur iOS et Android
- Performance 60 FPS
- Taille < 50 MB" \
  "enhancement,v2.0.0,mobile,react-native" \
  "v2.0.0"

create_issue \
  "Notifications push" \
  "## Description
Implémenter les notifications push pour les applications mobiles.

## Fonctionnalités
- [ ] Firebase Cloud Messaging (FCM)
- [ ] Notifications de promotions
- [ ] Notifications de statut de commande
- [ ] Notifications personnalisées
- [ ] Deep linking depuis notifications
- [ ] Badge de notifications non lues

## Tâches Techniques
- [ ] Configuration Firebase
- [ ] Token FCM enregistré en DB
- [ ] API d'envoi de notifications
- [ ] Gestion des permissions
- [ ] Tests sur iOS et Android

## Acceptance Criteria
- Notifications reçues en < 5 secondes
- Deep linking fonctionnel
- Respect des permissions utilisateur" \
  "enhancement,v2.0.0,mobile,notifications" \
  "v2.0.0"

create_issue \
  "Mode offline mobile" \
  "## Description
Permettre la consultation du catalogue en mode offline.

## Fonctionnalités
- [ ] AsyncStorage pour cache local
- [ ] Synchronisation des données (produits, catégories)
- [ ] Cache des images produits
- [ ] Indicateur de connexion
- [ ] Synchronisation automatique au retour online

## Tâches Techniques
- [ ] Stratégie de cache (Cache-First)
- [ ] Détection de la connectivité
- [ ] Gestion des conflits de sync
- [ ] Taille limite du cache (500 MB)

## Acceptance Criteria
- Navigation complète du catalogue en offline
- Images chargées depuis le cache
- Indication claire du mode offline" \
  "enhancement,v2.0.0,mobile,offline" \
  "v2.0.0"

create_issue \
  "Scan QR code / barcode" \
  "## Description
Ajouter la possibilité de scanner des QR codes et codes-barres pour rechercher des produits.

## Fonctionnalités
- [ ] Intégration caméra native
- [ ] Scan QR code
- [ ] Scan code-barres (EAN-13, UPC)
- [ ] Recherche de produit après scan
- [ ] Ajout direct au panier

## Tâches Techniques
- [ ] Librairie expo-camera
- [ ] Parser de codes-barres
- [ ] Recherche produit par SKU/EAN
- [ ] Feedback visuel lors du scan

## Acceptance Criteria
- Scan instantané (< 1 seconde)
- Support de tous les formats courants
- Gestion des permissions caméra" \
  "enhancement,v2.0.0,mobile,camera" \
  "v2.0.0"

create_issue \
  "White-label configuration" \
  "## Description
Permettre à chaque boutique de créer sa propre application mobile personnalisée.

## Fonctionnalités
- [ ] Configuration du branding (logo, couleurs, nom)
- [ ] Icône et splash screen personnalisés
- [ ] Nom de l'app personnalisé
- [ ] Build automatisé (Expo EAS Build)
- [ ] Interface admin de configuration

## Tâches Techniques
- [ ] app.json dynamique généré depuis la config
- [ ] Script de génération des assets (icône, splash)
- [ ] Build automatique via EAS
- [ ] Distribution TestFlight/Google Play Beta

## Acceptance Criteria
- Une boutique doit pouvoir générer son app en < 30 minutes
- L'app doit être entièrement brandée
- Build réussi automatiquement" \
  "enhancement,v2.0.0,mobile,branding" \
  "v2.0.0"

create_issue \
  "Documentation publication app stores" \
  "## Description
Guide complet pour publier les applications sur l'App Store et Google Play.

## Contenu
- [ ] Guide Apple App Store (compte développeur, TestFlight, review)
- [ ] Guide Google Play Console (compte, tracks, review)
- [ ] Guide du white-labeling
- [ ] Screenshots et vidéos de présentation
- [ ] Textes de description optimisés
- [ ] Checklist avant publication

## Format
- [ ] Documentation Markdown détaillée
- [ ] Screenshots pour chaque étape
- [ ] Vidéos tutorielles
- [ ] Templates de textes et images

## Acceptance Criteria
- Un utilisateur doit pouvoir publier son app en suivant le guide
- Respect des guidelines Apple et Google
- Optimisation ASO (App Store Optimization)" \
  "documentation,v2.0.0,mobile" \
  "v2.0.0"

echo ""
echo "✅ Toutes les 50 issues créées avec succès!"
echo ""
echo "📊 Résumé:"
echo "   • v1.1.0 : 4 issues (Installeur & Configuration)"
echo "   • v1.2.0 : 4 issues (Paiements)"
echo "   • v1.3.0 : 5 issues (Notifications)"
echo "   • v1.4.0 : 4 issues (Multi-utilisateurs)"
echo "   • v1.5.0 : 5 issues (Éditeur de thèmes)"
echo "   • v1.6.0 : 6 issues (Marketplace plugins)"
echo "   • v1.7.0 : 4 issues (Analytics)"
echo "   • v1.8.0 : 4 issues (Multi-entrepôts)"
echo "   • v1.9.0 : 4 issues (Déploiement)"
echo "   • v1.10.0 : 4 issues (Tests)"
echo "   • v2.0.0 : 6 issues (Applications mobiles)"
echo ""
echo "🚀 Total : 50 issues créées pour la roadmap v1.0.0 → v2.0.0"
