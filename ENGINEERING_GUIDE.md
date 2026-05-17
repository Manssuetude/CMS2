# Manssuétude Engineering Guide

> Règles d'ingénierie et principes d'équipe. Ce document s'adresse aux développeurs qui contribuent au projet.

---

## 1. Rôle du projet

Manssuétude CMS est une base logicielle pour une plateforme éditoriale administrable. Elle doit servir une petite équipe interne, publier des contenus, organiser des ressources, recevoir des contributions et structurer la mémoire collective Manssuétude.

Le projet doit rester **lisible, maintenable, cohérent, difficile à casser et simple à transmettre** à de nouveaux développeurs.

---

## 2. Principes d'ingénierie

**Principes non négociables :**

- **entity-first** : le CMS manipule des entités métier, pas seulement des pages
- **component-first** : l'admin compose avec des blocs et composants verrouillés
- **repository-driven** : l'accès données reste dans `src/repositories`
- Séparation stricte des responsabilités
- Comportement explicite plutôt que magique
- Documentation des décisions structurantes

**Ce projet ne doit pas devenir :**

- Un CMS libre où l'admin casse les layouts
- Un WordPress sur-mesure improvisé
- Un ERP
- Un prototype local maintenu par rustines
- Une accumulation de composants sans conventions

---

## 3. Architecture

**Arborescence cible :**

```
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

**Responsabilités :**

| Dossier            | Rôle                                         |
| ------------------ | -------------------------------------------- |
| `src/app`          | Routes Next.js, layouts, pages, handlers API |
| `src/components`   | Présentation et interactions UI              |
| `src/repositories` | Accès données, CRUD, mapping DB              |
| `src/services`     | Logique métier testable                      |
| `src/lib`          | Infrastructure technique                     |
| `src/types`        | Types CMS et DB                              |
| `src/config`       | Configuration stable non secrète             |
| `src/constants`    | Constantes métier                            |
| `src/utils`        | Helpers génériques                           |

Voir [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) pour le détail.

---

## 4. Flux de données

**Flux public et admin :**

```
Component → service → repository → Supabase
```

**Flux API :**

```
Route handler → validation/auth/permissions → service/repository → response
```

**Règles :**

- Pas d'appel Supabase direct dans un composant
- Pas de logique UI dans un repository
- Pas de JSX dans un service
- Pas de mapping DB dispersé dans les pages

---

## 5. Conventions de code

| Élément          | Convention                            |
| ---------------- | ------------------------------------- |
| Composants React | `PascalCase.tsx`                      |
| Services         | `camelCaseService.ts`                 |
| Repositories     | pluriel + `Repository.ts`             |
| Imports internes | `@/`                                  |
| Types exportés   | `PascalCase`                          |
| Default export   | Réservé aux fichiers Next.js naturels |

- TypeScript strict — pas de `any` non justifié

Voir [`docs/CODE_CONVENTIONS.md`](docs/CODE_CONVENTIONS.md).

---

## 6. Design system

**Direction visuelle Manssuétude :**

- Blanc dominant
- Orange Manssuétude en accent
- Noir premium pour sections fortes
- Tons crème pour respiration
- Typographie claire, rythme éditorial
- Admin visuel, sobre et rassurant

Les tokens vivent dans `src/config/designTokens.ts`. Les variables CSS opérationnelles vivent dans `src/styles/globals.css`.

Voir [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md).

---

## 7. Base de données

**Fichiers SQL :**

| Fichier                     | Contenu            |
| --------------------------- | ------------------ |
| `supabase/schema.sql`       | Tables principales |
| `supabase/storage.sql`      | Buckets médias     |
| `supabase/cms-advanced.sql` | Tables avancées    |

**Tables principales :** `users`, `pages`, `themes`, `productions`, `activities`, `projects`, `resources`, `form_submissions`, `site_settings`

> Les repositories doivent rester la couche principale d'accès aux données.

Voir [`docs/DATABASE.md`](docs/DATABASE.md).

---

## 8. Seed

`content.js` est une source de seed, pas une dépendance durable du front public.

```bash
npm run seed
```

Le script `scripts/seed.mjs` importe les contenus initiaux vers Supabase. Ne pas recréer de dépendance directe du site public à `content.js`.

---

## 9. Auth et permissions

**Existant :**

- Routes auth : `src/app/api/auth`
- Helpers : `src/lib/auth.ts`
- Permissions : `src/lib/permissions.ts`
- Repository auth : `src/repositories/authRepository.ts`

**Prévu :**

- Évolution vers Supabase Auth complète
- Rôles plus fins
- Permissions par capacité

> **Règle :** toute mutation admin doit passer par une vérification de rôle ou de permission.

---

## 10. Qualité et validation

**Avant livraison :**

```bash
npm run typecheck
npm run build
```

**Selon le changement :**

```bash
npm run test
npm run format:check
```

La CI exécute ces contrôles dans `.github/workflows/ci.yml`.

---

## 11. Git et PR

**Branches :**

| Branche     | Usage           |
| ----------- | --------------- |
| `main`      | Stable          |
| `develop`   | Intégration     |
| `feature/*` | Fonctionnalités |
| `fix/*`     | Corrections     |
| `chore/*`   | Maintenance     |

**Préfixes de commits :** `feat:` · `fix:` · `refactor:` · `docs:` · `test:` · `chore:`

**Une PR doit inclure :**

- Objectif
- Zones touchées
- Validations exécutées
- Risques
- Captures si l'UI change
- Notes DB si un schéma change

---

## 12. Règles de review

Relire en priorité :

- Séparation UI / service / repository
- Validation des entrées API
- Absence d'accès DB dans les composants
- Cohérence des types
- Absence de `any`
- Respect du design system
- Accessibilité basique
- Impact sur les fichiers legacy

---

## 13. Legacy

Les fichiers suivants sont conservés temporairement comme référence :

- `index.html`
- `app.js`
- `content.js`
- `styles.css`

> Ne pas supprimer ces fichiers pendant la Phase 0 sans décision explicite. Ne pas non plus les transformer en source principale du CMS.

---

## 14. Erreurs à éviter

- Ajouter une fonctionnalité produit pendant une tâche de fondation
- Mélanger logique métier et rendu
- Créer un composant fourre-tout
- Appeler Supabase dans l'UI
- Dupliquer un type ou un mapper
- Ajouter une librairie lourde sans décision
- Modifier les schémas Supabase sans documentation
- Exposer des chemins techniques à l'admin comme interface principale
- Supprimer un fichier legacy structurant sans justification
