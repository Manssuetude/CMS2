# Legacy Migration Plan — Manssuétude CMS

## 1. Objectif

Le dépôt contient encore un prototype vanilla complet à la racine et une application Next.js active dans `src/`. L’objectif est de préparer la suppression progressive du legacy sans perdre le contenu, les idées UX ou les références visuelles utiles.

Cette phase ne supprime pas les fichiers legacy. Elle fixe une stratégie pour éviter deux systèmes parallèles :

- deux sources de vérité de contenu ;
- deux systèmes de rendu ;
- deux administrations ;
- deux styles globaux ;
- deux navigations.

La règle : tout nouveau développement doit se faire dans `src/`. Le legacy sert uniquement de référence et de source de seed tant que la migration n’est pas terminée.

## 2. Fichiers legacy concernés

### `index.html`

- rôle actuel : point d’entrée HTML de l’ancien prototype statique. Il charge `styles.css`, `content.js` et `app.js`, avec une structure `#app`, header, navigation et footer générés côté navigateur.
- contenu utile : balises SEO de base, favicon, structure minimale de référence, rappel du fonctionnement hash historique.
- équivalent Next.js existant : `src/app/layout.tsx`, `src/app/(public)/layout.tsx`, routes dans `src/app/(public)`, header/footer dans `src/components/layout`.
- statut : à conserver temporairement comme référence de prototype. Supprimable plus tard lorsque la documentation de référence et le seed ne dépendent plus de la racine legacy.

### `app.js`

- rôle actuel : moteur complet du prototype vanilla. Il contient le rendu public, la navigation hash, la recherche, les pages détail, les formulaires locaux, l’admin local, la médiathèque simulée, les sauvegardes et le stockage `localStorage`.
- contenu utile : idées UX du prototype, inventaire des modules admin attendus, logique de CTA `FORM:`, recherche globale, filtres, export CSV local, média field simulé, dashboard qualité local.
- équivalent Next.js existant : routes publiques dans `src/app/(public)`, admin dans `src/app/admin`, composants dans `src/components`, repositories dans `src/repositories`, services dans `src/services`, API routes dans `src/app/api`.
- statut : à conserver temporairement comme référence fonctionnelle. À ne plus modifier pour ajouter des fonctionnalités. À supprimer seulement après extraction/documentation des idées encore utiles.

### `content.js`

- rôle actuel : source structurée de contenu historique et seed initial. `scripts/seed.mjs` lit encore ce fichier directement avec `loadLegacyContent()`.
- contenu utile : meta site, navigation, `ctaLinks`, pages principales, homepage config, footer config, blocs réutilisables, collections `themes`, `productions`, `activities`, `projects`, `resources`, formulaires et relations initiales.
- équivalent Next.js existant : tables Supabase dans `supabase/schema.sql`, repositories dans `src/repositories`, types dans `src/types/cms.ts`, seed dans `scripts/seed.mjs`.
- statut : à conserver tant que `npm run seed` dépend de `content.js`. À migrer ensuite vers une source de seed explicite, par exemple `scripts/seed-data/legacy-content.js` ou `supabase/seeds/content.js`.

### `styles.css`

- rôle actuel : CSS complet du prototype vanilla. Il couvre site public, admin local, modales, formulaires, médiathèque, pages détail, responsive et états visuels.
- contenu utile : références de rythme visuel, classes prototype pour admin, media library, final CTA, dark sections, panels et responsive.
- équivalent Next.js existant : `src/styles/globals.css`, tokens dans `src/config/designTokens.ts`, documentation dans `docs/DESIGN_SYSTEM.md`.
- statut : à conserver temporairement comme référence visuelle. À ne plus modifier pour le CMS actif. Supprimable après récupération des patterns utiles dans le design system Next.js.

## 3. Risques des doubles systèmes

