#!/bin/bash

# Script pour créer automatiquement les issues GitHub de la roadmap FoxCard
# Prérequis : GitHub CLI (gh) installé et authentifié

echo "🦊 Création des issues de la roadmap FoxCard v1.0.0 → v2.0.0"
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

# Version 1.1.0 - Installeur & Configuration
echo "📦 Création des issues v1.1.0..."

gh issue create \
  --title "Créer l'installeur web wizard" \
  --body "## Description
Créer un installeur web style WordPress qui permet de configurer FoxCard en quelques clics sans éditer le fichier .env.

## Fonctionnalités
- [ ] Interface wizard avec étapes de configuration
- [ ] Détection automatique de l'environnement (Node.js, DB)
- [ ] Vérification des prérequis
- [ ] Test de connexion base de données
- [ ] Génération automatique du fichier .env
- [ ] Page de succès avec liens vers admin et site

## Tâches Techniques
- [ ] Créer la page /install avec protection (redirect si déjà installé)
- [ ] Formulaire multi-étapes avec React Hook Form
- [ ] API endpoint pour valider la config
- [ ] Script d'initialisation de la base de données
- [ ] Génération du fichier .env côté serveur

## Acceptance Criteria
- L'installeur doit fonctionner sans connaissance technique
- Toutes les erreurs doivent être claires et actionnables
- L'installation complète doit prendre < 5 minutes" \
  --label "enhancement,v1.1.0,installer" \
  --milestone "v1.1.0"

gh issue create \
  --title "Implémenter le support PostgreSQL" \
  --body "## Description
Ajouter le support de PostgreSQL en plus de MongoDB, avec détection automatique dans l'installeur.

## Fonctionnalités
- [ ] Adapter le schéma Prisma pour PostgreSQL
- [ ] Migration des données MongoDB → PostgreSQL (script)
- [ ] Tests sur les deux bases de données
- [ ] Documentation des différences

## Tâches Techniques
- [ ] Modifier schema.prisma pour être compatible PostgreSQL
- [ ] Tester tous les routers tRPC avec PostgreSQL
- [ ] Créer un script de migration des données
- [ ] Mettre à jour la documentation

## Acceptance Criteria
- Les deux bases de données doivent avoir exactement les mêmes fonctionnalités
- Les performances doivent être comparables
- Les tests doivent passer sur les deux BDD" \
  --label "enhancement,v1.1.0,database" \
  --milestone "v1.1.0"

gh issue create \
  --title "Interface de gestion des variables d'environnement" \
  --body "## Description
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
  --label "enhancement,v1.1.0,admin" \
  --milestone "v1.1.0"

gh issue create \
  --title "Documentation d'installation simplifiée" \
  --body "## Description
Mettre à jour la documentation pour inclure l'installeur en 1-clic.

## Contenu
- [ ] Guide d'installation en 5 minutes (avec installeur)
- [ ] Guide d'installation manuelle (pour développeurs)
- [ ] Guide de migration depuis installation manuelle
- [ ] Vidéo de démonstration (5 min)
- [ ] FAQ installation

## Tâches
- [ ] Rédiger la documentation en Markdown
- [ ] Capturer les screenshots de l'installeur
- [ ] Enregistrer la vidéo de démonstration
- [ ] Traduire en EN, ES, DE

## Acceptance Criteria
- Un utilisateur novice doit pouvoir installer FoxCard en suivant le guide
- Tous les cas d'erreur courants doivent être documentés
- La vidéo doit être < 5 minutes" \
  --label "documentation,v1.1.0" \
  --milestone "v1.1.0"

# Version 1.2.0 - Paiements
echo "💳 Création des issues v1.2.0..."

gh issue create \
  --title "Intégration PayPal Checkout" \
  --body "## Description
Ajouter PayPal comme méthode de paiement alternative à Stripe.

## Fonctionnalités
- [ ] PayPal Checkout SDK
- [ ] Création de commande PayPal
- [ ] Capture du paiement
- [ ] Webhooks PayPal
- [ ] Gestion des remboursements

## Tâches Techniques
- [ ] Installer @paypal/checkout-server-sdk
- [ ] Router tRPC paypal.ts
- [ ] Composant PayPal Buttons
- [ ] Webhook endpoint /api/webhooks/paypal
- [ ] Tests en mode sandbox

## Acceptance Criteria
- Le paiement PayPal doit être aussi fluide que Stripe
- Les webhooks doivent être traités correctement
- Support des remboursements complets et partiels" \
  --label "enhancement,v1.2.0,payment" \
  --milestone "v1.2.0"

gh issue create \
  --title "Support Apple Pay / Google Pay" \
  --body "## Description
Ajouter Apple Pay et Google Pay via l'intégration Stripe.

## Fonctionnalités
- [ ] Boutons Apple Pay / Google Pay dans le checkout
- [ ] Support mobile et desktop
- [ ] Remplissage automatique des données
- [ ] Tests sur devices réels

## Tâches Techniques
- [ ] Stripe Payment Request Button API
- [ ] Détection automatique de la disponibilité
- [ ] UI adaptative selon le device
- [ ] Tests sur iOS et Android

## Acceptance Criteria
- Les boutons doivent apparaître automatiquement si disponibles
- Le paiement doit être traité en < 5 secondes
- Les données doivent être auto-remplies correctement" \
  --label "enhancement,v1.2.0,payment" \
  --milestone "v1.2.0"

gh issue create \
  --title "Module de virement bancaire" \
  --body "## Description
