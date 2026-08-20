-- Répertoire des formats/techniques d'animation d'activité (Fishbowl, Hot
-- Takes, Débat 2v2...) — jusqu'ici entassés en un seul bloc de texte riche
-- dans une fiche Activité factice ("Formats d'activités"). Entité dédiée,
-- administrable, présentée en grille de cartes sur /activites/formats-d-activites
-- (inspirée de la présentation équivalente sur l'espace membre).

create table if not exists activity_formats (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  icon text,
  position integer not null default 0,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists activity_formats_position_idx on activity_formats(position);

alter table public.activity_formats enable row level security;
