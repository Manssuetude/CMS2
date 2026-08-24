# Architecture — Manssuétude CMS

> Source de vérité technique du projet. Responsabilités, flux, règles d'import et anti-patterns.

---

## 1. Philosophie générale

Manssuétude CMS est un CMS éditorial sur-mesure pour une petite équipe interne de 5 à 8 personnes. Il doit rester simple à comprendre, difficile à casser et suffisamment structuré pour accueillir deux nouveaux développeurs sans dépendre d'explications orales permanentes.

Le projet ne cherche pas à devenir WordPress, Notion ou un ERP. La bonne architecture est volontairement sobre :

- Routes et pages dans Next.js
- Composants UI isolés
- Repositories pour l'accès aux données
- Services pour les décisions métier
- `lib` pour les intégrations techniques
- Types, constantes, config, hooks, styles et utils séparés

> **Principe important :** une complexité interne peut exister, mais elle doit rester lisible, documentée et prévisible.

---

## 2. Architecture cible

```
src/
  app/
  components/
    admin/
    blocks/
    cards/
    forms/
    layout/
    media/
    navigation/
    public/
    ui/
  repositories/
  services/
  lib/
  types/
  config/
  constants/
  hooks/
  docs/
  styles/
  utils/
```

**État observé après clarification :**

- Les dossiers cibles existent
- `src/hooks` existe avec une note de responsabilité
- Les composants de layout publics ont été déplacés dans `src/components/layout`
- Le composant de grille de cartes a été déplacé dans `src/components/cards`
- Les dossiers `src/entities/*` vides ont été retirés — les entités sont portées par `src/types`, `src/repositories` et `src/services`

---

## 3. Responsabilité des dossiers

### `src/app`

Contient uniquement les routes Next.js : pages publiques, pages admin, layouts, route handlers API, middleware Next.js si nécessaire.

> Les pages peuvent orchestrer l'affichage, mais ne doivent pas contenir de logique métier lourde.

---

### `src/components`

Contient les composants UI.

**Règles :**

- Pas d'accès direct Supabase
- Pas de logique métier lourde
- Pas de mapping DB
- Pas de décisions de publication, permissions, recommandations ou relations
- Interaction visuelle autorisée
- État React local autorisé quand il concerne l'interface

**Sous-dossiers :**

| Dossier      | Contenu                                                                                                  |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| `admin`      | Composants d'administration (sidebar, topbar, formulaires CRUD par entité, OnboardingTour, GlobalSearch) |
| `blocks`     | Blocs CMS verrouillés (BlockRenderer, blockRegistry)                                                     |
| `cards`      | Composants de cartes et grilles                                                                          |
| `editor`     | Éditeur riche CKEditor 5 (RichTextEditor)                                                                |
| `forms`      | CTA et modales de formulaires                                                                            |
| `layout`     | Header, footer, shell public/admin                                                                       |
| `media`      | Médiathèque (MediaLibrary, MediaCard, ImportWizard)                                                      |
| `navigation` | Futur emplacement pour navigation réutilisable                                                           |
| `public`     | Composants de rendu public des entités                                                                   |
| `ui`         | Futur emplacement pour primitives UI génériques                                                          |

---

### `src/repositories`

Contient l'accès aux données uniquement : CRUD, requêtes Supabase, mapping DB vers types CMS, suppression, création, mise à jour, listing.

**Interdictions :** pas de composants, pas de CSS, pas de logique de présentation, pas de décisions UX.

---

### `src/services`

Contient la logique métier destinée à être appelée depuis des composants clients (actions fetch/submit orchestrées) — aujourd'hui `formClientService.ts`, `mediaClientService.ts`. Pour la logique métier serveur (relations, recommandations, SEO), le pattern actuel du projet est de la garder directement dans le repository de l'entité concernée, ou dans un helper dédié sous `src/utils/` (ex. `relatedProductions.ts`, `dossierItems.ts`, `eventOfTheMoment.ts`) quand elle est pure et testable indépendamment de Supabase. Un vrai service serveur dédié (`src/services/xxxService.ts`) se justifie seulement si cette logique devient trop complexe pour rester dans le repository — pas de service créé par anticipation.

