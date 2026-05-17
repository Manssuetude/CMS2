# Phase 0 — Audit technique initial

> Analyse complète de l'état du dépôt avant stabilisation. Points solides, dette technique et recommandations.

---

## 1. Résumé exécutif

Le projet Manssuétude CMS contient deux architectures qui coexistent : un **prototype statique vanilla** à la racine et une **nouvelle architecture Next.js** dans `src/`. La base Next.js est la bonne direction : séparation routes publiques/admin/API, repositories, services, types, composants et documentation technique.

**Points solides récents :** TypeScript strict activé, imports `@/` présents, validations Zod commencées, erreurs API centralisées, première CI présente.

**Problème principal :** les fichiers `index.html`, `app.js`, `content.js` et `styles.css` portent encore une logique produit complète (`localStorage`, administration locale, structure de contenu ancienne). Cette coexistence peut fortement troubler de nouveaux développeurs.

> Le niveau de risque principal n'est pas une panne immédiate — les checks passent. Le risque principal est **l'ambiguïté pour l'équipe**.

---

## 2. Architecture actuelle observée

**Prototype statique historique à la racine :** `index.html` · `app.js` · `content.js` · `styles.css`

**Assets communs :** `assets/photos/*` · `assets/files/*` · `assets/reference/*`

**Application Next.js :**

| Dossier                                    | Contenu                                                         |
| ------------------------------------------ | --------------------------------------------------------------- |
| `src/app/(public)`                         | Pages publiques                                                 |
| `src/app/admin`                            | Administration                                                  |
| `src/app/api`                              | Endpoints API                                                   |
| `src/components`                           | `public`, `admin`, `media`, `forms`, `blocks`                   |
| `src/repositories`                         | Accès données                                                   |
| `src/services`                             | Logique métier émergente                                        |
| `src/lib`                                  | Auth, DB, CTA, validations, erreurs, logs, Google Drive, médias |
| `src/types`                                | Types CMS et DB                                                 |
| `src/constants`, `src/config`, `src/utils` | Constantes, tokens, helpers                                     |

**Structure cible partiellement créée mais vide :** `src/entities/*` · `src/components/ui` · `src/components/layout` · `src/components/cards` · `src/components/navigation`

**Documentation existante :** `README.md` · `ENGINEERING_GUIDE.md` · `docs/ARCHITECTURE.md` · `docs/AUDIT.md` · `docs/CMS.md` · `docs/DATABASE.md` · `docs/WORKFLOWS.md` · `src/docs/component-conventions.md`

**Infrastructure :** `.github/workflows/ci.yml` · `.editorconfig` · `.prettierrc.json` · `.gitignore` · `tests/architecture.test.mjs`

**Supabase :** `supabase/schema.sql` · `supabase/storage.sql` · `supabase/cms-advanced.sql`

**Scripts :** `scripts/seed.mjs` · `scripts/check-db.mjs`

---

## 3. Points solides

- `tsconfig.json` active `strict: true`, `allowJs: false`, `isolatedModules: true` et l'alias `@/*`
- `package.json` expose des scripts clairs : `dev`, `build`, `start`, `typecheck`, `format:check`, `test`, `seed`, `db:check`
- `src/lib/errors.ts` pose une réponse API homogène avec `AppError` et gestion `ZodError`
- `src/lib/validation.ts` centralise déjà plusieurs validations : statuts, visibilité, formulaires, médias
- `src/lib/logger.ts` donne une première base de logs structurés
- `src/constants/collections.ts` évite les noms de tables arbitraires dans les routes API génériques
- `src/constants/adminNavigation.ts` centralise la navigation admin
- `src/config/designTokens.ts` formalise les premiers tokens couleur, typo, spacing, radius et shadow
- `src/repositories/*` isole l'accès Supabase hors des composants
- `src/services/*` amorce la séparation de la logique métier : graphe, relations, recommandations, SEO, médias, santé, taxonomie
- `src/components/forms/CtaButton.tsx` respecte le principe CTA centralisé avec `FORM:*`
- `tests/architecture.test.mjs` protège les règles de base : fichiers fondation présents, pas de `next lint` interactif, pas de `any` explicite dans `src` et `scripts`
- `.gitignore` couvre les secrets et artefacts principaux
- Documentation d'équipe déjà présente, même si elle doit encore être renforcée et hiérarchisée

---

## 4. Dette technique critique

### Critique

