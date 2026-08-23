-- Visibilité des grandes pages dans le header/menu public, pilotable depuis
-- /admin/pages. Une page "désactivée" reste accessible par son URL directe
-- (elle n'est pas dépubliée) — seule son entrée de navigation est masquée.
-- Réutilise site_settings (table déjà présente, jusqu'ici jamais utilisée par
-- aucun repository) plutôt qu'une nouvelle table pour une simple ligne de config.

alter table site_settings add column if not exists nav_visibility jsonb not null default '{}';

insert into site_settings (id) values ('default')
on conflict (id) do nothing;
