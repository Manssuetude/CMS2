# Manssuétude CMS

## Vision

Manssuétude est une association et plateforme intellectuelle. Le site doit devenir une vitrine publique, un média éditorial, une bibliothèque de ressources, un espace contributif et un outil de communication structuré.

Le CMS doit rester simple à utiliser pour une petite équipe interne, tout en gardant une architecture sérieuse pour les développeurs. Il ne doit pas devenir une usine à pages, un WordPress générique ou un ERP.

État actuel :

- existant : application Next.js dans `src/`, routes publiques, routes admin, repositories, services, Supabase, seed, formulaires et médiathèque en base ;
- conservé temporairement : ancien prototype vanilla `index.html`, `app.js`, `content.js`, `styles.css` comme référence de migration ;
- à faire progressivement : CRUD admin complet, workflows éditoriaux avancés, Google Drive complet, design system en composants UI réutilisables.

## Stack

- Frontend : Next.js, React, TypeScript
- Backend : Route Handlers Next.js dans `src/app/api`
- Base de données : Supabase / PostgreSQL
- Authentification : session admin locale côté serveur, prête à évoluer vers Supabase Auth
- Stockage médias : Supabase Storage
- Emails : Resend prévu pour notifications
- Google Drive : fichiers d’intégration préparés, Picker/OAuth à finaliser
- Styles : CSS propriétaire dans `src/styles/globals.css`
- Déploiement cible : Vercel

## Installation rapide

```bash
npm install
cp .env.example .env.local
npm run typecheck
npm run dev
```

Le site local démarre généralement sur `http://localhost:3000`.

## Variables d’environnement

Créer `.env.local` à partir de `.env.example`.

```env
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_API_KEY=
GOOGLE_CLIENT_SECRET=
RESEND_API_KEY=
ADMIN_INITIAL_EMAIL=
ADMIN_INITIAL_PASSWORD=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Notes :

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` sont nécessaires pour connecter Supabase.
- `ADMIN_INITIAL_EMAIL` et `ADMIN_INITIAL_PASSWORD` servent au seed du premier admin.
- les clés Google et Resend peuvent rester vides tant que ces intégrations ne sont pas utilisées.

## Scripts utiles

```bash
npm run dev            # lance Next.js en local
npm run build          # compile la version production
npm run start          # lance la version buildée
npm run typecheck      # vérifie TypeScript strict
npm run lint           # alias actuel vers typecheck
npm run format:check   # vérifie Prettier
npm run test           # lance les tests d’architecture
npm run seed           # importe le contenu initial depuis content.js
npm run db:check       # vérifie la connexion Supabase
```

## Architecture rapide

```text
src/
  app/             routes Next.js publiques, admin et API
  components/      composants UI, layout, blocs, médias, formulaires
  repositories/    accès données Supabase et mapping DB
  services/        logique métier, relations, SEO, santé, médias
  lib/             clients techniques, auth, env, validation, erreurs
  types/           types CMS et base de données
  config/          tokens et configuration non secrète
  constants/       constantes métier et navigation
  hooks/           hooks React réutilisables
  styles/          CSS global
  utils/           helpers génériques
docs/              documentation technique
scripts/           seed et vérifications
supabase/          schémas SQL
```

Flux recommandé :

```text
UI → service → repository → database
API route → validation → service/repository → response
```

## Documentation complète

- `docs/ONBOARDING.md` : guide d’arrivée développeur.
- `ENGINEERING_GUIDE.md` : règles d’ingénierie.
- `docs/ARCHITECTURE.md` : architecture et responsabilités.
- `docs/CODE_CONVENTIONS.md` : conventions de code.
- `docs/DESIGN_SYSTEM.md` : règles design system.
- `docs/RESPONSIBILITY_MAP.md` : séparation UI / services / repositories.
- `docs/DATABASE.md` : tables et fichiers SQL Supabase.
- `docs/WORKFLOWS.md` : branches, PR et validations.
- `docs/PHASE_0_AUDIT.md` : audit initial.
- `docs/PHASE_0_CLEANUP.md` : nettoyage initial.

## Statut du projet

Phase actuelle : Phase 0, consolidation technique.

Objectif de la phase :

- clarifier l’architecture ;
- documenter les conventions ;
- éviter les refactors risqués ;
- préparer l’arrivée de nouveaux développeurs ;
- ne pas lancer de nouvelle fonctionnalité produit tant que les fondations ne sont pas stabilisées.

## Contribution

Avant toute PR :

1. lire `docs/ONBOARDING.md` ;
2. respecter `docs/CODE_CONVENTIONS.md` et `docs/DESIGN_SYSTEM.md` ;
3. ne pas supprimer les fichiers legacy sans décision explicite ;
4. exécuter `npm run typecheck` et `npm run build` ;
5. documenter les impacts, validations et risques dans la PR.
