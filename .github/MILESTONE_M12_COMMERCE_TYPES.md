# M12: Universal Commerce Types Adaptation

## Objectif
Rendre FoxCard 100% compatible avec tous les types de commerce (19 types) en adaptant l'interface, les formulaires produits, le checkout et les fonctionnalités spécifiques à chaque vertical.

## Types de Commerce Supportés

### Produits Physiques Standards
- ELECTRONICS - Électronique & Tech
- FASHION - Mode & Accessoires
- HOME - Maison & Jardin
- BEAUTY - Beauté & Santé
- SPORTS - Sports & Outdoor
- TOYS - Jouets & Jeux
- AUTOMOTIVE - Auto & Outils
- BOOKS - Livres & Papeterie
- PETS - Animalerie
- FOOD - Alimentation
- ALCOHOL - Vins & Spiritueux
- SEASONAL - Produits Saisonniers

### Produits Digitaux
- DIGITAL - Produits numériques (e-books, logiciels, cours)

### Services & Réservations
- SERVICES - Abonnements & Cartes cadeaux
- RESTAURANT - Restauration & Livraison
- HOTEL - Hébergements
- TRAVEL - Voyages & Transport
- RECREATION - Loisirs & Activités

---

## Issues du Milestone

### Phase 1: Infrastructure de Base

#### Issue #1: Commerce Type Configuration System
**Priorité:** P0 - Critical
**Labels:** backend, architecture

**Description:**
Créer un système de configuration par type de commerce qui définit les comportements spécifiques.

**Tasks:**
- [ ] Créer `lib/commerce-types/config.ts` avec la configuration de chaque type
- [ ] Définir les champs produits requis/optionnels par type
- [ ] Définir les options de checkout par type
- [ ] Définir les validations spécifiques (âge pour ALCOHOL, etc.)
- [ ] Créer les hooks `useCommerceType()` et `useCommerceConfig()`

**Configuration par type:**
```typescript
interface CommerceTypeConfig {
  type: CommerceType
  name: string
  icon: LucideIcon
  features: {
    hasPhysicalProducts: boolean
    hasDigitalProducts: boolean
    hasBookings: boolean
    hasSubscriptions: boolean
    requiresShipping: boolean
    requiresAgeVerification: boolean
    allowsPreorders: boolean
  }
  productFields: {
    required: string[]
    optional: string[]
    hidden: string[]
  }
  checkoutSteps: string[]
  paymentMethods: string[]
}
```

---

#### Issue #2: Dynamic Product Form by Commerce Type
**Priorité:** P0 - Critical
**Labels:** frontend, merchant

**Description:**
Adapter le formulaire de création/édition de produit selon le type de commerce.

**Tasks:**
- [ ] Créer `ProductFormElectronics` avec specs techniques
- [ ] Créer `ProductFormFashion` avec tailles/couleurs/matières
- [ ] Créer `ProductFormFood` avec allergènes, DLC, nutrition
- [ ] Créer `ProductFormAlcohol` avec degré, cépage, millésime
- [ ] Créer `ProductFormDigital` avec fichiers téléchargeables, licences
- [ ] Créer `ProductFormService` avec durée, disponibilité
- [ ] Créer `ProductFormBooking` avec dates, capacité, créneaux
- [ ] Créer `ProductFormHotel` avec type chambre, équipements, politique annulation
- [ ] Créer `ProductFormTravel` avec itinéraire, inclusions, dates
- [ ] Factory pattern pour sélectionner le bon formulaire

---

#### Issue #3: Product Variants System Enhancement
**Priorité:** P1 - High
**Labels:** backend, frontend

**Description:**
Améliorer le système de variantes pour supporter tous les types.

**Tasks:**
- [ ] FASHION: Tailles (XS-XXL, 36-50), Couleurs, Matières
- [ ] ELECTRONICS: Capacité (128GB, 256GB), Couleur, Version
- [ ] FOOD: Poids (250g, 500g, 1kg), Format
- [ ] HOTEL: Type chambre, Vue, Étage
- [ ] TRAVEL: Classe (Éco, Business, First), Dates
- [ ] Interface unifiée de gestion des variantes
- [ ] Prix dynamique par variante
- [ ] Stock par variante

---

### Phase 2: Checkout & Paiement

#### Issue #4: Adaptive Checkout Flow
**Priorité:** P0 - Critical
**Labels:** frontend, checkout

**Description:**
Adapter le tunnel de checkout selon le type de produits dans le panier.

