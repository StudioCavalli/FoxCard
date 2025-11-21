# Milestone M9: Multi-Shop System - Plan d'Implémentation

## 🎯 Objectif
Implémenter un système multi-shop/multi-merchant entièrement fonctionnel permettant :
- Aux utilisateurs de choisir quel marchand parcourir via un menu déroulant (top-left)
- D'afficher tous les marchands si aucune sélection n'est faite
- À chaque marchand d'avoir son propre admin panel avec données isolées
- L'intégration complète avec le theme switcher existant

## 📊 Audit du Code Existant

### ✅ Ce qui est DÉJÀ IMPLÉMENTÉ
1. **Database Schema** - Tous les modèles ont `storeId` avec indexes
2. **Store Context Admin** - `lib/context/store-context.tsx` fonctionnel
3. **Admin Store Selector** - `components/admin/StoreSelector.tsx` en place
4. **Theme System** - ThemeProvider charge les thèmes par store
5. **Product/Order Filtering** - Tous les routers filtrent par storeId
6. **RBAC System** - Permissions per-store avec StoreUser

### ⚠️ Ce qui est PARTIELLEMENT IMPLÉMENTÉ
1. **Hardcoded Store IDs** - 13 fichiers admin utilisent des IDs en dur
2. **Access Control** - Permission system existe mais n'est pas appliqué aux procedures
3. **Public Store Selection** - Pas de UI publique pour choisir le marchand

### ❌ Ce qui MANQUE COMPLÈTEMENT
1. **Public Store Selector** - Dropdown pour les visiteurs
2. **"All Stores" Mode** - Backend doit gérer storeId optionnel
3. **Multi-Store Cart** - Panier avec produits de plusieurs marchands
4. **Store-Specific URLs** - Routes `/store/[slug]` pour SEO
5. **Tests Multi-Shop** - Aucun test d'isolation
6. **Documentation** - Guide d'utilisation manquant

## 📋 Issues Créées (10 total)

### Backend Issues (3)
1. **#115** - Replace hardcoded storeId in admin pages (13 files)
   - **Priorité**: 🔴 CRITIQUE
   - **Fichiers**: crsdpay (6), forecast, plugins, marketplace, roles, audit, users, themes, analytics
   - **Action**: Remplacer par `useStoreContext()`

2. **#116** - Add store ownership verification middleware
   - **Priorité**: 🔴 HAUTE (Sécurité)
   - **Action**: Créer `storeOwnerProcedure` middleware

3. **#118** - Add "All Stores" mode for public product listing
   - **Priorité**: 🟠 MOYENNE
   - **Action**: Rendre `storeId` optionnel dans Product.getAll

### Frontend Issues (5)
4. **#117** - Create public store selector in header
   - **Priorité**: 🟠 MOYENNE
   - **Fichier**: `components/storefront/StoreSelector.tsx`
   - **Position**: Top-left du header

5. **#119** - Implement "All Stores" product grid view
   - **Priorité**: 🟠 MOYENNE
   - **Action**: Afficher nom du store sur ProductCard en mode "All"

6. **#120** - Integrate theme switcher with store selection
   - **Priorité**: 🟡 BASSE
   - **Action**: ThemeProvider écoute le store sélectionné

7. **#121** - Handle multi-store cart and checkout
   - **Priorité**: 🟡 BASSE
   - **Action**: Grouper par store + créer commandes séparées

8. **#124** - Store-specific URLs and SEO
   - **Priorité**: 🟡 BASSE
   - **Action**: Routes `/store/[slug]` + meta tags

### Tests & Documentation (2)
9. **#122** - Multi-shop integration tests
   - **Priorité**: 🟠 MOYENNE
   - **Coverage**: Store isolation, access control, cart

10. **#123** - Multi-shop setup and usage guide
    - **Priorité**: 🟡 BASSE
    - **Docs**: Merchant guide, developer guide, API docs

## 🚀 Ordre d'Implémentation Recommandé

### Phase 1: Fixes Critiques (Issues #115, #116)
**Durée estimée**: 2-3 heures
- [ ] #115 - Remplacer tous les storeId hardcodés
- [ ] #116 - Ajouter middleware de sécurité
- **Pourquoi en premier**: Ce sont des bugs qui empêchent le fonctionnement actuel

### Phase 2: Backend "All Stores" (Issue #118)
**Durée estimée**: 2-3 heures
- [ ] #118 - Rendre storeId optionnel dans routers
- **Dépendances**: Phase 1 complétée

### Phase 3: Frontend Public (Issues #117, #119)
**Durée estimée**: 4-5 heures
- [ ] #117 - Store selector public (header)
- [ ] #119 - Product grid "All Stores" view
- **Dépendances**: Phase 2 complétée

