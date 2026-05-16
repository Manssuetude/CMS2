# Quality Gates — Manssuétude CMS

## 1. Objectif

Les quality gates évitent que le projet se dégrade quand plusieurs développeurs travaillent en parallèle. Ils doivent rester simples, utiles et rapides.

Objectifs :

- garder TypeScript strict ;
- détecter les erreurs simples avant review ;
- empêcher les imports ou variables oubliées de s’accumuler ;
- vérifier que le build Next.js reste valide ;
- standardiser le formatage ;
- faire passer les mêmes contrôles en local et en CI.

## 2. Commandes obligatoires

Avant une pull request :

```bash
npm run typecheck
npm run lint
npm run build
```

Selon le changement :

```bash
npm run test
npm run format:check
```

La CI exécute aussi ces commandes pour protéger `main` et `develop`.

## 3. TypeScript

Configuration :

- fichier : `tsconfig.json` ;
- mode strict activé : `strict: true` ;
- alias interne : `@/*` vers `src/*` ;
- `allowJs: false` pour garder le code applicatif en TypeScript ;
- `noEmit: true`, car Next.js gère la compilation.

Commande :

```bash
npm run typecheck
```

Règle : ne pas contourner TypeScript avec `any` ou des casts larges sans justification.

## 4. ESLint

Configuration :

- fichier : `eslint.config.mjs` ;
- format : ESLint flat config ;
- dépendances : `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-config-next`, `globals`.

Commande :

```bash
npm run lint
```

Pourquoi pas `next lint` :

- les versions récentes de Next.js ne poussent plus `next lint` comme point d’entrée durable ;
- le projet utilise donc ESLint directement, avec une configuration explicite et légère.

Règles principales :

- `@typescript-eslint/no-explicit-any` en erreur ;
- variables inutilisées en erreur, avec `_` autorisé pour les paramètres volontairement ignorés ;
- `console` limité dans l’application, autorisé dans scripts et tests ;
- règles Next core web vitals chargées via `eslint-config-next` ;
- `--max-warnings=0` pour éviter les avertissements ignorés.

## 5. Prettier

Configuration :

- fichier : `.prettierrc.json` ;
- largeur : `120` ;
- points-virgules activés ;
- guillemets doubles ;
- trailing commas activées.

Commande :

```bash
npm run format:check
```

La commande utilise `.gitignore` pour éviter les dossiers générés.

## 6. Build

Commande :

```bash
npm run build
```

Le build vérifie :

- compilation Next.js ;
- validité des routes ;
- compatibilité des pages server/client ;
- erreurs de typage détectées par Next.

Un build vert est obligatoire avant merge.

## 7. CI GitHub Actions

Workflow :

- fichier : `.github/workflows/ci.yml` ;
- déclenchement : pull requests et push sur `main` / `develop` ;
- Node.js : 22 ;
- installation : `npm ci`.

Étapes :

1. checkout ;
2. setup node ;
3. npm ci ;
4. `npm run typecheck` ;
5. `npm run lint` ;
6. `npm run format:check` ;
7. `npm test` ;
8. `npm run build`.

## 8. Checklist avant pull request

Avant d’ouvrir une PR :

- vérifier que la tâche ne lance pas une fonctionnalité hors phase ;
- relire les fichiers touchés ;
- exécuter `npm run typecheck` ;
- exécuter `npm run lint` ;
- exécuter `npm run build` ;
- ajouter `npm run test` si l’architecture ou les conventions changent ;
- mettre à jour la documentation si une règle change ;
- ajouter des captures si l’UI change ;
- mentionner les limites restantes.

## 9. Problèmes connus

- Le cache npm global du poste peut être bloqué par des fichiers root-owned. Contournement local : utiliser `npm install --cache ./.npm-cache`.
- `npm install` signale actuellement deux vulnérabilités modérées dans l’arbre de dépendances. Ne pas lancer `npm audit fix --force` sans audit, car cela peut introduire des mises à jour cassantes.
- L’ancien prototype vanilla reste dans le dépôt. Les quality gates ciblent principalement `src`, `scripts`, `tests` et `next.config.ts`.
- La règle Next `@next/next/no-img-element` est désactivée temporairement. Le projet utilise encore des images simples pendant la consolidation ; la migration progressive vers `next/image` doit se faire dans une tâche dédiée.
- Le lint est volontairement pragmatique. Des règles plus strictes pourront être ajoutées après stabilisation de la Phase 0.
