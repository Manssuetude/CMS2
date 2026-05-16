# Phase 0 — Audit technique initial

## 1. Résumé exécutif

Le projet Manssuétude CMS contient aujourd’hui deux architectures qui coexistent : un prototype statique vanilla à la racine et une nouvelle architecture Next.js dans `src/`. La nouvelle base Next.js est la bonne direction : elle possède déjà une séparation entre routes publiques, routes admin, API, repositories, services, types, composants et documentation technique. Les fondations récentes sont utiles : TypeScript strict est activé, les imports `@/` existent, les validations Zod commencent à apparaître, les erreurs API sont centralisées et une première CI est présente.

Le dépôt reste toutefois dans un état de transition. Les fichiers `index.html`, `app.js`, `content.js` et `styles.css` portent encore une logique produit complète, dont un stockage `localStorage`, une administration locale et une structure de contenu ancienne. Cette coexistence peut fortement troubler de nouveaux développeurs s’ils ne savent pas quelle architecture est active. Le CMS Next.js dépend encore de données seedées depuis `content.js`, mais le frontend public ne devrait plus être influencé par le prototype à terme.

Plusieurs dossiers cibles existent déjà mais sont vides : `src/entities/*`, `src/components/ui`, `src/components/layout`, `src/components/cards`, `src/components/navigation`. C’est une bonne intention architecturale, mais cela peut aussi donner l’impression d’une architecture plus mature qu’elle ne l’est réellement. Le CSS reste très centralisé dans `src/styles/globals.css`, tandis que l’ancien `styles.css` vit encore à la racine.

Le niveau de risque principal n’est pas une panne immédiate : les checks récents passent. Le risque principal est l’ambiguïté pour l’équipe. Avant toute Phase 1, il faut clarifier le statut du prototype, déplacer les références héritées dans une zone d’archive ou de seed, finaliser les conventions et réduire les composants admin trop gros.

## 2. Architecture actuelle observée

Organisation réelle du dépôt :

- Prototype statique historique à la racine :
  - `index.html`
  - `app.js`
  - `content.js`
  - `styles.css`
- Assets communs :
  - `assets/photos/*`
  - `assets/files/*`
  - `assets/reference/*`
- Application Next.js :
  - `src/app/(public)` pour les pages publiques.
  - `src/app/admin` pour l’administration.
  - `src/app/api` pour les endpoints API.
  - `src/components/public`, `src/components/admin`, `src/components/media`, `src/components/forms`, `src/components/blocks`.
  - `src/repositories` pour l’accès données.
  - `src/services` pour la logique métier émergente.
  - `src/lib` pour auth, DB, CTA, validations, erreurs, logs, Google Drive, médias.
  - `src/types` pour les types CMS et DB.
  - `src/constants`, `src/config`, `src/utils` pour les constantes, tokens et helpers.
- Structure cible partiellement créée mais vide :
  - `src/entities/theme`
  - `src/entities/production`
  - `src/entities/project`
  - `src/entities/activity`
  - `src/entities/resource`
  - `src/entities/media`
  - `src/entities/season`
  - `src/entities/member`
  - `src/components/ui`
  - `src/components/layout`
  - `src/components/cards`
  - `src/components/navigation`
- Documentation existante :
  - `README.md`
  - `ENGINEERING_GUIDE.md`
  - `docs/ARCHITECTURE.md`
  - `docs/AUDIT.md`
  - `docs/CMS.md`
  - `docs/DATABASE.md`
  - `docs/WORKFLOWS.md`
  - `src/docs/component-conventions.md`
- Infrastructure :
  - `.github/workflows/ci.yml`
  - `.editorconfig`
  - `.prettierrc.json`
  - `.gitignore`
  - `tests/architecture.test.mjs`
- Supabase :
  - `supabase/schema.sql`
  - `supabase/storage.sql`
  - `supabase/cms-advanced.sql`
- Scripts :
  - `scripts/seed.mjs`
  - `scripts/check-db.mjs`

## 3. Points solides

