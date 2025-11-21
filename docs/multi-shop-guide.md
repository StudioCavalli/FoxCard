# Guide du Système Multi-Boutique

Ce guide explique comment configurer et utiliser le système multi-boutique de FoxCard.

## Table des Matières

- [Architecture](#architecture)
- [Configuration](#configuration)
- [Gestion des Boutiques](#gestion-des-boutiques)
- [Rôles et Permissions](#rôles-et-permissions)
- [Interface Admin](#interface-admin)
- [Interface Publique](#interface-publique)
- [API et Développement](#api-et-développement)
- [SEO Multi-Boutique](#seo-multi-boutique)

---

## Architecture

### Modèle de Données

Le système multi-boutique repose sur les modèles suivants :

```prisma
model Store {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  slug        String   @unique
  description String?
  logo        String?
  bannerImage String?
  ownerId     String   @db.ObjectId
  owner       User     @relation("StoreOwner", fields: [ownerId], references: [id])
  users       StoreUser[]
  products    Product[]
  orders      Order[]
  // ... autres relations
}

model StoreUser {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  storeId   String   @db.ObjectId
  userId    String   @db.ObjectId
  role      String   @default("ADMIN")
  status    String   @default("ACTIVE")
  store     Store    @relation(fields: [storeId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
}
```

### Contextes React

- **StoreContext** (`/lib/context/store-context.tsx`) : Gère la boutique sélectionnée dans l'admin
- **PublicStoreContext** (`/lib/context/public-store-context.tsx`) : Gère le filtrage des produits sur le site public

---

## Configuration

### Variables d'Environnement

```env
# Base de données
DATABASE_URL="mongodb+srv://..."

# URL publique (utilisée pour les URLs SEO)
NEXT_PUBLIC_APP_URL="https://votre-domaine.com"

# Auth
NEXTAUTH_URL="https://votre-domaine.com"
NEXTAUTH_SECRET="votre-secret"
```

### Création d'une Boutique

1. Connectez-vous en tant qu'admin
2. Accédez à `/superadmin` (nécessite le rôle SUPER_ADMIN)
3. Cliquez sur "Créer une boutique"
4. Remplissez les informations :
   - Nom de la boutique
   - Slug (URL-friendly)
   - Description
   - Logo et bannière (optionnels)

---

## Gestion des Boutiques

### Page Paramètres Boutique

Accessible via `/admin/store`, cette page permet de configurer :

#### Informations Générales
- Nom de la boutique
- Slogan (tagline)
- Description complète
- Histoire de la boutique

#### Branding
- Logo (recommandé : 200x200px)
- Image de bannière (recommandé : 1920x400px)
- Favicon

#### Contact Public
- Email public
- Téléphone
- Adresse physique

#### Réseaux Sociaux
- Facebook, Instagram, Twitter
- LinkedIn, YouTube, TikTok, Pinterest

### Gestion des Membres

Les propriétaires de boutique peuvent inviter des membres :

1. Accédez à `/admin/users`
2. Cliquez "Inviter un membre"
3. Entrez l'email et sélectionnez le rôle
4. L'utilisateur reçoit une invitation

---

## Rôles et Permissions

### Rôles Utilisateur

| Rôle | Description | Accès |
|------|-------------|-------|
| `SUPER_ADMIN` | Administrateur global | Toutes les boutiques, SuperAdmin |
| `ADMIN` | Administrateur de boutique | Une ou plusieurs boutiques |
| `USER` | Utilisateur simple | Compte client uniquement |

### Rôles Boutique (StoreUser)

| Rôle | Description | Permissions |
|------|-------------|-------------|
| `OWNER` | Propriétaire | Toutes les actions, y compris suppression |
| `ADMIN` | Administrateur | Gestion complète sauf suppression |
| `MANAGER` | Gestionnaire | Produits, commandes, clients |
| `VIEWER` | Observateur | Lecture seule |

### Vérification d'Accès

```typescript
// Dans un router tRPC
const router = createTRPCRouter({
  updateProduct: protectedProcedure
    .use(requireStoreAccess) // Middleware de vérification
    .input(...)
    .mutation(async ({ ctx, input }) => {
      // ctx.isStoreOwner indique si l'utilisateur est propriétaire
    }),
});
```

---

## Interface Admin

### Sélecteur de Boutique

Le sélecteur de boutique apparaît dans le header admin :

- **Multi-boutique** : Dropdown avec liste des boutiques
- **Boutique unique** : Badge avec le nom de la boutique

### Sidebar Mobile Responsive

La sidebar admin est responsive :
- **Desktop** : Toujours visible (fixed)
- **Mobile** : Cachée par défaut, toggle via icône hamburger

### Dashboard

Le dashboard affiche les statistiques de la boutique sélectionnée :

- Revenus totaux
- Nombre de commandes
- Nombre de produits
- Nombre de clients
- Graphiques interactifs (recharts)
- Répartition des commandes par statut

---

## Interface Publique

### Modes d'Affichage

#### Mode "Toutes les Boutiques"

- URL : `/products` ou `/stores`
- Affiche tous les produits de toutes les boutiques
- Sélecteur de boutique dans le header
- Filtrage par boutique

#### Mode Boutique Spécifique

- URL : `/stores/[slug]`
- Page d'accueil de la boutique
- Produits exclusifs de cette boutique
- Thème personnalisé

### Panier Multi-Boutique

Le panier gère les produits de plusieurs boutiques :

```typescript
// Structure du panier
interface CartItem {
  id: string
  productId: string
  storeId: string      // Identifiant de la boutique
  storeName?: string   // Nom pour l'affichage
  name: string
  price: number
  quantity: number
}
```

Les commandes sont créées séparément pour chaque boutique.

---

## API et Développement

### Store Context Hook

```typescript
import { useStoreContext } from '@/lib/context/store-context'

function MyComponent() {
  const {
    storeId,        // ID de la boutique sélectionnée
    storeName,      // Nom de la boutique
    isSuperAdmin,   // true si SUPER_ADMIN
    stores,         // Liste des boutiques accessibles
    setStoreId      // Fonction pour changer de boutique
  } = useStoreContext()

  return <div>{storeName}</div>
}
```

### Public Store Context Hook

```typescript
import { usePublicStore } from '@/lib/context/public-store-context'

function ProductList() {
  const {
    selectedStore,     // 'all' ou ID de boutique
    setSelectedStore,  // Fonction pour filtrer
    stores,            // Liste des boutiques publiques
    isLoading
  } = usePublicStore()

  // selectedStore === 'all' => afficher tous les produits
  // sinon => filtrer par storeId
}
```

### Endpoints tRPC

```typescript
// Obtenir les boutiques de l'utilisateur
const { data } = trpc.store.getUserStores.useQuery()

// Obtenir les détails d'une boutique
const { data } = trpc.store.getById.useQuery({ id: storeId })

// Obtenir une boutique par slug
const { data } = trpc.store.getBySlug.useQuery({ slug: 'ma-boutique' })

// Mettre à jour une boutique
const mutation = trpc.store.update.useMutation()
```

---

## SEO Multi-Boutique

### Métadonnées Dynamiques

Chaque page de boutique génère ses propres métadonnées :

```typescript
// app/[locale]/stores/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const store = await getStore(params.slug)

  return {
    title: `${store.name} - ${store.tagline}`,
    description: store.description,
    openGraph: {
      images: [store.bannerImage || store.logo],
      // ...
    }
  }
}
```

### Structured Data (JSON-LD)

Les pages génèrent des données structurées pour les moteurs de recherche :

#### Schema Store

```json
{
  "@context": "https://schema.org",
  "@type": "Store",
  "name": "Ma Boutique",
  "description": "Description...",
  "url": "https://example.com/stores/ma-boutique",
  "logo": "https://example.com/logo.png",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Rue Example",
    "addressLocality": "Paris",
    "postalCode": "75001",
    "addressCountry": "FR"
  },
  "sameAs": ["https://facebook.com/...", "https://instagram.com/..."]
}
```

#### Schema Product

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Mon Produit",
  "description": "Description...",
  "image": ["https://example.com/image.jpg"],
  "brand": {
    "@type": "Brand",
    "name": "Ma Boutique"
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "EUR",
    "price": "29.99",
    "availability": "https://schema.org/InStock"
  }
}
```

### Breadcrumbs

Les pages incluent des breadcrumbs structurés :

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "..." },
    { "@type": "ListItem", "position": 2, "name": "Boutiques", "item": "..." },
    { "@type": "ListItem", "position": 3, "name": "Ma Boutique", "item": "..." }
  ]
}
```

---

## Bonnes Pratiques

### Performance

1. **Utilisez le cache** : Les requêtes tRPC sont automatiquement cachées
2. **Lazy loading** : Chargez les images avec `next/image`
3. **Pagination** : Limitez les résultats avec `limit` et `offset`

### Sécurité

1. **Vérifiez toujours l'accès** : Utilisez `requireStoreAccess` middleware
2. **Validez les inputs** : Utilisez Zod pour la validation
3. **Ne faites pas confiance au client** : Revérifiez côté serveur

### UX

1. **Feedback utilisateur** : Affichez des loaders pendant les requêtes
2. **Messages d'erreur clairs** : Utilisez des messages localisés
3. **Mobile first** : Testez sur mobile en priorité

---

## Dépannage

### La boutique ne s'affiche pas

1. Vérifiez que l'utilisateur a accès à la boutique
2. Vérifiez le statut de la boutique (doit être `ACTIVE`)
3. Vérifiez les logs de la console

### Les produits n'apparaissent pas

1. Vérifiez que les produits ont le statut `ACTIVE`
2. Vérifiez que le `storeId` est correct
3. Vérifiez les filtres appliqués

### Erreur d'accès

```
TRPCError: FORBIDDEN
```

L'utilisateur n'a pas accès à cette boutique. Vérifiez :
- Qu'il est propriétaire (`ownerId`)
- Ou qu'il est membre actif (`StoreUser.status = 'ACTIVE'`)

---

## Support

Pour toute question ou problème :

1. Consultez les [issues GitHub](https://github.com/StudioCavalli/FoxCard/issues)
2. Rejoignez la communauté Discord
3. Ouvrez une nouvelle issue si nécessaire
