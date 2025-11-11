# 🦊 Gestion de la Roadmap FoxCard

Ce dossier contient la roadmap complète du projet et les scripts pour générer automatiquement les issues GitHub.

## 📋 Fichiers

- **ROADMAP.md** : Roadmap détaillée de v1.0.0 à v2.0.0
- **create-issues.sh** : Script pour créer les issues GitHub automatiquement

## 🚀 Utilisation

### Prérequis

1. **Installer GitHub CLI**
   ```bash
   # macOS
   brew install gh

   # Linux
   sudo apt install gh

   # Windows
   winget install GitHub.cli
   ```

2. **S'authentifier**
   ```bash
   gh auth login
   ```

### Créer les Milestones

Avant de créer les issues, créez d'abord les milestones sur GitHub :

1. Allez sur : https://github.com/StudioCavalli/FoxCard/milestones
2. Créez les milestones suivants :

| Milestone | Date cible | Description |
|-----------|------------|-------------|
| v1.1.0 | Février 2025 | Installeur & Configuration |
| v1.2.0 | Mars 2025 | Paiements Additionnels |
| v1.3.0 | Avril 2025 | Notifications & Communication |
| v1.4.0 | Mai 2025 | Gestion Multi-Utilisateurs |
| v1.5.0 | Juin 2025 | Éditeur de Thèmes Avancé |
| v1.6.0 | Juillet 2025 | Marketplace de Plugins |
| v1.7.0 | Août 2025 | Analytics & Reporting |
| v1.8.0 | Septembre 2025 | Inventaire Multi-Entrepôts |
| v1.9.0 | Octobre 2025 | Déploiement & Infrastructure |
| v1.10.0 | Novembre 2025 | Tests & Qualité |
| v2.0.0 | Décembre 2025 | Applications Mobiles |

**Ou via CLI :**
```bash
gh milestone create "v1.1.0" --due "2025-02-28" --description "Installeur & Configuration"
gh milestone create "v1.2.0" --due "2025-03-31" --description "Paiements Additionnels"
gh milestone create "v1.3.0" --due "2025-04-30" --description "Notifications & Communication"
gh milestone create "v1.4.0" --due "2025-05-31" --description "Gestion Multi-Utilisateurs"
gh milestone create "v1.5.0" --due "2025-06-30" --description "Éditeur de Thèmes Avancé"
gh milestone create "v1.6.0" --due "2025-07-31" --description "Marketplace de Plugins"
gh milestone create "v1.7.0" --due "2025-08-31" --description "Analytics & Reporting"
gh milestone create "v1.8.0" --due "2025-09-30" --description "Inventaire Multi-Entrepôts"
gh milestone create "v1.9.0" --due "2025-10-31" --description "Déploiement & Infrastructure"
gh milestone create "v1.10.0" --due "2025-11-30" --description "Tests & Qualité"
gh milestone create "v2.0.0" --due "2025-12-31" --description "Applications Mobiles"
```

### Créer les Issues

```bash
cd FoxCard
./.github/create-issues.sh
```

Ce script va créer automatiquement :
- ✅ 4 issues pour v1.1.0 (Installeur)
- ✅ 4 issues pour v1.2.0 (Paiements)
- ✅ 5 issues pour v1.3.0 (Notifications)

Pour créer les issues des versions suivantes, il faudra compléter le script.

## 📊 Structure de la Roadmap

### Versions Planifiées

| Version | Issues | Focus |
|---------|--------|-------|
| 1.1.0 | 4 | Installeur web, support PostgreSQL, config UI |
| 1.2.0 | 4 | PayPal, Apple/Google Pay, virement bancaire |
| 1.3.0 | 5 | Emails, templates, PDF, SMS, newsletter |
| 1.4.0 | 4 | Rôles, permissions, audit logs |
| 1.5.0 | 5 | Éditeur visuel, marketplace thèmes |
| 1.6.0 | 6 | Marketplace plugins, SDK |
| 1.7.0 | 4 | Analytics, rapports, A/B testing |
| 1.8.0 | 4 | Multi-entrepôts, allocation intelligente |
| 1.9.0 | 4 | Docker, deploy, Redis, BullMQ |
| 1.10.0 | 4 | Tests E2E, unitaires, CI/CD |
| 2.0.0 | 6 | Apps mobiles, white-label, marketplace |

**Total : ~50 issues**

## 🏷️ Labels Utilisés

Les issues utilisent les labels suivants :

- `enhancement` : Nouvelle fonctionnalité
- `documentation` : Documentation
- `bug` : Bug à corriger
- `v1.1.0` à `v2.0.0` : Version concernée
- `installer`, `payment`, `email`, `admin`, etc. : Catégorie

## 🤝 Contribution

### Prendre en Charge une Issue

1. Consultez les issues : https://github.com/StudioCavalli/FoxCard/issues
2. Choisissez une issue non assignée
3. Commentez "Je prends cette issue" ou utilisez `/assign` si vous avez les droits
4. Créez une branche depuis `main` : `git checkout -b feature/issue-XX`
5. Développez la fonctionnalité
6. Créez une Pull Request

### Créer une Nouvelle Issue

Si vous identifiez une fonctionnalité manquante :

1. Vérifiez qu'elle n'existe pas déjà
2. Créez l'issue en suivant le template
3. Ajoutez les labels appropriés
4. Assignez-la à un milestone si applicable

## 📈 Suivi de l'Avancement

### Via GitHub Projects

Nous utilisons GitHub Projects pour suivre l'avancement :
https://github.com/StudioCavalli/FoxCard/projects

### Via Milestones

Consultez les milestones pour voir la progression :
https://github.com/StudioCavalli/FoxCard/milestones

### Via Labels

Filtrez par version avec les labels `v1.X.0` :
- [v1.1.0](https://github.com/StudioCavalli/FoxCard/labels/v1.1.0)
- [v1.2.0](https://github.com/StudioCavalli/FoxCard/labels/v1.2.0)
- etc.

## 🎯 Priorités

### Haute Priorité (v1.1.0 - v1.3.0)

Ces versions sont critiques pour la production :
- Installeur simplifié (acquisition utilisateurs)
- Paiements additionnels (conversion)
- Notifications (rétention)

### Moyenne Priorité (v1.4.0 - v1.7.0)

Fonctionnalités avancées pour grandes boutiques :
- Multi-utilisateurs (équipes)
- Thèmes et plugins (personnalisation)
- Analytics (prise de décision)

### Basse Priorité (v1.8.0 - v2.0.0)

Features entreprise et mobile :
- Multi-entrepôts (grandes structures)
- Tests complets (stabilité)
- Apps mobiles (canal supplémentaire)

## 📞 Contact

Pour toute question sur la roadmap :
- Ouvrez une discussion : https://github.com/StudioCavalli/FoxCard/discussions
- Ou contactez l'équipe via les issues

---

**Mise à jour** : Janvier 2025
**Version actuelle** : 1.0.0 (Production Ready)
**Prochaine version** : 1.1.0 (Février 2025)
