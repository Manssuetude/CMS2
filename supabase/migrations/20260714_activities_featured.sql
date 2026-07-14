-- Ajoute la mise en avant ("vedette") aux activités, comme pour les productions/thèmes.
-- Permet de choisir les activités affichées sur la page d'accueil (max 3).
alter table public.activities
  add column if not exists featured boolean not null default false;