#### 1. Coexistence non tranchée entre prototype statique et CMS Next.js

- **Problème :** deux applications complètes coexistent dans le même dépôt
- **Fichiers :** `index.html`, `app.js`, `content.js`, `styles.css`, `src/app/*`, `src/components/*`
- **Impact :** un nouveau développeur peut modifier le mauvais système, corriger un bug dans `app.js` alors que le site actif est dans `src/`, ou croire que `content.js` reste la source principale
- **Recommandation :** déclarer officiellement le prototype comme référence/seed uniquement. Le déplacer vers `legacy/vanilla-prototype` après validation. Ne pas supprimer tant que le seed dépend de `content.js`

---

#### 2. `content.js` — source de données historique importante mal positionnée

- **Problème :** `content.js` contient beaucoup de contenu structurant et sert de seed, mais vit à la racine au même niveau que l'application active
- **Fichiers :** `content.js`, `scripts/seed.mjs`, `README.md`
- **Impact :** confusion sur la source de vérité. Risque de modifier `content.js` en pensant modifier le CMS live
- **Recommandation :** renommer ou déplacer en `scripts/seed-data/legacy-content.js` ou `supabase/seeds/content.js`, puis adapter `scripts/seed.mjs`

---

#### 3. Composant admin trop responsable

- **Problème :** `src/components/admin/EditorStudio.tsx` contient l'état, les actions de structure, la logique de duplication, la création de blocs par défaut, les réglages contextuels et le rendu de l'éditeur
- **Fichiers :** `src/components/admin/EditorStudio.tsx`
- **Impact :** difficile à tester, difficile à maintenir, risqué pour l'ajout de nouveaux blocs
- **Recommandation :** découper en `EditorStructurePanel`, `EditorPreviewPanel`, `EditorSettingsPanel`, `useEditorBlocks`, `blockFactory`

---

#### 4. Upload et sélection média partiellement simulés côté UI

- **Problème :** certains boutons existent mais ne sont pas encore reliés à des flux réels
- **Fichiers :** `src/components/media/MediaField.tsx`, `src/components/media/ImportWizard.tsx`, `src/components/media/MediaLibrary.tsx`
- **Impact :** l'admin semble offrir Google Drive, médiathèque, remplacement et suppression, mais certaines actions sont encore visuelles. Risque de fausse confiance produit
- **Recommandation :** en Phase 0, annoter clairement "UI shell seulement". En Phase 1, implémenter ou masquer les actions non fonctionnelles

---

### Important

#### 5. CSS monolithique

- **Problème :** le style Next.js actif est concentré dans `src/styles/globals.css` (~737 lignes)
- **Impact :** styles publics, admin, modales, médias, cards et éditeur mélangés. Les nouveaux développeurs risquent d'ajouter des styles au hasard
- **Recommandation :** découper en couches (`tokens.css`, `base.css`, `layout.css`, `public.css`, `admin.css`, `forms.css`, `media.css`) ou migrer vers Tailwind/shadcn décidé explicitement

---

#### 6. Ancien CSS encore présent

- **Problème :** `styles.css` à la racine fait ~1054 lignes et concerne le prototype vanilla
- **Impact :** confusion entre styles actifs et styles hérités
- **Recommandation :** déplacer avec le prototype dans un dossier legacy après validation

---

#### 7. Repositories encore très larges

- **Problème :** `src/repositories/contentRepository.ts` regroupe pages, thèmes, productions, activités et projets malgré l'existence de repositories dédiés
- **Impact :** responsabilité floue. Les nouveaux développeurs ne sauront pas où ajouter une requête
- **Recommandation :** conserver temporairement `contentRepository` comme façade publique, mais déplacer les requêtes par entité dans les repositories dédiés

---

#### 8. Types Supabase trop génériques

- **Problème :** `src/types/database.ts` utilise encore des `Record<string, Json>` pour toutes les tables
- **Impact :** les repositories doivent mapper manuellement et TypeScript ne protège pas vraiment les colonnes DB
- **Recommandation :** générer les types Supabase réels avec Supabase CLI ou maintenir un type DB précis minimal pour les tables critiques

---

#### 9. API générique trop permissive conceptuellement

- **Problème :** `src/app/api/content/[collection]/route.ts` accepte une collection dynamique, même si filtrée
- **Fichiers :** `src/app/api/content/[collection]/route.ts`, `src/constants/collections.ts`
- **Impact :** utile pour prototype admin, mais moins clair pour un CMS durable avec validations par entité
- **Recommandation :** garder pendant Phase 0, puis créer des endpoints typés par entité avant l'ouverture à plusieurs développeurs

