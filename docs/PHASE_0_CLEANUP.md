# Phase 0 — Nettoyage initial

> Fichiers supprimés, fichiers conservés volontairement et renforcement du `.gitignore`.

---

## 1. Objectif du nettoyage

Ce nettoyage vise à rendre le dépôt plus lisible et plus professionnel **sans modifier le produit, les routes, l'UI, les schémas Supabase ou l'ancien prototype vanilla**. L'objectif est de retirer uniquement les fichiers parasites, générés, temporaires ou propres à la machine locale, puis de renforcer `.gitignore` pour éviter leur retour.

> Le nettoyage reste volontairement prudent : `index.html`, `app.js`, `content.js` et `styles.css` sont conservés car ils appartiennent à l'ancien prototype et servent encore de référence/matière de migration.

---

## 2. Fichiers supprimés

| Fichier | Raison | Risque |
|---|---|---|
| `.DS_Store` | Fichier système macOS généré par Finder | Aucun risque applicatif |
| `assets/.DS_Store` | Fichier système macOS dans le dossier assets | Aucun risque applicatif |
| `src/.DS_Store` | Fichier système macOS dans le dossier source | Aucun risque applicatif |
| `node_modules/.DS_Store` | Fichier système macOS dans les dépendances | Aucun risque applicatif |
| `tsconfig.tsbuildinfo` | Fichier généré par TypeScript incremental build | Régénérable via `npm run typecheck` |
| `.next-stale-1778801994` | Ancien cache/build Next.js obsolète | Régénérable si nécessaire |
| `.npm-cache` | Cache npm local créé pendant les installations | Aucun risque applicatif |

---

## 3. Fichiers conservés volontairement

### Prototype vanilla legacy

**Fichiers conservés :** `index.html` · `app.js` · `content.js` · `styles.css`

Ces fichiers constituent l'ancien prototype statique. Ils ne doivent pas être supprimés brutalement tant que la migration et la séparation officielle entre legacy/prototype et CMS Next.js ne sont pas finalisées. `content.js` reste particulièrement sensible car il sert encore de base de seed.

### Build Next.js actif

**Dossier conservé :** `.next`

Dossier généré et ignoré par Git. Conservé localement car l'environnement de développement peut s'appuyer dessus pour le serveur en cours. Il ne doit pas être versionné.

### Dépendances installées

**Dossier conservé :** `node_modules`

Dossier généré et ignoré par Git. Conservé localement pour permettre les vérifications sans réinstaller les dépendances.

### Assets de référence

**Fichiers conservés :** `assets/reference/*` · `assets/photos/*` · `assets/files/*`

Aucune suppression d'asset n'a été faite sans audit d'usage détaillé afin d'éviter de casser le prototype, le seed ou les pages Next.js.

---

## 4. Mise à jour du .gitignore

**Règles confirmées existantes :**

`.env` · `.env.local` · `.env.*.local` · `node_modules/` · `.next/` · `.next-stale-*/` · `.npm-cache/` · `dist/` · `build/` · `*.log` · `.DS_Store`

**Règles ajoutées ou renforcées :**

| Règle | Raison |
|---|---|
| `.turbo/` | Cache Turbopack |
| `.vercel/` | Artefacts Vercel locaux |
| `out/` | Output de build statique |
| `coverage/` | Rapports de couverture |
| `playwright-report/` | Rapports Playwright |
| `test-results/` | Résultats de tests |
| `*.tsbuildinfo` | Incremental build TypeScript |
| `**/.DS_Store` | `.DS_Store` dans tous les sous-dossiers |
| `Thumbs.db` | Fichier système Windows |
| `*.tmp` · `*.temp` | Fichiers temporaires |
| `*.swp` · `*~` | Fichiers de swap éditeurs |

---

## 5. Vérifications effectuées

**Commandes exécutées :**

```bash
find . -name '.DS_Store' -o -name 'tsconfig.tsbuildinfo' -o -name '*.tmp' -o -name '*.log' -o -name '*~' -o -name '.npm-cache' -o -name '.next-stale-*'
find . -maxdepth 2 -type d \( -name '.next' -o -name '.npm-cache' -o -name '.next-stale-*' -o -name 'node_modules' \)
npm run typecheck
npm run lint
npm run build
```

> `npm install` n'a pas été exécuté car `node_modules` était déjà présent et les dépendances n'ont pas été modifiées.

> Note : `npm run typecheck` peut régénérer `tsconfig.tsbuildinfo` car `incremental` est activé dans `tsconfig.json`. Ce fichier est désormais couvert par `*.tsbuildinfo` dans `.gitignore`.

---

## 6. Résultat

Le projet reste fonctionnel après nettoyage. Les fichiers systèmes macOS, caches locaux et anciens artefacts générés ont été retirés sans toucher aux fichiers legacy structurants ni aux sources Next.js.

Le dépôt est plus lisible pour l'arrivée de nouveaux développeurs : les parasites visibles ont été retirés, `.gitignore` est plus robuste, et le statut des fichiers conservés volontairement est documenté.
