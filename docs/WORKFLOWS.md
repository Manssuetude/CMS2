# Workflows Git — Manssuétude CMS

> Conventions de branches, pull requests et commits.

---

## Branches

| Branche | Usage |
|---|---|
| `main` | Version stable, production-ready |
| `develop` | Branche d'intégration |
| `feature/*` | Nouvelles fonctionnalités |
| `fix/*` | Corrections de bugs |

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

| Préfixe | Usage |
|---|---|
| `feat:` | Nouvelle fonctionnalité |
| `fix:` | Correction de bug |
| `refactor:` | Refactoring sans changement de comportement |
| `docs:` | Documentation uniquement |
| `test:` | Ajout ou modification de tests |
| `chore:` | Maintenance, configuration, dépendances |

---

## Checks requis

Avant toute PR :

```bash
npm run typecheck
npm run build
```
