-- Une activité peut être reliée à un ou plusieurs sous-thèmes (en plus de la
-- relation directe activité↔thème déjà existante, theme_activities) — même
-- pattern many-to-many que sub_theme_productions.
create table if not exists sub_theme_activities (
  sub_theme_id uuid not null references sub_themes(id) on delete cascade,
  activity_id uuid not null references activities(id) on delete cascade,
  primary key (sub_theme_id, activity_id)
);

alter table public.sub_theme_activities enable row level security;
