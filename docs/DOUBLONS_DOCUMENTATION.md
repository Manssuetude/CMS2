# Recensement des doublons — Documentation Manssuétude CMS

> Analyse exhaustive des contenus répétés entre les fichiers markdown du projet (hors `CLAUDE.md`).
> Objectif : identifier les sources de vérité à consolider avant de nettoyer la documentation.

---

## Doublons critiques — contenu identique ou quasi-identique

### 1. Variables d'environnement

**Fichiers :** `README.md` · `docs/ONBOARDING.md`

Même liste exacte de variables, mêmes explications pour chaque clé. `ONBOARDING.md` ajoute seulement une note sur le minimum requis pour Supabase et la création de l'admin initial.

---

### 2. Fichiers SQL Supabase et ordre d'exécution

**Fichiers :** `ENGINEERING_GUIDE.md` · `docs/DATABASE.md` · `docs/ONBOARDING.md`

Les trois fichiers listent les mêmes trois fichiers dans le même ordre :

1. `supabase/schema.sql`
2. `supabase/storage.sql`
3. `supabase/cms-advanced.sql`

---

### 3. Tables Supabase principales

**Fichiers :** `ENGINEERING_GUIDE.md` · `docs/DATABASE.md`

Même liste de 9 tables : `users`, `pages`, `themes`, `productions`, `activities`, `projects`, `resources`, `form_submissions`, `site_settings`. Contenu repris mot pour mot.

---

### 4. Conventions de nommage des fichiers

**Fichiers :** `ENGINEERING_GUIDE.md` · `docs/CODE_CONVENTIONS.md`

Même règles :

- Composants : `PascalCase.tsx`
- Services : `camelCaseService.ts`
- Repositories : pluriel + `Repository.ts`
- Types : `PascalCase`
- Imports internes : `@/`
- `default export` réservé aux fichiers Next.js

---

### 5. Branches Git et préfixes de commits

**Fichiers :** `ENGINEERING_GUIDE.md` · `docs/WORKFLOWS.md` · `docs/ONBOARDING.md`

