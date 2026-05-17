# Legacy Migration Plan — Manssuétude CMS

> Stratégie de sortie progressive du prototype vanilla. Ce document ne déclenche pas de suppression — il fixe le plan.

---

## 1. Objectif

Le dépôt contient encore un prototype vanilla complet à la racine et une application Next.js active dans `src/`. L'objectif est de préparer la suppression progressive du legacy sans perdre le contenu, les idées UX ou les références visuelles utiles.

Cette phase ne supprime pas les fichiers legacy. Elle fixe une stratégie pour éviter deux systèmes parallèles :

- Deux sources de vérité de contenu
- Deux systèmes de rendu
- Deux administrations
- Deux styles globaux
- Deux navigations

> **La règle :** tout nouveau développement doit se faire dans `src/`. Le legacy sert uniquement de référence et de source de seed tant que la migration n'est pas terminée.

---

## 2. Fichiers legacy concernés

### `index.html`

| Aspect | Détail |
|---|---|
| Rôle actuel | Point d'entrée HTML de l'ancien prototype statique — charge `styles.css`, `content.js` et `app.js` |
| Contenu utile | Balises SEO de base, favicon, structure minimale, rappel du fonctionnement hash historique |
| Équivalent Next.js | `src/app/layout.tsx`, `src/app/(public)/layout.tsx`, routes publiques, header/footer dans `src/components/layout` |
| Statut | À conserver temporairement. Supprimable quand la doc et le seed ne dépendent plus de la racine legacy |

### `app.js`

| Aspect | Détail |
|---|---|
| Rôle actuel | Moteur complet du prototype vanilla : rendu public, navigation hash, recherche, formulaires locaux, admin local, médiathèque simulée, `localStorage` |
| Contenu utile | Idées UX du prototype, inventaire des modules admin attendus, logique CTA `FORM:`, recherche globale, filtres, export CSV local, dashboard qualité local |
| Équivalent Next.js | Routes publiques, admin, composants, repositories, services, API routes dans `src/` |
| Statut | À conserver temporairement comme référence fonctionnelle. À ne plus modifier. À supprimer après extraction des idées encore utiles |

### `content.js`

| Aspect | Détail |
|---|---|
| Rôle actuel | Source structurée de contenu historique et seed initial — `scripts/seed.mjs` lit encore ce fichier via `loadLegacyContent()` |
| Contenu utile | Meta site, navigation, `ctaLinks`, pages principales, homepage config, footer config, collections (themes, productions, activities, projects, resources), formulaires et relations initiales |
| Équivalent Next.js | Tables Supabase dans `supabase/schema.sql`, repositories dans `src/repositories`, types dans `src/types/cms.ts`, seed dans `scripts/seed.mjs` |
| Statut | À conserver tant que `npm run seed` en dépend. À migrer ensuite vers `scripts/seed-data/legacy-content.js` ou `supabase/seeds/content.js` |

### `styles.css`

| Aspect | Détail |
|---|---|
| Rôle actuel | CSS complet du prototype vanilla : public, admin local, modales, formulaires, médiathèque, responsive |
| Contenu utile | Références de rythme visuel, classes prototype pour admin, media library, dark sections, panels et responsive |
| Équivalent Next.js | `src/styles/globals.css`, tokens dans `src/config/designTokens.ts`, doc dans `docs/DESIGN_SYSTEM.md` |
| Statut | À conserver temporairement comme référence visuelle. À ne plus modifier pour le CMS actif |

---

## 3. Risques des doubles systèmes

- Un développeur peut corriger `app.js` alors que le site actif utilise `src/`
- `content.js` peut être modifié en pensant modifier le contenu live
- `styles.css` peut recevoir des corrections qui n'affectent pas l'application Next.js
- Deux admins coexistent conceptuellement : admin local vanilla et admin Next.js
- Les routes hash du prototype peuvent être confondues avec les vraies routes Next.js
- La logique `localStorage` peut masquer le besoin réel de repositories, API et Supabase
- Des idées utiles peuvent être supprimées trop tôt si le legacy est retiré sans inventaire

---

## 4. Contenus à récupérer

**Depuis `content.js` :**

- `meta` : nom, tagline, logo, favicon, fallback image, phrase PERCA, couleurs
- `nav` : menu principal final, y compris entrée admin cachée
- `ctaLinks` : table de CTA et logique `FORM:`
- `footerConfig` : description, colonnes, réseaux sociaux, newsletter, liens légaux
- `homepageConfig` : sujet du moment, productions/projets mis en avant, stats, CTA final
- `pages` : neuf pages publiques principales
- `collections.themes` : 6 thèmes
- `collections.productions` : 6 productions
- `collections.activities` : 3 activités
- `collections.projects` : 7 projets
- `collections.resources` : 2 ressources
- `pageBlocks` : méthode, en ce moment, approche, mission, timeline, soutiens, forms

**Depuis `app.js` :**

- Comportements CTA `FORM:`
- Recherche globale groupée
- Filtres sur collections
- Structure admin modulaire
- Export CSV des formulaires
- Logique de médiathèque simulée
- Panneau qualité local
- Import/export de contenu

> Ces éléments doivent être repris uniquement s'ils sont utiles au CMS Next.js, pas copiés tels quels.

---

## 5. Styles à récupérer

Depuis `styles.css`, récupérer progressivement :

- Rythme des héros éditoriaux
- Blocs noirs premium
- CTA final
- Cards avec hover subtil
- Panels admin sobres
- Media library visuelle
- Modales
- Formulaires
- Responsive du menu mobile
- Pages détail plus éditoriales

