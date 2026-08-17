-- Chapitre 4 du plan V2 : architecture éditoriale relationnelle.
--
-- Réactive les tables de liaison mortes déjà présentes dans schema.sql
-- (theme_activities, theme_projects, production_projects — jamais utilisées
-- par le code applicatif jusqu'ici) et ajoute ce qui manquait :
-- - `authors` : fiche auteur réutilisable, reliable à plusieurs productions
--   (remplace le champ texte libre `productions.author`, conservé en repli).
-- - `project_activities` : relation projet ↔ activité (n'existait pas).
-- - `production_resources` : relation production ↔ ressources/références.
-- - `activities.speakers` : intervenants structurés (nom + rôle), au lieu
--   d'un champ texte libre.
--
-- À exécuter dans l'éditeur SQL Supabase (non lancée automatiquement).

create table if not exists authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text,
  photo_id uuid references resources(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists production_authors (
  production_id uuid references productions(id) on delete cascade,
  author_id uuid references authors(id) on delete cascade,
  primary key (production_id, author_id)
);

create table if not exists project_activities (
  project_id uuid references projects(id) on delete cascade,
  activity_id uuid references activities(id) on delete cascade,
  primary key (project_id, activity_id)
);

create table if not exists production_resources (
  production_id uuid references productions(id) on delete cascade,
  resource_id uuid references resources(id) on delete cascade,
  primary key (production_id, resource_id)
);

alter table activities add column if not exists speakers jsonb not null default '[]';

create index if not exists production_authors_author_id_idx on production_authors(author_id);
create index if not exists project_activities_activity_id_idx on project_activities(activity_id);
create index if not exists production_resources_resource_id_idx on production_resources(resource_id);

alter table public.authors               enable row level security;
alter table public.production_authors    enable row level security;
alter table public.project_activities    enable row level security;
alter table public.production_resources  enable row level security;