Branches identiques dans les trois : `main`, `develop`, `feature/*`, `fix/*`, `chore/*`.
Préfixes identiques : `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.
`ENGINEERING_GUIDE.md` et `ONBOARDING.md` sont pratiquement identiques mot pour mot.

---

### 6. Responsabilité des composants UI ← quadruple duplication

**Fichiers :** `docs/ARCHITECTURE.md` · `docs/CODE_CONVENTIONS.md` · `docs/RESPONSIBILITY_MAP.md` · `src/docs/component-conventions.md`

Les quatre fichiers énoncent les mêmes règles :

**Peuvent :** afficher, gérer l'état local, interagir, appeler des services légers.

**Ne peuvent pas :** appeler Supabase directement, faire du mapping DB, porter des règles métier lourdes, décider des permissions ou recommandations.

---

### 7. Responsabilité des repositories

**Fichiers :** `docs/ARCHITECTURE.md` · `docs/CODE_CONVENTIONS.md` · `docs/RESPONSIBILITY_MAP.md`

Même contenu dans les trois : CRUD, mapping rows→types, filtres, appels Supabase. Interdiction : composants, CSS, logique de présentation, décisions UX. Flux : `service → repository → database`.

---

### 8. Responsabilité des services

**Fichiers :** `docs/ARCHITECTURE.md` · `docs/CODE_CONVENTIONS.md` · `docs/RESPONSIBILITY_MAP.md`

Même contenu dans les trois : règles métier, orchestration, recommandations, relations, SEO, médias, smart defaults. Interdiction : rendre du JSX, dépendre de composants, accéder au DOM, exposer des secrets.

---

### 9. Modules CMS par entité (Themes, Productions, Activities…)

**Fichiers :** `docs/ARCHITECTURE.md` · `docs/RESPONSIBILITY_MAP.md`

Les deux fichiers décrivent exactement les mêmes emplacements pour chaque entité : type dans `src/types/cms.ts`, repository dans `src/repositories/`, service si logique métier, routes UI publique et admin.

---

### 10. Checklist avant Pull Request

**Fichiers :** `README.md` · `ENGINEERING_GUIDE.md` · `docs/ONBOARDING.md` · `docs/QUALITY_GATES.md`

Quatre fichiers listent les mêmes obligations (`typecheck`, `build`) et les mêmes conditions (`test`, `format:check`, vérification visuelle, documentation). Niveaux de détail différents, contenu identique.

---

## Doublons majeurs — contenu très similaire, détail variable

### 11. Stack technique

**Fichiers :** `README.md` · `ENGINEERING_GUIDE.md` · `docs/ONBOARDING.md`

Même technologies listées (Next.js, React, TypeScript, Supabase, Route Handlers, Storage, Resend, Google Drive, CSS propriétaire, Vercel). Présentation différente, aucune contradiction.

---

### 12. Arborescence `src/` et responsabilités générales

**Fichiers :** `README.md` · `ENGINEERING_GUIDE.md` · `docs/ARCHITECTURE.md` · `docs/ONBOARDING.md`

Même dossiers listés (`app/`, `components/`, `repositories/`, `services/`, `lib/`, `types/`, `config/`, `constants/`, `hooks/`, `styles/`, `utils/`). `ARCHITECTURE.md` et `ENGINEERING_GUIDE.md` sont plus détaillés ; `README.md` et `ONBOARDING.md` sont plus concis.

---

### 13. Flux de données recommandé

**Fichiers :** `README.md` · `ENGINEERING_GUIDE.md` · `docs/ARCHITECTURE.md` · `docs/ONBOARDING.md`

Même flux dans les quatre :

```
UI → service → repository → database
API route → validation → service/repository → response
```

`ARCHITECTURE.md` ajoute "hook UI si nécessaire" comme étape intermédiaire.

---

### 14. Vision et objectif du projet

**Fichiers :** `README.md` · `ENGINEERING_GUIDE.md` · `docs/ARCHITECTURE.md` · `docs/ONBOARDING.md`

Tous quatre énoncent : association intellectuelle, plateforme éditoriale, simple pour l'équipe interne (5-8 personnes), architecture sérieuse pour les développeurs. Formulations légèrement différentes, même essence, aucune contradiction.

---

### 15. Ce que nous ne construisons pas

**Fichiers :** `README.md` · `ENGINEERING_GUIDE.md` · `docs/ONBOARDING.md` · `docs/ARCHITECTURE.md`

Même liste d'anti-objectifs : pas de WordPress générique, ERP, usine à pages, Notion complet, outil de gestion exhaustif. `ENGINEERING_GUIDE.md` et `ONBOARDING.md` développent ; `README.md` et `ARCHITECTURE.md` mentionnent brièvement.

---

### 16. Fichiers legacy à conserver

**Fichiers :** `README.md` · `ENGINEERING_GUIDE.md` · `docs/ONBOARDING.md` · `docs/ARCHITECTURE.md` · `docs/LEGACY_MIGRATION_PLAN.md`

`index.html`, `app.js`, `content.js`, `styles.css` sont mentionnés comme fichiers legacy à conserver temporairement dans quatre fichiers. `LEGACY_MIGRATION_PLAN.md` est le document dédié qui approfondit le sujet.

---

### 17. Règle : requêtes Supabase uniquement dans les repositories

**Fichiers :** `docs/CODE_CONVENTIONS.md` · `docs/DATABASE.md` · `docs/ONBOARDING.md`

Même règle formulée trois fois : "pas d'accès DB direct dans les composants", "requêtes Supabase doivent rester dans les repositories", "les requêtes Supabase doivent rester dans `src/repositories`".

---

### 18. Anti-patterns interdits

**Fichiers :** `docs/ARCHITECTURE.md` · `ENGINEERING_GUIDE.md` · `docs/ONBOARDING.md`

`ARCHITECTURE.md` liste 16 anti-patterns (liste maîtresse). `ENGINEERING_GUIDE.md` en reprend 7. `ONBOARDING.md` en reprend 10. Sous-ensemble commun : appel Supabase dans les composants, routes API sans validation, `any`, chemins relatifs profonds, styles inline, secrets versionnés.

---

### 19. Auth et permissions

**Fichiers :** `README.md` · `ENGINEERING_GUIDE.md`

`README.md` : mention brève "session admin locale côté serveur, prête à évoluer vers Supabase Auth". `ENGINEERING_GUIDE.md` : développement complet avec fichiers concernés et évolution prévue.

---

### 20. Design system — philosophie visuelle

**Fichiers :** `ENGINEERING_GUIDE.md` · `docs/DESIGN_SYSTEM.md`

Même principes : blanc dominant, orange Manssuétude, noir premium, tons crème, respiration. `ENGINEERING_GUIDE.md` formule brièvement ; `DESIGN_SYSTEM.md` développe en détail.

---

### 21. Tokens design

**Fichiers :** `ENGINEERING_GUIDE.md` · `docs/DESIGN_SYSTEM.md`

Les deux mentionnent les mêmes deux sources : `src/config/designTokens.ts` et `src/styles/globals.css`. Les familles de tokens (colors, typography, spacing, radius, shadows, layout, breakpoints, zIndex) sont listées dans les deux.

---

### 22. Responsabilité de `src/lib`

**Fichiers :** `docs/ARCHITECTURE.md` · `docs/RESPONSIBILITY_MAP.md`

Même liste dans les deux : auth, db, env, errors, logger, validation, media, Google Drive, permissions, CTA. Même interdiction : ne pas devenir un fourre-tout métier.

---

### 23. Responsabilité de `src/utils`

**Fichiers :** `docs/ARCHITECTURE.md` · `docs/RESPONSIBILITY_MAP.md`

Même définition dans les deux : helpers génériques sans signification produit (slug, formatage, conversion de row). Même interdiction : ne pas connaître Manssuétude, Supabase ou le CMS.

---

### 24. Responsabilité de `src/types`

**Fichiers :** `docs/ARCHITECTURE.md` · `docs/RESPONSIBILITY_MAP.md`

Même contenu : types globaux du domaine (CMS, DB, entités, statuts, visibilité, médias, formulaires). Types locaux uniquement s'ils ne sortent pas du composant.

---

### 25. Responsabilité de `src/hooks`

**Fichiers :** `docs/ARCHITECTURE.md` · `src/hooks/README.md`

Même règles dans les deux : hooks UI-oriented, pas d'accès direct Supabase, pas de logique métier critique, déléguer à `src/services` si le métier est lourd.

---

### 26. Entités CMS

**Fichiers :** `docs/CMS.md` · `docs/ONBOARDING.md`

Même liste d'entités : thèmes, productions, activités, projets, ressources, médias, pages, formulaires. `CMS.md` développe chaque entité (status, visibility, tags, relations, media, SEO, versioning) ; `ONBOARDING.md` liste seulement.

---

### 27. Comportement des formulaires (CTA `FORM:`)

**Fichiers :** `docs/CMS.md` · `docs/ONBOARDING.md`

Même règle dans les deux : les formulaires ne se rendent jamais automatiquement dans les pages, les CTA commençant par `FORM:` ouvrent le modal.

---

## Sources de vérité recommandées

| Thème                                                        | Source de vérité à retenir           |
| ------------------------------------------------------------ | ------------------------------------ |
| Variables d'environnement                                    | `docs/ONBOARDING.md` (plus détaillé) |
| Fichiers SQL et ordre                                        | `docs/DATABASE.md`                   |
| Tables Supabase                                              | `docs/DATABASE.md`                   |
| Conventions de nommage                                       | `docs/CODE_CONVENTIONS.md`           |
| Branches et commits Git                                      | `docs/WORKFLOWS.md`                  |
| Responsabilités couches (composants, services, repositories) | `docs/ARCHITECTURE.md`               |
| Checklist avant PR                                           | `docs/QUALITY_GATES.md`              |
| Stack technique                                              | `README.md`                          |
| Flux de données                                              | `docs/ARCHITECTURE.md`               |
| Vision et objectifs                                          | `README.md`                          |
| Anti-patterns                                                | `docs/ARCHITECTURE.md`               |
| Fichiers legacy                                              | `docs/LEGACY_MIGRATION_PLAN.md`      |
| Design system                                                | `docs/DESIGN_SYSTEM.md`              |
| Entités CMS                                                  | `docs/CMS.md`                        |
| Auth et permissions                                          | `ENGINEERING_GUIDE.md`               |

---

## Recommandations de consolidation

### Rôle cible de chaque fichier

| Fichier                             | Rôle cible après consolidation                                                                                                                      |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `README.md`                         | Point d'entrée : vision, installation en 4 commandes, liens vers tout le reste. Pas de contenu dupliqué.                                            |
| `ENGINEERING_GUIDE.md`              | Principes stratégiques et décisions d'architecture. Supprimer tout ce qui est déjà dans `ARCHITECTURE.md`, `CODE_CONVENTIONS.md` ou `WORKFLOWS.md`. |
| `docs/ARCHITECTURE.md`              | Source de vérité technique complète : arborescence, flux, responsabilités, anti-patterns. Les autres docs y renvoient.                              |
| `docs/ONBOARDING.md`                | Guide d'arrivée appliqué : installation détaillée, modules clés, checklist PR, glossaire. Renvoyer vers les docs spécialisés pour les détails.      |
| `docs/CODE_CONVENTIONS.md`          | Patterns de code détaillés uniquement. Supprimer les responsabilités de couches déjà dans `ARCHITECTURE.md`.                                        |
| `docs/RESPONSIBILITY_MAP.md`        | Tableau synthétique des responsabilités. Peut devenir un résumé visuel de `ARCHITECTURE.md` plutôt qu'une répétition.                               |
| `docs/WORKFLOWS.md`                 | Référence unique pour Git : branches, commits, PR. Supprimer ces infos de `ENGINEERING_GUIDE.md` et `ONBOARDING.md`.                                |
| `docs/DATABASE.md`                  | Référence unique pour le schéma SQL. Supprimer les listes de tables de `ENGINEERING_GUIDE.md`.                                                      |
| `docs/QUALITY_GATES.md`             | Référence unique pour les validations avant PR. Supprimer ces checklists de `README.md`, `ENGINEERING_GUIDE.md` et `ONBOARDING.md`.                 |
| `docs/DESIGN_SYSTEM.md`             | Référence unique design. Supprimer les mentions de tokens et couleurs de `ENGINEERING_GUIDE.md`.                                                    |
| `docs/CMS.md`                       | Référence unique pour les entités, statuts et comportements CMS.                                                                                    |
| `docs/LEGACY_MIGRATION_PLAN.md`     | Référence unique pour les fichiers legacy. Les autres docs n'en mentionnent que l'existence.                                                        |
| `src/docs/component-conventions.md` | À fusionner dans `docs/CODE_CONVENTIONS.md` ou supprimer — contenu entièrement couvert ailleurs.                                                    |
| `src/hooks/README.md`               | Garder : court, local, utile. Peut renvoyer vers `docs/ARCHITECTURE.md` pour le contexte.                                                           |

---

### Actions prioritaires

**Urgent — quadruple duplication des responsabilités de couches**

`docs/ARCHITECTURE.md`, `docs/CODE_CONVENTIONS.md`, `docs/RESPONSIBILITY_MAP.md` et `src/docs/component-conventions.md` répètent tous les mêmes règles sur composants, services et repositories.

Action : `docs/ARCHITECTURE.md` devient la seule source. Les trois autres remplacent leur contenu par un renvoi :

> "Voir [docs/ARCHITECTURE.md](ARCHITECTURE.md) pour les responsabilités de chaque couche."

---

**Urgent — checklist PR dans 4 fichiers**

`README.md`, `ENGINEERING_GUIDE.md`, `ONBOARDING.md` et `QUALITY_GATES.md` listent tous les mêmes commandes obligatoires.

Action : `docs/QUALITY_GATES.md` devient la seule source. Les autres remplacent leur checklist par :

> "Checklist complète : [docs/QUALITY_GATES.md](QUALITY_GATES.md)"

---

**Important — branches et commits dans 3 fichiers**

Action : `docs/WORKFLOWS.md` devient la seule source. Supprimer la section Git de `ENGINEERING_GUIDE.md` et `ONBOARDING.md`, remplacer par un lien.

---

**Important — variables d'environnement dans 2 fichiers**

Action : garder le détail dans `docs/ONBOARDING.md`. Dans `README.md`, remplacer le bloc complet par :

> "Variables détaillées dans [`docs/ONBOARDING.md`](docs/ONBOARDING.md#6-variables-denvironnement)."

---

**Important — tables et fichiers SQL dans 3 fichiers**

Action : `docs/DATABASE.md` devient la seule source. Supprimer ces listes de `ENGINEERING_GUIDE.md` et `ONBOARDING.md`, remplacer par un lien.

---

**Modéré — `src/docs/component-conventions.md` entièrement redondant**

Ce fichier ne contient rien qui ne soit déjà dans `docs/ARCHITECTURE.md` ou `docs/CODE_CONVENTIONS.md`.

Action : supprimer ou fusionner dans `docs/CODE_CONVENTIONS.md`, puis supprimer.

---

### Principe général à appliquer

Chaque information doit vivre à **un seul endroit**. Les autres fichiers y font référence avec un lien. Un lecteur qui consulte `ONBOARDING.md` doit trouver les liens vers les sources, pas les copies.