Ajouter le virement bancaire comme méthode de paiement manuelle.

## Fonctionnalités
- [ ] Affichage des instructions de virement
- [ ] Upload de preuve de paiement
- [ ] Validation manuelle par admin
- [ ] Notification au client après validation
- [ ] Timeout configurable (ex: 7 jours)

## Tâches Techniques
- [ ] Endpoint pour générer référence de virement
- [ ] Upload de fichier (preuve)
- [ ] Interface admin de validation
- [ ] Emails automatiques
- [ ] Annulation automatique après timeout

## Acceptance Criteria
- Les instructions doivent être claires et copiables
- L'admin doit pouvoir valider/rejeter facilement
- Les clients doivent recevoir des notifications à chaque étape" \
  --label "enhancement,v1.2.0,payment" \
  --milestone "v1.2.0"

gh issue create \
  --title "Interface admin de gestion des paiements" \
  --body "## Description
Page admin centralisée pour gérer toutes les méthodes de paiement.

## Fonctionnalités
- [ ] Activation/désactivation par méthode
- [ ] Configuration de chaque méthode (clés API)
- [ ] Ordre d'affichage dans le checkout
- [ ] Frais supplémentaires par méthode (optionnel)
- [ ] Statistiques par méthode

## Tâches Techniques
- [ ] Page /admin/settings/payments
- [ ] Modèle PaymentMethod dans Prisma
- [ ] Router tRPC pour configuration
- [ ] Interface drag & drop pour l'ordre
- [ ] Dashboard avec stats par méthode

## Acceptance Criteria
- Configuration possible sans toucher au code
- Changements appliqués immédiatement
- Interface intuitive pour non-développeurs" \
  --label "enhancement,v1.2.0,admin,payment" \
  --milestone "v1.2.0"

# Version 1.3.0 - Notifications
echo "📧 Création des issues v1.3.0..."

gh issue create \
  --title "Système d'emails transactionnels" \
  --body "## Description
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
  --label "enhancement,v1.3.0,email" \
  --milestone "v1.3.0"

gh issue create \
  --title "Éditeur de templates email" \
  --body "## Description
Éditeur visuel pour personnaliser les templates d'emails sans code.

## Fonctionnalités
- [ ] Éditeur WYSIWYG (Unlayer ou similaire)
- [ ] Variables dynamiques ({{customer_name}}, {{order_number}}, etc.)
- [ ] Preview en temps réel
- [ ] Support multi-langue
- [ ] Branding personnalisé (logo, couleurs)
- [ ] Templates prédéfinis

## Tâches Techniques
- [ ] Intégration d'un éditeur (Unlayer, MJML)
- [ ] Système de variables dynamiques
- [ ] Sauvegarde des templates en DB
- [ ] Preview avec données de test
- [ ] Export HTML

## Acceptance Criteria
- L'éditeur doit être utilisable par un non-développeur
- Les emails générés doivent être compatibles tous clients email
- Support de Gmail, Outlook, Apple Mail, etc." \
  --label "enhancement,v1.3.0,email,admin" \
  --milestone "v1.3.0"

gh issue create \
  --title "Génération de factures PDF" \
  --body "## Description
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
  --label "enhancement,v1.3.0,orders,pdf" \
  --milestone "v1.3.0"

gh issue create \
  --title "Intégration SMS (Twilio)" \
  --body "## Description
Module optionnel d'envoi de SMS via Twilio.

## Fonctionnalités
- [ ] Configuration Twilio dans admin
- [ ] SMS de confirmation de commande
- [ ] SMS de suivi de livraison
- [ ] Activation/désactivation par événement
- [ ] Fallback si échec

## Tâches Techniques
- [ ] Intégration Twilio SDK
- [ ] Router tRPC pour configuration et envoi
- [ ] Templates de SMS
- [ ] Queue d'envoi
- [ ] Logs des envois

## Acceptance Criteria
- Configuration simple dans l'admin
- Support des numéros internationaux
- Respect du RGPD (opt-in)" \
  --label "enhancement,v1.3.0,sms,optional" \
  --milestone "v1.3.0"

gh issue create \
  --title "Module newsletter" \
  --body "## Description
Système de newsletters pour le marketing email.

## Fonctionnalités
- [ ] Base de données d'abonnés
- [ ] Formulaire d'inscription
- [ ] Double opt-in
- [ ] Éditeur de newsletters
- [ ] Envoi planifié
- [ ] Statistiques (taux d'ouverture, clics)
- [ ] Désabonnement facile (1-clic)

## Tâches Techniques
- [ ] Modèle Subscriber dans Prisma
- [ ] Router tRPC pour gestion abonnés
- [ ] Éditeur de newsletters (réutiliser éditeur email)
- [ ] Queue d'envoi en masse avec rate limiting
- [ ] Tracking des ouvertures et clics

## Acceptance Criteria
- Respect du RGPD
- Envoi < 1000 emails/minute
- Lien de désabonnement dans tous les emails" \
  --label "enhancement,v1.3.0,email,marketing" \
  --milestone "v1.3.0"

# On continue avec les autres versions...
echo ""
echo "✅ Issues de base créées pour v1.1.0 à v1.3.0"
echo ""
echo "Pour continuer la création des issues pour v1.4.0 à v2.0.0,"
echo "exécutez : ./create-issues-part2.sh"
echo ""
echo "📋 Consultez la roadmap complète : .github/ROADMAP.md"
