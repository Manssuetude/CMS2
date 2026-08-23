-- Chapitre 5 du plan V2 : Journal éditorial de Manssuétude (entrées courtes
-- publiques — actualités, coulisses, réflexions). Entité distincte du journal
-- d'audit RBAC (renommé /admin/historique juste avant cette migration).
--
-- Associations à thème/projet/activité/production : simple FK optionnelle
-- (une entrée de Journal se rattache à au plus un de chaque), pas de table
-- de liaison many-to-many — un article de blog courtois n'a normalement
-- qu'un seul contexte, contrairement aux productions.
--
-- À exécuter dans l'éditeur SQL Supabase (non lancée automatiquement).

create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  body text,
  thumbnail_id uuid references resources(id) on delete set null,
  category text,
  author_id uuid references authors(id) on delete set null,
  date date,
  theme_id uuid references themes(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  activity_id uuid references activities(id) on delete set null,
  production_id uuid references productions(id) on delete set null,
  status content_status not null default 'draft',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists journal_entries_slug_idx on journal_entries(slug);
create index if not exists journal_entries_project_id_idx on journal_entries(project_id);
create index if not exists journal_entries_category_idx on journal_entries(category);

alter table public.journal_entries enable row level security;
