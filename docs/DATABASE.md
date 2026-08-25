# Base de données — Manssuétude CMS

> Schéma PostgreSQL hébergé sur Supabase. Toutes les requêtes passent par les repositories — jamais depuis les composants ou les pages.
>
> Ce document reflète l'état réel de `supabase/schema.sql` (dump complet, régénéré depuis la base de production). Toute évolution du schéma doit se faire par une nouvelle migration dans `supabase/migrations/`, puis être répercutée ici.

---

## Fichiers SQL

| Fichier                | Contenu                                                                       |
| ---------------------- | ----------------------------------------------------------------------------- |
| `supabase/schema.sql`  | Schéma complet (tables, enums, trigger, index, RLS) — source de vérité unique |
| `supabase/storage.sql` | Bucket Supabase Storage (`manssuetude-media`)                                 |
| `supabase/migrations/` | Migrations futures uniquement — vide après consolidation dans `schema.sql`    |

`schema.sql` s'exécute tel quel dans l'éditeur SQL Supabase pour reconstruire le schéma depuis zéro sur un nouveau projet (puis `npm run seed` pour les données de départ).

---

## Enums

| Enum                | Valeurs                                                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `user_role`         | `admin`, `editor`, `contributor`, `viewer`                                                                              |
| `content_status`    | `draft`, `published`, `archived`                                                                                        |
| `progress_status`   | `idea`, `preparation`, `active`, `completed`, `paused`                                                                  |
| `media_source`      | `upload`, `google-drive`, `external-url`, `youtube`, `vimeo`                                                            |
| `media_type`        | `image`, `video`, `pdf`, `document`, `audio`, `archive`                                                                 |
| `visibility_status` | `public`, `private`, `draft`                                                                                            |
| `form_type`         | `join`, `project`, `content`, `partner`, `donation`, `theme`, `sub_theme`, `event`, `activity`, `production`, `contact` |
| `form_status`       | `reçu`, `en cours`, `traité`, `archivé`                                                                                 |

---

## Tables principales

### `users`

Comptes de l'équipe, synchronisés automatiquement depuis Supabase Auth via trigger (`handle_new_auth_user`, voir plus bas).

| Colonne    | Type        | Notes                                            |
| ---------- | ----------- | ------------------------------------------------ |
| `id`       | uuid PK     | référence `auth.users(id)`                       |
| `email`    | text unique |                                                  |
| `name`     | text        |                                                  |
| `role`     | user_role   | défaut `viewer` — legacy, voir `role_key` (RBAC) |
| `role_key` | text FK     | → `roles.key` — source de vérité du rôle réel    |

### `pages`

Pages publiques du site (accueil, à propos, thèmes/évènements/etc. — une ligne par page à contenu piloté CMS). La colonne `sections` stocke les blocs de contenu en JSON.

| Colonne                          | Type                | Notes                                                             |
| -------------------------------- | ------------------- | ----------------------------------------------------------------- |
| `slug`                           | text unique         | identifiant URL                                                   |
| `title`, `eyebrow`, `body`       | text                |                                                                   |
| `sections`                       | jsonb               | tableau de blocs de contenu                                       |
| `status`                         | content_status      | défaut `draft`                                                    |
| `quote`                          | text                |                                                                   |
| `primary_cta_label/target`       | text                | CTA principal                                                     |
| `secondary_cta_label/target`     | text                | CTA secondaire                                                    |
| `seo_title`, `seo_description`   | text                |                                                                   |
| `image_id`, `seo_image_id`       | uuid FK → resources |                                                                   |
| `image_crop`, `focus_image_crop` | jsonb               | recadrage CSS non destructif de l'image hero / photo « à la une » |
| `perca_steps`                    | jsonb               | étapes de la page PERCA                                           |
| `impact_stats`                   | jsonb               | chiffres clés de la page d'accueil                                |
| `featured_dossier_ids`           | uuid[]              | dossiers mis en avant                                             |
| `featured_event_id`              | uuid FK → events    | évènement mis en avant sur l'accueil                              |

### `themes`

Axes intellectuels structurant le contenu.

| Colonne                           | Type                | Notes        |
| --------------------------------- | ------------------- | ------------ |
| `slug`                            | text unique         |              |
| `title`, `short_title`            | text                |              |
| `description`, `long_description` | text                |              |
| `status`                          | content_status      |              |
| `progress_status`                 | progress_status     |              |
| `featured`                        | boolean             | défaut false |
| `tags`                            | text[]              |              |
| `hero_image_id`, `thumbnail_id`   | uuid FK → resources |              |
| `seo_title`, `seo_description`    | text                |              |

