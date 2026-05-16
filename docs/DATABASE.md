# Database

## Setup Files

Run these files in Supabase SQL Editor:

1. `supabase/schema.sql`
2. `supabase/storage.sql`
3. `supabase/cms-advanced.sql`

## Core Tables

- `users`
- `pages`
- `themes`
- `productions`
- `activities`
- `projects`
- `resources`
- `form_submissions`
- `site_settings`

## Advanced Tables

- `seasons`
- `members`
- `entity_relations`
- `taxonomy`
- `ctas`
- `cms_collections`
- `content_versions`
- `internal_comments`
- `role_permissions`
- `cms_health_checks`

## Repository Rule

Supabase queries must stay in repositories or low-level integration files. Components and public pages should not contain table-level logic.
