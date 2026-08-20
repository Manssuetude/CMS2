-- Activité de secours pour "Activité du moment" sur l'accueil : choisie en
-- admin, utilisée uniquement quand aucune activité n'a lieu cette semaine
-- (sinon l'activité la plus proche d'aujourd'hui est affichée automatiquement).
alter table pages add column if not exists featured_activity_id uuid references activities(id) on delete set null;