### Phase 4: Intégrations Avancées (Issues #120, #121)
**Durée estimée**: 5-6 heures
- [ ] #120 - Theme switcher integration
- [ ] #121 - Multi-store cart & checkout
- **Dépendances**: Phase 3 complétée

### Phase 5: SEO & Polish (Issue #124)
**Durée estimée**: 3-4 heures
- [ ] #124 - Store URLs + SEO
- **Dépendances**: Phase 4 complétée

### Phase 6: QA (Issues #122, #123)
**Durée estimée**: 4-5 heures
- [ ] #122 - Tests d'intégration
- [ ] #123 - Documentation
- **Dépendances**: Toutes les phases précédentes

## 📁 Fichiers Principaux à Modifier

### Backend
```
lib/trpc/trpc.ts                     # storeOwnerProcedure middleware
lib/trpc/routers/product.ts          # storeId optionnel
lib/trpc/routers/store.ts            # getPublicStores endpoint
lib/trpc/routers/order.ts            # Multi-store checkout
```

### Frontend Admin (13 fichiers avec hardcoded storeId)
```
app/[locale]/admin/crsdpay/page.tsx
app/[locale]/admin/crsdpay/customers/page.tsx
app/[locale]/admin/crsdpay/reconciliation/page.tsx
app/[locale]/admin/crsdpay/settings/page.tsx
app/[locale]/admin/crsdpay/crypto/page.tsx
app/[locale]/admin/crsdpay/reports/page.tsx
app/[locale]/admin/forecast/page.tsx
app/[locale]/admin/plugins/marketplace/page.tsx
app/[locale]/admin/plugins/[id]/settings/page.tsx
app/[locale]/admin/plugins/page.tsx
app/[locale]/admin/marketplace/page.tsx
app/[locale]/admin/roles/page.tsx
app/[locale]/admin/audit/page.tsx
app/[locale]/admin/users/page.tsx
app/[locale]/admin/themes/marketplace/page.tsx
app/[locale]/admin/themes/page.tsx
app/[locale]/admin/themes/editor/[id]/page.tsx
app/[locale]/admin/analytics/page.tsx
```

### Frontend Public (nouveaux fichiers)
```
components/storefront/StoreSelector.tsx      # Nouveau dropdown
lib/context/public-store-context.tsx         # Nouveau context
components/products/ProductCard.tsx          # Modifier
app/[locale]/products/page.tsx               # Modifier
app/[locale]/store/[storeSlug]/page.tsx      # Nouveau
components/theme/ThemeProvider.tsx           # Modifier
```

## 🧪 Tests à Créer
```
__tests__/lib/trpc/routers/product.multi-store.test.ts
__tests__/lib/trpc/routers/store.access-control.test.ts
__tests__/components/storefront/StoreSelector.test.tsx
__tests__/lib/context/store-context.test.tsx
__tests__/e2e/multi-store-shopping.test.ts
```

## 📚 Documentation à Créer
```
docs/merchant/multi-shop.md              # Guide marchands
docs/developer/multi-shop-architecture.md # Architecture technique
docs/api/multi-shop-endpoints.md          # API reference
docs/migration/to-multi-shop.md           # Migration guide
docs/troubleshooting/multi-shop.md        # FAQ
```

## 🎯 Critères de Succès

### Fonctionnels
- [ ] Utilisateur peut sélectionner un marchand via dropdown (top-left header)
- [ ] "Tous les marchands" affiche produits de tous les stores
- [ ] Chaque marchand voit uniquement ses données dans l'admin
- [ ] Theme change automatiquement selon le store sélectionné
- [ ] Panier gère produits de plusieurs marchands
- [ ] Checkout crée commandes séparées par marchand

### Techniques
- [ ] Aucun storeId hardcodé dans le code
- [ ] Middleware sécurité appliqué à tous les endpoints admin
- [ ] Tests d'isolation passent à 100%
- [ ] Lighthouse score > 95
- [ ] Aucun bug de permissions

### Documentation
- [ ] Guide marchand complet
- [ ] Guide développeur avec exemples
- [ ] API documentée
- [ ] README mis à jour

## 🔗 Liens Utiles
- **Milestone GitHub**: https://github.com/StudioCavalli/FoxCard/milestone/26
- **Issues**: https://github.com/StudioCavalli/FoxCard/issues?q=milestone%3A%22M9%3A+Multi-Shop+System%22

## ⏱️ Estimation Totale
**25-30 heures** de développement réparties sur 6 phases.

---

**Créé le**: 2025-11-21
**Status**: 📝 Planifié
**Prochaine étape**: Démarrer Phase 1 (Issues #115, #116)