**Tasks:**
- [ ] Checkout physique: Adresse livraison → Livraison → Paiement
- [ ] Checkout digital: Email → Paiement → Téléchargement immédiat
- [ ] Checkout booking: Sélection dates → Participants → Paiement → Confirmation
- [ ] Checkout mixte: Gérer panier avec produits physiques + digitaux
- [ ] Skip étape livraison si que du digital
- [ ] Formulaire réservation pour HOTEL/TRAVEL/RECREATION

---

#### Issue #5: Digital Products Delivery System
**Priorité:** P1 - High
**Labels:** backend, digital

**Description:**
Système de livraison pour produits digitaux.

**Tasks:**
- [ ] Upload de fichiers pour produits digitaux (PDF, ZIP, etc.)
- [ ] Génération de liens de téléchargement sécurisés
- [ ] Limitation du nombre de téléchargements
- [ ] Expiration des liens
- [ ] Email avec liens de téléchargement après paiement
- [ ] Page "Mes téléchargements" pour le client
- [ ] Gestion des licences logicielles

---

#### Issue #6: Booking & Reservation System
**Priorité:** P1 - High
**Labels:** backend, booking

**Description:**
Système de réservation pour HOTEL, TRAVEL, RECREATION, RESTAURANT.

**Tasks:**
- [ ] Calendrier de disponibilités
- [ ] Gestion des créneaux horaires
- [ ] Capacité et overbooking
- [ ] Confirmation de réservation par email
- [ ] Modification/annulation de réservation
- [ ] Politique d'annulation configurable
- [ ] Rappels automatiques avant la date
- [ ] QR Code pour check-in

---

#### Issue #7: Age Verification for Alcohol
**Priorité:** P0 - Critical
**Labels:** compliance, frontend

**Description:**
Vérification d'âge obligatoire pour les boutiques ALCOHOL.

**Tasks:**
- [ ] Modal de vérification d'âge à l'entrée de la boutique
- [ ] Stockage du consentement en session/cookie
- [ ] Checkbox obligatoire au checkout "Je certifie avoir 18+ ans"
- [ ] Blocage des livraisons dans certains pays
- [ ] Mention légale obligatoire sur les fiches produits
- [ ] Warning sur les dangers de l'alcool

---

### Phase 3: UI/UX par Type

#### Issue #8: Store Theme Presets by Commerce Type
**Priorité:** P2 - Medium
**Labels:** frontend, design

**Description:**
Thèmes prédéfinis optimisés pour chaque type de commerce.

**Tasks:**
- [ ] FASHION: Look épuré, grandes images, lookbook
- [ ] ELECTRONICS: Tech, specs prominentes, comparateur
- [ ] FOOD: Appétissant, filtres allergènes, nutrition
- [ ] BEAUTY: Élégant, swatches couleurs, avant/après
- [ ] HOTEL: Galerie immersive, carte, équipements
- [ ] RESTAURANT: Menu style, catégories plats, livraison time
- [ ] Sélection automatique du thème à la création de boutique

---

#### Issue #9: Product Card Variants by Type
**Priorité:** P2 - Medium
**Labels:** frontend, components

**Description:**
Cartes produits adaptées à chaque type de commerce.

**Tasks:**
- [ ] FASHION: Quick add avec sélecteur taille
- [ ] ELECTRONICS: Note moyenne, specs clés
- [ ] FOOD: Badges bio/vegan, prix au kg
- [ ] ALCOHOL: Millésime, notation Parker/Wine Spectator
- [ ] HOTEL: Prix/nuit, étoiles, équipements icônes
- [ ] TRAVEL: Dates, durée, "à partir de"
- [ ] RECREATION: Durée, niveau difficulté, âge minimum

---

#### Issue #10: Search & Filters by Commerce Type
**Priorité:** P2 - Medium
**Labels:** frontend, search

**Description:**
Filtres de recherche spécifiques par type de commerce.

**Tasks:**
- [ ] FASHION: Taille, couleur, marque, matière, genre
- [ ] ELECTRONICS: Marque, prix, specs (RAM, stockage), note
- [ ] FOOD: Allergènes, bio, vegan, sans gluten
- [ ] ALCOHOL: Type, région, cépage, millésime, prix
- [ ] BEAUTY: Type de peau, ingrédients, marque
- [ ] HOTEL: Étoiles, équipements, prix/nuit, localisation
- [ ] TRAVEL: Destination, dates, durée, budget
- [ ] RECREATION: Type activité, durée, âge, localisation

---

### Phase 4: Fonctionnalités Spécifiques

#### Issue #11: Restaurant-Specific Features
**Priorité:** P2 - Medium
**Labels:** restaurant, feature

