-- Chapitre 17 du plan V2 : redirections 301 administrables. Table simple
-- (chemin source unique → chemin cible), consultée par le middleware sur
-- chaque requête publique. RLS avec une politique explicite de lecture
-- anonyme (contrairement aux autres tables) : le middleware interroge cette
-- table avec le client anon, pas le client admin (service role), pour rester
-- cohérent avec le reste de son fonctionnement (rafraîchissement de session).
-- Aucune donnée sensible dans cette table — de simples correspondances d'URL.

create table if not exists redirects (
  id uuid primary key default gen_random_uuid(),
  from_path text unique not null,
  to_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists redirects_from_path_idx on redirects(from_path);

alter table public.redirects enable row level security;

drop policy if exists "redirects_public_read" on public.redirects;
create policy "redirects_public_read" on public.redirects for select to anon using (true);
