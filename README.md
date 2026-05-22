# Manssuétude CMS

> CMS éditorial sur-mesure pour l'association Manssuétude — simple pour l'équipe, sérieux pour les développeurs.

---

## Vision

Manssuétude est une association et plateforme intellectuelle. Le site doit devenir une vitrine publique, un média éditorial, une bibliothèque de ressources, un espace contributif et un outil de communication structuré.

Le CMS doit rester **simple à utiliser** pour une petite équipe interne, tout en gardant une **architecture sérieuse** pour les développeurs. Il ne doit pas devenir une usine à pages, un WordPress générique ou un ERP.

**État actuel :**

| Statut                     | Description                                                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| ✅ Existant                | Application Next.js dans `src/`, routes publiques, routes admin, repositories, services, Supabase, seed, formulaires et médiathèque en base |
| 🗂 Conservé temporairement | Ancien prototype vanilla `index.html`, `app.js`, `content.js`, `styles.css` comme référence de migration                                    |
| 🔜 À faire progressivement | CRUD admin complet, workflows éditoriaux avancés, Google Drive complet, design system en composants UI réutilisables                        |

---

## Stack

| Couche           | Technologie                                                           |
| ---------------- | --------------------------------------------------------------------- |
| Frontend         | Next.js, React, TypeScript                                            |
| Backend          | Route Handlers Next.js dans `src/app/api`                             |
| Base de données  | Supabase / PostgreSQL                                                 |
| Authentification | Session admin locale côté serveur, prête à évoluer vers Supabase Auth |
| Stockage médias  | Supabase Storage                                                      |
| Emails           | Resend (prévu pour notifications)                                     |
| Google Drive     | Picker/OAuth préparé, à finaliser                                     |
| Styles           | CSS propriétaire dans `src/styles/globals.css`                        |
| Déploiement      | Vercel                                                                |

---

## Installation rapide

```bash
npm install
cp .env.example .env.local
npm run typecheck
npm run dev
```

Le site local démarre généralement sur `http://localhost:3000`.

---

## Variables d'environnement

Créer `.env.local` à partir de `.env.example`. Détail des variables et minimum requis : [`docs/ONBOARDING.md`](docs/ONBOARDING.md#6-variables-denvironnement).

---

## Scripts utiles

| Commande               | Description                                    |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Lance Next.js en local                         |
| `npm run build`        | Compile la version production                  |
| `npm run start`        | Lance la version buildée                       |
| `npm run typecheck`    | Vérifie TypeScript strict                      |
| `npm run lint`         | Alias actuel vers typecheck                    |
| `npm run format:check` | Vérifie Prettier                               |
| `npm run test`         | Lance les tests d'architecture                 |
| `npm run seed`         | Importe le contenu initial depuis `content.js` |
| `npm run db:check`     | Vérifie la connexion Supabase                  |

---

## Architecture rapide

Voir [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) pour l'arborescence complète, les responsabilités de chaque dossier et les flux de données.

---

## Ordre de lecture recommandé

Pour un développeur qui arrive sur le projet, dans cet ordre :

| Étape | Document                                             | Pourquoi                                                                       |
| ----- | ---------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1     | [docs/ONBOARDING.md](docs/ONBOARDING.md)             | Vue d'ensemble du projet, installation, modules clés, glossaire                |
| 2     | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)         | Arborescence, responsabilités de chaque couche, flux de données, anti-patterns |
| 3     | [docs/CODE_CONVENTIONS.md](docs/CODE_CONVENTIONS.md) | Nommage, imports, TypeScript, patterns de code                                 |
| 4     | [docs/DATABASE.md](docs/DATABASE.md)                 | Schéma SQL, tables, règles d'accès aux données                                 |
| 5     | [docs/WORKFLOWS.md](docs/WORKFLOWS.md)               | Branches, commits, format des PR                                               |
| 6     | [docs/COLLABORATION.md](docs/COLLABORATION.md)       | Board kanban, issues, labels, milestones, cycle de vie des tâches              |
| 7     | [docs/QUALITY_GATES.md](docs/QUALITY_GATES.md)       | Commandes obligatoires et checklist avant PR                                   |
| —     | [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)       | Si le travail touche l'UI ou le CSS                                            |
| —     | [docs/CMS.md](docs/CMS.md)                           | Si le travail touche les entités éditoriales                                   |
| —     | [ENGINEERING_GUIDE.md](ENGINEERING_GUIDE.md)         | Pour les décisions d'architecture et les principes d'ingénierie                |

---

## Documentation complète

| Document                                                 | Description                             |
| -------------------------------------------------------- | --------------------------------------- |
| [docs/ONBOARDING.md](docs/ONBOARDING.md)                 | Guide d'arrivée développeur             |
| [ENGINEERING_GUIDE.md](ENGINEERING_GUIDE.md)             | Règles d'ingénierie                     |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)             | Architecture et responsabilités         |
| [docs/CODE_CONVENTIONS.md](docs/CODE_CONVENTIONS.md)     | Conventions de code                     |
| [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)           | Règles design system                    |
| [docs/RESPONSIBILITY_MAP.md](docs/RESPONSIBILITY_MAP.md) | Séparation UI / services / repositories |
| [docs/DATABASE.md](docs/DATABASE.md)                     | Tables et fichiers SQL Supabase         |
| [docs/WORKFLOWS.md](docs/WORKFLOWS.md)                   | Branches, PR et validations             |
| [docs/COLLABORATION.md](docs/COLLABORATION.md)           | Organisation du travail en équipe       |
| [docs/PHASE_0_AUDIT.md](docs/PHASE_0_AUDIT.md)           | Audit initial                           |
| [docs/PHASE_0_CLEANUP.md](docs/PHASE_0_CLEANUP.md)       | Nettoyage initial                       |

---

## Statut du projet

**Phase actuelle : Phase 0 — Consolidation technique**

Objectifs de la phase :

- Clarifier l'architecture
- Documenter les conventions
- Éviter les refactors risqués
- Préparer l'arrivée de nouveaux développeurs
- Ne pas lancer de nouvelle fonctionnalité produit tant que les fondations ne sont pas stabilisées

---

## Contribution

Avant toute PR :

1. Lire [`docs/ONBOARDING.md`](docs/ONBOARDING.md)
2. Respecter [`docs/CODE_CONVENTIONS.md`](docs/CODE_CONVENTIONS.md) et [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)
3. Ne pas supprimer les fichiers legacy sans décision explicite
4. Checklist complète : [`docs/QUALITY_GATES.md`](docs/QUALITY_GATES.md#8-checklist-avant-pull-request)

---

**Par où commencer ?** → [`docs/ONBOARDING.md`](docs/ONBOARDING.md)
