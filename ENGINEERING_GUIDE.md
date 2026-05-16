# Manssuétude Engineering Guide

## 1. Rôle du projet

Manssuétude CMS est une base logicielle pour une plateforme éditoriale administrable. Elle doit servir une petite équipe interne, publier des contenus, organiser des ressources, recevoir des contributions et structurer la mémoire collective Manssuétude.

Le projet doit rester :

- lisible ;
- maintenable ;
- cohérent ;
- difficile à casser ;
- simple à transmettre à de nouveaux développeurs.

## 2. Principes d’ingénierie

Principes non négociables :

- entity-first : le CMS manipule des entités métier, pas seulement des pages ;
- component-first : l’admin compose avec des blocs et composants verrouillés ;
- repository-driven : l’accès données reste dans `src/repositories` ;
- séparation stricte des responsabilités ;
- comportement explicite plutôt que magique ;
- documentation des décisions structurantes.

Ce projet ne doit pas devenir :

- un CMS libre où l’admin casse les layouts ;
- un WordPress sur-mesure improvisé ;
- un ERP ;
- un prototype local maintenu par rustines ;
- une accumulation de composants sans conventions.

## 3. Architecture

Arborescence cible :

```text
src/
  app/
  components/
  repositories/
  services/
  lib/
  types/
  config/
  constants/
  hooks/
  styles/
  utils/
docs/
scripts/
supabase/
```

Responsabilités :

- `src/app` : routes Next.js, layouts, pages, handlers API ;
- `src/components` : présentation et interactions UI ;
- `src/repositories` : accès données, CRUD, mapping DB ;
- `src/services` : logique métier testable ;
- `src/lib` : infrastructure technique ;
- `src/types` : types CMS et DB ;
- `src/config` : configuration stable non secrète ;
- `src/constants` : constantes métier ;
- `src/utils` : helpers génériques.

Voir `docs/ARCHITECTURE.md` pour le détail.

## 4. Flux de données

Flux public et admin recommandé :

```text
Component → service → repository → Supabase
```

Flux API recommandé :

```text
Route handler → validation/auth/permissions → service/repository → response
```

Règles :

- pas d’appel Supabase direct dans un composant ;
- pas de logique UI dans un repository ;
- pas de JSX dans un service ;
- pas de mapping DB dispersé dans les pages.

## 5. Conventions de code

Règles principales :

- composants : `PascalCase.tsx` ;
- services : `camelCaseService.ts` ;
- repositories : pluriel + `Repository.ts` ;
- imports internes : `@/` ;
- types exportés : `PascalCase` ;
- TypeScript strict ;
- pas de `any` non justifié ;
- `default export` réservé aux fichiers Next.js où c’est naturel.

Voir `docs/CODE_CONVENTIONS.md`.

## 6. Design system

La direction visuelle Manssuétude :

- blanc dominant ;
- orange Manssuétude en accent ;
- noir premium pour sections fortes ;
- tons crème pour respiration ;
- typographie claire ;
- rythme éditorial ;
- admin visuel, sobre et rassurant.

Les tokens vivent dans `src/config/designTokens.ts`. Les variables CSS opérationnelles vivent dans `src/styles/globals.css`.

Voir `docs/DESIGN_SYSTEM.md`.

## 7. Base de données

Les schémas Supabase sont dans :

- `supabase/schema.sql` ;
- `supabase/storage.sql` ;
- `supabase/cms-advanced.sql`.

Tables principales :

- `users` ;
- `pages` ;
- `themes` ;
- `productions` ;
- `activities` ;
- `projects` ;
- `resources` ;
- `form_submissions` ;
- `site_settings`.

Les repositories doivent rester la couche principale d’accès aux données.

Voir `docs/DATABASE.md`.

## 8. Seed

`content.js` est une source de seed, pas une dépendance durable du front public.

Le script :

```bash
npm run seed
```

utilise `scripts/seed.mjs` pour importer les contenus initiaux vers Supabase.

Ne pas recréer de dépendance directe du site public à `content.js`.

## 9. Auth et permissions

Existant :

- routes auth dans `src/app/api/auth` ;
- helpers dans `src/lib/auth.ts` ;
- permissions dans `src/lib/permissions.ts` ;
- repository auth dans `src/repositories/authRepository.ts`.

Prévu :

- évolution vers Supabase Auth complète ;
- rôles plus fins ;
- permissions par capacité.

Règle : toute mutation admin doit passer par une vérification de rôle ou de permission.

## 10. Qualité et validation

Avant livraison :

```bash
npm run typecheck
npm run build
```

Selon le changement :

```bash
npm run test
npm run format:check
```

La CI exécute ces contrôles dans `.github/workflows/ci.yml`.

## 11. Git et PR

Branches :

- `main` : stable ;
- `develop` : intégration ;
- `feature/*` : fonctionnalités ;
- `fix/*` : corrections ;
- `chore/*` : maintenance.

Commits :

- `feat:` ;
- `fix:` ;
- `refactor:` ;
- `docs:` ;
- `test:` ;
- `chore:`.

Une PR doit inclure :

- objectif ;
- zones touchées ;
- validations exécutées ;
- risques ;
- captures si l’UI change ;
- notes DB si un schéma change.

## 12. Règles de review

Relire en priorité :

- séparation UI / service / repository ;
- validation des entrées API ;
- absence d’accès DB dans les composants ;
- cohérence des types ;
- absence de `any` ;
- respect design system ;
- accessibilité basique ;
- impact sur les fichiers legacy.

## 13. Legacy

Les fichiers suivants sont conservés temporairement comme référence :

- `index.html` ;
- `app.js` ;
- `content.js` ;
- `styles.css`.

Ils ne doivent pas être supprimés pendant la Phase 0 sans décision explicite. Ils ne doivent pas non plus redevenir la source principale du CMS.

## 14. Erreurs à éviter

- ajouter une fonctionnalité produit pendant une tâche de fondation ;
- mélanger logique métier et rendu ;
- créer un composant fourre-tout ;
- appeler Supabase dans l’UI ;
- dupliquer un type ou un mapper ;
- ajouter une librairie lourde sans décision ;
- modifier les schémas Supabase sans documentation ;
- exposer des chemins techniques à l’admin comme interface principale ;
- supprimer un fichier legacy structurant sans justification.