- Un développeur peut corriger `app.js` alors que le site actif utilise `src/`.
- `content.js` peut être modifié en pensant modifier le contenu live, alors qu’il sert surtout au seed.
- `styles.css` peut recevoir des corrections visuelles qui n’affectent pas l’application Next.js.
- Deux admins coexistent conceptuellement : admin local vanilla et admin Next.js.
- Les routes hash du prototype peuvent être confondues avec les vraies routes Next.js.
- La logique `localStorage` du prototype peut masquer le besoin réel de repositories, API et Supabase.
- Des idées utiles peuvent être supprimées trop tôt si le legacy est retiré sans inventaire.

## 4. Contenus à récupérer

Depuis `content.js` :

- `meta` : nom, tagline, logo, favicon, fallback image, phrase PERCA, couleurs ;
- `nav` : menu principal final, y compris entrée admin cachée ;
- `ctaLinks` : table de CTA et logique `FORM:` ;
- `footerConfig` : description, colonnes, réseaux sociaux, newsletter, liens légaux ;
- `homepageConfig` : sujet du moment, productions/projets mis en avant, stats, CTA final ;
- `pages` : neuf pages publiques principales ;
- `collections.themes` : 6 thèmes ;
- `collections.productions` : 6 productions ;
- `collections.activities` : 3 activités ;
- `collections.projects` : 7 projets ;
- `collections.resources` : 2 ressources ;
- `pageBlocks` : méthode, en ce moment, approche, mission, timeline, soutiens, forms.

Depuis `app.js` :

- comportements CTA `FORM:` ;
- recherche globale groupée ;
- filtres sur collections ;
- structure admin modulaire ;
- export CSV des formulaires ;
- logique de médiathèque simulée ;
- panneau qualité local ;
- import/export de contenu.

Ces éléments doivent être repris uniquement s’ils sont utiles au CMS Next.js, pas copiés tels quels.

## 5. Styles à récupérer

Depuis `styles.css`, récupérer progressivement :

- rythme des héros éditoriaux ;
- blocs noirs premium ;
- CTA final ;
- cards avec hover subtil ;
- panels admin sobres ;
- media library visuelle ;
- modales ;
- formulaires ;
- responsive du menu mobile ;
- pages détail plus éditoriales.

À intégrer uniquement via :

- `src/styles/globals.css` ;
- `src/config/designTokens.ts` ;
- futurs composants `src/components/ui/Button.tsx`, `Card.tsx`, `Section.tsx`, `Badge.tsx`.

Ne pas copier massivement `styles.css` dans le CSS actif.

## 6. Logiques à abandonner

À ne pas migrer :

- rendu HTML par chaînes de caractères ;
- navigation hash comme source principale ;
- stockage `localStorage` comme persistance CMS ;
- admin par mot de passe local dans le navigateur ;
- upload simulé créant seulement des chemins `assets/files/...` ;
- manipulation DOM directe ;
- réinitialisation locale du contenu via `structuredClone(SITE_CONTENT)` ;
- SEO mis à jour manuellement par manipulation DOM ;
- formulaires enregistrés uniquement dans le navigateur.

Ces logiques ont été utiles pour le prototype, mais elles ne doivent pas survivre dans le CMS Next.js.

## 7. Étapes de migration

### Étape 1 — Marquer le legacy comme référence

- objectif : empêcher toute confusion immédiate.
- fichiers concernés : `README.md`, `ENGINEERING_GUIDE.md`, `docs/ONBOARDING.md`, `docs/LEGACY_MIGRATION_PLAN.md`.
- critères de validation : documentation claire indiquant que `src/` est l’application active et que les fichiers racine sont legacy.

### Étape 2 — Sécuriser le seed

- objectif : déplacer la dépendance à `content.js` dans une zone de seed explicite.
- fichiers concernés : `content.js`, `scripts/seed.mjs`, future cible `scripts/seed-data/legacy-content.js` ou `supabase/seeds/content.js`.
- critères de validation : `npm run seed` fonctionne après déplacement ; `content.js` ne vit plus à la racine ; documentation mise à jour.

### Étape 3 — Inventorier les écarts de contenu