- `tsconfig.json` active `strict: true`, `allowJs: false`, `isolatedModules: true` et l’alias `@/*`.
- `package.json` expose des scripts clairs : `dev`, `build`, `start`, `typecheck`, `format:check`, `test`, `seed`, `db:check`.
- `src/lib/errors.ts` pose une réponse API homogène avec `AppError` et gestion `ZodError`.
- `src/lib/validation.ts` centralise déjà plusieurs validations : statuts, visibilité, formulaires, médias.
- `src/lib/logger.ts` donne une première base de logs structurés.
- `src/constants/collections.ts` évite désormais les noms de tables arbitraires dans les routes API génériques.
- `src/constants/adminNavigation.ts` centralise la navigation admin.
- `src/config/designTokens.ts` formalise les premiers tokens couleur, typo, spacing, radius et shadow.
- `src/repositories/*` isole l’accès Supabase hors des composants.
- `src/services/*` amorce la séparation de la logique métier : graphe, relations, recommandations, SEO, médias, santé, taxonomie.
- `src/components/forms/CtaButton.tsx` respecte déjà le principe CTA centralisé avec `FORM:*`.
- `tests/architecture.test.mjs` protège quelques règles de base : fichiers fondation présents, pas de `next lint` interactif, pas de `any` explicite dans `src` et `scripts`.
- `.gitignore` couvre les secrets et artefacts principaux : `.env.local`, `.next`, `.npm-cache`, `node_modules`, `tsconfig.tsbuildinfo`.
- La documentation d’équipe existe déjà, même si elle doit encore être renforcée et hiérarchisée.

## 4. Dette technique critique

### Critique

#### 1. Coexistence non tranchée entre prototype statique et CMS Next.js

- Problème identifié : deux applications complètes coexistent dans le même dépôt.
- Fichiers concernés : `index.html`, `app.js`, `content.js`, `styles.css`, `src/app/*`, `src/components/*`.
- Impact : un nouveau développeur peut modifier le mauvais système, corriger un bug dans `app.js` alors que le site actif est dans `src/`, ou croire que `content.js` reste la source principale.
- Recommandation : déclarer officiellement le prototype comme référence/seed uniquement. Le déplacer ensuite vers `legacy/vanilla-prototype` ou `docs/reference/prototype` après validation. Ne pas supprimer tant que le seed dépend de `content.js`.

#### 2. `content.js` reste une source de données historique très importante

- Problème identifié : `content.js` contient encore beaucoup de contenu structurant et sert de seed, mais vit à la racine au même niveau que l’application active.
- Fichiers concernés : `content.js`, `scripts/seed.mjs`, `README.md`.
- Impact : confusion sur la source de vérité. Risque de modifier `content.js` en pensant modifier le CMS live.
- Recommandation : renommer ou déplacer en `scripts/seed-data/legacy-content.js` ou `supabase/seeds/content.js`, puis adapter `scripts/seed.mjs`.

#### 3. Composant admin trop responsable

- Problème identifié : `src/components/admin/EditorStudio.tsx` contient l’état, les actions de structure, la logique de duplication, la création de blocs par défaut, les réglages contextuels et le rendu de l’éditeur.
- Fichiers concernés : `src/components/admin/EditorStudio.tsx`.
- Impact : difficile à tester, difficile à maintenir, et risqué pour l’ajout de nouveaux blocs. Le composant deviendra vite une zone de dette majeure.
- Recommandation : découper en `EditorStructurePanel`, `EditorPreviewPanel`, `EditorSettingsPanel`, `useEditorBlocks`, `blockFactory`.

#### 4. Upload et sélection média partiellement simulés côté UI

- Problème identifié : certains boutons existent mais ne sont pas encore reliés à des flux réels.
- Fichiers concernés : `src/components/media/MediaField.tsx`, `src/components/media/ImportWizard.tsx`, `src/components/media/MediaLibrary.tsx`.
- Impact : l’admin semble offrir Google Drive, médiathèque, remplacement et suppression, mais certaines actions sont encore visuelles. Cela peut créer une fausse confiance produit.
- Recommandation : en Phase 0, annoter clairement dans la documentation “UI shell seulement”. En Phase 1, implémenter ou masquer les actions non fonctionnelles.

### Important

#### 5. CSS monolithique