### `sub_themes`

Sujets traités au sein d'un thème (ex. thème « Écologie » → sous-thème « Sobriété énergétique »). Page publique `/themes/[slug]/[subThemeSlug]`.

| Colonne                           | Type             | Notes                   |
| --------------------------------- | ---------------- | ----------------------- |
| `theme_id`                        | uuid FK → themes | cascade sur suppression |
| `slug`                            | text unique      |                         |
| `title`                           | text NOT NULL    |                         |
| `description`, `long_description` | text             |                         |
| `status`                          | content_status   | défaut `draft`          |
| `tags`                            | text[]           |                         |
| `date`                            | date             |                         |

### `productions`

Contenus éditoriaux publiés (articles, rapports, notes).

| Colonne                        | Type                | Notes                     |
| ------------------------------ | ------------------- | ------------------------- |
| `slug`                         | text unique         |                           |
| `title`, `type`                | text NOT NULL       | ex : `article`, `rapport` |
| `description`, `body`          | text                | corps HTML riche          |
| `content_blocks`               | jsonb               | blocs legacy              |
| `author`, `date`               | text / date         |                           |
| `status`                       | content_status      |                           |
| `featured`                     | boolean             |                           |
| `thumbnail_id`, `file_id`      | uuid FK → resources |                           |
| `reading_time`, `pages`        | text                |                           |
| `tags`                         | text[]              |                           |
| `download_label`, `video_url`  | text                |                           |
| `seo_title`, `seo_description` | text                |                           |

### `events`

