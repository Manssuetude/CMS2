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

Voir [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) pour l'arborescence complète, les responsabilités et les flux de données.

---

## 4. Flux de données

Voir [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#5-flux-de-données-recommandé) pour les flux et les règles de dépendance entre couches.

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

Voir [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) pour la direction visuelle, les tokens et les règles CSS.

---

## 7. Base de données

Voir [`docs/DATABASE.md`](docs/DATABASE.md#fichiers-sql) pour les fichiers SQL, les tables et les règles d'accès.

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

Voir [`docs/QUALITY_GATES.md`](docs/QUALITY_GATES.md#2-commandes-obligatoires) pour les commandes, checklists et configuration CI.

---

## 11. Git et PR

Voir [`docs/WORKFLOWS.md`](docs/WORKFLOWS.md#branches) pour les branches, conventions de commits et format des PR.

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

Voir [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#8-statut-de-migration-legacy) pour le statut des fichiers legacy et les règles de migration.

---

## 14. Erreurs à éviter

Voir [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#7-anti-patterns-interdits) pour la liste complète des anti-patterns interdits.

---

[← Ordre de lecture](README.md#ordre-de-lecture-recommandé)
