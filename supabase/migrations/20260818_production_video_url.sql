-- Chapitre 2 du plan V2 : vidéo dédiée pour les productions de type "Video"
-- (au lieu de coller un embed brut dans le corps CKEditor).
--
-- À exécuter dans l'éditeur SQL Supabase (non lancée automatiquement).

alter table productions add column if not exists video_url text;
