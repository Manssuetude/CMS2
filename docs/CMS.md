# CMS Model — Manssuétude

> Modèle de données, workflows éditoriaux et comportements CMS.

---

## Modèle orienté entités

**Entités principales :**

| Entité | Description |
|---|---|
| Theme | Grand axe intellectuel ou dossier de réflexion |
| Production | Contenu éditorial publié |
| Activity | Format collectif (séance, débat, atelier, etc.) |
| Project | Initiative structurée |
| Resource | Fichier ou contenu réutilisable |
| Media | Média associé aux entités |
| Season | Période ou saison éditoriale |
| Member | Membre de l'association |
| Page | Page publique du site |
| CTA | Appel à l'action |
| Collection | Regroupement thématique |

Chaque entité peut porter : **status, visibility, tags, relations, media, SEO et versioning metadata**.

---

## Workflows éditoriaux

**Statuts éditoriaux :**

| Statut | Signification |
|---|---|
| `draft` | Brouillon en cours |
| `review` | En attente de relecture |
| `validated` | Validé, prêt à publier |
| `published` | Publié et visible |
| `archived` | Archivé |

**Statuts de progression :**

| Statut | Signification |
|---|---|
| `idea` | Idée initiale |
| `preparation` | En préparation |
| `active` | En cours |
| `completed` | Terminé |
| `paused` | En pause |

---

## Relations

Les relations sont stockées dans `entity_relations` pour le modèle de graphe long terme. Les tables de relations legacy peuvent rester pendant la migration, mais toute nouvelle logique de domaine doit préférer les relations génériques de graphe.

---

## Formulaires

> Les formulaires ne doivent **jamais** se rendre automatiquement dans les pages publiques.

Les CTA dont la cible commence par `FORM:` ouvrent la modale de formulaire correspondante.