> Un service peut appeler un repository. Un repository ne doit **jamais** appeler un service.

---

### `src/lib`

Contient les clients techniques et helpers d'infrastructure :

| Fichier           | Rôle                         |
| ----------------- | ---------------------------- |
| `auth.ts`         | Authentification             |
| `env.ts`          | Variables d'environnement    |
| `db.ts`           | Client Supabase              |
| `permissions.ts`  | Permissions                  |
| `validation.ts`   | Schémas Zod                  |
| `logger.ts`       | Logs structurés              |
| `errors.ts`       | Erreurs API standardisées    |
| `media.ts`        | Stockage média technique     |
| `google-drive.ts` | Intégration Google Drive     |
| `cta.ts`          | Résolution technique des CTA |

> `src/lib` ne doit pas devenir un fourre-tout métier.

---

### `src/types`

Contient les types globaux : types CMS, types DB, types entités, statuts, visibilité, médias, formulaires.

Les types partagés entre plusieurs couches doivent vivre ici.

---

### `src/config`

Contient la configuration stable non secrète : design tokens, paramètres globaux non sensibles, config applicative stable.

> Les secrets restent dans `.env.local` et ne doivent jamais être committés.

---

### `src/constants`

Contient les constantes métier ou applicatives : collections autorisées, navigation admin, menus, statuts stables, valeurs partagées.

> Une constante ne doit pas contenir de logique d'accès données.

---

### `src/hooks`

Contient les hooks React réutilisables.

- Hooks UI-oriented
- Pas d'accès direct Supabase
- Pas de logique métier critique difficile à tester
- Si un hook a besoin d'une décision métier, déléguer à `src/services`

---

### `src/docs`

Contient de la documentation proche du code source. À utiliser pour des conventions très liées à `src`. La documentation projet générale vit dans `docs/`, `README.md` et `ENGINEERING_GUIDE.md`.

---

### `src/styles`

État actuel : `src/styles/globals.css` reste le fichier principal.

Évolution recommandée : découper progressivement en couches (`base`, `layout`, `public`, `admin`, `forms`, `media`) ou décider explicitement d'une migration Tailwind/shadcn.

---

### `src/utils`

Contient les helpers génériques sans signification produit : slug, formatage simple, conversion de row, helpers purs.

> Un util ne doit pas connaître Manssuétude, Supabase ou le modèle CMS.

---

## 4. Règles d'import

- Utiliser `@/` pour les imports depuis `src`
- Éviter les imports relatifs profonds comme `../../../`
- Interdire les dépendances circulaires
- Interdire à `src/repositories` d'importer `src/components`
- Interdire à `src/components` d'appeler directement Supabase ou `getSupabaseAdmin`

**Les composants peuvent importer :** types, constantes, config, composants UI, hooks UI

**Les services peuvent importer :** repositories, types, utils, constantes

**Les repositories peuvent importer :** `src/lib/db`, types, helpers de mapping, validations liées aux payloads

---

## 5. Flux de données recommandé

**Flux côté interface :**

```
UI component
  → hook UI si nécessaire
  → service métier si décision fonctionnelle
  → repository
  → database / storage
```

**Flux côté route handler :**

```
route handler
  → validation
  → requireRole / permissions
  → service ou repository
  → réponse standardisée
```

**Règles :**

- Une page Next.js peut charger des données via repository ou service
- Une API doit valider ses entrées avant mutation
- Les erreurs API doivent passer par une réponse standardisée
- Les composants client ne doivent pas connaître les tables Supabase

---

## 6. Où créer un nouveau module CMS

### Themes / SubThemes

- Type partagé : `src/types/cms.ts`
- Accès données : `src/repositories/themeRepository.ts`, `src/repositories/subThemeRepository.ts`
- Logique métier : directement dans `themeRepository.ts`/`subThemeRepository.ts` ; service dédié seulement si une vraie règle plus complexe apparaît
- UI publique : `src/components/public` ou `src/components/cards`
- Route publique : `src/app/(public)/themes`
- Admin : `src/app/admin/themes`, `src/app/admin/sousthemes`

### Events (évènements datés)

