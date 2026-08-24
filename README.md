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

### Obtenir les clés d'accès Supabase

Le strict minimum pour lancer le site est composé de trois variables Supabase :

| Variable                        | Où la récupérer                                                    |
| ------------------------------- | ------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Dashboard → **Settings → API** → champ **Project URL**             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dashboard → **Settings → API** → clé publique (`sb_publishable_…`) |
| `SUPABASE_SERVICE_ROLE_KEY`     | Dashboard → **Settings → API** → clé secrète (`sb_secret_…`)       |

Étapes :

1. Se connecter sur [supabase.com/dashboard](https://supabase.com/dashboard) et ouvrir le projet Manssuétude (demander l'accès à un membre de l'équipe si besoin).
2. Aller dans **Settings** (roue dentée) → **API**.
3. Copier la **Project URL** et les deux clés (publique et secrète) dans `.env.local`.
4. L'URL du projet se retrouve aussi dans l'adresse du dashboard : `https://supabase.com/dashboard/project/<REF>` → l'URL est `https://<REF>.supabase.co`.

> ⚠️ La clé secrète (`sb_secret_…` / `SUPABASE_SERVICE_ROLE_KEY`) contourne toutes les règles de sécurité (RLS). Elle ne doit **jamais** être exposée côté navigateur ni commitée. Le fichier `.env.local` est déjà ignoré par Git.

> Les valeurs vides déclenchent une erreur de validation au démarrage (`ADMIN_INITIAL_EMAIL` attend un e-mail valide). Laisser les variables optionnelles **absentes** plutôt que vides, ou les renseigner.

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
| [docs/V2_ETAT_DES_LIEUX.md](docs/V2_ETAT_DES_LIEUX.md)   | État des lieux fonctionnel V2           |
| [docs/V2_PLAN_TRAVAIL.md](docs/V2_PLAN_TRAVAIL.md)       | Plan de travail V2 en cours             |
| [docs/AUDIT_CONFORMITE.md](docs/AUDIT_CONFORMITE.md)     | Audit conformité RGPD/sécurité          |

---

## Statut du projet

**Phase actuelle : V2 — développement produit actif**

La consolidation initiale (Phase 0 : architecture, conventions, fondations) est terminée. Le projet est désormais en développement de fonctionnalités continu, encadré par :

- [docs/V2_PLAN_TRAVAIL.md](docs/V2_PLAN_TRAVAIL.md) — chantiers produit en cours
- [docs/AUDIT_CONFORMITE_PLAN.md](docs/AUDIT_CONFORMITE_PLAN.md) — mise en conformité RGPD/sécurité en cours

L'architecture et les conventions documentées ci-dessus restent la référence — toute nouvelle fonctionnalité s'y conforme.

---

## Contribution

Avant toute PR :

1. Lire [`docs/ONBOARDING.md`](docs/ONBOARDING.md)
2. Respecter [`docs/CODE_CONVENTIONS.md`](docs/CODE_CONVENTIONS.md) et [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)
3. Ne pas supprimer les fichiers legacy sans décision explicite
4. Checklist complète : [`docs/QUALITY_GATES.md`](docs/QUALITY_GATES.md#8-checklist-avant-pull-request)

---

**Par où commencer ?** → [`docs/ONBOARDING.md`](docs/ONBOARDING.md)