- Problème identifié : le style Next.js actif est concentré dans `src/styles/globals.css`, qui fait environ 737 lignes.
- Fichiers concernés : `src/styles/globals.css`, `src/config/designTokens.ts`.
- Impact : les styles publics, admin, modales, médias, cards et éditeur sont mélangés. Les nouveaux développeurs risquent d’ajouter des styles au hasard.
- Recommandation : découper en couches : `tokens.css`, `base.css`, `layout.css`, `public.css`, `admin.css`, `forms.css`, `media.css`, ou migrer vers une stratégie Tailwind/shadcn décidée explicitement.

#### 6. Ancien CSS encore présent

- Problème identifié : `styles.css` à la racine fait environ 1054 lignes et concerne le prototype vanilla.
- Fichiers concernés : `styles.css`, `src/styles/globals.css`.
- Impact : confusion entre styles actifs et styles hérités. Possibilité de modifier le mauvais fichier.
- Recommandation : déplacer avec le prototype dans un dossier legacy après validation.

#### 7. Repositories encore très larges

- Problème identifié : `src/repositories/contentRepository.ts` regroupe pages, thèmes, productions, activités et projets malgré l’existence de repositories dédiés.
- Fichiers concernés : `src/repositories/contentRepository.ts`, `src/repositories/themesRepository.ts`, `src/repositories/productionsRepository.ts`, `src/repositories/projectsRepository.ts`, `src/repositories/activitiesRepository.ts`.
- Impact : responsabilité floue. Les nouveaux développeurs ne sauront pas s’il faut ajouter une requête dans `contentRepository` ou dans le repository d’entité.
- Recommandation : conserver temporairement `contentRepository` comme façade publique, mais déplacer les requêtes par entité dans les repositories dédiés.

#### 8. Types Supabase trop génériques

- Problème identifié : `src/types/database.ts` utilise encore des `Record<string, Json>` pour toutes les tables.
- Fichiers concernés : `src/types/database.ts`, `src/repositories/*`.
- Impact : les repositories doivent mapper manuellement et TypeScript ne protège pas vraiment les colonnes DB.
- Recommandation : générer les types Supabase réels avec Supabase CLI ou maintenir un type DB précis minimal pour les tables critiques.

#### 9. API générique trop permissive conceptuellement

- Problème identifié : `src/app/api/content/[collection]/route.ts` et `src/app/api/content/[collection]/[id]/route.ts` acceptent une collection dynamique, même si elle est filtrée.
- Fichiers concernés : `src/app/api/content/[collection]/route.ts`, `src/app/api/content/[collection]/[id]/route.ts`, `src/constants/collections.ts`.
- Impact : utile pour prototype admin, mais moins clair pour un CMS durable avec validations par entité.
- Recommandation : garder pendant Phase 0, puis créer des endpoints ou handlers typés par entité avant l’ouverture à plusieurs développeurs.

#### 10. Formulaires typés par labels visibles

- Problème identifié : `FormModal` génère les champs depuis des labels français utilisés comme noms de champs.
- Fichiers concernés : `src/components/forms/FormModal.tsx`.
- Impact : les données soumises sont moins stables si un label change. Difficile à exploiter en back-office et en export.
- Recommandation : créer une config de formulaire avec `name`, `label`, `type`, `required`, `validation`.

### Moyen

#### 11. Dossiers cibles vides

- Problème identifié : plusieurs dossiers existent sans contenu.
- Fichiers concernés : `src/entities/*`, `src/components/ui`, `src/components/layout`, `src/components/cards`, `src/components/navigation`.
- Impact : ils montrent une intention utile, mais peuvent perdre les nouveaux développeurs.
- Recommandation : ajouter un court `README.md` dans les dossiers structurants ou ne créer les dossiers que lorsqu’ils deviennent actifs.

#### 12. Documentation dispersée

- Problème identifié : `README.md`, `ENGINEERING_GUIDE.md`, `docs/AUDIT.md`, `docs/ARCHITECTURE.md`, `src/docs/component-conventions.md` se recouvrent partiellement.
- Fichiers concernés : `README.md`, `ENGINEERING_GUIDE.md`, `docs/*`, `src/docs/component-conventions.md`.
- Impact : risque de divergence entre plusieurs sources de vérité.
- Recommandation : définir `README.md` comme onboarding rapide, `ENGINEERING_GUIDE.md` comme règles d’équipe, `docs/*` comme détails techniques. Déplacer `src/docs/component-conventions.md` vers `docs/COMPONENTS.md`.