**À intégrer uniquement via :**

- `src/styles/globals.css`
- `src/config/designTokens.ts`
- Futurs composants `src/components/ui/Button.tsx`, `Card.tsx`, `Section.tsx`, `Badge.tsx`

> Ne pas copier massivement `styles.css` dans le CSS actif.

---

## 6. Logiques à abandonner

À ne **pas** migrer vers Next.js :

- Rendu HTML par chaînes de caractères
- Navigation hash comme source principale
- Stockage `localStorage` comme persistance CMS
- Admin par mot de passe local dans le navigateur
- Upload simulé créant seulement des chemins `assets/files/...`
- Manipulation DOM directe
- Réinitialisation locale du contenu via `structuredClone(SITE_CONTENT)`
- SEO mis à jour manuellement par manipulation DOM
- Formulaires enregistrés uniquement dans le navigateur

---

## 7. Étapes de migration

### Étape 1 — Marquer le legacy comme référence

- **Objectif :** empêcher toute confusion immédiate
- **Fichiers :** `README.md`, `ENGINEERING_GUIDE.md`, `docs/ONBOARDING.md`, `docs/LEGACY_MIGRATION_PLAN.md`
- **Validation :** documentation claire indiquant que `src/` est l'application active et que les fichiers racine sont legacy

### Étape 2 — Sécuriser le seed

- **Objectif :** déplacer la dépendance à `content.js` dans une zone de seed explicite
- **Fichiers :** `content.js`, `scripts/seed.mjs`, future cible `scripts/seed-data/legacy-content.js`
- **Validation :** `npm run seed` fonctionne après déplacement ; `content.js` ne vit plus à la racine ; documentation mise à jour

### Étape 3 — Inventorier les écarts de contenu

- **Objectif :** vérifier que pages, collections, CTA, footer et homepage de `content.js` existent bien en base ou dans les repositories
- **Fichiers :** `content.js`, `scripts/seed.mjs`, `src/repositories/*`, `src/types/cms.ts`
- **Validation :** chaque collection legacy a un équivalent DB ou une décision explicite de non-migration

### Étape 4 — Migrer les idées UX utiles de `app.js`

- **Objectif :** reprendre les concepts, pas le code
- **Fichiers :** `app.js`, `src/components`, `src/services`, `src/app/admin`, `src/app/api`
- **Validation :** les comportements retenus existent dans Next.js avec séparation UI / service / repository

### Étape 5 — Récupérer les patterns visuels utiles

- **Objectif :** intégrer les meilleurs patterns de `styles.css` dans le design system actif
- **Fichiers :** `styles.css`, `src/styles/globals.css`, `src/config/designTokens.ts`, futurs composants UI
- **Validation :** design system à jour, pas de duplication massive, build OK

### Étape 6 — Déplacer le prototype hors racine

- **Objectif :** réduire la confusion sans supprimer l'historique
- **Fichiers :** `index.html`, `app.js`, `styles.css`, éventuellement `content.js` si seed déjà déplacé
- **Validation :** prototype dans `legacy/vanilla-prototype/` ; aucune route Next.js cassée ; docs mises à jour

### Étape 7 — Suppression définitive

- **Objectif :** retirer le double système du dépôt actif
- **Fichiers :** `index.html`, `app.js`, `content.js`, `styles.css` ou leur dossier legacy
- **Validation :** seed indépendant, contenu migré, styles utiles récupérés, admin Next.js couvre les usages nécessaires, validation complète OK

---

## 8. Conditions avant suppression définitive

### Avant suppression de `index.html`

- Les routes Next.js publiques couvrent toutes les pages principales
- Les métadonnées SEO sont gérées dans Next.js
- Le prototype n'est plus utilisé comme point d'entrée de démonstration
- Une capture ou référence visuelle est conservée si nécessaire

### Avant suppression de `app.js`

- Aucune fonctionnalité utile du prototype ne reste uniquement dans `app.js`
- CTA `FORM:` fonctionnels côté Next.js
- Formulaires gérés via API et base
- Admin Next.js couvre dashboard, médias, formulaires et contenus essentiels
- Export/import ou sauvegarde documentés côté Next.js si retenus
- Recherche/filtres repris ou explicitement reportés

### Avant suppression de `content.js`

- `scripts/seed.mjs` ne lit plus `content.js` à la racine
- Les données seed vivent dans un dossier explicite
- Toutes les pages et collections importantes sont seedées ou migrées
- La documentation indique la nouvelle source de seed
- `npm run seed` fonctionne

### Avant suppression de `styles.css`

- Les patterns visuels utiles sont récupérés ou abandonnés explicitement
- `src/styles/globals.css` et `src/config/designTokens.ts` couvrent les besoins actifs
- Les composants UI de base ont une stratégie claire
- Aucune documentation ne renvoie encore à `styles.css` comme style actif

---

## 9. Recommandation finale

Ne pas supprimer le legacy immédiatement. La prochaine action sûre est de déplacer d'abord la source seed vers un dossier explicite, puis d'adapter `scripts/seed.mjs`. Ensuite seulement, déplacer le prototype vanilla dans un dossier `legacy/` ou `docs/reference/`.

**Priorité recommandée :**

1. Garder `content.js` tant que le seed en dépend
2. Interdire toute nouvelle logique dans `app.js` et `styles.css`
3. Migrer les éléments utiles sous forme de services, composants et tokens Next.js
4. Déplacer le legacy hors racine
5. Supprimer définitivement lorsque les conditions ci-dessus sont validées
