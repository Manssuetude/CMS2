# Phase 0 — Nettoyage initial

## 1. Objectif du nettoyage

Ce nettoyage vise à rendre le dépôt plus lisible et plus professionnel sans modifier le produit, les routes, l’UI, les schémas Supabase ou l’ancien prototype vanilla. L’objectif est de retirer uniquement les fichiers parasites, générés, temporaires ou propres à la machine locale, puis de renforcer `.gitignore` pour éviter leur retour.

Le nettoyage reste volontairement prudent : les fichiers `index.html`, `app.js`, `content.js` et `styles.css` sont conservés car ils appartiennent à l’ancien prototype et servent encore de référence/matière de migration.

## 2. Fichiers supprimés

### `.DS_Store`

- Chemin : `.DS_Store`
- Raison : fichier système macOS généré par Finder.
- Risque associé : aucun risque applicatif ; fichier non nécessaire au projet.
- Validation : absence confirmée avec `find`.

### `assets/.DS_Store`

- Chemin : `assets/.DS_Store`
- Raison : fichier système macOS généré dans le dossier assets.
- Risque associé : aucun risque applicatif ; fichier non nécessaire aux images ou documents.
- Validation : absence confirmée avec `find`.

### `src/.DS_Store`

- Chemin : `src/.DS_Store`
- Raison : fichier système macOS généré dans le dossier source.
- Risque associé : aucun risque applicatif ; fichier non nécessaire au code.
- Validation : absence confirmée avec `find`.

### `node_modules/.DS_Store`

- Chemin : `node_modules/.DS_Store`
- Raison : fichier système macOS généré dans les dépendances installées.
- Risque associé : aucun risque applicatif ; `node_modules` est régénérable via `npm install`.
- Validation : absence confirmée avec `find`.

### `tsconfig.tsbuildinfo`

- Chemin : `tsconfig.tsbuildinfo`
- Raison : fichier généré par TypeScript incremental build.
- Risque associé : aucun risque applicatif ; il peut être régénéré par `npm run typecheck`.
- Validation : supprimé puis ignoré par la règle `*.tsbuildinfo`.

### `.next-stale-1778801994`

- Chemin : `.next-stale-1778801994`
- Raison : ancien cache/build Next.js obsolète.
- Risque associé : faible ; ce dossier n’est pas utilisé comme source et peut être régénéré si nécessaire.
- Validation : absence confirmée avec `find`.

### `.npm-cache`

- Chemin : `.npm-cache`
- Raison : cache npm local créé pendant les installations.
- Risque associé : aucun risque applicatif ; cache régénérable.
- Validation : absence confirmée avec `find`.

## 3. Fichiers conservés volontairement

### Prototype vanilla legacy

Fichiers conservés :

- `index.html`
- `app.js`
- `content.js`
- `styles.css`

Raison : ces fichiers constituent l’ancien prototype statique. Ils ne doivent pas être supprimés brutalement tant que la migration et la séparation officielle entre legacy/prototype et CMS Next.js ne sont pas finalisées. `content.js` reste particulièrement sensible car il sert encore de base de seed.

### Build Next.js actif

Fichier/dossier conservé :

- `.next`

Raison : dossier généré et ignoré par Git. Il est conservé localement parce que l’environnement de développement peut s’appuyer dessus pour le serveur actuellement lancé. Il ne doit pas être versionné.

### Dépendances installées

Fichier/dossier conservé :

- `node_modules`

Raison : dossier généré et ignoré par Git. Il est conservé localement pour permettre les vérifications sans réinstaller les dépendances.

### Assets de référence

Fichiers conservés :

- `assets/reference/*`
- `assets/photos/*`
- `assets/files/*`

Raison : même si certains assets peuvent devenir inutiles plus tard, aucune suppression d’asset n’a été faite sans audit d’usage détaillé afin d’éviter de casser le prototype, le seed ou les pages Next.js.

## 4. Mise à jour du .gitignore

Règles confirmées :

- `.env`
- `.env.local`
- `.env.*.local`
- `node_modules/`
- `.next/`
- `.next-stale-*/`
- `.npm-cache/`
- `dist/`
- `build/`
- `*.log`
- `.DS_Store`

Règles ajoutées ou renforcées :

- `.turbo/`
- `.vercel/`
- `out/`
- `coverage/`
- `playwright-report/`
- `test-results/`
- `*.tsbuildinfo`
- `**/.DS_Store`
- `Thumbs.db`
- `*.tmp`
- `*.temp`
- `*.swp`
- `*~`

## 5. Vérifications effectuées

Commandes exécutées :

- `find . -name '.DS_Store' -o -name 'tsconfig.tsbuildinfo' -o -name '*.tmp' -o -name '*.log' -o -name '*~' -o -name '.npm-cache' -o -name '.next-stale-*'`
- `find . -maxdepth 2 -type d \( -name '.next' -o -name '.npm-cache' -o -name '.next-stale-*' -o -name 'node_modules' \)`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

`npm install` n’a pas été exécuté car `node_modules` était déjà présent et les dépendances n’ont pas été modifiées.

Note : `npm run typecheck` peut régénérer `tsconfig.tsbuildinfo` parce que `incremental` est activé dans `tsconfig.json`. Ce fichier est désormais couvert par `*.tsbuildinfo` dans `.gitignore`.

## 6. Résultat

Le projet reste fonctionnel après nettoyage. Les fichiers systèmes macOS, caches locaux et anciens artefacts générés ont été retirés sans toucher aux fichiers legacy structurants ni aux sources Next.js.

Le dépôt est plus lisible pour l’arrivée de nouveaux développeurs : les parasites visibles ont été retirés, `.gitignore` est plus robuste, et le statut des fichiers conservés volontairement est documenté.