#### 13. Navigation publique et routes encore partiellement hardcodées

- Problème identifié : certaines pages publiques injectent encore des images fixes.
- Fichiers concernés : `src/app/(public)/page.tsx`, autres pages dans `src/app/(public)`.
- Impact : cela contredit partiellement l’ambition CMS où les médias viennent de la base.
- Recommandation : accepter temporairement pour stabilisation, puis remplacer par une résolution média via repository quand la couche média est stable.

#### 14. `MediaField` ne synchronise pas les champs metadata

- Problème identifié : alt text et légende sont des inputs non reliés à `onChange` ou à une sauvegarde.
- Fichiers concernés : `src/components/media/MediaField.tsx`.
- Impact : l’interface laisse croire que les métadonnées sont modifiables, mais elles ne sont pas persistées depuis ce composant.
- Recommandation : soit désactiver/clarifier ces champs, soit les brancher proprement à une mutation.

#### 15. Tests encore symboliques

- Problème identifié : `tests/architecture.test.mjs` vérifie seulement quelques règles de fondation.
- Fichiers concernés : `tests/architecture.test.mjs`.
- Impact : pas de tests de services, repositories, formulaires, API ou composants.
- Recommandation : garder ce test comme garde-fou, puis ajouter des tests unitaires services/repositories avant les gros ajouts.

### Faible

#### 16. Artefacts locaux présents dans le dossier de travail

- Problème identifié : plusieurs fichiers générés ou parasites sont présents localement.
- Fichiers concernés : `.DS_Store`, `assets/.DS_Store`, `src/.DS_Store`, `.npm-cache`, `.next`, `.next-stale-1778801994`, `tsconfig.tsbuildinfo`.
- Impact : ils sont ignorés par `.gitignore`, mais polluent la lecture locale.
- Recommandation : nettoyer localement hors commit : supprimer `.DS_Store`, `.npm-cache`, `.next-stale-*`, `tsconfig.tsbuildinfo` quand aucun serveur n’en dépend.

#### 17. Scripts de seed en JavaScript

- Problème identifié : `scripts/seed.mjs` est en JavaScript et importe le legacy content.
- Fichiers concernés : `scripts/seed.mjs`, `content.js`.
- Impact : acceptable temporairement, mais moins robuste qu’un seed typé.
- Recommandation : ne pas convertir maintenant. Le faire uniquement après déplacement/clarification du seed legacy.

#### 18. Pas de ESLint complet

- Problème identifié : `npm run lint` pointe vers `npm run typecheck`, car `next lint` est obsolète/interactif en Next 15.
- Fichiers concernés : `package.json`.
- Impact : le projet n’a pas encore de règles lint React/Next dédiées.
- Recommandation : installer et configurer ESLint CLI plus tard, après stabilisation des dossiers. Ne pas réintroduire `next lint`.

## 5. Ancienne architecture vs nouvelle architecture

### Ancienne architecture statique

Elle correspond aux fichiers suivants :

- `index.html`
- `app.js`
- `content.js`
- `styles.css`

Caractéristiques observées :

- Rendu client vanilla.
- Données centralisées dans `content.js`.
- Logique de navigation hash.
- Admin local dans `app.js`.
- Usage de `localStorage` dans `app.js`.
- CSS complet dans `styles.css`.

Statut recommandé : référence historique et source de seed temporaire. Ce n’est plus l’architecture produit cible.

### Nouvelle architecture CMS Next.js

Elle correspond principalement aux fichiers suivants :

- `src/app/(public)/*`
- `src/app/admin/*`
- `src/app/api/*`
- `src/components/*`
- `src/repositories/*`
- `src/services/*`
- `src/lib/*`
- `src/types/*`
- `supabase/*`

Caractéristiques observées :

- Next.js App Router.
- Routes publiques et admin séparées.
- API route handlers.
- Repositories pour accès données.
- Services pour logique métier émergente.
- Supabase prévu pour DB et stockage.
- Modèle CMS typé dans `src/types/cms.ts`.
- Documentation d’ingénierie déjà commencée.

Statut recommandé : architecture active et cible.

### Zone de transition

