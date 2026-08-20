-- Animateur(s) d'une activité : lien vers le répertoire des auteurs (authors,
-- déjà utilisé par production_authors) avec une contribution libre et
-- optionnelle par lien ("ce que la personne a fait pendant l'activité").
-- Nécessite une colonne en plus de production_authors, donc table dédiée.

create table if not exists activity_animators (
  activity_id uuid not null references activities(id) on delete cascade,
  author_id uuid not null references authors(id) on delete cascade,
  contribution text,
  position int not null default 0,
  primary key (activity_id, author_id)
);

create index if not exists activity_animators_activity_id_idx on activity_animators (activity_id, position);

alter table public.activity_animators enable row level security;
