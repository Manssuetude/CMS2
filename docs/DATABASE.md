# Base de données — Manssuétude CMS

> Schéma PostgreSQL hébergé sur Supabase. Toutes les requêtes passent par les repositories — jamais depuis les composants ou les pages.

---

## Enums

| Enum                | Valeurs                                                      |
| ------------------- | ------------------------------------------------------------ |
| `user_role`         | `admin`, `editor`, `contributor`, `viewer`                   |
| `content_status`    | `draft`, `published`, `archived`                             |
| `progress_status`   | `idea`, `preparation`, `active`, `completed`, `paused`       |
| `media_source`      | `upload`, `google-drive`, `external-url`, `youtube`, `vimeo` |
| `media_type`        | `image`, `video`, `pdf`, `document`, `audio`, `archive`      |
| `visibility_status` | `public`, `private`, `draft`                                 |
| `form_type`         | `join`, `project`, `content`, `partner`, `donation`          |
| `form_status`       | `reçu`, `en cours`, `traité`, `archivé`                      |

---

## Tables principales

### `users`

Comptes de l'équipe, synchronisés automatiquement depuis Supabase Auth via trigger.

| Colonne | Type        | Notes                      |
| ------- | ----------- | -------------------------- |
| `id`    | uuid PK     | référence `auth.users(id)` |
| `email` | text unique |                            |
| `name`  | text        |                            |
| `role`  | user_role   | défaut `viewer`            |

### `pages`

Pages publiques du site (accueil, à propos, etc.). La colonne `sections` stocke les blocs CMS en JSON.

| Colonne                        | Type                | Notes                     |
| ------------------------------ | ------------------- | ------------------------- |
| `id`                           | uuid PK             |                           |
| `slug`                         | text unique         | identifiant URL           |
| `title`                        | text NOT NULL       |                           |
| `sections`                     | jsonb               | tableau de `ContentBlock` |
| `status`                       | content_status      | défaut `draft`            |
| `seo_title`, `seo_description` | text                |                           |
| `image_id`                     | uuid FK → resources |                           |

### `themes`

Axes intellectuels structurant le contenu.

| Colonne                           | Type                | Notes        |
| --------------------------------- | ------------------- | ------------ |
| `slug`                            | text unique         |              |
| `title`                           | text NOT NULL       |              |
| `description`, `long_description` | text                |              |
| `status`                          | content_status      |              |
| `featured`                        | boolean             | défaut false |
| `tags`                            | text[]              |              |
| `hero_image_id`, `thumbnail_id`   | uuid FK → resources |              |

### `productions`

Contenus éditoriaux publiés (articles, rapports, notes).

| Colonne                   | Type                | Notes                    |
| ------------------------- | ------------------- | ------------------------ |
| `slug`                    | text unique         |                          |
| `title`                   | text NOT NULL       |                          |
| `type`                    | text                | ex: `article`, `rapport` |
| `description`             | text                | résumé court             |
| `body`                    | text                | corps HTML riche         |
| `content_blocks`          | jsonb               | blocs legacy             |
| `author`, `date`          | text / date         |                          |
| `status`                  | content_status      |                          |
| `featured`                | boolean             |                          |
| `thumbnail_id`, `file_id` | uuid FK → resources |                          |

### `activities`

Activités collectives (séances, débats, ateliers).

| Colonne                | Type            | Notes               |
| ---------------------- | --------------- | ------------------- |
| `slug`                 | text unique     |                     |
| `title`                | text NOT NULL   |                     |
| `format`               | text            | type d'activité     |
| `description`, `body`  | text            |                     |
| `date`                 | date            |                     |
| `status`               | content_status  |                     |
| `progress_status`      | progress_status |                     |
| `gallery`, `documents` | uuid[]          | référence resources |

### `projects`

Initiatives structurées de l'association.

| Colonne                      | Type            | Notes |
| ---------------------------- | --------------- | ----- |
| `slug`                       | text unique     |       |
| `title`                      | text NOT NULL   |       |
| `category`, `priority`       | text            |       |
| `status`                     | content_status  |       |
| `progress_status`            | progress_status |       |
| `description`, `body`        | text            |       |
| `objectives`, `deliverables` | text[]          |       |
| `featured`                   | boolean         |       |

### `resources`

Médiathèque : images, vidéos, PDF et documents.

| Colonne                        | Type          | Notes                  |
| ------------------------------ | ------------- | ---------------------- |
| `title`, `filename`            | text NOT NULL |                        |
| `source`                       | media_source  | défaut `upload`        |
| `type`                         | media_type    |                        |
| `url`                          | text NOT NULL | URL publique           |
| `preview_url`, `thumbnail_url` | text          |                        |
| `alt`, `caption`               | text          | accessibilité          |
| `tags`                         | text[]        |                        |
| `drive_file_id`                | text          | si source Google Drive |

### `form_submissions`

Soumissions des formulaires publics.

| Colonne       | Type        | Notes                |
| ------------- | ----------- | -------------------- |
| `form_type`   | form_type   |                      |
| `data`        | jsonb       | champs du formulaire |
| `status`      | form_status | défaut `reçu`        |
| `attachments` | uuid[]      | référence resources  |
| `notes`       | text        | notes internes       |

### `site_settings`

Paramètres globaux du site (singleton, id = `'default'`).

| Colonne                 | Type                | Notes                         |
| ----------------------- | ------------------- | ----------------------------- |
| `primary_color`         | text                | défaut `#ff4d12`              |
| `tagline`               | text                |                               |
| `footer_config`         | jsonb               | colonnes, réseaux, newsletter |
| `homepage_config`       | jsonb               |                               |
| `logo_id`, `favicon_id` | uuid FK → resources |                               |

---

## Tables de jonction

| Table                   | Relation              |
| ----------------------- | --------------------- |
| `theme_productions`     | theme ↔ production    |
| `theme_projects`        | theme ↔ project       |
| `theme_activities`      | theme ↔ activity      |
| `production_projects`   | production ↔ project  |
| `production_activities` | production ↔ activity |
| `activity_resources`    | activity ↔ resource   |
| `project_resources`     | project ↔ resource    |

Toutes en cascade sur suppression.

---

## Index

| Index                         | Table            | Colonne |
| ----------------------------- | ---------------- | ------- |
| `pages_slug_idx`              | pages            | slug    |
| `themes_slug_idx`             | themes           | slug    |
| `productions_slug_idx`        | productions      | slug    |
| `activities_slug_idx`         | activities       | slug    |
| `projects_slug_idx`           | projects         | slug    |
| `resources_type_idx`          | resources        | type    |
| `form_submissions_status_idx` | form_submissions | status  |

---

## Trigger auth

À chaque inscription dans `auth.users`, la fonction `handle_new_auth_user()` crée automatiquement la ligne correspondante dans `public.users`. Le rôle est lu depuis `raw_user_meta_data.role` (défaut `admin`).

---

## Fichiers SQL

| Fichier                     | Contenu                                               |
| --------------------------- | ----------------------------------------------------- |
| `supabase/schema.sql`       | Tables principales, enums, trigger, indexes           |
| `supabase/storage.sql`      | Buckets Supabase Storage                              |
| `supabase/cms-advanced.sql` | Tables avancées (seasons, members, entity_relations…) |
| `supabase/migrations/`      | Migrations incrémentales                              |

---

← [CODE_CONVENTIONS.md](CODE_CONVENTIONS.md) · Suite → [WORKFLOWS.md](WORKFLOWS.md)
