# Organisation de la collaboration — Manssuétude CMS

> Comment l'équipe organise, suit et priorise le travail de développement via GitHub Projects.

---

## 1. Outil de gestion de projet

Le projet utilise **GitHub Projects** (v2) comme outil unique de suivi du travail.

- **Board** : [CMS2 — Development Board](https://github.com/users/manssuetude-2026/projects/1)
- **Repo** : [manssuetude-2026/CMS2](https://github.com/manssuetude-2026/CMS2)

Tout le travail planifié, en cours ou terminé passe par ce board. Pas d'outil externe (Notion, Trello, etc.).

---

## 2. Colonnes du board

| Colonne     | Signification                                        |
| ----------- | ---------------------------------------------------- |
| 📋 Backlog  | Idées ou tâches identifiées, non encore priorisées   |
| Todo        | Tâches validées, prêtes à être prises en charge      |
| In Progress | Tâche en cours — une seule par développeur à la fois |
| In Review   | PR ouverte, en attente de review                     |
| Done        | Tâche terminée, PR mergée ou tâche close             |

**Règle :** une issue ne doit pas rester en `In Progress` sans commit associé depuis plus de 2 jours. Si bloquée, ajouter le label `blocked` et en informer l'équipe.

---

## 3. Labels

Les labels permettent de filtrer et de catégoriser les issues.

| Label              | Couleur     | Usage                                                |
| ------------------ | ----------- | ---------------------------------------------------- |
| `feature`          | Bleu        | Nouvelle fonctionnalité produit                      |
| `bug`              | Rouge       | Quelque chose ne fonctionne pas                      |
| `refactor`         | Jaune       | Amélioration du code sans changement de comportement |
| `architecture`     | Violet      | Décision ou changement structurel                    |
| `documentation`    | Bleu        | Ajout ou mise à jour de documentation                |
| `Urgent`           | Rouge foncé | Priorité maximale, à traiter immédiatement           |
| `blocked`          | Rose        | En attente d'un autre ticket ou d'une décision       |
| `good first issue` | Violet      | Bon point d'entrée pour un nouveau développeur       |
| `help wanted`      | Vert        | Besoin d'aide extérieure ou de discussion            |

---

## 4. Priorités

Le champ **Priorité** permet d'ordonner les tâches dans chaque colonne.

| Valeur      | Utilisation                                     |
| ----------- | ----------------------------------------------- |
| 🔴 Critique | Bloquant pour l'équipe ou la production         |
| 🟠 Haute    | À traiter dans le sprint en cours               |
| 🟡 Normale  | Valeur par défaut — travail courant de la phase |
| 🟢 Basse    | Nice-to-have, à faire quand le reste est stable |

---

## 5. Milestones (phases)

Les milestones regroupent les issues par phase du projet.

| Milestone                            | Description                                                          |
| ------------------------------------ | -------------------------------------------------------------------- |
| Phase 0 — Stabilisation architecture | Architecture, conventions, CI/CD, documentation. **Phase actuelle.** |
| Phase 1 — Fonctionnalités CMS        | CRUD admin, workflows éditoriaux, médias, permissions RBAC           |
| Phase 2 — Lancement                  | Recette, tests finaux, déploiement production sur Vercel             |

**Règle :** aucune issue de Phase 1 ne doit passer en `In Progress` tant que la Phase 0 n'est pas close.

---

## 6. Cycle de vie d'une issue

```
Idée → Backlog → Todo → In Progress → In Review → Done
```

**Créer une issue :**

1. Aller sur [Issues](https://github.com/manssuetude-2026/CMS2/issues/new)
2. Titre clair et actionnable (`Implémenter X`, `Corriger Y`, `Documenter Z`)
3. Description : contexte, attendu, critères d'acceptation
4. Assigner un label, un milestone et une priorité
5. Ajouter au board depuis le panneau latéral → **Projects**

**Prendre une issue :**

1. S'assigner l'issue
2. Passer la carte en `In Progress` sur le board
3. Créer une branche depuis `develop` : `feature/nom-court` ou `fix/nom-court`

**Terminer une issue :**

1. Ouvrir une PR vers `develop`
2. Mentionner l'issue dans le corps de la PR : `Closes #42`
3. Passer la carte en `In Review`
4. Après merge, GitHub ferme automatiquement l'issue — la carte passe en `Done`

---

## 7. Format d'une issue

```
## Contexte
[Pourquoi cette tâche existe]

## Attendu
[Ce que doit faire ou produire cette tâche]

## Critères d'acceptation
- [ ] Critère 1
- [ ] Critère 2

## Notes
[Contraintes, liens, références utiles]
```

---

## 8. Lier une PR à une issue

Dans le corps de la PR, utiliser l'un de ces mots-clés suivis du numéro d'issue :

```
Closes #42
Fixes #42
Resolves #42
```

GitHub fermera l'issue automatiquement lors du merge de la PR dans la branche cible (`develop` ou `main`).

---

## 9. Règles de l'équipe

- **Une issue = une tâche.** Ne pas mélanger plusieurs sujets dans une même issue.
- **Pas de commit direct sur `main` ou `develop`.** Toujours passer par une PR.
- **Pas d'issue sans label ni milestone.** Le board doit rester lisible.
- **Mettre à jour le board.** Déplacer sa carte soi-même — ne pas laisser l'équipe deviner où en est le travail.
- **Signaler les blocages** avec le label `blocked` et un commentaire dans l'issue.

---

← [WORKFLOWS.md](WORKFLOWS.md) · Suite → [QUALITY_GATES.md](QUALITY_GATES.md)
