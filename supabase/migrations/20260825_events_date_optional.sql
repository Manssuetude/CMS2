-- Retire l'obligation d'avoir une date pour publier un événement (demande :
-- la saisie de la date ne doit pas être obligatoire, ex. événement "à venir,
-- date à confirmer").

alter table public.events drop constraint if exists events_published_requires_date;