- Type partagé : `src/types/cms.ts` (`Event`)
- Accès données : `src/repositories/eventRepository.ts`
- Logique métier : dans `eventRepository.ts` (ex. `isThisWeek`/`pickEventOfTheMoment` dans `src/utils/eventOfTheMoment.ts`) ; service dédié seulement si une vraie règle métier plus complexe apparaît
- Route publique : `src/app/(public)/evenements`
- Admin : `src/app/admin/evenements`

Distinct du catalogue de formats d'animation (« Activités » côté produit) : `src/repositories/activityFormatRepository.ts`, route publique `src/app/(public)/activites`, admin `src/app/admin/formatsactivites`.

### Productions

- Type partagé : `src/types/cms.ts`
- Accès données : `src/repositories/productionRepository.ts`
- Logique métier : recommandations (`src/utils/relatedProductions.ts`), relations et champs SEO directement dans `productionRepository.ts`
- Route publique : `src/app/(public)/productions`
- Admin : `src/app/admin/productions`

### Resources

- Type partagé : `src/types/cms.ts`
- Accès données : `src/repositories/mediaRepository.ts`
- Logique média : `src/services/mediaClientService.ts` et `src/lib/media.ts`
- Route publique : `src/app/(public)/ressources`
- Admin : `src/components/media`

### Projects

- Type partagé : `src/types/cms.ts`
- Accès données : `src/repositories/projectRepository.ts`
- Logique métier : avancement, relations et recommandations directement dans `projectRepository.ts`
- Route publique : `src/app/(public)/projets`
- Admin : `src/app/admin/projets`

---

## 7. Interface d'administration (Sprint 1)

L'espace admin est accessible sur `/admin/*` et protégé par middleware Supabase Auth.

**Composants clés :**

| Composant        | Rôle                                            |
| ---------------- | ----------------------------------------------- |
| `AdminSidebar`   | Navigation + bouton "Aide" pour rejouer le tour |
| `AdminTopbar`    | Barre supérieure (recherche globale, session)   |
| `OnboardingTour` | Tour guidé, auto-affiché au premier accès       |
| `RichTextEditor` | CKEditor 5 GPL pour les corps de texte HTML     |
| `MediaLibrary`   | Médiathèque avec recherche client-side          |
| `GlobalSearch`   | Recherche transversale via `/api/admin/search`  |

**Server Actions :** chaque entité (évènements, productions, projets, thèmes, dossiers, journal…) dispose de ses propres actions dans `src/app/admin/[entite]/actions.ts`.

---

## 8. Anti-patterns interdits

- Logique métier dans les composants
- Accès DB direct dans l'UI
- `any` non justifié
- Duplication de mapping DB dans plusieurs fichiers
- Routes API sans validation
- Routes API qui exposent des tables arbitraires
- Styles inline non nécessaires
- Composants fourre-tout
- Repositories qui importent des composants
- Services qui manipulent du JSX
- Hooks React qui cachent des règles métier critiques
- Fichiers de config secrets versionnés
- Nouveaux chemins relatifs profonds
- Ajout de nouvelles sous-architectures sans documentation

---

## 9. Statut de migration legacy

Les fichiers suivants appartiennent à l'ancien prototype vanilla :

| Fichier      | Statut                                            |
| ------------ | ------------------------------------------------- |
| `index.html` | Conservé temporairement — référence visuelle      |
| `app.js`     | Conservé temporairement — référence fonctionnelle |
| `content.js` | Conservé tant que le seed en dépend               |
| `styles.css` | Conservé temporairement — référence visuelle      |

**Règles :**

- Ne pas supprimer ces fichiers sans étape de migration dédiée
- Ne pas ajouter de nouvelle logique métier dans `app.js`
- Ne pas considérer `styles.css` comme le CSS actif du CMS Next.js
- Toute évolution active doit aller dans `src/`

**Migration recommandée plus tard :**

1. Déplacer le prototype vers `legacy/vanilla-prototype`
2. Déplacer `content.js` vers `scripts/seed-data/legacy-content.js`
3. Adapter `scripts/seed.mjs`
4. Documenter la fin de vie du prototype

---

← [ONBOARDING.md](ONBOARDING.md) · Suite → [CODE_CONVENTIONS.md](CODE_CONVENTIONS.md)
