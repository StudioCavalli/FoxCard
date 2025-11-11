# 🤝 Guide de Contribution - FoxCard

Merci de votre intérêt pour contribuer à FoxCard ! Ce guide vous aidera à démarrer.

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Setup de Développement](#setup-de-développement)
- [Workflow Git](#workflow-git)
- [Standards de Code](#standards-de-code)
- [Créer une Pull Request](#créer-une-pull-request)
- [Types de Contributions](#types-de-contributions)

---

## 📜 Code de Conduite

En participant à ce projet, vous acceptez de respecter notre code de conduite :

- Soyez respectueux et inclusif
- Acceptez les critiques constructives
- Concentrez-vous sur ce qui est mieux pour la communauté
- Montrez de l'empathie envers les autres membres

---

## 🚀 Comment Contribuer

### 1. Trouver une Issue

Consultez les issues existantes : https://github.com/StudioCavalli/FoxCard/issues

**Labels utiles :**
- `good first issue` : Parfait pour débuter
- `help wanted` : Contributions bienvenues
- `enhancement` : Nouvelles fonctionnalités
- `bug` : Corrections de bugs
- `documentation` : Amélioration de la doc

### 2. Annoncer votre Intention

Avant de commencer à travailler :
1. Commentez l'issue avec "Je prends cette issue"
2. Attendez qu'un mainteneur vous l'assigne
3. Si l'issue n'existe pas, créez-en une pour discussion

### 3. Développer

Suivez les étapes du [Setup de Développement](#setup-de-développement)

---

## 💻 Setup de Développement

### Prérequis

- Node.js 18+ et npm
- MongoDB (Atlas ou local)
- Git
- Un éditeur de code (VS Code recommandé)

### Installation

```bash
# 1. Fork le repository sur GitHub
# Cliquez sur "Fork" en haut à droite

# 2. Clone votre fork
git clone https://github.com/VOTRE-USERNAME/FoxCard.git
cd FoxCard

# 3. Ajouter le remote upstream
git remote add upstream https://github.com/StudioCavalli/FoxCard.git

# 4. Installer les dépendances
npm install

# 5. Copier et configurer .env
cp .env.example .env
# Éditez .env avec vos credentials MongoDB

# 6. Initialiser la base de données
npm run db:push
npm run db:seed

# 7. Démarrer le serveur de développement
npm run dev
```

L'application sera disponible sur http://localhost:3000

### Connexion Admin

- Email : `admin@foxcard.com`
- Mot de passe : `admin123`

---

## 🌳 Workflow Git

### Créer une Branche

```bash
# Toujours partir de main à jour
git checkout main
git pull upstream main

# Créer une branche descriptive
git checkout -b feature/nom-de-la-feature
# ou
git checkout -b fix/nom-du-bug
```

**Convention de nommage des branches :**
- `feature/` : Nouvelles fonctionnalités
- `fix/` : Corrections de bugs
- `docs/` : Documentation
- `refactor/` : Refactoring
- `test/` : Ajout de tests
- `chore/` : Maintenance

### Commits

Utilisez des messages de commit clairs et descriptifs :

```bash
# ✅ Bon
git commit -m "feat: Add PayPal payment integration"
git commit -m "fix: Fix cart total calculation when discount applied"
git commit -m "docs: Update installation guide"

# ❌ Mauvais
git commit -m "update"
git commit -m "fix bug"
git commit -m "changes"
```

**Convention Conventional Commits :**
- `feat:` : Nouvelle fonctionnalité
- `fix:` : Correction de bug
- `docs:` : Documentation
- `style:` : Formatage, point-virgules manquants, etc.
- `refactor:` : Refactoring de code
- `test:` : Ajout de tests
- `chore:` : Maintenance, dépendances

### Garder votre Fork à Jour

```bash
# Récupérer les dernières modifications d'upstream
git fetch upstream

# Merger main d'upstream dans votre branche locale main
git checkout main
git merge upstream/main

# Push vers votre fork
git push origin main
```

---

## 📐 Standards de Code

### TypeScript

- **Strict mode** activé
- Typage explicite pour les paramètres de fonction
- Pas d'`any` (utiliser `unknown` si nécessaire)
- Interfaces pour les objets complexes

```typescript
// ✅ Bon
interface User {
  id: string
  name: string
  email: string
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Mauvais
function getUser(id: any): any {
  // ...
}
```

### React

- **Composants fonctionnels** avec hooks
- **Pas de classes**
- Utiliser `'use client'` seulement si nécessaire (Next.js App Router)
- Props typées avec TypeScript

```typescript
// ✅ Bon
'use client'

interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>
}

// ❌ Mauvais
export function Button(props: any) {
  return <button>{props.label}</button>
}
```

### Styling

- **Tailwind CSS** pour le styling
- Classes utilitaires au lieu de CSS custom
- Utiliser `cn()` pour combiner classes conditionnellement

```typescript
import { cn } from '@/lib/utils'

// ✅ Bon
<button className={cn(
  'px-4 py-2 rounded-lg',
  variant === 'primary' && 'bg-teal-600 text-white',
  variant === 'secondary' && 'bg-gray-200 text-gray-900'
)}>
  {label}
</button>

// ❌ Mauvais
<button style={{ padding: '8px 16px', backgroundColor: color }}>
  {label}
</button>
```

### tRPC

- Validation avec **Zod**
- Toujours typer input et output
- Utiliser `adminProcedure` pour les endpoints admin

```typescript
import { z } from 'zod'
import { router, adminProcedure } from '../trpc'

export const productRouter = router({
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        price: z.number().positive(),
        storeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.product.create({
        data: input,
      })
    }),
})
```

### Naming Conventions

- **Variables/fonctions** : camelCase
- **Composants React** : PascalCase
- **Constantes** : UPPER_SNAKE_CASE
- **Fichiers** : kebab-case ou PascalCase (composants)

```typescript
// Variables et fonctions
const userCount = 10
function getUserById(id: string) {}

// Composants
function ProductCard() {}
// Fichier : ProductCard.tsx

// Constantes
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024
const API_VERSION = 'v1'
```

---

## 🔍 Linting et Formatting

### ESLint

```bash
# Vérifier le code
npm run lint

# Fix automatique
npm run lint -- --fix
```

### Format

Le projet utilise Prettier (intégré avec ESLint) :

```bash
# Format automatique avec ESLint
npm run lint -- --fix
```

### VS Code (Recommandé)

Extensions recommandées (voir `.vscode/extensions.json`) :
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma

Configuration automatique du format on save :

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## 📝 Créer une Pull Request

### Checklist Avant PR

- [ ] Le code compile sans erreurs (`npm run build`)
- [ ] Le lint passe (`npm run lint`)
- [ ] Les tests passent (si applicable)
- [ ] La documentation est à jour
- [ ] Le code suit les standards du projet
- [ ] Les commits sont clairs et descriptifs

### Créer la PR

1. **Push votre branche**
   ```bash
   git push origin feature/nom-de-la-feature
   ```

2. **Ouvrir une PR sur GitHub**
   - Allez sur votre fork sur GitHub
   - Cliquez sur "Compare & pull request"
   - Sélectionnez `main` comme branche de base
   - Remplissez le template de PR

3. **Remplir le Template**
   ```markdown
   ## Description
   Décrivez clairement ce que fait votre PR

   ## Type de Changement
   - [ ] Bug fix
   - [ ] Nouvelle fonctionnalité
   - [ ] Breaking change
   - [ ] Documentation

   ## Checklist
   - [ ] Le code compile
   - [ ] Le lint passe
   - [ ] Les tests passent
   - [ ] La documentation est à jour

   ## Screenshots (si applicable)
   Ajoutez des screenshots pour les changements UI

   ## Issue Liée
   Closes #123
   ```

4. **Attendre la Review**
   - Un mainteneur reviewera votre PR
   - Répondez aux commentaires
   - Faites les modifications demandées
   - Push les changements (la PR se mettra à jour)

### Après Merge

```bash
# Retourner sur main
git checkout main

# Récupérer les dernières modifications
git pull upstream main

# Supprimer la branche locale
git branch -d feature/nom-de-la-feature

# Supprimer la branche remote (optionnel)
git push origin --delete feature/nom-de-la-feature
```

---

## 🎯 Types de Contributions

### 🐛 Signaler un Bug

1. Vérifiez que le bug n'a pas déjà été signalé
2. Créez une issue avec le template "Bug Report"
3. Incluez :
   - Description claire
   - Étapes pour reproduire
   - Comportement attendu vs réel
   - Screenshots si applicable
   - Environnement (OS, navigateur, version Node.js)

### ✨ Proposer une Fonctionnalité

1. Vérifiez la roadmap : `.github/ROADMAP.md`
2. Créez une issue "Feature Request"
3. Décrivez :
   - Le problème que cela résout
   - La solution proposée
   - Les alternatives considérées
   - Impact sur l'existant

### 📚 Améliorer la Documentation

- Corriger des typos
- Clarifier des sections confuses
- Ajouter des exemples
- Traduire en d'autres langues
- Créer des tutoriels

### 🧪 Ajouter des Tests

- Tests unitaires (Jest)
- Tests d'intégration (tRPC)
- Tests E2E (Playwright)

Voir : `.github/ROADMAP.md` - Version 1.10.0

### 🔌 Créer un Plugin

Voir la documentation des plugins : `lib/plugins/README.md` (à venir)

### 🎨 Créer un Thème

Voir la documentation des thèmes : `lib/themes/README.md` (à venir)

---

## ❓ Questions

- **Discussions** : https://github.com/StudioCavalli/FoxCard/discussions
- **Issues** : https://github.com/StudioCavalli/FoxCard/issues
- **Documentation** : README.md et wiki

---

## 📄 License

En contribuant à FoxCard, vous acceptez que vos contributions soient sous licence MIT.

---

**Merci pour votre contribution ! 🦊**

Votre travail aide à construire la meilleure plateforme e-commerce open source.