---

#### 10. Formulaires typés par labels visibles

- **Problème :** `FormModal` génère les champs depuis des labels français utilisés comme noms de champs
- **Impact :** les données soumises sont moins stables si un label change. Difficile à exploiter en back-office et en export
- **Recommandation :** créer une config de formulaire avec `name`, `label`, `type`, `required`, `validation`

---

### Moyen

#### 11. Dossiers cibles vides

- **Problème :** `src/entities/*`, `src/components/ui`, `src/components/layout`, `src/components/cards`, `src/components/navigation` existent sans contenu
- **Impact :** intention utile, mais peut perdre les nouveaux développeurs
- **Recommandation :** ajouter un court `README.md` dans les dossiers structurants ou ne créer les dossiers que lorsqu'ils deviennent actifs

---

#### 12. Documentation dispersée

- **Problème :** `README.md`, `ENGINEERING_GUIDE.md`, `docs/AUDIT.md`, `docs/ARCHITECTURE.md`, `src/docs/component-conventions.md` se recouvrent partiellement
- **Impact :** risque de divergence entre plusieurs sources de vérité
- **Recommandation :** définir `README.md` comme onboarding rapide, `ENGINEERING_GUIDE.md` comme règles d'équipe, `docs/*` comme détails techniques. Déplacer `src/docs/component-conventions.md` vers `docs/COMPONENTS.md`

---

#### 13. Navigation publique et routes encore partiellement hardcodées

- **Problème :** certaines pages publiques injectent encore des images fixes
- **Impact :** contredit partiellement l'ambition CMS où les médias viennent de la base
- **Recommandation :** accepter temporairement pour stabilisation, puis remplacer par une résolution média via repository quand la couche média est stable

---

#### 14. `MediaField` ne synchronise pas les champs metadata

- **Problème :** alt text et légende sont des inputs non reliés à `onChange` ou à une sauvegarde
- **Impact :** l'interface laisse croire que les métadonnées sont modifiables, mais elles ne sont pas persistées depuis ce composant
- **Recommandation :** désactiver/clarifier ces champs ou les brancher proprement à une mutation

---

#### 15. Tests encore symboliques

- **Problème :** `tests/architecture.test.mjs` vérifie seulement quelques règles de fondation
- **Impact :** pas de tests de services, repositories, formulaires, API ou composants
- **Recommandation :** garder ce test comme garde-fou, puis ajouter des tests unitaires services/repositories avant les gros ajouts

---

### Faible

#### 16. Artefacts locaux présents

- **Problème :** `.DS_Store`, `assets/.DS_Store`, `src/.DS_Store`, `.npm-cache`, `.next`, `.next-stale-1778801994`, `tsconfig.tsbuildinfo`
- **Impact :** ignorés par `.gitignore`, mais polluent la lecture locale
- **Recommandation :** nettoyer localement — supprimer `.DS_Store`, `.npm-cache`, `.next-stale-*`, `tsconfig.tsbuildinfo` quand aucun serveur n'en dépend

---

#### 17. Scripts de seed en JavaScript

- **Problème :** `scripts/seed.mjs` est en JavaScript et importe le legacy content
- **Impact :** acceptable temporairement, mais moins robuste qu'un seed typé
- **Recommandation :** ne pas convertir maintenant. Le faire après déplacement/clarification du seed legacy

---

#### 18. Pas de ESLint complet

- **Problème :** `npm run lint` pointe vers `npm run typecheck`, car `next lint` est obsolète en Next 15
- **Impact :** le projet n'a pas encore de règles lint React/Next dédiées
- **Recommandation :** installer et configurer ESLint CLI plus tard, après stabilisation des dossiers

---

## 5. Ancienne architecture vs nouvelle architecture

### Ancienne architecture statique

**Fichiers :** `index.html` · `app.js` · `content.js` · `styles.css`

**Caractéristiques :** rendu client vanilla, données centralisées dans `content.js`, navigation hash, admin local dans `app.js`, usage de `localStorage`, CSS complet dans `styles.css`.

**Statut recommandé :** référence historique et source de seed temporaire.

---

### Nouvelle architecture CMS Next.js

