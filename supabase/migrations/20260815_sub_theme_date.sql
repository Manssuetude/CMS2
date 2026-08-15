-- Ajoute une date "sujet traité le" sur les sous-thèmes, affichée côté public et
-- éditable via un sélecteur de type calendrier dans l'admin.
--
-- À exécuter dans l'éditeur SQL Supabase (non lancée automatiquement).

alter table sub_themes add column if not exists date date;
