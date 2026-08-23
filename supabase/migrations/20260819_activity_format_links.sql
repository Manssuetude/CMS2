-- Une activité peut utiliser un ou plusieurs formats/techniques d'animation
-- du répertoire (activity_formats) — table de liaison many-to-many, même
-- pattern que production_authors.

create table if not exists activity_activity_formats (
  activity_id uuid not null references activities(id) on delete cascade,
  activity_format_id uuid not null references activity_formats(id) on delete cascade,
  primary key (activity_id, activity_format_id)
);

alter table public.activity_activity_formats enable row level security;
