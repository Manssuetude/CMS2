-- Revient sur la cardinalité production ↔ sous-thème : une production peut être
-- rattachée à PLUSIEURS sous-thèmes (many-to-many), pas un seul.
-- Recrée la table de liaison sub_theme_productions, migre les valeurs existantes
-- de productions.sub_theme_id, puis supprime cette colonne.
--
-- À exécuter dans l'éditeur SQL Supabase (non lancée automatiquement).

create table if not exists sub_theme_productions (
  sub_theme_id uuid references sub_themes(id) on delete cascade,
  production_id uuid references productions(id) on delete cascade,
  primary key (sub_theme_id, production_id)
);

alter table public.sub_theme_productions enable row level security;

insert into sub_theme_productions (sub_theme_id, production_id)
select sub_theme_id, id
from productions
where sub_theme_id is not null
on conflict do nothing;

drop index if exists productions_sub_theme_id_idx;
alter table productions drop column if exists sub_theme_id;
