# Phase 0 Audit

> Synthèse des problèmes identifiés lors de l'audit initial, classés par sévérité.

---

## Sévérité haute

### Routes de collection API trop permissives

**Impact :** validation faible et comportement d'erreur peu clair.

**Correction :** centraliser les collections autorisées dans `src/constants/collections.ts`, valider les paramètres de route et standardiser les erreurs API via `src/lib/errors.ts`.

---

### Fuite de types via `any`

**Impact :** le mapping repository pouvait accepter silencieusement des données malformées et affaiblir TypeScript strict.

**Correction :** introduire des helpers de mapping dans `src/utils/row.ts`, supprimer le seed TypeScript inutilisé, remplacer plusieurs mappers `any` par des fonctions de conversion typées.

---

### Prototype admin mixant décisions produit et UI

**Impact :** les futurs contributeurs ne sauraient pas distinguer logique métier et présentation.

**Correction :** créer une documentation des couches, centraliser la navigation admin, ajouter des services pour graph/media/health/taxonomie, documenter la direction des dépendances.

---

## Sévérité moyenne

### CSS monolithique

**Impact :** la cohérence visuelle dépendait de la discipline individuelle plutôt que de tokens.

**Correction :** ajouter des tokens dans `src/config/designTokens.ts` et documenter les règles du design system. Le CSS nécessite encore un découpage futur par couche.

---

### Documentation insuffisante pour l'onboarding

**Impact :** les nouveaux développeurs auraient eu besoin de contexte oral.

**Correction :** ajouter `ENGINEERING_GUIDE.md` et des docs pour l'architecture, le CMS, la base de données, les workflows et les composants.

---

### Chemin de seed dupliqué

**Impact :** `scripts/seed.ts` était inutilisé et portait encore de la logique legacy avec `any`.

**Correction :** supprimé. `npm run seed` utilise `scripts/seed.mjs`.

---

## Sévérité faible

### Style inline sur la page de login

**Impact :** petite incohérence dans la gouvernance des styles.

**Correction :** remplacer le style inline par `.login-panel`.

---

### Conventions Git et CI manquantes

**Impact :** la collaboration aurait pu devenir incohérente avec la croissance de l'équipe.

**Correction :** ajouter les conventions de branches/PR et un workflow CI exécutant typecheck et build.

---

## Dette restante

- Certains rows de repository s'appuient encore sur des records DB génériques larges, car les types Supabase générés ne sont pas encore complets
- ESLint n'est pas encore entièrement installé/configuré — les checks actuels sont TypeScript et build
- Le CSS devrait être découpé en tokens, base, layout, composants et utilitaires
- Les tests unitaires ne sont pas encore implémentés
- Les schémas de payload API devraient être étendus par collection, pas seulement au niveau de la route générique