- `content.js` sert encore au seed.
- Les assets dans `assets/*` servent au prototype et au CMS.
- Les pages Next.js utilisent encore parfois des chemins directs comme `/assets/photos/hero-accueil.png`.
- Certains composants admin sont des shells visuels non entièrement connectés.

## 6. Risques pour les nouveaux développeurs

- Confondre `app.js` avec le code actif du CMS.
- Modifier `styles.css` au lieu de `src/styles/globals.css`.
- Modifier `content.js` en croyant modifier le contenu live.
- Ajouter des requêtes dans `contentRepository.ts` au lieu d’un repository d’entité.
- Ajouter de nouveaux styles dans `globals.css` sans convention claire.
- Croire que `src/entities/*` est déjà utilisé alors que les dossiers sont vides.
- Croire que les boutons Google Drive / médiathèque / remplacement média sont entièrement fonctionnels.
- Croire que `npm run lint` fait un lint ESLint complet alors qu’il exécute actuellement TypeScript.
- Ne pas comprendre la différence entre `docs/AUDIT.md` et `docs/PHASE_0_AUDIT.md`.
- Oublier que `.env.local` contient des secrets et ne doit jamais être copié dans GitHub.
- Travailler dans un dossier sans `.git` local selon la façon dont GitHub Desktop a été utilisé.
- Lancer des refactors DB/Supabase avant que la frontière prototype/CMS soit clarifiée.

## 7. Recommandations Phase 0

1. Marquer officiellement `src/` comme application active dans `README.md`.
2. Marquer officiellement `index.html`, `app.js`, `content.js`, `styles.css` comme prototype legacy.
3. Déplacer le prototype vers `legacy/vanilla-prototype` ou `docs/reference/prototype`.
4. Déplacer `content.js` vers une zone de seed explicite, puis adapter `scripts/seed.mjs`.
5. Ajouter un `docs/COMPONENTS.md` et déplacer le contenu de `src/docs/component-conventions.md`.
6. Ajouter des `README.md` courts dans `src/entities`, `src/repositories`, `src/services`, `src/components`.
7. Découper `EditorStudio.tsx` en composants et hook interne sans changer le comportement.
8. Clarifier les actions média non fonctionnelles : masquer, désactiver ou documenter comme “prévu”.
9. Découper `src/styles/globals.css` en couches ou décider officiellement d’une migration Tailwind/shadcn.
10. Transformer `FormModal` en configuration de champs stable avec `name` technique et `label` affiché.
11. Générer ou écrire des types Supabase plus précis pour les tables principales.
12. Ajouter des tests unitaires pour `src/lib/cta.ts`, `src/services/*`, `src/repositories/*` avec mocks.
13. Installer ESLint CLI avec règles Next/React quand la structure de dossiers est figée.
14. Nettoyer les fichiers parasites locaux : `.DS_Store`, `.npm-cache`, `.next-stale-*`, `tsconfig.tsbuildinfo`.
15. Stabiliser le workflow GitHub Desktop ou initialiser un vrai `.git` dans le dossier de travail principal.

## 8. Ce qu’il ne faut pas faire maintenant

- Ne pas commencer la Phase 1 produit.
- Ne pas ajouter de nouvelles fonctionnalités CMS avant clarification prototype/CMS.
- Ne pas supprimer `content.js` tant que `scripts/seed.mjs` en dépend.
- Ne pas supprimer `assets/*` sans vérifier les références publiques, admin et seed.
- Ne pas toucher aux migrations Supabase sauf nécessité de documentation ou correction bloquante.
- Ne pas refondre le design public maintenant.
- Ne pas installer une grosse pile UI sans décision d’équipe.
- Ne pas brancher Google Drive avant d’avoir clarifié le composant média et ses contrats.
- Ne pas multiplier les endpoints API avant d’avoir défini la convention par entité.
- Ne pas convertir `scripts/seed.mjs` en TypeScript tant que la source seed legacy n’est pas déplacée.
- Ne pas traiter `npm run lint` comme un ESLint complet.
- Ne pas déplacer les dossiers vides sans décider si l’architecture par entité sera réellement utilisée.
- Ne pas publier ou exposer `.env.local`.
- Ne pas régénérer ou modifier les clés Supabase depuis cette phase d’audit, sauf décision de sécurité séparée.
