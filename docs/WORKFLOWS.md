# Workflows Git — Manssuétude CMS

> Conventions de branches, pull requests et commits.

---

## Branches

| Branche     | Usage                            |
| ----------- | -------------------------------- |
| `main`      | Version stable, production-ready |
| `develop`   | Branche d'intégration            |
| `feature/*` | Nouvelles fonctionnalités        |
| `fix/*`     | Corrections de bugs              |

---

## Pull Requests

**Chaque PR doit inclure :**

- Objectif de la PR
- Pages ou modules affectés
- Étapes de validation exécutées
- Captures d'écran pour les changements UI
- Notes de migration si le schéma DB change

---

## Convention de commits

**Préfixes à utiliser :**

| Préfixe     | Usage                                       |
| ----------- | ------------------------------------------- |
| `feat:`     | Nouvelle fonctionnalité                     |
| `fix:`      | Correction de bug                           |
| `refactor:` | Refactoring sans changement de comportement |
| `docs:`     | Documentation uniquement                    |
| `test:`     | Ajout ou modification de tests              |
| `chore:`    | Maintenance, configuration, dépendances     |

---

## Checks requis

Avant toute PR :

```bash
npm run typecheck
npm run build
```

---

## Formatage automatique

Le formatage du code et des fichiers Markdown est **automatique** : il se déclenche à chaque `git push`, sans aucune action manuelle.

Tu n'as pas besoin de lancer `npm run format:check` avant de pousser — c'est fait pour toi.

Les fichiers reformatés sont les suivants :

- `src/**/*.{ts,tsx,mjs,md,css}` — tout le code source
- `docs/**/*.md` — toute la documentation
- `*.{md,json}` — fichiers racine (`README.md`, `package.json`, etc.)

---

## Hooks Git (Husky)

Ce comportement est géré par **Husky**, un outil qui permet de versionner les hooks Git dans le repo (dossier `.husky/`). Contrairement aux hooks natifs dans `.git/hooks/` qui sont locaux à ta machine et non partagés, les hooks Husky sont commités et s'installent automatiquement pour tous les développeurs via `npm install`.

**Hooks configurés :**

| Hook         | Déclencheur  | Action                                                  |
| ------------ | ------------ | ------------------------------------------------------- |
| `pre-commit` | `git commit` | Lance `npm test` — bloque le commit si les tests échouent |
| `pre-push`   | `git push`   | Reformate tous les fichiers avec Prettier et re-stage   |
