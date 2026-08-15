-- Introduit les "sous-thèmes" : sujets traités au sein d'un thème (ex. thème
-- "Écologie" → sous-thème "Sobriété énergétique"). Un sous-thème peut regrouper
-- 0, plusieurs, ou aucune production. Remplace la relation directe thème↔production
-- (table theme_productions), dépréciée par ce changement.
--
-- À exécuter dans l'éditeur SQL Supabase (non lancée automatiquement).

create table if not exists sub_themes (
  id uuid primary key default gen_random_uuid(),
  theme_id uuid not null references themes(id) on delete cascade,
  slug text unique not null,
  title text not null,
  description text,
  long_description text,
  status content_status not null default 'draft',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sub_theme_productions (
  sub_theme_id uuid references sub_themes(id) on delete cascade,
  production_id uuid references productions(id) on delete cascade,
  primary key (sub_theme_id, production_id)
);

create index if not exists sub_themes_slug_idx on sub_themes(slug);
create index if not exists sub_themes_theme_id_idx on sub_themes(theme_id);

alter table public.sub_themes             enable row level security;
alter table public.sub_theme_productions  enable row level security;

-- Migration des données existantes : pour chaque thème ayant déjà des productions
-- liées, on crée un sous-thème "À classer" (brouillon → invisible côté public) qui
-- reprend ces liens, le temps que l'équipe éditoriale les répartisse dans de vrais
-- sous-thèmes.
insert into sub_themes (theme_id, slug, title, description, status)
select t.id, t.slug || '-a-classer', 'À classer', 'Productions à répartir dans de nouveaux sous-thèmes.', 'draft'
from themes t
where exists (select 1 from theme_productions tp where tp.theme_id = t.id);

insert into sub_theme_productions (sub_theme_id, production_id)
select st.id, tp.production_id
from theme_productions tp
join sub_themes st on st.theme_id = tp.theme_id and st.slug = (select slug from themes where id = tp.theme_id) || '-a-classer';

drop table if exists theme_productions;