Évènements datés (séances, débats, ateliers) — anciennement `activities` (renommé, migration `20260821`). À ne pas confondre avec `activity_formats` (catalogue de formats d'animation, concept distinct et toujours nommé « activité » côté produit, page `/activites`).

| Colonne                                          | Type            | Notes               |
| ------------------------------------------------ | --------------- | ------------------- |
| `slug`                                           | text unique     |                     |
| `title`, `format`                                | text NOT NULL   |                     |
| `description`, `body`                            | text            |                     |
| `date`                                           | date            | optionnelle         |
| `status`                                         | content_status  |                     |
| `progress_status`                                | progress_status |                     |
| `gallery`, `documents`                           | uuid[]          | référence resources |
| `featured`                                       | boolean         |                     |
| `speakers`                                       | jsonb           |                     |
| `start_time`, `end_time`, `location`, `capacity` | text            |                     |
| `eventbrite_url`, `registration_status`          | text            |                     |
| `seo_title`, `seo_description`                   | text            |                     |

### `activity_formats`

Catalogue des formats d'animation (Fishbowl, Hot Takes, atelier, débat…), page publique `/activites`. Concept indépendant des `events` — un événement peut référencer 0, 1 ou plusieurs formats (`event_activity_formats`).

| Colonne                | Type           | Notes |
| ---------------------- | -------------- | ----- |
| `slug`                 | text unique    |       |
| `title`, `description` | text           |       |
| `icon`                 | text           |       |
| `position`             | integer        |       |
| `status`               | content_status |       |

### `projects`

Initiatives structurées de l'association.

| Colonne                         | Type            | Notes |
| ------------------------------- | --------------- | ----- |
| `slug`                          | text unique     |       |
| `title`, `category`, `priority` | text            |       |
| `status`                        | content_status  |       |
| `progress_status`               | progress_status |       |
| `description`, `body`           | text            |       |
| `objectives`, `deliverables`    | text[]          |       |
| `documents`                     | uuid[]          |       |
| `featured`                      | boolean         |       |
| `seo_title`, `seo_description`  | text            |       |

### `dossiers`

Sélections éditoriales transverses (regroupent productions, évènements, projets, ressources, entrées de Journal), page publique `/dossiers/[slug]`.

| Colonne                | Type                | Notes              |
| ---------------------- | ------------------- | ------------------ |
| `slug`                 | text unique         |                    |
| `title`, `description` | text                |                    |
| `mode`                 | text                | `libre` ou `guide` |
| `image_id`             | uuid FK → resources |                    |
| `status`               | content_status      |                    |

**`dossier_items`** — contenu du dossier, ordonné (`position`).

| Colonne       | Type               | Notes                                                                              |
| ------------- | ------------------ | ---------------------------------------------------------------------------------- |
| `dossier_id`  | uuid FK → dossiers | cascade                                                                            |
| `entity_type` | text               | `production`, `event`, `project`, `resource` ou `journal_entry` (contrainte CHECK) |
| `entity_id`   | uuid               | id de l'entité référencée (résolue applicativement, pas de FK — types multiples)   |
| `position`    | integer            |                                                                                    |

### `journal_entries`

Journal éditorial public (actualités courtes, distinct du journal d'audit RBAC `audit_logs`).

| Colonne                                               | Type                | Notes                    |
| ----------------------------------------------------- | ------------------- | ------------------------ |
| `slug`                                                | text unique         |                          |
| `title`, `excerpt`, `body`                            | text                |                          |
| `thumbnail_id`                                        | uuid FK → resources |                          |
| `category`                                            | text                |                          |
| `author_id`                                           | uuid FK → authors   |                          |
| `date`                                                | date                |                          |
| `theme_id`, `project_id`, `event_id`, `production_id` | uuid FK             | rattachements optionnels |
| `status`                                              | content_status      |                          |
| `featured`                                            | boolean             |                          |

### `authors`

Auteurs/animateurs référencés par productions et évènements.

| Colonne    | Type                | Notes |
| ---------- | ------------------- | ----- |
| `name`     | text NOT NULL       |       |
| `bio`      | text                |       |
| `photo_id` | uuid FK → resources |       |

### `resources`

Médiathèque : images, vidéos, PDF et documents.

| Colonne                                   | Type              | Notes                  |
| ----------------------------------------- | ----------------- | ---------------------- |
| `title`, `filename`                       | text NOT NULL     |                        |
| `source`                                  | media_source      | défaut `upload`        |
| `type`                                    | media_type        |                        |
| `mime_type`, `url`                        | text NOT NULL     | `url` : URL publique   |
| `preview_url`, `thumbnail_url`            | text              |                        |
| `size`, `alt`, `caption`, `description`   | text              |                        |
| `tags`                                    | text[]            |                        |
| `visibility`                              | visibility_status | défaut `public`        |
| `uploaded_by`                             | uuid FK → users   |                        |
| `drive_file_id`                           | text              | si source Google Drive |
| `author`, `institution`, `published_date` | text/date         |                        |
| `theme_id`                                | uuid FK → themes  |                        |

### `form_submissions`

Soumissions des formulaires publics (`/admin/forms`).

| Colonne       | Type        | Notes                                                               |
| ------------- | ----------- | ------------------------------------------------------------------- |
| `form_type`   | form_type   |                                                                     |
| `data`        | jsonb       | champs du formulaire                                                |
| `status`      | form_status | défaut `reçu`                                                       |
| `attachments` | uuid[]      | non alimentée (retiré du flux — pièce jointe désormais dans `data`) |
| `notes`       | text        | notes internes                                                      |

### `site_settings`

Paramètres globaux du site (singleton, `id = 'default'`).

| Colonne                                      | Type                | Notes                                    |
| -------------------------------------------- | ------------------- | ---------------------------------------- |
| `primary_color`, `secondary_color`           | text                | défaut `#ff4d12` / `#0d0d0f`             |
| `tagline`                                    | text                |                                          |
| `footer_config`                              | jsonb               | colonnes, réseaux, newsletter            |
| `homepage_config`                            | jsonb               |                                          |
| `nav_visibility`                             | jsonb               | items de nav togglables masqués/affichés |
| `logo_id`, `favicon_id`, `fallback_image_id` | uuid FK → resources |                                          |

### RBAC — `roles` / `audit_logs`

**`roles`** — rôles personnalisables.

| Colonne       | Type        | Notes                                                      |
| ------------- | ----------- | ---------------------------------------------------------- |
| `key`         | text unique | slug technique (`admin`, `production`, `communication`, …) |
| `label`       | text        | libellé affiché                                            |
| `is_admin`    | boolean     | rôle tout-puissant, non modifiable                         |
| `permissions` | jsonb       | liste de clés `section:action`                             |

**`audit_logs`** — journal d'audit RBAC (admin only, `/admin/historique`). Ne pas confondre avec `journal_entries` (Journal éditorial public).

| Colonne                               | Type                                                               |
| ------------------------------------- | ------------------------------------------------------------------ |
| `actor_id`                            | uuid → auth.users                                                  |
| `actor_email`, `actor_role`           | text                                                               |
| `action`                              | text (`create`/`update`/`delete`/`publish`/`invite`/`role change`) |
| `entity_type`, `entity_id`, `summary` | text                                                               |
| `created_at`                          | timestamptz (index desc)                                           |

### `redirects` — obsolète, en attente de suppression

Reliquat de la fonctionnalité « redirections 301 administrables » (retirée du produit, table vide). La suppression (`drop table`) n'a pas encore été exécutée manuellement en prod — voir le commentaire en tête de `supabase/schema.sql`.

---

## Tables de jonction

| Table                    | Relation                                      |
| ------------------------ | --------------------------------------------- |
| `sub_theme_productions`  | sub_theme ↔ production                        |
| `sub_theme_events`       | sub_theme ↔ event                             |
| `theme_projects`         | theme ↔ project                               |
| `theme_events`           | theme ↔ event                                 |
| `production_projects`    | production ↔ project                          |
| `production_events`      | production ↔ event                            |
| `production_authors`     | production ↔ author                           |
| `production_resources`   | production ↔ resource                         |
| `project_events`         | project ↔ event                               |
| `project_resources`      | project ↔ resource                            |
| `event_resources`        | event ↔ resource                              |
| `event_animators`        | event ↔ author (+ `contribution`, `position`) |
| `event_activity_formats` | event ↔ activity_format                       |

Toutes en cascade sur suppression. L'ancienne relation directe `theme_productions` (thème ↔ production) a été retirée — les productions se relient désormais aux sous-thèmes uniquement.

> Note : certains noms de contraintes/index gardent l'ancien préfixe `activity`/`activities` hérité du renommage `activities → events` (PostgreSQL ne renomme pas les contraintes lors d'un `RENAME TABLE`). Cosmétique, sans impact fonctionnel.

---

## Index

| Index                                  | Table                | Colonne(s)           |
| -------------------------------------- | -------------------- | -------------------- |
| `pages_slug_idx`                       | pages                | slug                 |
| `themes_slug_idx`                      | themes               | slug                 |
| `sub_themes_slug_idx`                  | sub_themes           | slug                 |
| `sub_themes_theme_id_idx`              | sub_themes           | theme_id             |
| `productions_slug_idx`                 | productions          | slug                 |
| `events_slug_idx`                      | events               | slug                 |
| `projects_slug_idx`                    | projects             | slug                 |
| `dossiers_slug_idx`                    | dossiers             | slug                 |
| `dossier_items_dossier_id_idx`         | dossier_items        | dossier_id, position |
| `journal_entries_slug_idx`             | journal_entries      | slug                 |
| `journal_entries_category_idx`         | journal_entries      | category             |
| `journal_entries_project_id_idx`       | journal_entries      | project_id           |
| `resources_type_idx`                   | resources            | type                 |
| `resources_theme_id_idx`               | resources            | theme_id             |
| `form_submissions_status_idx`          | form_submissions     | status               |
| `audit_logs_created_idx`               | audit_logs           | created_at desc      |
| `activity_formats_position_idx`        | activity_formats     | position             |
| `event_animators_event_id_idx`         | event_animators      | event_id, position   |
| `production_authors_author_id_idx`     | production_authors   | author_id            |
| `production_resources_resource_id_idx` | production_resources | resource_id          |
| `project_events_event_id_idx`          | project_events       | event_id             |
| `redirects_from_path_idx`              | redirects (obsolète) | from_path            |

---

## Trigger auth

À chaque inscription dans `auth.users`, la fonction `handle_new_auth_user()` crée automatiquement la ligne correspondante dans `public.users`. Le rôle est lu depuis `raw_user_meta_data.role` (défaut `admin`).

---

## Recadrage d'image non destructif

`pages.image_crop`, `pages.focus_image_crop` (jsonb) : `{ x, y, width, height, zoom }` en % (croppedArea de `react-easy-crop`). Appliqué en CSS à l'affichage (point focal + zoom), le fichier image n'est jamais modifié. `NULL` = cadrage par défaut (`object-fit: cover` centré). Voir `src/utils/imageCrop.ts` et `<ImageCropField>`.

---

← [CODE_CONVENTIONS.md](CODE_CONVENTIONS.md) · Suite → [WORKFLOWS.md](WORKFLOWS.md)
