-- Chapitre 12 du plan V2 : Bibliothèque de ressources. Enrichit le modèle
-- Ressource (table `resources`, déjà utilisée par la médiathèque) avec des
-- champs bibliographiques, sans créer de section admin séparée — décision
-- validée : l'administration reste dans /admin/media.

alter table resources add column if not exists author text;
alter table resources add column if not exists institution text;
alter table resources add column if not exists published_date date;
alter table resources add column if not exists theme_id uuid references themes(id) on delete set null;

create index if not exists resources_theme_id_idx on resources(theme_id);