- objectif : vérifier que les pages, collections, CTA, footer et homepage issus de `content.js` existent bien en base ou dans les repositories.
- fichiers concernés : `content.js`, `scripts/seed.mjs`, `src/repositories/*`, `src/types/cms.ts`.
- critères de validation : chaque collection legacy a un équivalent DB ou une décision explicite de non-migration.

### Étape 4 — Migrer les idées UX utiles de `app.js`

- objectif : reprendre les concepts, pas le code.
- fichiers concernés : `app.js`, `src/components`, `src/services`, `src/app/admin`, `src/app/api`.
- critères de validation : les comportements retenus existent dans Next.js avec séparation UI / service / repository.

### Étape 5 — Récupérer les patterns visuels utiles

- objectif : intégrer les meilleurs patterns de `styles.css` dans le design system actif.
- fichiers concernés : `styles.css`, `src/styles/globals.css`, `src/config/designTokens.ts`, futurs composants UI.
- critères de validation : documentation design system à jour ; pas de duplication massive ; build OK.

### Étape 6 — Déplacer le prototype hors racine

- objectif : réduire la confusion sans supprimer l’historique.
- fichiers concernés : `index.html`, `app.js`, `styles.css`, éventuellement ancien `content.js` si seed déjà déplacé.
- critères de validation : prototype déplacé vers `legacy/vanilla-prototype/` ou `docs/reference/vanilla-prototype/`; aucune route Next.js cassée ; docs mises à jour.

### Étape 7 — Suppression définitive

- objectif : retirer le double système du dépôt actif.
- fichiers concernés : `index.html`, `app.js`, `content.js`, `styles.css` ou leur dossier legacy.
- critères de validation : seed indépendant ; contenu migré ; styles utiles récupérés ; admin Next.js couvre les usages nécessaires ; validation complète OK.

## 8. Conditions avant suppression définitive

### Avant suppression de `index.html`

- les routes Next.js publiques couvrent toutes les pages principales ;
- les métadonnées SEO sont gérées dans Next.js ;
- le prototype n’est plus utilisé comme point d’entrée de démonstration ;
- une capture ou référence visuelle est conservée si nécessaire.

### Avant suppression de `app.js`

- aucune fonctionnalité utile du prototype ne reste uniquement dans `app.js` ;
- CTA `FORM:` fonctionnels côté Next.js ;
- formulaires gérés via API et base ;
- admin Next.js couvre dashboard, médias, formulaires et contenus essentiels ;
- export/import ou sauvegarde documentés côté Next.js si retenus ;
- recherche/filtres repris ou explicitement reportés.

### Avant suppression de `content.js`

- `scripts/seed.mjs` ne lit plus `content.js` à la racine ;
- les données seed vivent dans un dossier explicite ;
- toutes les pages et collections importantes sont seedées ou migrées ;
- la documentation indique la nouvelle source de seed ;
- `npm run seed` fonctionne.

### Avant suppression de `styles.css`

- les patterns visuels utiles sont récupérés ou abandonnés explicitement ;
- `src/styles/globals.css` et `src/config/designTokens.ts` couvrent les besoins actifs ;
- les composants UI de base ont une stratégie claire ;
- aucune documentation ne renvoie encore à `styles.css` comme style actif.

## 9. Recommandation finale

Ne pas supprimer le legacy immédiatement. La prochaine action sûre est de déplacer d’abord la source seed vers un dossier explicite, puis d’adapter `scripts/seed.mjs`. Ensuite seulement, déplacer le prototype vanilla dans un dossier `legacy/` ou `docs/reference/`.

Priorité recommandée :

1. garder `content.js` tant que le seed en dépend ;
2. interdire toute nouvelle logique dans `app.js` et `styles.css` ;
3. migrer les éléments utiles sous forme de services, composants et tokens Next.js ;
4. déplacer le legacy hors racine ;
5. supprimer définitivement lorsque les conditions ci-dessus sont validées.