**Description:**
Fonctionnalités spécifiques aux restaurants.

**Tasks:**
- [ ] Gestion des menus (entrée, plat, dessert, formules)
- [ ] Commande pour livraison avec créneaux
- [ ] Click & Collect avec horaires
- [ ] Options/suppléments par plat
- [ ] Allergènes obligatoires par plat
- [ ] Temps de préparation estimé
- [ ] Statut commande en temps réel
- [ ] Intégration livreurs (Stuart, Uber Eats API)

---

#### Issue #12: Hotel-Specific Features
**Priorité:** P2 - Medium
**Labels:** hotel, feature

**Description:**
Fonctionnalités spécifiques aux hôtels.

**Tasks:**
- [ ] Calendrier de disponibilités avec tarifs dynamiques
- [ ] Gestion des types de chambres
- [ ] Extras (petit-déjeuner, parking, spa)
- [ ] Politique d'annulation flexible
- [ ] Check-in/Check-out en ligne
- [ ] Multi-room booking
- [ ] Connexion Channel Manager (Booking, Airbnb)

---

#### Issue #13: Travel-Specific Features
**Priorité:** P2 - Medium
**Labels:** travel, feature

**Description:**
Fonctionnalités spécifiques aux voyages.

**Tasks:**
- [ ] Recherche multi-destination
- [ ] Comparateur de prix
- [ ] Gestion des passagers (adultes, enfants, bébés)
- [ ] Documents de voyage (billets, vouchers)
- [ ] Assurance voyage optionnelle
- [ ] Programme de fidélité miles
- [ ] Alertes prix

---

#### Issue #14: Subscription Products
**Priorité:** P2 - Medium
**Labels:** subscription, feature

**Description:**
Support des produits en abonnement.

**Tasks:**
- [ ] Fréquence de livraison (hebdo, mensuel, trimestriel)
- [ ] Gestion des abonnements client
- [ ] Pause/reprise d'abonnement
- [ ] Paiements récurrents (Stripe Subscriptions)
- [ ] Réductions pour abonnés
- [ ] Email rappel avant prélèvement

---

### Phase 5: Compliance & Legal

#### Issue #15: Legal Compliance by Commerce Type
**Priorité:** P1 - High
**Labels:** compliance, legal

**Description:**
Conformité légale selon le type de commerce.

**Tasks:**
- [ ] FOOD: Affichage nutritionnel obligatoire, DLC
- [ ] ALCOHOL: Vérification âge, mentions légales
- [ ] BEAUTY: Liste INCI, tests dermatologiques
- [ ] ELECTRONICS: Indice de réparabilité, garantie
- [ ] TRAVEL: Conditions générales de vente spécifiques
- [ ] HOTEL: Taxe de séjour automatique
- [ ] CGV templates par type de commerce

---

## Timeline Estimée

| Phase | Durée | Issues |
|-------|-------|--------|
| Phase 1: Infrastructure | 2 sprints | #1, #2, #3 |
| Phase 2: Checkout | 2 sprints | #4, #5, #6, #7 |
| Phase 3: UI/UX | 1 sprint | #8, #9, #10 |
| Phase 4: Features | 3 sprints | #11, #12, #13, #14 |
| Phase 5: Compliance | 1 sprint | #15 |

**Total: ~9 sprints**

---

## Definition of Done

- [ ] Tous les 19 types de commerce fonctionnels
- [ ] Formulaires produits adaptés par type
- [ ] Checkout adaptatif selon contenu panier
- [ ] Produits digitaux livrables automatiquement
- [ ] Système de réservation opérationnel
- [ ] Vérification âge pour ALCOHOL
- [ ] Filtres de recherche par type
- [ ] Tests E2E pour chaque type de commerce
- [ ] Documentation marchands mise à jour

---

## Notes Techniques

### Approche Recommandée
1. **Strategy Pattern** pour les comportements de checkout
2. **Factory Pattern** pour les formulaires produits
3. **Composition** plutôt qu'héritage pour les composants
4. **Feature Flags** pour déploiement progressif

### Modèle de Données
Utiliser le champ `commerceConfig` (Json) sur Store pour stocker la config spécifique:
```typescript
// Exemple pour ALCOHOL
{
  ageVerificationRequired: true,
  minimumAge: 18,
  legalWarnings: ["L'abus d'alcool est dangereux pour la santé"],
  blockedCountries: ["SA", "KW", "AE"]
}

// Exemple pour HOTEL
{
  checkInTime: "15:00",
  checkOutTime: "11:00",
  cancellationPolicy: "FREE_48H",
  taxeDeSejourPerNight: 2.50
}
```
