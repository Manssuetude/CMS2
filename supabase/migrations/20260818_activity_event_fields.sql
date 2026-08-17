-- Chapitre 3 du plan V2 : champs événementiels pour les activités
-- (horaires, lieu, capacité, lien EventBrite, statut d'inscription).
--
-- À exécuter dans l'éditeur SQL Supabase (non lancée automatiquement).

alter table activities add column if not exists start_time text;
alter table activities add column if not exists end_time text;
alter table activities add column if not exists location text;
alter table activities add column if not exists capacity text;
alter table activities add column if not exists eventbrite_url text;
alter table activities add column if not exists registration_status text;