**Fichiers :** `src/app/(public)/*` · `src/app/admin/*` · `src/app/api/*` · `src/components/*` · `src/repositories/*` · `src/services/*` · `src/lib/*` · `src/types/*` · `supabase/*`

**Caractéristiques :** Next.js App Router, routes publiques et admin séparées, API route handlers, repositories, services, Supabase, modèle CMS typé, documentation d'ingénierie commencée.

**Statut recommandé :** architecture active et cible.

---

### Zone de transition

- `content.js` sert encore au seed
- Les assets dans `assets/*` servent au prototype et au CMS
- Les pages Next.js utilisent encore parfois des chemins directs comme `/assets/photos/hero-accueil.png`
- Certains composants admin sont des shells visuels non entièrement connectés

---

## 6. Risques pour les nouveaux développeurs

- Confondre `app.js` avec le code actif du CMS
- Modifier `styles.css` au lieu de `src/styles/globals.css`
- Modifier `content.js` en croyant modifier le contenu live
- Ajouter des requêtes dans `contentRepository.ts` au lieu d'un repository d'entité
- Croire que `src/entities/*` est déjà utilisé alors que les dossiers sont vides
- Croire que les boutons Google Drive / médiathèque / remplacement média sont entièrement fonctionnels
- Croire que `npm run lint` fait un lint ESLint complet alors qu'il exécute actuellement TypeScript
- Ne pas comprendre la différence entre `docs/AUDIT.md` et `docs/PHASE_0_AUDIT.md`
- Travailler dans un dossier sans `.git` local
- Lancer des refactors DB/Supabase avant que la frontière prototype/CMS soit clarifiée

---

## 7. Recommandations Phase 0

1. Marquer officiellement `src/` comme application active dans `README.md`
2. Marquer officiellement `index.html`, `app.js`, `content.js`, `styles.css` comme prototype legacy
3. Déplacer le prototype vers `legacy/vanilla-prototype` ou `docs/reference/prototype`
4. Déplacer `content.js` vers une zone de seed explicite, puis adapter `scripts/seed.mjs`
5. Ajouter un `docs/COMPONENTS.md` et déplacer le contenu de `src/docs/component-conventions.md`
6. Ajouter des `README.md` courts dans `src/entities`, `src/repositories`, `src/services`, `src/components`
7. Découper `EditorStudio.tsx` en composants et hook interne sans changer le comportement
8. Clarifier les actions média non fonctionnelles : masquer, désactiver ou documenter comme "prévu"
9. Découper `src/styles/globals.css` en couches ou décider officiellement d'une migration Tailwind/shadcn
10. Transformer `FormModal` en configuration de champs stable avec `name` technique et `label` affiché
11. Générer ou écrire des types Supabase plus précis pour les tables principales
12. Ajouter des tests unitaires pour `src/lib/cta.ts`, `src/services/*`, `src/repositories/*` avec mocks
13. Installer ESLint CLI avec règles Next/React quand la structure de dossiers est figée
14. Nettoyer les fichiers parasites locaux : `.DS_Store`, `.npm-cache`, `.next-stale-*`, `tsconfig.tsbuildinfo`
15. Stabiliser le workflow GitHub Desktop ou initialiser un vrai `.git` dans le dossier de travail principal

---

## 8. Ce qu'il ne faut pas faire maintenant

- Ne pas commencer la Phase 1 produit
- Ne pas ajouter de nouvelles fonctionnalités CMS avant clarification prototype/CMS
- Ne pas supprimer `content.js` tant que `scripts/seed.mjs` en dépend
- Ne pas supprimer `assets/*` sans vérifier les références publiques, admin et seed
- Ne pas toucher aux migrations Supabase sauf nécessité de documentation ou correction bloquante
- Ne pas refondre le design public maintenant
- Ne pas installer une grosse pile UI sans décision d'équipe
- Ne pas brancher Google Drive avant d'avoir clarifié le composant média et ses contrats
- Ne pas multiplier les endpoints API avant d'avoir défini la convention par entité
- Ne pas convertir `scripts/seed.mjs` en TypeScript tant que la source seed legacy n'est pas déplacée
- Ne pas traiter `npm run lint` comme un ESLint complet
- Ne pas déplacer les dossiers vides sans décider si l'architecture par entité sera réellement utilisée
- Ne pas publier ou exposer `.env.local`
- Ne pas régénérer ou modifier les clés Supabase depuis cette phase d'audit, sauf décision de sécurité séparée
