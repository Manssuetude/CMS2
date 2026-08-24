# CMS Model — Manssuétude

> Modèle de données, workflows éditoriaux et comportements CMS.

---

## Modèle orienté entités

**Entités principales :**

| Entité     | Description                                     |
| ---------- | ----------------------------------------------- |
| Theme      | Grand axe intellectuel ou dossier de réflexion  |
| Production | Contenu éditorial publié                        |
| Activity   | Format collectif (séance, débat, atelier, etc.) |
| Project    | Initiative structurée                           |
| Resource   | Fichier ou contenu réutilisable                 |
| Media      | Média associé aux entités                       |
| Season     | Période ou saison éditoriale                    |
| Member     | Membre de l'association                         |
| Page       | Page publique du site                           |
| CTA        | Appel à l'action                                |
| Collection | Regroupement thématique                         |

Chaque entité peut porter : **status, visibility, tags, relations, media, SEO et versioning metadata**.

---

## Workflows éditoriaux

**Statuts éditoriaux :**

| Statut      | Signification           |
| ----------- | ----------------------- |
| `draft`     | Brouillon en cours      |
| `review`    | En attente de relecture |
| `validated` | Validé, prêt à publier  |
| `published` | Publié et visible       |
| `archived`  | Archivé                 |

**Statuts de progression :**

| Statut        | Signification  |
| ------------- | -------------- |
| `idea`        | Idée initiale  |
| `preparation` | En préparation |
| `active`      | En cours       |
| `completed`   | Terminé        |
| `paused`      | En pause       |

---

## Relations

Les relations sont stockées dans `entity_relations` pour le modèle de graphe long terme. Les tables de relations legacy peuvent rester pendant la migration, mais toute nouvelle logique de domaine doit préférer les relations génériques de graphe.

---

## Formulaires

> Les formulaires ne doivent **jamais** se rendre automatiquement dans les pages publiques.

Les CTA dont la cible commence par `FORM:` ouvrent la modale de formulaire correspondante.

**Flux complet :**

1. `CtaButton` résout la cible via `ctaLinks` (`memberApplication → "FORM:join"`, etc.)
2. Si la cible est `FORM:*`, un `<button>` ouvre `FormModal`
3. `FormModal` rend les champs définis dans `src/constants/forms.ts` selon le type
4. Soumission → POST `/api/forms` → `formRepository.create(formType, data, attachments)`
5. Stocké en DB dans `form_submissions`
6. Visible dans `/admin/forms` avec statut modifiable : `reçu` → `en cours` → `traité` → `archivé`

**Types de formulaires disponibles :** `join` (adhésion), `project`, `content` (contribution), `partner`, `don`, `theme`, `sub_theme`, `event`, `activity`, `production`, `contact` — voir `src/constants/forms.ts`.

## Pages statiques

Les pages de contenu (accueil, a-propos, nous-rejoindre, etc.) sont stockées dans la table `pages` avec :

- `image_id` (FK → `resources`) : photo hero personnalisée, modifiable via `/admin/pages`
- `sections` (jsonb[]) : blocs de contenu, éditables via `/admin/homepage`
- `seo_title`, `seo_description` : métadonnées SEO

L'admin dispose de deux interfaces :

- `/admin/homepage` — édition complète de la page d'accueil (texte, CTAs, photo, SEO)
- `/admin/pages` — gestion des photos hero pour toutes les pages statiques

---

[← Ordre de lecture](../README.md#ordre-de-lecture-recommandé)
