-- Chapitres 10 (Dossiers) + 11 (Parcours de lecture) du plan V2, fusionnés en
-- une seule entité : les deux étaient décrits comme "une collection ordonnée
-- de contenus hétérogènes avec sa propre page" — plutôt que deux systèmes
-- quasi identiques, un dossier a un mode "libre" (grille) ou "guide"
-- (parcours séquentiel avec numéros d'étape).
--
-- dossier_items est polymorphe (entity_type + entity_id) plutôt que des FK
-- dédiées : un dossier mélange productions, activités, projets, ressources
-- et entrées de Journal. Pas de contrainte FK sur entity_id (impossible sur
-- une colonne polymorphe) — la validité est vérifiée côté application.
--
-- À exécuter dans l'éditeur SQL Supabase (non lancée automatiquement).

create table if not exists dossiers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  mode text not null default 'libre' check (mode in ('libre', 'guide')),
  image_id uuid references resources(id) on delete set null,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists dossier_items (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references dossiers(id) on delete cascade,
  position integer not null default 0,
  entity_type text not null check (entity_type in ('production', 'activity', 'project', 'resource', 'journal_entry')),
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  unique (dossier_id, entity_type, entity_id)
);

create index if not exists dossiers_slug_idx on dossiers(slug);
create index if not exists dossier_items_dossier_id_idx on dossier_items(dossier_id, position);

alter table public.dossiers enable row level security;
alter table public.dossier_items enable row level security;
