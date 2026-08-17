-- Libellé personnalisable du bouton de téléchargement du PDF joint à une
-- production (ex. « Télécharger le rapport complet »). La colonne file_id
-- existe déjà (schema.sql) mais n'était pas exploitée.
--
-- À exécuter dans l'éditeur SQL Supabase (non lancée automatiquement).

alter table productions add column if not exists download_label text;
