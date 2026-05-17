# Quality Gates — Manssuétude CMS

> Commandes, règles et CI pour garantir la qualité du code avant chaque merge.

---

## 1. Objectif

Les quality gates évitent que le projet se dégrade quand plusieurs développeurs travaillent en parallèle. Ils doivent rester simples, utiles et rapides.

**Objectifs :**

- Garder TypeScript strict
- Détecter les erreurs simples avant review
- Empêcher les imports ou variables oubliées de s'accumuler
- Vérifier que le build Next.js reste valide
- Standardiser le formatage
- Faire passer les mêmes contrôles en local et en CI

---

## 2. Commandes obligatoires

**Avant toute pull request :**

```bash
npm run typecheck
npm run lint
npm run build
```

**Selon le changement :**

```bash
npm run test          # si l'architecture ou les conventions changent
npm run format:check  # si la modification est large
```

> La CI exécute aussi ces commandes pour protéger `main` et `develop`.

---

## 3. TypeScript

**Configuration :**

| Paramètre     | Valeur                                       |
| ------------- | -------------------------------------------- |
| Fichier       | `tsconfig.json`                              |
| Mode strict   | `strict: true`                               |
| Alias interne | `@/*` vers `src/*`                           |
| JS interdit   | `allowJs: false`                             |
| Compilation   | `noEmit: true` (Next.js gère la compilation) |

```bash
npm run typecheck
```

> Ne pas contourner TypeScript avec `any` ou des casts larges sans justification.

---

## 4. ESLint

**Configuration :**

| Paramètre   | Valeur                                                                       |
| ----------- | ---------------------------------------------------------------------------- |
| Fichier     | `eslint.config.mjs`                                                          |
| Format      | ESLint flat config                                                           |
| Dépendances | `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-config-next`, `globals` |

```bash
npm run lint
```

**Pourquoi pas `next lint` :** les versions récentes de Next.js ne poussent plus `next lint` comme point d'entrée durable. Le projet utilise donc ESLint directement, avec une configuration explicite et légère.

**Règles principales :**

- `@typescript-eslint/no-explicit-any` en **erreur**
- Variables inutilisées en erreur, avec `_` autorisé pour les paramètres volontairement ignorés
- `console` limité dans l'application, autorisé dans scripts et tests
- Règles Next core web vitals via `eslint-config-next`
- `--max-warnings=0` pour éviter les avertissements ignorés

---

## 5. Prettier

**Configuration :**

| Paramètre       | Valeur             |
| --------------- | ------------------ |
| Fichier         | `.prettierrc.json` |
| Largeur         | `120`              |
| Points-virgules | Activés            |
| Guillemets      | Doubles            |
| Trailing commas | Activées           |

```bash
npm run format:check
```

> La commande utilise `.gitignore` pour éviter les dossiers générés.

---

## 6. Build

```bash
npm run build
```

**Le build vérifie :**

- Compilation Next.js
- Validité des routes
- Compatibilité des pages server/client
- Erreurs de typage détectées par Next

> Un build vert est **obligatoire** avant merge.

---

## 7. CI GitHub Actions

**Configuration :**

| Paramètre     | Valeur                                       |
| ------------- | -------------------------------------------- |
| Fichier       | `.github/workflows/ci.yml`                   |
| Déclenchement | Pull requests et push sur `main` / `develop` |
| Node.js       | 22                                           |
| Installation  | `npm ci`                                     |

**Étapes de la CI :**

1. Checkout
2. Setup Node
3. `npm ci`
4. `npm run typecheck`
5. `npm run lint`
6. `npm run format:check`
7. `npm test`
8. `npm run build`

---

## 8. Checklist avant pull request

- [ ] La tâche ne lance pas une fonctionnalité hors phase
- [ ] Les fichiers touchés ont été relus
- [ ] `npm run typecheck` — OK
- [ ] `npm run lint` — OK
- [ ] `npm run build` — OK
- [ ] `npm run test` — si l'architecture ou les conventions changent
- [ ] Documentation mise à jour si une règle change
- [ ] Captures ajoutées si l'UI change
- [ ] Limites restantes mentionnées dans la PR

---

## 9. Problèmes connus

- Le cache npm global du poste peut être bloqué par des fichiers root-owned. Contournement local : `npm install --cache ./.npm-cache`
- `npm install` signale actuellement deux vulnérabilités modérées. Ne pas lancer `npm audit fix --force` sans audit — risque de mises à jour cassantes
- L'ancien prototype vanilla reste dans le dépôt. Les quality gates ciblent principalement `src`, `scripts`, `tests` et `next.config.ts`
- La règle Next `@next/next/no-img-element` est désactivée temporairement. La migration vers `next/image` doit se faire dans une tâche dédiée
- Le lint est volontairement pragmatique. Des règles plus strictes pourront être ajoutées après stabilisation de la Phase 0
